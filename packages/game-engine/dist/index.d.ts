export { GameEngine, GameEngineConfig, EngineStats } from './core/GameEngine';
export { GameLoop, GameLoopOptions, Updatable, Renderable } from './core/GameLoop';
export { Vector2 } from './math/Vector2';
export { IsometricUtils } from './math/IsometricUtils';
export { RenderingEngine, Camera, RendererConfig, RendererType, RenderableObject } from './rendering/RenderingEngine';
export { InputManager, MouseButton, InputState, CustomMouseEvent as MouseEvent } from './input/InputManager';
export { Scene, SceneManager, SceneTransition } from './scene/SceneManager';
export { Entity, EntityId } from './ecs/Entity';
export { Component, SingletonComponent, isSingletonComponent } from './ecs/Component';
export { System, RenderSystem, FilterableSystem, EntityFilter } from './ecs/System';
export { World } from './ecs/World';
export { Transform } from './ecs/components/Transform';
export { Renderable as ECSRenderable, RenderType, ShapeType, ShapeData, TextData, SpriteData } from './ecs/components/Renderable';
export { Movement } from './ecs/components/Movement';
export { RenderingSystem } from './ecs/systems/RenderingSystem';
export { MovementSystem } from './ecs/systems/MovementSystem';
export { AStar, AStarNode, AStarConfig, Heuristic } from './pathfinding/AStar';
export { AnimationClip, AnimationController, AnimationFrame, AnimationMode, AnimationState, SpriteSheetAnimationBuilder } from './animation/Animation';
export { AudioManager, AudioSource, AudioInstance, AudioConfig, AudioType } from './audio/AudioManager';
export { DebugConsole, DebugLogEntry, LogLevel, PerformanceMetrics } from './debug/DebugConsole';
import { GameEngine, GameEngineConfig } from './core/GameEngine';
import { World } from './ecs/World';
/**
 * Główna funkcja pomocnicza do tworzenia silnika gry
 */
export declare function createGameEngine(config: GameEngineConfig): GameEngine;
/**
 * Wersja silnika
 */
export declare const VERSION = "1.1.0";
/**
 * Domyślna konfiguracja silnika
 */
export declare const DEFAULT_ENGINE_CONFIG: Partial<GameEngineConfig>;
/**
 * Łączy konfigurację z domyślnymi wartościami
 */
export declare function mergeWithDefaults(config: Partial<GameEngineConfig>): GameEngineConfig;
/**
 * Helper do tworzenia podstawowej Entity z Transform i Renderable
 */
export declare function createBasicEntity(world: World, x?: number, y?: number, name?: string): any;
/**
 * Helper do tworzenia poruszającej się Entity
 */
export declare function createMovableEntity(world: World, x?: number, y?: number, maxSpeed?: number, name?: string): any;
/**
 * Helper do tworzenia prostego systemu ECS
 */
export declare function createECSWorld(): World;
//# sourceMappingURL=index.d.ts.map