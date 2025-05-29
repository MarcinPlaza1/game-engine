import { Vector2 } from './Vector2';
/**
 * Narzędzia do obsługi izometrycznej siatki dla gier RTS
 */
export declare class IsometricUtils {
    /**
     * Szerokość kafelka w pikselach
     */
    static readonly TILE_WIDTH = 64;
    /**
     * Wysokość kafelka w pikselach
     */
    static readonly TILE_HEIGHT = 32;
    /**
     * Połowa szerokości kafelka
     */
    static readonly HALF_TILE_WIDTH: number;
    /**
     * Połowa wysokości kafelka
     */
    static readonly HALF_TILE_HEIGHT: number;
    /**
     * Konwertuje współrzędne świata (kartezjańskie) na izometryczne ekranowe
     * @param worldX - współrzędna X w świecie
     * @param worldY - współrzędna Y w świecie
     * @returns pozycja na ekranie w pikselach
     */
    static worldToScreen(worldX: number, worldY: number): Vector2;
    /**
     * Konwertuje pozycję ekranową na współrzędne świata
     * @param screenX - pozycja X na ekranie
     * @param screenY - pozycja Y na ekranie
     * @returns współrzędne w świecie
     */
    static screenToWorld(screenX: number, screenY: number): Vector2;
    /**
     * Konwertuje współrzędne siatki na pozycję centralną kafelka na ekranie
     * @param gridX - pozycja X w siatce
     * @param gridY - pozycja Y w siatce
     * @returns pozycja środka kafelka na ekranie
     */
    static gridToScreenCenter(gridX: number, gridY: number): Vector2;
    /**
     * Konwertuje pozycję ekranową na współrzędne siatki
     * @param screenX - pozycja X na ekranie
     * @param screenY - pozycja Y na ekranie
     * @returns współrzędne w siatce
     */
    static screenToGrid(screenX: number, screenY: number): Vector2;
    /**
     * Sprawdza czy dane współrzędne siatki są w granicach mapy
     * @param gridX - pozycja X w siatce
     * @param gridY - pozycja Y w siatce
     * @param mapWidth - szerokość mapy
     * @param mapHeight - wysokość mapy
     * @returns true jeśli współrzędne są w granicach
     */
    static isValidGridPosition(gridX: number, gridY: number, mapWidth: number, mapHeight: number): boolean;
    /**
     * Oblicza odległość w kafelkach między dwoma punktami siatki
     * @param x1 - pozycja X pierwszego punktu
     * @param y1 - pozycja Y pierwszego punktu
     * @param x2 - pozycja X drugiego punktu
     * @param y2 - pozycja Y drugiego punktu
     * @returns odległość w kafelkach
     */
    static gridDistance(x1: number, y1: number, x2: number, y2: number): number;
    /**
     * Oblicza odległość Manhattan między dwoma punktami siatki
     * @param x1 - pozycja X pierwszego punktu
     * @param y1 - pozycja Y pierwszego punktu
     * @param x2 - pozycja X drugiego punktu
     * @param y2 - pozycja Y drugiego punktu
     * @returns odległość Manhattan
     */
    static manhattanDistance(x1: number, y1: number, x2: number, y2: number): number;
    /**
     * Zwraca sąsiednie kafelki dla danej pozycji
     * @param gridX - pozycja X w siatce
     * @param gridY - pozycja Y w siatce
     * @param includeDiagonals - czy uwzględnić przekątne
     * @returns lista sąsiadujących pozycji
     */
    static getNeighbors(gridX: number, gridY: number, includeDiagonals?: boolean): Vector2[];
    /**
     * Konwertuje kąt świata na kąt izometryczny
     * @param worldAngle - kąt w radianach w współrzędnych świata
     * @returns kąt w izometrycznych współrzędnych ekranu
     */
    static worldAngleToIso(worldAngle: number): number;
    /**
     * Sortuje obiekty według głębokości izometrycznej (z-order)
     * @param objects - obiekty do posortowania (muszą mieć pozycję grid)
     * @returns posortowane obiekty
     */
    static sortByDepth<T extends {
        gridX: number;
        gridY: number;
    }>(objects: T[]): T[];
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
    static isPointInGridRect(rectX: number, rectY: number, rectWidth: number, rectHeight: number, pointX: number, pointY: number): boolean;
}
//# sourceMappingURL=IsometricUtils.d.ts.map