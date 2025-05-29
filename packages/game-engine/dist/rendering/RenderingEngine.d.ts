import { Vector2 } from '../math/Vector2';
/**
 * Enum dla typów renderera
 */
export declare enum RendererType {
    CANVAS_2D = "canvas2d",
    WEBGL = "webgl"
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
export declare class Camera {
    position: Vector2;
    zoom: number;
    rotation: number;
    private viewportWidth;
    private viewportHeight;
    constructor(viewportWidth: number, viewportHeight: number);
    /**
     * Konwertuje współrzędne świata na współrzędne ekranu
     */
    worldToScreen(worldPos: Vector2): Vector2;
    /**
     * Konwertuje współrzędne ekranu na współrzędne świata
     */
    screenToWorld(screenPos: Vector2): Vector2;
    /**
     * Przesuwa kamerę do pozycji
     */
    moveTo(position: Vector2): void;
    /**
     * Przesuwa kamerę o wektor
     */
    moveBy(delta: Vector2): void;
    /**
     * Ustawia zoom kamery
     */
    setZoom(zoom: number): void;
    /**
     * Sprawdza czy punkt jest widoczny w kamerze
     */
    isPointVisible(worldPos: Vector2, margin?: number): boolean;
    /**
     * Aktualizuje rozmiar viewport kamery
     */
    updateViewport(width: number, height: number): void;
}
/**
 * Główny silnik renderowania
 */
export declare class RenderingEngine {
    private canvas;
    private context;
    private rendererType;
    private camera;
    private backgroundColor;
    private clearColor;
    private renderObjects;
    private debugMode;
    private imageCache;
    private lastFrameTime;
    private frameCount;
    private fps;
    constructor(canvas: HTMLCanvasElement, config: RendererConfig);
    /**
     * Inicjalizuje kontekst renderowania
     */
    private initializeContext;
    /**
     * Inicjalizuje WebGL (podstawowa konfiguracja)
     */
    private initializeWebGL;
    /**
     * Rozpoczyna renderowanie klatki
     */
    beginFrame(): void;
    /**
     * Kończy renderowanie klatki
     */
    endFrame(): void;
    /**
     * Renderuje wszystkie obiekty
     */
    render(): void;
    /**
     * Rysuje prostokąt
     */
    drawRect(x: number, y: number, width: number, height: number, color: string): void;
    /**
     * Rysuje kontur prostokąta
     */
    drawRectOutline(x: number, y: number, width: number, height: number, color: string, lineWidth?: number): void;
    /**
     * Rysuje okrąg
     */
    drawCircle(x: number, y: number, radius: number, color: string): void;
    /**
     * Rysuje linię
     */
    drawLine(x1: number, y1: number, x2: number, y2: number, color: string, lineWidth?: number): void;
    /**
     * Rysuje tekst
     */
    drawText(text: string, x: number, y: number, color: string, font?: string): void;
    /**
     * Rysuje obrazek
     */
    drawImage(image: HTMLImageElement, x: number, y: number, width?: number, height?: number): void;
    /**
     * Rysuje kafelek izometryczny
     */
    drawIsometricTile(gridX: number, gridY: number, color: string): void;
    /**
     * Dodaje obiekt do renderowania
     */
    addRenderObject(obj: RenderableObject): void;
    /**
     * Usuwa obiekt z renderowania
     */
    removeRenderObject(obj: RenderableObject): void;
    /**
     * Czyści wszystkie obiekty do renderowania
     */
    clearRenderObjects(): void;
    /**
     * Zwraca kamerę
     */
    getCamera(): Camera;
    /**
     * Zwraca canvas
     */
    getCanvas(): HTMLCanvasElement;
    /**
     * Zwraca kontekst renderowania
     */
    getContext(): CanvasRenderingContext2D | WebGLRenderingContext;
    /**
     * Ustawia kolor tła
     */
    setBackgroundColor(color: string): void;
    /**
     * Włącza/wyłącza tryb debug
     */
    setDebugMode(enabled: boolean): void;
    /**
     * Zwraca aktualny FPS
     */
    getFPS(): number;
    /**
     * Zmienia rozmiar canvas
     */
    resize(width: number, height: number): void;
    /**
     * Konwertuje kolor hex na RGB
     */
    private hexToRgb;
    /**
     * Renderuje informacje debug
     */
    private renderDebugInfo;
}
//# sourceMappingURL=RenderingEngine.d.ts.map