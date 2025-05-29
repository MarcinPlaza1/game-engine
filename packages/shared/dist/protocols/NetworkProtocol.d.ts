/**
 * Protokoły sieciowe dla komunikacji multiplayer
 */
import { GameId, GameState, Player, Position, Unit, Building, GameSettings } from '../types/GameState';
/**
 * Bazowy typ wiadomości sieciowej
 */
export interface BaseNetworkMessage {
    type: string;
    timestamp: number;
    playerId?: GameId;
    gameId?: GameId;
}
/**
 * Typy wiadomości klient -> serwer
 */
export declare enum ClientMessageType {
    JOIN_LOBBY = "join_lobby",
    LEAVE_LOBBY = "leave_lobby",
    CREATE_ROOM = "create_room",
    JOIN_ROOM = "join_room",
    LEAVE_ROOM = "leave_room",
    START_GAME = "start_game",
    ADD_AI_PLAYER = "add_ai_player",
    PLAYER_ACTION = "player_action",
    CHAT_MESSAGE = "chat_message",
    GAME_COMMAND = "game_command",
    REQUEST_GAME_STATE = "request_game_state",
    PLAYER_READY = "player_ready",
    PING = "ping"
}
/**
 * Typy wiadomości serwer -> klient
 */
export declare enum ServerMessageType {
    LOBBY_STATE = "lobby_state",
    ROOM_STATE = "room_state",
    PLAYER_JOINED = "player_joined",
    PLAYER_LEFT = "player_left",
    GAME_STARTED = "game_started",
    GAME_STATE_UPDATE = "game_state_update",
    GAME_EVENT = "game_event",
    CHAT_MESSAGE = "chat_message",
    ERROR = "error",
    CONNECTION_STATUS = "connection_status",
    PONG = "pong"
}
/**
 * Typy akcji gracza w grze
 */
export declare enum PlayerActionType {
    SELECT_UNITS = "select_units",
    DESELECT_ALL = "deselect_all",
    MOVE_UNITS = "move_units",
    ATTACK_TARGET = "attack_target",
    PATROL = "patrol",
    STOP = "stop",
    BUILD_STRUCTURE = "build_structure",
    CANCEL_CONSTRUCTION = "cancel_construction",
    TRAIN_UNIT = "train_unit",
    CANCEL_PRODUCTION = "cancel_production",
    SET_RALLY_POINT = "set_rally_point",
    GATHER_RESOURCE = "gather_resource",
    DEPOSIT_RESOURCES = "deposit_resources",
    USE_ABILITY = "use_ability",
    UPGRADE = "upgrade"
}
/**
 * Dołączenie do lobby
 */
export interface JoinLobbyMessage extends BaseNetworkMessage {
    type: ClientMessageType.JOIN_LOBBY;
    playerName: string;
    version: string;
}
/**
 * Tworzenie pokoju gry
 */
export interface CreateRoomMessage extends BaseNetworkMessage {
    type: ClientMessageType.CREATE_ROOM;
    roomName: string;
    gameSettings: GameSettings;
    password?: string;
}
/**
 * Dołączenie do pokoju
 */
export interface JoinRoomMessage extends BaseNetworkMessage {
    type: ClientMessageType.JOIN_ROOM;
    roomId: GameId;
    password?: string;
}
/**
 * Dodanie AI gracza do pokoju
 */
export interface AddAIPlayerMessage extends BaseNetworkMessage {
    type: ClientMessageType.ADD_AI_PLAYER;
    difficulty?: 'easy' | 'medium' | 'hard';
    aiName?: string;
}
/**
 * Akcja gracza w grze
 */
export interface PlayerActionMessage extends BaseNetworkMessage {
    type: ClientMessageType.PLAYER_ACTION;
    action: PlayerAction;
}
/**
 * Definicja akcji gracza
 */
export interface PlayerAction {
    actionType: PlayerActionType;
    unitIds?: GameId[];
    targetPosition?: Position;
    targetId?: GameId;
    data?: any;
}
/**
 * Komenda gry (cheats, debug, admin)
 */
export interface GameCommandMessage extends BaseNetworkMessage {
    type: ClientMessageType.GAME_COMMAND;
    command: string;
    args?: string[];
}
/**
 * Wiadomość czatu
 */
export interface ChatMessage extends BaseNetworkMessage {
    type: ClientMessageType.CHAT_MESSAGE | ServerMessageType.CHAT_MESSAGE;
    message: string;
    channel: ChatChannel;
    recipientId?: GameId;
}
/**
 * Kanały czatu
 */
