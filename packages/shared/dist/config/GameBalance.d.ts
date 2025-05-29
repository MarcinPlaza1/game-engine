/**
 * Game Balance Configuration
 * Konfiguracja kosztów, statystyk i balansu gry
 */
import { UnitType, BuildingType, ResourceType } from '../types/GameState';
export interface ResourceCost {
    [ResourceType.GOLD]?: number;
    [ResourceType.WOOD]?: number;
    [ResourceType.STONE]?: number;
    [ResourceType.FOOD]?: number;
    [ResourceType.ENERGY]?: number;
}
export declare const DEFAULT_UNIT_COSTS: Record<UnitType, ResourceCost>;
export declare const DEFAULT_BUILDING_COSTS: Record<BuildingType, ResourceCost>;
export interface UnitStats {
    health: number;
    attack: number;
    defense: number;
    range: number;
    moveSpeed: number;
    buildTime: number;
    populationCost: number;
}
export declare const DEFAULT_UNIT_STATS: Record<UnitType, UnitStats>;
export interface BuildingStats {
    health: number;
    defense: number;
    buildTime: number;
    populationProvided?: number;
    attackRange?: number;
    attackDamage?: number;
}
export declare const DEFAULT_BUILDING_STATS: Record<BuildingType, BuildingStats>;
/**
 * Sprawdza czy gracz ma wystarczające zasoby
 */
export declare function hasEnoughResources(playerResources: Record<string, number>, requiredResources: ResourceCost): boolean;
/**
 * Odejmuje zasoby od gracza
 */
export declare function subtractResources(playerResources: Record<string, number>, cost: ResourceCost): Record<string, number>;
/**
 * Dodaje zasoby do gracza
 */
export declare function addResources(playerResources: Record<string, number>, resources: ResourceCost): Record<string, number>;
/**
 * Generuje początkowe zasoby dla gracza
 */
export declare function generateStartingResources(): Record<string, number>;
//# sourceMappingURL=GameBalance.d.ts.map