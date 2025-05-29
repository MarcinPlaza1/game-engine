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
export interface Rectangle extends Position, Size {
}
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
export declare enum ResourceType {
    GOLD = "gold",
    WOOD = "wood",
    STONE = "stone",
    FOOD = "food",
    ENERGY = "energy"
}
/**
 * Mapa zasobów gracza
 */
export type ResourceMap = Partial<Record<ResourceType, number>>;
/**
 * Fakcja/rasa w grze
 */
export declare enum Faction {
    HUMANS = "humans",
    ORCS = "orcs",
    ELVES = "elves",
    UNDEAD = "undead"
}
/**
 * Status gracza
 */
export declare enum PlayerStatus {
    WAITING = "waiting",
    CONNECTED = "connected",
    PLAYING = "playing",
    DEFEATED = "defeated",
    VICTORY = "victory",
    DISCONNECTED = "disconnected"
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
    color: string;
    isAI: boolean;
    aiDifficulty?: 'easy' | 'medium' | 'hard';
}
/**
 * Typ jednostki
 */
export declare enum UnitType {
    WORKER = "worker",
    WARRIOR = "warrior",
    ARCHER = "archer",
    CAVALRY = "cavalry",
    MAGE = "mage",
    SIEGE_ENGINE = "siege_engine",
    FLYING_UNIT = "flying_unit",
    HERO = "hero"
}
/**
 * Typ budynku
 */
export declare enum BuildingType {
    TOWN_HALL = "town_hall",
    HOUSE = "house",
    BARRACKS = "barracks",
    FARM = "farm",
    MINE = "mine",
    LUMBER_MILL = "lumber_mill",
    QUARRY = "quarry",
    TOWER = "tower",
    WALL = "wall",
    GATE = "gate",
    TEMPLE = "temple",
    WORKSHOP = "workshop",
    ACADEMY = "academy"
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
    isSelected: boolean;
    currentAction?: UnitAction;
    targetId?: GameId;
    targetPosition?: Position;
    path?: Position[];
    experience?: number;
    level?: number;
}
/**
 * Działania jednostek
 */
export declare enum UnitAction {
    IDLE = "idle",
    MOVE = "move",
    ATTACK = "attack",
    GATHER = "gather",
    BUILD = "build",
    REPAIR = "repair",
    PATROL = "patrol",
    GUARD = "guard",
    CAST_SPELL = "cast_spell"
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
    isSelected: boolean;
    isUnderConstruction: boolean;
    constructionProgress: number;
    productionQueue?: ProductionItem[];
    rallyPoint?: Position;
}
/**
 * Element kolejki produkcji
 */
export interface ProductionItem {
    id: GameId;
    type: UnitType | BuildingType;
    progress: number;
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
export declare enum TerrainType {
    GRASS = "grass",
    DIRT = "dirt",
    STONE = "stone",
    WATER = "water",
    SAND = "sand",
    FOREST = "forest",
    MOUNTAIN = "mountain"
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
    gameTime: GameTime;
    turnNumber?: number;
    map: GameMap;
    players: Player[];
    currentPlayerId?: GameId;
    units: Unit[];
    buildings: Building[];
    winner?: GameId;
    gameSettings: GameSettings;
}
/**
 * Status gry
 */
export declare enum GameStatus {
    WAITING_FOR_PLAYERS = "waiting_for_players",
    STARTING = "starting",
    IN_PROGRESS = "in_progress",
    PAUSED = "paused",
    FINISHED = "finished",
    ABORTED = "aborted"
}
/**
 * Ustawienia gry
 */
export interface GameSettings {
    gameMode: GameMode;
    maxPlayers: number;
    allowSpectators: boolean;
    gameSpeed: number;
    revealMap: boolean;
    allowCheats: boolean;
    turnTime?: number;
    victoryConditions: VictoryCondition[];
}
/**
 * Tryby gry
 */
export declare enum GameMode {
    REAL_TIME = "real_time",
    TURN_BASED = "turn_based",
    TUTORIAL = "tutorial",
    SANDBOX = "sandbox"
}
/**
 * Warunki zwycięstwa
 */
export declare enum VictoryCondition {
    ELIMINATION = "elimination",// Zniszcz wszystkich wrogów
    DOMINATION = "domination",// Kontroluj X% mapy
    ECONOMIC = "economic",// Zbierz X zasobów
    TIME_LIMIT = "time_limit",// Przetrwaj X czasu
    CUSTOM = "custom"
}
//# sourceMappingURL=GameState.d.ts.map