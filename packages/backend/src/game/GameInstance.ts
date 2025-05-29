/**
 * Instancja pojedynczej gry RTS
 */

import { EventEmitter } from 'events';
import {
  GameId,
  GameState,
  GameSettings,
  Player,
  Unit,
  Building,
  GameStatus,
  PlayerAction,
  PlayerActionType,
  ResourceType,
  UnitType,
  BuildingType,
  Position,
  generateGameId,
  createDefaultGameSettings,
  DEFAULT_UNIT_COSTS,
  DEFAULT_BUILDING_COSTS,
  RESOURCE_LIMITS,
  GameStateDelta,
  GameEvent,
  GameEventType
} from '@rts-engine/shared';
import { logger } from '../utils/Logger.js';

/**
 * Instancja pojedynczej gry
 */
export class GameInstance extends EventEmitter {
  private gameState: GameState;
  private lastUpdate: number = Date.now();
  private actionQueue: Array<{ playerId: GameId; action: PlayerAction; timestamp: number }> = [];

  constructor(gameId: GameId, players: Player[], gameSettings: GameSettings) {
    super();
    
    this.gameState = this.createInitialGameState(gameId, players, gameSettings);
    this.setupInitialUnits();
    
    logger.info('Game instance created', {
      gameId,
      players: players.length,
      gameMode: gameSettings.gameMode
    });
  }

  /**
   * Tworzy początkowy stan gry
   */
  private createInitialGameState(gameId: GameId, players: Player[], gameSettings: GameSettings): GameState {
    return {
      id: gameId,
      name: `Game ${gameId}`,
      status: GameStatus.IN_PROGRESS,
      gameTime: 0,
      map: this.createDefaultMap(),
      players: players.map(p => ({
        ...p,
        resources: { ...RESOURCE_LIMITS.STARTING_RESOURCES }
      })),
      units: [],
      buildings: [],
      gameSettings
    };
  }

  /**
   * Tworzy domyślną mapę
   */
  private createDefaultMap() {
    const mapSize = { width: 40, height: 40 };
    const terrain: any[][] = [];
    
    // Stwórz prostą mapę
    for (let x = 0; x < mapSize.width; x++) {
      terrain[x] = [];
      for (let y = 0; y < mapSize.height; y++) {
        terrain[x][y] = {
          type: 'grass' as any,
          height: 0,
          walkable: true,
          buildable: true
        };
      }
    }

    return {
      id: 'default_map',
      name: 'Default Map',
      size: mapSize,
      tileSize: 32,
      terrain,
      resources: this.generateResourceNodes(),
      spawnPoints: this.generateSpawnPoints(this.gameState?.players.length || 2)
    };
  }

  /**
   * Generuje węzły zasobów
   */
  private generateResourceNodes() {
    const resources = [];
    const mapSize = { width: 40, height: 40 };
    
    // Dodaj kilka złóż złota
    for (let i = 0; i < 5; i++) {
      resources.push({
        id: generateGameId(),
        type: ResourceType.GOLD,
        position: {
          x: Math.random() * mapSize.width * 32,
          y: Math.random() * mapSize.height * 32
        },
        amount: 1000,
        maxAmount: 1000,
        isExhausted: false
      });
    }

    // Dodaj lasy (drewno)
    for (let i = 0; i < 8; i++) {
      resources.push({
        id: generateGameId(),
        type: ResourceType.WOOD,
        position: {
          x: Math.random() * mapSize.width * 32,
          y: Math.random() * mapSize.height * 32
        },
        amount: 500,
        maxAmount: 500,
        isExhausted: false
      });
    }

    return resources;
  }

