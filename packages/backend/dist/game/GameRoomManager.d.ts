import { EventEmitter } from 'events';
import { GameRoom, GameSettings, Player, GameState, GameId } from '@rts-engine/shared';
import { GameInstance } from './GameInstance';
import { AIPlayer, AIDifficulty } from './AIPlayer';
export interface GameRoomData {
    room: GameRoom;
    gameInstance?: GameInstance;
    aiPlayers: Map<string, AIPlayer>;
    lastActivity: number;
}
export declare class GameRoomManager extends EventEmitter {
    private rooms;
    private playerRooms;
    private cleanupInterval;
    constructor();
    createRoom(hostPlayer: Player, roomName: string, gameSettings: GameSettings, password?: string): GameRoom;
    joinRoom(player: Player, roomId: GameId, password?: string): boolean;
    leaveRoom(playerId: string): boolean;
    addAIPlayer(roomId: GameId, aiName?: string, difficulty?: AIDifficulty): boolean;
    removeAIPlayer(roomId: GameId, aiPlayerId: string): boolean;
    startGame(roomId: GameId, hostPlayerId: string): boolean;
    handlePlayerAction(roomId: GameId, playerId: string, action: any): boolean;
    private handleAIAction;
    private maybeAddAIPlayers;
    private updateAIGameState;
    private startAILoop;
    private generateAIName;
    private getRandomDifficulty;
    private cleanupInactiveRooms;
    private removeRoom;
    getRoom(roomId: GameId): GameRoom | null;
    getAllRooms(): GameRoom[];
    getPlayerRoom(playerId: string): GameRoom | null;
    getGameState(roomId: GameId): GameState | null;
    getAIPlayers(roomId: GameId): AIPlayer[];
    destroy(): void;
}
//# sourceMappingURL=GameRoomManager.d.ts.map