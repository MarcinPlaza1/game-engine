# 🎮 Autorski Silnik Gry RTS 2D - Wersja 1.1

Nowoczesny silnik gry 2D z obsługą izometrycznej siatki, stworzony specjalnie dla gier strategicznych czasu rzeczywistego (RTS). Zbudowany w TypeScript z wykorzystaniem React, Vite i Node.js.

## 🚀 Cechy Silnika

### Core Features (v1.0)
- ⚡ **Wysoka wydajność** - Optymalizowany game loop z kontrolą FPS
- 🎨 **Elastyczny rendering** - Obsługa Canvas 2D i podstawowe wsparcie WebGL
- 🎯 **Precyzyjny input** - Zaawansowany system obsługi klawiatury i myszy
- 🎭 **Zarządzanie scenami** - Przełączanie między scenami z efektami przejścia
- 📐 **Matematyka 2D** - Kompleksowa biblioteka wektorów i narzędzi izometrycznych

### Nowe funkcje v1.1 🆕
- 🏗️ **System ECS** - Entity-Component-System dla modułowej architektury
- 🎯 **Pathfinding A*** - Zaawansowany algorytm znajdowania ścieżek z obsługą przeszkód
- 🎬 **System animacji** - Zaawansowane animacje sprite'ów z kontrolą klatek
- 🔊 **Audio Manager** - Web Audio API z obsługą spatial audio i kategorii dźwięków
- 🐛 **Debug Console** - Potężne narzędzia debugowania z wizualizacją i konsolą

### Specjalne dla RTS
- 🔷 **Izometryczna siatka** - Pełne wsparcie dla renderowania izometrycznego
- 📷 **Zaawansowana kamera** - Zoom, przemieszczanie, ograniczenia
- 🎪 **Event-driven architecture** - Komunikacja między komponentami
- 🎬 **Efekty wizualne** - Animacje, przejścia, debug mode

## 📁 Struktura Projektu

```
rts-game-engine/
├── packages/
│   ├── game-engine/              # Core silnika gry v1.1
│   │   ├── src/
│   │   │   ├── core/             # Główne komponenty (GameLoop, GameEngine)
│   │   │   ├── math/             # Biblioteka matematyczna (Vector2, IsometricUtils)
│   │   │   ├── rendering/        # Silnik renderowania (RenderingEngine, Camera)
│   │   │   ├── input/            # System obsługi wejścia (InputManager)
│   │   │   ├── scene/            # Zarządzanie scenami (SceneManager)
│   │   │   ├── ecs/              # 🆕 Entity-Component-System
│   │   │   │   ├── components/   # Komponenty (Transform, Renderable, Movement)
│   │   │   │   └── systems/      # Systemy (RenderingSystem, MovementSystem)
│   │   │   ├── pathfinding/      # 🆕 Algorytmy pathfinding (A*)
│   │   │   ├── animation/        # 🆕 System animacji sprite'ów
│   │   │   ├── audio/            # 🆕 Manager audio z Web Audio API
│   │   │   ├── debug/            # 🆕 Narzędzia debugowania
│   │   │   └── index.ts          # Główny eksport
│   │   └── examples/             # Przykłady użycia
│   ├── frontend/                 # React + Vite frontend
│   ├── backend/                  # Node.js + TypeScript backend
│   └── shared/                   # Wspólne typy i logika
├── package.json                  # Konfiguracja monorepo
└── README.md
```

## 🛠️ Instalacja i Uruchomienie

### Wymagania
- Node.js 18+
- npm lub yarn
- Nowoczesna przeglądarka z obsługą Canvas/WebGL i Web Audio API

### Szybki start

```bash
# Klonowanie repozytorium
git clone <repo-url>
cd rts-game-engine

# Instalacja zależności
npm install

# Uruchomienie w trybie deweloperskim
npm run dev

# Budowanie projektu
npm run build
```

## 📖 Dokumentacja API v1.1

### GameEngine - Główny silnik

```typescript
import { createGameEngine, RendererType } from '@rts-engine/game-engine';

const engine = createGameEngine({
  canvasId: 'game-canvas',
  renderer: {
    type: RendererType.CANVAS_2D,
    width: 1024,
    height: 768,
    backgroundColor: '#2c3e50'
  },
  gameLoop: {
    targetFPS: 60,
    enableFixedTimeStep: false
  },
  enableInput: true,
  enableDebug: true
});

engine.start();
```

### 🆕 System ECS - Entity Component System

