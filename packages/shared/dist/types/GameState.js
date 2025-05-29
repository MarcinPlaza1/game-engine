/**
 * Podstawowe typy dla stanu gry RTS
 */
/**
 * Typ zasobów w grze
 */
export var ResourceType;
(function (ResourceType) {
    ResourceType["GOLD"] = "gold";
    ResourceType["WOOD"] = "wood";
    ResourceType["STONE"] = "stone";
    ResourceType["FOOD"] = "food";
    ResourceType["ENERGY"] = "energy";
})(ResourceType || (ResourceType = {}));
/**
 * Fakcja/rasa w grze
 */
export var Faction;
(function (Faction) {
    Faction["HUMANS"] = "humans";
    Faction["ORCS"] = "orcs";
    Faction["ELVES"] = "elves";
    Faction["UNDEAD"] = "undead";
})(Faction || (Faction = {}));
/**
 * Status gracza
 */
export var PlayerStatus;
(function (PlayerStatus) {
    PlayerStatus["WAITING"] = "waiting";
    PlayerStatus["CONNECTED"] = "connected";
    PlayerStatus["PLAYING"] = "playing";
    PlayerStatus["DEFEATED"] = "defeated";
    PlayerStatus["VICTORY"] = "victory";
    PlayerStatus["DISCONNECTED"] = "disconnected";
})(PlayerStatus || (PlayerStatus = {}));
/**
 * Typ jednostki
 */
export var UnitType;
(function (UnitType) {
    // Podstawowe jednostki
    UnitType["WORKER"] = "worker";
    UnitType["WARRIOR"] = "warrior";
    UnitType["ARCHER"] = "archer";
    UnitType["CAVALRY"] = "cavalry";
    // Zaawansowane jednostki
    UnitType["MAGE"] = "mage";
    UnitType["SIEGE_ENGINE"] = "siege_engine";
    UnitType["FLYING_UNIT"] = "flying_unit";
    // Bohaterowie
    UnitType["HERO"] = "hero";
})(UnitType || (UnitType = {}));
/**
 * Typ budynku
 */
export var BuildingType;
(function (BuildingType) {
    // Podstawowe budynki
    BuildingType["TOWN_HALL"] = "town_hall";
    BuildingType["HOUSE"] = "house";
    BuildingType["BARRACKS"] = "barracks";
    BuildingType["FARM"] = "farm";
    // Zasoby
    BuildingType["MINE"] = "mine";
    BuildingType["LUMBER_MILL"] = "lumber_mill";
    BuildingType["QUARRY"] = "quarry";
    // Obrona
    BuildingType["TOWER"] = "tower";
    BuildingType["WALL"] = "wall";
    BuildingType["GATE"] = "gate";
    // Zaawansowane
    BuildingType["TEMPLE"] = "temple";
    BuildingType["WORKSHOP"] = "workshop";
    BuildingType["ACADEMY"] = "academy";
})(BuildingType || (BuildingType = {}));
/**
 * Działania jednostek
 */
export var UnitAction;
(function (UnitAction) {
    UnitAction["IDLE"] = "idle";
    UnitAction["MOVE"] = "move";
    UnitAction["ATTACK"] = "attack";
    UnitAction["GATHER"] = "gather";
    UnitAction["BUILD"] = "build";
    UnitAction["REPAIR"] = "repair";
    UnitAction["PATROL"] = "patrol";
    UnitAction["GUARD"] = "guard";
    UnitAction["CAST_SPELL"] = "cast_spell";
})(UnitAction || (UnitAction = {}));
/**
 * Typ terenu
 */
export var TerrainType;
(function (TerrainType) {
    TerrainType["GRASS"] = "grass";
    TerrainType["DIRT"] = "dirt";
    TerrainType["STONE"] = "stone";
    TerrainType["WATER"] = "water";
    TerrainType["SAND"] = "sand";
    TerrainType["FOREST"] = "forest";
    TerrainType["MOUNTAIN"] = "mountain";
})(TerrainType || (TerrainType = {}));
/**
 * Status gry
 */
export var GameStatus;
(function (GameStatus) {
    GameStatus["WAITING_FOR_PLAYERS"] = "waiting_for_players";
    GameStatus["STARTING"] = "starting";
    GameStatus["IN_PROGRESS"] = "in_progress";
    GameStatus["PAUSED"] = "paused";
    GameStatus["FINISHED"] = "finished";
    GameStatus["ABORTED"] = "aborted";
})(GameStatus || (GameStatus = {}));
/**
 * Tryby gry
 */
export var GameMode;
(function (GameMode) {
    GameMode["REAL_TIME"] = "real_time";
    GameMode["TURN_BASED"] = "turn_based";
    GameMode["TUTORIAL"] = "tutorial";
    GameMode["SANDBOX"] = "sandbox";
})(GameMode || (GameMode = {}));
/**
 * Warunki zwycięstwa
 */
export var VictoryCondition;
(function (VictoryCondition) {
    VictoryCondition["ELIMINATION"] = "elimination";
    VictoryCondition["DOMINATION"] = "domination";
    VictoryCondition["ECONOMIC"] = "economic";
    VictoryCondition["TIME_LIMIT"] = "time_limit";
    VictoryCondition["CUSTOM"] = "custom"; // Niestandardowy warunek
})(VictoryCondition || (VictoryCondition = {}));
//# sourceMappingURL=GameState.js.map