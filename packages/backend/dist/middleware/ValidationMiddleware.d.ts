/**
 * Validation Middleware dla Socket.IO
 */
import { Socket } from 'socket.io';
/**
 * Middleware walidacji dla Socket.IO
 */
export declare class ValidationMiddleware {
    /**
     * Middleware walidacji Socket.IO
     */
    static socketValidation(socket: Socket, next: (err?: Error) => void): void;
    /**
     * Waliduje wiadomość przychodzącą
     */
    static validateIncomingMessage(socket: Socket, messageType: string, data: any): boolean;
    /**
     * Waliduje wiadomość według typu
     */
    private static validateMessageByType;
    /**
     * Waliduje JOIN_LOBBY message
     */
    private static validateJoinLobby;
    /**
     * Waliduje CREATE_ROOM message
     */
    private static validateCreateRoom;
    /**
     * Waliduje JOIN_ROOM message
     */
    private static validateJoinRoom;
    /**
     * Waliduje PLAYER_ACTION message
     */
    private static validatePlayerAction;
    /**
     * Waliduje CHAT_MESSAGE
     */
    private static validateChatMessage;
    /**
     * Sprawdza czy wiadomość to spam
     */
    private static isSpamMessage;
    /**
     * Sanityzuje dane przychodzące
     */
    private static sanitizeIncomingData;
    /**
     * Sanityzuje dane wychodzące
     */
    private static sanitizeOutgoingData;
    /**
     * Wysyła błąd walidacji do klienta
     */
    private static sendValidationError;
    /**
     * Sprawdza czy socket może wysłać wiadomość (rate limiting)
     */
    static canSocketSendMessage(socket: Socket, messageType: string): boolean;
    /**
     * Waliduje strukture game settings
     */
    static validateGameSettings(settings: any): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Czyszczenie cache walidacji
     */
    static cleanup(): void;
}
//# sourceMappingURL=ValidationMiddleware.d.ts.map