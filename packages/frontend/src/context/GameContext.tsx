import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import toast from 'react-hot-toast'
import {
  GameRoom,
  Player,
  GameState,
  ServerMessageType,
  ClientMessageType,
  LobbyStateMessage,
  RoomStateMessage,
  GameStateUpdateMessage,
  ErrorMessage,
  ChatMessage,
  GameId
} from '@rts-engine/shared'

// State interface
interface GameContextState {
  socket: Socket | null
  connected: boolean
  currentPlayer: Player | null
  lobbyPlayers: Player[]
  availableRooms: GameRoom[]
  currentRoom: GameRoom | null
  gameState: GameState | null
  chatMessages: ChatMessage[]
  isInGame: boolean
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting'
}

// Actions
type GameAction =
  | { type: 'SET_SOCKET'; payload: Socket }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_CONNECTION_STATUS'; payload: GameContextState['connectionStatus'] }
  | { type: 'SET_CURRENT_PLAYER'; payload: Player | null }
  | { type: 'UPDATE_LOBBY_STATE'; payload: { players: Player[]; rooms: GameRoom[] } }
  | { type: 'SET_CURRENT_ROOM'; payload: GameRoom | null }
  | { type: 'UPDATE_GAME_STATE'; payload: GameState | null }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_IN_GAME'; payload: boolean }
  | { type: 'RESET_STATE' }

// Initial state
const initialState: GameContextState = {
  socket: null,
  connected: false,
  currentPlayer: null,
  lobbyPlayers: [],
  availableRooms: [],
  currentRoom: null,
  gameState: null,
  chatMessages: [],
  isInGame: false,
  connectionStatus: 'disconnected'
}

// Reducer
function gameReducer(state: GameContextState, action: GameAction): GameContextState {
  switch (action.type) {
    case 'SET_SOCKET':
      return { ...state, socket: action.payload }
    
    case 'SET_CONNECTED':
      return { ...state, connected: action.payload }
    
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload }
    
    case 'SET_CURRENT_PLAYER':
      return { ...state, currentPlayer: action.payload }
    
    case 'UPDATE_LOBBY_STATE':
      return { 
        ...state, 
        lobbyPlayers: action.payload.players,
        availableRooms: action.payload.rooms
      }
    
    case 'SET_CURRENT_ROOM':
      return { ...state, currentRoom: action.payload }
    
    case 'UPDATE_GAME_STATE':
      return { ...state, gameState: action.payload }
    
    case 'ADD_CHAT_MESSAGE':
      return { 
        ...state, 
        chatMessages: [...state.chatMessages.slice(-49), action.payload] // Keep last 50 messages
      }
    
    case 'SET_IN_GAME':
      return { ...state, isInGame: action.payload }
    
    case 'RESET_STATE':
      return { ...initialState, socket: state.socket, connected: state.connected }
    
    default:
      return state
  }
}

// Context
interface GameContextType extends GameContextState {
  // Connection methods
  connect: () => void
  disconnect: () => void
  
  // Lobby methods
  joinLobby: (playerName: string) => void
  leaveLobby: () => void
  
  // Room methods
  createRoom: (roomName: string, gameSettings: any, password?: string) => void
  joinRoom: (roomId: GameId, password?: string) => void
  leaveRoom: () => void
  startGame: () => void
  addAIPlayer: (difficulty?: 'easy' | 'medium' | 'hard') => void
  
  // Chat methods
  sendChatMessage: (message: string, channel?: 'all' | 'team') => void
  
  // Game methods
  sendPlayerAction: (action: any) => void
  requestGameState: () => void
}

const GameContext = createContext<GameContextType | null>(null)

