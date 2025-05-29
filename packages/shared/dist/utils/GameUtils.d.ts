/**
 * Utility functions dla gry RTS
 */
import { Position, Rectangle, GameId, Unit, Building, ResourceMap, UnitType } from '../types/GameState';
/**
 * Generuje unikalny ID
 */
export declare function generateGameId(): GameId;
/**
 * Sprawdza czy punkt jest w prostokącie
 */
export declare function isPointInRectangle(point: Position, rect: Rectangle): boolean;
/**
 * Sprawdza czy dwa prostokąty się przecinają
 */
export declare function rectanglesIntersect(rect1: Rectangle, rect2: Rectangle): boolean;
/**
 * Oblicza odległość między dwoma punktami
 */
export declare function distanceBetween(pos1: Position, pos2: Position): number;
/**
 * Oblicza kwadrat odległości (szybsze dla porównań)
 */
export declare function distanceSquared(pos1: Position, pos2: Position): number;
/**
 * Normalizuje kąt do zakresu 0-2π
 */
export declare function normalizeAngle(angle: number): number;
/**
 * Oblicza kąt między dwoma punktami
 */
export declare function angleBetween(from: Position, to: Position): number;
/**
 * Interpoluje liniowo między dwoma wartościami
 */
export declare function lerp(start: number, end: number, t: number): number;
/**
 * Interpoluje pozycję
 */
export declare function lerpPosition(start: Position, end: Position, t: number): Position;
/**
 * Ogranicza wartość do zakresu
 */
export declare function clamp(value: number, min: number, max: number): number;
/**
 * Sprawdza czy pozycja jest w zasięgu
 */
export declare function isInRange(from: Position, to: Position, range: number): boolean;
/**
 * Znajduje najbliższą jednostkę do pozycji
 */
export declare function findNearestUnit(position: Position, units: Unit[], maxDistance?: number): Unit | null;
/**
 * Znajduje jednostki w zasięgu
 */
export declare function findUnitsInRange(center: Position, units: Unit[], range: number): Unit[];
/**
 * Sprawdza czy gracz ma wystarczające zasoby
 */
export declare function hasEnoughResources(playerResources: ResourceMap, requiredResources: ResourceMap): boolean;
/**
 * Odejmuje zasoby od gracza
 */
export declare function subtractResources(playerResources: ResourceMap, cost: ResourceMap): ResourceMap;
/**
 * Dodaje zasoby do gracza
 */
export declare function addResources(playerResources: ResourceMap, resources: ResourceMap): ResourceMap;
/**
 * Oblicza całkowitą wartość zasobów
 */
export declare function getTotalResourceValue(resources: ResourceMap): number;
/**
 * Sprawdza czy jednostka należy do gracza
 */
export declare function isOwnedByPlayer(unit: Unit | Building, playerId: GameId): boolean;
/**
 * Filtruje jednostki według gracza
 */
export declare function filterUnitsByPlayer(units: Unit[], playerId: GameId): Unit[];
/**
 * Filtruje budynki według gracza
 */
export declare function filterBuildingsByPlayer(buildings: Building[], playerId: GameId): Building[];
/**
 * Sprawdza czy jednostka żyje
 */
export declare function isUnitAlive(unit: Unit): boolean;
/**
 * Sprawdza czy budynek jest ukończony
 */
export declare function isBuildingComplete(building: Building): boolean;
/**
 * Oblicza bounding box dla jednostki
 */
export declare function getUnitBounds(unit: Unit): Rectangle;
/**
 * Oblicza bounding box dla budynku
 */
export declare function getBuildingBounds(building: Building): Rectangle;
/**
 * Sprawdza kolizję między jednostkami
 */
export declare function checkUnitCollision(unit1: Unit, unit2: Unit): boolean;
/**
 * Sprawdza kolizję jednostki z budynkiem
 */
export declare function checkUnitBuildingCollision(unit: Unit, building: Building): boolean;
/**
 * Oblicza centrum prostokąta
 */
export declare function getRectangleCenter(rect: Rectangle): Position;
/**
 * Sprawdza czy pozycja jest wolna (brak kolizji)
 */
export declare function isPositionFree(position: Position, units: Unit[], buildings: Building[], excludeUnit?: GameId): boolean;
/**
 * Znajduje najbliższą wolną pozycję
 */
export declare function findNearestFreePosition(targetPosition: Position, units: Unit[], buildings: Building[], maxDistance?: number, step?: number): Position | null;
/**
 * Generuje pozycje na okręgu
 */
export declare function getCirclePositions(center: Position, radius: number, count: number): Position[];
/**
 * Sortuje jednostki według odległości od punktu
 */
export declare function sortUnitsByDistance(units: Unit[], from: Position): Unit[];
/**
 * Grupuje jednostki według typu
 */
export declare function groupUnitsByType(units: Unit[]): Map<UnitType, Unit[]>;
/**
 * Oblicza statystyki zespołu jednostek
 */
export declare function calculateGroupStats(units: Unit[]): {
    totalHealth: number;
    totalAttack: number;
    averageSpeed: number;
    count: number;
};
/**
 * Formatuje zasoby jako string
 */
export declare function formatResources(resources: ResourceMap): string;
/**
 * Parsuje string z zasobami
 */
export declare function parseResources(resourceString: string): ResourceMap;
//# sourceMappingURL=GameUtils.d.ts.map