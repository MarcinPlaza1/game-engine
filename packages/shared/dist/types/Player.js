export var PlayerActionType;
(function (PlayerActionType) {
    // Unit actions
    PlayerActionType["MOVE_UNITS"] = "MOVE_UNITS";
    PlayerActionType["ATTACK_TARGET"] = "ATTACK_TARGET";
    PlayerActionType["PATROL"] = "PATROL";
    PlayerActionType["STOP"] = "STOP";
    PlayerActionType["HOLD_POSITION"] = "HOLD_POSITION";
    // Worker actions
    PlayerActionType["GATHER_RESOURCE"] = "GATHER_RESOURCE";
    PlayerActionType["BUILD_STRUCTURE"] = "BUILD_STRUCTURE";
    PlayerActionType["REPAIR"] = "REPAIR";
    // Production actions
    PlayerActionType["TRAIN_UNIT"] = "TRAIN_UNIT";
    PlayerActionType["CANCEL_PRODUCTION"] = "CANCEL_PRODUCTION";
    PlayerActionType["SET_RALLY_POINT"] = "SET_RALLY_POINT";
    // Research actions
    PlayerActionType["RESEARCH_TECHNOLOGY"] = "RESEARCH_TECHNOLOGY";
    PlayerActionType["CANCEL_RESEARCH"] = "CANCEL_RESEARCH";
})(PlayerActionType || (PlayerActionType = {}));
export function createDefaultPlayer(id, name, faction) {
    return {
        id,
        name,
        faction,
        isConnected: true,
        isReady: false,
        isAI: false,
        resources: {
            gold: 500,
            wood: 250,
            stone: 100,
            food: 200,
            energy: 50
        },
        units: [],
        buildings: [],
        research: [],
        population: {
            current: 0,
            max: 10
        },
        score: 0,
        isEliminated: false
    };
}
//# sourceMappingURL=Player.js.map