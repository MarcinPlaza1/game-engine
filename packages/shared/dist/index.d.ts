/**
 * @rts-engine/shared - Shared types and utilities
 * Eksporty dla wszystkich pakietów w monorepo
 */
export { Position, Size, Rectangle, GameId, GameTime, ResourceType, ResourceMap, Faction, PlayerStatus, Player, UnitType, UnitAction, Unit, BuildingType, Building, ProductionItem, GameStats, GameMap, TerrainTile, TerrainType, ResourceNode, GameState, GameStatus, GameSettings, GameMode, VictoryCondition } from './types/GameState';
export { BaseNetworkMessage, NetworkMessage, ClientMessage, ServerMessage, ClientMessageType, ServerMessageType, JoinLobbyMessage, CreateRoomMessage, JoinRoomMessage, AddAIPlayerMessage, PlayerActionMessage, GameCommandMessage, LobbyStateMessage, RoomStateMessage, GameStateUpdateMessage, GameEventMessage, ErrorMessage, ConnectionStatusMessage, ChatMessage, ChatChannel, GameRoom, GameStateDelta, GameEvent, GameEventType, createBaseMessage, isClientMessage, isServerMessage, validateNetworkMessage } from './protocols/NetworkProtocol';
export { ValidationResult, createValidResult, createInvalidResult, validatePosition, validateSize, validateGameId, validatePlayerName, validateResources, validatePlayer, validateUnit, validateUnitStats, validateBuilding, validateGameSettings, validatePlayerAction, validateMessage, validateGameState, sanitizeString, checkRateLimit } from './validation/GameValidation';
export { generateGameId, isPointInRectangle, rectanglesIntersect, distanceBetween, distanceSquared, isInRange, getRectangleCenter, normalizeAngle, angleBetween, lerp, lerpPosition, clamp, findNearestUnit, findUnitsInRange, isUnitAlive, isBuildingComplete, getUnitBounds, getBuildingBounds, checkUnitCollision, checkUnitBuildingCollision, isOwnedByPlayer, filterUnitsByPlayer, filterBuildingsByPlayer, hasEnoughResources, subtractResources, addResources, getTotalResourceValue, formatResources, parseResources, isPositionFree, findNearestFreePosition, getCirclePositions, sortUnitsByDistance, groupUnitsByType, calculateGroupStats } from './utils/GameUtils';
import { Faction, GameId, Player, GameSettings } from './types/GameState';
/**
 * Wersja shared pakietu
 */
export declare const SHARED_VERSION = "1.2.0";
/**
 * Domyślne ustawienia gry
 */
export declare const DEFAULT_GAME_SETTINGS: GameSettings;
/**
 * Domyślne koszty jednostek
 */
export declare const DEFAULT_UNIT_COSTS: {
    worker: {
        gold: number;
        food: number;
    };
    warrior: {
        gold: number;
        food: number;
    };
    archer: {
        gold: number;
        wood: number;
        food: number;
    };
    cavalry: {
        gold: number;
        food: number;
    };
    mage: {
        gold: number;
        energy: number;
        food: number;
    };
    siege_engine: {
        gold: number;
        wood: number;
        stone: number;
    };
    flying_unit: {
        gold: number;
        energy: number;
        food: number;
    };
    hero: {
        gold: number;
        energy: number;
        food: number;
    };
};
/**
 * Domyślne koszty budynków
 */
export declare const DEFAULT_BUILDING_COSTS: {
    town_hall: {
        gold: number;
        wood: number;
        stone: number;
    };
    house: {
        gold: number;
        wood: number;
    };
    barracks: {
        gold: number;
        wood: number;
    };
    farm: {
        gold: number;
        wood: number;
    };
    mine: {
        gold: number;
        wood: number;
        stone: number;
    };
    lumber_mill: {
        gold: number;
        stone: number;
    };
    quarry: {
        gold: number;
        wood: number;
    };
    tower: {
        gold: number;
        stone: number;
    };
    wall: {
        gold: number;
        stone: number;
    };
    gate: {
        gold: number;
        stone: number;
    };
    temple: {
        gold: number;
        stone: number;
        energy: number;
    };
    workshop: {
        gold: number;
        wood: number;
        stone: number;
    };
    academy: {
        gold: number;
        wood: number;
        stone: number;
    };
};
/**
 * Limity zasobów
 */
export declare const RESOURCE_LIMITS: {
    MAX_PER_TYPE: number;
    STARTING_RESOURCES: {
        gold: number;
        wood: number;
        stone: number;
        food: number;
        energy: number;
    };
};
/**
 * Domyślne rozmiary kafelków i jednostek
 */
export declare const GAME_CONSTANTS: {
    TILE_SIZE: number;
    UNIT_SIZE: number;
    MAX_SELECTION: number;
    MAX_PATHFINDING_DISTANCE: number;
    ATTACK_RANGE_DEFAULT: number;
    BUILD_RANGE_DEFAULT: number;
    GATHER_RANGE_DEFAULT: number;
};
/**
 * Konfiguracja sieci
 */
export declare const NETWORK_CONFIG: {
    MAX_MESSAGE_SIZE: number;
    HEARTBEAT_INTERVAL: number;
    RECONNECT_TIMEOUT: number;
    MAX_RECONNECT_ATTEMPTS: number;
    PING_INTERVAL: number;
    MAX_PING: number;
};
/**
 * Kolory dla fakcji
 */
export declare const FACTION_COLORS: {
    humans: string;
    orcs: string;
    elves: string;
    undead: string;
};
/**
 * Helper do tworzenia domyślnego gracza
 */
export declare function createDefaultPlayer(id: GameId, name: string, faction: Faction): Player;
/**
 * Helper do tworzenia domyślnych ustawień gry
 */
export declare function createDefaultGameSettings(): GameSettings;
export { PlayerActionType, PlayerAction, createDefaultPlayer as createPlayer } from './types/Player';
export * from './config/GameBalance';
//# sourceMappingURL=index.d.ts.map