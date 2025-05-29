import { Faction, Position } from './GameState'

export interface Player {
  id: string
  name: string
  faction: Faction
  isConnected: boolean
  isReady: boolean
  isHost?: boolean
  // AI properties
  isAI?: boolean
  aiDifficulty?: 'easy' | 'medium' | 'hard'
  
  // Game-specific data
  resources: Record<string, number>
  units: string[]  // Unit IDs
  buildings: string[]  // Building IDs
  research: string[]  // Research IDs
  population: {
    current: number
    max: number
  }
  
  // Stats
  score: number
  isEliminated: boolean
  eliminatedAt?: number
}

export enum PlayerActionType {
  // Unit actions
  MOVE_UNITS = 'MOVE_UNITS',
  ATTACK_TARGET = 'ATTACK_TARGET',
  PATROL = 'PATROL',
  STOP = 'STOP',
  HOLD_POSITION = 'HOLD_POSITION',
  
  // Worker actions
  GATHER_RESOURCE = 'GATHER_RESOURCE',
  BUILD_STRUCTURE = 'BUILD_STRUCTURE',
  REPAIR = 'REPAIR',
  
  // Production actions
  TRAIN_UNIT = 'TRAIN_UNIT',
  CANCEL_PRODUCTION = 'CANCEL_PRODUCTION',
  SET_RALLY_POINT = 'SET_RALLY_POINT',
  
  // Research actions
  RESEARCH_TECHNOLOGY = 'RESEARCH_TECHNOLOGY',
  CANCEL_RESEARCH = 'CANCEL_RESEARCH'
}

export interface PlayerAction {
  type: PlayerActionType
  playerId: string
  timestamp: number
  
  // Common parameters
  unitIds?: string[]
  targetPosition?: Position
  targetId?: string
  
  // Specific parameters
  unitType?: string
  buildingType?: string
  buildingId?: string
  technologyId?: string
  rallyPoint?: Position
  
  // Additional data
  data?: any
}

export function createDefaultPlayer(id: string, name: string, faction: Faction): Player {
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
  }
} 