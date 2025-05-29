"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioManager = exports.AudioInstance = exports.AudioSource = exports.AudioType = void 0;
const eventemitter3_1 = require("eventemitter3");
const Vector2_1 = require("../math/Vector2");
/**
 * Enum dla typów audio
 */
var AudioType;
(function (AudioType) {
    AudioType["SFX"] = "sfx";
    AudioType["MUSIC"] = "music";
    AudioType["VOICE"] = "voice";
    AudioType["AMBIENT"] = "ambient";
})(AudioType || (exports.AudioType = AudioType = {}));
/**
 * Klasa reprezentująca źródło dźwięku
 */
class AudioSource {
    constructor(name, url, config = {}) {
        this.buffer = null;
        this.isLoaded = false;
        this.isLoading = false;
        this.loadPromise = null;
        this.name = name;
        this.url = url;
        this.config = {
            volume: 1.0,
            loop: false,
            type: AudioType.SFX,
            preload: false,
            spatialAudio: false,
            maxDistance: 1000,
            rolloffFactor: 1,
            ...config
        };
    }
    /**
     * Ładuje plik audio
     */
    async load(audioContext) {
        if (this.isLoaded || this.isLoading) {
            return this.loadPromise || Promise.resolve();
        }
        this.isLoading = true;
        this.loadPromise = this._doLoad(audioContext);
        try {
            await this.loadPromise;
            this.isLoaded = true;
        }
        catch (error) {
            console.error(`Błąd ładowania audio '${this.name}':`, error);
            throw error;
        }
        finally {
            this.isLoading = false;
        }
    }
    async _doLoad(audioContext) {
        const response = await fetch(this.url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        this.buffer = await audioContext.decodeAudioData(arrayBuffer);
    }
}
exports.AudioSource = AudioSource;
/**
 * Instancja odtwarzanego dźwięku
 */
class AudioInstance {
    constructor(id, source, audioContext, volume = 1) {
        this.isPlaying = false;
        this.isPaused = false;
        this.startTime = 0;
        this.pauseTime = 0;
        this.bufferSource = null;
        this.pannerNode = null;
        this.id = id;
        this.source = source;
        this.audioContext = audioContext;
        this.volume = volume;
        // Tworzenie węzłów audio
        this.gainNode = audioContext.createGain();
        this.gainNode.gain.value = volume;
        if (source.config.spatialAudio) {
            this.pannerNode = audioContext.createPanner();
            this.pannerNode.panningModel = 'HRTF';
            this.pannerNode.distanceModel = 'inverse';
            this.pannerNode.maxDistance = source.config.maxDistance || 1000;
            this.pannerNode.rolloffFactor = source.config.rolloffFactor || 1;
        }
    }
    /**
     * Odtwarza dźwięk
     */
    play(onEnded) {
        if (!this.source.buffer) {
            console.warn(`Audio '${this.source.name}' nie jest załadowane`);
            return;
        }
        this.stop(); // Zatrzymaj istniejące odtwarzanie
        this.bufferSource = this.audioContext.createBufferSource();
        this.bufferSource.buffer = this.source.buffer;
        this.bufferSource.loop = this.source.config.loop || false;
        this.onEndedCallback = onEnded;
        this.bufferSource.onended = () => {
            this.isPlaying = false;
            this.onEndedCallback?.();
        };
        // Podłączenie węzłów
        if (this.pannerNode) {
            this.bufferSource.connect(this.pannerNode);
            this.pannerNode.connect(this.gainNode);
        }
        else {
            this.bufferSource.connect(this.gainNode);
        }
        this.gainNode.connect(this.audioContext.destination);
        // Rozpoczęcie odtwarzania
        const when = this.audioContext.currentTime;
        const offset = this.isPaused ? this.pauseTime : 0;
        this.bufferSource.start(when, offset);
        this.startTime = when - offset;
        this.isPlaying = true;
        this.isPaused = false;
    }
    /**
     * Pauzuje dźwięk
     */
    pause() {
        if (!this.isPlaying || this.isPaused)
            return;
        this.pauseTime = this.audioContext.currentTime - this.startTime;
        this.stop();
        this.isPaused = true;
    }
    /**
     * Wznawia odtwarzanie
     */
    resume() {
        if (!this.isPaused)
            return;
        this.play(this.onEndedCallback);
    }
    /**
     * Zatrzymuje dźwięk
     */
    stop() {
        if (this.bufferSource) {
            try {
                this.bufferSource.stop();
            }
            catch (e) {
                // Ignore - może być już zatrzymany
            }
            this.bufferSource.disconnect();
            this.bufferSource = null;
        }
        this.isPlaying = false;
        this.isPaused = false;
        this.pauseTime = 0;
    }
    /**
     * Ustawia głośność
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.gainNode.gain.value = this.volume;
    }
    /**
     * Ustawia pozycję 3D (dla spatial audio)
     */
    setPosition(position) {
        if (!this.pannerNode)
            return;
        this.position = position;
        this.pannerNode.positionX.value = position.x;
        this.pannerNode.positionY.value = 0;
        this.pannerNode.positionZ.value = position.y;
    }
    /**
     * Zwraca aktualny czas odtwarzania
     */
    getCurrentTime() {
        if (!this.isPlaying)
            return this.pauseTime;
        return this.audioContext.currentTime - this.startTime;
    }
    /**
     * Niszczy instancję
     */
    destroy() {
        this.stop();
        this.gainNode.disconnect();
        this.pannerNode?.disconnect();
    }
}
exports.AudioInstance = AudioInstance;
/**
 * Manager audio dla silnika gry
 */
class AudioManager extends eventemitter3_1.EventEmitter {
    constructor() {
        super();
        this.sources = new Map();
        this.instances = new Map();
        this.nextInstanceId = 1;
        this.masterVolume = 1.0;
        this.volumes = new Map();
        this.listenerPosition = new Vector2_1.Vector2();
        this.isInitialized = false;
        this.isSupported = false;
        // Sprawdź wsparcie Web Audio API
        this.isSupported = 'AudioContext' in window || 'webkitAudioContext' in window;
        if (this.isSupported) {
            // @ts-ignore
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContextClass();
        }
        // Domyślne głośności dla typów
        this.volumes.set(AudioType.SFX, 1.0);
        this.volumes.set(AudioType.MUSIC, 0.7);
        this.volumes.set(AudioType.VOICE, 1.0);
        this.volumes.set(AudioType.AMBIENT, 0.5);
    }
    /**
     * Inicjalizuje audio manager (wymaga interakcji użytkownika)
     */
    async initialize() {
        if (!this.isSupported) {
            throw new Error('Web Audio API nie jest obsługiwane');
        }
        if (this.isInitialized)
            return;
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        this.isInitialized = true;
        this.emit('initialized');
    }
    /**
     * Dodaje źródło audio
     */
    addAudioSource(source) {
        this.sources.set(source.name, source);
        if (source.config.preload) {
            this.preloadAudio(source.name);
        }
    }
    /**
     * Usuwa źródło audio
     */
    removeAudioSource(name) {
        this.sources.delete(name);
        // Zatrzymaj wszystkie instancje tego audio
        for (const [id, instance] of this.instances) {
            if (instance.source.name === name) {
                instance.destroy();
                this.instances.delete(id);
            }
        }
    }
    /**
     * Preładowuje audio
     */
    async preloadAudio(name) {
        const source = this.sources.get(name);
        if (!source) {
            throw new Error(`Audio source '${name}' nie istnieje`);
        }
        if (!this.isInitialized) {
            await this.initialize();
        }
        await source.load(this.audioContext);
        this.emit('audioLoaded', name);
    }
    /**
     * Odtwarza dźwięk
     */
    async play(name, config) {
        const source = this.sources.get(name);
        if (!source) {
            throw new Error(`Audio source '${name}' nie istnieje`);
        }
        if (!this.isInitialized) {
            await this.initialize();
        }
        if (!source.isLoaded) {
            await source.load(this.audioContext);
        }
        const mergedConfig = { ...source.config, ...config };
        const typeVolume = this.volumes.get(mergedConfig.type) || 1.0;
        const finalVolume = this.masterVolume * typeVolume * (mergedConfig.volume || 1.0);
        const instance = new AudioInstance(this.nextInstanceId++, source, this.audioContext, finalVolume);
        this.instances.set(instance.id, instance);
        instance.play(() => {
            this.instances.delete(instance.id);
            this.emit('audioEnded', name, instance.id);
        });
        this.emit('audioStarted', name, instance.id);
        return instance.id;
    }
    /**
     * Odtwarza dźwięk przestrzenny
     */
    async playSpatial(name, position, config) {
        const spatialConfig = { ...config, spatialAudio: true };
        const instanceId = await this.play(name, spatialConfig);
        const instance = this.instances.get(instanceId);
        if (instance) {
            instance.setPosition(position);
        }
        return instanceId;
    }
    /**
     * Zatrzymuje odtwarzanie
     */
    stop(instanceId) {
        const instance = this.instances.get(instanceId);
        if (instance) {
            instance.destroy();
            this.instances.delete(instanceId);
            this.emit('audioStopped', instance.source.name, instanceId);
        }
    }
    /**
     * Zatrzymuje wszystkie dźwięki
     */
    stopAll() {
        for (const [id, instance] of this.instances) {
            instance.destroy();
            this.emit('audioStopped', instance.source.name, id);
        }
        this.instances.clear();
    }
    /**
     * Zatrzymuje wszystkie dźwięki danego typu
     */
    stopAllOfType(type) {
        const toStop = [];
        for (const [id, instance] of this.instances) {
            if (instance.source.config.type === type) {
                toStop.push(id);
            }
        }
        toStop.forEach(id => this.stop(id));
    }
    /**
     * Pauzuje wszystkie dźwięki
     */
    pauseAll() {
        for (const instance of this.instances.values()) {
            instance.pause();
        }
    }
    /**
     * Wznawia wszystkie dźwięki
     */
    resumeAll() {
        for (const instance of this.instances.values()) {
            instance.resume();
        }
    }
    /**
     * Ustawia główną głośność
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
    }
    /**
     * Ustawia głośność dla typu audio
     */
    setTypeVolume(type, volume) {
        this.volumes.set(type, Math.max(0, Math.min(1, volume)));
        this.updateAllVolumes();
    }
    /**
     * Ustawia pozycję słuchacza (dla spatial audio)
     */
    setListenerPosition(position) {
        this.listenerPosition = position;
        if (this.audioContext.listener.positionX) {
            this.audioContext.listener.positionX.value = position.x;
            this.audioContext.listener.positionY.value = 0;
            this.audioContext.listener.positionZ.value = position.y;
        }
    }
    /**
     * Zwraca informacje o stanie audio
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isSupported: this.isSupported,
            sourceCount: this.sources.size,
            activeInstances: this.instances.size,
            masterVolume: this.masterVolume
        };
    }
    /**
     * Aktualizuje głośność wszystkich instancji
     */
    updateAllVolumes() {
        for (const instance of this.instances.values()) {
            const typeVolume = this.volumes.get(instance.source.config.type) || 1.0;
            const finalVolume = this.masterVolume * typeVolume * (instance.source.config.volume || 1.0);
            instance.setVolume(finalVolume);
        }
    }
    /**
     * Niszczy audio manager
     */
    destroy() {
        this.stopAll();
        this.sources.clear();
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}
exports.AudioManager = AudioManager;
//# sourceMappingURL=AudioManager.js.map