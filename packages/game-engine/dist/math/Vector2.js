"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vector2 = void 0;
/**
 * Klasa Vector2 - obsługa wektorów 2D dla silnika gry
 */
class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    /**
     * Tworzy kopię wektora
     */
    clone() {
        return new Vector2(this.x, this.y);
    }
    /**
     * Ustawia wartości wektora
     */
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    /**
     * Dodaje wektor do bieżącego
     */
    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }
    /**
     * Odejmuje wektor od bieżącego
     */
    subtract(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }
    /**
     * Mnoży wektor przez skalar
     */
    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    /**
     * Dzieli wektor przez skalar
     */
    divide(scalar) {
        if (scalar === 0)
            throw new Error("Dzielenie przez zero!");
        this.x /= scalar;
        this.y /= scalar;
        return this;
    }
    /**
     * Oblicza długość wektora
     */
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    /**
     * Oblicza kwadrat długości wektora (szybsze niż magnitude)
     */
    magnitudeSquared() {
        return this.x * this.x + this.y * this.y;
    }
    /**
     * Normalizuje wektor (długość = 1)
     */
    normalize() {
        const mag = this.magnitude();
        if (mag === 0)
            return this;
        return this.divide(mag);
    }
    /**
     * Oblicza odległość do innego wektora
     */
    distanceTo(vector) {
        const dx = this.x - vector.x;
        const dy = this.y - vector.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    /**
     * Oblicza iloczyn skalarny
     */
    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }
    /**
     * Interpolacja liniowa między dwoma wektorami
     */
    lerp(target, alpha) {
        this.x += (target.x - this.x) * alpha;
        this.y += (target.y - this.y) * alpha;
        return this;
    }
    /**
     * Obraca wektor o zadany kąt (w radianach)
     */
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const newX = this.x * cos - this.y * sin;
        const newY = this.x * sin + this.y * cos;
        this.x = newX;
        this.y = newY;
        return this;
    }
    /**
     * Sprawdza równość wektorów
     */
    equals(vector, tolerance = 1e-6) {
        return Math.abs(this.x - vector.x) < tolerance &&
            Math.abs(this.y - vector.y) < tolerance;
    }
    /**
     * Zwraca reprezentację tekstową
     */
    toString() {
        return `Vector2(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }
    // Statyczne metody pomocnicze
    static zero() {
        return new Vector2(0, 0);
    }
    static one() {
        return new Vector2(1, 1);
    }
    static up() {
        return new Vector2(0, -1);
    }
    static down() {
        return new Vector2(0, 1);
    }
    static left() {
        return new Vector2(-1, 0);
    }
    static right() {
        return new Vector2(1, 0);
    }
    /**
     * Tworzy wektor z kąta i długości
     */
    static fromAngle(angle, magnitude = 1) {
        return new Vector2(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
    }
    /**
     * Dodaje dwa wektory (bez modyfikacji oryginałów)
     */
    static add(a, b) {
        return new Vector2(a.x + b.x, a.y + b.y);
    }
    /**
     * Odejmuje dwa wektory
     */
    static subtract(a, b) {
        return new Vector2(a.x - b.x, a.y - b.y);
    }
    /**
     * Mnoży wektor przez skalar
     */
    static multiply(vector, scalar) {
        return new Vector2(vector.x * scalar, vector.y * scalar);
    }
}
exports.Vector2 = Vector2;
//# sourceMappingURL=Vector2.js.map