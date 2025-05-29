import { EventEmitter } from 'eventemitter3';
import { GameLoop, GameLoopOptions } from './GameLoop';
import { RenderingEngine, RendererConfig } from '../rendering/RenderingEngine';
import { InputManager } from '../input/InputManager';
import { SceneManager, Scene } from '../scene/SceneManager';
/**
 * Konfiguracja silnika gry
 */
export interface GameEngineConfig {
    canvasId?: string;
    canvas?: HTMLCanvasElement;
    renderer: RendererConfig;
    gameLoop?: GameLoopOptions;
    enableInput?: boolean;
    enableDebug?: boolean;
}
/**
 * Statystyki działania silnika
 */
export interface EngineStats {
    fps: number;
    frameTime: number;
    updateTime: number;
    renderTime: number;
    memoryUsage?: number;
}
/**
 * Główny silnik gry łączący wszystkie komponenty
 */
export declare class GameEngine extends EventEmitter {
    private gameLoop;
    private renderer;
    private input;
    private sceneManager;
    private canvas;
    private canvasContainer;
    private isInitialized;
    private isRunning;
    private isPaused;
    private config;
    private debugMode;
    private stats;
    private lastUpdateStart;
    private lastRenderStart;
    constructor(config: GameEngineConfig);
    /**
     * Konfiguruje canvas
     */
    private setupCanvas;
    /**
     * Inicjalizuje wszystkie komponenty silnika
     */
    private initializeComponents;
    /**
     * Konfiguruje nasłuchiwanie zdarzeń
     */
    private setupEventListeners;
    /**
     * Uruchamia silnik gry
     */
    start(): void;
    /**
     * Zatrzymuje silnik gry
     */
    stop(): void;
    /**
     * Pauzuje silnik gry
     */
    pause(): void;
    /**
     * Wznawia działanie silnika
     */
    resume(): void;
    /**
     * Aktualizacja silnika (wywoływana przez GameLoop)
     */
    update(deltaTime: number): void;
    /**
     * Renderowanie silnika (wywoływane przez GameLoop)
     */
    render(deltaTime: number): void;
    /**
     * Zwraca renderer
     */
    getRenderer(): RenderingEngine;
    /**
     * Zwraca input manager
     */
    getInputManager(): InputManager;
    /**
     * Zwraca scene manager
     */
    getSceneManager(): SceneManager;
    /**
     * Zwraca game loop
     */
    getGameLoop(): GameLoop;
    /**
     * Zwraca canvas
     */
    getCanvas(): HTMLCanvasElement;
    /**
     * Rejestruje scenę
     */
    registerScene(scene: Scene): void;
    /**
     * Przełącza na scenę
     */
    switchToScene(sceneName: string): Promise<void>;
    /**
     * Zwraca aktualną scenę
     */
    getCurrentScene(): Scene | null;
    /**
     * Ustawia tryb debug
     */
    setDebugMode(enabled: boolean): void;
    /**
     * Zwraca statystyki wydajności
     */
    getStats(): EngineStats;
    /**
     * Zmienia rozmiar silnika
     */
    resize(width: number, height: number): void;
    /**
     * Ustawia kolor tła
     */
    setBackgroundColor(color: string): void;
    /**
     * Sprawdza czy silnik jest zainicjalizowany
     */
    get initialized(): boolean;
    /**
     * Sprawdza czy silnik działa
     */
    get running(): boolean;
    /**
     * Sprawdza czy silnik jest spauzowany
     */
    get paused(): boolean;
    /**
     * Zwraca aktualny FPS
     */
    get fps(): number;
    /**
     * Niszczy silnik i czyści zasoby
     */
    destroy(): void;
    private onWindowResize;
    private onWindowFocus;
    private onWindowBlur;
    /**
     * Tworzy zrzut ekranu
     */
    takeScreenshot(format?: string): string;
    /**
     * Ustawia kursor myszy
     */
    setCursor(cursor: string): void;
    /**
     * Włącza pełny ekran
     */
    enableFullscreen(): Promise<void>;
    /**
     * Wyłącza pełny ekran
     */
    exitFullscreen(): Promise<void>;
    /**
     * Sprawdza czy jest pełny ekran
     */
    get isFullscreen(): boolean;
}
//# sourceMappingURL=GameEngine.d.ts.map