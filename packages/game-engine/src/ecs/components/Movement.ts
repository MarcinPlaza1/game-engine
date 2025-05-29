import { Component, SingletonComponent } from '../Component';
import { Vector2 } from '../../math/Vector2';

/**
 * Komponent Movement - obsługuje ruch i prędkość jednostek
 */
@SingletonComponent
export class Movement extends Component {
  public velocity: Vector2 = new Vector2();
  public acceleration: Vector2 = new Vector2();
  public maxSpeed: number = 100; // pikseli na sekundę
  public friction: number = 0.9; // współczynnik tarcia (0-1)
  public angularVelocity: number = 0; // radianów na sekundę
  public maxAngularSpeed: number = Math.PI * 2; // maksymalny obrót na sekundę
  
  // Pathfinding
  public path: Vector2[] = [];
  public currentPathIndex: number = 0;
  public pathTolerance: number = 5; // odległość w pikselach do uznania za dotarcie do punktu
  public pathSpeed: number = 100; // prędkość poruszania się po ścieżce
  
  // Flags
  public isMoving: boolean = false;
  public followingPath: boolean = false;
  public canRotate: boolean = true;
  public snapToGrid: boolean = false;
  public gridSize: number = 32;

  constructor(maxSpeed: number = 100) {
    super();
    this.maxSpeed = maxSpeed;
    this.pathSpeed = maxSpeed;
  }

  /**
   * Ustawia prędkość
   */
  setVelocity(x: number, y: number): void {
    this.velocity.set(x, y);
    this.isMoving = this.velocity.magnitudeSquared() > 0.01;
  }

  /**
   * Dodaje siłę do przyspieszenia
   */
  addForce(forceX: number, forceY: number): void {
    this.acceleration.x += forceX;
    this.acceleration.y += forceY;
  }

  /**
   * Porusza się w kierunku celu
   */
  moveTowards(target: Vector2, currentPosition: Vector2, deltaTime: number): void {
    const direction = Vector2.subtract(target, currentPosition);
    const distance = direction.magnitude();
    
    if (distance > this.pathTolerance) {
      direction.normalize();
      direction.multiply(this.pathSpeed);
      this.velocity.set(direction.x, direction.y);
      this.isMoving = true;
    } else {
      this.stop();
    }
  }

  /**
   * Zatrzymuje ruch
   */
  stop(): void {
    this.velocity.set(0, 0);
    this.acceleration.set(0, 0);
    this.angularVelocity = 0;
    this.isMoving = false;
  }

  /**
   * Ustawia ścieżkę do podążania
   */
  setPath(path: Vector2[]): void {
    this.path = path.map(p => p.clone());
    this.currentPathIndex = 0;
    this.followingPath = path.length > 0;
  }

  /**
   * Dodaje punkt do ścieżki
   */
  addPathPoint(point: Vector2): void {
    this.path.push(point.clone());
    if (!this.followingPath) {
      this.followingPath = true;
      this.currentPathIndex = 0;
    }
  }

  /**
   * Czyści ścieżkę
   */
  clearPath(): void {
    this.path = [];
    this.currentPathIndex = 0;
    this.followingPath = false;
  }

  /**
   * Sprawdza czy dotarł do bieżącego punktu ścieżki
   */
  hasReachedCurrentPathPoint(currentPosition: Vector2): boolean {
    if (!this.followingPath || this.currentPathIndex >= this.path.length) {
      return false;
    }
    
    const target = this.path[this.currentPathIndex];
    return currentPosition.distanceTo(target) <= this.pathTolerance;
  }

  /**
   * Przechodzi do następnego punktu ścieżki
   */
  advanceToNextPathPoint(): boolean {
    if (!this.followingPath) return false;
    
    this.currentPathIndex++;
    
    if (this.currentPathIndex >= this.path.length) {
      this.followingPath = false;
      this.stop();
      return false;
    }
    
    return true;
  }

  /**
   * Zwraca bieżący cel ścieżki
   */
  getCurrentPathTarget(): Vector2 | null {
    if (!this.followingPath || this.currentPathIndex >= this.path.length) {
      return null;
    }
    
    return this.path[this.currentPathIndex];
  }

  /**
   * Obraca się w kierunku celu
   */
  rotateTowards(target: Vector2, currentPosition: Vector2, currentRotation: number, deltaTime: number): number {
    if (!this.canRotate) return currentRotation;
    
    const direction = Vector2.subtract(target, currentPosition);
    const targetAngle = Math.atan2(direction.y, direction.x);
    
    let angleDiff = targetAngle - currentRotation;
    
    // Normalizacja kąta do zakresu -PI do PI
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    
    const rotationSpeed = this.maxAngularSpeed * deltaTime / 1000;
    
    if (Math.abs(angleDiff) <= rotationSpeed) {
      return targetAngle;
    } else {
      return currentRotation + Math.sign(angleDiff) * rotationSpeed;
    }
  }

