import { RenderSystem } from '../System';
import { Component } from '../Component';
import { RenderingEngine } from '../../rendering/RenderingEngine';
/**
 * System renderowania dla ECS
 */
export declare class RenderingSystem extends RenderSystem {
    private renderingEngine;
    private imageCache;
    constructor(world: any, renderingEngine: RenderingEngine);
    getRequiredComponents(): Array<new () => Component>;
    render(deltaTime: number): void;
    private renderEntity;
    private renderShape;
    private renderSprite;
    private renderText;
    private renderIsometricTile;
    private renderCustom;
    private getOrLoadImage;
    /**
     * Preładowuje obraz
     */
    preloadImage(imagePath: string): Promise<HTMLImageElement>;
    /**
     * Czyści cache obrazów
     */
    clearImageCache(): void;
    /**
     * Zwraca statystyki cache'a obrazów
     */
    getImageCacheStats(): {
        size: number;
        paths: string[];
    };
}
//# sourceMappingURL=RenderingSystem.d.ts.map