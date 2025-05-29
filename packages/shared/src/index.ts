/**
 * @rts-engine/shared - Shared types and utilities
 * Eksporty dla wszystkich pakietów w monorepo
 */

// === TYPES ===
export {
  // Podstawowe typy
  Position,
  Size,
  Rectangle,
  GameId,
  GameTime,
  
  // Zasoby
  ResourceType,
  ResourceMap,
  
  // Gracze i fakcje
  Faction,
  PlayerStatus,
  Player,
  
  // Jednostki
  UnitType,
  UnitAction,
  Unit,
  
  // Budynki
  BuildingType,
  Building,
  ProductionItem,
  
  // Statystyki
  GameStats,
  
  // Mapa
  GameMap,
  TerrainTile,
  TerrainType,
  ResourceNode,
  
  // Stan gry
  GameState,
  GameStatus,
  GameSettings,
  GameMode,
  VictoryCondition
} from './types/GameState';

// === NETWORK PROTOCOLS ===
export {
  // Podstawowe typy wiadomości
  BaseNetworkMessage,
  NetworkMessage,
  ClientMessage,
  ServerMessage,
  
  // Typy wiadomości
  ClientMessageType,
  ServerMessageType,
  
  // Konkretne wiadomości klient -> serwer
  JoinLobbyMessage,
  CreateRoomMessage,
  JoinRoomMessage,
  AddAIPlayerMessage,
  PlayerActionMessage,
  GameCommandMessage,
  
  // Konkretne wiadomości serwer -> klient
  LobbyStateMessage,
  RoomStateMessage,
  GameStateUpdateMessage,
  GameEventMessage,
  ErrorMessage,
  ConnectionStatusMessage,
  
  // Chat
  ChatMessage,
  ChatChannel,
  
  // Game room
  GameRoom,
  
  // Game state updates
  GameStateDelta,
  
  // Game events
  GameEvent,
  GameEventType,
  
  // Utility functions
  createBaseMessage,
  isClientMessage,
  isServerMessage,
  validateNetworkMessage
} from './protocols/NetworkProtocol';

// === VALIDATION ===
export {
  // Rezultat walidacji
  ValidationResult,
  createValidResult,
  createInvalidResult,
  
  // Funkcje walidacji
  validatePosition,
  validateSize,
  validateGameId,
  validatePlayerName,
  validateResources,
  validatePlayer,
  validateUnit,
  validateUnitStats,
  validateBuilding,
  validateGameSettings,
  validatePlayerAction,
  validateMessage,
  validateGameState,
  
  // Utility
  sanitizeString,
  checkRateLimit
} from './validation/GameValidation';

// === GAME UTILITIES ===
export {
  // ID generation
  generateGameId,
  
  // Geometria
  isPointInRectangle,
  rectanglesIntersect,
  distanceBetween,
  distanceSquared,
  isInRange,
  getRectangleCenter,
  
  // Matematyka
  normalizeAngle,
  angleBetween,
  lerp,
  lerpPosition,
  clamp,
  
  // Jednostki i budynki
  findNearestUnit,
  findUnitsInRange,
  isUnitAlive,
  isBuildingComplete,
  getUnitBounds,
  getBuildingBounds,
  checkUnitCollision,
  checkUnitBuildingCollision,
  
  // Gracze i własność
  isOwnedByPlayer,
  filterUnitsByPlayer,
  filterBuildingsByPlayer,
  
  // Zasoby
  hasEnoughResources,
  subtractResources,
  addResources,
  getTotalResourceValue,
  formatResources,
  parseResources,
  
  // Pozycje i kolizje
  isPositionFree,
  findNearestFreePosition,
  getCirclePositions,
  
  // Sortowanie i grupowanie
  sortUnitsByDistance,
  groupUnitsByType,
  calculateGroupStats
} from './utils/GameUtils';

// Import typów dla użycia w constants
import { 
  UnitType, 
  BuildingType, 
  Faction, 
  GameId, 
  Player, 
  PlayerStatus, 
  GameSettings,
  GameMode,
  VictoryCondition
} from './types/GameState';

// === CONSTANTS ===

/**
 * Wersja shared pakietu
 */
export const SHARED_VERSION = '1.2.0';

/**
 * Domyślne ustawienia gry
 */
export const DEFAULT_GAME_SETTINGS: GameSettings = {
  gameMode: GameMode.REAL_TIME,
  maxPlayers: 4,
  allowSpectators: true,
  gameSpeed: 1.0,
  revealMap: false,
  allowCheats: false,
  victoryConditions: [VictoryCondition.ELIMINATION]
};

