/**
 * Podstawowe typy dla stanu gry RTS
 */

/**
 * Pozycja 2D
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Rozmiar 2D
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * Prostokąt
 */
export interface Rectangle extends Position, Size {}

/**
 * Unikalny identyfikator
 */
export type GameId = string;

/**
 * Timestamp gry
 */
export type GameTime = number;

/**
 * Typ zasobów w grze
 */
export enum ResourceType {
  GOLD = 'gold',
  WOOD = 'wood',
  STONE = 'stone',
  FOOD = 'food',
  ENERGY = 'energy'
}

/**
 * Mapa zasobów gracza
 */
export type ResourceMap = Partial<Record<ResourceType, number>>;

/**
 * Fakcja/rasa w grze
 */
export enum Faction {
  HUMANS = 'humans',
  ORCS = 'orcs',
  ELVES = 'elves',
  UNDEAD = 'undead'
}

/**
 * Status gracza
 */
export enum PlayerStatus {
  WAITING = 'waiting',
  CONNECTED = 'connected',
  PLAYING = 'playing',
  DEFEATED = 'defeated',
  VICTORY = 'victory',
  DISCONNECTED = 'disconnected'
}

/**
 * Dane gracza
 */
export interface Player {
  id: GameId;
  name: string;
  faction: Faction;
  status: PlayerStatus;
  resources: ResourceMap;
  color: string; // Hex color
  isAI: boolean;
  aiDifficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * Typ jednostki
 */
export enum UnitType {
  // Podstawowe jednostki
  WORKER = 'worker',
  WARRIOR = 'warrior',
  ARCHER = 'archer',
  CAVALRY = 'cavalry',
  
  // Zaawansowane jednostki
  MAGE = 'mage',
  SIEGE_ENGINE = 'siege_engine',
  FLYING_UNIT = 'flying_unit',
  
  // Bohaterowie
  HERO = 'hero'
}

/**
 * Typ budynku
 */
export enum BuildingType {
  // Podstawowe budynki
  TOWN_HALL = 'town_hall',
  HOUSE = 'house',
  BARRACKS = 'barracks',
  FARM = 'farm',
  
  // Zasoby
  MINE = 'mine',
  LUMBER_MILL = 'lumber_mill',
  QUARRY = 'quarry',
  
  // Obrona
  TOWER = 'tower',
  WALL = 'wall',
  GATE = 'gate',
  
  // Zaawansowane
  TEMPLE = 'temple',
  WORKSHOP = 'workshop',
  ACADEMY = 'academy'
}

/**
 * Statystyki jednostki/budynku
 */
export interface GameStats {
  health: number;
  maxHealth: number;
  armor: number;
  attack?: number;
  range?: number;
  moveSpeed?: number;
  buildTime?: number;
  cost: ResourceMap;
}

/**
 * Dane jednostki
 */
export interface Unit {
  id: GameId;
  playerId: GameId;
  type: UnitType;
  position: Position;
  rotation: number;
  stats: GameStats;
  
  // Stan
  isSelected: boolean;
  currentAction?: UnitAction;
  targetId?: GameId;
  targetPosition?: Position;
  path?: Position[];
  
  // Doświadczenie (dla niektórych jednostek)
  experience?: number;
  level?: number;
}

/**
 * Działania jednostek
 */
export enum UnitAction {
  IDLE = 'idle',
  MOVE = 'move',
  ATTACK = 'attack',
  GATHER = 'gather',
  BUILD = 'build',
  REPAIR = 'repair',
  PATROL = 'patrol',
  GUARD = 'guard',
  CAST_SPELL = 'cast_spell'
}

/**
 * Dane budynku
 */
export interface Building {
  id: GameId;
  playerId: GameId;
  type: BuildingType;
  position: Position;
  size: Size;
  rotation: number;
  stats: GameStats;
  
  // Stan
  isSelected: boolean;
  isUnderConstruction: boolean;
  constructionProgress: number; // 0-1
  
  // Produkcja
  productionQueue?: ProductionItem[];
  rallyPoint?: Position;
}

/**
 * Element kolejki produkcji
 */
export interface ProductionItem {
  id: GameId;
  type: UnitType | BuildingType;
  progress: number; // 0-1
  startTime: GameTime;
  estimatedEndTime: GameTime;
}

/**
 * Mapa gry
 */
export interface GameMap {
  id: string;
  name: string;
  size: Size;
  tileSize: number;
  
  // Terrain data (simplified)
  terrain: TerrainTile[][];
  resources: ResourceNode[];
  spawnPoints: Position[];
}

/**
 * Kafelek terenu
 */
export interface TerrainTile {
  type: TerrainType;
  height: number;
  walkable: boolean;
  buildable: boolean;
}

/**
 * Typ terenu
 */
export enum TerrainType {
  GRASS = 'grass',
  DIRT = 'dirt',
  STONE = 'stone',
  WATER = 'water',
  SAND = 'sand',
  FOREST = 'forest',
  MOUNTAIN = 'mountain'
}

/**
 * Węzeł zasobów na mapie
 */
export interface ResourceNode {
  id: GameId;
  type: ResourceType;
  position: Position;
  amount: number;
  maxAmount: number;
  isExhausted: boolean;
}

/**
 * Stan gry
 */
export interface GameState {
  id: GameId;
  name: string;
  status: GameStatus;
  
  // Czas
  gameTime: GameTime;
  turnNumber?: number;
  
  // Mapa i gracze
  map: GameMap;
  players: Player[];
  currentPlayerId?: GameId; // Dla turn-based
  
  // Jednostki i budynki
  units: Unit[];
  buildings: Building[];
  
  // Stan rozgrywki
  winner?: GameId;
  gameSettings: GameSettings;
}

/**
 * Status gry
 */
export enum GameStatus {
  WAITING_FOR_PLAYERS = 'waiting_for_players',
  STARTING = 'starting',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  FINISHED = 'finished',
  ABORTED = 'aborted'
}

/**
 * Ustawienia gry
 */
export interface GameSettings {
  gameMode: GameMode;
  maxPlayers: number;
  allowSpectators: boolean;
  gameSpeed: number; // multiplier
  revealMap: boolean;
  allowCheats: boolean;
  turnTime?: number; // dla turn-based
  victoryConditions: VictoryCondition[];
}

/**
 * Tryby gry
 */
export enum GameMode {
  REAL_TIME = 'real_time',
  TURN_BASED = 'turn_based',
  TUTORIAL = 'tutorial',
  SANDBOX = 'sandbox'
}

/**
 * Warunki zwycięstwa
 */
export enum VictoryCondition {
  ELIMINATION = 'elimination', // Zniszcz wszystkich wrogów
  DOMINATION = 'domination',   // Kontroluj X% mapy
  ECONOMIC = 'economic',       // Zbierz X zasobów
  TIME_LIMIT = 'time_limit',   // Przetrwaj X czasu
  CUSTOM = 'custom'            // Niestandardowy warunek
} 