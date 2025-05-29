import { Component, SingletonComponent } from '../Component';
import { Vector2 } from '../../math/Vector2';

/**
 * Enum dla typów renderowania
 */
export enum RenderType {
  SPRITE = 'sprite',
  SHAPE = 'shape',
  ISOMETRIC_TILE = 'isometric_tile',
  TEXT = 'text',
  CUSTOM = 'custom'
}

/**
 * Enum dla kształtów
 */
export enum ShapeType {
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  LINE = 'line',
  POLYGON = 'polygon'
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
  sourceRect?: { x: number; y: number; width: number; height: number };
  flipX?: boolean;
  flipY?: boolean;
}

/**
 * Komponent Renderable - obsługuje renderowanie obiektów
 */
@SingletonComponent
export class Renderable extends Component {
  public renderType: RenderType = RenderType.SHAPE;
  public visible: boolean = true;
  public color: string = '#ffffff';
  public opacity: number = 1;
  public zIndex: number = 0;
  
  // Offset od pozycji transform
  public offset: Vector2 = new Vector2();
  
  // Dane specyficzne dla typu renderowania
  public shapeData?: ShapeData;
  public spriteData?: SpriteData;
  public textData?: TextData;
  public isometricGridPos?: Vector2;
  
  // Funkcja niestandardowego renderowania
  public customRenderFunction?: (ctx: CanvasRenderingContext2D, position: Vector2, scale: Vector2, rotation: number) => void;

  constructor(renderType: RenderType = RenderType.SHAPE) {
    super();
    this.renderType = renderType;
  }

  /**
   * Konfiguruje renderowanie prostokąta
   */
  setRectangle(width: number, height: number, filled: boolean = true, lineWidth: number = 1): this {
    this.renderType = RenderType.SHAPE;
    this.shapeData = {
      type: ShapeType.RECTANGLE,
      width,
      height,
      filled,
      lineWidth
    };
    return this;
  }

  /**
   * Konfiguruje renderowanie okręgu
   */
  setCircle(radius: number, filled: boolean = true, lineWidth: number = 1): this {
    this.renderType = RenderType.SHAPE;
    this.shapeData = {
      type: ShapeType.CIRCLE,
      radius,
      filled,
      lineWidth
    };
    return this;
  }

  /**
   * Konfiguruje renderowanie linii
   */
  setLine(endX: number, endY: number, lineWidth: number = 1): this {
    this.renderType = RenderType.SHAPE;
    this.shapeData = {
      type: ShapeType.LINE,
      points: [new Vector2(0, 0), new Vector2(endX, endY)],
      lineWidth
    };
    return this;
  }

  /**
   * Konfiguruje renderowanie wielokąta
   */
  setPolygon(points: Vector2[], filled: boolean = true, lineWidth: number = 1): this {
    this.renderType = RenderType.SHAPE;
    this.shapeData = {
      type: ShapeType.POLYGON,
      points: points.map(p => p.clone()),
      filled,
      lineWidth
    };
    return this;
  }

  /**
   * Konfiguruje renderowanie sprite'a
   */
  setSprite(imagePath: string, sourceRect?: { x: number; y: number; width: number; height: number }): this {
    this.renderType = RenderType.SPRITE;
    this.spriteData = {
      imagePath,
      sourceRect,
      flipX: false,
      flipY: false
    };
    return this;
  }

  /**
   * Konfiguruje renderowanie sprite'a z obrazem
   */
  setSpriteImage(image: HTMLImageElement, sourceRect?: { x: number; y: number; width: number; height: number }): this {
    this.renderType = RenderType.SPRITE;
    this.spriteData = {
      image,
      sourceRect,
      flipX: false,
      flipY: false
    };
    return this;
  }

  /**
   * Konfiguruje renderowanie tekstu
   */
  setText(text: string, font: string = '12px Arial', textAlign: CanvasTextAlign = 'center'): this {
    this.renderType = RenderType.TEXT;
    this.textData = {
      text,
      font,
      textAlign,
      textBaseline: 'middle'
    };
    return this;
  }

  /**
   * Konfiguruje renderowanie kafelka izometrycznego
   */
  setIsometricTile(gridX: number, gridY: number): this {
    this.renderType = RenderType.ISOMETRIC_TILE;
    this.isometricGridPos = new Vector2(gridX, gridY);
    return this;
  }

