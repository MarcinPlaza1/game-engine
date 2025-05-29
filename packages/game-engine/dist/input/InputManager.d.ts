import { EventEmitter } from 'eventemitter3';
import { Vector2 } from '../math/Vector2';
/**
 * Enum dla przycisków myszy
 */
export declare enum MouseButton {
    LEFT = 0,
    MIDDLE = 1,
    RIGHT = 2
}
/**
 * Interfejs dla stanu klawisza/przycisku
 */
export interface InputState {
    isPressed: boolean;
    isDown: boolean;
    isReleased: boolean;
    timePressed: number;
}
/**
 * Interfejs dla zdarzenia myszy
 */
export interface CustomMouseEvent {
    position: Vector2;
    button: MouseButton;
    deltaX: number;
    deltaY: number;
    wheelDelta: number;
}
/**
 * Manager obsługujący wszystkie rodzaje wejścia (klawiatura, mysz)
 */
export declare class InputManager extends EventEmitter {
    private readonly canvas;
    private readonly keyStates;
    private readonly mouseStates;
    private mousePosition;
    private lastMousePosition;
    private mouseDelta;
    private wheelDelta;
    private isEnabled;
    private preventDefault;
    constructor(canvas: HTMLCanvasElement);
    /**
     * Konfiguruje nasłuchiwanie zdarzeń
     */
    private setupEventListeners;
    /**
     * Usuwa nasłuchiwanie zdarzeń
     */
    destroy(): void;
    /**
     * Aktualizuje stan wszystkich klawiszy i przycisków
     */
    update(): void;
    /**
     * Sprawdza czy klawisz jest wciśnięty (w tym momencie)
     */
    isKeyPressed(key: string): boolean;
    /**
     * Sprawdza czy klawisz jest trzymany
     */
    isKeyDown(key: string): boolean;
    /**
     * Sprawdza czy klawisz został puszczony (w tym momencie)
     */
    isKeyReleased(key: string): boolean;
    /**
     * Zwraca czas przez jaki klawisz jest trzymany (w ms)
     */
    getKeyHoldTime(key: string): number;
    /**
     * Sprawdza czy przycisk myszy jest wciśnięty (w tym momencie)
     */
    isMousePressed(button?: MouseButton): boolean;
    /**
     * Sprawdza czy przycisk myszy jest trzymany
     */
    isMouseDown(button?: MouseButton): boolean;
    /**
     * Sprawdza czy przycisk myszy został puszczony (w tym momencie)
     */
    isMouseReleased(button?: MouseButton): boolean;
    /**
     * Zwraca aktualną pozycję myszy
     */
    getMousePosition(): Vector2;
    /**
     * Zwraca ruch myszy od ostatniej klatki
     */
    getMouseDelta(): Vector2;
    /**
     * Zwraca wartość kółka myszy
     */
    getWheelDelta(): number;
    /**
     * Sprawdza czy wszystkie klawisz w kombinacji są wciśnięte
     */
    areKeysDown(keys: string[]): boolean;
    /**
     * Sprawdza czy którykolwiek z klawiszy jest wciśnięty
     */
    isAnyKeyDown(keys: string[]): boolean;
    /**
     * Włącza/wyłącza InputManager
     */
    setEnabled(enabled: boolean): void;
    /**
     * Czyści wszystkie stany klawiszy i przycisków
     */
    clearAllStates(): void;
    /**
     * Ustawia czy preventDefault ma być wywoływane
     */
    setPreventDefault(prevent: boolean): void;
    private onKeyDown;
    private onKeyUp;
    private onMouseDown;
    private onMouseUp;
    private onMouseMove;
    private onWheel;
    private onContextMenu;
    private onBlur;
    /**
     * Aktualizuje pozycję myszy względem canvas
     */
    private updateMousePosition;
    /**
     * Tworzy obiekt danych zdarzenia myszy
     */
    private getMouseEventData;
}
//# sourceMappingURL=InputManager.d.ts.map