import { EventEmitter } from 'eventemitter3';
import { Vector2 } from '../math/Vector2';

/**
 * Enum dla przycisków myszy
 */
export enum MouseButton {
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
export class InputManager extends EventEmitter {
  private readonly canvas: HTMLCanvasElement;
  private readonly keyStates: Map<string, InputState> = new Map();
  private readonly mouseStates: Map<MouseButton, InputState> = new Map();
  
  private mousePosition: Vector2 = new Vector2();
  private lastMousePosition: Vector2 = new Vector2();
  private mouseDelta: Vector2 = new Vector2();
  private wheelDelta: number = 0;
  
  private isEnabled: boolean = true;
  private preventDefault: boolean = true;

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;
    this.setupEventListeners();
  }

  /**
   * Konfiguruje nasłuchiwanie zdarzeń
   */
  private setupEventListeners(): void {
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
  public destroy(): void {
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
  public update(): void {
    if (!this.isEnabled) return;

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
  public isKeyPressed(key: string): boolean {
    return this.keyStates.get(key.toLowerCase())?.isPressed || false;
  }

  /**
   * Sprawdza czy klawisz jest trzymany
   */
  public isKeyDown(key: string): boolean {
    return this.keyStates.get(key.toLowerCase())?.isDown || false;
  }

  /**
   * Sprawdza czy klawisz został puszczony (w tym momencie)
   */
  public isKeyReleased(key: string): boolean {
    return this.keyStates.get(key.toLowerCase())?.isReleased || false;
  }

  /**
   * Zwraca czas przez jaki klawisz jest trzymany (w ms)
   */
  public getKeyHoldTime(key: string): number {
    const state = this.keyStates.get(key.toLowerCase());
    if (!state || !state.isDown) return 0;
    return performance.now() - state.timePressed;
  }

  // === OBSŁUGA MYSZY ===

  /**
   * Sprawdza czy przycisk myszy jest wciśnięty (w tym momencie)
   */
  public isMousePressed(button: MouseButton = MouseButton.LEFT): boolean {
    return this.mouseStates.get(button)?.isPressed || false;
  }

  /**
   * Sprawdza czy przycisk myszy jest trzymany
   */
  public isMouseDown(button: MouseButton = MouseButton.LEFT): boolean {
    return this.mouseStates.get(button)?.isDown || false;
  }

  /**
   * Sprawdza czy przycisk myszy został puszczony (w tym momencie)
   */
  public isMouseReleased(button: MouseButton = MouseButton.LEFT): boolean {
    return this.mouseStates.get(button)?.isReleased || false;
  }

  /**
   * Zwraca aktualną pozycję myszy
   */
  public getMousePosition(): Vector2 {
    return this.mousePosition.clone();
  }

  /**
   * Zwraca ruch myszy od ostatniej klatki
   */
  public getMouseDelta(): Vector2 {
    return this.mouseDelta.clone();
  }

  /**
   * Zwraca wartość kółka myszy
   */
  public getWheelDelta(): number {
    return this.wheelDelta;
  }

  // === OBSŁUGA KOMBINACJI KLAWISZY ===

  /**
   * Sprawdza czy wszystkie klawisz w kombinacji są wciśnięte
   */
  public areKeysDown(keys: string[]): boolean {
    return keys.every(key => this.isKeyDown(key));
  }

  /**
   * Sprawdza czy którykolwiek z klawiszy jest wciśnięty
   */
  public isAnyKeyDown(keys: string[]): boolean {
    return keys.some(key => this.isKeyDown(key));
  }

  // === ZARZĄDZANIE STANEM ===

  /**
   * Włącza/wyłącza InputManager
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.clearAllStates();
    }
  }

  /**
   * Czyści wszystkie stany klawiszy i przycisków
   */
  public clearAllStates(): void {
    this.keyStates.clear();
    this.mouseStates.clear();
    this.mouseDelta.set(0, 0);
    this.wheelDelta = 0;
  }

  /**
   * Ustawia czy preventDefault ma być wywoływane
   */
  public setPreventDefault(prevent: boolean): void {
    this.preventDefault = prevent;
  }

  // === OBSŁUGA ZDARZEŃ ===

  private onKeyDown = (event: KeyboardEvent): void => {
    if (!this.isEnabled) return;

    const key = event.key.toLowerCase();
    const currentState = this.keyStates.get(key);

    if (!currentState || !currentState.isDown) {
      const newState: InputState = {
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

  private onKeyUp = (event: KeyboardEvent): void => {
    if (!this.isEnabled) return;

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

  private onMouseDown = (event: MouseEvent): void => {
    if (!this.isEnabled) return;

    const button = event.button as MouseButton;
    const currentState = this.mouseStates.get(button);

    if (!currentState || !currentState.isDown) {
      const newState: InputState = {
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

  private onMouseUp = (event: MouseEvent): void => {
    if (!this.isEnabled) return;

    const button = event.button as MouseButton;
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

  private onMouseMove = (event: MouseEvent): void => {
    if (!this.isEnabled) return;

    this.lastMousePosition.set(this.mousePosition.x, this.mousePosition.y);
    this.updateMousePosition(event);
    
    this.mouseDelta.set(
      this.mousePosition.x - this.lastMousePosition.x,
      this.mousePosition.y - this.lastMousePosition.y
    );

    this.emit('mouseMove', this.getMouseEventData(event));
  };

  private onWheel = (event: WheelEvent): void => {
    if (!this.isEnabled) return;

    this.wheelDelta = event.deltaY;
    this.emit('mouseWheel', this.wheelDelta, this.getMouseEventData(event));

    if (this.preventDefault) {
      event.preventDefault();
    }
  };

  private onContextMenu = (event: Event): void => {
    if (this.preventDefault) {
      event.preventDefault();
    }
  };

  private onBlur = (): void => {
    // Czyszczenie stanów przy utracie fokusa
    this.clearAllStates();
  };

  /**
   * Aktualizuje pozycję myszy względem canvas
   */
  private updateMousePosition(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePosition.set(
      event.clientX - rect.left,
      event.clientY - rect.top
    );
  }

  /**
   * Tworzy obiekt danych zdarzenia myszy
   */
  private getMouseEventData(event: MouseEvent): CustomMouseEvent {
    return {
      position: this.mousePosition.clone(),
      button: event.button as MouseButton,
      deltaX: this.mouseDelta.x,
      deltaY: this.mouseDelta.y,
      wheelDelta: this.wheelDelta
    };
  }
} 