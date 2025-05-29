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
export class GameLoop extends EventEmitter {
  private readonly targetFPS: number;
  private readonly targetFrameTime: number;
  private readonly maxDeltaTime: number;
  private readonly enableFixedTimeStep: boolean;
  private readonly fixedTimeStep: number;
  
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private frameCount: number = 0;
  private fpsTimer: number = 0;
  private currentFPS: number = 0;
  
  private readonly updatables: Set<Updatable> = new Set();
  private readonly renderables: Set<Renderable> = new Set();
  
  private animationFrameId: number | null = null;

  constructor(options: GameLoopOptions = {}) {
    super();
    
    this.targetFPS = options.targetFPS || 60;
    this.targetFrameTime = 1000 / this.targetFPS;
    this.maxDeltaTime = options.maxDeltaTime || 100; // maksymalnie 100ms delta
    this.enableFixedTimeStep = options.enableFixedTimeStep || false;
    this.fixedTimeStep = options.fixedTimeStep || 1000 / 60; // 60 FPS domyślnie
  }

  /**
   * Uruchamia pętlę gry
   */
  public start(): void {
    if (this.isRunning) {
      console.warn('GameLoop już działa!');
      return;
    }

    this.isRunning = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.frameCount = 0;
    this.fpsTimer = 0;
    
    this.emit('start');
    this.loop();
  }

  /**
   * Zatrzymuje pętlę gry
   */
  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this.emit('stop');
  }

  /**
   * Dodaje obiekt do aktualizacji
   */
  public addUpdatable(updatable: Updatable): void {
    this.updatables.add(updatable);
  }

  /**
   * Usuwa obiekt z aktualizacji
   */
  public removeUpdatable(updatable: Updatable): void {
    this.updatables.delete(updatable);
  }

  /**
   * Dodaje obiekt do renderowania
   */
  public addRenderable(renderable: Renderable): void {
    this.renderables.add(renderable);
  }

  /**
   * Usuwa obiekt z renderowania
   */
  public removeRenderable(renderable: Renderable): void {
    this.renderables.delete(renderable);
  }

  /**
   * Zwraca aktualny FPS
   */
  public getFPS(): number {
    return this.currentFPS;
  }

  /**
   * Sprawdza czy pętla działa
   */
  public get running(): boolean {
    return this.isRunning;
  }

  /**
   * Główna pętla gry
   */
  private loop = (): void => {
    if (!this.isRunning) {
      return;
    }

    const currentTime = performance.now();
    const deltaTime = Math.min(currentTime - this.lastTime, this.maxDeltaTime);
    this.lastTime = currentTime;

    // Obliczanie FPS
    this.frameCount++;
    this.fpsTimer += deltaTime;
    if (this.fpsTimer >= 1000) {
      this.currentFPS = Math.round((this.frameCount * 1000) / this.fpsTimer);
      this.frameCount = 0;
      this.fpsTimer = 0;
      this.emit('fps', this.currentFPS);
    }

    if (this.enableFixedTimeStep) {
      this.fixedTimeStepLoop(deltaTime);
    } else {
      this.variableTimeStepLoop(deltaTime);
    }

    // Planowanie następnej klatki
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  /**
   * Pętla z ustalonym krokiem czasowym
   */
  private fixedTimeStepLoop(deltaTime: number): void {
    this.accumulator += deltaTime;

    // Aktualizacje z ustalonym krokiem
    while (this.accumulator >= this.fixedTimeStep) {
      this.updateObjects(this.fixedTimeStep);
      this.accumulator -= this.fixedTimeStep;
    }

    // Renderowanie z interpolacją
    const alpha = this.accumulator / this.fixedTimeStep;
    this.renderObjects(alpha);
  }

  /**
   * Pętla ze zmiennym krokiem czasowym
   */
  private variableTimeStepLoop(deltaTime: number): void {
    this.updateObjects(deltaTime);
    this.renderObjects(deltaTime);
  }

  /**
   * Aktualizuje wszystkie obiekty
   */
  private updateObjects(deltaTime: number): void {
    this.emit('beforeUpdate', deltaTime);

    for (const updatable of this.updatables) {
      try {
        updatable.update(deltaTime);
      } catch (error) {
        console.error('Błąd podczas aktualizacji obiektu:', error);
        this.emit('error', error);
      }
    }

    this.emit('afterUpdate', deltaTime);
  }

  /**
   * Renderuje wszystkie obiekty
   */
  private renderObjects(deltaTime: number): void {
    this.emit('beforeRender', deltaTime);

    for (const renderable of this.renderables) {
      try {
        renderable.render(deltaTime);
      } catch (error) {
        console.error('Błąd podczas renderowania obiektu:', error);
        this.emit('error', error);
      }
    }

    this.emit('afterRender', deltaTime);
  }

  /**
   * Czyści wszystkie zarejestrowane obiekty
   */
  public clear(): void {
    this.updatables.clear();
    this.renderables.clear();
  }

  /**
   * Zwraca liczbę zarejestrowanych obiektów do aktualizacji
   */
  public getUpdatablesCount(): number {
    return this.updatables.size;
  }

  /**
   * Zwraca liczbę zarejestrowanych obiektów do renderowania
   */
  public getRenderablesCount(): number {
    return this.renderables.size;
  }

  /**
   * Ustawia nowy target FPS (tylko dla trybu z ustalonym krokiem)
   */
  public setTargetFPS(fps: number): void {
    if (fps <= 0) {
      throw new Error('FPS musi być większe od 0');
    }
    (this as any).targetFPS = fps;
    (this as any).targetFrameTime = 1000 / fps;
    (this as any).fixedTimeStep = 1000 / fps;
  }
} 