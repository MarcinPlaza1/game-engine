/**
 * Handler Socket.IO - obsługuje wszystkie eventy sieciowe
 */
import { Server as SocketIOServer, Socket } from 'socket.io';
import { GameManager } from '../game/GameManager';
import { LobbyManager } from '../lobby/LobbyManager';
/**
 * Handler Socket.IO
 */
export declare class SocketHandler {
    private io;
    private gameManager;
    private lobbyManager;
    private rateLimits;
    constructor(io: SocketIOServer, gameManager: GameManager, lobbyManager: LobbyManager);
    /**
     * Konfiguruje nasłuchiwanie eventów z managerów
     */
    private setupEventListeners;
    /**
     * Konfiguruje nasłuchiwanie eventów konkretnej gry
     */
    private setupGameEventListeners;
    /**
     * Obsługuje nowe połączenie
     */
    handleConnection(socket: Socket): void;
    /**
     * Obsługuje rozłączenie
     */
    handleDisconnection(socket: Socket): void;
    /**
     * Obsługuje ping
     */
    private handlePing;
    /**
     * Obsługuje błędy
     */
    private handleError;
    /**
     * Obsługuje dołączenie do lobby
     */
    private handleJoinLobby;
    /**
     * Obsługuje opuszczenie lobby
     */
    private handleLeaveLobby;
    /**
     * Obsługuje tworzenie pokoju
     */
    private handleCreateRoom;
    /**
     * Obsługuje dołączenie do pokoju
     */
    private handleJoinRoom;
    /**
     * Obsługuje opuszczenie pokoju
     */
    private handleLeaveRoom;
    /**
     * Obsługuje start gry
     */
    private handleStartGame;
    /**
     * Obsługuje dodanie AI gracza do pokoju
     */
    private handleAddAIPlayer;
    /**
     * Obsługuje akcje gracza w grze
     */
    private handlePlayerAction;
    /**
     * Obsługuje wiadomości czatu
     */
    private handleChatMessage;
    /**
     * Obsługuje żądanie pełnego stanu gry
     */
    private handleRequestGameState;
    /**
     * Wysyła błąd do socket
     */
    private sendError;
    /**
     * Wysyła wiadomość do konkretnego socket
     */
    private sendToSocket;
    /**
     * Wysyła wiadomość do pokoju
     */
    private sendToRoom;
    /**
     * Wysyła broadcast do lobby
     */
    private broadcastToLobby;
    /**
     * Zamyka handler
     */
    shutdown(): void;
}
//# sourceMappingURL=SocketHandler.d.ts.map