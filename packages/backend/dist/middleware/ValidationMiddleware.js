/**
 * Validation Middleware dla Socket.IO
 */
import { ClientMessageType, validatePlayerName, validateGameId, sanitizeString } from '@rts-engine/shared';
import { logger } from '../utils/Logger';
/**
 * Middleware walidacji dla Socket.IO
 */
export class ValidationMiddleware {
    /**
     * Middleware walidacji Socket.IO
     */
    static socketValidation(socket, next) {
        try {
            // Sprawdź podstawowe wymagania połączenia
            const handshake = socket.handshake;
            // Sprawdź czy socket ma wymagane headers
            if (!handshake.headers['user-agent']) {
                logger.warn('Socket missing user-agent', { socketId: socket.id });
                return next(new Error('Invalid connection'));
            }
            // Sprawdź długość socket ID
            if (!socket.id || socket.id.length < 10 || socket.id.length > 50) {
                logger.warn('Invalid socket ID format', { socketId: socket.id });
                return next(new Error('Invalid socket ID'));
            }
            // Dodaj proxy handler dla wszystkich eventów
            const originalEmit = socket.emit;
            socket.emit = function (event, ...args) {
                // Waliduj wychodzące wiadomości
                if (args.length > 0 && typeof args[0] === 'object') {
                    ValidationMiddleware.sanitizeOutgoingData(args[0]);
                }
                return originalEmit.apply(this, [event, ...args]);
            };
            logger.debug('Socket validation passed', { socketId: socket.id });
            next();
        }
        catch (error) {
            logger.error('Validation middleware error', {
                socketId: socket.id,
                error: error instanceof Error ? error.message : String(error)
            });
            next(new Error('Validation failed'));
        }
    }
    /**
     * Waliduje wiadomość przychodzącą
     */
    static validateIncomingMessage(socket, messageType, data) {
        try {
            // Sprawdź czy typ wiadomości jest dozwolony
            if (!Object.values(ClientMessageType).includes(messageType)) {
                logger.warn('Unknown message type', {
                    socketId: socket.id,
                    messageType
                });
                ValidationMiddleware.sendValidationError(socket, 'UNKNOWN_MESSAGE_TYPE', 'Nieznany typ wiadomości');
                return false;
            }
            // Sprawdź rozmiar wiadomości
            const messageSize = JSON.stringify(data).length;
            if (messageSize > 10240) { // 10KB limit
                logger.warn('Message too large', {
                    socketId: socket.id,
                    messageType,
                    size: messageSize
                });
                ValidationMiddleware.sendValidationError(socket, 'MESSAGE_TOO_LARGE', 'Wiadomość zbyt duża');
                return false;
            }
            // Sanityzuj dane
            ValidationMiddleware.sanitizeIncomingData(data);
            // Walidacja specyficzna dla typu wiadomości
            return ValidationMiddleware.validateMessageByType(socket, messageType, data);
        }
        catch (error) {
            logger.error('Message validation error', {
                socketId: socket.id,
                messageType,
                error: error instanceof Error ? error.message : String(error)
            });
            ValidationMiddleware.sendValidationError(socket, 'VALIDATION_ERROR', 'Błąd walidacji');
            return false;
        }
    }
    /**
     * Waliduje wiadomość według typu
     */
    static validateMessageByType(socket, messageType, data) {
        switch (messageType) {
            case ClientMessageType.JOIN_LOBBY:
                return ValidationMiddleware.validateJoinLobby(socket, data);
            case ClientMessageType.CREATE_ROOM:
                return ValidationMiddleware.validateCreateRoom(socket, data);
            case ClientMessageType.JOIN_ROOM:
                return ValidationMiddleware.validateJoinRoom(socket, data);
            case ClientMessageType.PLAYER_ACTION:
                return ValidationMiddleware.validatePlayerAction(socket, data);
            case ClientMessageType.CHAT_MESSAGE:
                return ValidationMiddleware.validateChatMessage(socket, data);
            default:
                return true; // Inne typy przejdą basic validation
        }
    }
    /**
     * Waliduje JOIN_LOBBY message
     */
    static validateJoinLobby(socket, data) {
        if (!data.playerName || typeof data.playerName !== 'string') {
            ValidationMiddleware.sendValidationError(socket, 'INVALID_PLAYER_NAME', 'Nieprawidłowa nazwa gracza');
            return false;
        }
        const nameValidation = validatePlayerName(data.playerName);
        if (!nameValidation.isValid) {
            ValidationMiddleware.sendValidationError(socket, 'INVALID_PLAYER_NAME', nameValidation.errors[0]);
            return false;
        }
        // Sanityzuj nazwę gracza
        data.playerName = sanitizeString(data.playerName, 20);
        return true;
    }
    /**
     * Waliduje CREATE_ROOM message
     */
    static validateCreateRoom(socket, data) {
        if (!data.roomName || typeof data.roomName !== 'string') {
            ValidationMiddleware.sendValidationError(socket, 'INVALID_ROOM_NAME', 'Nieprawidłowa nazwa pokoju');
            return false;
        }
        if (data.roomName.length < 3 || data.roomName.length > 30) {
            ValidationMiddleware.sendValidationError(socket, 'INVALID_ROOM_NAME', 'Nazwa pokoju musi mieć 3-30 znaków');
            return false;
        }
        if (!data.gameSettings || typeof data.gameSettings !== 'object') {
            ValidationMiddleware.sendValidationError(socket, 'INVALID_GAME_SETTINGS', 'Nieprawidłowe ustawienia gry');
            return false;
        }
        // Sanityzuj dane
        data.roomName = sanitizeString(data.roomName, 30);
        if (data.password) {
            data.password = sanitizeString(data.password, 50);
        }
        // Waliduj game settings
        if (data.gameSettings.maxPlayers &&
            (data.gameSettings.maxPlayers < 2 || data.gameSettings.maxPlayers > 8)) {
            ValidationMiddleware.sendValidationError(socket, 'INVALID_MAX_PLAYERS', 'Liczba graczy musi być między 2-8');
            return false;
        }
        return true;
    }
    /**
     * Waliduje JOIN_ROOM message
     */
    static validateJoinRoom(socket, data) {
        if (!data.roomId || typeof data.roomId !== 'string') {
            ValidationMiddleware.sendValidationError(socket, 'INVALID_ROOM_ID', 'Nieprawidłowe ID pokoju');
            return false;
        }
        const idValidation = validateGameId(data.roomId);
        if (!idValidation.isValid) {
            ValidationMiddleware.sendValidationError(socket, 'INVALID_ROOM_ID', 'Nieprawidłowe ID pokoju');
            return false;
        }
        if (data.password) {
            data.password = sanitizeString(data.password, 50);
        }
        return true;
    }
    /**
     * Waliduje PLAYER_ACTION message
     */
    static validatePlayerAction(socket, data) {
        if (!data.action || typeof data.action !== 'object') {
            ValidationMiddleware.sendValidationError(socket, 'INVALID_ACTION', 'Nieprawidłowa akcja');
            return false;
        }
        const action = data.action;
        // Sprawdź typ akcji
        if (!action.actionType || typeof action.actionType !== 'string') {
            ValidationMiddleware.sendValidationError(socket, 'INVALID_ACTION_TYPE', 'Nieprawidłowy typ akcji');
            return false;
        }
        // Waliduj unit IDs jeśli istnieją
        if (action.unitIds && Array.isArray(action.unitIds)) {
            if (action.unitIds.length > 50) { // Max 50 jednostek na raz
                ValidationMiddleware.sendValidationError(socket, 'TOO_MANY_UNITS', 'Zbyt wiele jednostek');
                return false;
            }
            for (const unitId of action.unitIds) {
                if (typeof unitId !== 'string' || unitId.length > 20) {
                    ValidationMiddleware.sendValidationError(socket, 'INVALID_UNIT_ID', 'Nieprawidłowe ID jednostki');
                    return false;
                }
            }
        }
        // Waliduj pozycję celu
        if (action.targetPosition) {
            if (typeof action.targetPosition.x !== 'number' ||
                typeof action.targetPosition.y !== 'number') {
                ValidationMiddleware.sendValidationError(socket, 'INVALID_POSITION', 'Nieprawidłowa pozycja');
                return false;
            }
            // Sprawdź rozsądne granice mapy
            if (action.targetPosition.x < -1000 || action.targetPosition.x > 10000 ||
                action.targetPosition.y < -1000 || action.targetPosition.y > 10000) {
                ValidationMiddleware.sendValidationError(socket, 'POSITION_OUT_OF_BOUNDS', 'Pozycja poza mapą');
                return false;
            }
        }
        return true;
    }
    /**
     * Waliduje CHAT_MESSAGE
     */
    static validateChatMessage(socket, data) {
        if (!data.message || typeof data.message !== 'string') {
            ValidationMiddleware.sendValidationError(socket, 'INVALID_MESSAGE', 'Nieprawidłowa wiadomość');
            return false;
        }
        if (data.message.length === 0) {
            ValidationMiddleware.sendValidationError(socket, 'EMPTY_MESSAGE', 'Pusta wiadomość');
            return false;
        }
        if (data.message.length > 200) {
            ValidationMiddleware.sendValidationError(socket, 'MESSAGE_TOO_LONG', 'Wiadomość zbyt długa');
            return false;
        }
        // Sprawdź czy wiadomość nie zawiera spamu
        if (ValidationMiddleware.isSpamMessage(data.message)) {
            ValidationMiddleware.sendValidationError(socket, 'SPAM_DETECTED', 'Wykryto spam');
            return false;
        }
        // Sanityzuj wiadomość
        data.message = sanitizeString(data.message, 200);
        // Waliduj kanał
        const validChannels = ['all', 'team', 'private'];
        if (data.channel && !validChannels.includes(data.channel)) {
            data.channel = 'all'; // Default fallback
        }
        return true;
    }
    /**
     * Sprawdza czy wiadomość to spam
     */
    static isSpamMessage(message) {
        const spamPatterns = [
            /(.)\1{10,}/, // Powtarzające się znaki
            /http[s]?:\/\//, // URLe
            /discord\.gg/, // Discord invites
            /bit\.ly/, // Shortened URLs
            /free.*money/i, // Spam phrases
            /click.*here/i
        ];
        return spamPatterns.some(pattern => pattern.test(message));
    }
    /**
     * Sanityzuje dane przychodzące
     */
    static sanitizeIncomingData(data) {
        if (typeof data !== 'object' || data === null)
            return;
        for (const key in data) {
            if (typeof data[key] === 'string') {
                // Usuń potencjalnie niebezpieczne znaki
                data[key] = data[key]
                    .replace(/[<>]/g, '') // HTML tags
                    .replace(/javascript:/gi, '') // JavaScript URLs
                    .replace(/on\w+=/gi, '') // Event handlers
                    .trim();
            }
            else if (typeof data[key] === 'object' && data[key] !== null) {
                ValidationMiddleware.sanitizeIncomingData(data[key]);
            }
        }
    }
    /**
     * Sanityzuje dane wychodzące
     */
    static sanitizeOutgoingData(data) {
        if (typeof data !== 'object' || data === null)
            return;
        // Usuń wrażliwe pola przed wysłaniem do klienta
        const sensitiveFields = [
            'password',
            'apiKey',
            'secret',
            'token',
            'hash',
            'internal'
        ];
        for (const field of sensitiveFields) {
            if (data[field]) {
                delete data[field];
            }
        }
        // Rekurencyjnie dla zagnieżdżonych obiektów
        for (const key in data) {
            if (typeof data[key] === 'object' && data[key] !== null) {
                ValidationMiddleware.sanitizeOutgoingData(data[key]);
            }
        }
    }
    /**
     * Wysyła błąd walidacji do klienta
     */
    static sendValidationError(socket, errorCode, message) {
        socket.emit('error', {
            type: 'validation_error',
            errorCode,
            message,
            timestamp: Date.now()
        });
        logger.warn('Validation error sent', {
            socketId: socket.id,
            errorCode,
            message
        });
    }
    /**
     * Sprawdza czy socket może wysłać wiadomość (rate limiting)
     */
    static canSocketSendMessage(socket, messageType) {
        const limits = {
            [ClientMessageType.CHAT_MESSAGE]: 2000, // 2s between chat messages
            [ClientMessageType.PLAYER_ACTION]: 50, // 50ms between actions
            [ClientMessageType.CREATE_ROOM]: 5000, // 5s between room creation
            [ClientMessageType.JOIN_ROOM]: 1000, // 1s between joins
            default: 100 // 100ms default
        };
        const limit = limits[messageType] || limits.default;
        const now = Date.now();
        const lastMessage = socket.lastMessageTime?.[messageType] || 0;
        if (now - lastMessage < limit) {
            ValidationMiddleware.sendValidationError(socket, 'RATE_LIMIT', 'Zbyt częste wysyłanie wiadomości');
            return false;
        }
        // Zapisz czas ostatniej wiadomości
        if (!socket.lastMessageTime) {
            socket.lastMessageTime = {};
        }
        socket.lastMessageTime[messageType] = now;
        return true;
    }
    /**
     * Waliduje strukture game settings
     */
    static validateGameSettings(settings) {
        const errors = [];
        if (!settings || typeof settings !== 'object') {
            errors.push('Game settings must be an object');
            return { isValid: false, errors };
        }
        // Sprawdź wymagane pola
        const requiredFields = ['gameMode', 'maxPlayers', 'victoryConditions'];
        for (const field of requiredFields) {
            if (!(field in settings)) {
                errors.push(`Missing required field: ${field}`);
            }
        }
        // Sprawdź typy i zakresy
        if (settings.maxPlayers &&
            (typeof settings.maxPlayers !== 'number' ||
                settings.maxPlayers < 2 ||
                settings.maxPlayers > 8)) {
            errors.push('maxPlayers must be a number between 2 and 8');
        }
        if (settings.gameSpeed &&
            (typeof settings.gameSpeed !== 'number' ||
                settings.gameSpeed <= 0 ||
                settings.gameSpeed > 10)) {
            errors.push('gameSpeed must be a number between 0.1 and 10');
        }
        return { isValid: errors.length === 0, errors };
    }
    /**
     * Czyszczenie cache walidacji
     */
    static cleanup() {
        // W przyszłości: wyczyść cache rate limiting itp.
        logger.debug('ValidationMiddleware cleanup completed');
    }
}
//# sourceMappingURL=ValidationMiddleware.js.map