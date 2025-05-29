import { RenderSystem } from '../System';
import { Component } from '../Component';
import { Transform } from '../components/Transform';
import { Renderable, RenderType, ShapeType } from '../components/Renderable';
import { RenderingEngine } from '../../rendering/RenderingEngine';
import { IsometricUtils } from '../../math/IsometricUtils';
import { Vector2 } from '../../math/Vector2';

/**
 * System renderowania dla ECS
 */
export class RenderingSystem extends RenderSystem {
  private renderingEngine: RenderingEngine;
  private imageCache: Map<string, HTMLImageElement> = new Map();

  constructor(world: any, renderingEngine: RenderingEngine) {
    super(world);
    this.renderingEngine = renderingEngine;
    this.priority = 100; // Wysoki priorytet dla renderowania
  }

  getRequiredComponents(): Array<new () => Component> {
    return [Transform, Renderable];
  }

  render(deltaTime: number): void {
    if (!this.enabled) return;

    // Sortuj entities według z-index
    const sortedEntities = this.entities.slice().sort((a, b) => {
      const renderableA = a.getComponent(Renderable)!;
      const renderableB = b.getComponent(Renderable)!;
      return renderableA.zIndex - renderableB.zIndex;
    });

    const ctx = this.renderingEngine.getContext() as CanvasRenderingContext2D;
    
    for (const entity of sortedEntities) {
      const transform = entity.getComponent(Transform)!;
      const renderable = entity.getComponent(Renderable)!;

      if (!renderable.visible || !renderable.isReadyToRender()) {
        continue;
      }

      // Sprawdź culling - czy obiekt jest w obszarze kamery
      const camera = this.renderingEngine.getCamera();
      const worldPos = Vector2.add(transform.position, renderable.offset);
      
      if (!camera.isPointVisible(worldPos, 100)) {
        continue;
      }

      // Renderuj obiekt
      this.renderEntity(entity, transform, renderable, ctx, deltaTime);
    }
  }

  private renderEntity(entity: any, transform: Transform, renderable: Renderable, ctx: CanvasRenderingContext2D, deltaTime: number): void {
    ctx.save();

    // Pozycja renderowania
    const renderPos = Vector2.add(transform.position, renderable.offset);
    const camera = this.renderingEngine.getCamera();
    const screenPos = camera.worldToScreen(renderPos);

    // Transformacje
    ctx.translate(screenPos.x, screenPos.y);
    ctx.rotate(transform.rotation);
    ctx.scale(transform.scale.x * camera.zoom, transform.scale.y * camera.zoom);

    // Przezroczystość
    ctx.globalAlpha = renderable.opacity;

    // Renderuj według typu
    switch (renderable.renderType) {
      case RenderType.SHAPE:
        this.renderShape(renderable, ctx);
        break;
      case RenderType.SPRITE:
        this.renderSprite(renderable, ctx);
        break;
      case RenderType.TEXT:
        this.renderText(renderable, ctx);
        break;
      case RenderType.ISOMETRIC_TILE:
        this.renderIsometricTile(renderable, ctx, transform);
        break;
      case RenderType.CUSTOM:
        this.renderCustom(renderable, ctx, renderPos, transform.scale, transform.rotation);
        break;
    }

    ctx.restore();
  }

  private renderShape(renderable: Renderable, ctx: CanvasRenderingContext2D): void {
    if (!renderable.shapeData) return;

    const shape = renderable.shapeData;
    ctx.fillStyle = renderable.color;
    ctx.strokeStyle = renderable.color;
    ctx.lineWidth = shape.lineWidth || 1;

    switch (shape.type) {
      case ShapeType.RECTANGLE:
        if (shape.width && shape.height) {
          const x = -shape.width / 2;
          const y = -shape.height / 2;
          
          if (shape.filled !== false) {
            ctx.fillRect(x, y, shape.width, shape.height);
          } else {
            ctx.strokeRect(x, y, shape.width, shape.height);
          }
        }
        break;

      case ShapeType.CIRCLE:
        if (shape.radius) {
          ctx.beginPath();
          ctx.arc(0, 0, shape.radius, 0, Math.PI * 2);
          
          if (shape.filled !== false) {
            ctx.fill();
          } else {
            ctx.stroke();
          }
        }
        break;

      case ShapeType.LINE:
        if (shape.points && shape.points.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(shape.points[0].x, shape.points[0].y);
          ctx.lineTo(shape.points[1].x, shape.points[1].y);
          ctx.stroke();
        }
        break;

      case ShapeType.POLYGON:
        if (shape.points && shape.points.length >= 3) {
          ctx.beginPath();
          ctx.moveTo(shape.points[0].x, shape.points[0].y);
          
          for (let i = 1; i < shape.points.length; i++) {
            ctx.lineTo(shape.points[i].x, shape.points[i].y);
          }
          
          ctx.closePath();
          
          if (shape.filled !== false) {
            ctx.fill();
          } else {
            ctx.stroke();
          }
        }
        break;
    }
  }

