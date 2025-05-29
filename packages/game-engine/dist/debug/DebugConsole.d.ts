import { EventEmitter } from 'eventemitter3';
import { Vector2 } from '../math/Vector2';
/**
 * Poziomy logowania
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
/**
 * Wpis w konsoli debug
 */
export interface DebugLogEntry {
    timestamp: number;
    level: LogLevel;
    category: string;
    message: string;
    data?: any;
}
/**
 * Metryki wydajności
 */
export interface PerformanceMetrics {
    fps: number;
    frameTime: number;
    updateTime: number;
    renderTime: number;
    entityCount: number;
    systemCount: number;
    memoryUsage?: number;
}
/**
 * Konsola debug dla silnika gry
 */
export declare class DebugConsole extends EventEmitter {
    private logs;
    private maxLogs;
    private currentLogLevel;
    private isVisible;
    private canvas;
    private overlayElement;
    private metrics;
    private commands;
    private watchedVariables;
    private visualDebugItems;
    constructor();
    /**
     * Inicjalizuje konsolę debug
     */
    initialize(canvas: HTMLCanvasElement): void;
    /**
     * Loguje wiadomość
     */
    log(level: LogLevel, category: string, message: string, data?: any): void;
    /**
     * Metody skrócone do logowania
     */
    debug(category: string, message: string, data?: any): void;
    info(category: string, message: string, data?: any): void;
    warn(category: string, message: string, data?: any): void;
    error(category: string, message: string, data?: any): void;
    /**
     * Aktualizuje metryki wydajności
     */
    updateMetrics(metrics: Partial<PerformanceMetrics>): void;
    /**
     * Dodaje wizualny element debug do renderowania
     */
    drawDebugPoint(position: Vector2, color?: string, duration?: number): void;
    drawDebugLine(start: Vector2, end: Vector2, color?: string, duration?: number): void;
    drawDebugRect(position: Vector2, width: number, height: number, color?: string, duration?: number): void;
    drawDebugCircle(center: Vector2, radius: number, color?: string, duration?: number): void;
    drawDebugText(position: Vector2, text: string, color?: string, duration?: number): void;
    /**
     * Renderuje wizualne elementy debug
     */
    renderDebugVisuals(ctx: CanvasRenderingContext2D): void;
    /**
     * Dodaje komendę debug
     */
    addCommand(name: string, handler: (args: string[]) => void): void;
    /**
     * Wykonuje komendę debug
     */
    executeCommand(commandLine: string): void;
    /**
     * Dodaje zmienną do obserwowania
     */
    watchVariable(name: string, getter: () => any): void;
    /**
     * Usuwa zmienną z obserwowania
     */
    unwatchVariable(name: string): void;
    /**
     * Przełącza widoczność konsoli
     */
    toggle(): void;
    /**
     * Czyści logi
     */
    clear(): void;
    /**
     * Czyści wizualne elementy debug
     */
    clearVisuals(): void;
    /**
     * Zwraca kopię logów
     */
    getLogs(): DebugLogEntry[];
    /**
     * Zwraca aktualne metryki
     */
    getMetrics(): PerformanceMetrics;
    /**
     * Konfiguruje domyślne komendy
     */
    private setupDefaultCommands;
    /**
     * Konfiguruje skróty klawiszowe
     */
    private setupKeyboardShortcuts;
    /**
     * Tworzy element overlay dla konsoli
     */
    private createOverlayElement;
    /**
     * Aktualizuje zawartość overlay
     */
    private updateOverlay;
    /**
     * Niszczy konsolę debug
     */
    destroy(): void;
}
//# sourceMappingURL=DebugConsole.d.ts.map