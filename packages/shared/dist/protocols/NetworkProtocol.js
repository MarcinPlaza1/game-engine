/**
 * Protokoły sieciowe dla komunikacji multiplayer
 */
/**
 * Typy wiadomości klient -> serwer
 */
export var ClientMessageType;
(function (ClientMessageType) {
    // Lobby & Room management
    ClientMessageType["JOIN_LOBBY"] = "join_lobby";
    ClientMessageType["LEAVE_LOBBY"] = "leave_lobby";
    ClientMessageType["CREATE_ROOM"] = "create_room";
    ClientMessageType["JOIN_ROOM"] = "join_room";
    ClientMessageType["LEAVE_ROOM"] = "leave_room";
    ClientMessageType["START_GAME"] = "start_game";
    ClientMessageType["ADD_AI_PLAYER"] = "add_ai_player";
    // Game actions
    ClientMessageType["PLAYER_ACTION"] = "player_action";
    ClientMessageType["CHAT_MESSAGE"] = "chat_message";
    ClientMessageType["GAME_COMMAND"] = "game_command";
    // Synchronization
    ClientMessageType["REQUEST_GAME_STATE"] = "request_game_state";
    ClientMessageType["PLAYER_READY"] = "player_ready";
    ClientMessageType["PING"] = "ping";
})(ClientMessageType || (ClientMessageType = {}));
/**
 * Typy wiadomości serwer -> klient
 */
export var ServerMessageType;
(function (ServerMessageType) {
    // Lobby & Room updates
    ServerMessageType["LOBBY_STATE"] = "lobby_state";
    ServerMessageType["ROOM_STATE"] = "room_state";
    ServerMessageType["PLAYER_JOINED"] = "player_joined";
    ServerMessageType["PLAYER_LEFT"] = "player_left";
    ServerMessageType["GAME_STARTED"] = "game_started";
    // Game updates
    ServerMessageType["GAME_STATE_UPDATE"] = "game_state_update";
    ServerMessageType["GAME_EVENT"] = "game_event";
    ServerMessageType["CHAT_MESSAGE"] = "chat_message";
    // Errors & Status
    ServerMessageType["ERROR"] = "error";
    ServerMessageType["CONNECTION_STATUS"] = "connection_status";
    ServerMessageType["PONG"] = "pong";
})(ServerMessageType || (ServerMessageType = {}));
/**
 * Typy akcji gracza w grze
 */
export var PlayerActionType;
(function (PlayerActionType) {
    // Selekcja
    PlayerActionType["SELECT_UNITS"] = "select_units";
    PlayerActionType["DESELECT_ALL"] = "deselect_all";
    // Ruch i pathfinding
    PlayerActionType["MOVE_UNITS"] = "move_units";
    PlayerActionType["ATTACK_TARGET"] = "attack_target";
    PlayerActionType["PATROL"] = "patrol";
    PlayerActionType["STOP"] = "stop";
    // Budowanie
    PlayerActionType["BUILD_STRUCTURE"] = "build_structure";
    PlayerActionType["CANCEL_CONSTRUCTION"] = "cancel_construction";
    // Produkcja
    PlayerActionType["TRAIN_UNIT"] = "train_unit";
    PlayerActionType["CANCEL_PRODUCTION"] = "cancel_production";
    PlayerActionType["SET_RALLY_POINT"] = "set_rally_point";
    // Zasoby
    PlayerActionType["GATHER_RESOURCE"] = "gather_resource";
    PlayerActionType["DEPOSIT_RESOURCES"] = "deposit_resources";
    // Inne
    PlayerActionType["USE_ABILITY"] = "use_ability";
    PlayerActionType["UPGRADE"] = "upgrade";
})(PlayerActionType || (PlayerActionType = {}));
/**
 * Kanały czatu
 */
export var ChatChannel;
(function (ChatChannel) {
    ChatChannel["ALL"] = "all";
    ChatChannel["TEAM"] = "team";
    ChatChannel["PRIVATE"] = "private";
    ChatChannel["SYSTEM"] = "system";
})(ChatChannel || (ChatChannel = {}));
/**
 * Typy eventów gry
 */
export var GameEventType;
(function (GameEventType) {
    GameEventType["UNIT_CREATED"] = "unit_created";
    GameEventType["UNIT_DESTROYED"] = "unit_destroyed";
    GameEventType["BUILDING_COMPLETED"] = "building_completed";
    GameEventType["BUILDING_DESTROYED"] = "building_destroyed";
    GameEventType["PLAYER_DEFEATED"] = "player_defeated";
    GameEventType["RESOURCE_GATHERED"] = "resource_gathered";
    GameEventType["BATTLE_STARTED"] = "battle_started";
    GameEventType["UPGRADE_COMPLETED"] = "upgrade_completed";
    GameEventType["GAME_ENDED"] = "game_ended";
})(GameEventType || (GameEventType = {}));
// === UTILITY FUNCTIONS ===
/**
 * Tworzy bazową wiadomość
 */
export function createBaseMessage(type, playerId, gameId) {
    return {
        type,
        timestamp: Date.now(),
        playerId,
        gameId
    };
}
/**
 * Sprawdza typ wiadomości
 */
export function isClientMessage(message) {
    return Object.values(ClientMessageType).includes(message.type);
}
/**
 * Sprawdza typ wiadomości
 */
export function isServerMessage(message) {
    return Object.values(ServerMessageType).includes(message.type);
}
/**
 * Waliduje wiadomość sieciową
 */
export function validateNetworkMessage(message) {
    return (typeof message === 'object' &&
        typeof message.type === 'string' &&
        typeof message.timestamp === 'number');
}
//# sourceMappingURL=NetworkProtocol.js.map