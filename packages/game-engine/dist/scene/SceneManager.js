"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneManager = exports.Scene = void 0;
const eventemitter3_1 = require("eventemitter3");
/**
 * Abstrakcyjna klasa bazowa dla scen
 */
class Scene {
    constructor(name, sceneManager, renderer, input) {
        this.isActive = false;
        this.isVisible = true;
        this.isPaused = false;
        this.name = name;
        this.sceneManager = sceneManager;
        this.renderer = renderer;
        this.input = input;
    }
    /**
     * Wywoływane przy zmianie rozmiaru ekranu
     */
    onResize(width, height) {
        // Domyślnie pusta implementacja
    }
    /**
     * Pauzuje scenę
     */
    pause() {
        this.isPaused = true;
    }
    /**
     * Wznawia scenę
     */
    resume() {
        this.isPaused = false;
    }
    /**
     * Sprawdza czy scena jest aktywna
     */
    isSceneActive() {
        return this.isActive;
    }
    /**
     * Sprawdza czy scena jest widoczna
     */
    isSceneVisible() {
        return this.isVisible;
    }
    /**
     * Ustawia widoczność sceny
     */
    setVisible(visible) {
        this.isVisible = visible;
    }
}
exports.Scene = Scene;
/**
 * Manager zarządzający scenami gry
 */