  private renderSprite(renderable: Renderable, ctx: CanvasRenderingContext2D): void {
    if (!renderable.spriteData) return;

    const sprite = renderable.spriteData;
    let image: HTMLImageElement | null = null;

    // Pobierz obraz
    if (sprite.image) {
      image = sprite.image;
    } else if (sprite.imagePath) {
      image = this.getOrLoadImage(sprite.imagePath);
    }

    if (!image || !image.complete) return;

    // Przerzucanie
    if (sprite.flipX || sprite.flipY) {
      ctx.scale(sprite.flipX ? -1 : 1, sprite.flipY ? -1 : 1);
    }

    // Renderowanie
    if (sprite.sourceRect) {
      const src = sprite.sourceRect;
      const destWidth = src.width;
      const destHeight = src.height;
      
      ctx.drawImage(
        image,
        src.x, src.y, src.width, src.height,
        -destWidth / 2, -destHeight / 2, destWidth, destHeight
      );
    } else {
      ctx.drawImage(
        image,
        -image.width / 2, -image.height / 2
      );
    }
  }

  private renderText(renderable: Renderable, ctx: CanvasRenderingContext2D): void {
    if (!renderable.textData) return;

    const text = renderable.textData;
    ctx.fillStyle = renderable.color;
    ctx.font = text.font || '12px Arial';
    ctx.textAlign = text.textAlign || 'center';
    ctx.textBaseline = text.textBaseline || 'middle';

    ctx.fillText(text.text, 0, 0);
  }

  private renderIsometricTile(renderable: Renderable, ctx: CanvasRenderingContext2D, transform: Transform): void {
    if (!renderable.isometricGridPos) return;

    // Reset transformacji dla kafelka izometrycznego
    ctx.restore();
    ctx.save();

    const gridPos = renderable.isometricGridPos;
    const screenPos = IsometricUtils.gridToScreenCenter(gridPos.x, gridPos.y);
    const camera = this.renderingEngine.getCamera();
    const finalScreenPos = camera.worldToScreen(screenPos);

    const halfWidth = IsometricUtils.HALF_TILE_WIDTH * camera.zoom;
    const halfHeight = IsometricUtils.HALF_TILE_HEIGHT * camera.zoom;

    ctx.fillStyle = renderable.color;
    ctx.globalAlpha = renderable.opacity;

    ctx.beginPath();
    ctx.moveTo(finalScreenPos.x, finalScreenPos.y - halfHeight);
    ctx.lineTo(finalScreenPos.x + halfWidth, finalScreenPos.y);
    ctx.lineTo(finalScreenPos.x, finalScreenPos.y + halfHeight);
    ctx.lineTo(finalScreenPos.x - halfWidth, finalScreenPos.y);
    ctx.closePath();
    ctx.fill();
  }

  private renderCustom(renderable: Renderable, ctx: CanvasRenderingContext2D, position: Vector2, scale: Vector2, rotation: number): void {
    if (!renderable.customRenderFunction) return;

    // Reset transformacji dla custom renderowania
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = renderable.opacity;

    renderable.customRenderFunction(ctx, position, scale, rotation);
  }

  private getOrLoadImage(imagePath: string): HTMLImageElement | null {
    if (this.imageCache.has(imagePath)) {
      return this.imageCache.get(imagePath)!;
    }

    const image = new Image();
    image.src = imagePath;
    this.imageCache.set(imagePath, image);

    // Async loading - obraz może nie być gotowy od razu
    return image;
  }

  /**
   * Preładowuje obraz
   */
  preloadImage(imagePath: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      if (this.imageCache.has(imagePath)) {
        resolve(this.imageCache.get(imagePath)!);
        return;
      }

      const image = new Image();
      image.onload = () => {
        this.imageCache.set(imagePath, image);
        resolve(image);
      };
      image.onerror = reject;
      image.src = imagePath;
    });
  }

  /**
   * Czyści cache obrazów
   */
  clearImageCache(): void {
    this.imageCache.clear();
  }

  /**
   * Zwraca statystyki cache'a obrazów
   */
  getImageCacheStats(): { size: number; paths: string[] } {
    return {
      size: this.imageCache.size,
      paths: Array.from(this.imageCache.keys())
    };
  }
} 