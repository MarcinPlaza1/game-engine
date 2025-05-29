import { Vector2 } from '../math/Vector2';
import { IsometricUtils } from '../math/IsometricUtils';

/**
 * Enum dla typów renderera
 */
export enum RendererType {
  CANVAS_2D = 'canvas2d',
  WEBGL = 'webgl'
}

/**
 * Interfejs dla konfiguracji renderera
 */
export interface RendererConfig {
  type: RendererType;
  width: number;
  height: number;
  backgroundColor?: string;
  antialias?: boolean;
  alpha?: boolean;
}

/**
 * Interfejs dla obiektu do renderowania
 */
export interface RenderableObject {
  position: Vector2;
  zIndex?: number;
  visible?: boolean;
  render(renderer: RenderingEngine): void;
}

/**
 * Klasa reprezentująca kamerę
 */
export class Camera {
  public position: Vector2 = new Vector2();
  public zoom: number = 1;
  public rotation: number = 0;
  
  private viewportWidth: number;
  private viewportHeight: number;

  constructor(viewportWidth: number, viewportHeight: number) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  /**
   * Konwertuje współrzędne świata na współrzędne ekranu
   */
  worldToScreen(worldPos: Vector2): Vector2 {
    const screenPos = Vector2.subtract(worldPos, this.position);
    screenPos.multiply(this.zoom);
    screenPos.add(new Vector2(this.viewportWidth / 2, this.viewportHeight / 2));
    return screenPos;
  }

  /**
   * Konwertuje współrzędne ekranu na współrzędne świata
   */
  screenToWorld(screenPos: Vector2): Vector2 {
    const worldPos = Vector2.subtract(
      screenPos, 
      new Vector2(this.viewportWidth / 2, this.viewportHeight / 2)
    );
    worldPos.divide(this.zoom);
    worldPos.add(this.position);
    return worldPos;
  }

  /**
   * Przesuwa kamerę do pozycji
   */
  moveTo(position: Vector2): void {
    this.position.set(position.x, position.y);
  }

  /**
   * Przesuwa kamerę o wektor
   */
  moveBy(delta: Vector2): void {
    this.position.add(delta);
  }

  /**
   * Ustawia zoom kamery
   */
  setZoom(zoom: number): void {
    this.zoom = Math.max(0.1, Math.min(5, zoom)); // Ograniczenie zakresu zoom
  }

  /**
   * Sprawdza czy punkt jest widoczny w kamerze
   */
  isPointVisible(worldPos: Vector2, margin: number = 0): boolean {
    const screenPos = this.worldToScreen(worldPos);
    return screenPos.x >= -margin && 
           screenPos.x <= this.viewportWidth + margin &&
           screenPos.y >= -margin && 
           screenPos.y <= this.viewportHeight + margin;
  }

  /**
   * Aktualizuje rozmiar viewport kamery
   */
  updateViewport(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }
}

/**
 * Główny silnik renderowania
 */
export class RenderingEngine {
  private canvas: HTMLCanvasElement;
  private context!: CanvasRenderingContext2D | WebGLRenderingContext;
  private rendererType: RendererType;
  private camera: Camera;
  
  private backgroundColor: string = '#2c3e50';
  private clearColor: [number, number, number, number] = [0.17, 0.24, 0.31, 1.0];
  
  private renderObjects: RenderableObject[] = [];
  private debugMode: boolean = false;
  
  // Buforowanie dla lepszej wydajności
  private imageCache: Map<string, HTMLImageElement> = new Map();
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private fps: number = 0;

  constructor(canvas: HTMLCanvasElement, config: RendererConfig) {
    this.canvas = canvas;
    this.rendererType = config.type;
    
    // Ustawienie rozmiaru canvas
    this.canvas.width = config.width;
    this.canvas.height = config.height;
    
    // Inicjalizacja kamery
    this.camera = new Camera(config.width, config.height);
    
    // Inicjalizacja kontekstu renderowania
    this.initializeContext(config);
    
    if (config.backgroundColor) {
      this.setBackgroundColor(config.backgroundColor);
    }
  }