class SceneManager extends eventemitter3_1.EventEmitter {
    constructor(renderer, input) {
        super();
        this.scenes = new Map();
        this.currentScene = null;
        this.sceneStack = [];
        this.transitionInProgress = false;
        this.transitionData = null;
        this.transitionProgress = 0;
        this.transitionDuration = 0;
        this.renderer = renderer;
        this.input = input;
    }
    /**
     * Rejestruje nową scenę
     */
    registerScene(scene) {
        if (this.scenes.has(scene.name)) {
            console.warn(`Scena '${scene.name}' już istnieje i zostanie zastąpiona`);
        }
        this.scenes.set(scene.name, scene);
        this.emit('sceneRegistered', scene.name);
    }
    /**
     * Usuwa scenę z rejestru
     */
    unregisterScene(sceneName) {
        const scene = this.scenes.get(sceneName);
        if (scene) {
            if (scene === this.currentScene) {
                console.warn(`Nie można usunąć aktywnej sceny '${sceneName}'`);
                return;
            }
            this.scenes.delete(sceneName);
            this.emit('sceneUnregistered', sceneName);
        }
    }
    /**
     * Przełącza na wybraną scenę
     */
    switchToScene(sceneName, transition) {
        return new Promise((resolve, reject) => {
            const targetScene = this.scenes.get(sceneName);
            if (!targetScene) {
                reject(new Error(`Scena '${sceneName}' nie istnieje`));
                return;
            }
            if (this.transitionInProgress) {
                reject(new Error('Przejście między scenami już trwa'));
                return;
            }
            if (this.currentScene === targetScene) {
                resolve();
                return;
            }
            this.emit('sceneChangeStart', {
                from: this.currentScene?.name || null,
                to: sceneName
            });
            if (transition && transition.type !== 'immediate') {
                this.startTransition(targetScene, transition, resolve);
            }
            else {
                this.performImmediateSwitch(targetScene);
                resolve();
            }
        });
    }
    /**
     * Odkłada scenę na stos i przełącza na nową
     */
    pushScene(sceneName, transition) {
        return new Promise((resolve, reject) => {
            const targetScene = this.scenes.get(sceneName);
            if (!targetScene) {
                reject(new Error(`Scena '${sceneName}' nie istnieje`));
                return;
            }
            if (this.currentScene) {
                this.sceneStack.push(this.currentScene);
                this.currentScene.pause();
                this.currentScene.isActive = false;
            }
            this.switchToScene(sceneName, transition).then(resolve).catch(reject);
        });
    }
    /**
     * Powraca do poprzedniej sceny ze stosu
     */
    popScene(transition) {
        return new Promise((resolve, reject) => {
            if (this.sceneStack.length === 0) {
                reject(new Error('Stos scen jest pusty'));
                return;
            }
            const previousScene = this.sceneStack.pop();
            this.switchToScene(previousScene.name, transition).then(() => {
                previousScene.resume();
                resolve();
            }).catch(reject);
        });
    }
    /**
     * Aktualizuje aktywną scenę
     */
    update(deltaTime) {
        if (this.transitionInProgress) {
            this.updateTransition(deltaTime);
            return;
        }
        if (this.currentScene && this.currentScene.isActive && !this.currentScene.isPaused) {
            this.currentScene.update(deltaTime);
        }
        // Aktualizacja scen w tle (jeśli są na stosie)
        for (const scene of this.sceneStack) {
            if (!scene.isPaused) {
                scene.update(deltaTime);
            }
        }
    }
    /**
     * Renderuje wszystkie widoczne sceny
     */
    render(deltaTime) {
        // Renderowanie scen ze stosu (w odwrotnej kolejności)
        for (let i = this.sceneStack.length - 1; i >= 0; i--) {
            const scene = this.sceneStack[i];
            if (scene.isVisible) {
                scene.render(deltaTime);
            }
        }
        // Renderowanie aktywnej sceny
        if (this.currentScene && this.currentScene.isVisible) {
            this.currentScene.render(deltaTime);
        }
        // Renderowanie przejścia jeśli trwa
        if (this.transitionInProgress && this.transitionData) {
            this.renderTransition(deltaTime);
        }
    }
    /**
     * Zwraca aktualną scenę
     */
    getCurrentScene() {
        return this.currentScene;
    }
    /**
     * Zwraca scenę o podanej nazwie
     */
    getScene(sceneName) {
        return this.scenes.get(sceneName) || null;
    }
    /**
     * Sprawdza czy scena istnieje
     */
    hasScene(sceneName) {
        return this.scenes.has(sceneName);
    }
    /**
     * Zwraca listę nazw wszystkich zarejestrowanych scen
     */
    getSceneNames() {
        return Array.from(this.scenes.keys());
    }
    /**
     * Czyści wszystkie sceny
     */
    clear() {
        if (this.currentScene) {
            this.currentScene.onExit();
            this.currentScene.isActive = false;
        }
        for (const scene of this.sceneStack) {
            scene.onExit();
            scene.isActive = false;
        }
        this.scenes.clear();
        this.sceneStack = [];
        this.currentScene = null;
        this.transitionInProgress = false;
    }
    /**
     * Obsługuje zmianę rozmiaru ekranu
     */
    onResize(width, height) {
        for (const scene of this.scenes.values()) {
            scene.onResize(width, height);
        }
    }
    // === METODY PRYWATNE ===
    /**
     * Wykonuje natychmiastowe przełączenie sceny
     */
    performImmediateSwitch(targetScene) {
        if (this.currentScene) {
            this.currentScene.onExit();
            this.currentScene.isActive = false;
        }
        this.currentScene = targetScene;
        this.currentScene.isActive = true;
        this.currentScene.onEnter();
        this.emit('sceneChangeComplete', {
            from: this.currentScene?.name || null,
            to: targetScene.name
        });
    }
    /**
     * Rozpoczyna przejście między scenami
     */
    startTransition(targetScene, transition, resolve) {
        this.transitionInProgress = true;
        this.transitionData = transition;
        this.transitionProgress = 0;
        this.transitionDuration = transition.duration || 500; // 500ms domyślnie
        // Przełączenie sceny rozpoczyna się natychmiast
        if (this.currentScene) {
            this.currentScene.onExit();
            this.currentScene.isActive = false;
        }
        this.currentScene = targetScene;
        this.currentScene.isActive = true;
        this.currentScene.onEnter();
        // Ustawienie callbacku do zakończenia przejścia
        this.once('transitionComplete', resolve);
    }
    /**
     * Aktualizuje przejście między scenami
     */
    updateTransition(deltaTime) {
        if (!this.transitionData)
            return;
        this.transitionProgress += deltaTime;
        const progress = Math.min(this.transitionProgress / this.transitionDuration, 1);
        if (progress >= 1) {
            this.completeTransition();
        }
    }
    /**
     * Renderuje efekt przejścia
     */
    renderTransition(deltaTime) {
        if (!this.transitionData)
            return;
        const progress = this.transitionProgress / this.transitionDuration;
        const canvas = this.renderer.getCanvas();
        const ctx = this.renderer.getContext();
        ctx.save();
        ctx.resetTransform();
        switch (this.transitionData.type) {
            case 'fade':
                ctx.fillStyle = `rgba(0, 0, 0, ${1 - progress})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                break;
            case 'slide':
                const direction = this.transitionData.direction || 'left';
                let offsetX = 0;
                let offsetY = 0;
                switch (direction) {
                    case 'left':
                        offsetX = -canvas.width * (1 - progress);
                        break;
                    case 'right':
                        offsetX = canvas.width * (1 - progress);
                        break;
                    case 'up':
                        offsetY = -canvas.height * (1 - progress);
                        break;
                    case 'down':
                        offsetY = canvas.height * (1 - progress);
                        break;
                }
                ctx.fillStyle = 'black';
                ctx.fillRect(offsetX, offsetY, canvas.width, canvas.height);
                break;
        }
        ctx.restore();
    }
    /**
     * Kończy przejście między scenami
     */
    completeTransition() {
        this.transitionInProgress = false;
        this.transitionData = null;
        this.transitionProgress = 0;
        this.emit('transitionComplete');
        this.emit('sceneChangeComplete', {
            from: null, // Nie mamy już referencji do poprzedniej sceny
            to: this.currentScene?.name || null
        });
    }
}
exports.SceneManager = SceneManager;
//# sourceMappingURL=SceneManager.js.map