import { Vector2 } from '../math/Vector2';
import { IsometricUtils } from '../math/IsometricUtils';

/**
 * Węzeł w algorytmie A*
 */
export class AStarNode {
  public x: number;
  public y: number;
  public g: number = 0; // koszt od startu
  public h: number = 0; // heurystyka do celu
  public f: number = 0; // g + h
  public parent: AStarNode | null = null;
  public walkable: boolean = true;

  constructor(x: number, y: number, walkable: boolean = true) {
    this.x = x;
    this.y = y;
    this.walkable = walkable;
  }

  /**
   * Oblicza f = g + h
   */
  calculateF(): void {
    this.f = this.g + this.h;
  }

  /**
   * Sprawdza równość węzłów
   */
  equals(other: AStarNode): boolean {
    return this.x === other.x && this.y === other.y;
  }

  /**
   * Zwraca pozycję jako Vector2
   */
  toVector2(): Vector2 {
    return new Vector2(this.x, this.y);
  }
}

/**
 * Enum dla heurystyk
 */
export enum Heuristic {
  MANHATTAN = 'manhattan',
  EUCLIDEAN = 'euclidean',
  DIAGONAL = 'diagonal'
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
export class AStar {
  private grid: AStarNode[][] = [];
  private width: number;
  private height: number;
  private config: AStarConfig;

  constructor(width: number, height: number, config: AStarConfig = {}) {
    this.width = width;
    this.height = height;
    this.config = {
      allowDiagonal: config.allowDiagonal ?? true,
      heuristic: config.heuristic ?? Heuristic.EUCLIDEAN,
      diagonalCost: config.diagonalCost ?? 14, // √2 * 10
      straightCost: config.straightCost ?? 10
    };
    
    this.initializeGrid();
  }

  /**
   * Inicjalizuje siatkę węzłów
   */
  private initializeGrid(): void {
    this.grid = [];
    for (let x = 0; x < this.width; x++) {
      this.grid[x] = [];
      for (let y = 0; y < this.height; y++) {
        this.grid[x][y] = new AStarNode(x, y);
      }
    }
  }

  /**
   * Ustawia przeszkodę na pozycji
   */
  setObstacle(x: number, y: number, isObstacle: boolean = true): void {
    if (this.isValidPosition(x, y)) {
      this.grid[x][y].walkable = !isObstacle;
    }
  }

  /**
   * Sprawdza czy pozycja jest przejściowa
   */
  isWalkable(x: number, y: number): boolean {
    if (!this.isValidPosition(x, y)) return false;
    return this.grid[x][y].walkable;
  }

  /**
   * Sprawdza czy pozycja jest w granicach siatki
   */
  isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  /**
   * Znajduje ścieżkę od startu do celu
   */
  findPath(startX: number, startY: number, endX: number, endY: number): Vector2[] {
    // Sprawdź poprawność pozycji
    if (!this.isValidPosition(startX, startY) || !this.isValidPosition(endX, endY)) {
      return [];
    }

    if (!this.isWalkable(startX, startY) || !this.isWalkable(endX, endY)) {
      return [];
    }

    // Jeśli start == end
    if (startX === endX && startY === endY) {
      return [new Vector2(startX, startY)];
    }

    // Reset węzłów
    this.resetNodes();

    const startNode = this.grid[startX][startY];
    const endNode = this.grid[endX][endY];

    const openList: AStarNode[] = [];
    const closedList: Set<AStarNode> = new Set();

    openList.push(startNode);

    while (openList.length > 0) {
      // Znajdź węzeł z najniższym F
      let currentNode = openList[0];
      let currentIndex = 0;

      for (let i = 1; i < openList.length; i++) {
        if (openList[i].f < currentNode.f || 
           (openList[i].f === currentNode.f && openList[i].h < currentNode.h)) {
          currentNode = openList[i];
          currentIndex = i;
        }
      }

      // Przenieś z open do closed
      openList.splice(currentIndex, 1);
      closedList.add(currentNode);

      // Sprawdź czy dotarliśmy do celu
      if (currentNode.equals(endNode)) {
        return this.reconstructPath(currentNode);
      }

      // Sprawdź sąsiadów
      const neighbors = this.getNeighbors(currentNode);

      for (const neighbor of neighbors) {
        if (!neighbor.walkable || closedList.has(neighbor)) {
          continue;
        }

        const tentativeG = currentNode.g + this.getMovementCost(currentNode, neighbor);

        if (!openList.includes(neighbor)) {
          openList.push(neighbor);
        } else if (tentativeG >= neighbor.g) {
          continue;
        }

        neighbor.parent = currentNode;
        neighbor.g = tentativeG;
        neighbor.h = this.calculateHeuristic(neighbor, endNode);
        neighbor.calculateF();
      }
    }

    // Nie znaleziono ścieżki
    return [];
  }

  /**
   * Znajduje ścieżkę używając pozycji świata (konwertuje na grid)
   */
  findWorldPath(startWorld: Vector2, endWorld: Vector2): Vector2[] {
    const startGrid = IsometricUtils.screenToGrid(startWorld.x, startWorld.y);
    const endGrid = IsometricUtils.screenToGrid(endWorld.x, endWorld.y);
    
    const gridPath = this.findPath(startGrid.x, startGrid.y, endGrid.x, endGrid.y);
    
    // Konwertuj z powrotem na współrzędne świata
    return gridPath.map(gridPos => 
      IsometricUtils.gridToScreenCenter(gridPos.x, gridPos.y)
    );
  }

