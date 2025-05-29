import {
  createGameEngine,
  GameEngine,
  Scene,
  RendererType,
  Vector2,
  IsometricUtils,
  MouseButton
} from '../src/index';

/**
 * Przykładowa scena testowa pokazująca możliwości silnika
 */
class TestScene extends Scene {
  private mapWidth = 20;
  private mapHeight = 20;
  private selectedTile: Vector2 | null = null;
  private cameraSpeed = 200; // pikseli na sekundę

  onEnter(): void {
    console.log('TestScene: Wchodzę do sceny');
    
    // Ustawienie pozycji kamery na środek mapy
    const camera = this.renderer.getCamera();
    const mapCenter = IsometricUtils.gridToScreenCenter(
      this.mapWidth / 2, 
      this.mapHeight / 2
    );
    camera.moveTo(mapCenter);
    
    // Nasłuchiwanie kliknięć myszy
    this.input.on('mousePressed', this.onMousePressed);
  }

  onExit(): void {
    console.log('TestScene: Wychodzę ze sceny');
    this.input.off('mousePressed', this.onMousePressed);
  }

  update(deltaTime: number): void {
    this.handleCameraMovement(deltaTime);
    this.handleZoom();
  }

  render(deltaTime: number): void {
    this.renderMap();
    this.renderSelectedTile();
    this.renderUI();
  }

  /**
   * Obsługa ruchu kamery za pomocą WASD
   */
  private handleCameraMovement(deltaTime: number): void {
    const camera = this.renderer.getCamera();
    const moveSpeed = this.cameraSpeed * (deltaTime / 1000);
    const moveVector = new Vector2();

    if (this.input.isKeyDown('w') || this.input.isKeyDown('arrowup')) {
      moveVector.y -= moveSpeed;
    }
    if (this.input.isKeyDown('s') || this.input.isKeyDown('arrowdown')) {
      moveVector.y += moveSpeed;
    }
    if (this.input.isKeyDown('a') || this.input.isKeyDown('arrowleft')) {
      moveVector.x -= moveSpeed;
    }
    if (this.input.isKeyDown('d') || this.input.isKeyDown('arrowright')) {
      moveVector.x += moveSpeed;
    }

    if (moveVector.magnitudeSquared() > 0) {
      camera.moveBy(moveVector);
    }
  }

  /**
   * Obsługa zoomu za pomocą kółka myszy
   */
  private handleZoom(): void {
    const wheelDelta = this.input.getWheelDelta();
    if (wheelDelta !== 0) {
      const camera = this.renderer.getCamera();
      const zoomFactor = wheelDelta > 0 ? 0.9 : 1.1;
      camera.setZoom(camera.zoom * zoomFactor);
    }
  }