  /**
   * Inicjalizuje kontekst renderowania
   */
  private initializeContext(config: RendererConfig): void {
    if (this.rendererType === RendererType.CANVAS_2D) {
      this.context = this.canvas.getContext('2d')!;
      if (!this.context) {
        throw new Error('Nie udało się utworzyć kontekstu Canvas 2D');
      }
    } else if (this.rendererType === RendererType.WEBGL) {
      this.context = this.canvas.getContext('webgl', {
        antialias: config.antialias || true,
        alpha: config.alpha || false
      })!;
      if (!this.context) {
        throw new Error('Nie udało się utworzyć kontekstu WebGL');
      }
      this.initializeWebGL();
    }
  }

  /**
   * Inicjalizuje WebGL (podstawowa konfiguracja)
   */
  private initializeWebGL(): void {
    const gl = this.context as WebGLRenderingContext;
    gl.clearColor(...this.clearColor);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  /**
   * Rozpoczyna renderowanie klatki
   */
  public beginFrame(): void {
    if (this.rendererType === RendererType.CANVAS_2D) {
      const ctx = this.context as CanvasRenderingContext2D;
      ctx.save();
      ctx.fillStyle = this.backgroundColor;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Aplikowanie transformacji kamery
      ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
      ctx.scale(this.camera.zoom, this.camera.zoom);
      ctx.rotate(this.camera.rotation);
      ctx.translate(-this.camera.position.x, -this.camera.position.y);
    } else {
      const gl = this.context as WebGLRenderingContext;
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    
    // Obliczanie FPS
    const currentTime = performance.now();
    if (currentTime - this.lastFrameTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFrameTime = currentTime;
    }
    this.frameCount++;
  }

  /**
   * Kończy renderowanie klatki
   */
  public endFrame(): void {
    if (this.rendererType === RendererType.CANVAS_2D) {
      const ctx = this.context as CanvasRenderingContext2D;
      ctx.restore();
    }
    
    // Renderowanie informacji debug
    if (this.debugMode) {
      this.renderDebugInfo();
    }
  }

  /**
   * Renderuje wszystkie obiekty
   */
  public render(): void {
    this.beginFrame();
    
    // Sortowanie obiektów według z-index
    const sortedObjects = [...this.renderObjects].sort((a, b) => {
      const aZ = a.zIndex || 0;
      const bZ = b.zIndex || 0;
      return aZ - bZ;
    });
    
    // Renderowanie obiektów
    for (const obj of sortedObjects) {
      if (obj.visible !== false && this.camera.isPointVisible(obj.position, 100)) {
        obj.render(this);
      }
    }
    
    this.endFrame();
  }

  // === METODY RYSOWANIA ===

  /**
   * Rysuje prostokąt
   */
  public drawRect(x: number, y: number, width: number, height: number, color: string): void {
    if (this.rendererType === RendererType.CANVAS_2D) {
      const ctx = this.context as CanvasRenderingContext2D;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
    }
  }

  /**
   * Rysuje kontur prostokąta
   */
  public drawRectOutline(x: number, y: number, width: number, height: number, color: string, lineWidth: number = 1): void {
    if (this.rendererType === RendererType.CANVAS_2D) {
      const ctx = this.context as CanvasRenderingContext2D;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(x, y, width, height);
    }
  }

  /**
   * Rysuje okrąg
   */
  public drawCircle(x: number, y: number, radius: number, color: string): void {
    if (this.rendererType === RendererType.CANVAS_2D) {
      const ctx = this.context as CanvasRenderingContext2D;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Rysuje linię
   */
  public drawLine(x1: number, y1: number, x2: number, y2: number, color: string, lineWidth: number = 1): void {
    if (this.rendererType === RendererType.CANVAS_2D) {
      const ctx = this.context as CanvasRenderingContext2D;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  /**
   * Rysuje tekst
   */
  public drawText(text: string, x: number, y: number, color: string, font: string = '12px Arial'): void {
    if (this.rendererType === RendererType.CANVAS_2D) {
      const ctx = this.context as CanvasRenderingContext2D;
      ctx.fillStyle = color;
      ctx.font = font;
      ctx.fillText(text, x, y);
    }
  }

  /**
   * Rysuje obrazek
   */
  public drawImage(image: HTMLImageElement, x: number, y: number, width?: number, height?: number): void {
    if (this.rendererType === RendererType.CANVAS_2D) {
      const ctx = this.context as CanvasRenderingContext2D;
      if (width !== undefined && height !== undefined) {
        ctx.drawImage(image, x, y, width, height);
      } else {
        ctx.drawImage(image, x, y);
      }
    }
  }

  /**
   * Rysuje kafelek izometryczny
   */
  public drawIsometricTile(gridX: number, gridY: number, color: string): void {
    const screenPos = IsometricUtils.gridToScreenCenter(gridX, gridY);
    
    if (this.rendererType === RendererType.CANVAS_2D) {
      const ctx = this.context as CanvasRenderingContext2D;
      const halfWidth = IsometricUtils.HALF_TILE_WIDTH;
      const halfHeight = IsometricUtils.HALF_TILE_HEIGHT;
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y - halfHeight);
      ctx.lineTo(screenPos.x + halfWidth, screenPos.y);
      ctx.lineTo(screenPos.x, screenPos.y + halfHeight);
      ctx.lineTo(screenPos.x - halfWidth, screenPos.y);
      ctx.closePath();
      ctx.fill();
    }
  }

  // === ZARZĄDZANIE OBIEKTAMI ===

  /**
   * Dodaje obiekt do renderowania
   */
  public addRenderObject(obj: RenderableObject): void {
    this.renderObjects.push(obj);
  }

  /**
   * Usuwa obiekt z renderowania
   */
  public removeRenderObject(obj: RenderableObject): void {
    const index = this.renderObjects.indexOf(obj);
    if (index > -1) {
      this.renderObjects.splice(index, 1);
    }
  }

  /**
   * Czyści wszystkie obiekty do renderowania
   */
  public clearRenderObjects(): void {
    this.renderObjects = [];
  }

  // === GETTERY I SETTERY ===

  /**
   * Zwraca kamerę
   */
  public getCamera(): Camera {
    return this.camera;
  }

  /**
   * Zwraca canvas
   */
  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Zwraca kontekst renderowania
   */
  public getContext(): CanvasRenderingContext2D | WebGLRenderingContext {
    return this.context;
  }

  /**
   * Ustawia kolor tła
   */
  public setBackgroundColor(color: string): void {
    this.backgroundColor = color;
    
    if (this.rendererType === RendererType.WEBGL) {
      // Konwersja CSS color na RGB
      const rgb = this.hexToRgb(color);
      if (rgb) {
        this.clearColor = [rgb.r / 255, rgb.g / 255, rgb.b / 255, 1.0];
        const gl = this.context as WebGLRenderingContext;
        gl.clearColor(...this.clearColor);
      }
    }
  }

  /**
   * Włącza/wyłącza tryb debug
   */
  public setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * Zwraca aktualny FPS
   */
  public getFPS(): number {
    return this.fps;
  }

  /**
   * Zmienia rozmiar canvas
   */
  public resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.camera.updateViewport(width, height);
    
    if (this.rendererType === RendererType.WEBGL) {
      const gl = this.context as WebGLRenderingContext;
      gl.viewport(0, 0, width, height);
    }
  }

  // === METODY POMOCNICZE ===

  /**
   * Konwertuje kolor hex na RGB
   */
  private hexToRgb(hex: string): { r: number, g: number, b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Renderuje informacje debug
   */
  private renderDebugInfo(): void {
    if (this.rendererType === RendererType.CANVAS_2D) {
      const ctx = this.context as CanvasRenderingContext2D;
      ctx.save();
      ctx.resetTransform();
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, 200, 100);
      
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.fillText(`FPS: ${this.fps}`, 20, 30);
      ctx.fillText(`Obiekty: ${this.renderObjects.length}`, 20, 50);
      ctx.fillText(`Kamera: ${this.camera.position.x.toFixed(1)}, ${this.camera.position.y.toFixed(1)}`, 20, 70);
      ctx.fillText(`Zoom: ${this.camera.zoom.toFixed(2)}`, 20, 90);
      
      ctx.restore();
    }
  }
} 