  /**
   * Generuje punkty spawnu dla graczy
   */
  private generateSpawnPoints(playerCount: number): Position[] {
    const points: Position[] = [];
    const mapSize = { width: 40, height: 40 };
    const centerX = mapSize.width * 16;
    const centerY = mapSize.height * 16;
    const radius = Math.min(centerX, centerY) * 0.6;

    for (let i = 0; i < playerCount; i++) {
      const angle = (i / playerCount) * Math.PI * 2;
      points.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      });
    }

    return points;
  }

  /**
   * Tworzy początkowe jednostki dla graczy
   */
  private setupInitialUnits(): void {
    const spawnPoints = this.gameState.map.spawnPoints;
    
    this.gameState.players.forEach((player, index) => {
      const spawnPoint = spawnPoints[index % spawnPoints.length];
      
      // Dodaj Town Hall
      const townHall: Building = {
        id: generateGameId(),
        playerId: player.id,
        type: BuildingType.TOWN_HALL,
        position: spawnPoint,
        size: { width: 64, height: 64 },
        rotation: 0,
        stats: {
          health: 1000,
          maxHealth: 1000,
          armor: 5,
          cost: DEFAULT_BUILDING_COSTS[BuildingType.TOWN_HALL]
        },
        isSelected: false,
        isUnderConstruction: false,
        constructionProgress: 1
      };
      
      this.gameState.buildings.push(townHall);

      // Dodaj początkowych workerów
      for (let i = 0; i < 3; i++) {
        const worker: Unit = {
          id: generateGameId(),
          playerId: player.id,
          type: UnitType.WORKER,
          position: {
            x: spawnPoint.x + (i - 1) * 40,
            y: spawnPoint.y + 80
          },
          rotation: 0,
          stats: {
            health: 50,
            maxHealth: 50,
            armor: 0,
            attack: 5,
            range: 32,
            moveSpeed: 80,
            cost: DEFAULT_UNIT_COSTS[UnitType.WORKER]
          },
          isSelected: false,
          currentAction: 'idle' as any
        };
        
        this.gameState.units.push(worker);
      }
    });
  }

  /**
   * Główna metoda aktualizacji gry
   */
  update(deltaTime: number): void {
    const now = Date.now();
    this.gameState.gameTime += deltaTime;

    // Przetwarzaj kolejkę akcji
    this.processActionQueue();

    // Aktualizuj systemy gry
    this.updateUnits(deltaTime);
    this.updateBuildings(deltaTime);
    this.updateResources(deltaTime);
    
    // Sprawdź warunki zwycięstwa
    this.checkVictoryConditions();

    // Emituj aktualizację stanu
    this.emitGameUpdate(deltaTime);

    this.lastUpdate = now;
  }

  /**
   * Dodaje akcję gracza do kolejki
   */
  addPlayerAction(playerId: GameId, action: PlayerAction): boolean {
    // Podstawowa walidacja
    if (!this.gameState.players.some(p => p.id === playerId)) {
      logger.warn('Invalid player action - player not in game', { playerId, gameId: this.gameState.id });
      return false;
    }

    this.actionQueue.push({
      playerId,
      action,
      timestamp: Date.now()
    });

    return true;
  }

  /**
   * Przetwarza kolejkę akcji graczy
   */
  private processActionQueue(): void {
    // Sortuj akcje według timestamp
    this.actionQueue.sort((a, b) => a.timestamp - b.timestamp);

    while (this.actionQueue.length > 0) {
      const { playerId, action } = this.actionQueue.shift()!;
      this.executePlayerAction(playerId, action);
    }
  }

  /**
   * Wykonuje akcję gracza
   */
  private executePlayerAction(playerId: GameId, action: PlayerAction): void {
    try {
      switch (action.type) {
        case PlayerActionType.MOVE_UNITS:
          this.handleMoveUnits(playerId, action);
          break;
        case PlayerActionType.ATTACK_TARGET:
          this.handleAttackTarget(playerId, action);
          break;
        case PlayerActionType.TRAIN_UNIT:
          this.handleTrainUnit(playerId, action);
          break;
        case PlayerActionType.BUILD_STRUCTURE:
          this.handleBuildStructure(playerId, action);
          break;
        case PlayerActionType.GATHER_RESOURCE:
          this.handleGatherResource(playerId, action);
          break;
        default:
          logger.warn('Unknown action type', { actionType: action.type, playerId });
      }
    } catch (error) {
      logger.error('Error executing player action', { error, action, playerId });
    }
  }

  /**
   * Obsługuje ruch jednostek
   */
  private handleMoveUnits(playerId: GameId, action: PlayerAction): void {
    if (!action.targetPosition || !action.unitIds) return;

    action.unitIds.forEach(unitId => {
      const unit = this.gameState.units.find(u => u.id === unitId && u.playerId === playerId);
      if (unit && action.targetPosition) {
        unit.targetPosition = action.targetPosition;
        unit.currentAction = 'move' as any;
        unit.path = [action.targetPosition]; // Uproszczone - bez pathfinding
      }
    });
  }

  /**
   * Obsługuje atak na cel
   */
  private handleAttackTarget(playerId: GameId, action: PlayerAction): void {
    if (!action.targetId || !action.unitIds) return;

    action.unitIds.forEach(unitId => {
      const unit = this.gameState.units.find(u => u.id === unitId && u.playerId === playerId);
      if (unit) {
        unit.targetId = action.targetId;
        unit.currentAction = 'attack' as any;
      }
    });
  }

  /**
   * Obsługuje trenowanie jednostek
   */
  private handleTrainUnit(playerId: GameId, action: PlayerAction): void {
    const unitType = action.data?.unitType as UnitType;
    const buildingId = action.data?.buildingId as GameId;
    
    if (!unitType || !buildingId) return;

    const building = this.gameState.buildings.find(b => b.id === buildingId && b.playerId === playerId);
    const player = this.gameState.players.find(p => p.id === playerId);
    
    if (!building || !player) return;

    const cost = DEFAULT_UNIT_COSTS[unitType];
    if (!this.hasEnoughResources(player, cost)) return;

    // Odejmij zasoby
    this.subtractPlayerResources(player, cost);

    // Dodaj do kolejki produkcji (uproszczone - instant spawn)
    const newUnit: Unit = {
      id: generateGameId(),
      playerId,
      type: unitType,
      position: {
        x: building.position.x + building.size.width + 20,
        y: building.position.y + building.size.height / 2
      },
      rotation: 0,
      stats: {
        health: 100, // Domyślne wartości
        maxHealth: 100,
        armor: 0,
        attack: 10,
        range: 32,
        moveSpeed: 80,
        cost
      },
      isSelected: false,
      currentAction: 'idle' as any
    };

    this.gameState.units.push(newUnit);
    this.emitGameEvent({
      eventType: GameEventType.UNIT_CREATED,
      timestamp: Date.now(),
      playerId,
      position: newUnit.position,
      data: { unitType, unitId: newUnit.id }
    });
  }

  /**
   * Obsługuje budowanie struktur
   */
  private handleBuildStructure(playerId: GameId, action: PlayerAction): void {
    const buildingType = action.data?.buildingType as BuildingType;
    
    if (!buildingType || !action.targetPosition) return;

    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player) return;

    const cost = DEFAULT_BUILDING_COSTS[buildingType];
    if (!this.hasEnoughResources(player, cost)) return;

    // Odejmij zasoby
    this.subtractPlayerResources(player, cost);

    // Stwórz budynek
    const newBuilding: Building = {
      id: generateGameId(),
      playerId,
      type: buildingType,
      position: action.targetPosition,
      size: { width: 64, height: 64 }, // Domyślny rozmiar
      rotation: 0,
      stats: {
        health: 500,
        maxHealth: 500,
        armor: 2,
        cost
      },
      isSelected: false,
      isUnderConstruction: true,
      constructionProgress: 0
    };

    this.gameState.buildings.push(newBuilding);
    this.emitGameEvent({
      eventType: GameEventType.BUILDING_COMPLETED,
      timestamp: Date.now(),
      playerId,
      position: newBuilding.position,
      data: { buildingType, buildingId: newBuilding.id }
    });
  }

  /**
   * Obsługuje zbieranie zasobów
   */
  private handleGatherResource(playerId: GameId, action: PlayerAction): void {
    if (!action.unitIds || !action.targetId) return;

    const resourceNode = this.gameState.map.resources.find(r => r.id === action.targetId);
    if (!resourceNode || resourceNode.isExhausted) return;

    action.unitIds.forEach(unitId => {
      const unit = this.gameState.units.find(u => u.id === unitId && u.playerId === playerId);
      if (unit) {
        unit.targetId = action.targetId;
        unit.currentAction = 'gather' as any;
      }
    });
  }

  /**
   * Aktualizuje jednostki
   */
  private updateUnits(deltaTime: number): void {
    for (const unit of this.gameState.units) {
      // Uproszczona logika ruchu
      if (unit.currentAction === 'move' && unit.targetPosition) {
        const dx = unit.targetPosition.x - unit.position.x;
        const dy = unit.targetPosition.y - unit.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
          unit.currentAction = 'idle' as any;
          unit.targetPosition = undefined;
        } else {
          const speed = (unit.stats.moveSpeed || 80) * (deltaTime / 1000);
          unit.position.x += (dx / distance) * speed;
          unit.position.y += (dy / distance) * speed;
        }
      }

      // Uproszczona logika ataku
      if (unit.currentAction === 'attack' && unit.targetId) {
        const target = this.gameState.units.find(u => u.id === unit.targetId) ||
                      this.gameState.buildings.find(b => b.id === unit.targetId);
        
        if (target && target.stats.health > 0) {
          const dx = target.position.x - unit.position.x;
          const dy = target.position.y - unit.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance <= (unit.stats.range || 32)) {
            // Atak co sekundę (uproszczone)
            if (Math.random() < 0.02) { // ~2% szansy na klatkę = ~1 atak/s przy 60fps
              target.stats.health -= unit.stats.attack || 10;
              if (target.stats.health <= 0) {
                this.handleUnitDeath(target);
                unit.currentAction = 'idle' as any;
                unit.targetId = undefined;
              }
            }
          }
        } else {
          unit.currentAction = 'idle' as any;
          unit.targetId = undefined;
        }
      }

      // Logika zbierania zasobów
      if (unit.currentAction === 'gather' && unit.targetId) {
        const resourceNode = this.gameState.map.resources.find(r => r.id === unit.targetId);
        if (resourceNode && !resourceNode.isExhausted) {
          const dx = resourceNode.position.x - unit.position.x;
          const dy = resourceNode.position.y - unit.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance <= 48) { // GATHER_RANGE_DEFAULT
            // Zbieraj zasób
            if (Math.random() < 0.01) { // Zbieranie co ~100 klatek
              const gathered = Math.min(10, resourceNode.amount);
              resourceNode.amount -= gathered;
              
              const player = this.gameState.players.find(p => p.id === unit.playerId);
              if (player) {
                player.resources[resourceNode.type] = (player.resources[resourceNode.type] || 0) + gathered;
              }
              
              if (resourceNode.amount <= 0) {
                resourceNode.isExhausted = true;
                unit.currentAction = 'idle' as any;
                unit.targetId = undefined;
              }
            }
          }
        }
      }
    }
  }

  /**
   * Aktualizuje budynki
   */
  private updateBuildings(deltaTime: number): void {
    for (const building of this.gameState.buildings) {
      // Aktualizuj budowę
      if (building.isUnderConstruction) {
        building.constructionProgress += deltaTime / 5000; // 5 sekund budowy
        if (building.constructionProgress >= 1) {
          building.isUnderConstruction = false;
          building.constructionProgress = 1;
        }
      }
    }
  }

  /**
   * Aktualizuje zasoby
   */
  private updateResources(deltaTime: number): void {
    // W przyszłości: regeneracja zasobów, etc.
  }

  /**
   * Sprawdza warunki zwycięstwa
   */
  private checkVictoryConditions(): void {
    const alivePlayers = this.gameState.players.filter(player => {
      const hasUnits = this.gameState.units.some(unit => unit.playerId === player.id && unit.stats.health > 0);
      const hasBuildings = this.gameState.buildings.some(building => building.playerId === player.id && building.stats.health > 0);
      return hasUnits || hasBuildings;
    });

    if (alivePlayers.length === 1) {
      this.gameState.winner = alivePlayers[0].id;
      this.gameState.status = GameStatus.FINISHED;
      this.emitGameEvent({
        eventType: GameEventType.GAME_ENDED,
        timestamp: Date.now(),
        playerId: alivePlayers[0].id,
        message: `${alivePlayers[0].name} zwycięża!`
      });
    }
  }

  /**
   * Obsługuje śmierć jednostki
   */
  private handleUnitDeath(unit: Unit | Building): void {
    if ('type' in unit && Object.values(UnitType).includes(unit.type as UnitType)) {
      // To jest jednostka
      const unitIndex = this.gameState.units.findIndex(u => u.id === unit.id);
      if (unitIndex >= 0) {
        this.gameState.units.splice(unitIndex, 1);
        this.emitGameEvent({
          eventType: GameEventType.UNIT_DESTROYED,
          timestamp: Date.now(),
          playerId: unit.playerId,
          position: unit.position
        });
      }
    } else {
      // To jest budynek
      const buildingIndex = this.gameState.buildings.findIndex(b => b.id === unit.id);
      if (buildingIndex >= 0) {
        this.gameState.buildings.splice(buildingIndex, 1);
        this.emitGameEvent({
          eventType: GameEventType.BUILDING_DESTROYED,
          timestamp: Date.now(),
          playerId: unit.playerId,
          position: unit.position
        });
      }
    }
  }

  /**
   * Sprawdza czy gracz ma wystarczające zasoby
   */
  private hasEnoughResources(player: Player, cost: any): boolean {
    for (const [resourceType, amount] of Object.entries(cost)) {
      const playerAmount = player.resources[resourceType as ResourceType] || 0;
      if (playerAmount < (amount as number)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Odejmuje zasoby od gracza
   */
  private subtractPlayerResources(player: Player, cost: any): void {
    for (const [resourceType, amount] of Object.entries(cost)) {
      const currentAmount = player.resources[resourceType as ResourceType] || 0;
      player.resources[resourceType as ResourceType] = Math.max(0, currentAmount - (amount as number));
    }
  }

  /**
   * Emituje aktualizację stanu gry
   */
  private emitGameUpdate(deltaTime: number): void {
    // Twórz delta update dla optymalizacji
    const delta: GameStateDelta = {
      gameTime: this.gameState.gameTime,
      unitsChanged: this.gameState.units.filter(unit => this.hasUnitChanged(unit)),
      playersChanged: this.gameState.players
    };

    this.emit('gameUpdate', {
      gameId: this.gameState.id,
      deltaUpdate: delta
    });
  }

  /**
   * Sprawdza czy jednostka się zmieniła (uproszczone)
   */
  private hasUnitChanged(unit: Unit): boolean {
    // W rzeczywistej implementacji porównalibyśmy z poprzednim stanem
    return true;
  }

  /**
   * Emituje event gry
   */
  private emitGameEvent(event: GameEvent): void {
    this.emit('gameEvent', {
      gameId: this.gameState.id,
      event
    });
  }

  /**
   * Zwraca pełny stan gry
   */
  getGameState(): GameState {
    return { ...this.gameState };
  }

  /**
   * Kończy grę
   */
  endGame(winnerId?: GameId): void {
    this.gameState.status = GameStatus.FINISHED;
    if (winnerId) {
      this.gameState.winner = winnerId;
    }
    
    logger.info('Game ended', { 
      gameId: this.gameState.id, 
      winner: winnerId,
      duration: this.gameState.gameTime 
    });
  }
} 