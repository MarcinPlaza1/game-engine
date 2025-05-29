"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var Movement_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Movement = void 0;
const Component_1 = require("../Component");
const Vector2_1 = require("../../math/Vector2");
/**
 * Komponent Movement - obsługuje ruch i prędkość jednostek
 */
let Movement = Movement_1 = class Movement extends Component_1.Component {
    constructor(maxSpeed = 100) {
        super();
        this.velocity = new Vector2_1.Vector2();
        this.acceleration = new Vector2_1.Vector2();
        this.maxSpeed = 100; // pikseli na sekundę
        this.friction = 0.9; // współczynnik tarcia (0-1)
        this.angularVelocity = 0; // radianów na sekundę
        this.maxAngularSpeed = Math.PI * 2; // maksymalny obrót na sekundę
        // Pathfinding
        this.path = [];
        this.currentPathIndex = 0;
        this.pathTolerance = 5; // odległość w pikselach do uznania za dotarcie do punktu
        this.pathSpeed = 100; // prędkość poruszania się po ścieżce
        // Flags
        this.isMoving = false;
        this.followingPath = false;
        this.canRotate = true;
        this.snapToGrid = false;
        this.gridSize = 32;
        this.maxSpeed = maxSpeed;
        this.pathSpeed = maxSpeed;
    }
    /**
     * Ustawia prędkość
     */
    setVelocity(x, y) {
        this.velocity.set(x, y);
        this.isMoving = this.velocity.magnitudeSquared() > 0.01;
    }
    /**
     * Dodaje siłę do przyspieszenia
     */
    addForce(forceX, forceY) {
        this.acceleration.x += forceX;
        this.acceleration.y += forceY;
    }
    /**
     * Porusza się w kierunku celu
     */
    moveTowards(target, currentPosition, deltaTime) {
        const direction = Vector2_1.Vector2.subtract(target, currentPosition);
        const distance = direction.magnitude();
        if (distance > this.pathTolerance) {
            direction.normalize();
            direction.multiply(this.pathSpeed);
            this.velocity.set(direction.x, direction.y);
            this.isMoving = true;
        }
        else {
            this.stop();
        }
    }
    /**
     * Zatrzymuje ruch
     */
    stop() {
        this.velocity.set(0, 0);
        this.acceleration.set(0, 0);
        this.angularVelocity = 0;
        this.isMoving = false;
    }
    /**
     * Ustawia ścieżkę do podążania
     */
    setPath(path) {
        this.path = path.map(p => p.clone());
        this.currentPathIndex = 0;
        this.followingPath = path.length > 0;
    }
    /**
     * Dodaje punkt do ścieżki
     */
    addPathPoint(point) {
        this.path.push(point.clone());
        if (!this.followingPath) {
            this.followingPath = true;
            this.currentPathIndex = 0;
        }
    }
    /**
     * Czyści ścieżkę
     */
    clearPath() {
        this.path = [];
        this.currentPathIndex = 0;
        this.followingPath = false;
    }
    /**
     * Sprawdza czy dotarł do bieżącego punktu ścieżki
     */
    hasReachedCurrentPathPoint(currentPosition) {
        if (!this.followingPath || this.currentPathIndex >= this.path.length) {
            return false;
        }
        const target = this.path[this.currentPathIndex];
        return currentPosition.distanceTo(target) <= this.pathTolerance;
    }
    /**
     * Przechodzi do następnego punktu ścieżki
     */
    advanceToNextPathPoint() {
        if (!this.followingPath)
            return false;
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
    getCurrentPathTarget() {
        if (!this.followingPath || this.currentPathIndex >= this.path.length) {
            return null;
        }
        return this.path[this.currentPathIndex];
    }
    /**
     * Obraca się w kierunku celu
     */
    rotateTowards(target, currentPosition, currentRotation, deltaTime) {
        if (!this.canRotate)
            return currentRotation;
        const direction = Vector2_1.Vector2.subtract(target, currentPosition);
        const targetAngle = Math.atan2(direction.y, direction.x);
        let angleDiff = targetAngle - currentRotation;
        // Normalizacja kąta do zakresu -PI do PI
        while (angleDiff > Math.PI)
            angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI)
            angleDiff += Math.PI * 2;
        const rotationSpeed = this.maxAngularSpeed * deltaTime / 1000;
        if (Math.abs(angleDiff) <= rotationSpeed) {
            return targetAngle;
        }
        else {
            return currentRotation + Math.sign(angleDiff) * rotationSpeed;
        }
    }
    /**
     * Aplikuje tarcie do prędkości
     */
    applyFriction() {
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
    limitSpeed() {
        const speed = this.velocity.magnitude();
        if (speed > this.maxSpeed) {
            this.velocity.normalize();
            this.velocity.multiply(this.maxSpeed);
        }
    }
    /**
     * Przyciąga pozycję do siatki
     */
    snapPositionToGrid(position) {
        if (!this.snapToGrid)
            return position;
        return new Vector2_1.Vector2(Math.round(position.x / this.gridSize) * this.gridSize, Math.round(position.y / this.gridSize) * this.gridSize);
    }
    /**
     * Sprawdza czy jednostka się porusza
     */
    isCurrentlyMoving() {
        return this.isMoving || this.followingPath;
    }
    /**
     * Zwraca pozostałą odległość do końca ścieżki
     */
    getRemainingPathDistance(currentPosition) {
        if (!this.followingPath || this.path.length === 0)
            return 0;
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
    clone() {
        const cloned = new Movement_1(this.maxSpeed);
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
    serialize() {
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
    deserialize(data) {
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
        this.path = data.path ? data.path.map((p) => new Vector2_1.Vector2(p.x, p.y)) : [];
        this.currentPathIndex = data.currentPathIndex ?? 0;
        this.pathTolerance = data.pathTolerance ?? 5;
        this.pathSpeed = data.pathSpeed ?? 100;
        this.isMoving = data.isMoving ?? false;
        this.followingPath = data.followingPath ?? false;
        this.canRotate = data.canRotate ?? true;
        this.snapToGrid = data.snapToGrid ?? false;
        this.gridSize = data.gridSize ?? 32;
    }
};
exports.Movement = Movement;
exports.Movement = Movement = Movement_1 = __decorate([
    Component_1.SingletonComponent,
    __metadata("design:paramtypes", [Number])
], Movement);
//# sourceMappingURL=Movement.js.map