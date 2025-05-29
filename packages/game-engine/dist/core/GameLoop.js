"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameLoop = void 0;
const eventemitter3_1 = require("eventemitter3");
/**
 * Główna pętla gry obsługująca aktualizacje i renderowanie
 */
class GameLoop extends eventemitter3_1.EventEmitter {
    constructor(options = {}) {
        super();
        this.isRunning = false;
        this.lastTime = 0;
        this.accumulator = 0;
        this.frameCount = 0;
        this.fpsTimer = 0;
        this.currentFPS = 0;
        this.updatables = new Set();
        this.renderables = new Set();
        this.animationFrameId = null;
        /**
         * Główna pętla gry
         */
        this.loop = () => {
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
            }
            else {
                this.variableTimeStepLoop(deltaTime);
            }
            // Planowanie następnej klatki
            this.animationFrameId = requestAnimationFrame(this.loop);
        };
        this.targetFPS = options.targetFPS || 60;
        this.targetFrameTime = 1000 / this.targetFPS;
        this.maxDeltaTime = options.maxDeltaTime || 100; // maksymalnie 100ms delta
        this.enableFixedTimeStep = options.enableFixedTimeStep || false;
        this.fixedTimeStep = options.fixedTimeStep || 1000 / 60; // 60 FPS domyślnie
    }
    /**
     * Uruchamia pętlę gry
     */
    start() {
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
    stop() {
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
    addUpdatable(updatable) {
        this.updatables.add(updatable);
    }
    /**
     * Usuwa obiekt z aktualizacji
     */
    removeUpdatable(updatable) {
        this.updatables.delete(updatable);
    }
    /**
     * Dodaje obiekt do renderowania
     */
    addRenderable(renderable) {
        this.renderables.add(renderable);
    }
    /**
     * Usuwa obiekt z renderowania
     */
    removeRenderable(renderable) {
        this.renderables.delete(renderable);
    }
    /**
     * Zwraca aktualny FPS
     */
    getFPS() {
        return this.currentFPS;
    }
    /**
     * Sprawdza czy pętla działa
     */
    get running() {
        return this.isRunning;
    }
    /**
     * Pętla z ustalonym krokiem czasowym
     */
    fixedTimeStepLoop(deltaTime) {
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
    variableTimeStepLoop(deltaTime) {
        this.updateObjects(deltaTime);
        this.renderObjects(deltaTime);
    }
    /**
     * Aktualizuje wszystkie obiekty
     */
    updateObjects(deltaTime) {
        this.emit('beforeUpdate', deltaTime);
        for (const updatable of this.updatables) {
            try {
                updatable.update(deltaTime);
            }
            catch (error) {
                console.error('Błąd podczas aktualizacji obiektu:', error);
                this.emit('error', error);
            }
        }
        this.emit('afterUpdate', deltaTime);
    }
    /**
     * Renderuje wszystkie obiekty
     */
    renderObjects(deltaTime) {
        this.emit('beforeRender', deltaTime);
        for (const renderable of this.renderables) {
            try {
                renderable.render(deltaTime);
            }
            catch (error) {
                console.error('Błąd podczas renderowania obiektu:', error);
                this.emit('error', error);
            }
        }
        this.emit('afterRender', deltaTime);
    }
    /**
     * Czyści wszystkie zarejestrowane obiekty
     */
    clear() {
        this.updatables.clear();
        this.renderables.clear();
    }
    /**
     * Zwraca liczbę zarejestrowanych obiektów do aktualizacji
     */
    getUpdatablesCount() {
        return this.updatables.size;
    }
    /**
     * Zwraca liczbę zarejestrowanych obiektów do renderowania
     */
    getRenderablesCount() {
        return this.renderables.size;
    }
    /**
     * Ustawia nowy target FPS (tylko dla trybu z ustalonym krokiem)
     */
    setTargetFPS(fps) {
        if (fps <= 0) {
            throw new Error('FPS musi być większe od 0');
        }
        this.targetFPS = fps;
        this.targetFrameTime = 1000 / fps;
        this.fixedTimeStep = 1000 / fps;
    }
}
exports.GameLoop = GameLoop;
//# sourceMappingURL=GameLoop.js.map