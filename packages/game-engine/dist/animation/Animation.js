"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpriteSheetAnimationBuilder = exports.AnimationController = exports.AnimationState = exports.AnimationClip = exports.AnimationMode = void 0;
/**
 * Enum dla trybów powtarzania animacji
 */
var AnimationMode;
(function (AnimationMode) {
    AnimationMode["ONCE"] = "once";
    AnimationMode["LOOP"] = "loop";
    AnimationMode["PING_PONG"] = "ping_pong";
})(AnimationMode || (exports.AnimationMode = AnimationMode = {}));
/**
 * Definicja animacji
 */
class AnimationClip {
    constructor(name, frames, mode = AnimationMode.LOOP) {
        this.name = name;
        this.frames = frames;
        this.mode = mode;
        this.totalDuration = frames.reduce((sum, frame) => sum + frame.duration, 0);
    }
    /**
     * Zwraca klatkę w określonym czasie
     */
    getFrameAtTime(time) {
        if (this.frames.length === 0) {
            throw new Error(`Animacja '${this.name}' nie ma klatek`);
        }
        if (this.frames.length === 1) {
            return { frame: this.frames[0], frameIndex: 0 };
        }
        let normalizedTime = this.getNormalizedTime(time);
        let targetTime = normalizedTime * this.totalDuration;
        let currentTime = 0;
        for (let i = 0; i < this.frames.length; i++) {
            currentTime += this.frames[i].duration;
            if (targetTime <= currentTime) {
                return { frame: this.frames[i], frameIndex: i };
            }
        }
        // Fallback - zwróć ostatnią klatkę
        return { frame: this.frames[this.frames.length - 1], frameIndex: this.frames.length - 1 };
    }
    /**
     * Normalizuje czas według trybu animacji
     */
    getNormalizedTime(time) {
        if (this.totalDuration === 0)
            return 0;
        const t = time / this.totalDuration;
        switch (this.mode) {
            case AnimationMode.ONCE:
                return Math.min(t, 1);
            case AnimationMode.LOOP:
                return t % 1;
            case AnimationMode.PING_PONG:
                const cycle = t % 2;
                return cycle <= 1 ? cycle : 2 - cycle;
            default:
                return t % 1;
        }
    }
    /**
     * Sprawdza czy animacja się zakończyła (dla trybu ONCE)
     */
    isFinished(time) {
        if (this.mode !== AnimationMode.ONCE)
            return false;
        return time >= this.totalDuration;
    }
    /**
     * Klonuje klip animacji
     */
    clone() {
        const clonedFrames = this.frames.map(frame => ({
            ...frame,
            offset: frame.offset?.clone()
        }));
        return new AnimationClip(this.name, clonedFrames, this.mode);
    }
}
exports.AnimationClip = AnimationClip;
/**
 * Stan odtwarzania animacji
 */
class AnimationState {
    constructor(clip) {
        this.isPlaying = false;
        this.currentTime = 0;
        this.playbackSpeed = 1;
        this.lastFrameIndex = -1;
        this.clip = clip;
    }
    /**
     * Uruchamia animację
     */
    play() {
        this.isPlaying = true;
    }
    /**
     * Pauzuje animację
     */
    pause() {
        this.isPlaying = false;
    }
    /**
     * Zatrzymuje i resetuje animację
     */
    stop() {
        this.isPlaying = false;
        this.currentTime = 0;
        this.lastFrameIndex = -1;
    }
    /**
     * Aktualizuje stan animacji
     */
    update(deltaTime) {
        if (!this.isPlaying)
            return;
        this.currentTime += deltaTime * this.playbackSpeed;
        // Sprawdź czy animacja się zakończyła
        if (this.clip.isFinished(this.currentTime)) {
            this.stop();
        }
    }
    /**
     * Zwraca bieżącą klatkę animacji
     */
    getCurrentFrame() {
        return this.clip.getFrameAtTime(this.currentTime);
    }
    /**
     * Sprawdza czy zmienił się indeks klatki (przydatne do triggerowania zdarzeń)
     */
    hasFrameChanged() {
        const currentFrameIndex = this.getCurrentFrame().frameIndex;
        const changed = currentFrameIndex !== this.lastFrameIndex;
        this.lastFrameIndex = currentFrameIndex;
        return changed;
    }
    /**
     * Ustawia czas animacji na określony punkt
     */
    setTime(time) {
        this.currentTime = Math.max(0, time);
    }
    /**
     * Zwraca znormalizowany progres animacji (0-1)
     */
    getProgress() {
        if (this.clip.totalDuration === 0)
            return 1;
        return Math.min(this.currentTime / this.clip.totalDuration, 1);
    }
}
exports.AnimationState = AnimationState;
/**
 * Manager animacji dla sprite'a
 */
