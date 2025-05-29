/**
 * Auth Middleware dla Socket.IO
 */

import { Socket } from 'socket.io';
import { logger } from '../utils/Logger.js';

/**
 * Podstawowy auth middleware dla Socket.IO
 * W przyszłości można rozszerzyć o JWT, OAuth itp.
 */
export class AuthMiddleware {
  /**
   * Middleware autoryzacji dla Socket.IO
   */
  static socketAuth(socket: Socket, next: (err?: Error) => void): void {
    try {
      // Sprawdź basic headers
      const handshake = socket.handshake;
      
      // Sprawdź User-Agent (blokuj boty)
      const userAgent = handshake.headers['user-agent'];
      if (!userAgent || AuthMiddleware.isSuspiciousUserAgent(userAgent)) {
        logger.warn('Suspicious user agent blocked', { 
          socketId: socket.id, 
          userAgent,
          ip: handshake.address 
        });
        return next(new Error('Unauthorized'));
      }

      // Sprawdź origin (CORS na poziomie Socket.IO)
      const origin = handshake.headers.origin;
      if (origin && !AuthMiddleware.isAllowedOrigin(origin)) {
        logger.warn('Disallowed origin blocked', { 
          socketId: socket.id, 
          origin,
          ip: handshake.address 
        });
        return next(new Error('Forbidden origin'));
      }

      // Rate limiting na podstawie IP
      if (!AuthMiddleware.checkIPRateLimit(handshake.address)) {
        logger.warn('IP rate limit exceeded', { 
          socketId: socket.id, 
          ip: handshake.address 
        });
        return next(new Error('Rate limit exceeded'));
      }

      // Sprawdź czy IP nie jest na blackliście
      if (AuthMiddleware.isIPBlacklisted(handshake.address)) {
        logger.warn('Blacklisted IP blocked', { 
          socketId: socket.id, 
          ip: handshake.address 
        });
        return next(new Error('IP blacklisted'));
      }

      // W przyszłości: sprawdź JWT token
      const token = handshake.auth?.token || handshake.headers?.authorization;
      if (token) {
        // TODO: Implementacja JWT validation
        // const user = await validateJWT(token);
        // socket.data.user = user;
      }

      logger.debug('Socket auth passed', { 
        socketId: socket.id, 
        ip: handshake.address,
        userAgent: userAgent?.substring(0, 100) 
      });

      next(); // Auth OK

    } catch (error) {
      logger.error('Auth middleware error', { 
        socketId: socket.id, 
        error: error instanceof Error ? error.message : String(error)
      });
      next(new Error('Authentication failed'));
    }
  }

  /**
   * Sprawdza czy User-Agent jest podejrzany
   */
  private static isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /perl/i,
      /php/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Sprawdza czy origin jest dozwolony
   */
  private static isAllowedOrigin(origin: string): boolean {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080',
      'https://localhost:3000',
      'https://localhost:5173'
    ];

    // W production dodaj prawdziwe domeny
    if (process.env.NODE_ENV === 'production') {
      // allowedOrigins.push('https://yourdomain.com');
    }

    return allowedOrigins.includes(origin);
  }

  // Rate limiting per IP
  private static ipConnections: Map<string, { count: number; lastReset: number }> = new Map();
  private static readonly MAX_CONNECTIONS_PER_IP = 10;
  private static readonly RATE_LIMIT_WINDOW = 60000; // 1 minuta

  /**
   * Sprawdza rate limiting per IP
   */
  private static checkIPRateLimit(ip: string): boolean {
    const now = Date.now();
    const ipData = AuthMiddleware.ipConnections.get(ip);

    if (!ipData) {
      AuthMiddleware.ipConnections.set(ip, { count: 1, lastReset: now });
      return true;
    }

    // Reset count po window
    if (now - ipData.lastReset > AuthMiddleware.RATE_LIMIT_WINDOW) {
      ipData.count = 1;
      ipData.lastReset = now;
      return true;
    }

    // Sprawdź limit
    if (ipData.count >= AuthMiddleware.MAX_CONNECTIONS_PER_IP) {
      return false;
    }

    ipData.count++;
    return true;
  }

  // Blacklisted IPs
  private static blacklistedIPs: Set<string> = new Set([
    // Dodaj problematyczne IP tutaj
  ]);

  /**
   * Sprawdza czy IP jest na blackliście
   */
  private static isIPBlacklisted(ip: string): boolean {
    return AuthMiddleware.blacklistedIPs.has(ip);
  }

  /**
   * Dodaje IP do blacklisty
   */
  static blacklistIP(ip: string): void {
    AuthMiddleware.blacklistedIPs.add(ip);
    logger.info('IP blacklisted', { ip });
  }

  /**
   * Usuwa IP z blacklisty
   */
  static unblacklistIP(ip: string): void {
    AuthMiddleware.blacklistedIPs.delete(ip);
    logger.info('IP unblacklisted', { ip });
  }

  /**
   * Czyszczenie starych rekordów rate limiting
   */
  static cleanup(): void {
    const now = Date.now();
    for (const [ip, data] of AuthMiddleware.ipConnections.entries()) {
      if (now - data.lastReset > AuthMiddleware.RATE_LIMIT_WINDOW * 2) {
        AuthMiddleware.ipConnections.delete(ip);
      }
    }
  }

  /**
   * Middleware dla Express routes (opcjonalne)
   */
  static expressAuth(req: any, res: any, next: any): void {
    // Basic auth dla API endpoints
    const apiKey = req.headers['x-api-key'];
    
    if (req.path.startsWith('/api/admin')) {
      // Admin endpoints wymagają klucza
      if (!apiKey || !AuthMiddleware.isValidAPIKey(apiKey)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    next();
  }

  /**
   * Sprawdza czy API key jest prawidłowy
   */
  private static isValidAPIKey(apiKey: string): boolean {
    const validKeys = [
      process.env.ADMIN_API_KEY,
      process.env.MONITORING_API_KEY
    ].filter(Boolean);

    return validKeys.includes(apiKey);
  }

  /**
   * Generuje bezpieczny token sesji
   */
  static generateSessionToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Hash hasła (jeśli będzie potrzebne w przyszłości)
   */
  static async hashPassword(password: string): Promise<string> {
    // TODO: Implementacja bcrypt lub podobnej biblioteki
    return password; // Placeholder
  }

  /**
   * Weryfikacja hasła
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    // TODO: Implementacja bcrypt verification
    return password === hash; // Placeholder
  }
} 