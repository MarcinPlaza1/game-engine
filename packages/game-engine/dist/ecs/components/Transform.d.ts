import { Component } from '../Component';
import { Vector2 } from '../../math/Vector2';
/**
 * Komponent Transform - przechowuje informacje o pozycji, rotacji i skali
 */
export declare class Transform extends Component {
    position: Vector2;
    rotation: number;
    scale: Vector2;
    private _localToWorldMatrix;
    private _worldToLocalMatrix;
    private _matrixDirty;
    constructor(x?: number, y?: number, rotation?: number, scaleX?: number, scaleY?: number);
    /**
     * Ustawia pozycję
     */
    setPosition(x: number, y: number): void;
    /**
     * Przemieszcza o wektor
     */
    translate(deltaX: number, deltaY: number): void;
    /**
     * Ustawia rotację
     */
    setRotation(rotation: number): void;
    /**
     * Obraca o kąt
     */
    rotate(deltaRotation: number): void;
    /**
     * Ustawia skalę
     */
    setScale(scaleX: number, scaleY?: number): void;
    /**
     * Skaluje
     */
    scaleBy(factorX: number, factorY?: number): void;
    /**
     * Zwraca macierz transformacji local-to-world
     */
    getLocalToWorldMatrix(): number[];
    /**
     * Zwraca macierz transformacji world-to-local
     */
    getWorldToLocalMatrix(): number[];
    /**
     * Konwertuje punkt z local space do world space
     */
    localToWorld(localPoint: Vector2): Vector2;
    /**
     * Konwertuje punkt z world space do local space
     */
    worldToLocal(worldPoint: Vector2): Vector2;
    /**
     * Zwraca forward vector (kierunek "przodu" obiektu)
     */
    getForward(): Vector2;
    /**
     * Zwraca right vector (kierunek "prawy" obiektu)
     */
    getRight(): Vector2;
    /**
     * Patrzy w kierunku określonego punktu
     */
    lookAt(target: Vector2): void;
    /**
     * Oblicza odległość do innej pozycji
     */
    distanceTo(otherPosition: Vector2): number;
    /**
     * Klonuje komponent
     */
    clone(): Transform;
    /**
     * Serializuje komponent
     */
    serialize(): any;
    /**
     * Deserializuje komponent
     */
    deserialize(data: any): void;
    /**
     * Aktualizuje cache'owane macierze
     */
    private _updateMatrices;
}
//# sourceMappingURL=Transform.d.ts.map