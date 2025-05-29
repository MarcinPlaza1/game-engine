"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovementSystem = void 0;
const System_1 = require("../System");
const Transform_1 = require("../components/Transform");
const Movement_1 = require("../components/Movement");
const Vector2_1 = require("../../math/Vector2");
/**
 * System ruchu dla ECS - obsługuje przemieszczanie i pathfinding
 */
class MovementSystem extends System_1.System {
    constructor(world) {
        super(world);
        this.priority = 50; // Średni priorytet
    }
    getRequiredComponents() {
        return [Transform_1.Transform, Movement_1.Movement];
    }
    update(deltaTime) {
        if (!this.enabled)
            return;
        const dt = deltaTime / 1000; // konwersja na sekundy
        for (const entity of this.entities) {
            const transform = entity.getComponent(Transform_1.Transform);
            const movement = entity.getComponent(Movement_1.Movement);
            if (!entity.active)
                continue;
            // Obsługa pathfinding
            if (movement.followingPath) {
                this.updatePathfinding(transform, movement, dt);
            }
            // Aplikuj przyspieszenie do prędkości
            if (movement.acceleration.magnitudeSquared() > 0) {
                movement.velocity.add(Vector2_1.Vector2.multiply(movement.acceleration, dt));
                movement.limitSpeed();
                // Reset przyspieszenia po aplikacji
                movement.acceleration.set(0, 0);
            }
            // Aplikuj tarcie
            if (movement.friction < 1.0) {
                movement.applyFriction();
            }
            // Aplikuj prędkość do pozycji
            if (movement.velocity.magnitudeSquared() > 0) {
                const deltaPos = Vector2_1.Vector2.multiply(movement.velocity, dt);
                transform.translate(deltaPos.x, deltaPos.y);
                // Snap to grid jeśli włączone
                if (movement.snapToGrid) {
                    const snappedPos = movement.snapPositionToGrid(transform.position);
                    transform.setPosition(snappedPos.x, snappedPos.y);
                }
            }
            // Obsługa rotacji
            if (movement.angularVelocity !== 0) {
                const deltaRotation = movement.angularVelocity * dt;
                transform.rotate(deltaRotation);
            }
            // Auto-rotacja w kierunku ruchu
            if (movement.canRotate && movement.isMoving && movement.velocity.magnitudeSquared() > 0.01) {
                const targetRotation = Math.atan2(movement.velocity.y, movement.velocity.x);
                const newRotation = movement.rotateTowards(Vector2_1.Vector2.add(transform.position, movement.velocity), transform.position, transform.rotation, deltaTime);
                transform.setRotation(newRotation);
            }
        }
    }
    updatePathfinding(transform, movement, deltaTime) {
        const currentTarget = movement.getCurrentPathTarget();
        if (!currentTarget) {
            movement.followingPath = false;
            movement.stop();
            return;
        }
        // Sprawdź czy dotarł do bieżącego punktu
        if (movement.hasReachedCurrentPathPoint(transform.position)) {
            // Przejdź do następnego punktu
            if (!movement.advanceToNextPathPoint()) {
                // Koniec ścieżki
                return;
            }
            // Pobierz nowy cel
            const newTarget = movement.getCurrentPathTarget();
            if (!newTarget) {
                movement.followingPath = false;
                movement.stop();
                return;
            }
        }
        // Ruch w kierunku bieżącego celu
        const target = movement.getCurrentPathTarget();
        movement.moveTowards(target, transform.position, deltaTime * 1000);
    }
    /**
     * Ustawia cel ruchu dla entity
     */
    moveEntityTo(entityId, target) {
        const entity = this.world.getEntity(entityId);
        if (!entity)
            return;
        const movement = entity.getComponent(Movement_1.Movement);
        if (!movement)
            return;
        // Prosty ruch bez pathfinding
        movement.clearPath();
        movement.addPathPoint(target);
    }
    /**
     * Ustawia ścieżkę dla entity
     */
    setEntityPath(entityId, path) {
        const entity = this.world.getEntity(entityId);
        if (!entity)
            return;
        const movement = entity.getComponent(Movement_1.Movement);
        if (!movement)
            return;
        movement.setPath(path);
    }
    /**
     * Zatrzymuje ruch entity
     */
    stopEntity(entityId) {
        const entity = this.world.getEntity(entityId);
        if (!entity)
            return;
        const movement = entity.getComponent(Movement_1.Movement);
        if (!movement)
            return;
        movement.stop();
        movement.clearPath();
    }
    /**
     * Dodaje siłę do entity
     */
    addForceToEntity(entityId, force) {
        const entity = this.world.getEntity(entityId);
        if (!entity)
            return;
        const movement = entity.getComponent(Movement_1.Movement);
        if (!movement)
            return;
        movement.addForce(force.x, force.y);
    }
    /**
     * Ustawia prędkość entity
     */
    setEntityVelocity(entityId, velocity) {
        const entity = this.world.getEntity(entityId);
        if (!entity)
            return;
        const movement = entity.getComponent(Movement_1.Movement);
        if (!movement)
            return;
        movement.setVelocity(velocity.x, velocity.y);
    }
    /**
     * Zwraca entities które się poruszają
     */
    getMovingEntities() {
        return this.entities.filter(entity => {
            const movement = entity.getComponent(Movement_1.Movement);
            return movement.isCurrentlyMoving();
        });
    }
    /**
     * Zwraca entities podążające ścieżką
     */
    getEntitiesFollowingPath() {
        return this.entities.filter(entity => {
            const movement = entity.getComponent(Movement_1.Movement);
            return movement.followingPath;
        });
    }
    /**
     * Zwraca statystyki systemu ruchu
     */
    getMovementStats() {
        const movingEntities = this.getMovingEntities();
        const entitiesWithPath = this.getEntitiesFollowingPath();
        let totalSpeed = 0;
        let speedCount = 0;
        for (const entity of this.entities) {
            const movement = entity.getComponent(Movement_1.Movement);
            if (movement.isCurrentlyMoving()) {
                totalSpeed += movement.velocity.magnitude();
                speedCount++;
            }
        }
        return {
            totalEntities: this.entities.length,
            movingEntities: movingEntities.length,
            entitiesWithPath: entitiesWithPath.length,
            averageSpeed: speedCount > 0 ? totalSpeed / speedCount : 0
        };
    }
}
exports.MovementSystem = MovementSystem;
//# sourceMappingURL=MovementSystem.js.map