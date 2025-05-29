"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderingEngine = exports.Camera = exports.RendererType = void 0;
const Vector2_1 = require("../math/Vector2");
const IsometricUtils_1 = require("../math/IsometricUtils");
/**
 * Enum dla typów renderera
 */
var RendererType;
(function (RendererType) {
    RendererType["CANVAS_2D"] = "canvas2d";
    RendererType["WEBGL"] = "webgl";
})(RendererType || (exports.RendererType = RendererType = {}));
/**
 * Klasa reprezentująca kamerę
 */
class Camera {
    constructor(viewportWidth, viewportHeight) {
        this.position = new Vector2_1.Vector2();
        this.zoom = 1;
        this.rotation = 0;
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
    }
    /**
     * Konwertuje współrzędne świata na współrzędne ekranu
     */
    worldToScreen(worldPos) {
        const screenPos = Vector2_1.Vector2.subtract(worldPos, this.position);
        screenPos.multiply(this.zoom);
        screenPos.add(new Vector2_1.Vector2(this.viewportWidth / 2, this.viewportHeight / 2));
        return screenPos;
    }
    /**
     * Konwertuje współrzędne ekranu na współrzędne świata
     */
    screenToWorld(screenPos) {
        const worldPos = Vector2_1.Vector2.subtract(screenPos, new Vector2_1.Vector2(this.viewportWidth / 2, this.viewportHeight / 2));
        worldPos.divide(this.zoom);
        worldPos.add(this.position);
        return worldPos;
    }
    /**
     * Przesuwa kamerę do pozycji
     */
    moveTo(position) {
        this.position.set(position.x, position.y);
    }
    /**
     * Przesuwa kamerę o wektor
     */
    moveBy(delta) {
        this.position.add(delta);
    }
    /**
     * Ustawia zoom kamery
     */
    setZoom(zoom) {
        this.zoom = Math.max(0.1, Math.min(5, zoom)); // Ograniczenie zakresu zoom
    }
    /**
     * Sprawdza czy punkt jest widoczny w kamerze
     */
    isPointVisible(worldPos, margin = 0) {
        const screenPos = this.worldToScreen(worldPos);
        return screenPos.x >= -margin &&
            screenPos.x <= this.viewportWidth + margin &&
            screenPos.y >= -margin &&
            screenPos.y <= this.viewportHeight + margin;
    }
    /**
     * Aktualizuje rozmiar viewport kamery
     */
    updateViewport(width, height) {
        this.viewportWidth = width;
        this.viewportHeight = height;
    }
}
exports.Camera = Camera;
/**
 * Główny silnik renderowania
 */
