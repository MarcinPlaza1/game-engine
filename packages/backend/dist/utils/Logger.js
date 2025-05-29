/**
 * Logger dla serwera RTS
 */
import winston from 'winston';
/**
 * Konfiguruje i eksportuje logger
 */
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }), winston.format.errors({ stack: true }), winston.format.json()),
    defaultMeta: {
        service: 'rts-server',
        version: '1.2.0'
    },
    transports: [
        // Plik błędów
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // Plik kombinowany
        new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});
// W development mode dodaj console output
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), winston.format.simple(), winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
            let metaString = '';
            if (Object.keys(meta).length > 0) {
                metaString = ' ' + JSON.stringify(meta);
            }
            return `${timestamp} [${service}] ${level}: ${message}${metaString}`;
        }))
    }));
}
// Tworzenie katalogu logs jeśli nie istnieje
import fs from 'fs';
import path from 'path';
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}
export { logger };
//# sourceMappingURL=Logger.js.map