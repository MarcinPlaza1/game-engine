/**
 * AI Player - Sztuczna inteligencja dla RTS Game Engine
 */

import { EventEmitter } from 'events'
import {
  Player,
  GameState,
  Unit,
  Building,
  Position,
  UnitType,
  BuildingType,
  ResourceType,
  Faction,
  PlayerActionType,
  generateGameId,
  createDefaultPlayer,
  hasEnoughResources,
  DEFAULT_UNIT_COSTS,
  DEFAULT_BUILDING_COSTS
} from '@rts-engine/shared'

export enum AIDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export interface AIConfig {
  difficulty: AIDifficulty
  updateInterval: number // ms
  aggressiveness: number // 0-1
  economyFocus: number // 0-1
  militaryFocus: number // 0-1
}

export interface AIAction {
  type: PlayerActionType
  unitIds?: string[]
  targetPosition?: Position
  targetId?: string
  unitType?: UnitType
  buildingType?: BuildingType
  buildingId?: string
  data?: any
}

export class AIPlayer extends EventEmitter {
  private player: Player
  private config: AIConfig
  private gameState: GameState | null = null
  private lastUpdate: number = 0
  private actionQueue: AIAction[] = []
  
  // AI state
  private buildOrder: BuildingType[] = []
  private unitProductionQueue: UnitType[] = []
  private scoutingTargets: Position[] = []
  private enemies: Player[] = []
  private currentStrategy: 'economy' | 'military' | 'expansion' = 'economy'

  constructor(player: Player, difficulty: AIDifficulty = AIDifficulty.MEDIUM) {
    super()
    this.player = player
    this.config = this.createAIConfig(difficulty)
    this.initializeBuildOrder()
  }

  private createAIConfig(difficulty: AIDifficulty): AIConfig {
    switch (difficulty) {
      case AIDifficulty.EASY:
        return {
          difficulty,
          updateInterval: 2000, // 2s
          aggressiveness: 0.3,
          economyFocus: 0.8,
          militaryFocus: 0.2
        }
      case AIDifficulty.MEDIUM:
        return {
          difficulty,
          updateInterval: 1500, // 1.5s
          aggressiveness: 0.5,
          economyFocus: 0.6,
          militaryFocus: 0.4
        }
      case AIDifficulty.HARD:
        return {
          difficulty,
          updateInterval: 1000, // 1s
          aggressiveness: 0.8,
          economyFocus: 0.4,
          militaryFocus: 0.6
        }
      default:
        return this.createAIConfig(AIDifficulty.MEDIUM)
    }
  }

  private initializeBuildOrder(): void {
    // Podstawowa kolejność budowania
    this.buildOrder = [
      BuildingType.HOUSE,
      BuildingType.FARM,
      BuildingType.BARRACKS,
      BuildingType.HOUSE,
      BuildingType.LUMBER_MILL,
      BuildingType.MINE,
      BuildingType.TOWER
    ]

    this.unitProductionQueue = [
      UnitType.WORKER,
      UnitType.WORKER,
      UnitType.WARRIOR,
      UnitType.WORKER,
      UnitType.ARCHER,
      UnitType.WARRIOR,
      UnitType.ARCHER
    ]
  }

  public updateGameState(gameState: GameState): void {
    this.gameState = gameState
    this.updateEnemies()
    
    const now = Date.now()
    if (now - this.lastUpdate >= this.config.updateInterval) {
      this.think()
      this.lastUpdate = now
    }
  }

  private updateEnemies(): void {
    if (!this.gameState) return
    
    this.enemies = this.gameState.players.filter(p => 
      p.id !== this.player.id && !p.isAI
    )
  }

  private think(): void {
    if (!this.gameState) return

    try {
      // Aktualizuj strategię
      this.updateStrategy()
      
      // Wykonuj akcje w kolejności priorytetów
      this.manageEconomy()
      this.manageProduction()
      this.manageMilitary()
      this.manageExpansion()
      
      // Wykonaj akcje z kolejki
      this.executeActions()
    } catch (error) {
      console.error(`AI Error for player ${this.player.id}:`, error)
    }
  }

  private updateStrategy(): void {
    if (!this.gameState) return

    const myUnits = this.getMyUnits()
    const myBuildings = this.getMyBuildings()
    const workers = myUnits.filter(u => u.type === UnitType.WORKER)
    const military = myUnits.filter(u => u.type !== UnitType.WORKER)

    // Zmień strategię na podstawie stanu gry
    if (workers.length < 5) {
      this.currentStrategy = 'economy'
    } else if (military.length < 3) {
      this.currentStrategy = 'military'
    } else if (myBuildings.length < 6) {
      this.currentStrategy = 'expansion'
    } else {
      // Losowa strategia dla różnorodności
      const strategies: Array<typeof this.currentStrategy> = ['economy', 'military', 'expansion']
      this.currentStrategy = strategies[Math.floor(Math.random() * strategies.length)]
    }
  }

