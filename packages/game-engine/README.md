# @rts-engine/game-engine

Autorski silnik gry 2D z obsługą izometrycznej siatki, stworzony specjalnie dla gier strategicznych czasu rzeczywistego (RTS).

## 🚀 Instalacja

```bash
npm install @rts-engine/game-engine
```

## 🎯 Szybki Start

```typescript
import { createGameEngine, Scene, RendererType } from '@rts-engine/game-engine';

// Tworzenie silnika
const engine = createGameEngine({
  canvasId: 'game-canvas',
  renderer: {
    type: RendererType.CANVAS_2D,
    width: 1024,
    height: 768,
    backgroundColor: '#2c3e50'
  },
  enableDebug: true
});

// Tworzenie sceny
class GameScene extends Scene {
  onEnter() { console.log('Gra rozpoczęta!'); }
  onExit() { console.log('Gra zakończona!'); }
  update(deltaTime) { /* logika gry */ }
  render(deltaTime) { /* renderowanie */ }
}

// Uruchomienie
const scene = new GameScene('game', engine.getSceneManager(), engine.getRenderer(), engine.getInputManager());
engine.registerScene(scene);
engine.start();
engine.switchToScene('game');
```

## 🏗️ Architektura

### Core Components

1. **GameEngine** - Główny silnik łączący wszystkie komponenty
2. **GameLoop** - Pętla gry z kontrolą FPS i deltaTime
3. **RenderingEngine** - Silnik renderowania (Canvas 2D / WebGL)
4. **InputManager** - System obsługi wejścia
5. **SceneManager** - Zarządzanie scenami
6. **Vector2** - Matematyka 2D
7. **IsometricUtils** - Narzędzia izometryczne

### Cechy Specjalne

- ✅ **Izometryczna siatka** - Pełne wsparcie dla renderowania RTS
- ✅ **Event-driven** - Komunikacja między komponentami
- ✅ **TypeScript** - Pełna typizacja i intellisense
- ✅ **Wydajność** - Optymalizowany rendering i culling
- ✅ **Elastyczność** - Modułowa architektura

## 📖 API Reference

### GameEngine

```typescript
const engine = createGameEngine({
  canvasId: 'canvas',          // ID canvas elementu
  renderer: {
    type: RendererType.CANVAS_2D,
    width: 800,
    height: 600,
    backgroundColor: '#000000'
  },
  gameLoop: {
    targetFPS: 60,
    enableFixedTimeStep: false
  },
  enableInput: true,
  enableDebug: false
});

engine.start();                 // Uruchomienie
engine.stop();                  // Zatrzymanie
engine.pause();                 // Pauza
engine.resume();                // Wznowienie
```

### Scene System

```typescript
class MyScene extends Scene {
  onEnter(): void {
    // Inicjalizacja sceny
  }

  onExit(): void {
    // Sprzątanie sceny
  }

  update(deltaTime: number): void {
    // Logika gry (60 FPS)
  }

  render(deltaTime: number): void {
    // Renderowanie
    this.renderer.drawIsometricTile(0, 0, '#ff0000');
  }
}
```

### Rendering

```typescript
const renderer = engine.getRenderer();

// Podstawowe kształty
renderer.drawRect(x, y, width, height, color);
renderer.drawCircle(x, y, radius, color);
renderer.drawLine(x1, y1, x2, y2, color);

// Izometryczne kafelki
renderer.drawIsometricTile(gridX, gridY, color);

// Kamera
const camera = renderer.getCamera();
camera.moveTo(new Vector2(100, 100));
camera.setZoom(1.5);
```

### Input Handling

```typescript
const input = engine.getInputManager();

// Klawiatura
if (input.isKeyDown('w')) {
  // Ruch do przodu
}

// Mysz
if (input.isMousePressed(MouseButton.LEFT)) {
  const pos = input.getMousePosition();
  console.log('Klik w:', pos);
}

// Kółko myszy
const wheel = input.getWheelDelta();
if (wheel !== 0) {
  // Zoom
}
```

### Matematyka

```typescript
import { Vector2, IsometricUtils } from '@rts-engine/game-engine';

// Wektory 2D
const pos = new Vector2(100, 200);
const vel = new Vector2(5, -3);
pos.add(vel);

// Konwersje izometryczne
const screenPos = IsometricUtils.gridToScreenCenter(5, 3);
const gridPos = IsometricUtils.screenToGrid(mouseX, mouseY);
```

## 🎮 Przykład Użycia

Sprawdź plik `test.html` dla pełnego przykładu działającej gry z:
- Izometryczną mapą 20x20
- Kontrolą kamery (WASD)
- Zoomem (kółko myszy)
- Wybieraniem kafelków (LPM)
- Informacjami debug

## 🛠️ Development

```bash
# Instalacja zależności
npm install

# Build
npm run build

# Watch mode
npm run dev

# Linting
npm run lint

# Testy
npm run test
```

## 🎯 Planowane Funkcje

- [ ] System Entity-Component-System (ECS)
- [ ] Pathfinding (A*)
- [ ] System animacji
- [ ] Audio (Web Audio API)
- [ ] WebGL shaders
- [ ] System cząsteczek

## 📄 Licencja

MIT

---

**Część większego projektu RTS Game Engine** 🎮 