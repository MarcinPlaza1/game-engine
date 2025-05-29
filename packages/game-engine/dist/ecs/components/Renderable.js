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
var Renderable_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Renderable = exports.ShapeType = exports.RenderType = void 0;
const Component_1 = require("../Component");
const Vector2_1 = require("../../math/Vector2");
/**
 * Enum dla typów renderowania
 */
var RenderType;
(function (RenderType) {
    RenderType["SPRITE"] = "sprite";
    RenderType["SHAPE"] = "shape";
    RenderType["ISOMETRIC_TILE"] = "isometric_tile";
    RenderType["TEXT"] = "text";
    RenderType["CUSTOM"] = "custom";
})(RenderType || (exports.RenderType = RenderType = {}));
/**
 * Enum dla kształtów
 */
var ShapeType;
(function (ShapeType) {
    ShapeType["RECTANGLE"] = "rectangle";
    ShapeType["CIRCLE"] = "circle";
    ShapeType["LINE"] = "line";
    ShapeType["POLYGON"] = "polygon";
})(ShapeType || (exports.ShapeType = ShapeType = {}));
/**
 * Komponent Renderable - obsługuje renderowanie obiektów
 */
let Renderable = Renderable_1 = class Renderable extends Component_1.Component {
    constructor(renderType = RenderType.SHAPE) {
        super();
        this.renderType = RenderType.SHAPE;
        this.visible = true;
        this.color = '#ffffff';
        this.opacity = 1;
        this.zIndex = 0;
        // Offset od pozycji transform
        this.offset = new Vector2_1.Vector2();
        this.renderType = renderType;
    }
    /**
     * Konfiguruje renderowanie prostokąta
     */
    setRectangle(width, height, filled = true, lineWidth = 1) {
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
    setCircle(radius, filled = true, lineWidth = 1) {
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
    setLine(endX, endY, lineWidth = 1) {
        this.renderType = RenderType.SHAPE;
        this.shapeData = {
            type: ShapeType.LINE,
            points: [new Vector2_1.Vector2(0, 0), new Vector2_1.Vector2(endX, endY)],
            lineWidth
        };
        return this;
    }
    /**
     * Konfiguruje renderowanie wielokąta
     */
    setPolygon(points, filled = true, lineWidth = 1) {
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
    setSprite(imagePath, sourceRect) {
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
    setSpriteImage(image, sourceRect) {
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
    setText(text, font = '12px Arial', textAlign = 'center') {
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
    setIsometricTile(gridX, gridY) {
        this.renderType = RenderType.ISOMETRIC_TILE;
        this.isometricGridPos = new Vector2_1.Vector2(gridX, gridY);
        return this;
    }
    /**
     * Konfiguruje niestandardową funkcję renderowania
     */
    setCustomRender(renderFunction) {
        this.renderType = RenderType.CUSTOM;
        this.customRenderFunction = renderFunction;
        return this;
    }
    /**
     * Ustawia kolor
     */
    setColor(color) {
        this.color = color;
        return this;
    }
    /**
     * Ustawia przezroczystość
     */
    setOpacity(opacity) {
        this.opacity = Math.max(0, Math.min(1, opacity));
        return this;
    }
    /**
     * Ustawia z-index
     */
    setZIndex(zIndex) {
        this.zIndex = zIndex;
        return this;
    }
    /**
     * Ustawia offset renderowania
     */
    setOffset(x, y) {
        this.offset.set(x, y);
        return this;
    }
    /**
     * Przerzuca sprite'a poziomo
     */
    setFlipX(flip) {
        if (this.spriteData) {
            this.spriteData.flipX = flip;
        }
        return this;
    }
    /**
     * Przerzuca sprite'a pionowo
     */
    setFlipY(flip) {
        if (this.spriteData) {
            this.spriteData.flipY = flip;
        }
        return this;
    }
    /**
     * Sprawdza czy komponent jest gotowy do renderowania
     */
    isReadyToRender() {
        if (!this.visible || this.opacity <= 0)
            return false;
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
    clone() {
        const cloned = new Renderable_1(this.renderType);
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
    serialize() {
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
    deserialize(data) {
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
                points: data.shapeData.points?.map((p) => new Vector2_1.Vector2(p.x, p.y))
            };
        }
        if (data.textData) {
            this.textData = { ...data.textData };
        }
        if (data.isometricGridPos) {
            this.isometricGridPos = new Vector2_1.Vector2(data.isometricGridPos.x, data.isometricGridPos.y);
        }
    }
};
exports.Renderable = Renderable;
exports.Renderable = Renderable = Renderable_1 = __decorate([
    Component_1.SingletonComponent,
    __metadata("design:paramtypes", [String])
], Renderable);
//# sourceMappingURL=Renderable.js.map