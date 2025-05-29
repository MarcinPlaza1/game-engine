/**
 * Manager gier - zarządza pokojami gry i synchronizacją
 */
import { EventEmitter } from 'events';
import { GameId, GameRoom, Player, GameSettings } from '@rts-engine/shared';
import { GameInstance } from './GameInstance';
import { AIDifficulty } from './AIPlayer';
/**
 * Konfiguracja GameManager
 */
interface GameManagerConfig {
    maxRooms: number;
    maxPlayersPerRoom: number;
    gameTickRate: number;
}
/**
 * Manager zarządzający wszystkimi grami na serwerze
 */
export declare class GameManager extends EventEmitter {
    private games;
    private gameRooms;
    private config;
    private gameLoopInterval;
    constructor(config: GameManagerConfig);
    /**
     * Tworzy nowy pokój gry
     */
    createRoom(createdBy: GameId, roomName: string, gameSettings: GameSettings, password?: string): GameRoom | null;
    /**
     * Dodaje gracza do pokoju
     */
    addPlayerToRoom(roomId: GameId, player: Player, password?: string): boolean;
    /**
     * Usuwa gracza z pokoju
     */
    removePlayerFromRoom(roomId: GameId, playerId: GameId): boolean;
    /**
     * Dodaje AI gracza do pokoju
     */
    addAIPlayer(roomId: GameId, aiName?: string, difficulty?: AIDifficulty): boolean;
    private generateAIName;
    /**
     * Rozpoczyna grę w pokoju
     */
    startGame(roomId: GameId): GameInstance | null;
    /**
     * Kończy grę
     */
    endGame(gameId: GameId, winnerId?: GameId): void;
    /**
     * Usuwa pokój
     */
    deleteRoom(roomId: GameId): boolean;
    /**
     * Zwraca pokój po ID
     */
    getRoom(roomId: GameId): GameRoom | null;
    /**
     * Zwraca grę po ID
     */
    getGame(gameId: GameId): GameInstance | null;
    /**
     * Zwraca publiczne pokoje (bez hasła)
     */
    getPublicRooms(): GameRoom[];
    /**
     * Zwraca wszystkie pokoje
     */
    getAllRooms(): GameRoom[];
    /**
     * Zwraca liczbę aktywnych gier
     */
    getActiveGameCount(): number;
    /**
     * Zwraca statystyki
     */
    getStats(): {
        totalRooms: number;
        activeGames: number;
        totalPlayers: number;
        maxRooms: number;
    };
    /**
     * Główna pętla gry - aktualizuje wszystkie aktywne gry
     */
    private startGameLoop;
    /**
     * Zatrzymuje game loop
     */
    private stopGameLoop;
    /**
     * Zamyka wszystkie gry i czyści managera
     */
    shutdown(): void;
}
export {};
//# sourceMappingURL=GameManager.d.ts.map