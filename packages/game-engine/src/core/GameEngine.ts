import { EventEmitter } from 'eventemitter3';
import { GameLoop, GameLoopOptions } from './GameLoop';
import { RenderingEngine, RendererConfig, RendererType } from '../rendering/RenderingEngine';
import { InputManager } from '../input/InputManager';
import { SceneManager, Scene } from '../scene/SceneManager';
import { Vector2 } from '../math/Vector2';

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
export class GameEngine extends EventEmitter {
  // Core komponenty
  private gameLoop!: GameLoop;
  private renderer!: RenderingEngine;
  private input!: InputManager;
  private sceneManager!: SceneManager;
  
  // Canvas i DOM
  private canvas!: HTMLCanvasElement;
  private canvasContainer: HTMLElement | null = null;
  
  // Stan silnika
  private isInitialized: boolean = false;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  
  // Konfiguracja
  private config: GameEngineConfig;
  private debugMode: boolean = false;
  
  // Statystyki wydajności
  private stats: EngineStats = {
    fps: 0,
    frameTime: 0,
    updateTime: 0,
    renderTime: 0
  };
  
  // Timery do pomiaru wydajności
  private lastUpdateStart: number = 0;
  private lastRenderStart: number = 0;

  constructor(config: GameEngineConfig) {
    super();
    this.config = config;
    this.debugMode = config.enableDebug || false;
    
    this.setupCanvas();
    this.initializeComponents();
    this.setupEventListeners();
    
    this.isInitialized = true;
    this.emit('initialized');
  }

  /**
   * Konfiguruje canvas
   */
  private setupCanvas(): void {
    if (this.config.canvas) {
      this.canvas = this.config.canvas;
    } else if (this.config.canvasId) {
      const element = document.getElementById(this.config.canvasId);
      if (!element || !(element instanceof HTMLCanvasElement)) {
        throw new Error(`Element o ID '${this.config.canvasId}' nie istnieje lub nie jest elementem canvas`);
      }
      this.canvas = element;
    } else {
      // Stwórz nowy canvas
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'game-canvas';
      document.body.appendChild(this.canvas);
    }

    // Konfiguracja podstawowych atrybutów canvas
    this.canvas.style.display = 'block';
    this.canvas.style.imageRendering = 'pixelated'; // Dla pixel art
    this.canvas.tabIndex = 1; // Umożliwia focus dla inputu
    
    this.canvasContainer = this.canvas.parentElement;
  }

  /**
   * Inicjalizuje wszystkie komponenty silnika
   */
  private initializeComponents(): void {
    // Inicjalizacja renderera
    this.renderer = new RenderingEngine(this.canvas, this.config.renderer);
    
    // Inicjalizacja managera inputu
    if (this.config.enableInput !== false) {
      this.input = new InputManager(this.canvas);
    }
    
    // Inicjalizacja managera scen
    this.sceneManager = new SceneManager(this.renderer, this.input);
    
    // Inicjalizacja game loop
    this.gameLoop = new GameLoop(this.config.gameLoop);
    
    // Rejestracja komponentów w game loop
    this.gameLoop.addUpdatable(this);
    this.gameLoop.addRenderable(this);
    
    // Włączenie trybu debug jeśli potrzebny
    if (this.debugMode) {
      this.renderer.setDebugMode(true);
    }
  }

  /**
   * Konfiguruje nasłuchiwanie zdarzeń
   */
  private setupEventListeners(): void {
    // Zdarzenia game loop
    this.gameLoop.on('start', () => {
      this.isRunning = true;
      this.emit('started');
    });
    
    this.gameLoop.on('stop', () => {
      this.isRunning = false;
      this.emit('stopped');
    });
    
    this.gameLoop.on('fps', (fps: number) => {
      this.stats.fps = fps;
      this.emit('fpsUpdate', fps);
    });
    
    this.gameLoop.on('error', (error: Error) => {
      this.emit('error', error);
    });

    // Zdarzenia zmiany rozmiaru okna
    window.addEventListener('resize', this.onWindowResize);
    
    // Zdarzenia focus/blur
    window.addEventListener('focus', this.onWindowFocus);
    window.addEventListener('blur', this.onWindowBlur);
  }

  /**
   * Uruchamia silnik gry
   */
  public start(): void {
    if (!this.isInitialized) {
      throw new Error('Silnik nie został zainicjalizowany');
    }
    
    if (this.isRunning) {
      console.warn('Silnik już działa');
      return;
    }
    
    this.gameLoop.start();
  }

  /**
   * Zatrzymuje silnik gry
   */
  public stop(): void {
    if (!this.isRunning) {
      return;
    }
    
    this.gameLoop.stop();
  }

  /**
   * Pauzuje silnik gry
   */
  public pause(): void {
    if (!this.isRunning || this.isPaused) {
      return;
    }
    
    this.isPaused = true;
    this.emit('paused');
  }

  /**
   * Wznawia działanie silnika
   */
  public resume(): void {
    if (!this.isPaused) {
      return;
    }
    
    this.isPaused = false;
    this.emit('resumed');
  }