  /**
   * Renderuje mapę izometryczną
   */
  private renderMap(): void {
    for (let x = 0; x < this.mapWidth; x++) {
      for (let y = 0; y < this.mapHeight; y++) {
        // Kolory na przemian dla efektu szachownicy
        const isEven = (x + y) % 2 === 0;
        const color = isEven ? '#3498db' : '#2980b9';
        
        this.renderer.drawIsometricTile(x, y, color);
        
        // Rysowanie granic kafelka
        const screenPos = IsometricUtils.gridToScreenCenter(x, y);
        const ctx = this.renderer.getContext() as CanvasRenderingContext2D;
        const halfWidth = IsometricUtils.HALF_TILE_WIDTH;
        const halfHeight = IsometricUtils.HALF_TILE_HEIGHT;
        
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenPos.x, screenPos.y - halfHeight);
        ctx.lineTo(screenPos.x + halfWidth, screenPos.y);
        ctx.lineTo(screenPos.x, screenPos.y + halfHeight);
        ctx.lineTo(screenPos.x - halfWidth, screenPos.y);
        ctx.closePath();
        ctx.stroke();
      }
    }
  }

  /**
   * Renderuje wybrany kafelek
   */
  private renderSelectedTile(): void {
    if (!this.selectedTile) return;

    const screenPos = IsometricUtils.gridToScreenCenter(
      this.selectedTile.x, 
      this.selectedTile.y
    );
    
    // Pulsujący efekt
    const time = performance.now() / 500;
    const alpha = (Math.sin(time) + 1) / 2 * 0.5 + 0.5;
    
    const ctx = this.renderer.getContext() as CanvasRenderingContext2D;
    const halfWidth = IsometricUtils.HALF_TILE_WIDTH;
    const halfHeight = IsometricUtils.HALF_TILE_HEIGHT;
    
    ctx.fillStyle = `rgba(231, 76, 60, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(screenPos.x, screenPos.y - halfHeight);
    ctx.lineTo(screenPos.x + halfWidth, screenPos.y);
    ctx.lineTo(screenPos.x, screenPos.y + halfHeight);
    ctx.lineTo(screenPos.x - halfWidth, screenPos.y);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Renderuje interfejs użytkownika
   */
  private renderUI(): void {
    const canvas = this.renderer.getCanvas();
    const ctx = this.renderer.getContext() as CanvasRenderingContext2D;
    
    // Zapisanie stanu transformacji
    ctx.save();
    ctx.resetTransform();
    
    // Tło dla UI
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 300, 120);
    
    // Instrukcje
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText('WASD / Strzałki - ruch kamery', 20, 30);
    ctx.fillText('Kółko myszy - zoom', 20, 50);
    ctx.fillText('LPM - wybierz kafelek', 20, 70);
    
    // Informacje o kamerze
    const camera = this.renderer.getCamera();
    ctx.fillText(`Pozycja kamery: ${camera.position.x.toFixed(1)}, ${camera.position.y.toFixed(1)}`, 20, 90);
    ctx.fillText(`Zoom: ${camera.zoom.toFixed(2)}`, 20, 110);
    
    // Informacje o wybranym kafelku
    if (this.selectedTile) {
      ctx.fillText(`Wybrany kafelek: ${this.selectedTile.x}, ${this.selectedTile.y}`, 20, 130);
    }
    
    // Przywrócenie stanu transformacji
    ctx.restore();
  }

  /**
   * Obsługa kliknięć myszy
   */
  private onMousePressed = (button: MouseButton): void => {
    if (button === MouseButton.LEFT) {
      const mousePos = this.input.getMousePosition();
      const camera = this.renderer.getCamera();
      const worldPos = camera.screenToWorld(mousePos);
      const gridPos = IsometricUtils.screenToGrid(worldPos.x, worldPos.y);
      
      // Sprawdzenie czy kliknięcie jest w granicach mapy
      if (IsometricUtils.isValidGridPosition(gridPos.x, gridPos.y, this.mapWidth, this.mapHeight)) {
        this.selectedTile = gridPos;
        console.log(`Wybrano kafelek: ${gridPos.x}, ${gridPos.y}`);
      }
    }
  };
}

/**
 * Funkcja uruchamiająca przykład
 */
export function runBasicExample(): void {
  // Konfiguracja silnika
  const config = {
    canvasId: 'game-canvas',
    renderer: {
      type: RendererType.CANVAS_2D,
      width: 1024,
      height: 768,
      backgroundColor: '#1a202c'
    },
    gameLoop: {
      targetFPS: 60,
      enableFixedTimeStep: false
    },
    enableInput: true,
    enableDebug: true
  };

  // Utworzenie silnika
  const engine = createGameEngine(config);
  
  // Utworzenie i rejestracja sceny testowej
  const testScene = new TestScene(
    'test', 
    engine.getSceneManager(), 
    engine.getRenderer(), 
    engine.getInputManager()
  );
  
  engine.registerScene(testScene);
  
  // Nasłuchiwanie zdarzeń silnika
  engine.on('initialized', () => {
    console.log('Silnik został zainicjalizowany');
  });
  
  engine.on('started', () => {
    console.log('Silnik uruchomiony');
  });
  
  engine.on('fpsUpdate', (fps: number) => {
    console.log(`FPS: ${fps}`);
  });
  
  engine.on('error', (error: Error) => {
    console.error('Błąd silnika:', error);
  });
  
  // Uruchomienie silnika i przełączenie na scenę testową
  engine.start();
  engine.switchToScene('test').then(() => {
    console.log('Przełączono na scenę testową');
  });
  
  // Globalne przycilki klawiszowe
  window.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'F11':
        event.preventDefault();
        if (engine.isFullscreen) {
          engine.exitFullscreen();
        } else {
          engine.enableFullscreen();
        }
        break;
        
      case 'F12':
        event.preventDefault();
        const screenshot = engine.takeScreenshot();
        const link = document.createElement('a');
        link.download = 'screenshot.png';
        link.href = screenshot;
        link.click();
        break;
        
      case 'p':
        if (engine.paused) {
          engine.resume();
        } else {
          engine.pause();
        }
        break;
    }
  });
  
  console.log('Przykład uruchomiony! Używaj:');
  console.log('- WASD / Strzałki: ruch kamery');
  console.log('- Kółko myszy: zoom');
  console.log('- LPM: wybór kafelka');
  console.log('- F11: pełny ekran');
  console.log('- F12: zrzut ekranu');
  console.log('- P: pauza/wznów');
}

// Automatyczne uruchomienie przykładu w przeglądarce
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    // Utworzenie canvas jeśli nie istnieje
    if (!document.getElementById('game-canvas')) {
      const canvas = document.createElement('canvas');
      canvas.id = 'game-canvas';
      canvas.style.border = '1px solid #333';
      canvas.style.display = 'block';
      canvas.style.margin = '20px auto';
      document.body.appendChild(canvas);
    }
    
    runBasicExample();
  });
} 