class RenderingEngine {
    constructor(canvas, config) {
        this.backgroundColor = '#2c3e50';
        this.clearColor = [0.17, 0.24, 0.31, 1.0];
        this.renderObjects = [];
        this.debugMode = false;
        // Buforowanie dla lepszej wydajności
        this.imageCache = new Map();
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fps = 0;
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
    initializeContext(config) {
        if (this.rendererType === RendererType.CANVAS_2D) {
            this.context = this.canvas.getContext('2d');
            if (!this.context) {
                throw new Error('Nie udało się utworzyć kontekstu Canvas 2D');
            }
        }
        else if (this.rendererType === RendererType.WEBGL) {
            this.context = this.canvas.getContext('webgl', {
                antialias: config.antialias || true,
                alpha: config.alpha || false
            });
            if (!this.context) {
                throw new Error('Nie udało się utworzyć kontekstu WebGL');
            }
            this.initializeWebGL();
        }
    }
    /**
     * Inicjalizuje WebGL (podstawowa konfiguracja)
     */
    initializeWebGL() {
        const gl = this.context;
        gl.clearColor(...this.clearColor);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }
    /**
     * Rozpoczyna renderowanie klatki
     */
    beginFrame() {
        if (this.rendererType === RendererType.CANVAS_2D) {
            const ctx = this.context;
            ctx.save();
            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            // Aplikowanie transformacji kamery
            ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
            ctx.scale(this.camera.zoom, this.camera.zoom);
            ctx.rotate(this.camera.rotation);
            ctx.translate(-this.camera.position.x, -this.camera.position.y);
        }
        else {
            const gl = this.context;
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
    endFrame() {
        if (this.rendererType === RendererType.CANVAS_2D) {
            const ctx = this.context;
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
    render() {
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
    drawRect(x, y, width, height, color) {
        if (this.rendererType === RendererType.CANVAS_2D) {
            const ctx = this.context;
            ctx.fillStyle = color;
            ctx.fillRect(x, y, width, height);
        }
    }
    /**
     * Rysuje kontur prostokąta
     */
    drawRectOutline(x, y, width, height, color, lineWidth = 1) {
        if (this.rendererType === RendererType.CANVAS_2D) {
            const ctx = this.context;
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.strokeRect(x, y, width, height);
        }
    }
    /**
     * Rysuje okrąg
     */
    drawCircle(x, y, radius, color) {
        if (this.rendererType === RendererType.CANVAS_2D) {
            const ctx = this.context;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    /**
     * Rysuje linię
     */
    drawLine(x1, y1, x2, y2, color, lineWidth = 1) {
        if (this.rendererType === RendererType.CANVAS_2D) {
            const ctx = this.context;
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
    drawText(text, x, y, color, font = '12px Arial') {
        if (this.rendererType === RendererType.CANVAS_2D) {
            const ctx = this.context;
            ctx.fillStyle = color;
            ctx.font = font;
            ctx.fillText(text, x, y);
        }
    }
    /**
     * Rysuje obrazek
     */
    drawImage(image, x, y, width, height) {
        if (this.rendererType === RendererType.CANVAS_2D) {
            const ctx = this.context;
            if (width !== undefined && height !== undefined) {
                ctx.drawImage(image, x, y, width, height);
            }
            else {
                ctx.drawImage(image, x, y);
            }
        }
    }
    /**
     * Rysuje kafelek izometryczny
     */
    drawIsometricTile(gridX, gridY, color) {
        const screenPos = IsometricUtils_1.IsometricUtils.gridToScreenCenter(gridX, gridY);
        if (this.rendererType === RendererType.CANVAS_2D) {
            const ctx = this.context;
            const halfWidth = IsometricUtils_1.IsometricUtils.HALF_TILE_WIDTH;
            const halfHeight = IsometricUtils_1.IsometricUtils.HALF_TILE_HEIGHT;
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
    addRenderObject(obj) {
        this.renderObjects.push(obj);
    }
    /**
     * Usuwa obiekt z renderowania
     */
    removeRenderObject(obj) {
        const index = this.renderObjects.indexOf(obj);
        if (index > -1) {
            this.renderObjects.splice(index, 1);
        }
    }
    /**
     * Czyści wszystkie obiekty do renderowania
     */
    clearRenderObjects() {
        this.renderObjects = [];
    }
    // === GETTERY I SETTERY ===
    /**
     * Zwraca kamerę
     */
    getCamera() {
        return this.camera;
    }
    /**
     * Zwraca canvas
     */
    getCanvas() {
        return this.canvas;
    }
    /**
     * Zwraca kontekst renderowania
     */
    getContext() {
        return this.context;
    }
    /**
     * Ustawia kolor tła
     */
    setBackgroundColor(color) {
        this.backgroundColor = color;
        if (this.rendererType === RendererType.WEBGL) {
            // Konwersja CSS color na RGB
            const rgb = this.hexToRgb(color);
            if (rgb) {
                this.clearColor = [rgb.r / 255, rgb.g / 255, rgb.b / 255, 1.0];
                const gl = this.context;
                gl.clearColor(...this.clearColor);
            }
        }
    }
    /**
     * Włącza/wyłącza tryb debug
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }
    /**
     * Zwraca aktualny FPS
     */
    getFPS() {
        return this.fps;
    }
    /**
     * Zmienia rozmiar canvas
     */
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.camera.updateViewport(width, height);
        if (this.rendererType === RendererType.WEBGL) {
            const gl = this.context;
            gl.viewport(0, 0, width, height);
        }
    }
    // === METODY POMOCNICZE ===
    /**
     * Konwertuje kolor hex na RGB
     */
    hexToRgb(hex) {
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
    renderDebugInfo() {
        if (this.rendererType === RendererType.CANVAS_2D) {
            const ctx = this.context;
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
exports.RenderingEngine = RenderingEngine;
//# sourceMappingURL=RenderingEngine.js.map