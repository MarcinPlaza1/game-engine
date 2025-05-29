import { Vector2 } from '../math/Vector2';
/**
 * Węzeł w algorytmie A*
 */
export declare class AStarNode {
    x: number;
    y: number;
    g: number;
    h: number;
    f: number;
    parent: AStarNode | null;
    walkable: boolean;
    constructor(x: number, y: number, walkable?: boolean);
    /**
     * Oblicza f = g + h
     */
    calculateF(): void;
    /**
     * Sprawdza równość węzłów
     */
    equals(other: AStarNode): boolean;
    /**
     * Zwraca pozycję jako Vector2
     */
    toVector2(): Vector2;
}
/**
 * Enum dla heurystyk
 */
export declare enum Heuristic {
    MANHATTAN = "manhattan",
    EUCLIDEAN = "euclidean",
    DIAGONAL = "diagonal"
}
/**
 * Konfiguracja algorytmu A*
 */
export interface AStarConfig {
    allowDiagonal?: boolean;
    heuristic?: Heuristic;
    diagonalCost?: number;
    straightCost?: number;
}
/**
 * Implementacja algorytmu A* dla pathfinding
 */
export declare class AStar {
    private grid;
    private width;
    private height;
    private config;
    constructor(width: number, height: number, config?: AStarConfig);
    /**
     * Inicjalizuje siatkę węzłów
     */
    private initializeGrid;
    /**
     * Ustawia przeszkodę na pozycji
     */
    setObstacle(x: number, y: number, isObstacle?: boolean): void;
    /**
     * Sprawdza czy pozycja jest przejściowa
     */
    isWalkable(x: number, y: number): boolean;
    /**
     * Sprawdza czy pozycja jest w granicach siatki
     */
    isValidPosition(x: number, y: number): boolean;
    /**
     * Znajduje ścieżkę od startu do celu
     */
    findPath(startX: number, startY: number, endX: number, endY: number): Vector2[];
    /**
     * Znajduje ścieżkę używając pozycji świata (konwertuje na grid)
     */
    findWorldPath(startWorld: Vector2, endWorld: Vector2): Vector2[];
    /**
     * Rekonstruuje ścieżkę z węzła końcowego
     */
    private reconstructPath;
    /**
     * Zwraca sąsiadów węzła
     */
    private getNeighbors;
    /**
     * Oblicza koszt ruchu między węzłami
     */
    private getMovementCost;
    /**
     * Oblicza heurystykę (oszacowanie odległości do celu)
     */
    private calculateHeuristic;
    /**
     * Resetuje węzły przed nowym wyszukiwaniem
     */
    private resetNodes;
    /**
     * Ustawia obszar przeszkód
     */
    setObstacleArea(startX: number, startY: number, endX: number, endY: number, isObstacle?: boolean): void;
    /**
     * Czyści wszystkie przeszkody
     */
    clearObstacles(): void;
    /**
     * Zwraca kopię mapy przeszkód
     */
    getObstacleMap(): boolean[][];
    /**
     * Importuje mapę przeszkód
     */
    setObstacleMap(obstacleMap: boolean[][]): void;
    /**
     * Sprawdza czy istnieje ścieżka między dwoma punktami (szybkie sprawdzenie)
     */
    hasPath(startX: number, startY: number, endX: number, endY: number): boolean;
}
//# sourceMappingURL=AStar.d.ts.map