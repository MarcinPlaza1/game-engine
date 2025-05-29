/**
 * Klasa Vector2 - obsługa wektorów 2D dla silnika gry
 */
export class Vector2 {
  public x: number;
  public y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * Tworzy kopię wektora
   */
  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  /**
   * Ustawia wartości wektora
   */
  set(x: number, y: number): Vector2 {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * Dodaje wektor do bieżącego
   */
  add(vector: Vector2): Vector2 {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }

  /**
   * Odejmuje wektor od bieżącego
   */
  subtract(vector: Vector2): Vector2 {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  }

  /**
   * Mnoży wektor przez skalar
   */
  multiply(scalar: number): Vector2 {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  /**
   * Dzieli wektor przez skalar
   */
  divide(scalar: number): Vector2 {
    if (scalar === 0) throw new Error("Dzielenie przez zero!");
    this.x /= scalar;
    this.y /= scalar;
    return this;
  }

  /**
   * Oblicza długość wektora
   */
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Oblicza kwadrat długości wektora (szybsze niż magnitude)
   */
  magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  /**
   * Normalizuje wektor (długość = 1)
   */
  normalize(): Vector2 {
    const mag = this.magnitude();
    if (mag === 0) return this;
    return this.divide(mag);
  }

  /**
   * Oblicza odległość do innego wektora
   */
  distanceTo(vector: Vector2): number {
    const dx = this.x - vector.x;
    const dy = this.y - vector.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Oblicza iloczyn skalarny
   */
  dot(vector: Vector2): number {
    return this.x * vector.x + this.y * vector.y;
  }

  /**
   * Interpolacja liniowa między dwoma wektorami
   */
  lerp(target: Vector2, alpha: number): Vector2 {
    this.x += (target.x - this.x) * alpha;
    this.y += (target.y - this.y) * alpha;
    return this;
  }

  /**
   * Obraca wektor o zadany kąt (w radianach)
   */
  rotate(angle: number): Vector2 {
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
  equals(vector: Vector2, tolerance: number = 1e-6): boolean {
    return Math.abs(this.x - vector.x) < tolerance && 
           Math.abs(this.y - vector.y) < tolerance;
  }

  /**
   * Zwraca reprezentację tekstową
   */
  toString(): string {
    return `Vector2(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
  }

  // Statyczne metody pomocnicze
  static zero(): Vector2 {
    return new Vector2(0, 0);
  }

  static one(): Vector2 {
    return new Vector2(1, 1);
  }

  static up(): Vector2 {
    return new Vector2(0, -1);
  }

  static down(): Vector2 {
    return new Vector2(0, 1);
  }

  static left(): Vector2 {
    return new Vector2(-1, 0);
  }

  static right(): Vector2 {
    return new Vector2(1, 0);
  }

  /**
   * Tworzy wektor z kąta i długości
   */
  static fromAngle(angle: number, magnitude: number = 1): Vector2 {
    return new Vector2(
      Math.cos(angle) * magnitude,
      Math.sin(angle) * magnitude
    );
  }

  /**
   * Dodaje dwa wektory (bez modyfikacji oryginałów)
   */
  static add(a: Vector2, b: Vector2): Vector2 {
    return new Vector2(a.x + b.x, a.y + b.y);
  }

  /**
   * Odejmuje dwa wektory
   */
  static subtract(a: Vector2, b: Vector2): Vector2 {
    return new Vector2(a.x - b.x, a.y - b.y);
  }

  /**
   * Mnoży wektor przez skalar
   */
  static multiply(vector: Vector2, scalar: number): Vector2 {
    return new Vector2(vector.x * scalar, vector.y * scalar);
  }
} 