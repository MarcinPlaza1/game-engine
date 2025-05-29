import { System } from '../System';
import { Component } from '../Component';
import { Vector2 } from '../../math/Vector2';
/**
 * System ruchu dla ECS - obsługuje przemieszczanie i pathfinding
 */
export declare class MovementSystem extends System {
    constructor(world: any);
    getRequiredComponents(): Array<new () => Component>;
    update(deltaTime: number): void;
    private updatePathfinding;
    /**
     * Ustawia cel ruchu dla entity
     */
    moveEntityTo(entityId: number, target: Vector2): void;
    /**
     * Ustawia ścieżkę dla entity
     */
    setEntityPath(entityId: number, path: Vector2[]): void;
    /**
     * Zatrzymuje ruch entity
     */
    stopEntity(entityId: number): void;
    /**
     * Dodaje siłę do entity
     */
    addForceToEntity(entityId: number, force: Vector2): void;
    /**
     * Ustawia prędkość entity
     */
    setEntityVelocity(entityId: number, velocity: Vector2): void;
    /**
     * Zwraca entities które się poruszają
     */
    getMovingEntities(): any[];
    /**
     * Zwraca entities podążające ścieżką
     */
    getEntitiesFollowingPath(): any[];
    /**
     * Zwraca statystyki systemu ruchu
     */
    getMovementStats(): {
        totalEntities: number;
        movingEntities: number;
        entitiesWithPath: number;
        averageSpeed: number;
    };
}
//# sourceMappingURL=MovementSystem.d.ts.map