  /**
   * Aktualizacja silnika (wywoływana przez GameLoop)
   */
  public update(deltaTime: number): void {
    if (this.isPaused) return;
    
    this.lastUpdateStart = performance.now();
    
    // Aktualizacja inputu
    if (this.input) {
      this.input.update();
    }
    
    // Aktualizacja scen
    this.sceneManager.update(deltaTime);
    
    // Obliczenie czasu aktualizacji
    this.stats.updateTime = performance.now() - this.lastUpdateStart;
    this.stats.frameTime = deltaTime;
  }

  /**
   * Renderowanie silnika (wywoływane przez GameLoop)
   */
  public render(deltaTime: number): void {
    if (this.isPaused) return;
    
    this.lastRenderStart = performance.now();
    
    // Renderowanie scen
    this.sceneManager.render(deltaTime);
    
    // Obliczenie czasu renderowania
    this.stats.renderTime = performance.now() - this.lastRenderStart;
    
    // Emit stats jeśli debug mode
    if (this.debugMode) {
      this.emit('statsUpdate', this.stats);
    }
  }

  // === GETTERY DLA KOMPONENTÓW ===

  /**
   * Zwraca renderer
   */
  public getRenderer(): RenderingEngine {
    return this.renderer;
  }

  /**
   * Zwraca input manager
   */
  public getInputManager(): InputManager {
    return this.input;
  }

  /**
   * Zwraca scene manager
   */
  public getSceneManager(): SceneManager {
    return this.sceneManager;
  }

  /**
   * Zwraca game loop
   */
  public getGameLoop(): GameLoop {
    return this.gameLoop;
  }

  /**
   * Zwraca canvas
   */
  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  // === METODY SCEN ===

  /**
   * Rejestruje scenę
   */
  public registerScene(scene: Scene): void {
    this.sceneManager.registerScene(scene);
  }

  /**
   * Przełącza na scenę
   */
  public switchToScene(sceneName: string): Promise<void> {
    return this.sceneManager.switchToScene(sceneName);
  }

  /**
   * Zwraca aktualną scenę
   */
  public getCurrentScene(): Scene | null {
    return this.sceneManager.getCurrentScene();
  }

  // === METODY KONFIGURACJI ===

  /**
   * Ustawia tryb debug
   */
  public setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    this.renderer.setDebugMode(enabled);
  }

  /**
   * Zwraca statystyki wydajności
   */
  public getStats(): EngineStats {
    return { ...this.stats };
  }

  /**
   * Zmienia rozmiar silnika
   */
  public resize(width: number, height: number): void {
    this.renderer.resize(width, height);
    this.sceneManager.onResize(width, height);
    this.emit('resize', width, height);
  }

  /**
   * Ustawia kolor tła
   */
  public setBackgroundColor(color: string): void {
    this.renderer.setBackgroundColor(color);
  }

  // === STAN SILNIKA ===

  /**
   * Sprawdza czy silnik jest zainicjalizowany
   */
  public get initialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Sprawdza czy silnik działa
   */
  public get running(): boolean {
    return this.isRunning;
  }

  /**
   * Sprawdza czy silnik jest spauzowany
   */
  public get paused(): boolean {
    return this.isPaused;
  }

  /**
   * Zwraca aktualny FPS
   */
  public get fps(): number {
    return this.stats.fps;
  }

  // === OCZYSZCZANIE ===

  /**
   * Niszczy silnik i czyści zasoby
   */
  public destroy(): void {
    this.stop();
    
    if (this.input) {
      this.input.destroy();
    }
    
    this.sceneManager.clear();
    this.gameLoop.clear();
    
    // Usunięcie event listenerów
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('focus', this.onWindowFocus);
    window.removeEventListener('blur', this.onWindowBlur);
    
    this.isInitialized = false;
    this.emit('destroyed');
  }

  // === OBSŁUGA ZDARZEŃ WINDOW ===

  private onWindowResize = (): void => {
    if (this.canvasContainer) {
      const rect = this.canvasContainer.getBoundingClientRect();
      this.resize(rect.width, rect.height);
    }
  };

  private onWindowFocus = (): void => {
    this.resume();
  };

  private onWindowBlur = (): void => {
    this.pause();
  };

  // === METODY POMOCNICZE ===

  /**
   * Tworzy zrzut ekranu
   */
  public takeScreenshot(format: string = 'image/png'): string {
    return this.canvas.toDataURL(format);
  }

  /**
   * Ustawia kursor myszy
   */
  public setCursor(cursor: string): void {
    this.canvas.style.cursor = cursor;
  }

  /**
   * Włącza pełny ekran
   */
  public async enableFullscreen(): Promise<void> {
    try {
      await this.canvas.requestFullscreen();
    } catch (error) {
      console.error('Nie udało się włączyć pełnego ekranu:', error);
    }
  }

  /**
   * Wyłącza pełny ekran
   */
  public async exitFullscreen(): Promise<void> {
    try {
      await document.exitFullscreen();
    } catch (error) {
      console.error('Nie udało się wyłączyć pełnego ekranu:', error);
    }
  }

  /**
   * Sprawdza czy jest pełny ekran
   */
  public get isFullscreen(): boolean {
    return document.fullscreenElement === this.canvas;
  }
} 