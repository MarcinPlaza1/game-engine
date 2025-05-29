import { EventEmitter } from 'eventemitter3';
import { Vector2 } from '../math/Vector2';

/**
 * Enum dla typów audio
 */
export enum AudioType {
  SFX = 'sfx',
  MUSIC = 'music',
  VOICE = 'voice',
  AMBIENT = 'ambient'
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
export class AudioSource {
  public readonly name: string;
  public readonly url: string;
  public config: AudioConfig;
  public buffer: AudioBuffer | null = null;
  public isLoaded: boolean = false;
  public isLoading: boolean = false;
  
  private loadPromise: Promise<void> | null = null;

  constructor(name: string, url: string, config: AudioConfig = {}) {
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
  async load(audioContext: AudioContext): Promise<void> {
    if (this.isLoaded || this.isLoading) {
      return this.loadPromise || Promise.resolve();
    }

    this.isLoading = true;
    this.loadPromise = this._doLoad(audioContext);
    
    try {
      await this.loadPromise;
      this.isLoaded = true;
    } catch (error) {
      console.error(`Błąd ładowania audio '${this.name}':`, error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  private async _doLoad(audioContext: AudioContext): Promise<void> {
    const response = await fetch(this.url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    this.buffer = await audioContext.decodeAudioData(arrayBuffer);
  }
}

/**
 * Instancja odtwarzanego dźwięku
 */
export class AudioInstance {
  public readonly id: number;
  public readonly source: AudioSource;
  public position?: Vector2;
  public volume: number;
  public isPlaying: boolean = false;
  public isPaused: boolean = false;
  public startTime: number = 0;
  public pauseTime: number = 0;
  
  private audioContext: AudioContext;
  private bufferSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode;
  private pannerNode: PannerNode | null = null;
  private onEndedCallback?: () => void;

  constructor(id: number, source: AudioSource, audioContext: AudioContext, volume: number = 1) {
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
  play(onEnded?: () => void): void {
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
    } else {
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
  pause(): void {
    if (!this.isPlaying || this.isPaused) return;

    this.pauseTime = this.audioContext.currentTime - this.startTime;
    this.stop();
    this.isPaused = true;
  }

  /**
   * Wznawia odtwarzanie
   */
  resume(): void {
    if (!this.isPaused) return;
    this.play(this.onEndedCallback);
  }

  /**
   * Zatrzymuje dźwięk
   */
  stop(): void {
    if (this.bufferSource) {
      try {
        this.bufferSource.stop();
      } catch (e) {
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
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.gainNode.gain.value = this.volume;
  }

  /**
   * Ustawia pozycję 3D (dla spatial audio)
   */
  setPosition(position: Vector2): void {
    if (!this.pannerNode) return;
    
    this.position = position;
    this.pannerNode.positionX.value = position.x;
    this.pannerNode.positionY.value = 0;
    this.pannerNode.positionZ.value = position.y;
  }

  /**
   * Zwraca aktualny czas odtwarzania
   */
  getCurrentTime(): number {
    if (!this.isPlaying) return this.pauseTime;
    return this.audioContext.currentTime - this.startTime;
  }

  /**
   * Niszczy instancję
   */
  destroy(): void {
    this.stop();
    this.gainNode.disconnect();
    this.pannerNode?.disconnect();
  }
}

/**
 * Manager audio dla silnika gry
 */
export class AudioManager extends EventEmitter {
  private audioContext!: AudioContext;
  private sources: Map<string, AudioSource> = new Map();
  private instances: Map<number, AudioInstance> = new Map();
  private nextInstanceId: number = 1;
  
  private masterVolume: number = 1.0;
  private volumes: Map<AudioType, number> = new Map();
  private listenerPosition: Vector2 = new Vector2();
  
  private isInitialized: boolean = false;
  private isSupported: boolean = false;

  constructor() {
    super();
    
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
  async initialize(): Promise<void> {
    if (!this.isSupported) {
      throw new Error('Web Audio API nie jest obsługiwane');
    }

    if (this.isInitialized) return;

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.isInitialized = true;
    this.emit('initialized');
  }

  /**
   * Dodaje źródło audio
   */
  addAudioSource(source: AudioSource): void {
    this.sources.set(source.name, source);

    if (source.config.preload) {
      this.preloadAudio(source.name);
    }
  }

  /**
   * Usuwa źródło audio
   */
  removeAudioSource(name: string): void {
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
  async preloadAudio(name: string): Promise<void> {
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
  async play(name: string, config?: Partial<AudioConfig>): Promise<number> {
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
    const typeVolume = this.volumes.get(mergedConfig.type!) || 1.0;
    const finalVolume = this.masterVolume * typeVolume * (mergedConfig.volume || 1.0);

    const instance = new AudioInstance(
      this.nextInstanceId++,
      source,
      this.audioContext,
      finalVolume
    );

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
  async playSpatial(name: string, position: Vector2, config?: Partial<AudioConfig>): Promise<number> {
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
  stop(instanceId: number): void {
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
  stopAll(): void {
    for (const [id, instance] of this.instances) {
      instance.destroy();
      this.emit('audioStopped', instance.source.name, id);
    }
    this.instances.clear();
  }

  /**
   * Zatrzymuje wszystkie dźwięki danego typu
   */
  stopAllOfType(type: AudioType): void {
    const toStop: number[] = [];
    
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
  pauseAll(): void {
    for (const instance of this.instances.values()) {
      instance.pause();
    }
  }

  /**
   * Wznawia wszystkie dźwięki
   */
  resumeAll(): void {
    for (const instance of this.instances.values()) {
      instance.resume();
    }
  }

  /**
   * Ustawia główną głośność
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  /**
   * Ustawia głośność dla typu audio
   */
  setTypeVolume(type: AudioType, volume: number): void {
    this.volumes.set(type, Math.max(0, Math.min(1, volume)));
    this.updateAllVolumes();
  }

  /**
   * Ustawia pozycję słuchacza (dla spatial audio)
   */
  setListenerPosition(position: Vector2): void {
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
  getStatus(): {
    isInitialized: boolean;
    isSupported: boolean;
    sourceCount: number;
    activeInstances: number;
    masterVolume: number;
  } {
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
  private updateAllVolumes(): void {
    for (const instance of this.instances.values()) {
      const typeVolume = this.volumes.get(instance.source.config.type!) || 1.0;
      const finalVolume = this.masterVolume * typeVolume * (instance.source.config.volume || 1.0);
      instance.setVolume(finalVolume);
    }
  }

  /**
   * Niszczy audio manager
   */
  destroy(): void {
    this.stopAll();
    this.sources.clear();
    
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
} 