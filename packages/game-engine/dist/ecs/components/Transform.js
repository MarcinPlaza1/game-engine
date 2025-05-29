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
var Transform_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transform = void 0;
const Component_1 = require("../Component");
const Vector2_1 = require("../../math/Vector2");
/**
 * Komponent Transform - przechowuje informacje o pozycji, rotacji i skali
 */
let Transform = Transform_1 = class Transform extends Component_1.Component {
    constructor(x = 0, y = 0, rotation = 0, scaleX = 1, scaleY = 1) {
        super();
        this.position = new Vector2_1.Vector2();
        this.rotation = 0; // w radianach
        this.scale = new Vector2_1.Vector2(1, 1);
        // Prywatne właściwości dla cache'owania
        this._localToWorldMatrix = null;
        this._worldToLocalMatrix = null;
        this._matrixDirty = true;
        this.position.set(x, y);
        this.rotation = rotation;
        this.scale.set(scaleX, scaleY);
    }
    /**
     * Ustawia pozycję
     */
    setPosition(x, y) {
        this.position.set(x, y);
        this._matrixDirty = true;
    }
    /**
     * Przemieszcza o wektor
     */
    translate(deltaX, deltaY) {
        this.position.x += deltaX;
        this.position.y += deltaY;
        this._matrixDirty = true;
    }
    /**
     * Ustawia rotację
     */
    setRotation(rotation) {
        this.rotation = rotation;
        this._matrixDirty = true;
    }
    /**
     * Obraca o kąt
     */
    rotate(deltaRotation) {
        this.rotation += deltaRotation;
        this._matrixDirty = true;
    }
    /**
     * Ustawia skalę
     */
    setScale(scaleX, scaleY = scaleX) {
        this.scale.set(scaleX, scaleY);
        this._matrixDirty = true;
    }
    /**
     * Skaluje
     */
    scaleBy(factorX, factorY = factorX) {
        this.scale.x *= factorX;
        this.scale.y *= factorY;
        this._matrixDirty = true;
    }
    /**
     * Zwraca macierz transformacji local-to-world
     */
    getLocalToWorldMatrix() {
        if (this._matrixDirty || !this._localToWorldMatrix) {
            this._updateMatrices();
        }
        return this._localToWorldMatrix;
    }
    /**
     * Zwraca macierz transformacji world-to-local
     */
    getWorldToLocalMatrix() {
        if (this._matrixDirty || !this._worldToLocalMatrix) {
            this._updateMatrices();
        }
        return this._worldToLocalMatrix;
    }
    /**
     * Konwertuje punkt z local space do world space
     */
    localToWorld(localPoint) {
        const matrix = this.getLocalToWorldMatrix();
        const x = localPoint.x * matrix[0] + localPoint.y * matrix[2] + matrix[4];
        const y = localPoint.x * matrix[1] + localPoint.y * matrix[3] + matrix[5];
        return new Vector2_1.Vector2(x, y);
    }
    /**
     * Konwertuje punkt z world space do local space
     */
    worldToLocal(worldPoint) {
        const matrix = this.getWorldToLocalMatrix();
        const x = worldPoint.x * matrix[0] + worldPoint.y * matrix[2] + matrix[4];
        const y = worldPoint.x * matrix[1] + worldPoint.y * matrix[3] + matrix[5];
        return new Vector2_1.Vector2(x, y);
    }
    /**
     * Zwraca forward vector (kierunek "przodu" obiektu)
     */
    getForward() {
        return new Vector2_1.Vector2(Math.cos(this.rotation), Math.sin(this.rotation));
    }
    /**
     * Zwraca right vector (kierunek "prawy" obiektu)
     */
    getRight() {
        return new Vector2_1.Vector2(Math.cos(this.rotation + Math.PI / 2), Math.sin(this.rotation + Math.PI / 2));
    }
    /**
     * Patrzy w kierunku określonego punktu
     */
    lookAt(target) {
        const direction = Vector2_1.Vector2.subtract(target, this.position);
        this.rotation = Math.atan2(direction.y, direction.x);
        this._matrixDirty = true;
    }
    /**
     * Oblicza odległość do innej pozycji
     */
    distanceTo(otherPosition) {
        return this.position.distanceTo(otherPosition);
    }
    /**
     * Klonuje komponent
     */
    clone() {
        const cloned = new Transform_1(this.position.x, this.position.y, this.rotation, this.scale.x, this.scale.y);
        return cloned;
    }
    /**
     * Serializuje komponent
     */
    serialize() {
        return {
            position: { x: this.position.x, y: this.position.y },
            rotation: this.rotation,
            scale: { x: this.scale.x, y: this.scale.y }
        };
    }
    /**
     * Deserializuje komponent
     */
    deserialize(data) {
        if (data.position) {
            this.position.set(data.position.x, data.position.y);
        }
        if (data.rotation !== undefined) {
            this.rotation = data.rotation;
        }
        if (data.scale) {
            this.scale.set(data.scale.x, data.scale.y);
        }
        this._matrixDirty = true;
    }
    /**
     * Aktualizuje cache'owane macierze
     */
    _updateMatrices() {
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);
        // Local-to-world matrix (SRT - Scale, Rotate, Translate)
        this._localToWorldMatrix = [
            this.scale.x * cos, this.scale.x * -sin, 0,
            this.scale.y * sin, this.scale.y * cos, 0,
            this.position.x, this.position.y, 1
        ];
        // World-to-local matrix (inverse)
        const det = this.scale.x * this.scale.y;
        if (det === 0) {
            this._worldToLocalMatrix = [1, 0, 0, 1, 0, 0];
        }
        else {
            const invScaleX = 1 / this.scale.x;
            const invScaleY = 1 / this.scale.y;
            this._worldToLocalMatrix = [
                invScaleX * cos, invScaleY * sin, 0,
                invScaleX * -sin, invScaleY * cos, 0,
                -(this.position.x * cos + this.position.y * -sin) * invScaleX,
                -(this.position.x * sin + this.position.y * cos) * invScaleY,
                1
            ];
        }
        this._matrixDirty = false;
    }
};
exports.Transform = Transform;
exports.Transform = Transform = Transform_1 = __decorate([
    Component_1.SingletonComponent,
    __metadata("design:paramtypes", [Number, Number, Number, Number, Number])
], Transform);
//# sourceMappingURL=Transform.js.map