```typescript
import { 
  createECSWorld, 
  createBasicEntity, 
  createMovableEntity,
  Transform, 
  ECSRenderable, 
  Movement,
  RenderingSystem,
  MovementSystem 
} from '@rts-engine/game-engine';

// Tworzenie świata ECS
const world = createECSWorld();

// Dodawanie systemów
const renderingSystem = new RenderingSystem(world, engine.getRenderer());
const movementSystem = new MovementSystem(world);
world.addSystem(renderingSystem);
world.addSystem(movementSystem);

// Tworzenie entities
const player = createMovableEntity(world, 100, 100, 150, 'player');
const renderable = player.getComponent(ECSRenderable);
renderable.setCircle(20, true).setColor('#ff0000');

// Aktualizacja w game loop
function update(deltaTime) {
  world.update(deltaTime);
}

function render(deltaTime) {
  world.render(deltaTime);
}
```

### 🆕 Pathfinding A*

```typescript
import { AStar, Heuristic, Vector2 } from '@rts-engine/game-engine';

// Tworzenie siatki pathfinding
const pathfinder = new AStar(50, 50, {
  allowDiagonal: true,
  heuristic: Heuristic.EUCLIDEAN
});

// Dodanie przeszkód
pathfinder.setObstacle(10, 10, true);
pathfinder.setObstacleArea(5, 5, 8, 8, true);

// Znajdowanie ścieżki
const path = pathfinder.findPath(0, 0, 20, 20);
console.log('Znaleziona ścieżka:', path);

// Użycie w MovementSystem
const movement = entity.getComponent(Movement);
movement.setPath(path);
```

### 🆕 System Animacji

```typescript
import { 
  AnimationController, 
  SpriteSheetAnimationBuilder, 
  AnimationMode 
} from '@rts-engine/game-engine';

// Tworzenie kontrolera animacji
const animator = new AnimationController();

// Dodanie animacji z sprite sheet'a
const walkAnimation = SpriteSheetAnimationBuilder.createFromGrid(
  'walk',
  32, 32,    // rozmiar klatki
  0, 8,      // pierwsza klatka, liczba klatek
  100,       // czas trwania klatki (ms)
  4,         // kolumny w sprite sheet
  AnimationMode.LOOP
);

animator.addClip(walkAnimation);
animator.setDefaultClip('walk');

// Odtwarzanie animacji
animator.play('walk');

// Aktualizacja w game loop
function update(deltaTime) {
  animator.update(deltaTime);
  
  const currentFrame = animator.getCurrentFrame();
  if (currentFrame) {
    // Aktualizuj sprite według bieżącej klatki
    renderable.spriteData.sourceRect = currentFrame.sourceRect;
  }
}
```

### 🆕 Audio Manager

```typescript
import { 
  AudioManager, 
  AudioSource, 
  AudioType 
} from '@rts-engine/game-engine';

// Inicjalizacja audio managera
const audioManager = new AudioManager();
await audioManager.initialize(); // Wymaga interakcji użytkownika

// Dodanie źródeł audio
audioManager.addAudioSource(new AudioSource('bgMusic', '/assets/music.mp3', {
  type: AudioType.MUSIC,
  loop: true,
  volume: 0.7
}));

audioManager.addAudioSource(new AudioSource('gunshot', '/assets/gunshot.wav', {
  type: AudioType.SFX,
  volume: 1.0
}));

// Odtwarzanie dźwięków
const musicId = await audioManager.play('bgMusic');
const sfxId = await audioManager.playSpatial('gunshot', new Vector2(100, 100));

// Kontrola głośności
audioManager.setMasterVolume(0.8);
audioManager.setTypeVolume(AudioType.MUSIC, 0.5);
```

### 🆕 Debug Console

```typescript
import { DebugConsole, LogLevel } from '@rts-engine/game-engine';

// Inicjalizacja konsoli debug
const debugConsole = new DebugConsole();
debugConsole.initialize(canvas);

// Logowanie
debugConsole.info('Game', 'Gra rozpoczęta');
debugConsole.warn('AI', 'Pathfinding może być powolny');
debugConsole.error('Network', 'Utracono połączenie');

// Obserwowanie zmiennych
debugConsole.watchVariable('PlayerHP', () => player.hp);
debugConsole.watchVariable('EnemyCount', () => enemies.length);

// Wizualne debugowanie
debugConsole.drawDebugPoint(new Vector2(100, 100), '#ff0000', 2000);
debugConsole.drawDebugLine(start, end, '#00ff00');
debugConsole.drawDebugRect(position, 50, 50, '#0000ff', 1000);

// Dodanie niestandardowych komend
debugConsole.addCommand('spawn', (args) => {
  const count = parseInt(args[0]) || 1;
  for (let i = 0; i < count; i++) {
    spawnEnemy();
  }
});

// Renderowanie elementów debug
function render(deltaTime) {
  // ... zwykłe renderowanie
  
  if (debugMode) {
    debugConsole.renderDebugVisuals(ctx);
  }
}

// Skróty klawiszowe:
// F1 - przełącz konsolę debug
// Ctrl+Shift+D - debug dump
```