class AnimationController {
    constructor() {
        this.clips = new Map();
        this.currentState = null;
        this.defaultClip = null;
    }
    /**
     * Dodaje klip animacji
     */
    addClip(clip) {
        this.clips.set(clip.name, clip);
        if (!this.defaultClip) {
            this.defaultClip = clip.name;
        }
    }
    /**
     * Usuwa klip animacji
     */
    removeClip(name) {
        this.clips.delete(name);
        if (this.defaultClip === name) {
            const firstKey = this.clips.keys().next().value;
            this.defaultClip = firstKey || null;
        }
        if (this.currentState?.clip.name === name) {
            this.currentState = null;
        }
    }
    /**
     * Odtwarza animację
     */
    play(clipName, restart = false) {
        const clip = this.clips.get(clipName);
        if (!clip)
            return false;
        if (this.currentState?.clip.name === clipName && !restart) {
            this.currentState.play();
            return true;
        }
        this.currentState = new AnimationState(clip);
        this.currentState.play();
        return true;
    }
    /**
     * Pauzuje bieżącą animację
     */
    pause() {
        this.currentState?.pause();
    }
    /**
     * Zatrzymuje bieżącą animację
     */
    stop() {
        this.currentState?.stop();
    }
    /**
     * Odtwarza domyślną animację
     */
    playDefault() {
        if (!this.defaultClip)
            return false;
        return this.play(this.defaultClip);
    }
    /**
     * Ustawia domyślną animację
     */
    setDefaultClip(clipName) {
        if (!this.clips.has(clipName))
            return false;
        this.defaultClip = clipName;
        return true;
    }
    /**
     * Aktualizuje kontroler animacji
     */
    update(deltaTime) {
        this.currentState?.update(deltaTime);
    }
    /**
     * Zwraca bieżącą klatkę animacji
     */
    getCurrentFrame() {
        return this.currentState?.getCurrentFrame().frame || null;
    }
    /**
     * Zwraca nazwę bieżącej animacji
     */
    getCurrentClipName() {
        return this.currentState?.clip.name || null;
    }
    /**
     * Sprawdza czy animacja jest odtwarzana
     */
    isPlaying() {
        return this.currentState?.isPlaying || false;
    }
    /**
     * Sprawdza czy bieżąca klatka się zmieniła
     */
    hasFrameChanged() {
        return this.currentState?.hasFrameChanged() || false;
    }
    /**
     * Ustawia prędkość odtwarzania
     */
    setPlaybackSpeed(speed) {
        if (this.currentState) {
            this.currentState.playbackSpeed = speed;
        }
    }
    /**
     * Zwraca listę dostępnych klipów
     */
    getClipNames() {
        return Array.from(this.clips.keys());
    }
    /**
     * Sprawdza czy klip istnieje
     */
    hasClip(name) {
        return this.clips.has(name);
    }
    /**
     * Czyści wszystkie klipy
     */
    clear() {
        this.clips.clear();
        this.currentState = null;
        this.defaultClip = null;
    }
}
exports.AnimationController = AnimationController;
/**
 * Utility do tworzenia animacji sprite sheet
 */
class SpriteSheetAnimationBuilder {
    /**
     * Tworzy animację z sprite sheet'a (siatka klatek)
     */
    static createFromGrid(name, frameWidth, frameHeight, startFrame, frameCount, frameDuration, columns, mode = AnimationMode.LOOP) {
        const frames = [];
        for (let i = 0; i < frameCount; i++) {
            const frameIndex = startFrame + i;
            const col = frameIndex % columns;
            const row = Math.floor(frameIndex / columns);
            frames.push({
                sourceRect: {
                    x: col * frameWidth,
                    y: row * frameHeight,
                    width: frameWidth,
                    height: frameHeight
                },
                duration: frameDuration
            });
        }
        return new AnimationClip(name, frames, mode);
    }
    /**
     * Tworzy animację z listy pozycji klatek
     */
    static createFromFrames(name, framePositions, frameDuration, mode = AnimationMode.LOOP) {
        const frames = framePositions.map(pos => ({
            sourceRect: pos,
            duration: frameDuration
        }));
        return new AnimationClip(name, frames, mode);
    }
    /**
     * Tworzy prostą animację z jedną klatką (static sprite)
     */
    static createStatic(name, sourceRect) {
        const frame = {
            sourceRect,
            duration: 1000 // Arbitralna wartość dla statycznego sprite'a
        };
        return new AnimationClip(name, [frame], AnimationMode.ONCE);
    }
}
exports.SpriteSheetAnimationBuilder = SpriteSheetAnimationBuilder;
//# sourceMappingURL=Animation.js.map