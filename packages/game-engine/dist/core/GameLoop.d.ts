import { EventEmitter } from 'eventemitter3';
/**
 * Interfejs dla obiektów, które mogą być aktualizowane w pętli gry
 */
export interface Updatable {
    update(deltaTime: number): void;
}
/**
 * Interfejs dla obiektów, które mogą być renderowane
 */
export interface Renderable {
    render(deltaTime: number): void;
}
/**
 * Opcje konfiguracyjne dla GameLoop
 */
export interface GameLoopOptions {
    targetFPS?: number;
    maxDeltaTime?: number;
    enableFixedTimeStep?: boolean;
    fixedTimeStep?: number;
}
/**
 * Główna pętla gry obsługująca aktualizacje i renderowanie
 */
export declare class GameLoop extends EventEmitter {
    private readonly targetFPS;
    private readonly targetFrameTime;
    private readonly maxDeltaTime;
    private readonly enableFixedTimeStep;
    private readonly fixedTimeStep;
    private isRunning;
    private lastTime;
    private accumulator;
    private frameCount;
    private fpsTimer;
    private currentFPS;
    private readonly updatables;
    private readonly renderables;
    private animationFrameId;
    constructor(options?: GameLoopOptions);
    /**
     * Uruchamia pętlę gry
     */
    start(): void;
    /**
     * Zatrzymuje pętlę gry
     */
    stop(): void;
    /**
     * Dodaje obiekt do aktualizacji
     */
    addUpdatable(updatable: Updatable): void;
    /**
     * Usuwa obiekt z aktualizacji
     */
    removeUpdatable(updatable: Updatable): void;
    /**
     * Dodaje obiekt do renderowania
     */
    addRenderable(renderable: Renderable): void;
    /**
     * Usuwa obiekt z renderowania
     */
    removeRenderable(renderable: Renderable): void;
    /**
     * Zwraca aktualny FPS
     */
    getFPS(): number;
    /**
     * Sprawdza czy pętla działa
     */
    get running(): boolean;
    /**
     * Główna pętla gry
     */
    private loop;
    /**
     * Pętla z ustalonym krokiem czasowym
     */
    private fixedTimeStepLoop;
    /**
     * Pętla ze zmiennym krokiem czasowym
     */
    private variableTimeStepLoop;
    /**
     * Aktualizuje wszystkie obiekty
     */
    private updateObjects;
    /**
     * Renderuje wszystkie obiekty
     */
    private renderObjects;
    /**
     * Czyści wszystkie zarejestrowane obiekty
     */
    clear(): void;
    /**
     * Zwraca liczbę zarejestrowanych obiektów do aktualizacji
     */
    getUpdatablesCount(): number;
    /**
     * Zwraca liczbę zarejestrowanych obiektów do renderowania
     */
    getRenderablesCount(): number;
    /**
     * Ustawia nowy target FPS (tylko dla trybu z ustalonym krokiem)
     */
    setTargetFPS(fps: number): void;
}
//# sourceMappingURL=GameLoop.d.ts.map