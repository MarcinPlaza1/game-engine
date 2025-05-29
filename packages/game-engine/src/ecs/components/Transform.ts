import { Component, SingletonComponent } from '../Component';
import { Vector2 } from '../../math/Vector2';

/**
 * Komponent Transform - przechowuje informacje o pozycji, rotacji i skali
 */
@SingletonComponent
export class Transform extends Component {
  public position: Vector2 = new Vector2();
  public rotation: number = 0; // w radianach
  public scale: Vector2 = new Vector2(1, 1);
  
  // Prywatne właściwości dla cache'owania
  private _localToWorldMatrix: number[] | null = null;
  private _worldToLocalMatrix: number[] | null = null;
  private _matrixDirty: boolean = true;

  constructor(x: number = 0, y: number = 0, rotation: number = 0, scaleX: number = 1, scaleY: number = 1) {
    super();
    this.position.set(x, y);
    this.rotation = rotation;
    this.scale.set(scaleX, scaleY);
  }

  /**
   * Ustawia pozycję
   */
  setPosition(x: number, y: number): void {
    this.position.set(x, y);
    this._matrixDirty = true;
  }

  /**
   * Przemieszcza o wektor
   */
  translate(deltaX: number, deltaY: number): void {
    this.position.x += deltaX;
    this.position.y += deltaY;
    this._matrixDirty = true;
  }

  /**
   * Ustawia rotację
   */
  setRotation(rotation: number): void {
    this.rotation = rotation;
    this._matrixDirty = true;
  }

  /**
   * Obraca o kąt
   */
  rotate(deltaRotation: number): void {
    this.rotation += deltaRotation;
    this._matrixDirty = true;
  }

  /**
   * Ustawia skalę
   */
  setScale(scaleX: number, scaleY: number = scaleX): void {
    this.scale.set(scaleX, scaleY);
    this._matrixDirty = true;
  }

  /**
   * Skaluje
   */
  scaleBy(factorX: number, factorY: number = factorX): void {
    this.scale.x *= factorX;
    this.scale.y *= factorY;
    this._matrixDirty = true;
  }

  /**
   * Zwraca macierz transformacji local-to-world
   */
  getLocalToWorldMatrix(): number[] {
    if (this._matrixDirty || !this._localToWorldMatrix) {
      this._updateMatrices();
    }
    return this._localToWorldMatrix!;
  }

  /**
   * Zwraca macierz transformacji world-to-local
   */
  getWorldToLocalMatrix(): number[] {
    if (this._matrixDirty || !this._worldToLocalMatrix) {
      this._updateMatrices();
    }
    return this._worldToLocalMatrix!;
  }

  /**
   * Konwertuje punkt z local space do world space
   */
  localToWorld(localPoint: Vector2): Vector2 {
    const matrix = this.getLocalToWorldMatrix();
    const x = localPoint.x * matrix[0] + localPoint.y * matrix[2] + matrix[4];
    const y = localPoint.x * matrix[1] + localPoint.y * matrix[3] + matrix[5];
    return new Vector2(x, y);
  }

  /**
   * Konwertuje punkt z world space do local space
   */
  worldToLocal(worldPoint: Vector2): Vector2 {
    const matrix = this.getWorldToLocalMatrix();
    const x = worldPoint.x * matrix[0] + worldPoint.y * matrix[2] + matrix[4];
    const y = worldPoint.x * matrix[1] + worldPoint.y * matrix[3] + matrix[5];
    return new Vector2(x, y);
  }

  /**
   * Zwraca forward vector (kierunek "przodu" obiektu)
   */
  getForward(): Vector2 {
    return new Vector2(
      Math.cos(this.rotation),
      Math.sin(this.rotation)
    );
  }

  /**
   * Zwraca right vector (kierunek "prawy" obiektu)
   */
  getRight(): Vector2 {
    return new Vector2(
      Math.cos(this.rotation + Math.PI / 2),
      Math.sin(this.rotation + Math.PI / 2)
    );
  }

  /**
   * Patrzy w kierunku określonego punktu
   */
  lookAt(target: Vector2): void {
    const direction = Vector2.subtract(target, this.position);
    this.rotation = Math.atan2(direction.y, direction.x);
    this._matrixDirty = true;
  }

  /**
   * Oblicza odległość do innej pozycji
   */
  distanceTo(otherPosition: Vector2): number {
    return this.position.distanceTo(otherPosition);
  }

  /**
   * Klonuje komponent
   */
  clone(): Transform {
    const cloned = new Transform(
      this.position.x,
      this.position.y,
      this.rotation,
      this.scale.x,
      this.scale.y
    );
    return cloned;
  }

  /**
   * Serializuje komponent
   */
  serialize(): any {
    return {
      position: { x: this.position.x, y: this.position.y },
      rotation: this.rotation,
      scale: { x: this.scale.x, y: this.scale.y }
    };
  }

  /**
   * Deserializuje komponent
   */
  deserialize(data: any): void {
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
  private _updateMatrices(): void {
    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);
    
    // Local-to-world matrix (SRT - Scale, Rotate, Translate)
    this._localToWorldMatrix = [
      this.scale.x * cos, this.scale.x * -sin, 0,
      this.scale.y * sin, this.scale.y * cos,  0,
      this.position.x,    this.position.y,     1
    ];
    
    // World-to-local matrix (inverse)
    const det = this.scale.x * this.scale.y;
    if (det === 0) {
      this._worldToLocalMatrix = [1, 0, 0, 1, 0, 0];
    } else {
      const invScaleX = 1 / this.scale.x;
      const invScaleY = 1 / this.scale.y;
      
      this._worldToLocalMatrix = [
        invScaleX * cos,  invScaleY * sin, 0,
        invScaleX * -sin, invScaleY * cos, 0,
        -(this.position.x * cos + this.position.y * -sin) * invScaleX,
        -(this.position.x * sin + this.position.y * cos) * invScaleY,
        1
      ];
    }
    
    this._matrixDirty = false;
  }
} 