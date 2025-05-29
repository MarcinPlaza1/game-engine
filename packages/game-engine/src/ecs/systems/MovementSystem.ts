import { System } from '../System';
import { Component } from '../Component';
import { Transform } from '../components/Transform';
import { Movement } from '../components/Movement';
import { Vector2 } from '../../math/Vector2';

/**
 * System ruchu dla ECS - obsługuje przemieszczanie i pathfinding
 */
export class MovementSystem extends System {
  constructor(world: any) {
    super(world);
    this.priority = 50; // Średni priorytet
  }

  getRequiredComponents(): Array<new () => Component> {
    return [Transform, Movement];
  }

  update(deltaTime: number): void {
    if (!this.enabled) return;

    const dt = deltaTime / 1000; // konwersja na sekundy

    for (const entity of this.entities) {
      const transform = entity.getComponent(Transform)!;
      const movement = entity.getComponent(Movement)!;

      if (!entity.active) continue;

      // Obsługa pathfinding
      if (movement.followingPath) {
        this.updatePathfinding(transform, movement, dt);
      }

      // Aplikuj przyspieszenie do prędkości
      if (movement.acceleration.magnitudeSquared() > 0) {
        movement.velocity.add(Vector2.multiply(movement.acceleration, dt));
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
        const deltaPos = Vector2.multiply(movement.velocity, dt);
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
        const newRotation = movement.rotateTowards(
          Vector2.add(transform.position, movement.velocity),
          transform.position,
          transform.rotation,
          deltaTime
        );
        transform.setRotation(newRotation);
      }
    }
  }

  private updatePathfinding(transform: Transform, movement: Movement, deltaTime: number): void {
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
    const target = movement.getCurrentPathTarget()!;
    movement.moveTowards(target, transform.position, deltaTime * 1000);
  }

  /**
   * Ustawia cel ruchu dla entity
   */
  moveEntityTo(entityId: number, target: Vector2): void {
    const entity = this.world.getEntity(entityId);
    if (!entity) return;

    const movement = entity.getComponent(Movement);
    if (!movement) return;

    // Prosty ruch bez pathfinding
    movement.clearPath();
    movement.addPathPoint(target);
  }

  /**
   * Ustawia ścieżkę dla entity
   */
  setEntityPath(entityId: number, path: Vector2[]): void {
    const entity = this.world.getEntity(entityId);
    if (!entity) return;

    const movement = entity.getComponent(Movement);
    if (!movement) return;

    movement.setPath(path);
  }

  /**
   * Zatrzymuje ruch entity
   */
  stopEntity(entityId: number): void {
    const entity = this.world.getEntity(entityId);
    if (!entity) return;

    const movement = entity.getComponent(Movement);
    if (!movement) return;

    movement.stop();
    movement.clearPath();
  }

  /**
   * Dodaje siłę do entity
   */
  addForceToEntity(entityId: number, force: Vector2): void {
    const entity = this.world.getEntity(entityId);
    if (!entity) return;

    const movement = entity.getComponent(Movement);
    if (!movement) return;

    movement.addForce(force.x, force.y);
  }

  /**
   * Ustawia prędkość entity
   */
  setEntityVelocity(entityId: number, velocity: Vector2): void {
    const entity = this.world.getEntity(entityId);
    if (!entity) return;

    const movement = entity.getComponent(Movement);
    if (!movement) return;

    movement.setVelocity(velocity.x, velocity.y);
  }

  /**
   * Zwraca entities które się poruszają
   */
  getMovingEntities(): any[] {
    return this.entities.filter(entity => {
      const movement = entity.getComponent(Movement)!;
      return movement.isCurrentlyMoving();
    });
  }

  /**
   * Zwraca entities podążające ścieżką
   */
  getEntitiesFollowingPath(): any[] {
    return this.entities.filter(entity => {
      const movement = entity.getComponent(Movement)!;
      return movement.followingPath;
    });
  }

  /**
   * Zwraca statystyki systemu ruchu
   */
  getMovementStats(): {
    totalEntities: number;
    movingEntities: number;
    entitiesWithPath: number;
    averageSpeed: number;
  } {
    const movingEntities = this.getMovingEntities();
    const entitiesWithPath = this.getEntitiesFollowingPath();
    
    let totalSpeed = 0;
    let speedCount = 0;
    
    for (const entity of this.entities) {
      const movement = entity.getComponent(Movement)!;
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