/**
 * Główny serwer RTS Game Engine
 */
/**
 * Konfiguracja serwera
 */
interface ServerConfig {
    port: number;
    host: string;
    corsOrigins: string[];
    rateLimit: {
        windowMs: number;
        max: number;
    };
    game: {
        maxRooms: number;
        maxPlayersPerRoom: number;
        gameTickRate: number;
    };
}
/**
 * Główna klasa serwera
 */
export declare class RTSServer {
    private app;
    private server;
    private io;
    private config;
    private gameManager;
    private lobbyManager;
    private socketHandler;
    constructor(config?: Partial<ServerConfig>);
    /**
     * Inicjalizuje Express aplikację
     */
    private initializeApp;
    /**
     * Inicjalizuje Socket.IO
     */
    private initializeSocketIO;
    /**
     * Inicjalizuje managery
     */
    private initializeManagers;
    /**
     * Konfiguruje HTTP routes
     */
    private setupRoutes;
    /**
     * Konfiguruje obsługę Socket.IO
     */
    private setupSocketHandlers;
    /**
     * Uruchamia serwer
     */
    start(): Promise<void>;
    /**
     * Zatrzymuje serwer
     */
    stop(): Promise<void>;
    /**
     * Zwraca statystyki serwera
     */
    getStats(): {
        connectedClients: number;
        activeGames: number;
        playersInLobby: number;
        uptime: number;
        memory: NodeJS.MemoryUsage;
    };
}
export {};
//# sourceMappingURL=server.d.ts.map