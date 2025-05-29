/**
 * Auth Middleware dla Socket.IO
 */
import { Socket } from 'socket.io';
/**
 * Podstawowy auth middleware dla Socket.IO
 * W przyszłości można rozszerzyć o JWT, OAuth itp.
 */
export declare class AuthMiddleware {
    /**
     * Middleware autoryzacji dla Socket.IO
     */
    static socketAuth(socket: Socket, next: (err?: Error) => void): void;
    /**
     * Sprawdza czy User-Agent jest podejrzany
     */
    private static isSuspiciousUserAgent;
    /**
     * Sprawdza czy origin jest dozwolony
     */
    private static isAllowedOrigin;
    private static ipConnections;
    private static readonly MAX_CONNECTIONS_PER_IP;
    private static readonly RATE_LIMIT_WINDOW;
    /**
     * Sprawdza rate limiting per IP
     */
    private static checkIPRateLimit;
    private static blacklistedIPs;
    /**
     * Sprawdza czy IP jest na blackliście
     */
    private static isIPBlacklisted;
    /**
     * Dodaje IP do blacklisty
     */
    static blacklistIP(ip: string): void;
    /**
     * Usuwa IP z blacklisty
     */
    static unblacklistIP(ip: string): void;
    /**
     * Czyszczenie starych rekordów rate limiting
     */
    static cleanup(): void;
    /**
     * Middleware dla Express routes (opcjonalne)
     */
    static expressAuth(req: any, res: any, next: any): void;
    /**
     * Sprawdza czy API key jest prawidłowy
     */
    private static isValidAPIKey;
    /**
     * Generuje bezpieczny token sesji
     */
    static generateSessionToken(): string;
    /**
     * Hash hasła (jeśli będzie potrzebne w przyszłości)
     */
    static hashPassword(password: string): Promise<string>;
    /**
     * Weryfikacja hasła
     */
    static verifyPassword(password: string, hash: string): Promise<boolean>;
}
//# sourceMappingURL=AuthMiddleware.d.ts.map