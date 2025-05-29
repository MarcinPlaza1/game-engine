import { Vector2 } from '../math/Vector2';
/**
 * Enum dla trybów powtarzania animacji
 */
export declare enum AnimationMode {
    ONCE = "once",
    LOOP = "loop",
    PING_PONG = "ping_pong"
}
/**
 * Klatka animacji
 */
export interface AnimationFrame {
    sourceRect: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    duration: number;
    offset?: Vector2;
}
/**
 * Definicja animacji
 */
export declare class AnimationClip {
    name: string;
    frames: AnimationFrame[];
    mode: AnimationMode;
    totalDuration: number;
    constructor(name: string, frames: AnimationFrame[], mode?: AnimationMode);
    /**
     * Zwraca klatkę w określonym czasie
     */
    getFrameAtTime(time: number): {
        frame: AnimationFrame;
        frameIndex: number;
    };
    /**
     * Normalizuje czas według trybu animacji
     */
    private getNormalizedTime;
    /**
     * Sprawdza czy animacja się zakończyła (dla trybu ONCE)
     */
    isFinished(time: number): boolean;
    /**
     * Klonuje klip animacji
     */
    clone(): AnimationClip;
}
/**
 * Stan odtwarzania animacji
 */
export declare class AnimationState {
    clip: AnimationClip;
    isPlaying: boolean;
    currentTime: number;
    playbackSpeed: number;
    lastFrameIndex: number;
    constructor(clip: AnimationClip);
    /**
     * Uruchamia animację
     */
    play(): void;
    /**
     * Pauzuje animację
     */
    pause(): void;
    /**
     * Zatrzymuje i resetuje animację
     */
    stop(): void;
    /**
     * Aktualizuje stan animacji
     */
    update(deltaTime: number): void;
    /**
     * Zwraca bieżącą klatkę animacji
     */
    getCurrentFrame(): {
        frame: AnimationFrame;
        frameIndex: number;
    };
    /**
     * Sprawdza czy zmienił się indeks klatki (przydatne do triggerowania zdarzeń)
     */
    hasFrameChanged(): boolean;
    /**
     * Ustawia czas animacji na określony punkt
     */
    setTime(time: number): void;
    /**
     * Zwraca znormalizowany progres animacji (0-1)
     */
    getProgress(): number;
}
/**
 * Manager animacji dla sprite'a
 */
export declare class AnimationController {
    private clips;
    private currentState;
    private defaultClip;
    /**
     * Dodaje klip animacji
     */
    addClip(clip: AnimationClip): void;
    /**
     * Usuwa klip animacji
     */
    removeClip(name: string): void;
    /**
     * Odtwarza animację
     */
    play(clipName: string, restart?: boolean): boolean;
    /**
     * Pauzuje bieżącą animację
     */
    pause(): void;
    /**
     * Zatrzymuje bieżącą animację
     */
    stop(): void;
    /**
     * Odtwarza domyślną animację
     */
    playDefault(): boolean;
    /**
     * Ustawia domyślną animację
     */
    setDefaultClip(clipName: string): boolean;
    /**
     * Aktualizuje kontroler animacji
     */
    update(deltaTime: number): void;
    /**
     * Zwraca bieżącą klatkę animacji
     */
    getCurrentFrame(): AnimationFrame | null;
    /**
     * Zwraca nazwę bieżącej animacji
     */
    getCurrentClipName(): string | null;
    /**
     * Sprawdza czy animacja jest odtwarzana
     */
    isPlaying(): boolean;
    /**
     * Sprawdza czy bieżąca klatka się zmieniła
     */
    hasFrameChanged(): boolean;
    /**
     * Ustawia prędkość odtwarzania
     */
    setPlaybackSpeed(speed: number): void;
    /**
     * Zwraca listę dostępnych klipów
     */
    getClipNames(): string[];
    /**
     * Sprawdza czy klip istnieje
     */
    hasClip(name: string): boolean;
    /**
     * Czyści wszystkie klipy
     */
    clear(): void;
}
/**
 * Utility do tworzenia animacji sprite sheet
 */
export declare class SpriteSheetAnimationBuilder {
    /**
     * Tworzy animację z sprite sheet'a (siatka klatek)
     */
    static createFromGrid(name: string, frameWidth: number, frameHeight: number, startFrame: number, frameCount: number, frameDuration: number, columns: number, mode?: AnimationMode): AnimationClip;
    /**
     * Tworzy animację z listy pozycji klatek
     */
    static createFromFrames(name: string, framePositions: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
    }>, frameDuration: number, mode?: AnimationMode): AnimationClip;
    /**
     * Tworzy prostą animację z jedną klatką (static sprite)
     */
    static createStatic(name: string, sourceRect: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): AnimationClip;
}
//# sourceMappingURL=Animation.d.ts.map