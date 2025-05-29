/**
 * AI Player - Sztuczna inteligencja dla RTS Game Engine
 */
import { EventEmitter } from 'events';
import { Player, GameState, Position, UnitType, BuildingType, Faction, PlayerActionType } from '@rts-engine/shared';
export declare enum AIDifficulty {
    EASY = "easy",
    MEDIUM = "medium",
    HARD = "hard"
}
export interface AIConfig {
    difficulty: AIDifficulty;
    updateInterval: number;
    aggressiveness: number;
    economyFocus: number;
    militaryFocus: number;
}
export interface AIAction {
    type: PlayerActionType;
    unitIds?: string[];
    targetPosition?: Position;
    targetId?: string;
    unitType?: UnitType;
    buildingType?: BuildingType;
    buildingId?: string;
    data?: any;
}
export declare class AIPlayer extends EventEmitter {
    private player;
    private config;
    private gameState;
    private lastUpdate;
    private actionQueue;
    private buildOrder;
    private unitProductionQueue;
    private scoutingTargets;
    private enemies;
    private currentStrategy;
    constructor(player: Player, difficulty?: AIDifficulty);
    private createAIConfig;
    private initializeBuildOrder;
    updateGameState(gameState: GameState): void;
    private updateEnemies;
    private think;
    private updateStrategy;
    private manageEconomy;
    private manageProduction;
    private manageMilitary;
    private manageExpansion;
    private addAction;
    private executeActions;
    private getMyUnits;
    private getMyBuildings;
    private findBestResource;
    private shouldBuildHouse;
    private shouldBuild;
    private canAfford;
    private trainUnit;
    private buildBuilding;
    private findBuildPosition;
    private isPositionFree;
    private isBuildingProducing;
    private getNextMilitaryUnit;
    private findAttackTarget;
    private getBaseCenter;
    getPlayer(): Player;
    getDifficulty(): AIDifficulty;
    getCurrentStrategy(): string;
}
/**
 * Helper function to create AI players
 */
export declare function createAIPlayer(name: string, faction: Faction, difficulty?: AIDifficulty): {
    player: Player;
    ai: AIPlayer;
};
//# sourceMappingURL=AIPlayer.d.ts.map