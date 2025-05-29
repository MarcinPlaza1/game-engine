"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ENGINE_CONFIG = exports.VERSION = exports.LogLevel = exports.DebugConsole = exports.AudioType = exports.AudioInstance = exports.AudioSource = exports.AudioManager = exports.SpriteSheetAnimationBuilder = exports.AnimationState = exports.AnimationMode = exports.AnimationController = exports.AnimationClip = exports.Heuristic = exports.AStarNode = exports.AStar = exports.MovementSystem = exports.RenderingSystem = exports.Movement = exports.ShapeType = exports.RenderType = exports.ECSRenderable = exports.Transform = exports.World = exports.FilterableSystem = exports.RenderSystem = exports.System = exports.isSingletonComponent = exports.SingletonComponent = exports.Component = exports.Entity = exports.SceneManager = exports.Scene = exports.MouseButton = exports.InputManager = exports.RendererType = exports.Camera = exports.RenderingEngine = exports.IsometricUtils = exports.Vector2 = exports.GameLoop = exports.GameEngine = void 0;
exports.createGameEngine = createGameEngine;
exports.mergeWithDefaults = mergeWithDefaults;
exports.createBasicEntity = createBasicEntity;
exports.createMovableEntity = createMovableEntity;
exports.createECSWorld = createECSWorld;
// Core komponenty
var GameEngine_1 = require("./core/GameEngine");
Object.defineProperty(exports, "GameEngine", { enumerable: true, get: function () { return GameEngine_1.GameEngine; } });
var GameLoop_1 = require("./core/GameLoop");
Object.defineProperty(exports, "GameLoop", { enumerable: true, get: function () { return GameLoop_1.GameLoop; } });
// Matematyka
var Vector2_1 = require("./math/Vector2");
Object.defineProperty(exports, "Vector2", { enumerable: true, get: function () { return Vector2_1.Vector2; } });
var IsometricUtils_1 = require("./math/IsometricUtils");
Object.defineProperty(exports, "IsometricUtils", { enumerable: true, get: function () { return IsometricUtils_1.IsometricUtils; } });
// Renderowanie
var RenderingEngine_1 = require("./rendering/RenderingEngine");
Object.defineProperty(exports, "RenderingEngine", { enumerable: true, get: function () { return RenderingEngine_1.RenderingEngine; } });
Object.defineProperty(exports, "Camera", { enumerable: true, get: function () { return RenderingEngine_1.Camera; } });
Object.defineProperty(exports, "RendererType", { enumerable: true, get: function () { return RenderingEngine_1.RendererType; } });
// Input
var InputManager_1 = require("./input/InputManager");
Object.defineProperty(exports, "InputManager", { enumerable: true, get: function () { return InputManager_1.InputManager; } });
Object.defineProperty(exports, "MouseButton", { enumerable: true, get: function () { return InputManager_1.MouseButton; } });
// Sceny
var SceneManager_1 = require("./scene/SceneManager");
Object.defineProperty(exports, "Scene", { enumerable: true, get: function () { return SceneManager_1.Scene; } });
Object.defineProperty(exports, "SceneManager", { enumerable: true, get: function () { return SceneManager_1.SceneManager; } });
// ECS - Entity Component System
var Entity_1 = require("./ecs/Entity");
Object.defineProperty(exports, "Entity", { enumerable: true, get: function () { return Entity_1.Entity; } });
var Component_1 = require("./ecs/Component");
Object.defineProperty(exports, "Component", { enumerable: true, get: function () { return Component_1.Component; } });
Object.defineProperty(exports, "SingletonComponent", { enumerable: true, get: function () { return Component_1.SingletonComponent; } });
Object.defineProperty(exports, "isSingletonComponent", { enumerable: true, get: function () { return Component_1.isSingletonComponent; } });
var System_1 = require("./ecs/System");
Object.defineProperty(exports, "System", { enumerable: true, get: function () { return System_1.System; } });
Object.defineProperty(exports, "RenderSystem", { enumerable: true, get: function () { return System_1.RenderSystem; } });
Object.defineProperty(exports, "FilterableSystem", { enumerable: true, get: function () { return System_1.FilterableSystem; } });
var World_1 = require("./ecs/World");
Object.defineProperty(exports, "World", { enumerable: true, get: function () { return World_1.World; } });
// ECS Components
var Transform_1 = require("./ecs/components/Transform");
Object.defineProperty(exports, "Transform", { enumerable: true, get: function () { return Transform_1.Transform; } });
var Renderable_1 = require("./ecs/components/Renderable");
Object.defineProperty(exports, "ECSRenderable", { enumerable: true, get: function () { return Renderable_1.Renderable; } });
Object.defineProperty(exports, "RenderType", { enumerable: true, get: function () { return Renderable_1.RenderType; } });
Object.defineProperty(exports, "ShapeType", { enumerable: true, get: function () { return Renderable_1.ShapeType; } });
var Movement_1 = require("./ecs/components/Movement");
Object.defineProperty(exports, "Movement", { enumerable: true, get: function () { return Movement_1.Movement; } });
// ECS Systems
var RenderingSystem_1 = require("./ecs/systems/RenderingSystem");
Object.defineProperty(exports, "RenderingSystem", { enumerable: true, get: function () { return RenderingSystem_1.RenderingSystem; } });
var MovementSystem_1 = require("./ecs/systems/MovementSystem");
Object.defineProperty(exports, "MovementSystem", { enumerable: true, get: function () { return MovementSystem_1.MovementSystem; } });
// Pathfinding
var AStar_1 = require("./pathfinding/AStar");
Object.defineProperty(exports, "AStar", { enumerable: true, get: function () { return AStar_1.AStar; } });
Object.defineProperty(exports, "AStarNode", { enumerable: true, get: function () { return AStar_1.AStarNode; } });
Object.defineProperty(exports, "Heuristic", { enumerable: true, get: function () { return AStar_1.Heuristic; } });
// Animation
var Animation_1 = require("./animation/Animation");
Object.defineProperty(exports, "AnimationClip", { enumerable: true, get: function () { return Animation_1.AnimationClip; } });
Object.defineProperty(exports, "AnimationController", { enumerable: true, get: function () { return Animation_1.AnimationController; } });
Object.defineProperty(exports, "AnimationMode", { enumerable: true, get: function () { return Animation_1.AnimationMode; } });
Object.defineProperty(exports, "AnimationState", { enumerable: true, get: function () { return Animation_1.AnimationState; } });
Object.defineProperty(exports, "SpriteSheetAnimationBuilder", { enumerable: true, get: function () { return Animation_1.SpriteSheetAnimationBuilder; } });
// Audio
var AudioManager_1 = require("./audio/AudioManager");
Object.defineProperty(exports, "AudioManager", { enumerable: true, get: function () { return AudioManager_1.AudioManager; } });
Object.defineProperty(exports, "AudioSource", { enumerable: true, get: function () { return AudioManager_1.AudioSource; } });
Object.defineProperty(exports, "AudioInstance", { enumerable: true, get: function () { return AudioManager_1.AudioInstance; } });
Object.defineProperty(exports, "AudioType", { enumerable: true, get: function () { return AudioManager_1.AudioType; } });
// Debug
var DebugConsole_1 = require("./debug/DebugConsole");
Object.defineProperty(exports, "DebugConsole", { enumerable: true, get: function () { return DebugConsole_1.DebugConsole; } });
Object.defineProperty(exports, "LogLevel", { enumerable: true, get: function () { return DebugConsole_1.LogLevel; } });
// Importy dla użycia wewnętrznego
const GameEngine_2 = require("./core/GameEngine");
const RenderingEngine_2 = require("./rendering/RenderingEngine");
const Transform_2 = require("./ecs/components/Transform");
const Renderable_2 = require("./ecs/components/Renderable");
const Movement_2 = require("./ecs/components/Movement");
const World_2 = require("./ecs/World");
/**
 * Główna funkcja pomocnicza do tworzenia silnika gry
 */
