"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEngine = void 0;
const eventemitter3_1 = require("eventemitter3");
const GameLoop_1 = require("./GameLoop");
const RenderingEngine_1 = require("../rendering/RenderingEngine");
const InputManager_1 = require("../input/InputManager");
const SceneManager_1 = require("../scene/SceneManager");
/**
 * Główny silnik gry łączący wszystkie komponenty
 */
class GameEngine extends eventemitter3_1.EventEmitter {
    constructor(config) {
        super();
        this.canvasContainer = null;
        // Stan silnika
        this.isInitialized = false;
        this.isRunning = false;
        this.isPaused = false;
        this.debugMode = false;
        // Statystyki wydajności
        this.stats = {
            fps: 0,
            frameTime: 0,
            updateTime: 0,
            renderTime: 0
        };
        // Timery do pomiaru wydajności
        this.lastUpdateStart = 0;
        this.lastRenderStart = 0;
        // === OBSŁUGA ZDARZEŃ WINDOW ===
        this.onWindowResize = () => {
            if (this.canvasContainer) {
                const rect = this.canvasContainer.getBoundingClientRect();
                this.resize(rect.width, rect.height);
            }
        };
        this.onWindowFocus = () => {
            this.resume();
        };
        this.onWindowBlur = () => {
            this.pause();
        };
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
    setupCanvas() {
        if (this.config.canvas) {
            this.canvas = this.config.canvas;
        }
        else if (this.config.canvasId) {
            const element = document.getElementById(this.config.canvasId);
            if (!element || !(element instanceof HTMLCanvasElement)) {
                throw new Error(`Element o ID '${this.config.canvasId}' nie istnieje lub nie jest elementem canvas`);
            }
            this.canvas = element;
        }
        else {
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
    initializeComponents() {
        // Inicjalizacja renderera
        this.renderer = new RenderingEngine_1.RenderingEngine(this.canvas, this.config.renderer);
        // Inicjalizacja managera inputu
        if (this.config.enableInput !== false) {
            this.input = new InputManager_1.InputManager(this.canvas);
        }
        // Inicjalizacja managera scen
        this.sceneManager = new SceneManager_1.SceneManager(this.renderer, this.input);
        // Inicjalizacja game loop
        this.gameLoop = new GameLoop_1.GameLoop(this.config.gameLoop);
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
    setupEventListeners() {
        // Zdarzenia game loop
        this.gameLoop.on('start', () => {
            this.isRunning = true;
            this.emit('started');
        });
        this.gameLoop.on('stop', () => {
            this.isRunning = false;
            this.emit('stopped');
        });
        this.gameLoop.on('fps', (fps) => {
            this.stats.fps = fps;
            this.emit('fpsUpdate', fps);
        });
        this.gameLoop.on('error', (error) => {
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
    start() {
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
    stop() {
        if (!this.isRunning) {
            return;
        }
        this.gameLoop.stop();
    }
    /**
     * Pauzuje silnik gry
     */
    pause() {
        if (!this.isRunning || this.isPaused) {
            return;
        }
        this.isPaused = true;
        this.emit('paused');
    }
    /**
     * Wznawia działanie silnika
     */
    resume() {
        if (!this.isPaused) {
            return;
        }
        this.isPaused = false;
        this.emit('resumed');
    }
    /**
     * Aktualizacja silnika (wywoływana przez GameLoop)
     */
    update(deltaTime) {
        if (this.isPaused)
            return;
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
    render(deltaTime) {
        if (this.isPaused)
            return;
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
    getRenderer() {
        return this.renderer;
    }
    /**
     * Zwraca input manager
     */
    getInputManager() {
        return this.input;
    }
    /**
     * Zwraca scene manager
     */
    getSceneManager() {
        return this.sceneManager;
    }
    /**
     * Zwraca game loop
     */
    getGameLoop() {
        return this.gameLoop;
    }
    /**
     * Zwraca canvas
     */
    getCanvas() {
        return this.canvas;
    }
    // === METODY SCEN ===
    /**
     * Rejestruje scenę
     */
    registerScene(scene) {
        this.sceneManager.registerScene(scene);
    }
    /**
     * Przełącza na scenę
     */
    switchToScene(sceneName) {
        return this.sceneManager.switchToScene(sceneName);
    }
    /**
     * Zwraca aktualną scenę
     */
    getCurrentScene() {
        return this.sceneManager.getCurrentScene();
    }
    // === METODY KONFIGURACJI ===
    /**
     * Ustawia tryb debug
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        this.renderer.setDebugMode(enabled);
    }
    /**
     * Zwraca statystyki wydajności
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * Zmienia rozmiar silnika
     */
    resize(width, height) {
        this.renderer.resize(width, height);
        this.sceneManager.onResize(width, height);
        this.emit('resize', width, height);
    }
    /**
     * Ustawia kolor tła
     */
    setBackgroundColor(color) {
        this.renderer.setBackgroundColor(color);
    }
    // === STAN SILNIKA ===
    /**
     * Sprawdza czy silnik jest zainicjalizowany
     */
    get initialized() {
        return this.isInitialized;
    }
    /**
     * Sprawdza czy silnik działa
     */
    get running() {
        return this.isRunning;
    }
    /**
     * Sprawdza czy silnik jest spauzowany
     */
    get paused() {
        return this.isPaused;
    }
    /**
     * Zwraca aktualny FPS
     */
    get fps() {
        return this.stats.fps;
    }
    // === OCZYSZCZANIE ===
    /**
     * Niszczy silnik i czyści zasoby
     */
    destroy() {
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
    // === METODY POMOCNICZE ===
    /**
     * Tworzy zrzut ekranu
     */
    takeScreenshot(format = 'image/png') {
        return this.canvas.toDataURL(format);
    }
    /**
     * Ustawia kursor myszy
     */
    setCursor(cursor) {
        this.canvas.style.cursor = cursor;
    }
    /**
     * Włącza pełny ekran
     */
    async enableFullscreen() {
        try {
            await this.canvas.requestFullscreen();
        }
        catch (error) {
            console.error('Nie udało się włączyć pełnego ekranu:', error);
        }
    }
    /**
     * Wyłącza pełny ekran
     */
    async exitFullscreen() {
        try {
            await document.exitFullscreen();
        }
        catch (error) {
            console.error('Nie udało się wyłączyć pełnego ekranu:', error);
        }
    }
    /**
     * Sprawdza czy jest pełny ekran
     */
    get isFullscreen() {
        return document.fullscreenElement === this.canvas;
    }
}
exports.GameEngine = GameEngine;
//# sourceMappingURL=GameEngine.js.map