// Provider component
interface GameProviderProps {
  children: ReactNode
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  // Socket connection
  useEffect(() => {
    const socket = io('http://localhost:3001', {
      autoConnect: false,
      transports: ['websocket', 'polling']
    })

    dispatch({ type: 'SET_SOCKET', payload: socket })

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to server')
      dispatch({ type: 'SET_CONNECTED', payload: true })
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' })
      toast.success('Połączono z serwerem')
    })

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason)
      dispatch({ type: 'SET_CONNECTED', payload: false })
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'disconnected' })
      toast.error('Rozłączono z serwerem')
    })

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'disconnected' })
      toast.error('Błąd połączenia z serwerem')
    })

    // Game events
    socket.on(ServerMessageType.LOBBY_STATE, (data: LobbyStateMessage) => {
      dispatch({
        type: 'UPDATE_LOBBY_STATE',
        payload: {
          players: data.connectedPlayers || [],
          rooms: data.availableRooms || []
        }
      })
      
      // Set current player if this is initial lobby join
      if (data.playerId && !state.currentPlayer) {
        const player = data.connectedPlayers?.find(p => p.id === data.playerId)
        if (player) {
          dispatch({ type: 'SET_CURRENT_PLAYER', payload: player })
        }
      }
    })

    socket.on(ServerMessageType.ROOM_STATE, (data: RoomStateMessage) => {
      dispatch({ type: 'SET_CURRENT_ROOM', payload: data.room })
    })

    socket.on(ServerMessageType.GAME_STARTED, (data: any) => {
      dispatch({ type: 'SET_IN_GAME', payload: true })
      if (data.gameState) {
        dispatch({ type: 'UPDATE_GAME_STATE', payload: data.gameState })
      }
      toast.success('Gra rozpoczęta!')
    })

    socket.on(ServerMessageType.GAME_STATE_UPDATE, (data: GameStateUpdateMessage) => {
      if (data.gameState) {
        dispatch({ type: 'UPDATE_GAME_STATE', payload: data.gameState })
      }
      // TODO: Handle delta updates
    })

    socket.on(ServerMessageType.CHAT_MESSAGE, (data: ChatMessage) => {
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: data })
    })

    socket.on(ServerMessageType.ERROR, (data: ErrorMessage) => {
      console.error('Server error:', data)
      toast.error(data.message || 'Błąd serwera')
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  // Methods
  const connect = () => {
    if (state.socket) {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connecting' })
      state.socket.connect()
    }
  }

  const disconnect = () => {
    if (state.socket) {
      state.socket.disconnect()
      dispatch({ type: 'RESET_STATE' })
    }
  }

  const joinLobby = (playerName: string) => {
    if (state.socket && state.connected) {
      state.socket.emit(ClientMessageType.JOIN_LOBBY, {
        type: ClientMessageType.JOIN_LOBBY,
        playerName,
        version: '1.2.0',
        timestamp: Date.now()
      })
    }
  }

  const leaveLobby = () => {
    if (state.socket && state.connected) {
      state.socket.emit(ClientMessageType.LEAVE_LOBBY)
      dispatch({ type: 'SET_CURRENT_PLAYER', payload: null })
    }
  }

  const createRoom = (roomName: string, gameSettings: any, password?: string) => {
    if (state.socket && state.connected) {
      state.socket.emit(ClientMessageType.CREATE_ROOM, {
        type: ClientMessageType.CREATE_ROOM,
        roomName,
        gameSettings,
        password,
        timestamp: Date.now()
      })
    }
  }

  const joinRoom = (roomId: GameId, password?: string) => {
    if (state.socket && state.connected) {
      state.socket.emit(ClientMessageType.JOIN_ROOM, {
        type: ClientMessageType.JOIN_ROOM,
        roomId,
        password,
        timestamp: Date.now()
      })
    }
  }

  const leaveRoom = () => {
    if (state.socket && state.connected) {
      state.socket.emit(ClientMessageType.LEAVE_ROOM)
      dispatch({ type: 'SET_CURRENT_ROOM', payload: null })
      dispatch({ type: 'SET_IN_GAME', payload: false })
    }
  }

  const startGame = () => {
    if (state.socket && state.connected) {
      state.socket.emit(ClientMessageType.START_GAME)
    }
  }

  const addAIPlayer = (difficulty?: 'easy' | 'medium' | 'hard') => {
    if (state.socket && state.connected) {
      state.socket.emit(ClientMessageType.ADD_AI_PLAYER, {
        type: ClientMessageType.ADD_AI_PLAYER,
        difficulty,
        timestamp: Date.now()
      })
    }
  }

  const sendChatMessage = (message: string, channel: 'all' | 'team' = 'all') => {
    if (state.socket && state.connected) {
      state.socket.emit(ClientMessageType.CHAT_MESSAGE, {
        type: ClientMessageType.CHAT_MESSAGE,
        message,
        channel,
        timestamp: Date.now()
      })
    }
  }

  const sendPlayerAction = (action: any) => {
    if (state.socket && state.connected) {
      state.socket.emit(ClientMessageType.PLAYER_ACTION, {
        type: ClientMessageType.PLAYER_ACTION,
        action,
        timestamp: Date.now()
      })
    }
  }

  const requestGameState = () => {
    if (state.socket && state.connected) {
      state.socket.emit(ClientMessageType.REQUEST_GAME_STATE)
    }
  }

  const contextValue: GameContextType = {
    ...state,
    connect,
    disconnect,
    joinLobby,
    leaveLobby,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    addAIPlayer,
    sendChatMessage,
    sendPlayerAction,
    requestGameState
  }

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  )
}

// Hook
export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
} 