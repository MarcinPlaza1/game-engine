/**
 * Główny serwer RTS Game Engine
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { logger } from './utils/Logger.js';
import { GameManager } from './game/GameManager.js';
import { LobbyManager } from './lobby/LobbyManager.js';
import { SocketHandler } from './socket/SocketHandler.js';
import { AuthMiddleware } from './middleware/AuthMiddleware.js';
import { ValidationMiddleware } from './middleware/ValidationMiddleware.js';

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
export class RTSServer {
  private app!: express.Application;
  private server: any;
  private io!: SocketIOServer;
  private config: ServerConfig;
  
  private gameManager!: GameManager;
  private lobbyManager!: LobbyManager;
  private socketHandler!: SocketHandler;

  constructor(config: Partial<ServerConfig> = {}) {
    this.config = {
      port: 3001,
      host: '0.0.0.0',
      corsOrigins: ['http://localhost:3000', 'http://localhost:5173'],
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minut
        max: 100 // limit każdy IP do 100 żądań na windowMs
      },
      game: {
        maxRooms: 50,
        maxPlayersPerRoom: 8,
        gameTickRate: 20 // 20 ticks per second
      },
      ...config
    };

    this.initializeApp();
    this.initializeSocketIO();
    this.initializeManagers();
    this.setupRoutes();
    this.setupSocketHandlers();
  }

  /**
   * Inicjalizuje Express aplikację
   */
  private initializeApp(): void {
    this.app = express();
    this.server = createServer(this.app);

    // Security middleware
    this.app.use(helmet());
    this.app.use(compression());
    
    // CORS
    this.app.use(cors({
      origin: this.config.corsOrigins,
      credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: this.config.rateLimit.windowMs,
      max: this.config.rateLimit.max,
      message: 'Zbyt wiele żądań z tego IP'
    });
    this.app.use('/api/', limiter);

    // Body parsing
    this.app.use(express.json({ limit: '1mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Logging middleware
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next();
    });
  }

  /**
   * Inicjalizuje Socket.IO
   */
  private initializeSocketIO(): void {
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: this.config.corsOrigins,
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    // Middleware dla Socket.IO
    this.io.use(AuthMiddleware.socketAuth);
    this.io.use(ValidationMiddleware.socketValidation);
  }

  /**
   * Inicjalizuje managery
   */
  private initializeManagers(): void {
    this.gameManager = new GameManager(this.config.game);
    this.lobbyManager = new LobbyManager();
    this.socketHandler = new SocketHandler(this.io, this.gameManager, this.lobbyManager);
  }

  /**
   * Konfiguruje HTTP routes
   */
  private setupRoutes(): void {
    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.2.0'
      });
    });

    // Server stats
    this.app.get('/api/stats', (req, res) => {
      const stats = {
        connectedClients: this.io.sockets.sockets.size,
        activeGames: this.gameManager.getActiveGameCount(),
        playersInLobby: this.lobbyManager.getPlayerCount(),
        serverUptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      };
      res.json(stats);
    });

    // Game rooms info
    this.app.get('/api/rooms', (req, res) => {
      const rooms = this.gameManager.getPublicRooms();
      res.json(rooms);
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        path: req.path
      });
    });

    // Error handler
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Express error:', err);
      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
      });
    });
  }

  /**
   * Konfiguruje obsługę Socket.IO
   */
  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      logger.info(`Nowe połączenie: ${socket.id}`, {
        ip: socket.handshake.address,
        userAgent: socket.handshake.headers['user-agent']
      });

      this.socketHandler.handleConnection(socket);

      socket.on('disconnect', (reason) => {
        logger.info(`Rozłączenie: ${socket.id}`, { reason });
        this.socketHandler.handleDisconnection(socket);
      });
    });
  }

  /**
   * Uruchamia serwer
   */
  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server.listen(this.config.port, this.config.host, () => {
          logger.info(`🚀 RTS Server uruchomiony na ${this.config.host}:${this.config.port}`);
          logger.info(`📡 Socket.IO gotowy do połączeń`);
          logger.info(`🎮 Maksymalnie ${this.config.game.maxRooms} pokoi gry`);
          resolve();
        });
      } catch (error) {
        logger.error('Błąd uruchamiania serwera:', error);
        reject(error);
      }
    });
  }

  /**
   * Zatrzymuje serwer
   */
  public stop(): Promise<void> {
    return new Promise((resolve) => {
      logger.info('Zatrzymywanie serwera...');
      
      // Zatrzymaj managery
      this.gameManager.shutdown();
      this.lobbyManager.shutdown();
      
      // Rozłącz wszystkich klientów
      this.io.emit('server_shutdown', { message: 'Serwer zostanie zatrzymany' });
      
      setTimeout(() => {
        this.io.close();
        this.server.close(() => {
          logger.info('Serwer zatrzymany');
          resolve();
        });
      }, 5000); // 5 sekund na graceful shutdown
    });
  }

  /**
   * Zwraca statystyki serwera
   */
  public getStats() {
    return {
      connectedClients: this.io.sockets.sockets.size,
      activeGames: this.gameManager.getActiveGameCount(),
      playersInLobby: this.lobbyManager.getPlayerCount(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
  }
}

// Uruchomienie serwera jeśli ten plik jest wykonywany bezpośrednio
// W ESM sprawdzamy czy to główny moduł
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const server = new RTSServer();
  
  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('Otrzymano SIGTERM, graceful shutdown...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('Otrzymano SIGINT, graceful shutdown...');
    await server.stop();
    process.exit(0);
  });

  // Obsługa błędów
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });

  // Uruchom serwer
  server.start().catch((error) => {
    logger.error('Nie udało się uruchomić serwera:', error);
    process.exit(1);
  });
} else {
  // Jeśli warunek nie zadziałał, uruchom serwer i tak (fallback)
  console.log('Fallback: uruchamiam serwer...');
  const server = new RTSServer();
  server.start().catch(console.error);
} 