### Scene - System scen (v1.0)

```typescript
import { Scene } from '@rts-engine/game-engine';

class MyGameScene extends Scene {
  onEnter(): void {
    console.log('Wchodzę do sceny');
  }

  onExit(): void {
    console.log('Wychodzę ze sceny');
  }

  update(deltaTime: number): void {
    // Logika aktualizacji sceny
    world.update(deltaTime);
  }

  render(deltaTime: number): void {
    // Renderowanie sceny
    world.render(deltaTime);
  }
}

// Rejestracja i użycie sceny
const scene = new MyGameScene('game', engine.getSceneManager(), engine.getRenderer(), engine.getInputManager());
engine.registerScene(scene);
engine.switchToScene('game');
```

## 🎮 Przykład Kompletnej Gry RTS z ECS

```typescript
import {
  createGameEngine,
  createECSWorld,
  createMovableEntity,
  Transform,
  ECSRenderable,
  Movement,
  RenderingSystem,
  MovementSystem,
  AStar,
  DebugConsole,
  AudioManager,
  AudioSource,
  AudioType,
  RendererType,
  Scene,
  Vector2
} from '@rts-engine/game-engine';

class RTSGameScene extends Scene {
  private world = createECSWorld();
  private pathfinder = new AStar(40, 40);
  private debugConsole = new DebugConsole();
  private audioManager = new AudioManager();
  
  private units: any[] = [];
  private selectedUnits: any[] = [];

  async onEnter() {
    // Inicjalizacja systemów ECS
    const renderingSystem = new RenderingSystem(this.world, this.renderer);
    const movementSystem = new MovementSystem(this.world);
    this.world.addSystem(renderingSystem);
    this.world.addSystem(movementSystem);

    // Inicjalizacja audio
    await this.audioManager.initialize();
    this.audioManager.addAudioSource(new AudioSource('bgMusic', '/assets/ambient.mp3', {
      type: AudioType.AMBIENT,
      loop: true
    }));
    this.audioManager.play('bgMusic');

    // Inicjalizacja debug
    this.debugConsole.initialize(this.renderer.getCanvas());
    this.debugConsole.watchVariable('Units', () => this.units.length);
    this.debugConsole.watchVariable('Selected', () => this.selectedUnits.length);

    // Tworzenie początkowych jednostek
    this.createUnits();
    
    // Nasłuchiwanie kliknięć
    this.input.on('mousePressed', this.handleMouseClick);
  }

  update(deltaTime: number): void {
    this.updateCamera(deltaTime);
    this.world.update(deltaTime);
    this.debugConsole.updateMetrics({
      fps: this.renderer.getFPS(),
      frameTime: deltaTime,
      entityCount: this.world.getAllEntities().length,
      systemCount: this.world.getAllSystems().length
    });
  }

  render(deltaTime: number): void {
    this.world.render(deltaTime);
    this.renderUI();
    this.debugConsole.renderDebugVisuals(this.renderer.getContext() as CanvasRenderingContext2D);
  }

  private createUnits(): void {
    for (let i = 0; i < 5; i++) {
      const unit = createMovableEntity(this.world, 100 + i * 50, 100, 80, `unit_${i}`);
      const renderable = unit.getComponent(ECSRenderable);
      renderable.setCircle(15, true).setColor('#00ff00');
      this.units.push(unit);
    }
  }

  private handleMouseClick = (button: number) => {
    if (button === 0) { // LPM
      const mousePos = this.input.getMousePosition();
      const camera = this.renderer.getCamera();
      const worldPos = camera.screenToWorld(mousePos);

      if (this.input.isKeyDown('shift')) {
        // Dodaj do selekcji
        this.selectUnitsInArea(worldPos);
      } else {
        // Przesuń wybrane jednostki
        this.moveSelectedUnits(worldPos);
      }
    }
  };

  private selectUnitsInArea(center: Vector2): void {
    this.selectedUnits = [];
    for (const unit of this.units) {
      const transform = unit.getComponent(Transform);
      if (transform.position.distanceTo(center) < 50) {
        this.selectedUnits.push(unit);
      }
    }
  }

  private moveSelectedUnits(target: Vector2): void {
    for (const unit of this.selectedUnits) {
      const transform = unit.getComponent(Transform);
      const movement = unit.getComponent(Movement);
      
      // Znajdź ścieżkę
      const startGrid = this.worldToGrid(transform.position);
      const endGrid = this.worldToGrid(target);
      const path = this.pathfinder.findPath(startGrid.x, startGrid.y, endGrid.x, endGrid.y);
      
      if (path.length > 0) {
        const worldPath = path.map(p => this.gridToWorld(p));
        movement.setPath(worldPath);
        
        // Debug visualization
        this.debugConsole.drawDebugLine(transform.position, target, '#ff0000', 2000);
      }
    }
  }

  private worldToGrid(worldPos: Vector2): Vector2 {
    return new Vector2(
      Math.floor(worldPos.x / 32),
      Math.floor(worldPos.y / 32)
    );
  }

  private gridToWorld(gridPos: Vector2): Vector2 {
    return new Vector2(
      gridPos.x * 32 + 16,
      gridPos.y * 32 + 16
    );
  }

  private updateCamera(deltaTime: number): void {
    const camera = this.renderer.getCamera();
    const speed = 200 * (deltaTime / 1000);
    
    if (this.input.isKeyDown('w')) camera.moveBy(new Vector2(0, -speed));
    if (this.input.isKeyDown('s')) camera.moveBy(new Vector2(0, speed));
    if (this.input.isKeyDown('a')) camera.moveBy(new Vector2(-speed, 0));
    if (this.input.isKeyDown('d')) camera.moveBy(new Vector2(speed, 0));
    
    const wheel = this.input.getWheelDelta();
    if (wheel !== 0) {
      camera.setZoom(camera.zoom * (wheel > 0 ? 0.9 : 1.1));
    }
  }

  private renderUI(): void {
    const ctx = this.renderer.getContext() as CanvasRenderingContext2D;
    ctx.save();
    ctx.resetTransform();
    
    // UI panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 300, 120);
    
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText('🎮 RTS Game Engine v1.1', 20, 30);
    ctx.fillText(`Jednostki: ${this.units.length}`, 20, 50);
    ctx.fillText(`Wybrane: ${this.selectedUnits.length}`, 20, 70);
    ctx.fillText('WASD - kamera, Shift+LPM - wybór, LPM - ruch', 20, 90);
    ctx.fillText('F1 - debug console', 20, 110);
    
    ctx.restore();
  }

  onExit(): void {
    this.audioManager.stopAll();
    this.debugConsole.destroy();
    this.input.off('mousePressed', this.handleMouseClick);
  }
}

// Uruchomienie gry
const engine = createGameEngine({
  renderer: {
    type: RendererType.CANVAS_2D,
    width: 1024,
    height: 768,
    backgroundColor: '#1a1a2e'
  },
  enableDebug: true
});

const gameScene = new RTSGameScene('rts', engine.getSceneManager(), engine.getRenderer(), engine.getInputManager());
engine.registerScene(gameScene);
engine.start();
engine.switchToScene('rts');
```