  /**
   * Konfiguruje niestandardową funkcję renderowania
   */
  setCustomRender(renderFunction: (ctx: CanvasRenderingContext2D, position: Vector2, scale: Vector2, rotation: number) => void): this {
    this.renderType = RenderType.CUSTOM;
    this.customRenderFunction = renderFunction;
    return this;
  }

  /**
   * Ustawia kolor
   */
  setColor(color: string): this {
    this.color = color;
    return this;
  }

  /**
   * Ustawia przezroczystość
   */
  setOpacity(opacity: number): this {
    this.opacity = Math.max(0, Math.min(1, opacity));
    return this;
  }

  /**
   * Ustawia z-index
   */
  setZIndex(zIndex: number): this {
    this.zIndex = zIndex;
    return this;
  }

  /**
   * Ustawia offset renderowania
   */
  setOffset(x: number, y: number): this {
    this.offset.set(x, y);
    return this;
  }

  /**
   * Przerzuca sprite'a poziomo
   */
  setFlipX(flip: boolean): this {
    if (this.spriteData) {
      this.spriteData.flipX = flip;
    }
    return this;
  }

  /**
   * Przerzuca sprite'a pionowo
   */
  setFlipY(flip: boolean): this {
    if (this.spriteData) {
      this.spriteData.flipY = flip;
    }
    return this;
  }

  /**
   * Sprawdza czy komponent jest gotowy do renderowania
   */
  isReadyToRender(): boolean {
    if (!this.visible || this.opacity <= 0) return false;

    switch (this.renderType) {
      case RenderType.SHAPE:
        return !!this.shapeData;
      case RenderType.SPRITE:
        return !!this.spriteData && (!!this.spriteData.image || !!this.spriteData.imagePath);
      case RenderType.TEXT:
        return !!this.textData && !!this.textData.text;
      case RenderType.ISOMETRIC_TILE:
        return !!this.isometricGridPos;
      case RenderType.CUSTOM:
        return !!this.customRenderFunction;
      default:
        return false;
    }
  }

  /**
   * Klonuje komponent
   */
  clone(): Renderable {
    const cloned = new Renderable(this.renderType);
    cloned.visible = this.visible;
    cloned.color = this.color;
    cloned.opacity = this.opacity;
    cloned.zIndex = this.zIndex;
    cloned.offset = this.offset.clone();
    
    if (this.shapeData) {
      cloned.shapeData = {
        ...this.shapeData,
        points: this.shapeData.points?.map(p => p.clone())
      };
    }
    
    if (this.spriteData) {
      cloned.spriteData = { ...this.spriteData };
    }
    
    if (this.textData) {
      cloned.textData = { ...this.textData };
    }
    
    if (this.isometricGridPos) {
      cloned.isometricGridPos = this.isometricGridPos.clone();
    }
    
    cloned.customRenderFunction = this.customRenderFunction;
    
    return cloned;
  }

  /**
   * Serializuje komponent
   */
  serialize(): any {
    return {
      renderType: this.renderType,
      visible: this.visible,
      color: this.color,
      opacity: this.opacity,
      zIndex: this.zIndex,
      offset: { x: this.offset.x, y: this.offset.y },
      shapeData: this.shapeData ? {
        ...this.shapeData,
        points: this.shapeData.points?.map(p => ({ x: p.x, y: p.y }))
      } : undefined,
      textData: this.textData,
      isometricGridPos: this.isometricGridPos ? { x: this.isometricGridPos.x, y: this.isometricGridPos.y } : undefined
    };
  }

  /**
   * Deserializuje komponent
   */
  deserialize(data: any): void {
    this.renderType = data.renderType || RenderType.SHAPE;
    this.visible = data.visible ?? true;
    this.color = data.color || '#ffffff';
    this.opacity = data.opacity ?? 1;
    this.zIndex = data.zIndex || 0;
    
    if (data.offset) {
      this.offset.set(data.offset.x, data.offset.y);
    }
    
    if (data.shapeData) {
      this.shapeData = {
        ...data.shapeData,
        points: data.shapeData.points?.map((p: any) => new Vector2(p.x, p.y))
      };
    }
    
    if (data.textData) {
      this.textData = { ...data.textData };
    }
    
    if (data.isometricGridPos) {
      this.isometricGridPos = new Vector2(data.isometricGridPos.x, data.isometricGridPos.y);
    }
  }
} 