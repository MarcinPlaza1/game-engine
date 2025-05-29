import { Vector2 } from '../math/Vector2';

/**
 * Enum dla trybów powtarzania animacji
 */
export enum AnimationMode {
  ONCE = 'once',
  LOOP = 'loop',
  PING_PONG = 'ping_pong'
}

/**
 * Klatka animacji
 */
export interface AnimationFrame {
  sourceRect: { x: number; y: number; width: number; height: number };
  duration: number; // w milisekundach
  offset?: Vector2; // opcjonalny offset dla tej klatki
}

/**
 * Definicja animacji
 */
export class AnimationClip {
  public name: string;
  public frames: AnimationFrame[];
  public mode: AnimationMode;
  public totalDuration: number;

  constructor(name: string, frames: AnimationFrame[], mode: AnimationMode = AnimationMode.LOOP) {
    this.name = name;
    this.frames = frames;
    this.mode = mode;
    this.totalDuration = frames.reduce((sum, frame) => sum + frame.duration, 0);
  }

  /**
   * Zwraca klatkę w określonym czasie
   */
  getFrameAtTime(time: number): { frame: AnimationFrame; frameIndex: number } {
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
  private getNormalizedTime(time: number): number {
    if (this.totalDuration === 0) return 0;

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
  isFinished(time: number): boolean {
    if (this.mode !== AnimationMode.ONCE) return false;
    return time >= this.totalDuration;
  }

  /**
   * Klonuje klip animacji
   */
  clone(): AnimationClip {
    const clonedFrames = this.frames.map(frame => ({
      ...frame,
      offset: frame.offset?.clone()
    }));
    return new AnimationClip(this.name, clonedFrames, this.mode);
  }
}

/**
 * Stan odtwarzania animacji
 */
export class AnimationState {
  public clip: AnimationClip;
  public isPlaying: boolean = false;
  public currentTime: number = 0;
  public playbackSpeed: number = 1;
  public lastFrameIndex: number = -1;

  constructor(clip: AnimationClip) {
    this.clip = clip;
  }

  /**
   * Uruchamia animację
   */
  play(): void {
    this.isPlaying = true;
  }

  /**
   * Pauzuje animację
   */
  pause(): void {
    this.isPlaying = false;
  }

  /**
   * Zatrzymuje i resetuje animację
   */
  stop(): void {
    this.isPlaying = false;
    this.currentTime = 0;
    this.lastFrameIndex = -1;
  }

  /**
   * Aktualizuje stan animacji
   */
  update(deltaTime: number): void {
    if (!this.isPlaying) return;

    this.currentTime += deltaTime * this.playbackSpeed;

    // Sprawdź czy animacja się zakończyła
    if (this.clip.isFinished(this.currentTime)) {
      this.stop();
    }
  }

  /**
   * Zwraca bieżącą klatkę animacji
   */
  getCurrentFrame(): { frame: AnimationFrame; frameIndex: number } {
    return this.clip.getFrameAtTime(this.currentTime);
  }

  /**
   * Sprawdza czy zmienił się indeks klatki (przydatne do triggerowania zdarzeń)
   */
  hasFrameChanged(): boolean {
    const currentFrameIndex = this.getCurrentFrame().frameIndex;
    const changed = currentFrameIndex !== this.lastFrameIndex;
    this.lastFrameIndex = currentFrameIndex;
    return changed;
  }

  /**
   * Ustawia czas animacji na określony punkt
   */
  setTime(time: number): void {
    this.currentTime = Math.max(0, time);
  }

  /**
   * Zwraca znormalizowany progres animacji (0-1)
   */
  getProgress(): number {
    if (this.clip.totalDuration === 0) return 1;
    return Math.min(this.currentTime / this.clip.totalDuration, 1);
  }
}

/**
 * Manager animacji dla sprite'a
 */
export class AnimationController {
  private clips: Map<string, AnimationClip> = new Map();
  private currentState: AnimationState | null = null;
  private defaultClip: string | null = null;

  /**
   * Dodaje klip animacji
   */
  addClip(clip: AnimationClip): void {
    this.clips.set(clip.name, clip);
    
    if (!this.defaultClip) {
      this.defaultClip = clip.name;
    }
  }

  /**
   * Usuwa klip animacji
   */
  removeClip(name: string): void {
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
  play(clipName: string, restart: boolean = false): boolean {
    const clip = this.clips.get(clipName);
    if (!clip) return false;

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
  pause(): void {
    this.currentState?.pause();
  }

  /**
   * Zatrzymuje bieżącą animację
   */
  stop(): void {
    this.currentState?.stop();
  }

  /**
   * Odtwarza domyślną animację
   */
  playDefault(): boolean {
    if (!this.defaultClip) return false;
    return this.play(this.defaultClip);
  }

  /**
   * Ustawia domyślną animację
   */
  setDefaultClip(clipName: string): boolean {
    if (!this.clips.has(clipName)) return false;
    this.defaultClip = clipName;
    return true;
  }

  /**
   * Aktualizuje kontroler animacji
   */
  update(deltaTime: number): void {
    this.currentState?.update(deltaTime);
  }

  /**
   * Zwraca bieżącą klatkę animacji
   */
  getCurrentFrame(): AnimationFrame | null {
    return this.currentState?.getCurrentFrame().frame || null;
  }

  /**
   * Zwraca nazwę bieżącej animacji
   */
  getCurrentClipName(): string | null {
    return this.currentState?.clip.name || null;
  }

  /**
   * Sprawdza czy animacja jest odtwarzana
   */
  isPlaying(): boolean {
    return this.currentState?.isPlaying || false;
  }

  /**
   * Sprawdza czy bieżąca klatka się zmieniła
   */
  hasFrameChanged(): boolean {
    return this.currentState?.hasFrameChanged() || false;
  }

  /**
   * Ustawia prędkość odtwarzania
   */
  setPlaybackSpeed(speed: number): void {
    if (this.currentState) {
      this.currentState.playbackSpeed = speed;
    }
  }

  /**
   * Zwraca listę dostępnych klipów
   */
  getClipNames(): string[] {
    return Array.from(this.clips.keys());
  }

  /**
   * Sprawdza czy klip istnieje
   */
  hasClip(name: string): boolean {
    return this.clips.has(name);
  }

  /**
   * Czyści wszystkie klipy
   */
  clear(): void {
    this.clips.clear();
    this.currentState = null;
    this.defaultClip = null;
  }
}

/**
 * Utility do tworzenia animacji sprite sheet
 */
export class SpriteSheetAnimationBuilder {
  /**
   * Tworzy animację z sprite sheet'a (siatka klatek)
   */
  static createFromGrid(
    name: string,
    frameWidth: number,
    frameHeight: number,
    startFrame: number,
    frameCount: number,
    frameDuration: number,
    columns: number,
    mode: AnimationMode = AnimationMode.LOOP
  ): AnimationClip {
    const frames: AnimationFrame[] = [];
    
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
  static createFromFrames(
    name: string,
    framePositions: Array<{ x: number; y: number; width: number; height: number }>,
    frameDuration: number,
    mode: AnimationMode = AnimationMode.LOOP
  ): AnimationClip {
    const frames: AnimationFrame[] = framePositions.map(pos => ({
      sourceRect: pos,
      duration: frameDuration
    }));
    
    return new AnimationClip(name, frames, mode);
  }

  /**
   * Tworzy prostą animację z jedną klatką (static sprite)
   */
  static createStatic(
    name: string,
    sourceRect: { x: number; y: number; width: number; height: number }
  ): AnimationClip {
    const frame: AnimationFrame = {
      sourceRect,
      duration: 1000 // Arbitralna wartość dla statycznego sprite'a
    };
    
    return new AnimationClip(name, [frame], AnimationMode.ONCE);
  }
} 