/**
 * Domyślne koszty jednostek
 */
export const DEFAULT_UNIT_COSTS = {
  [UnitType.WORKER]: { gold: 50, food: 1 },
  [UnitType.WARRIOR]: { gold: 100, food: 2 },
  [UnitType.ARCHER]: { gold: 80, wood: 20, food: 1 },
  [UnitType.CAVALRY]: { gold: 150, food: 3 },
  [UnitType.MAGE]: { gold: 200, energy: 50, food: 2 },
  [UnitType.SIEGE_ENGINE]: { gold: 300, wood: 100, stone: 50 },
  [UnitType.FLYING_UNIT]: { gold: 250, energy: 100, food: 3 },
  [UnitType.HERO]: { gold: 500, energy: 200, food: 5 }
};

/**
 * Domyślne koszty budynków
 */
export const DEFAULT_BUILDING_COSTS = {
  [BuildingType.TOWN_HALL]: { gold: 500, wood: 200, stone: 100 },
  [BuildingType.HOUSE]: { gold: 80, wood: 50 },
  [BuildingType.BARRACKS]: { gold: 200, wood: 100 },
  [BuildingType.FARM]: { gold: 100, wood: 80 },
  [BuildingType.MINE]: { gold: 150, wood: 50, stone: 100 },
  [BuildingType.LUMBER_MILL]: { gold: 120, stone: 50 },
  [BuildingType.QUARRY]: { gold: 180, wood: 100 },
  [BuildingType.TOWER]: { gold: 250, stone: 150 },
  [BuildingType.WALL]: { gold: 50, stone: 100 },
  [BuildingType.GATE]: { gold: 100, stone: 150 },
  [BuildingType.TEMPLE]: { gold: 300, stone: 200, energy: 100 },
  [BuildingType.WORKSHOP]: { gold: 200, wood: 150, stone: 50 },
  [BuildingType.ACADEMY]: { gold: 400, wood: 200, stone: 200 }
};

/**
 * Limity zasobów
 */
export const RESOURCE_LIMITS = {
  MAX_PER_TYPE: 999999,
  STARTING_RESOURCES: {
    gold: 500,
    wood: 200,
    stone: 100,
    food: 50,
    energy: 0
  }
};

/**
 * Domyślne rozmiary kafelków i jednostek
 */
export const GAME_CONSTANTS = {
  TILE_SIZE: 32,
  UNIT_SIZE: 16,
  MAX_SELECTION: 50,
  MAX_PATHFINDING_DISTANCE: 1000,
  ATTACK_RANGE_DEFAULT: 64,
  BUILD_RANGE_DEFAULT: 96,
  GATHER_RANGE_DEFAULT: 48
};

/**
 * Konfiguracja sieci
 */
export const NETWORK_CONFIG = {
  MAX_MESSAGE_SIZE: 1024 * 10, // 10KB
  HEARTBEAT_INTERVAL: 30000,    // 30s
  RECONNECT_TIMEOUT: 5000,      // 5s
  MAX_RECONNECT_ATTEMPTS: 3,
  PING_INTERVAL: 5000,          // 5s
  MAX_PING: 1000               // 1s
};

/**
 * Kolory dla fakcji
 */
export const FACTION_COLORS = {
  [Faction.HUMANS]: '#3498db',   // Niebieski
  [Faction.ORCS]: '#e74c3c',     // Czerwony
  [Faction.ELVES]: '#2ecc71',    // Zielony
  [Faction.UNDEAD]: '#9b59b6'    // Fioletowy
};

/**
 * Helper do tworzenia domyślnego gracza
 */
export function createDefaultPlayer(id: GameId, name: string, faction: Faction): Player {
  return {
    id,
    name,
    faction,
    status: PlayerStatus.WAITING,
    resources: { ...RESOURCE_LIMITS.STARTING_RESOURCES },
    color: FACTION_COLORS[faction],
    isAI: false
  };
}

/**
 * Helper do tworzenia domyślnych ustawień gry
 */
export function createDefaultGameSettings(): GameSettings {
  return { ...DEFAULT_GAME_SETTINGS };
}

// === ADDITIONAL EXPORTS ===

// Player actions from Player.ts
export { PlayerActionType, PlayerAction, createDefaultPlayer as createPlayer } from './types/Player';

// Game balance configuration
export * from './config/GameBalance'; 