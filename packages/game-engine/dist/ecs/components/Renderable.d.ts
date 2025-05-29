import { Component } from '../Component';
import { Vector2 } from '../../math/Vector2';
/**
 * Enum dla typów renderowania
 */
export declare enum RenderType {
    SPRITE = "sprite",
    SHAPE = "shape",
    ISOMETRIC_TILE = "isometric_tile",
    TEXT = "text",
    CUSTOM = "custom"
}
/**
 * Enum dla kształtów
 */
export declare enum ShapeType {
    RECTANGLE = "rectangle",
    CIRCLE = "circle",
    LINE = "line",
    POLYGON = "polygon"
}
/**
 * Dane dla renderowania kształtu
 */
export interface ShapeData {
    type: ShapeType;
    width?: number;
    height?: number;
    radius?: number;
    points?: Vector2[];
    filled?: boolean;
    lineWidth?: number;
}
/**
 * Dane dla renderowania tekstu
 */
export interface TextData {
    text: string;
    font?: string;
    fontSize?: number;
    textAlign?: CanvasTextAlign;
    textBaseline?: CanvasTextBaseline;
}
/**
 * Dane dla sprite'a
 */
export interface SpriteData {
    imagePath?: string;
    image?: HTMLImageElement;
    sourceRect?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    flipX?: boolean;
    flipY?: boolean;
}
/**
 * Komponent Renderable - obsługuje renderowanie obiektów
 */
export declare class Renderable extends Component {
    renderType: RenderType;
    visible: boolean;
    color: string;
    opacity: number;
    zIndex: number;
    offset: Vector2;
    shapeData?: ShapeData;
    spriteData?: SpriteData;
    textData?: TextData;
    isometricGridPos?: Vector2;
    customRenderFunction?: (ctx: CanvasRenderingContext2D, position: Vector2, scale: Vector2, rotation: number) => void;
    constructor(renderType?: RenderType);
    /**
     * Konfiguruje renderowanie prostokąta
     */
    setRectangle(width: number, height: number, filled?: boolean, lineWidth?: number): this;
    /**
     * Konfiguruje renderowanie okręgu
     */
    setCircle(radius: number, filled?: boolean, lineWidth?: number): this;
    /**
     * Konfiguruje renderowanie linii
     */
    setLine(endX: number, endY: number, lineWidth?: number): this;
    /**
     * Konfiguruje renderowanie wielokąta
     */
    setPolygon(points: Vector2[], filled?: boolean, lineWidth?: number): this;
    /**
     * Konfiguruje renderowanie sprite'a
     */
    setSprite(imagePath: string, sourceRect?: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): this;
    /**
     * Konfiguruje renderowanie sprite'a z obrazem
     */
    setSpriteImage(image: HTMLImageElement, sourceRect?: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): this;
    /**
     * Konfiguruje renderowanie tekstu
     */
    setText(text: string, font?: string, textAlign?: CanvasTextAlign): this;
    /**
     * Konfiguruje renderowanie kafelka izometrycznego
     */
    setIsometricTile(gridX: number, gridY: number): this;
    /**
     * Konfiguruje niestandardową funkcję renderowania
     */
    setCustomRender(renderFunction: (ctx: CanvasRenderingContext2D, position: Vector2, scale: Vector2, rotation: number) => void): this;
    /**
     * Ustawia kolor
     */
    setColor(color: string): this;
    /**
     * Ustawia przezroczystość
     */
    setOpacity(opacity: number): this;
    /**
     * Ustawia z-index
     */
    setZIndex(zIndex: number): this;
    /**
     * Ustawia offset renderowania
     */
    setOffset(x: number, y: number): this;
    /**
     * Przerzuca sprite'a poziomo
     */
    setFlipX(flip: boolean): this;
    /**
     * Przerzuca sprite'a pionowo
     */
    setFlipY(flip: boolean): this;
    /**
     * Sprawdza czy komponent jest gotowy do renderowania
     */
    isReadyToRender(): boolean;
    /**
     * Klonuje komponent
     */
    clone(): Renderable;
    /**
     * Serializuje komponent
     */
    serialize(): any;
    /**
     * Deserializuje komponent
     */
    deserialize(data: any): void;
}
//# sourceMappingURL=Renderable.d.ts.map