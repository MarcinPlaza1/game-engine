/**
 * Handler Socket.IO - obsługuje wszystkie eventy sieciowe
 */
import { ClientMessageType, ServerMessageType, validateMessage, checkRateLimit } from '@rts-engine/shared';
import { PlayerActionType } from '@rts-engine/shared/dist/types/Player';
import { logger } from '../utils/Logger';
/**
 * Handler Socket.IO
 */
export class SocketHandler {
    constructor(io, gameManager, lobbyManager) {
        this.rateLimits = new Map();
        this.io = io;
        this.gameManager = gameManager;
        this.lobbyManager = lobbyManager;
        this.setupEventListeners();
        logger.info('SocketHandler initialized');
    }
    /**
     * Konfiguruje nasłuchiwanie eventów z managerów
     */
    setupEventListeners() {
        // LobbyManager events
        this.lobbyManager.on('playerJoined', (player) => {
            this.broadcastToLobby(ServerMessageType.LOBBY_STATE, {
                connectedPlayers: this.lobbyManager.getAllPlayers(),
                availableRooms: this.gameManager.getPublicRooms()
            });
        });
        this.lobbyManager.on('playerLeft', (player) => {
            this.broadcastToLobby(ServerMessageType.LOBBY_STATE, {
                connectedPlayers: this.lobbyManager.getAllPlayers(),
                availableRooms: this.gameManager.getPublicRooms()
            });
        });
        this.lobbyManager.on('broadcastMessage', (data) => {
            this.broadcastToLobby(ServerMessageType.CHAT_MESSAGE, {
                type: ServerMessageType.CHAT_MESSAGE,
                message: data.message,
                channel: 'system',
                timestamp: data.timestamp,
                playerId: 'system'
            });
        });
        this.lobbyManager.on('playerMessage', (data) => {
            this.sendToSocket(data.socketId, data.type, data);
        });
        // GameManager events
        this.gameManager.on('roomCreated', (room) => {
            this.broadcastToLobby(ServerMessageType.ROOM_STATE, { room });
        });
        this.gameManager.on('playerJoinedRoom', ({ room, player }) => {
            this.sendToRoom(room.id, ServerMessageType.ROOM_STATE, { room });
            this.lobbyManager.setPlayerRoom(player.id, room.id);
        });
        this.gameManager.on('playerLeftRoom', ({ room, player }) => {
            this.sendToRoom(room.id, ServerMessageType.ROOM_STATE, { room });
            this.lobbyManager.setPlayerRoom(player.id, undefined);
        });
        this.gameManager.on('gameStarted', ({ room, gameInstance }) => {
            this.sendToRoom(room.id, ServerMessageType.GAME_STARTED, {
                gameId: room.id,
                gameState: gameInstance.getGameState()
            });
            // Nasłuchuj eventów gry
            this.setupGameEventListeners(gameInstance);
        });
        this.gameManager.on('gameEnded', ({ gameId, winnerId }) => {
            this.sendToRoom(gameId, ServerMessageType.GAME_EVENT, {
                type: ServerMessageType.GAME_EVENT,
                event: {
                    eventType: 'GAME_ENDED',
                    timestamp: Date.now(),
                    playerId: winnerId,
                    message: 'Gra zakończona!'
                },
                timestamp: Date.now(),
                gameId
            });
            // Aktualizuj statystyki graczy
            const room = this.gameManager.getRoom(gameId);
            if (room && winnerId) {
                room.players.forEach(player => {
                    this.lobbyManager.updatePlayerStats(player.id, player.id === winnerId);
                    this.lobbyManager.setPlayerRoom(player.id, undefined);
                });
            }
        });
    }
    /**
     * Konfiguruje nasłuchiwanie eventów konkretnej gry
     */
    setupGameEventListeners(gameInstance) {
        gameInstance.on('gameUpdate', (data) => {
            this.sendToRoom(data.gameId, ServerMessageType.GAME_STATE_UPDATE, {
                type: ServerMessageType.GAME_STATE_UPDATE,
                deltaUpdate: data.deltaUpdate,
                timestamp: Date.now(),
                gameId: data.gameId
            });
        });
        gameInstance.on('gameEvent', (data) => {
            this.sendToRoom(data.gameId, ServerMessageType.GAME_EVENT, {
                type: ServerMessageType.GAME_EVENT,
                event: data.event,
                timestamp: Date.now(),
                gameId: data.gameId
            });
        });
    }
    /**
     * Obsługuje nowe połączenie
     */
    handleConnection(socket) {
        logger.debug('Setting up socket handlers', { socketId: socket.id });
        // Podstawowe eventy
        socket.on('disconnect', () => this.handleDisconnection(socket));
        socket.on('ping', () => this.handlePing(socket));
        socket.on('error', (error) => this.handleError(socket, error));
        // Lobby eventy
        socket.on(ClientMessageType.JOIN_LOBBY, (data) => this.handleJoinLobby(socket, data));
        socket.on(ClientMessageType.LEAVE_LOBBY, () => this.handleLeaveLobby(socket));
        // Room eventy
        socket.on(ClientMessageType.CREATE_ROOM, (data) => this.handleCreateRoom(socket, data));
        socket.on(ClientMessageType.JOIN_ROOM, (data) => this.handleJoinRoom(socket, data));
        socket.on(ClientMessageType.LEAVE_ROOM, () => this.handleLeaveRoom(socket));
        socket.on(ClientMessageType.START_GAME, () => this.handleStartGame(socket));
        socket.on(ClientMessageType.ADD_AI_PLAYER, (data) => this.handleAddAIPlayer(socket, data));
        // Game eventy
        socket.on(ClientMessageType.PLAYER_ACTION, (data) => this.handlePlayerAction(socket, data));
        socket.on(ClientMessageType.CHAT_MESSAGE, (data) => this.handleChatMessage(socket, data));
        socket.on(ClientMessageType.REQUEST_GAME_STATE, () => this.handleRequestGameState(socket));
        // Automatyczne dołączenie do lobby room
        socket.join('lobby');
    }
    /**
     * Obsługuje rozłączenie
     */
    handleDisconnection(socket) {
        const player = this.lobbyManager.getPlayerBySocket(socket.id);
        if (player) {
            // Usuń z pokoju gry jeśli był w jakimś
            if (player.roomId) {
                this.gameManager.removePlayerFromRoom(player.roomId, player.id);
            }
            // Usuń z lobby
            this.lobbyManager.removePlayer(socket.id);
        }
        logger.debug('Socket disconnected', { socketId: socket.id });
    }
    /**
     * Obsługuje ping
     */
    handlePing(socket) {
        this.lobbyManager.updatePlayerPing(socket.id);
        socket.emit(ServerMessageType.PONG, { timestamp: Date.now() });
    }
    /**
     * Obsługuje błędy
     */
    handleError(socket, error) {
        logger.error('Socket error', { socketId: socket.id, error });
        socket.emit(ServerMessageType.ERROR, {
            type: ServerMessageType.ERROR,
            errorCode: 'SOCKET_ERROR',
            message: 'Wystąpił błąd połączenia',
            timestamp: Date.now()
        });
    }
    /**
     * Obsługuje dołączenie do lobby
     */
    handleJoinLobby(socket, data) {
        try {
            // Rate limiting
            if (!checkRateLimit(socket.id, 'join_lobby', this.rateLimits)) {
                this.sendError(socket, 'RATE_LIMIT', 'Zbyt częste próby dołączenia');
                return;
            }
            // Walidacja
            const validation = validateMessage(data);
            if (!validation.isValid) {
                this.sendError(socket, 'INVALID_MESSAGE', validation.errors.join(', '));
                return;
            }
            // Dodaj gracza do lobby
            const player = this.lobbyManager.addPlayer(socket.id, data.playerName);
            if (!player) {
                this.sendError(socket, 'JOIN_FAILED', 'Nie można dołączyć do lobby');
                return;
            }
            // Wyślij potwierdzenie
            socket.emit(ServerMessageType.LOBBY_STATE, {
                type: ServerMessageType.LOBBY_STATE,
                connectedPlayers: this.lobbyManager.getAllPlayers(),
                availableRooms: this.gameManager.getPublicRooms(),
                timestamp: Date.now(),
                playerId: player.id
            });
            logger.info('Player joined lobby via socket', {
                socketId: socket.id,
                playerId: player.id,
                playerName: player.name
            });
        }
        catch (error) {
            logger.error('Error handling join lobby', { socketId: socket.id, error });
            this.sendError(socket, 'INTERNAL_ERROR', 'Błąd serwera');
        }
    }
    /**
     * Obsługuje opuszczenie lobby
     */
    handleLeaveLobby(socket) {
        this.lobbyManager.removePlayer(socket.id);
        socket.leave('lobby');
        socket.emit(ServerMessageType.CONNECTION_STATUS, {
            type: ServerMessageType.CONNECTION_STATUS,
            status: 'disconnected',
            timestamp: Date.now()
        });
    }
    /**
     * Obsługuje tworzenie pokoju
     */
    handleCreateRoom(socket, data) {
        try {
            const player = this.lobbyManager.getPlayerBySocket(socket.id);
            if (!player) {
                this.sendError(socket, 'NOT_IN_LOBBY', 'Musisz być w lobby');
                return;
            }
            if (player.roomId) {
                this.sendError(socket, 'ALREADY_IN_ROOM', 'Już jesteś w pokoju');
                return;
            }
            // Rate limiting
            if (!checkRateLimit(player.id, 'create_room', this.rateLimits)) {
                this.sendError(socket, 'RATE_LIMIT', 'Zbyt częste tworzenie pokoi');
                return;
            }
            const room = this.gameManager.createRoom(player.id, data.roomName, data.gameSettings, data.password);
            if (!room) {
                this.sendError(socket, 'CREATE_FAILED', 'Nie można stworzyć pokoju');
                return;
            }
            // Dodaj gracza do pokoju
            if (this.gameManager.addPlayerToRoom(room.id, player, data.password)) {
                socket.join(`room_${room.id}`);
                socket.leave('lobby');
                socket.emit(ServerMessageType.ROOM_STATE, {
                    type: ServerMessageType.ROOM_STATE,
                    room,
                    timestamp: Date.now()
                });
            }
        }
        catch (error) {
            logger.error('Error creating room', { socketId: socket.id, error });
            this.sendError(socket, 'INTERNAL_ERROR', 'Błąd tworzenia pokoju');
        }
    }
    /**
     * Obsługuje dołączenie do pokoju
     */
    handleJoinRoom(socket, data) {
        try {
            const player = this.lobbyManager.getPlayerBySocket(socket.id);
            if (!player) {
                this.sendError(socket, 'NOT_IN_LOBBY', 'Musisz być w lobby');
                return;
            }
            if (player.roomId) {
                this.sendError(socket, 'ALREADY_IN_ROOM', 'Już jesteś w pokoju');
                return;
            }
            const room = this.gameManager.getRoom(data.roomId);
            if (!room) {
                this.sendError(socket, 'ROOM_NOT_FOUND', 'Pokój nie istnieje');
                return;
            }
            if (this.gameManager.addPlayerToRoom(data.roomId, player, data.password)) {
                socket.join(`room_${data.roomId}`);
                socket.leave('lobby');
                socket.emit(ServerMessageType.ROOM_STATE, {
                    type: ServerMessageType.ROOM_STATE,
                    room: this.gameManager.getRoom(data.roomId),
                    timestamp: Date.now()
                });
            }
            else {
                this.sendError(socket, 'JOIN_FAILED', 'Nie można dołączyć do pokoju');
            }
        }
        catch (error) {
            logger.error('Error joining room', { socketId: socket.id, error });
            this.sendError(socket, 'INTERNAL_ERROR', 'Błąd dołączania do pokoju');
        }
    }
    /**
     * Obsługuje opuszczenie pokoju
     */
    handleLeaveRoom(socket) {
        const player = this.lobbyManager.getPlayerBySocket(socket.id);
        if (!player || !player.roomId)
            return;
        this.gameManager.removePlayerFromRoom(player.roomId, player.id);
        socket.leave(`room_${player.roomId}`);
        socket.join('lobby');
        socket.emit(ServerMessageType.LOBBY_STATE, {
            type: ServerMessageType.LOBBY_STATE,
            connectedPlayers: this.lobbyManager.getAllPlayers(),
            availableRooms: this.gameManager.getPublicRooms(),
            timestamp: Date.now()
        });
    }
    /**
     * Obsługuje start gry
     */
    handleStartGame(socket) {
        const player = this.lobbyManager.getPlayerBySocket(socket.id);
        if (!player || !player.roomId) {
            this.sendError(socket, 'NOT_IN_ROOM', 'Musisz być w pokoju');
            return;
        }
        const room = this.gameManager.getRoom(player.roomId);
        if (!room) {
            this.sendError(socket, 'ROOM_NOT_FOUND', 'Pokój nie istnieje');
            return;
        }
        if (room.createdBy !== player.id) {
            this.sendError(socket, 'NOT_ROOM_OWNER', 'Tylko twórca pokoju może rozpocząć grę');
            return;
        }
        const gameInstance = this.gameManager.startGame(player.roomId);
        if (!gameInstance) {
            this.sendError(socket, 'START_FAILED', 'Nie można rozpocząć gry');
            return;
        }
    }
    /**
     * Obsługuje dodanie AI gracza do pokoju
     */
    handleAddAIPlayer(socket, data) {
        try {
            const player = this.lobbyManager.getPlayerBySocket(socket.id);
            if (!player || !player.roomId) {
                this.sendError(socket, 'NOT_IN_ROOM', 'Musisz być w pokoju');
                return;
            }
            const room = this.gameManager.getRoom(player.roomId);
            if (!room) {
                this.sendError(socket, 'ROOM_NOT_FOUND', 'Pokój nie istnieje');
                return;
            }
            if (room.createdBy !== player.id) {
                this.sendError(socket, 'NOT_ROOM_OWNER', 'Tylko twórca pokoju może dodać AI');
                return;
            }
            if (room.status !== 'waiting') {
                this.sendError(socket, 'GAME_IN_PROGRESS', 'Nie można dodać AI podczas gry');
                return;
            }
            if (room.players.length >= room.maxPlayers) {
                this.sendError(socket, 'ROOM_FULL', 'Pokój jest pełny');
                return;
            }
            // Rate limiting
            if (!checkRateLimit(player.id, 'add_ai', this.rateLimits)) {
                this.sendError(socket, 'RATE_LIMIT', 'Zbyt częste dodawanie AI');
                return;
            }
            const success = this.gameManager.addAIPlayer(player.roomId, data.aiName, data.difficulty);
            if (!success) {
                this.sendError(socket, 'ADD_AI_FAILED', 'Nie można dodać AI gracza');
                return;
            }
            logger.info('AI player added to room', {
                roomId: player.roomId,
                difficulty: data.difficulty,
                hostId: player.id
            });
        }
        catch (error) {
            logger.error('Error adding AI player', { socketId: socket.id, error });
            this.sendError(socket, 'INTERNAL_ERROR', 'Błąd dodania AI gracza');
        }
    }
    /**
     * Obsługuje akcje gracza w grze
     */
    handlePlayerAction(socket, data) {
        try {
            const player = this.lobbyManager.getPlayerBySocket(socket.id);
            if (!player || !player.roomId) {
                this.sendError(socket, 'NOT_IN_GAME', 'Nie jesteś w grze');
                return;
            }
            // Rate limiting dla akcji
            if (!checkRateLimit(player.id, 'player_action', this.rateLimits)) {
                return; // Ignoruj zbyt częste akcje
            }
            const gameInstance = this.gameManager.getGame(player.roomId);
            if (!gameInstance) {
                this.sendError(socket, 'GAME_NOT_FOUND', 'Gra nie istnieje');
                return;
            }
            // Przekształć akcję z formatu network na format game engine
            const actionTypeMapping = {
                'move_units': PlayerActionType.MOVE_UNITS,
                'attack_target': PlayerActionType.ATTACK_TARGET,
                'patrol': PlayerActionType.PATROL,
                'stop': PlayerActionType.STOP,
                'hold_position': PlayerActionType.HOLD_POSITION,
                'gather_resource': PlayerActionType.GATHER_RESOURCE,
                'build_structure': PlayerActionType.BUILD_STRUCTURE,
                'repair': PlayerActionType.REPAIR,
                'train_unit': PlayerActionType.TRAIN_UNIT,
                'cancel_production': PlayerActionType.CANCEL_PRODUCTION,
                'set_rally_point': PlayerActionType.SET_RALLY_POINT,
                'research_technology': PlayerActionType.RESEARCH_TECHNOLOGY,
                'cancel_research': PlayerActionType.CANCEL_RESEARCH
            };
            const gameAction = {
                type: actionTypeMapping[data.action.actionType] || PlayerActionType.MOVE_UNITS,
                playerId: player.id,
                timestamp: Date.now(),
                unitIds: data.action.unitIds,
                targetPosition: data.action.targetPosition,
                targetId: data.action.targetId,
                data: data.action.data
            };
            const success = gameInstance.addPlayerAction(player.id, gameAction);
            if (!success) {
                this.sendError(socket, 'INVALID_ACTION', 'Nieprawidłowa akcja');
            }
        }
        catch (error) {
            logger.error('Error handling player action', { socketId: socket.id, error });
            this.sendError(socket, 'INTERNAL_ERROR', 'Błąd wykonania akcji');
        }
    }
    /**
     * Obsługuje wiadomości czatu
     */
    handleChatMessage(socket, data) {
        try {
            const player = this.lobbyManager.getPlayerBySocket(socket.id);
            if (!player)
                return;
            // Rate limiting dla czatu
            if (!checkRateLimit(player.id, 'chat', this.rateLimits)) {
                this.sendError(socket, 'RATE_LIMIT', 'Zbyt częste wiadomości');
                return;
            }
            const chatMessage = {
                type: ServerMessageType.CHAT_MESSAGE,
                message: data.message.substring(0, 200), // Ogranicz długość
                channel: data.channel,
                timestamp: Date.now(),
                playerId: player.id,
                gameId: player.roomId
            };
            // Wyślij do odpowiedniego kanału
            if (player.roomId && data.channel === 'team') {
                this.sendToRoom(player.roomId, ServerMessageType.CHAT_MESSAGE, chatMessage);
            }
            else if (data.channel === 'all') {
                this.broadcastToLobby(ServerMessageType.CHAT_MESSAGE, chatMessage);
            }
            logger.debug('Chat message sent', {
                playerId: player.id,
                channel: data.channel,
                messageLength: data.message.length
            });
        }
        catch (error) {
            logger.error('Error handling chat message', { socketId: socket.id, error });
        }
    }
    /**
     * Obsługuje żądanie pełnego stanu gry
     */
    handleRequestGameState(socket) {
        const player = this.lobbyManager.getPlayerBySocket(socket.id);
        if (!player || !player.roomId)
            return;
        const gameInstance = this.gameManager.getGame(player.roomId);
        if (!gameInstance)
            return;
        socket.emit(ServerMessageType.GAME_STATE_UPDATE, {
            type: ServerMessageType.GAME_STATE_UPDATE,
            gameState: gameInstance.getGameState(),
            timestamp: Date.now(),
            gameId: player.roomId
        });
    }
    /**
     * Wysyła błąd do socket
     */
    sendError(socket, errorCode, message) {
        socket.emit(ServerMessageType.ERROR, {
            type: ServerMessageType.ERROR,
            errorCode,
            message,
            timestamp: Date.now()
        });
    }
    /**
     * Wysyła wiadomość do konkretnego socket
     */
    sendToSocket(socketId, messageType, data) {
        this.io.to(socketId).emit(messageType, {
            ...data,
            timestamp: Date.now()
        });
    }
    /**
     * Wysyła wiadomość do pokoju
     */
    sendToRoom(roomId, messageType, data) {
        this.io.to(`room_${roomId}`).emit(messageType, {
            ...data,
            timestamp: Date.now()
        });
    }
    /**
     * Wysyła broadcast do lobby
     */
    broadcastToLobby(messageType, data) {
        this.io.to('lobby').emit(messageType, {
            ...data,
            timestamp: Date.now()
        });
    }
    /**
     * Zamyka handler
     */
    shutdown() {
        logger.info('Shutting down SocketHandler...');
        this.rateLimits.clear();
        logger.info('SocketHandler shutdown complete');
    }
}
//# sourceMappingURL=SocketHandler.js.map