  private manageEconomy(): void {
    const workers = this.getMyUnits().filter(u => u.type === UnitType.WORKER)
    const idleWorkers = workers.filter(u => !u.currentAction || u.currentAction === 'idle')

    // Przypisz pracowników do zbierania zasobów
    for (const worker of idleWorkers) {
      const resourceToGather = this.findBestResource(worker.position)
      if (resourceToGather) {
        this.addAction({
          type: PlayerActionType.GATHER_RESOURCE,
          unitIds: [worker.id],
          targetId: resourceToGather.id
        })
      }
    }

    // Buduj domy gdy populacja jest bliska limitu
    const playerData = this.gameState?.players.find(p => p.id === this.player.id)
    if (playerData && this.shouldBuildHouse()) {
      this.buildBuilding(BuildingType.HOUSE)
    }
  }

  private manageProduction(): void {
    if (!this.gameState) return

    const townHalls = this.getMyBuildings().filter(b => b.type === BuildingType.TOWN_HALL)
    const barracks = this.getMyBuildings().filter(b => b.type === BuildingType.BARRACKS)

    // Produkuj pracowników
    for (const townHall of townHalls) {
      if (this.canAfford(UnitType.WORKER) && !this.isBuildingProducing(townHall)) {
        this.trainUnit(townHall.id, UnitType.WORKER)
      }
    }

    // Produkuj jednostki wojskowe
    for (const barrack of barracks) {
      if (!this.isBuildingProducing(barrack)) {
        const unitType = this.getNextMilitaryUnit()
        if (unitType && this.canAfford(unitType)) {
          this.trainUnit(barrack.id, unitType)
        }
      }
    }

    // Buduj struktury z kolejki
    if (this.buildOrder.length > 0) {
      const nextBuilding = this.buildOrder[0]
      if (this.canAfford(nextBuilding) && this.shouldBuild(nextBuilding)) {
        this.buildBuilding(nextBuilding)
        this.buildOrder.shift()
      }
    }
  }

  private manageMilitary(): void {
    const militaryUnits = this.getMyUnits().filter(u => 
      u.type !== UnitType.WORKER && 
      (!u.currentAction || u.currentAction === 'idle')
    )

    if (militaryUnits.length === 0) return

    // Grupa jednostki w armię
    const army = militaryUnits.slice(0, Math.min(5, militaryUnits.length))
    
    if (this.currentStrategy === 'military' && this.config.aggressiveness > 0.5) {
      // Znajdź cel do ataku
      const target = this.findAttackTarget()
      if (target) {
        this.addAction({
          type: PlayerActionType.ATTACK_TARGET,
          unitIds: army.map(u => u.id),
          targetId: target.id
        })
        return
      }
    }

    // Patrol lub pozycja obronna
    const centerPosition = this.getBaseCenter()
    if (centerPosition) {
      this.addAction({
        type: PlayerActionType.PATROL,
        unitIds: army.map(u => u.id),
        targetPosition: {
          x: centerPosition.x + (Math.random() - 0.5) * 10,
          y: centerPosition.y + (Math.random() - 0.5) * 10
        }
      })
    }
  }

  private manageExpansion(): void {
    // TODO: Logika ekspansji - nowe bazy, punkty zasobów
  }

  private addAction(action: AIAction): void {
    this.actionQueue.push(action)
  }

  private executeActions(): void {
    for (const action of this.actionQueue) {
      this.emit('action', {
        playerId: this.player.id,
        action
      })
    }
    this.actionQueue = []
  }

  // Helper methods
  private getMyUnits(): Unit[] {
    if (!this.gameState) return []
    return this.gameState.units.filter(u => u.playerId === this.player.id)
  }

  private getMyBuildings(): Building[] {
    if (!this.gameState) return []
    return this.gameState.buildings.filter(b => b.playerId === this.player.id)
  }

  private findBestResource(workerPosition: Position): any {
    if (!this.gameState?.map?.resources) return null

    // Znajdź najbliższy zasób
    let bestResource = null
    let bestDistance = Infinity

    for (const resource of this.gameState.map.resources) {
      if (resource.isExhausted) continue
      
      const distance = Math.sqrt(
        Math.pow(resource.position.x - workerPosition.x, 2) +
        Math.pow(resource.position.y - workerPosition.y, 2)
      )

      if (distance < bestDistance) {
        bestDistance = distance
        bestResource = resource
      }
    }

    return bestResource
  }

