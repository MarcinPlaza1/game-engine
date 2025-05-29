import { EventEmitter } from 'eventemitter3';
import { Vector2 } from '../math/Vector2';

/**
 * Poziomy logowania
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

/**
 * Wpis w konsoli debug
 */
export interface DebugLogEntry {
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
}

/**
 * Metryki wydajności
 */
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  updateTime: number;
  renderTime: number;
  entityCount: number;
  systemCount: number;
  memoryUsage?: number;
}

/**
 * Konsola debug dla silnika gry
 */
export class DebugConsole extends EventEmitter {
  private logs: DebugLogEntry[] = [];
  private maxLogs: number = 1000;
  private currentLogLevel: LogLevel = LogLevel.DEBUG;
  private isVisible: boolean = false;
  private canvas: HTMLCanvasElement | null = null;
  private overlayElement: HTMLDivElement | null = null;
  
  private metrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    updateTime: 0,
    renderTime: 0,
    entityCount: 0,
    systemCount: 0
  };
  
  private commands: Map<string, (args: string[]) => void> = new Map();
  private watchedVariables: Map<string, () => any> = new Map();
  private visualDebugItems: Array<{
    type: 'point' | 'line' | 'rect' | 'circle' | 'text',
    data: any,
    color: string,
    duration: number,
    startTime: number
  }> = [];

  constructor() {
    super();
    this.setupDefaultCommands();
    this.setupKeyboardShortcuts();
  }

  /**
   * Inicjalizuje konsolę debug
   */
  initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.createOverlayElement();
    this.log(LogLevel.INFO, 'Debug', 'Debug Console zainicjalizowana');
  }

  /**
   * Loguje wiadomość
   */
  log(level: LogLevel, category: string, message: string, data?: any): void {
    if (level < this.currentLogLevel) return;

    const entry: DebugLogEntry = {
      timestamp: performance.now(),
      level,
      category,
      message,
      data
    };

    this.logs.push(entry);
    
    // Ograniczenie liczby logów
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Wypisz w konsoli przeglądarki
    const consoleMethods = ['debug', 'info', 'warn', 'error'];
    const consoleMethod = consoleMethods[level] as keyof Console;
    (console[consoleMethod] as Function)(`[${category}] ${message}`, data || '');

    this.emit('logAdded', entry);
    this.updateOverlay();
  }

  /**
   * Metody skrócone do logowania
   */
  debug(category: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  info(category: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  warn(category: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, category, message, data);
  }

  error(category: string, message: string, data?: any): void {
    this.log(LogLevel.ERROR, category, message, data);
  }

  /**
   * Aktualizuje metryki wydajności
   */
  updateMetrics(metrics: Partial<PerformanceMetrics>): void {
    this.metrics = { ...this.metrics, ...metrics };
    this.emit('metricsUpdated', this.metrics);
    if (this.isVisible) {
      this.updateOverlay();
    }
  }

  /**
   * Dodaje wizualny element debug do renderowania
   */
  drawDebugPoint(position: Vector2, color: string = '#ff0000', duration: number = 0): void {
    this.visualDebugItems.push({
      type: 'point',
      data: position.clone(),
      color,
      duration,
      startTime: performance.now()
    });
  }

  drawDebugLine(start: Vector2, end: Vector2, color: string = '#ff0000', duration: number = 0): void {
    this.visualDebugItems.push({
      type: 'line',
      data: { start: start.clone(), end: end.clone() },
      color,
      duration,
      startTime: performance.now()
    });
  }

  drawDebugRect(position: Vector2, width: number, height: number, color: string = '#ff0000', duration: number = 0): void {
    this.visualDebugItems.push({
      type: 'rect',
      data: { position: position.clone(), width, height },
      color,
      duration,
      startTime: performance.now()
    });
  }

  drawDebugCircle(center: Vector2, radius: number, color: string = '#ff0000', duration: number = 0): void {
    this.visualDebugItems.push({
      type: 'circle',
      data: { center: center.clone(), radius },
      color,
      duration,
      startTime: performance.now()
    });
  }

  drawDebugText(position: Vector2, text: string, color: string = '#ffffff', duration: number = 0): void {
    this.visualDebugItems.push({
      type: 'text',
      data: { position: position.clone(), text },
      color,
      duration,
      startTime: performance.now()
    });
  }

  /**
   * Renderuje wizualne elementy debug
   */
  renderDebugVisuals(ctx: CanvasRenderingContext2D): void {
    const currentTime = performance.now();
    
    // Usuń przedawnione elementy
    this.visualDebugItems = this.visualDebugItems.filter(item => {
      if (item.duration === 0) return true; // Permanentne
      return currentTime - item.startTime < item.duration;
    });

    // Renderuj elementy
    ctx.save();
    
    for (const item of this.visualDebugItems) {
      ctx.strokeStyle = item.color;
      ctx.fillStyle = item.color;
      ctx.lineWidth = 2;

      switch (item.type) {
        case 'point':
          ctx.beginPath();
          ctx.arc(item.data.x, item.data.y, 3, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'line':
          ctx.beginPath();
          ctx.moveTo(item.data.start.x, item.data.start.y);
          ctx.lineTo(item.data.end.x, item.data.end.y);
          ctx.stroke();
          break;

        case 'rect':
          ctx.strokeRect(item.data.position.x, item.data.position.y, item.data.width, item.data.height);
          break;

        case 'circle':
          ctx.beginPath();
          ctx.arc(item.data.center.x, item.data.center.y, item.data.radius, 0, Math.PI * 2);
          ctx.stroke();
          break;

        case 'text':
          ctx.font = '12px Arial';
          ctx.fillText(item.data.text, item.data.position.x, item.data.position.y);
          break;
      }
    }
    
    ctx.restore();
  }

  /**
   * Dodaje komendę debug
   */
  addCommand(name: string, handler: (args: string[]) => void): void {
    this.commands.set(name.toLowerCase(), handler);
  }

  /**
   * Wykonuje komendę debug
   */
  executeCommand(commandLine: string): void {
    const parts = commandLine.trim().split(' ');
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    const handler = this.commands.get(commandName);
    if (handler) {
      try {
        handler(args);
        this.info('Command', `Wykonano: ${commandLine}`);
      } catch (error) {
        this.error('Command', `Błąd wykonania komendy: ${error}`);
      }
    } else {
      this.warn('Command', `Nieznana komenda: ${commandName}`);
    }
  }

  /**
   * Dodaje zmienną do obserwowania
   */
  watchVariable(name: string, getter: () => any): void {
    this.watchedVariables.set(name, getter);
  }

  /**
   * Usuwa zmienną z obserwowania
   */
  unwatchVariable(name: string): void {
    this.watchedVariables.delete(name);
  }

  /**
   * Przełącza widoczność konsoli
   */
  toggle(): void {
    this.isVisible = !this.isVisible;
    if (this.overlayElement) {
      this.overlayElement.style.display = this.isVisible ? 'block' : 'none';
    }
    this.emit('visibilityChanged', this.isVisible);
  }

  /**
   * Czyści logi
   */
  clear(): void {
    this.logs = [];
    this.updateOverlay();
  }

  /**
   * Czyści wizualne elementy debug
   */
  clearVisuals(): void {
    this.visualDebugItems = [];
  }

  /**
   * Zwraca kopię logów
   */
  getLogs(): DebugLogEntry[] {
    return [...this.logs];
  }

  /**
   * Zwraca aktualne metryki
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Konfiguruje domyślne komendy
   */
  private setupDefaultCommands(): void {
    this.addCommand('help', (args) => {
      const commands = Array.from(this.commands.keys()).join(', ');
      this.info('Help', `Dostępne komendy: ${commands}`);
    });

    this.addCommand('clear', (args) => {
      this.clear();
    });

    this.addCommand('fps', (args) => {
      this.info('FPS', `Aktualny FPS: ${this.metrics.fps}`);
    });

    this.addCommand('metrics', (args) => {
      this.info('Metrics', 'Metryki wydajności:', this.metrics);
    });

    this.addCommand('watch', (args) => {
      if (args.length === 0) {
        const watched = Array.from(this.watchedVariables.keys()).join(', ');
        this.info('Watch', `Obserwowane zmienne: ${watched}`);
      }
    });

    this.addCommand('loglevel', (args) => {
      if (args.length > 0) {
        const level = parseInt(args[0]);
        if (level >= 0 && level <= 3) {
          this.currentLogLevel = level;
          this.info('LogLevel', `Ustawiono poziom logowania na: ${LogLevel[level]}`);
        } else {
          this.warn('LogLevel', 'Nieprawidłowy poziom (0-3)');
        }
      } else {
        this.info('LogLevel', `Aktualny poziom: ${LogLevel[this.currentLogLevel]}`);
      }
    });
  }

  /**
   * Konfiguruje skróty klawiszowe
   */
  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (event) => {
      // F1 - toggle debug console
      if (event.key === 'F1') {
        event.preventDefault();
        this.toggle();
      }
      
      // Ctrl+Shift+D - debug dump
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        this.info('Debug', 'Debug dump:', {
          metrics: this.metrics,
          watchedVariables: Object.fromEntries(
            Array.from(this.watchedVariables.entries()).map(([name, getter]) => [name, getter()])
          ),
          visualItems: this.visualDebugItems.length
        });
      }
    });
  }

  /**
   * Tworzy element overlay dla konsoli
   */
  private createOverlayElement(): void {
    this.overlayElement = document.createElement('div');
    this.overlayElement.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      width: 400px;
      max-height: 500px;
      background: rgba(0, 0, 0, 0.9);
      color: #ffffff;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      padding: 10px;
      border-radius: 5px;
      z-index: 10000;
      overflow-y: auto;
      display: none;
      border: 1px solid #333;
    `;

    document.body.appendChild(this.overlayElement);
  }

  /**
   * Aktualizuje zawartość overlay
   */
  private updateOverlay(): void {
    if (!this.overlayElement || !this.isVisible) return;

    let html = '<div style="border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 5px;">';
    html += '<strong>Debug Console</strong><br>';
    html += `FPS: ${this.metrics.fps} | Frame: ${this.metrics.frameTime.toFixed(2)}ms<br>`;
    html += `Entities: ${this.metrics.entityCount} | Systems: ${this.metrics.systemCount}`;
    html += '</div>';

    // Obserwowane zmienne
    if (this.watchedVariables.size > 0) {
      html += '<div style="margin-bottom: 10px;"><strong>Watched Variables:</strong><br>';
      for (const [name, getter] of this.watchedVariables) {
        try {
          const value = getter();
          html += `${name}: ${JSON.stringify(value)}<br>`;
        } catch (e) {
          html += `${name}: <span style="color: #ff6b6b;">Error</span><br>`;
        }
      }
      html += '</div>';
    }

    // Ostatnie logi
    html += '<div><strong>Recent Logs:</strong><br>';
    const recentLogs = this.logs.slice(-10);
    for (const log of recentLogs) {
      const levelColors = ['#888', '#fff', '#ffb347', '#ff6b6b'];
      const color = levelColors[log.level];
      const time = new Date(log.timestamp).toLocaleTimeString();
      html += `<span style="color: ${color};">[${time}] [${log.category}] ${log.message}</span><br>`;
    }
    html += '</div>';

    this.overlayElement.innerHTML = html;
  }

  /**
   * Niszczy konsolę debug
   */
  destroy(): void {
    if (this.overlayElement) {
      document.body.removeChild(this.overlayElement);
      this.overlayElement = null;
    }
    this.logs = [];
    this.visualDebugItems = [];
    this.commands.clear();
    this.watchedVariables.clear();
  }
} 