function createGameEngine(config) {
    return new GameEngine_2.GameEngine(config);
}
/**
 * Wersja silnika
 */
exports.VERSION = '1.1.0';
/**
 * Domyślna konfiguracja silnika
 */
exports.DEFAULT_ENGINE_CONFIG = {
    renderer: {
        type: RenderingEngine_2.RendererType.CANVAS_2D,
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
function mergeWithDefaults(config) {
    return {
        ...exports.DEFAULT_ENGINE_CONFIG,
        ...config,
        renderer: {
            ...exports.DEFAULT_ENGINE_CONFIG.renderer,
            ...config.renderer
        },
        gameLoop: {
            ...exports.DEFAULT_ENGINE_CONFIG.gameLoop,
            ...config.gameLoop
        }
    };
}
/**
 * Helper do tworzenia podstawowej Entity z Transform i Renderable
 */
function createBasicEntity(world, x = 0, y = 0, name) {
    const entity = world.createEntity(name);
    // Dodaj podstawowe komponenty
    const transform = new Transform_2.Transform(x, y);
    const renderable = new Renderable_2.Renderable();
    entity.addComponent(transform);
    entity.addComponent(renderable);
    return entity;
}
/**
 * Helper do tworzenia poruszającej się Entity
 */
function createMovableEntity(world, x = 0, y = 0, maxSpeed = 100, name) {
    const entity = createBasicEntity(world, x, y, name);
    // Dodaj komponent ruchu
    const movement = new Movement_2.Movement(maxSpeed);
    entity.addComponent(movement);
    return entity;
}
/**
 * Helper do tworzenia prostego systemu ECS
 */
function createECSWorld() {
    const world = new World_2.World();
    // Dodaj podstawowe systemy
    // Uwaga: RenderingEngine musi być przekazany z zewnątrz
    return world;
}
//# sourceMappingURL=index.js.map