  private shouldBuildHouse(): boolean {
    const houses = this.getMyBuildings().filter(b => b.type === BuildingType.HOUSE)
    const myUnits = this.getMyUnits()
    return myUnits.length >= houses.length * 4 + 3 // Każdy dom +4 populacji
  }

  private shouldBuild(buildingType: BuildingType): boolean {
    const existing = this.getMyBuildings().filter(b => b.type === buildingType)
    
    switch (buildingType) {
      case BuildingType.HOUSE:
        return this.shouldBuildHouse()
      case BuildingType.FARM:
        return existing.length < 2
      case BuildingType.BARRACKS:
        return existing.length < 1
      case BuildingType.LUMBER_MILL:
        return existing.length < 1
      case BuildingType.MINE:
        return existing.length < 1
      default:
        return existing.length < 1
    }
  }

  private canAfford(target: UnitType | BuildingType): boolean {
    if (!this.gameState) return false
    
    const playerData = this.gameState.players.find(p => p.id === this.player.id)
    if (!playerData) return false

    const costs = DEFAULT_UNIT_COSTS[target as UnitType] || DEFAULT_BUILDING_COSTS[target as BuildingType]
    return hasEnoughResources(playerData.resources, costs)
  }

  private trainUnit(buildingId: string, unitType: UnitType): void {
    this.addAction({
      type: PlayerActionType.TRAIN_UNIT,
      buildingId,
      unitType
    })
  }

  private buildBuilding(buildingType: BuildingType): void {
    const builders = this.getMyUnits().filter(u => 
      u.type === UnitType.WORKER && 
      (!u.currentAction || u.currentAction === 'idle')
    )

    if (builders.length > 0) {
      const builder = builders[0]
      const buildPosition = this.findBuildPosition(builder.position)
      
      if (buildPosition) {
        this.addAction({
          type: PlayerActionType.BUILD_STRUCTURE,
          unitIds: [builder.id],
          buildingType,
          targetPosition: buildPosition
        })
      }
    }
  }

  private findBuildPosition(nearPosition: Position): Position | null {
    // Znajdź wolne miejsce do budowy w pobliżu
    for (let radius = 2; radius <= 8; radius++) {
      for (let angle = 0; angle < 360; angle += 45) {
        const x = Math.round(nearPosition.x + radius * Math.cos(angle * Math.PI / 180))
        const y = Math.round(nearPosition.y + radius * Math.sin(angle * Math.PI / 180))
        
        if (this.isPositionFree({ x, y })) {
          return { x, y }
        }
      }
    }
    return null
  }

  private isPositionFree(position: Position): boolean {
    if (!this.gameState) return false
    
    // Sprawdź kolizje z budynkami
    const tooClose = this.gameState.buildings.some(building =>
      Math.abs(building.position.x - position.x) < 3 &&
      Math.abs(building.position.y - position.y) < 3
    )
    
    return !tooClose
  }

  private isBuildingProducing(building: Building): boolean {
    return building.productionQueue ? building.productionQueue.length > 0 : false
  }

  private getNextMilitaryUnit(): UnitType | null {
    if (this.unitProductionQueue.length === 0) {
      this.unitProductionQueue = [UnitType.WARRIOR, UnitType.ARCHER, UnitType.WARRIOR]
    }
    return this.unitProductionQueue.shift() || UnitType.WARRIOR
  }

  private findAttackTarget(): Unit | Building | null {
    if (!this.gameState) return null
    
    // Znajdź najbliższego wroga
    const enemyUnits = this.gameState.units.filter(u => this.enemies.some(e => e.id === u.playerId))
    const enemyBuildings = this.gameState.buildings.filter(b => this.enemies.some(e => e.id === b.playerId))
    
    const allTargets = [...enemyUnits, ...enemyBuildings]
    if (allTargets.length === 0) return null
    
    return allTargets[Math.floor(Math.random() * allTargets.length)]
  }

  private getBaseCenter(): Position | null {
    const townHalls = this.getMyBuildings().filter(b => b.type === BuildingType.TOWN_HALL)
    if (townHalls.length === 0) return null
    
    return townHalls[0].position
  }

  // Getters
  public getPlayer(): Player {
    return this.player
  }

  public getDifficulty(): AIDifficulty {
    return this.config.difficulty
  }

  public getCurrentStrategy(): string {
    return this.currentStrategy
  }
}

/**
 * Helper function to create AI players
 */
export function createAIPlayer(name: string, faction: Faction, difficulty: AIDifficulty = AIDifficulty.MEDIUM): { player: Player; ai: AIPlayer } {
  const player = createDefaultPlayer(generateGameId(), name, faction)
  player.isAI = true
  player.aiDifficulty = difficulty

  const ai = new AIPlayer(player, difficulty)
  
  return { player, ai }
} 