  /**
   * Aplikuje tarcie do prędkości
   */
  applyFriction(): void {
    this.velocity.multiply(this.friction);
    
    // Zatrzymaj jeśli prędkość jest bardzo mała
    if (this.velocity.magnitudeSquared() < 0.01) {
      this.velocity.set(0, 0);
      this.isMoving = false;
    }
  }

  /**
   * Ogranicza prędkość do maksymalnej
   */
  limitSpeed(): void {
    const speed = this.velocity.magnitude();
    if (speed > this.maxSpeed) {
      this.velocity.normalize();
      this.velocity.multiply(this.maxSpeed);
    }
  }

  /**
   * Przyciąga pozycję do siatki
   */
  snapPositionToGrid(position: Vector2): Vector2 {
    if (!this.snapToGrid) return position;
    
    return new Vector2(
      Math.round(position.x / this.gridSize) * this.gridSize,
      Math.round(position.y / this.gridSize) * this.gridSize
    );
  }

  /**
   * Sprawdza czy jednostka się porusza
   */
  isCurrentlyMoving(): boolean {
    return this.isMoving || this.followingPath;
  }

  /**
   * Zwraca pozostałą odległość do końca ścieżki
   */
  getRemainingPathDistance(currentPosition: Vector2): number {
    if (!this.followingPath || this.path.length === 0) return 0;
    
    let totalDistance = 0;
    let fromPos = currentPosition;
    
    for (let i = this.currentPathIndex; i < this.path.length; i++) {
      totalDistance += fromPos.distanceTo(this.path[i]);
      fromPos = this.path[i];
    }
    
    return totalDistance;
  }

  /**
   * Klonuje komponent
   */
  clone(): Movement {
    const cloned = new Movement(this.maxSpeed);
    cloned.velocity = this.velocity.clone();
    cloned.acceleration = this.acceleration.clone();
    cloned.friction = this.friction;
    cloned.angularVelocity = this.angularVelocity;
    cloned.maxAngularSpeed = this.maxAngularSpeed;
    cloned.path = this.path.map(p => p.clone());
    cloned.currentPathIndex = this.currentPathIndex;
    cloned.pathTolerance = this.pathTolerance;
    cloned.pathSpeed = this.pathSpeed;
    cloned.isMoving = this.isMoving;
    cloned.followingPath = this.followingPath;
    cloned.canRotate = this.canRotate;
    cloned.snapToGrid = this.snapToGrid;
    cloned.gridSize = this.gridSize;
    return cloned;
  }

  /**
   * Serializuje komponent
   */
  serialize(): any {
    return {
      velocity: { x: this.velocity.x, y: this.velocity.y },
      acceleration: { x: this.acceleration.x, y: this.acceleration.y },
      maxSpeed: this.maxSpeed,
      friction: this.friction,
      angularVelocity: this.angularVelocity,
      maxAngularSpeed: this.maxAngularSpeed,
      path: this.path.map(p => ({ x: p.x, y: p.y })),
      currentPathIndex: this.currentPathIndex,
      pathTolerance: this.pathTolerance,
      pathSpeed: this.pathSpeed,
      isMoving: this.isMoving,
      followingPath: this.followingPath,
      canRotate: this.canRotate,
      snapToGrid: this.snapToGrid,
      gridSize: this.gridSize
    };
  }

  /**
   * Deserializuje komponent
   */
  deserialize(data: any): void {
    if (data.velocity) {
      this.velocity.set(data.velocity.x, data.velocity.y);
    }
    if (data.acceleration) {
      this.acceleration.set(data.acceleration.x, data.acceleration.y);
    }
    this.maxSpeed = data.maxSpeed ?? 100;
    this.friction = data.friction ?? 0.9;
    this.angularVelocity = data.angularVelocity ?? 0;
    this.maxAngularSpeed = data.maxAngularSpeed ?? Math.PI * 2;
    this.path = data.path ? data.path.map((p: any) => new Vector2(p.x, p.y)) : [];
    this.currentPathIndex = data.currentPathIndex ?? 0;
    this.pathTolerance = data.pathTolerance ?? 5;
    this.pathSpeed = data.pathSpeed ?? 100;
    this.isMoving = data.isMoving ?? false;
    this.followingPath = data.followingPath ?? false;
    this.canRotate = data.canRotate ?? true;
    this.snapToGrid = data.snapToGrid ?? false;
    this.gridSize = data.gridSize ?? 32;
  }
} 