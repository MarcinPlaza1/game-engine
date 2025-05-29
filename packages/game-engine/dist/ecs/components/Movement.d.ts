import { Component } from '../Component';
import { Vector2 } from '../../math/Vector2';
/**
 * Komponent Movement - obsługuje ruch i prędkość jednostek
 */
export declare class Movement extends Component {
    velocity: Vector2;
    acceleration: Vector2;
    maxSpeed: number;
    friction: number;
    angularVelocity: number;
    maxAngularSpeed: number;
    path: Vector2[];
    currentPathIndex: number;
    pathTolerance: number;
    pathSpeed: number;
    isMoving: boolean;
    followingPath: boolean;
    canRotate: boolean;
    snapToGrid: boolean;
    gridSize: number;
    constructor(maxSpeed?: number);
    /**
     * Ustawia prędkość
     */
    setVelocity(x: number, y: number): void;
    /**
     * Dodaje siłę do przyspieszenia
     */
    addForce(forceX: number, forceY: number): void;
    /**
     * Porusza się w kierunku celu
     */
    moveTowards(target: Vector2, currentPosition: Vector2, deltaTime: number): void;
    /**
     * Zatrzymuje ruch
     */
    stop(): void;
    /**
     * Ustawia ścieżkę do podążania
     */
    setPath(path: Vector2[]): void;
    /**
     * Dodaje punkt do ścieżki
     */
    addPathPoint(point: Vector2): void;
    /**
     * Czyści ścieżkę
     */
    clearPath(): void;
    /**
     * Sprawdza czy dotarł do bieżącego punktu ścieżki
     */
    hasReachedCurrentPathPoint(currentPosition: Vector2): boolean;
    /**
     * Przechodzi do następnego punktu ścieżki
     */
    advanceToNextPathPoint(): boolean;
    /**
     * Zwraca bieżący cel ścieżki
     */
    getCurrentPathTarget(): Vector2 | null;
    /**
     * Obraca się w kierunku celu
     */
    rotateTowards(target: Vector2, currentPosition: Vector2, currentRotation: number, deltaTime: number): number;
    /**
     * Aplikuje tarcie do prędkości
     */
    applyFriction(): void;
    /**
     * Ogranicza prędkość do maksymalnej
     */
    limitSpeed(): void;
    /**
     * Przyciąga pozycję do siatki
     */
    snapPositionToGrid(position: Vector2): Vector2;
    /**
     * Sprawdza czy jednostka się porusza
     */
    isCurrentlyMoving(): boolean;
    /**
     * Zwraca pozostałą odległość do końca ścieżki
     */
    getRemainingPathDistance(currentPosition: Vector2): number;
    /**
     * Klonuje komponent
     */
    clone(): Movement;
    /**
     * Serializuje komponent
     */
    serialize(): any;
    /**
     * Deserializuje komponent
     */
    deserialize(data: any): void;
}
//# sourceMappingURL=Movement.d.ts.map