/**
 * Klasa Vector2 - obsługa wektorów 2D dla silnika gry
 */
export declare class Vector2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    /**
     * Tworzy kopię wektora
     */
    clone(): Vector2;
    /**
     * Ustawia wartości wektora
     */
    set(x: number, y: number): Vector2;
    /**
     * Dodaje wektor do bieżącego
     */
    add(vector: Vector2): Vector2;
    /**
     * Odejmuje wektor od bieżącego
     */
    subtract(vector: Vector2): Vector2;
    /**
     * Mnoży wektor przez skalar
     */
    multiply(scalar: number): Vector2;
    /**
     * Dzieli wektor przez skalar
     */
    divide(scalar: number): Vector2;
    /**
     * Oblicza długość wektora
     */
    magnitude(): number;
    /**
     * Oblicza kwadrat długości wektora (szybsze niż magnitude)
     */
    magnitudeSquared(): number;
    /**
     * Normalizuje wektor (długość = 1)
     */
    normalize(): Vector2;
    /**
     * Oblicza odległość do innego wektora
     */
    distanceTo(vector: Vector2): number;
    /**
     * Oblicza iloczyn skalarny
     */
    dot(vector: Vector2): number;
    /**
     * Interpolacja liniowa między dwoma wektorami
     */
    lerp(target: Vector2, alpha: number): Vector2;
    /**
     * Obraca wektor o zadany kąt (w radianach)
     */
    rotate(angle: number): Vector2;
    /**
     * Sprawdza równość wektorów
     */
    equals(vector: Vector2, tolerance?: number): boolean;
    /**
     * Zwraca reprezentację tekstową
     */
    toString(): string;
    static zero(): Vector2;
    static one(): Vector2;
    static up(): Vector2;
    static down(): Vector2;
    static left(): Vector2;
    static right(): Vector2;
    /**
     * Tworzy wektor z kąta i długości
     */
    static fromAngle(angle: number, magnitude?: number): Vector2;
    /**
     * Dodaje dwa wektory (bez modyfikacji oryginałów)
     */
    static add(a: Vector2, b: Vector2): Vector2;
    /**
     * Odejmuje dwa wektory
     */
    static subtract(a: Vector2, b: Vector2): Vector2;
    /**
     * Mnoży wektor przez skalar
     */
    static multiply(vector: Vector2, scalar: number): Vector2;
}
//# sourceMappingURL=Vector2.d.ts.map