// Core komponenty
export { GameEngine, GameEngineConfig, EngineStats } from './core/GameEngine';
export { GameLoop, GameLoopOptions, Updatable, Renderable } from './core/GameLoop';

// Matematyka
export { Vector2 } from './math/Vector2';
export { IsometricUtils } from './math/IsometricUtils';

// Renderowanie
export { 
  RenderingEngine, 
  Camera, 
  RendererConfig, 
  RendererType, 
  RenderableObject 
} from './rendering/RenderingEngine';

// Input
export { 
  InputManager, 
  MouseButton, 
  InputState, 
  CustomMouseEvent as MouseEvent
} from './input/InputManager';

// Sceny
export { 
  Scene, 
  SceneManager, 
  SceneTransition 
} from './scene/SceneManager';

// ECS - Entity Component System
export { Entity, EntityId } from './ecs/Entity';
export { Component, SingletonComponent, isSingletonComponent } from './ecs/Component';
export { System, RenderSystem, FilterableSystem, EntityFilter } from './ecs/System';
export { World } from './ecs/World';

// ECS Components
export { Transform } from './ecs/components/Transform';
export { 
  Renderable as ECSRenderable, 
  RenderType, 
  ShapeType, 
  ShapeData, 
  TextData, 
  SpriteData 
} from './ecs/components/Renderable';
export { Movement } from './ecs/components/Movement';

// ECS Systems
export { RenderingSystem } from './ecs/systems/RenderingSystem';
export { MovementSystem } from './ecs/systems/MovementSystem';

// Pathfinding
export { 
  AStar, 
  AStarNode, 
  AStarConfig, 
  Heuristic 
} from './pathfinding/AStar';

// Animation
export { 
  AnimationClip, 
  AnimationController, 
  AnimationFrame, 
  AnimationMode, 
  AnimationState, 
  SpriteSheetAnimationBuilder 
} from './animation/Animation';

// Audio
export { 
  AudioManager, 
  AudioSource, 
  AudioInstance, 
  AudioConfig, 
  AudioType 
} from './audio/AudioManager';

// Debug
export { 
  DebugConsole, 
  DebugLogEntry, 
  LogLevel, 
  PerformanceMetrics 
} from './debug/DebugConsole';

// Importy dla użycia wewnętrznego
import { GameEngine, GameEngineConfig } from './core/GameEngine';
import { RendererType } from './rendering/RenderingEngine';
import { Transform } from './ecs/components/Transform';
import { Renderable as ECSRenderable } from './ecs/components/Renderable';
import { Movement } from './ecs/components/Movement';
import { World } from './ecs/World';

/**
 * Główna funkcja pomocnicza do tworzenia silnika gry
 */
export function createGameEngine(config: GameEngineConfig): GameEngine {
  return new GameEngine(config);
}

/**
 * Wersja silnika
 */
export const VERSION = '1.1.0';

/**
 * Domyślna konfiguracja silnika
 */
export const DEFAULT_ENGINE_CONFIG: Partial<GameEngineConfig> = {
  renderer: {
    type: RendererType.CANVAS_2D,
    width: 800,
    height: 600,
    backgroundColor: '#2c3e50'
  },
  gameLoop: {
    targetFPS: 60,
    enableFixedTimeStep: false,
    maxDeltaTime: 100
  },
  enableInput: true,
  enableDebug: false
};

/**
 * Łączy konfigurację z domyślnymi wartościami
 */
export function mergeWithDefaults(config: Partial<GameEngineConfig>): GameEngineConfig {
  return {
    ...DEFAULT_ENGINE_CONFIG,
    ...config,
    renderer: {
      ...DEFAULT_ENGINE_CONFIG.renderer!,
      ...config.renderer
    },
    gameLoop: {
      ...DEFAULT_ENGINE_CONFIG.gameLoop!,
      ...config.gameLoop
    }
  } as GameEngineConfig;
}

/**
 * Helper do tworzenia podstawowej Entity z Transform i Renderable
 */
export function createBasicEntity(world: World, x: number = 0, y: number = 0, name?: string): any {
  const entity = world.createEntity(name);
  
  // Dodaj podstawowe komponenty
  const transform = new Transform(x, y);
  const renderable = new ECSRenderable();
  
  entity.addComponent(transform);
  entity.addComponent(renderable);
  
  return entity;
}

/**
 * Helper do tworzenia poruszającej się Entity
 */
export function createMovableEntity(world: World, x: number = 0, y: number = 0, maxSpeed: number = 100, name?: string): any {
  const entity = createBasicEntity(world, x, y, name);
  
  // Dodaj komponent ruchu
  const movement = new Movement(maxSpeed);
  entity.addComponent(movement);
  
  return entity;
}

/**
 * Helper do tworzenia prostego systemu ECS
 */
export function createECSWorld(): World {
  const world = new World();
  
  // Dodaj podstawowe systemy
  // Uwaga: RenderingEngine musi być przekazany z zewnątrz
  
  return world;
} 