/**
 * Manager gier - zarządza pokojami gry i synchronizacją
 */
import { EventEmitter } from 'events';
import { generateGameId, Faction } from '@rts-engine/shared';
import { logger } from '../utils/Logger';
import { GameInstance } from './GameInstance';
import { createAIPlayer, AIDifficulty } from './AIPlayer';
/**
 * Manager zarządzający wszystkimi grami na serwerze
 */
export class GameManager extends EventEmitter {
    constructor(config) {
        super();
        this.games = new Map();
        this.gameRooms = new Map();
        this.gameLoopInterval = null;
        this.config = config;
        this.startGameLoop();
        logger.info('GameManager initialized', {
            maxRooms: config.maxRooms,
            maxPlayersPerRoom: config.maxPlayersPerRoom,
            tickRate: config.gameTickRate
        });
    }
    /**
     * Tworzy nowy pokój gry
     */
    createRoom(createdBy, roomName, gameSettings, password) {
        if (this.gameRooms.size >= this.config.maxRooms) {
            logger.warn('Cannot create room - max rooms reached', { currentRooms: this.gameRooms.size });
            return null;
        }
        const roomId = generateGameId();
        const room = {
            id: roomId,
            name: roomName,
            createdBy,
            players: [],
            maxPlayers: Math.min(gameSettings.maxPlayers, this.config.maxPlayersPerRoom),
            hasPassword: !!password,
            gameSettings,
            status: 'waiting'
        };
        this.gameRooms.set(roomId, room);
        logger.info('Room created', {
            roomId,
            roomName,
            createdBy,
            hasPassword: !!password
        });
        this.emit('roomCreated', room);
        return room;
    }
    /**
     * Dodaje gracza do pokoju
     */
    addPlayerToRoom(roomId, player, password) {
        const room = this.gameRooms.get(roomId);
        if (!room) {
            logger.warn('Room not found', { roomId });
            return false;
        }
        if (room.status !== 'waiting') {
            logger.warn('Cannot join room - game already started', { roomId, status: room.status });
            return false;
        }
        if (room.players.length >= room.maxPlayers) {
            logger.warn('Cannot join room - room full', { roomId, currentPlayers: room.players.length });
            return false;
        }
        if (room.hasPassword && !password) {
            logger.warn('Cannot join room - password required', { roomId });
            return false;
        }
        // Sprawdź czy gracz już jest w pokoju
        if (room.players.some(p => p.id === player.id)) {
            logger.warn('Player already in room', { roomId, playerId: player.id });
            return false;
        }
        room.players.push(player);
        logger.info('Player joined room', {
            roomId,
            playerId: player.id,
            playerName: player.name,
            currentPlayers: room.players.length
        });
        this.emit('playerJoinedRoom', { room, player });
        return true;
    }
    /**
     * Usuwa gracza z pokoju
     */
    removePlayerFromRoom(roomId, playerId) {
        const room = this.gameRooms.get(roomId);
        if (!room)
            return false;
        const playerIndex = room.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1)
            return false;
        const removedPlayer = room.players.splice(playerIndex, 1)[0];
        logger.info('Player left room', {
            roomId,
            playerId,
            remainingPlayers: room.players.length
        });
        // Jeśli pokój jest pusty i gra się nie zaczęła, usuń pokój
        if (room.players.length === 0 && room.status === 'waiting') {
            this.deleteRoom(roomId);
        }
        // Jeśli odszedł twórca pokoju, przekaż kontrolę innemu graczowi
        else if (room.createdBy === playerId && room.players.length > 0) {
            room.createdBy = room.players[0].id;
            logger.info('Room ownership transferred', {
                roomId,
                newOwner: room.createdBy
            });
        }
        this.emit('playerLeftRoom', { room, player: removedPlayer });
        return true;
    }
    /**
     * Dodaje AI gracza do pokoju
     */
    addAIPlayer(roomId, aiName, difficulty = AIDifficulty.MEDIUM) {
        const room = this.gameRooms.get(roomId);
        if (!room) {
            logger.warn('Cannot add AI - room not found', { roomId });
            return false;
        }
        if (room.status !== 'waiting') {
            logger.warn('Cannot add AI - game already started', { roomId, status: room.status });
            return false;
        }
        if (room.players.length >= room.maxPlayers) {
            logger.warn('Cannot add AI - room full', { roomId, currentPlayers: room.players.length });
            return false;
        }
        // Wybierz dostępną fakcję
        const usedFactions = room.players.map(p => p.faction);
        const availableFactions = Object.values(Faction).filter(f => !usedFactions.includes(f));
        if (availableFactions.length === 0) {
            // Użyj losowej fakcji jeśli wszystkie zajęte
            availableFactions.push(Object.values(Faction)[Math.floor(Math.random() * Object.values(Faction).length)]);
        }
        const faction = availableFactions[0];
        const name = aiName || this.generateAIName(difficulty);
        // Utwórz AI player
        const { player } = createAIPlayer(name, faction, difficulty);
        // Dodaj do pokoju
        room.players.push(player);
        logger.info('AI player added to room', {
            roomId,
            aiName: name,
            difficulty,
            faction,
            currentPlayers: room.players.length
        });
        this.emit('playerJoinedRoom', { room, player });
        return true;
    }
    generateAIName(difficulty) {
        const easyNames = ['Bot Początkujący', 'AI Nowicjusz', 'Prosty Bot'];
        const mediumNames = ['AI Wojownik', 'Bot Strategiczny', 'Średni Przeciwnik'];
        const hardNames = ['AI Mistrz', 'Bot Ekspert', 'Trudny Przeciwnik', 'AI Komandor'];
        let names;
        switch (difficulty) {
            case AIDifficulty.EASY:
                names = easyNames;
                break;
            case AIDifficulty.MEDIUM:
                names = mediumNames;
                break;
            case AIDifficulty.HARD:
                names = hardNames;
                break;
            default:
                names = mediumNames;
        }
        return names[Math.floor(Math.random() * names.length)];
    }
    /**
     * Rozpoczyna grę w pokoju
     */
    startGame(roomId) {
        const room = this.gameRooms.get(roomId);
        if (!room) {
            logger.warn('Cannot start game - room not found', { roomId });
            return null;
        }
        if (room.status !== 'waiting') {
            logger.warn('Cannot start game - room not waiting', { roomId, status: room.status });
            return null;
        }
        if (room.players.length < 2) {
            logger.warn('Cannot start game - not enough players', { roomId, players: room.players.length });
            return null;
        }
        room.status = 'starting';
        // Tworzymy instancję gry
        const gameInstance = new GameInstance(roomId, room.players, room.gameSettings);
        this.games.set(roomId, gameInstance);
        // Aktualizujemy status pokoju
        room.status = 'in_progress';
        logger.info('Game started', {
            roomId,
            players: room.players.length,
            gameMode: room.gameSettings.gameMode
        });
        this.emit('gameStarted', { room, gameInstance });
        return gameInstance;
    }
    /**
     * Kończy grę
     */
    endGame(gameId, winnerId) {
        const gameInstance = this.games.get(gameId);
        const room = this.gameRooms.get(gameId);
        if (gameInstance) {
            gameInstance.endGame(winnerId);
            this.games.delete(gameId);
        }
        if (room) {
            room.status = 'waiting';
            // Opcjonalnie: wyczyść pokój lub zostaw dla rematchu
        }
        logger.info('Game ended', { gameId, winnerId });
        this.emit('gameEnded', { gameId, winnerId });
    }
    /**
     * Usuwa pokój
     */
    deleteRoom(roomId) {
        const room = this.gameRooms.get(roomId);
        if (!room)
            return false;
        // Jeśli gra jest w trakcie, zakończ ją
        if (this.games.has(roomId)) {
            this.endGame(roomId);
        }
        this.gameRooms.delete(roomId);
        logger.info('Room deleted', { roomId });
        this.emit('roomDeleted', roomId);
        return true;
    }
    /**
     * Zwraca pokój po ID
     */
    getRoom(roomId) {
        return this.gameRooms.get(roomId) || null;
    }
    /**
     * Zwraca grę po ID
     */
    getGame(gameId) {
        return this.games.get(gameId) || null;
    }
    /**
     * Zwraca publiczne pokoje (bez hasła)
     */
    getPublicRooms() {
        return Array.from(this.gameRooms.values()).filter(room => !room.hasPassword);
    }
    /**
     * Zwraca wszystkie pokoje
     */
    getAllRooms() {
        return Array.from(this.gameRooms.values());
    }
    /**
     * Zwraca liczbę aktywnych gier
     */
    getActiveGameCount() {
        return this.games.size;
    }
    /**
     * Zwraca statystyki
     */
    getStats() {
        const totalPlayers = Array.from(this.gameRooms.values())
            .reduce((sum, room) => sum + room.players.length, 0);
        return {
            totalRooms: this.gameRooms.size,
            activeGames: this.games.size,
            totalPlayers,
            maxRooms: this.config.maxRooms
        };
    }
    /**
     * Główna pętla gry - aktualizuje wszystkie aktywne gry
     */
    startGameLoop() {
        const tickInterval = 1000 / this.config.gameTickRate; // milliseconds
        this.gameLoopInterval = setInterval(() => {
            const now = Date.now();
            for (const [gameId, gameInstance] of this.games.entries()) {
                try {
                    gameInstance.update(tickInterval);
                }
                catch (error) {
                    logger.error('Error updating game', { gameId, error });
                    // Opcjonalnie: zakończ grę w przypadku błędu
                    this.endGame(gameId);
                }
            }
        }, tickInterval);
        logger.info('Game loop started', { tickRate: this.config.gameTickRate });
    }
    /**
     * Zatrzymuje game loop
     */
    stopGameLoop() {
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
            this.gameLoopInterval = null;
            logger.info('Game loop stopped');
        }
    }
    /**
     * Zamyka wszystkie gry i czyści managera
     */
    shutdown() {
        logger.info('Shutting down GameManager...');
        this.stopGameLoop();
        // Zakończ wszystkie gry
        for (const gameId of this.games.keys()) {
            this.endGame(gameId);
        }
        // Wyczyść wszystkie pokoje
        this.gameRooms.clear();
        this.games.clear();
        logger.info('GameManager shutdown complete');
    }
}
//# sourceMappingURL=GameManager.js.map