  /**
   * Rekonstruuje ścieżkę z węzła końcowego
   */
  private reconstructPath(endNode: AStarNode): Vector2[] {
    const path: Vector2[] = [];
    let currentNode: AStarNode | null = endNode;

    while (currentNode) {
      path.unshift(currentNode.toVector2());
      currentNode = currentNode.parent;
    }

    return path;
  }

  /**
   * Zwraca sąsiadów węzła
   */
  private getNeighbors(node: AStarNode): AStarNode[] {
    const neighbors: AStarNode[] = [];
    
    // Kierunki: góra, prawo, dół, lewo
    const directions = [
      { x: 0, y: -1 }, { x: 1, y: 0 },
      { x: 0, y: 1 }, { x: -1, y: 0 }
    ];

    // Dodaj przekątne jeśli dozwolone
    if (this.config.allowDiagonal) {
      directions.push(
        { x: -1, y: -1 }, { x: 1, y: -1 },
        { x: 1, y: 1 }, { x: -1, y: 1 }
      );
    }

    for (const dir of directions) {
      const newX = node.x + dir.x;
      const newY = node.y + dir.y;

      if (this.isValidPosition(newX, newY)) {
        // Sprawdź cięcie narożników dla przekątnych
        if (this.config.allowDiagonal && Math.abs(dir.x) === 1 && Math.abs(dir.y) === 1) {
          if (!this.isWalkable(node.x + dir.x, node.y) || 
              !this.isWalkable(node.x, node.y + dir.y)) {
            continue; // Nie pozwalaj na cięcie narożników
          }
        }

        neighbors.push(this.grid[newX][newY]);
      }
    }

    return neighbors;
  }

  /**
   * Oblicza koszt ruchu między węzłami
   */
  private getMovementCost(from: AStarNode, to: AStarNode): number {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);

    if (dx === 1 && dy === 1) {
      return this.config.diagonalCost!;
    } else {
      return this.config.straightCost!;
    }
  }

  /**
   * Oblicza heurystykę (oszacowanie odległości do celu)
   */
  private calculateHeuristic(node: AStarNode, target: AStarNode): number {
    const dx = Math.abs(target.x - node.x);
    const dy = Math.abs(target.y - node.y);

    switch (this.config.heuristic) {
      case Heuristic.MANHATTAN:
        return (dx + dy) * this.config.straightCost!;

      case Heuristic.EUCLIDEAN:
        return Math.sqrt(dx * dx + dy * dy) * this.config.straightCost!;

      case Heuristic.DIAGONAL:
        return Math.max(dx, dy) * this.config.diagonalCost! + 
               Math.min(dx, dy) * (this.config.straightCost! - this.config.diagonalCost!);

      default:
        return 0;
    }
  }

  /**
   * Resetuje węzły przed nowym wyszukiwaniem
   */
  private resetNodes(): void {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const node = this.grid[x][y];
        node.g = 0;
        node.h = 0;
        node.f = 0;
        node.parent = null;
      }
    }
  }

  /**
   * Ustawia obszar przeszkód
   */
  setObstacleArea(startX: number, startY: number, endX: number, endY: number, isObstacle: boolean = true): void {
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        this.setObstacle(x, y, isObstacle);
      }
    }
  }

  /**
   * Czyści wszystkie przeszkody
   */
  clearObstacles(): void {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.grid[x][y].walkable = true;
      }
    }
  }

  /**
   * Zwraca kopię mapy przeszkód
   */
  getObstacleMap(): boolean[][] {
    const map: boolean[][] = [];
    for (let x = 0; x < this.width; x++) {
      map[x] = [];
      for (let y = 0; y < this.height; y++) {
        map[x][y] = !this.grid[x][y].walkable;
      }
    }
    return map;
  }

  /**
   * Importuje mapę przeszkód
   */
  setObstacleMap(obstacleMap: boolean[][]): void {
    for (let x = 0; x < Math.min(this.width, obstacleMap.length); x++) {
      for (let y = 0; y < Math.min(this.height, obstacleMap[x].length); y++) {
        this.grid[x][y].walkable = !obstacleMap[x][y];
      }
    }
  }

  /**
   * Sprawdza czy istnieje ścieżka między dwoma punktami (szybkie sprawdzenie)
   */
  hasPath(startX: number, startY: number, endX: number, endY: number): boolean {
    // Implementacja flood fill lub uproszczona wersja A*
    if (!this.isValidPosition(startX, startY) || !this.isValidPosition(endX, endY)) {
      return false;
    }

    if (!this.isWalkable(startX, startY) || !this.isWalkable(endX, endY)) {
      return false;
    }

    if (startX === endX && startY === endY) {
      return true;
    }

    // Uproszczona implementacja - można zoptymalizować
    const path = this.findPath(startX, startY, endX, endY);
    return path.length > 0;
  }
} 