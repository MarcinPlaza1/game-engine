import { EventEmitter } from 'eventemitter3';
import { Vector2 } from '../math/Vector2';
/**
 * Enum dla typów audio
 */
export declare enum AudioType {
    SFX = "sfx",
    MUSIC = "music",
    VOICE = "voice",
    AMBIENT = "ambient"
}
/**
 * Konfiguracja audio
 */
export interface AudioConfig {
    volume?: number;
    loop?: boolean;
    type?: AudioType;
    preload?: boolean;
    spatialAudio?: boolean;
    maxDistance?: number;
    rolloffFactor?: number;
}
/**
 * Klasa reprezentująca źródło dźwięku
 */
export declare class AudioSource {
    readonly name: string;
    readonly url: string;
    config: AudioConfig;
    buffer: AudioBuffer | null;
    isLoaded: boolean;
    isLoading: boolean;
    private loadPromise;
    constructor(name: string, url: string, config?: AudioConfig);
    /**
     * Ładuje plik audio
     */
    load(audioContext: AudioContext): Promise<void>;
    private _doLoad;
}
/**
 * Instancja odtwarzanego dźwięku
 */
export declare class AudioInstance {
    readonly id: number;
    readonly source: AudioSource;
    position?: Vector2;
    volume: number;
    isPlaying: boolean;
    isPaused: boolean;
    startTime: number;
    pauseTime: number;
    private audioContext;
    private bufferSource;
    private gainNode;
    private pannerNode;
    private onEndedCallback?;
    constructor(id: number, source: AudioSource, audioContext: AudioContext, volume?: number);
    /**
     * Odtwarza dźwięk
     */
    play(onEnded?: () => void): void;
    /**
     * Pauzuje dźwięk
     */
    pause(): void;
    /**
     * Wznawia odtwarzanie
     */
    resume(): void;
    /**
     * Zatrzymuje dźwięk
     */
    stop(): void;
    /**
     * Ustawia głośność
     */
    setVolume(volume: number): void;
    /**
     * Ustawia pozycję 3D (dla spatial audio)
     */
    setPosition(position: Vector2): void;
    /**
     * Zwraca aktualny czas odtwarzania
     */
    getCurrentTime(): number;
    /**
     * Niszczy instancję
     */
    destroy(): void;
}
/**
 * Manager audio dla silnika gry
 */
export declare class AudioManager extends EventEmitter {
    private audioContext;
    private sources;
    private instances;
    private nextInstanceId;
    private masterVolume;
    private volumes;
    private listenerPosition;
    private isInitialized;
    private isSupported;
    constructor();
    /**
     * Inicjalizuje audio manager (wymaga interakcji użytkownika)
     */
    initialize(): Promise<void>;
    /**
     * Dodaje źródło audio
     */
    addAudioSource(source: AudioSource): void;
    /**
     * Usuwa źródło audio
     */
    removeAudioSource(name: string): void;
    /**
     * Preładowuje audio
     */
    preloadAudio(name: string): Promise<void>;
    /**
     * Odtwarza dźwięk
     */
    play(name: string, config?: Partial<AudioConfig>): Promise<number>;
    /**
     * Odtwarza dźwięk przestrzenny
     */
    playSpatial(name: string, position: Vector2, config?: Partial<AudioConfig>): Promise<number>;
    /**
     * Zatrzymuje odtwarzanie
     */
    stop(instanceId: number): void;
    /**
     * Zatrzymuje wszystkie dźwięki
     */
    stopAll(): void;
    /**
     * Zatrzymuje wszystkie dźwięki danego typu
     */
    stopAllOfType(type: AudioType): void;
    /**
     * Pauzuje wszystkie dźwięki
     */
    pauseAll(): void;
    /**
     * Wznawia wszystkie dźwięki
     */
    resumeAll(): void;
    /**
     * Ustawia główną głośność
     */
    setMasterVolume(volume: number): void;
    /**
     * Ustawia głośność dla typu audio
     */
    setTypeVolume(type: AudioType, volume: number): void;
    /**
     * Ustawia pozycję słuchacza (dla spatial audio)
     */
    setListenerPosition(position: Vector2): void;
    /**
     * Zwraca informacje o stanie audio
     */
    getStatus(): {
        isInitialized: boolean;
        isSupported: boolean;
        sourceCount: number;
        activeInstances: number;
        masterVolume: number;
    };
    /**
     * Aktualizuje głośność wszystkich instancji
     */
    private updateAllVolumes;
    /**
     * Niszczy audio manager
     */
    destroy(): void;
}
//# sourceMappingURL=AudioManager.d.ts.map