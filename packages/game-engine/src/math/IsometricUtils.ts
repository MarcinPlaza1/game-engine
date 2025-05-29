import { Vector2 } from './Vector2';

/**
 * Narzędzia do obsługi izometrycznej siatki dla gier RTS
 */
export class IsometricUtils {
  /**
   * Szerokość kafelka w pikselach
   */
  public static readonly TILE_WIDTH = 64;
  
  /**
   * Wysokość kafelka w pikselach
   */
  public static readonly TILE_HEIGHT = 32;

  /**
   * Połowa szerokości kafelka
   */
  public static readonly HALF_TILE_WIDTH = IsometricUtils.TILE_WIDTH / 2;

  /**
   * Połowa wysokości kafelka
   */
  public static readonly HALF_TILE_HEIGHT = IsometricUtils.TILE_HEIGHT / 2;

  /**
   * Konwertuje współrzędne świata (kartezjańskie) na izometryczne ekranowe
   * @param worldX - współrzędna X w świecie
   * @param worldY - współrzędna Y w świecie
   * @returns pozycja na ekranie w pikselach
   */
  public static worldToScreen(worldX: number, worldY: number): Vector2 {
    const screenX = (worldX - worldY) * IsometricUtils.HALF_TILE_WIDTH;
    const screenY = (worldX + worldY) * IsometricUtils.HALF_TILE_HEIGHT;
    return new Vector2(screenX, screenY);
  }

  /**
   * Konwertuje pozycję ekranową na współrzędne świata
   * @param screenX - pozycja X na ekranie
   * @param screenY - pozycja Y na ekranie
   * @returns współrzędne w świecie
   */
  public static screenToWorld(screenX: number, screenY: number): Vector2 {
    const worldX = (screenX / IsometricUtils.HALF_TILE_WIDTH + screenY / IsometricUtils.HALF_TILE_HEIGHT) / 2;
    const worldY = (screenY / IsometricUtils.HALF_TILE_HEIGHT - screenX / IsometricUtils.HALF_TILE_WIDTH) / 2;
    return new Vector2(Math.floor(worldX), Math.floor(worldY));
  }

  /**
   * Konwertuje współrzędne siatki na pozycję centralną kafelka na ekranie
   * @param gridX - pozycja X w siatce
   * @param gridY - pozycja Y w siatce
   * @returns pozycja środka kafelka na ekranie
   */
  public static gridToScreenCenter(gridX: number, gridY: number): Vector2 {
    return IsometricUtils.worldToScreen(gridX + 0.5, gridY + 0.5);
  }

  /**
   * Konwertuje pozycję ekranową na współrzędne siatki
   * @param screenX - pozycja X na ekranie
   * @param screenY - pozycja Y na ekranie
   * @returns współrzędne w siatce
   */
  public static screenToGrid(screenX: number, screenY: number): Vector2 {
    const world = IsometricUtils.screenToWorld(screenX, screenY);
    return new Vector2(Math.floor(world.x), Math.floor(world.y));
  }

  /**
   * Sprawdza czy dane współrzędne siatki są w granicach mapy
   * @param gridX - pozycja X w siatce
   * @param gridY - pozycja Y w siatce
   * @param mapWidth - szerokość mapy
   * @param mapHeight - wysokość mapy
   * @returns true jeśli współrzędne są w granicach
   */
  public static isValidGridPosition(gridX: number, gridY: number, mapWidth: number, mapHeight: number): boolean {
    return gridX >= 0 && gridX < mapWidth && gridY >= 0 && gridY < mapHeight;
  }

  /**
   * Oblicza odległość w kafelkach między dwoma punktami siatki
   * @param x1 - pozycja X pierwszego punktu
   * @param y1 - pozycja Y pierwszego punktu
   * @param x2 - pozycja X drugiego punktu
   * @param y2 - pozycja Y drugiego punktu
   * @returns odległość w kafelkach
   */
  public static gridDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  /**
   * Oblicza odległość Manhattan między dwoma punktami siatki
   * @param x1 - pozycja X pierwszego punktu
   * @param y1 - pozycja Y pierwszego punktu
   * @param x2 - pozycja X drugiego punktu
   * @param y2 - pozycja Y drugiego punktu
   * @returns odległość Manhattan
   */
  public static manhattanDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x2 - x1) + Math.abs(y2 - y1);
  }

  /**
   * Zwraca sąsiednie kafelki dla danej pozycji
   * @param gridX - pozycja X w siatce
   * @param gridY - pozycja Y w siatce
   * @param includeDiagonals - czy uwzględnić przekątne
   * @returns lista sąsiadujących pozycji
   */
  public static getNeighbors(gridX: number, gridY: number, includeDiagonals: boolean = false): Vector2[] {
    const neighbors: Vector2[] = [
      new Vector2(gridX, gridY - 1), // góra
      new Vector2(gridX + 1, gridY), // prawo
      new Vector2(gridX, gridY + 1), // dół
      new Vector2(gridX - 1, gridY)  // lewo
    ];

    if (includeDiagonals) {
      neighbors.push(
        new Vector2(gridX - 1, gridY - 1), // lewo-góra
        new Vector2(gridX + 1, gridY - 1), // prawo-góra
        new Vector2(gridX + 1, gridY + 1), // prawo-dół
        new Vector2(gridX - 1, gridY + 1)  // lewo-dół
      );
    }

    return neighbors;
  }

  /**
   * Konwertuje kąt świata na kąt izometryczny
   * @param worldAngle - kąt w radianach w współrzędnych świata
   * @returns kąt w izometrycznych współrzędnych ekranu
   */
  public static worldAngleToIso(worldAngle: number): number {
    // Przekształcenie kąta z kartezjańskiego na izometryczny
    return Math.atan2(
      Math.sin(worldAngle) - Math.cos(worldAngle),
      Math.sin(worldAngle) + Math.cos(worldAngle)
    );
  }

  /**
   * Sortuje obiekty według głębokości izometrycznej (z-order)
   * @param objects - obiekty do posortowania (muszą mieć pozycję grid)
   * @returns posortowane obiekty
   */
  public static sortByDepth<T extends { gridX: number; gridY: number }>(objects: T[]): T[] {
    return objects.sort((a, b) => {
      // Sortowanie według sumy współrzędnych (depth sorting dla izometrii)
      const depthA = a.gridX + a.gridY;
      const depthB = b.gridX + b.gridY;
      return depthA - depthB;
    });
  }

  /**
   * Sprawdza czy prostokąt na siatce zawiera punkt
   * @param rectX - pozycja X prostokąta
   * @param rectY - pozycja Y prostokąta
   * @param rectWidth - szerokość prostokąta
   * @param rectHeight - wysokość prostokąta
   * @param pointX - pozycja X punktu
   * @param pointY - pozycja Y punktu
   * @returns true jeśli punkt jest w prostokącie
   */
  public static isPointInGridRect(
    rectX: number, rectY: number, rectWidth: number, rectHeight: number,
    pointX: number, pointY: number
  ): boolean {
    return pointX >= rectX && pointX < rectX + rectWidth &&
           pointY >= rectY && pointY < rectY + rectHeight;
  }
} 