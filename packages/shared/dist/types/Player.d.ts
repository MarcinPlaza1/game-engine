import { Faction, Position } from './GameState';
export interface Player {
    id: string;
    name: string;
    faction: Faction;
    isConnected: boolean;
    isReady: boolean;
    isHost?: boolean;
    isAI?: boolean;
    aiDifficulty?: 'easy' | 'medium' | 'hard';
    resources: Record<string, number>;
    units: string[];
    buildings: string[];
    research: string[];
    population: {
        current: number;
        max: number;
    };
    score: number;
    isEliminated: boolean;
    eliminatedAt?: number;
}
export declare enum PlayerActionType {
    MOVE_UNITS = "MOVE_UNITS",
    ATTACK_TARGET = "ATTACK_TARGET",
    PATROL = "PATROL",
    STOP = "STOP",
    HOLD_POSITION = "HOLD_POSITION",
    GATHER_RESOURCE = "GATHER_RESOURCE",
    BUILD_STRUCTURE = "BUILD_STRUCTURE",
    REPAIR = "REPAIR",
    TRAIN_UNIT = "TRAIN_UNIT",
    CANCEL_PRODUCTION = "CANCEL_PRODUCTION",
    SET_RALLY_POINT = "SET_RALLY_POINT",
    RESEARCH_TECHNOLOGY = "RESEARCH_TECHNOLOGY",
    CANCEL_RESEARCH = "CANCEL_RESEARCH"
}
export interface PlayerAction {
    type: PlayerActionType;
    playerId: string;
    timestamp: number;
    unitIds?: string[];
    targetPosition?: Position;
    targetId?: string;
    unitType?: string;
    buildingType?: string;
    buildingId?: string;
    technologyId?: string;
    rallyPoint?: Position;
    data?: any;
}
export declare function createDefaultPlayer(id: string, name: string, faction: Faction): Player;
//# sourceMappingURL=Player.d.ts.map