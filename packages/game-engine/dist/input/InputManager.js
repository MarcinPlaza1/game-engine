"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputManager = exports.MouseButton = void 0;
const eventemitter3_1 = require("eventemitter3");
const Vector2_1 = require("../math/Vector2");
/**
 * Enum dla przycisków myszy
 */
var MouseButton;
(function (MouseButton) {
    MouseButton[MouseButton["LEFT"] = 0] = "LEFT";
    MouseButton[MouseButton["MIDDLE"] = 1] = "MIDDLE";
    MouseButton[MouseButton["RIGHT"] = 2] = "RIGHT";
})(MouseButton || (exports.MouseButton = MouseButton = {}));
/**
 * Manager obsługujący wszystkie rodzaje wejścia (klawiatura, mysz)
 */
class InputManager extends eventemitter3_1.EventEmitter {
    constructor(canvas) {
        super();
        this.keyStates = new Map();
        this.mouseStates = new Map();
        this.mousePosition = new Vector2_1.Vector2();
        this.lastMousePosition = new Vector2_1.Vector2();
        this.mouseDelta = new Vector2_1.Vector2();
        this.wheelDelta = 0;
        this.isEnabled = true;
        this.preventDefault = true;
        // === OBSŁUGA ZDARZEŃ ===
        this.onKeyDown = (event) => {
            if (!this.isEnabled)
                return;
            const key = event.key.toLowerCase();
            const currentState = this.keyStates.get(key);
            if (!currentState || !currentState.isDown) {
                const newState = {
                    isPressed: true,
                    isDown: true,
                    isReleased: false,
                    timePressed: performance.now()
                };
                this.keyStates.set(key, newState);
                this.emit('keyPressed', key, event);
            }
            if (this.preventDefault) {
                event.preventDefault();
            }
        };
        this.onKeyUp = (event) => {
            if (!this.isEnabled)
                return;
            const key = event.key.toLowerCase();
            const currentState = this.keyStates.get(key);
            if (currentState && currentState.isDown) {
                currentState.isDown = false;
                currentState.isReleased = true;
                currentState.isPressed = false;
                this.emit('keyReleased', key, event);
            }
            if (this.preventDefault) {
                event.preventDefault();
            }
        };
        this.onMouseDown = (event) => {
            if (!this.isEnabled)
                return;
            const button = event.button;
            const currentState = this.mouseStates.get(button);
            if (!currentState || !currentState.isDown) {
                const newState = {
                    isPressed: true,
                    isDown: true,
                    isReleased: false,
                    timePressed: performance.now()
                };
                this.mouseStates.set(button, newState);
                this.emit('mousePressed', button, this.getMouseEventData(event));
            }
            if (this.preventDefault) {
                event.preventDefault();
            }
        };
        this.onMouseUp = (event) => {
            if (!this.isEnabled)
                return;
            const button = event.button;
            const currentState = this.mouseStates.get(button);
            if (currentState && currentState.isDown) {
                currentState.isDown = false;
                currentState.isReleased = true;
                currentState.isPressed = false;
                this.emit('mouseReleased', button, this.getMouseEventData(event));
            }
            if (this.preventDefault) {
                event.preventDefault();
            }
        };
        this.onMouseMove = (event) => {
            if (!this.isEnabled)
                return;
            this.lastMousePosition.set(this.mousePosition.x, this.mousePosition.y);
            this.updateMousePosition(event);
            this.mouseDelta.set(this.mousePosition.x - this.lastMousePosition.x, this.mousePosition.y - this.lastMousePosition.y);
            this.emit('mouseMove', this.getMouseEventData(event));
        };
        this.onWheel = (event) => {
            if (!this.isEnabled)
                return;
            this.wheelDelta = event.deltaY;
            this.emit('mouseWheel', this.wheelDelta, this.getMouseEventData(event));
            if (this.preventDefault) {
                event.preventDefault();
            }
        };
        this.onContextMenu = (event) => {
            if (this.preventDefault) {
                event.preventDefault();
            }
        };
        this.onBlur = () => {
            // Czyszczenie stanów przy utracie fokusa
            this.clearAllStates();
        };
        this.canvas = canvas;
        this.setupEventListeners();
    }
    /**
     * Konfiguruje nasłuchiwanie zdarzeń
     */
    setupEventListeners() {
        // Zdarzenia klawiatury
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        // Zdarzenia myszy
        this.canvas.addEventListener('mousedown', this.onMouseDown);
        this.canvas.addEventListener('mouseup', this.onMouseUp);
        this.canvas.addEventListener('mousemove', this.onMouseMove);
        this.canvas.addEventListener('wheel', this.onWheel);
        this.canvas.addEventListener('contextmenu', this.onContextMenu);
        // Utrata fokusa
        window.addEventListener('blur', this.onBlur);
        // Zapobieganie przeciąganiu obrazków
        this.canvas.addEventListener('dragstart', (e) => e.preventDefault());
    }
    /**
     * Usuwa nasłuchiwanie zdarzeń
     */
    destroy() {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        this.canvas.removeEventListener('mousedown', this.onMouseDown);
        this.canvas.removeEventListener('mouseup', this.onMouseUp);
        this.canvas.removeEventListener('mousemove', this.onMouseMove);
        this.canvas.removeEventListener('wheel', this.onWheel);
        this.canvas.removeEventListener('contextmenu', this.onContextMenu);
        window.removeEventListener('blur', this.onBlur);
    }
    /**
     * Aktualizuje stan wszystkich klawiszy i przycisków
     */
    update() {
        if (!this.isEnabled)
            return;
        // Aktualizacja stanów klawiszy
        for (const [key, state] of this.keyStates) {
            state.isPressed = false;
            state.isReleased = false;
        }
        // Aktualizacja stanów myszy
        for (const [button, state] of this.mouseStates) {
            state.isPressed = false;
            state.isReleased = false;
        }
        // Reset delta myszy i kółka
        this.mouseDelta.set(0, 0);
        this.wheelDelta = 0;
    }
    // === OBSŁUGA KLAWIATURY ===
    /**
     * Sprawdza czy klawisz jest wciśnięty (w tym momencie)
     */
    isKeyPressed(key) {
        return this.keyStates.get(key.toLowerCase())?.isPressed || false;
    }
    /**
     * Sprawdza czy klawisz jest trzymany
     */
    isKeyDown(key) {
        return this.keyStates.get(key.toLowerCase())?.isDown || false;
    }
    /**
     * Sprawdza czy klawisz został puszczony (w tym momencie)
     */
    isKeyReleased(key) {
        return this.keyStates.get(key.toLowerCase())?.isReleased || false;
    }
    /**
     * Zwraca czas przez jaki klawisz jest trzymany (w ms)
     */
    getKeyHoldTime(key) {
        const state = this.keyStates.get(key.toLowerCase());
        if (!state || !state.isDown)
            return 0;
        return performance.now() - state.timePressed;
    }
    // === OBSŁUGA MYSZY ===
    /**
     * Sprawdza czy przycisk myszy jest wciśnięty (w tym momencie)
     */
    isMousePressed(button = MouseButton.LEFT) {
        return this.mouseStates.get(button)?.isPressed || false;
    }
    /**
     * Sprawdza czy przycisk myszy jest trzymany
     */
    isMouseDown(button = MouseButton.LEFT) {
        return this.mouseStates.get(button)?.isDown || false;
    }
    /**
     * Sprawdza czy przycisk myszy został puszczony (w tym momencie)
     */
    isMouseReleased(button = MouseButton.LEFT) {
        return this.mouseStates.get(button)?.isReleased || false;
    }
    /**
     * Zwraca aktualną pozycję myszy
     */
    getMousePosition() {
        return this.mousePosition.clone();
    }
    /**
     * Zwraca ruch myszy od ostatniej klatki
     */
    getMouseDelta() {
        return this.mouseDelta.clone();
    }
    /**
     * Zwraca wartość kółka myszy
     */
    getWheelDelta() {
        return this.wheelDelta;
    }
    // === OBSŁUGA KOMBINACJI KLAWISZY ===
    /**
     * Sprawdza czy wszystkie klawisz w kombinacji są wciśnięte
     */
    areKeysDown(keys) {
        return keys.every(key => this.isKeyDown(key));
    }
    /**
     * Sprawdza czy którykolwiek z klawiszy jest wciśnięty
     */
    isAnyKeyDown(keys) {
        return keys.some(key => this.isKeyDown(key));
    }
    // === ZARZĄDZANIE STANEM ===
    /**
     * Włącza/wyłącza InputManager
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.clearAllStates();
        }
    }
    /**
     * Czyści wszystkie stany klawiszy i przycisków
     */
    clearAllStates() {
        this.keyStates.clear();
        this.mouseStates.clear();
        this.mouseDelta.set(0, 0);
        this.wheelDelta = 0;
    }
    /**
     * Ustawia czy preventDefault ma być wywoływane
     */
    setPreventDefault(prevent) {
        this.preventDefault = prevent;
    }
    /**
     * Aktualizuje pozycję myszy względem canvas
     */
    updateMousePosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePosition.set(event.clientX - rect.left, event.clientY - rect.top);
    }
    /**
     * Tworzy obiekt danych zdarzenia myszy
     */
    getMouseEventData(event) {
        return {
            position: this.mousePosition.clone(),
            button: event.button,
            deltaX: this.mouseDelta.x,
            deltaY: this.mouseDelta.y,
            wheelDelta: this.wheelDelta
        };
    }
}
exports.InputManager = InputManager;
//# sourceMappingURL=InputManager.js.map