## 🎯 Zrealizowane funkcje v1.1

### ✅ System ECS
- [x] Entity-Component-System architecture
- [x] Transform, Renderable, Movement components  
- [x] RenderingSystem, MovementSystem
- [x] World manager z lifecycle
- [x] Component decorators (@SingletonComponent)

### ✅ Pathfinding
- [x] Algorytm A* z konfigurowalnymi heurystykami
- [x] Obsługa przeszkód i collision detection
- [x] Optymalizacje (diagonal movement, corner cutting)
- [x] Integracja z MovementSystem

### ✅ System Animacji
- [x] AnimationClip z wieloma klatkami
- [x] AnimationController z trybami (Once, Loop, PingPong)
- [x] SpriteSheetAnimationBuilder
- [x] Frame-based animation timing

### ✅ Audio Manager
- [x] Web Audio API integration
- [x] Spatial audio z pozycjonowaniem 3D
- [x] Kategorie audio (SFX, Music, Voice, Ambient)
- [x] Dynamic loading i preloading
- [x] Volume control per type

### ✅ Debug Console
- [x] Zaawansowane logowanie z poziomami
- [x] Visual debugging (points, lines, shapes)
- [x] Performance metrics monitoring
- [x] Variable watching
- [x] Command system
- [x] HTML overlay interface

## 🎉 Osiągnięcia v1.1

- ✅ Kompletna architektura ECS
- ✅ Zaawansowany pathfinding A*
- ✅ Profesjonalny system animacji
- ✅ Spatial audio z Web Audio API
- ✅ Potężne narzędzia debugowania
- ✅ Pełna backward compatibility z v1.0
- ✅ TypeScript z pełną typizacją
- ✅ Dokumentacja i przykłady
- ✅ Działający complex demo

---

**Wersja 1.1 - Znaczący krok forward w rozwoju silnika! 🚀**

Nowe funkcje drastycznie zwiększają możliwości tworzenia zaawansowanych gier RTS z profesjonalnymi narzędziami debug i audio.

**Stworzony z ❤️ dla społeczności game dev** 🎮 