import { EventEmitter } from 'eventemitter3';
import { Updatable, Renderable } from '../core/GameLoop';
import { RenderingEngine } from '../rendering/RenderingEngine';
import { InputManager } from '../input/InputManager';
/**
 * Abstrakcyjna klasa bazowa dla scen
 */
export declare abstract class Scene implements Updatable, Renderable {
    readonly name: string;
    isActive: boolean;
    isVisible: boolean;
    isPaused: boolean;
    protected sceneManager: SceneManager;
    protected renderer: RenderingEngine;
    protected input: InputManager;
    constructor(name: string, sceneManager: SceneManager, renderer: RenderingEngine, input: InputManager);
    /**
     * Wywoływane gdy scena jest aktywowana
     */
    abstract onEnter(): void;
    /**
     * Wywoływane gdy scena jest dezaktywowana
     */
    abstract onExit(): void;
    /**
     * Aktualizacja sceny
     */
    abstract update(deltaTime: number): void;
    /**
     * Renderowanie sceny
     */
    abstract render(deltaTime: number): void;
    /**
     * Wywoływane przy zmianie rozmiaru ekranu
     */
    onResize(width: number, height: number): void;
    /**
     * Pauzuje scenę
     */
    pause(): void;
    /**
     * Wznawia scenę
     */
    resume(): void;
    /**
     * Sprawdza czy scena jest aktywna
     */
    isSceneActive(): boolean;
    /**
     * Sprawdza czy scena jest widoczna
     */
    isSceneVisible(): boolean;
    /**
     * Ustawia widoczność sceny
     */
    setVisible(visible: boolean): void;
}
/**
 * Typ dla przejścia między scenami
 */
export interface SceneTransition {
    type: 'immediate' | 'fade' | 'slide';
    duration?: number;
    direction?: 'left' | 'right' | 'up' | 'down';
}
/**
 * Manager zarządzający scenami gry
 */
export declare class SceneManager extends EventEmitter {
    private scenes;
    private currentScene;
    private sceneStack;
    private transitionInProgress;
    private transitionData;
    private transitionProgress;
    private transitionDuration;
    private renderer;
    private input;
    constructor(renderer: RenderingEngine, input: InputManager);
    /**
     * Rejestruje nową scenę
     */
    registerScene(scene: Scene): void;
    /**
     * Usuwa scenę z rejestru
     */
    unregisterScene(sceneName: string): void;
    /**
     * Przełącza na wybraną scenę
     */
    switchToScene(sceneName: string, transition?: SceneTransition): Promise<void>;
    /**
     * Odkłada scenę na stos i przełącza na nową
     */
    pushScene(sceneName: string, transition?: SceneTransition): Promise<void>;
    /**
     * Powraca do poprzedniej sceny ze stosu
     */
    popScene(transition?: SceneTransition): Promise<void>;
    /**
     * Aktualizuje aktywną scenę
     */
    update(deltaTime: number): void;
    /**
     * Renderuje wszystkie widoczne sceny
     */
    render(deltaTime: number): void;
    /**
     * Zwraca aktualną scenę
     */
    getCurrentScene(): Scene | null;
    /**
     * Zwraca scenę o podanej nazwie
     */
    getScene(sceneName: string): Scene | null;
    /**
     * Sprawdza czy scena istnieje
     */
    hasScene(sceneName: string): boolean;
    /**
     * Zwraca listę nazw wszystkich zarejestrowanych scen
     */
    getSceneNames(): string[];
    /**
     * Czyści wszystkie sceny
     */
    clear(): void;
    /**
     * Obsługuje zmianę rozmiaru ekranu
     */
    onResize(width: number, height: number): void;
    /**
     * Wykonuje natychmiastowe przełączenie sceny
     */
    private performImmediateSwitch;
    /**
     * Rozpoczyna przejście między scenami
     */
    private startTransition;
    /**
     * Aktualizuje przejście między scenami
     */
    private updateTransition;
    /**
     * Renderuje efekt przejścia
     */
    private renderTransition;
    /**
     * Kończy przejście między scenami
     */
    private completeTransition;
}
//# sourceMappingURL=SceneManager.d.ts.map