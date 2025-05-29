import { EventEmitter } from 'events';
import { Faction, generateGameId } from '@rts-engine/shared';
import { GameInstance } from './GameInstance';
import { createAIPlayer, AIDifficulty } from './AIPlayer';
import { logger } from '../utils/Logger';
export class GameRoomManager extends EventEmitter {
    constructor() {
        super();
        this.rooms = new Map();
        this.playerRooms = new Map();
        // Cleanup nieaktywnych pokoi co 5 minut
        this.cleanupInterval = setInterval(() => {
            this.cleanupInactiveRooms();
        }, 5 * 60 * 1000);
    }
    createRoom(hostPlayer, roomName, gameSettings, password) {
        const roomId = generateGameId();
        const room = {
            id: roomId,
            name: roomName,
            createdBy: hostPlayer.id,
            players: [hostPlayer],
            maxPlayers: gameSettings.maxPlayers,
            gameSettings,
            status: 'waiting',
            hasPassword: !!password,
            password,
            createdAt: Date.now()
        };
        const roomData = {
            room,
            aiPlayers: new Map(),
            lastActivity: Date.now()
        };
        this.rooms.set(roomId, roomData);
        this.playerRooms.set(hostPlayer.id, roomId);
        // Automatycznie dodaj AI playerów jeśli potrzeba
        this.maybeAddAIPlayers(roomId);
        logger.info(`Room created: ${roomName} (${roomId}) by ${hostPlayer.name}`);
        this.emit('roomCreated', room);
        return room;
    }
    joinRoom(player, roomId, password) {
        const roomData = this.rooms.get(roomId);
        if (!roomData)
            return false;
        const room = roomData.room;
        // Sprawdzenia
        if (room.status !== 'waiting')
            return false;
        if (room.players.length >= room.maxPlayers)
            return false;
        if (room.hasPassword && room.password !== password)
            return false;
        if (room.players.some(p => p.id === player.id))
            return false;
        // Dodaj gracza
        room.players.push(player);
        this.playerRooms.set(player.id, roomId);
        roomData.lastActivity = Date.now();
        logger.info(`Player ${player.name} joined room ${room.name}`);
        this.emit('roomUpdated', room);
        return true;
    }
    leaveRoom(playerId) {
        const roomId = this.playerRooms.get(playerId);
        if (!roomId)
            return false;
        const roomData = this.rooms.get(roomId);
        if (!roomData)
            return false;
        const room = roomData.room;
        const playerIndex = room.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1)
            return false;
        // Usuń gracza
        room.players.splice(playerIndex, 1);
        this.playerRooms.delete(playerId);
        roomData.lastActivity = Date.now();
        // Jeśli pokój jest pusty lub host wyszedł
        if (room.players.length === 0 || room.createdBy === playerId) {
            this.removeRoom(roomId);
            return true;
        }
        // Jeśli host wyszedł, przekaż host następnemu graczowi
        if (room.createdBy === playerId && room.players.length > 0) {
            room.createdBy = room.players[0].id;
        }
        // Dodaj AI jeśli potrzeba
        this.maybeAddAIPlayers(roomId);
        logger.info(`Player left room ${room.name}`);
        this.emit('roomUpdated', room);
        return true;
    }
    addAIPlayer(roomId, aiName, difficulty = AIDifficulty.MEDIUM) {
        const roomData = this.rooms.get(roomId);
        if (!roomData)
            return false;
        const room = roomData.room;
        if (room.players.length >= room.maxPlayers)
            return false;
        if (room.status !== 'waiting')
            return false;
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
        const { player, ai } = createAIPlayer(name, faction, difficulty);
        // Dodaj do pokoju
        room.players.push(player);
        roomData.aiPlayers.set(player.id, ai);
        roomData.lastActivity = Date.now();
        // Nasłuchuj akcji AI
        ai.on('action', (actionData) => {
            this.handleAIAction(roomId, actionData);
        });
        logger.info(`AI player ${name} (${difficulty}) added to room ${room.name}`);
        this.emit('roomUpdated', room);
        return true;
    }
    removeAIPlayer(roomId, aiPlayerId) {
        const roomData = this.rooms.get(roomId);
        if (!roomData)
            return false;
        const room = roomData.room;
        const playerIndex = room.players.findIndex(p => p.id === aiPlayerId && p.isAI);
        if (playerIndex === -1)
            return false;
        // Usuń AI z pokoju
        const aiPlayer = room.players[playerIndex];
        room.players.splice(playerIndex, 1);
        // Usuń AI instance
        const ai = roomData.aiPlayers.get(aiPlayerId);
        if (ai) {
            ai.removeAllListeners();
            roomData.aiPlayers.delete(aiPlayerId);
        }
        roomData.lastActivity = Date.now();
        logger.info(`AI player ${aiPlayer.name} removed from room ${room.name}`);
        this.emit('roomUpdated', room);
        return true;
    }
    startGame(roomId, hostPlayerId) {
        const roomData = this.rooms.get(roomId);
        if (!roomData)
            return false;
        const room = roomData.room;
        if (room.createdBy !== hostPlayerId)
            return false;
        if (room.status !== 'waiting')
            return false;
        if (room.players.length < 2)
            return false;
        // Utwórz game instance
        const gameInstance = new GameInstance(generateGameId(), room.players, room.gameSettings);
        roomData.gameInstance = gameInstance;
        // Rozpocznij grę
        room.status = 'in_progress';
        // Aktualizuj AI o stanie gry
        this.updateAIGameState(roomId);
        // Uruchom tick loop dla AI
        this.startAILoop(roomId);
        logger.info(`Game started in room ${room.name}`);
        this.emit('gameStarted', { room, gameState: gameInstance.getGameState() });
        return true;
    }
    handlePlayerAction(roomId, playerId, action) {
        const roomData = this.rooms.get(roomId);
        if (!roomData?.gameInstance)
            return false;
        const room = roomData.room;
        if (room.status !== 'in_progress')
            return false;
        // Sprawdź czy gracz należy do pokoju
        if (!room.players.some(p => p.id === playerId))
            return false;
        // Przekaż akcję do game instance
        const success = roomData.gameInstance.addPlayerAction(playerId, action);
        if (success) {
            // Aktualizuj AI o nowym stanie gry
            this.updateAIGameState(roomId);
            // Emit game state update
            this.emit('gameUpdated', {
                roomId,
                gameState: roomData.gameInstance.getGameState()
            });
        }
        return success;
    }
    handleAIAction(roomId, actionData) {
        const roomData = this.rooms.get(roomId);
        if (!roomData?.gameInstance)
            return;
        // Przekaż akcję AI do game instance
        const success = roomData.gameInstance.addPlayerAction(actionData.playerId, actionData.action);
        if (success) {
            // Emit game state update
            this.emit('gameUpdated', {
                roomId,
                gameState: roomData.gameInstance.getGameState()
            });
        }
    }
    maybeAddAIPlayers(roomId) {
        const roomData = this.rooms.get(roomId);
        if (!roomData)
            return;
        const room = roomData.room;
        const humanPlayers = room.players.filter(p => !p.isAI).length;
        // Dodaj AI playerów jeśli jest za mało graczy
        if (humanPlayers === 1 && room.players.length < room.maxPlayers) {
            // Dodaj przynajmniej jednego AI żeby można było rozpocząć grę
            const aiCount = Math.min(2, room.maxPlayers - room.players.length);
            for (let i = 0; i < aiCount; i++) {
                const difficulty = this.getRandomDifficulty();
                this.addAIPlayer(roomId, undefined, difficulty);
            }
        }
    }
    updateAIGameState(roomId) {
        const roomData = this.rooms.get(roomId);
        if (!roomData?.gameInstance)
            return;
        const gameState = roomData.gameInstance.getGameState();
        // Aktualizuj wszystkich AI o nowym stanie gry
        for (const ai of roomData.aiPlayers.values()) {
            ai.updateGameState(gameState);
        }
    }
    startAILoop(roomId) {
        const roomData = this.rooms.get(roomId);
        if (!roomData)
            return;
        // AI loop - aktualizuj AI co 500ms
        const loopFunction = () => {
            const currentRoomData = this.rooms.get(roomId);
            if (!currentRoomData?.gameInstance || currentRoomData.room.status !== 'in_progress') {
                return;
            }
            // Aktualizuj AI
            this.updateAIGameState(roomId);
            // Zaplanuj następną iterację
            setTimeout(loopFunction, 500);
        };
        // Rozpocznij pętlę
        setTimeout(loopFunction, 500);
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
    getRandomDifficulty() {
        const difficulties = [AIDifficulty.EASY, AIDifficulty.MEDIUM, AIDifficulty.HARD];
        const weights = [0.4, 0.4, 0.2]; // 40% easy, 40% medium, 20% hard
        const random = Math.random();
        let weightSum = 0;
        for (let i = 0; i < difficulties.length; i++) {
            weightSum += weights[i];
            if (random <= weightSum) {
                return difficulties[i];
            }
        }
        return AIDifficulty.MEDIUM;
    }
    cleanupInactiveRooms() {
        const now = Date.now();
        const INACTIVE_TIMEOUT = 30 * 60 * 1000; // 30 minut
        for (const [roomId, roomData] of this.rooms.entries()) {
            if (now - roomData.lastActivity > INACTIVE_TIMEOUT) {
                logger.info(`Cleaning up inactive room: ${roomData.room.name}`);
                this.removeRoom(roomId);
            }
        }
    }
    removeRoom(roomId) {
        const roomData = this.rooms.get(roomId);
        if (!roomData)
            return;
        // Cleanup AI
        for (const ai of roomData.aiPlayers.values()) {
            ai.removeAllListeners();
        }
        roomData.aiPlayers.clear();
        // Cleanup intervals
        if (roomData.aiInterval) {
            clearInterval(roomData.aiInterval);
        }
        // Usuń playerów z mapy
        for (const player of roomData.room.players) {
            this.playerRooms.delete(player.id);
        }
        // Usuń pokój
        this.rooms.delete(roomId);
        this.emit('roomRemoved', roomId);
    }
    // Getters
    getRoom(roomId) {
        return this.rooms.get(roomId)?.room || null;
    }
    getAllRooms() {
        return Array.from(this.rooms.values()).map(data => data.room);
    }
    getPlayerRoom(playerId) {
        const roomId = this.playerRooms.get(playerId);
        return roomId ? this.getRoom(roomId) : null;
    }
    getGameState(roomId) {
        const roomData = this.rooms.get(roomId);
        return roomData?.gameInstance?.getGameState() || null;
    }
    getAIPlayers(roomId) {
        const roomData = this.rooms.get(roomId);
        return roomData ? Array.from(roomData.aiPlayers.values()) : [];
    }
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        // Cleanup wszystkich pokoi
        for (const roomId of this.rooms.keys()) {
            this.removeRoom(roomId);
        }
    }
}
//# sourceMappingURL=GameRoomManager.js.map