import { EventEmitter } from 'events'
import {
  GameRoom,
  GameSettings,
  Player,
  GameState,
  GameId,
  Faction,
  FACTION_COLORS,
  createDefaultPlayer,
  generateGameId
} from '@rts-engine/shared'
import { GameInstance } from './GameInstance.js'
import { AIPlayer, createAIPlayer, AIDifficulty } from './AIPlayer.js'
import { logger } from '../utils/Logger.js'

export interface GameRoomData {
  room: GameRoom
  gameInstance?: GameInstance
  aiPlayers: Map<string, AIPlayer>
  lastActivity: number
}

export class GameRoomManager extends EventEmitter {
  private rooms = new Map<GameId, GameRoomData>()
  private playerRooms = new Map<string, GameId>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    super()
    
    // Cleanup nieaktywnych pokoi co 5 minut
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveRooms()
    }, 5 * 60 * 1000)
  }

  public createRoom(
    hostPlayer: Player,
    roomName: string,
    gameSettings: GameSettings,
    password?: string
  ): GameRoom {
    const roomId = generateGameId()
    
    const room: GameRoom = {
      id: roomId,
      name: roomName,
      createdBy: hostPlayer.id,
      players: [hostPlayer],
      maxPlayers: gameSettings.maxPlayers,
      gameSettings,
      status: 'waiting',
      hasPassword: !!password,
      password,
      createdAt: Date.now()
    }

    const roomData: GameRoomData = {
      room,
      aiPlayers: new Map(),
      lastActivity: Date.now()
    }

    this.rooms.set(roomId, roomData)
    this.playerRooms.set(hostPlayer.id, roomId)

    // Automatycznie dodaj AI playerów jeśli potrzeba
    this.maybeAddAIPlayers(roomId)

    logger.info(`Room created: ${roomName} (${roomId}) by ${hostPlayer.name}`)
    this.emit('roomCreated', room)

    return room
  }

  public joinRoom(player: Player, roomId: GameId, password?: string): boolean {
    const roomData = this.rooms.get(roomId)
    if (!roomData) return false

    const room = roomData.room
    
    // Sprawdzenia
    if (room.status !== 'waiting') return false
    if (room.players.length >= room.maxPlayers) return false
    if (room.hasPassword && room.password !== password) return false
    if (room.players.some(p => p.id === player.id)) return false

    // Dodaj gracza
    room.players.push(player)
    this.playerRooms.set(player.id, roomId)
    roomData.lastActivity = Date.now()

    logger.info(`Player ${player.name} joined room ${room.name}`)
    this.emit('roomUpdated', room)

    return true
  }

  public leaveRoom(playerId: string): boolean {
    const roomId = this.playerRooms.get(playerId)
    if (!roomId) return false

    const roomData = this.rooms.get(roomId)
    if (!roomData) return false

    const room = roomData.room
    const playerIndex = room.players.findIndex(p => p.id === playerId)
    if (playerIndex === -1) return false

    // Usuń gracza
    room.players.splice(playerIndex, 1)
    this.playerRooms.delete(playerId)
    roomData.lastActivity = Date.now()

    // Jeśli pokój jest pusty lub host wyszedł
    if (room.players.length === 0 || room.createdBy === playerId) {
      this.removeRoom(roomId)
      return true
    }

    // Jeśli host wyszedł, przekaż host następnemu graczowi
    if (room.createdBy === playerId && room.players.length > 0) {
      room.createdBy = room.players[0].id
    }

    // Dodaj AI jeśli potrzeba
    this.maybeAddAIPlayers(roomId)

    logger.info(`Player left room ${room.name}`)
    this.emit('roomUpdated', room)

    return true
  }

  public addAIPlayer(roomId: GameId, aiName?: string, difficulty: AIDifficulty = AIDifficulty.MEDIUM): boolean {
    const roomData = this.rooms.get(roomId)
    if (!roomData) return false

    const room = roomData.room
    if (room.players.length >= room.maxPlayers) return false
    if (room.status !== 'waiting') return false

    // Wybierz dostępną fakcję
    const usedFactions = room.players.map(p => p.faction)
    const availableFactions = Object.values(Faction).filter(f => !usedFactions.includes(f))
    
    if (availableFactions.length === 0) {
      // Użyj losowej fakcji jeśli wszystkie zajęte
      availableFactions.push(Object.values(Faction)[Math.floor(Math.random() * Object.values(Faction).length)])
    }

    const faction = availableFactions[0]
    const name = aiName || this.generateAIName(difficulty)

    // Utwórz AI player
    const { player, ai } = createAIPlayer(name, faction, difficulty)
    
    // Dodaj do pokoju
    room.players.push(player)
    roomData.aiPlayers.set(player.id, ai)
    roomData.lastActivity = Date.now()

    // Nasłuchuj akcji AI
    ai.on('action', (actionData) => {
      this.handleAIAction(roomId, actionData)
    })

    logger.info(`AI player ${name} (${difficulty}) added to room ${room.name}`)
    this.emit('roomUpdated', room)

    return true
  }

  public removeAIPlayer(roomId: GameId, aiPlayerId: string): boolean {
    const roomData = this.rooms.get(roomId)
    if (!roomData) return false

    const room = roomData.room
    const playerIndex = room.players.findIndex(p => p.id === aiPlayerId && p.isAI)
    if (playerIndex === -1) return false

    // Usuń AI z pokoju
    const aiPlayer = room.players[playerIndex]
    room.players.splice(playerIndex, 1)
    
    // Usuń AI instance
    const ai = roomData.aiPlayers.get(aiPlayerId)
    if (ai) {
      ai.removeAllListeners()
      roomData.aiPlayers.delete(aiPlayerId)
    }

    roomData.lastActivity = Date.now()

    logger.info(`AI player ${aiPlayer.name} removed from room ${room.name}`)
    this.emit('roomUpdated', room)

    return true
  }

  public startGame(roomId: GameId, hostPlayerId: string): boolean {
    const roomData = this.rooms.get(roomId)
    if (!roomData) return false

    const room = roomData.room
    if (room.createdBy !== hostPlayerId) return false
    if (room.status !== 'waiting') return false
    if (room.players.length < 2) return false

    // Utwórz game instance
    const gameInstance = new GameInstance(generateGameId(), room.players, room.gameSettings)
    roomData.gameInstance = gameInstance

    // Rozpocznij grę
    room.status = 'in_progress'

    // Aktualizuj AI o stanie gry
    this.updateAIGameState(roomId)

    // Uruchom tick loop dla AI
    this.startAILoop(roomId)

    logger.info(`Game started in room ${room.name}`)
    this.emit('gameStarted', { room, gameState: gameInstance.getGameState() })

    return true
  }

  public handlePlayerAction(roomId: GameId, playerId: string, action: any): boolean {
    const roomData = this.rooms.get(roomId)
    if (!roomData?.gameInstance) return false

    const room = roomData.room
    if (room.status !== 'in_progress') return false

    // Sprawdź czy gracz należy do pokoju
    if (!room.players.some(p => p.id === playerId)) return false

    // Przekaż akcję do game instance
    const success = roomData.gameInstance.addPlayerAction(playerId, action)
    
    if (success) {
      // Aktualizuj AI o nowym stanie gry
      this.updateAIGameState(roomId)
      
      // Emit game state update
      this.emit('gameUpdated', {
        roomId,
        gameState: roomData.gameInstance.getGameState()
      })
    }

    return success
  }

  private handleAIAction(roomId: GameId, actionData: { playerId: string; action: any }): void {
    const roomData = this.rooms.get(roomId)
    if (!roomData?.gameInstance) return

    // Przekaż akcję AI do game instance
    const success = roomData.gameInstance.addPlayerAction(actionData.playerId, actionData.action)
    
    if (success) {
      // Emit game state update
      this.emit('gameUpdated', {
        roomId,
        gameState: roomData.gameInstance.getGameState()
      })
    }
  }

  private maybeAddAIPlayers(roomId: GameId): void {
    const roomData = this.rooms.get(roomId)
    if (!roomData) return

    const room = roomData.room
    const humanPlayers = room.players.filter(p => !p.isAI).length
    
    // Dodaj AI playerów jeśli jest za mało graczy
    if (humanPlayers === 1 && room.players.length < room.maxPlayers) {
      // Dodaj przynajmniej jednego AI żeby można było rozpocząć grę
      const aiCount = Math.min(2, room.maxPlayers - room.players.length)
      
      for (let i = 0; i < aiCount; i++) {
        const difficulty = this.getRandomDifficulty()
        this.addAIPlayer(roomId, undefined, difficulty)
      }
    }
  }

  private updateAIGameState(roomId: GameId): void {
    const roomData = this.rooms.get(roomId)
    if (!roomData?.gameInstance) return

    const gameState = roomData.gameInstance.getGameState()
    
    // Aktualizuj wszystkich AI o nowym stanie gry
    for (const ai of roomData.aiPlayers.values()) {
      ai.updateGameState(gameState)
    }
  }

  private startAILoop(roomId: GameId): void {
    const roomData = this.rooms.get(roomId)
    if (!roomData) return

    // AI loop - aktualizuj AI co 500ms
    const loopFunction = () => {
      const currentRoomData = this.rooms.get(roomId)
      if (!currentRoomData?.gameInstance || currentRoomData.room.status !== 'in_progress') {
        return
      }

      // Aktualizuj AI
      this.updateAIGameState(roomId)
      
      // Zaplanuj następną iterację
      setTimeout(loopFunction, 500)
    }

    // Rozpocznij pętlę
    setTimeout(loopFunction, 500)
  }

  private generateAIName(difficulty: AIDifficulty): string {
    const easyNames = ['Bot Początkujący', 'AI Nowicjusz', 'Prosty Bot']
    const mediumNames = ['AI Wojownik', 'Bot Strategiczny', 'Średni Przeciwnik']
    const hardNames = ['AI Mistrz', 'Bot Ekspert', 'Trudny Przeciwnik', 'AI Komandor']

    let names: string[]
    switch (difficulty) {
      case AIDifficulty.EASY:
        names = easyNames
        break
      case AIDifficulty.MEDIUM:
        names = mediumNames
        break
      case AIDifficulty.HARD:
        names = hardNames
        break
      default:
        names = mediumNames
    }

    return names[Math.floor(Math.random() * names.length)]
  }

  private getRandomDifficulty(): AIDifficulty {
    const difficulties = [AIDifficulty.EASY, AIDifficulty.MEDIUM, AIDifficulty.HARD]
    const weights = [0.4, 0.4, 0.2] // 40% easy, 40% medium, 20% hard
    
    const random = Math.random()
    let weightSum = 0
    
    for (let i = 0; i < difficulties.length; i++) {
      weightSum += weights[i]
      if (random <= weightSum) {
        return difficulties[i]
      }
    }
    
    return AIDifficulty.MEDIUM
  }

  private cleanupInactiveRooms(): void {
    const now = Date.now()
    const INACTIVE_TIMEOUT = 30 * 60 * 1000 // 30 minut

    for (const [roomId, roomData] of this.rooms.entries()) {
      if (now - roomData.lastActivity > INACTIVE_TIMEOUT) {
        logger.info(`Cleaning up inactive room: ${roomData.room.name}`)
        this.removeRoom(roomId)
      }
    }
  }

  private removeRoom(roomId: GameId): void {
    const roomData = this.rooms.get(roomId)
    if (!roomData) return

    // Cleanup AI
    for (const ai of roomData.aiPlayers.values()) {
      ai.removeAllListeners()
    }
    roomData.aiPlayers.clear()

    // Cleanup intervals
    if ((roomData as any).aiInterval) {
      clearInterval((roomData as any).aiInterval)
    }

    // Usuń playerów z mapy
    for (const player of roomData.room.players) {
      this.playerRooms.delete(player.id)
    }

    // Usuń pokój
    this.rooms.delete(roomId)
    this.emit('roomRemoved', roomId)
  }

  // Getters
  public getRoom(roomId: GameId): GameRoom | null {
    return this.rooms.get(roomId)?.room || null
  }

  public getAllRooms(): GameRoom[] {
    return Array.from(this.rooms.values()).map(data => data.room)
  }

  public getPlayerRoom(playerId: string): GameRoom | null {
    const roomId = this.playerRooms.get(playerId)
    return roomId ? this.getRoom(roomId) : null
  }

  public getGameState(roomId: GameId): GameState | null {
    const roomData = this.rooms.get(roomId)
    return roomData?.gameInstance?.getGameState() || null
  }

  public getAIPlayers(roomId: GameId): AIPlayer[] {
    const roomData = this.rooms.get(roomId)
    return roomData ? Array.from(roomData.aiPlayers.values()) : []
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    // Cleanup wszystkich pokoi
    for (const roomId of this.rooms.keys()) {
      this.removeRoom(roomId)
    }
  }
} 