export declare enum ChatChannel {
    ALL = "all",
    TEAM = "team",
    PRIVATE = "private",
    SYSTEM = "system"
}
/**
 * Stan lobby
 */
export interface LobbyStateMessage extends BaseNetworkMessage {
    type: ServerMessageType.LOBBY_STATE;
    connectedPlayers: Player[];
    availableRooms: GameRoom[];
}
/**
 * Pokój gry
 */
export interface GameRoom {
    id: GameId;
    name: string;
    createdBy: GameId;
    players: Player[];
    maxPlayers: number;
    hasPassword: boolean;
    password?: string;
    gameSettings: GameSettings;
    status: 'waiting' | 'starting' | 'in_progress';
    createdAt?: number;
}
/**
 * Stan pokoju
 */
export interface RoomStateMessage extends BaseNetworkMessage {
    type: ServerMessageType.ROOM_STATE;
    room: GameRoom;
}
/**
 * Aktualizacja stanu gry
 */
export interface GameStateUpdateMessage extends BaseNetworkMessage {
    type: ServerMessageType.GAME_STATE_UPDATE;
    gameState?: GameState;
    deltaUpdate?: GameStateDelta;
}
/**
 * Delta update - tylko zmiany w stanie gry
 */
export interface GameStateDelta {
    gameTime: number;
    unitsChanged?: Unit[];
    buildingsChanged?: Building[];
    playersChanged?: Player[];
    unitsRemoved?: GameId[];
    buildingsRemoved?: GameId[];
    mapChanges?: any;
    gameStatus?: any;
}
/**
 * Event gry
 */
export interface GameEventMessage extends BaseNetworkMessage {
    type: ServerMessageType.GAME_EVENT;
    event: GameEvent;
}
/**
 * Typy eventów gry
 */
export declare enum GameEventType {
    UNIT_CREATED = "unit_created",
    UNIT_DESTROYED = "unit_destroyed",
    BUILDING_COMPLETED = "building_completed",
    BUILDING_DESTROYED = "building_destroyed",
    PLAYER_DEFEATED = "player_defeated",
    RESOURCE_GATHERED = "resource_gathered",
    BATTLE_STARTED = "battle_started",
    UPGRADE_COMPLETED = "upgrade_completed",
    GAME_ENDED = "game_ended"
}
/**
 * Event gry
 */
export interface GameEvent {
    eventType: GameEventType;
    timestamp: number;
    playerId?: GameId;
    position?: Position;
    data?: any;
    message?: string;
}
/**
 * Wiadomość błędu
 */
export interface ErrorMessage extends BaseNetworkMessage {
    type: ServerMessageType.ERROR;
    errorCode: string;
    message: string;
    details?: any;
}
/**
 * Status połączenia
 */
export interface ConnectionStatusMessage extends BaseNetworkMessage {
    type: ServerMessageType.CONNECTION_STATUS;
    status: 'connected' | 'disconnected' | 'reconnecting';
    ping?: number;
    playersOnline?: number;
}
/**
 * Wszystkie wiadomości od klienta
 */
export type ClientMessage = JoinLobbyMessage | CreateRoomMessage | JoinRoomMessage | AddAIPlayerMessage | PlayerActionMessage | GameCommandMessage | ChatMessage | BaseNetworkMessage;
/**
 * Wszystkie wiadomości od serwera
 */
export type ServerMessage = LobbyStateMessage | RoomStateMessage | GameStateUpdateMessage | GameEventMessage | ChatMessage | ErrorMessage | ConnectionStatusMessage | BaseNetworkMessage;
/**
 * Wszystkie wiadomości sieciowe
 */
export type NetworkMessage = ClientMessage | ServerMessage;
/**
 * Tworzy bazową wiadomość
 */
export declare function createBaseMessage(type: string, playerId?: GameId, gameId?: GameId): BaseNetworkMessage;
/**
 * Sprawdza typ wiadomości
 */
export declare function isClientMessage(message: NetworkMessage): message is ClientMessage;
/**
 * Sprawdza typ wiadomości
 */
export declare function isServerMessage(message: NetworkMessage): message is ServerMessage;
/**
 * Waliduje wiadomość sieciową
 */
export declare function validateNetworkMessage(message: any): message is NetworkMessage;
//# sourceMappingURL=NetworkProtocol.d.ts.map