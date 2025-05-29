/**
 * Game Balance Configuration
 * Konfiguracja kosztów, statystyk i balansu gry
 */

import { UnitType, BuildingType, ResourceType } from '../types/GameState'

export interface ResourceCost {
  [ResourceType.GOLD]?: number
  [ResourceType.WOOD]?: number
  [ResourceType.STONE]?: number
  [ResourceType.FOOD]?: number
  [ResourceType.ENERGY]?: number
}

// Koszty jednostek
export const DEFAULT_UNIT_COSTS: Record<UnitType, ResourceCost> = {
  [UnitType.WORKER]: {
    [ResourceType.GOLD]: 50,
    [ResourceType.FOOD]: 25
  },
  [UnitType.WARRIOR]: {
    [ResourceType.GOLD]: 100,
    [ResourceType.FOOD]: 50,
    [ResourceType.WOOD]: 25
  },
  [UnitType.ARCHER]: {
    [ResourceType.GOLD]: 75,
    [ResourceType.FOOD]: 40,
    [ResourceType.WOOD]: 50
  },
  [UnitType.CAVALRY]: {
    [ResourceType.GOLD]: 150,
    [ResourceType.FOOD]: 75,
    [ResourceType.WOOD]: 25
  },
  [UnitType.MAGE]: {
    [ResourceType.GOLD]: 120,
    [ResourceType.ENERGY]: 50,
    [ResourceType.STONE]: 25
  },
  [UnitType.SIEGE_ENGINE]: {
    [ResourceType.GOLD]: 300,
    [ResourceType.WOOD]: 100,
    [ResourceType.STONE]: 50
  },
  [UnitType.FLYING_UNIT]: {
    [ResourceType.GOLD]: 200,
    [ResourceType.ENERGY]: 75,
    [ResourceType.FOOD]: 30
  },
  [UnitType.HERO]: {
    [ResourceType.GOLD]: 500,
    [ResourceType.ENERGY]: 200,
    [ResourceType.FOOD]: 100
  }
}

// Koszty budynków
export const DEFAULT_BUILDING_COSTS: Record<BuildingType, ResourceCost> = {
  [BuildingType.TOWN_HALL]: {
    [ResourceType.GOLD]: 400,
    [ResourceType.WOOD]: 200,
    [ResourceType.STONE]: 100
  },
  [BuildingType.HOUSE]: {
    [ResourceType.GOLD]: 50,
    [ResourceType.WOOD]: 100
  },
  [BuildingType.BARRACKS]: {
    [ResourceType.GOLD]: 150,
    [ResourceType.WOOD]: 75,
    [ResourceType.STONE]: 25
  },
  [BuildingType.FARM]: {
    [ResourceType.GOLD]: 100,
    [ResourceType.WOOD]: 50
  },
  [BuildingType.LUMBER_MILL]: {
    [ResourceType.GOLD]: 100,
    [ResourceType.WOOD]: 25,
    [ResourceType.STONE]: 50
  },
  [BuildingType.MINE]: {
    [ResourceType.GOLD]: 200,
    [ResourceType.WOOD]: 100,
    [ResourceType.STONE]: 150
  },
  [BuildingType.QUARRY]: {
    [ResourceType.GOLD]: 180,
    [ResourceType.WOOD]: 75,
    [ResourceType.STONE]: 100
  },
  [BuildingType.TOWER]: {
    [ResourceType.GOLD]: 150,
    [ResourceType.WOOD]: 50,
    [ResourceType.STONE]: 100
  },
  [BuildingType.WALL]: {
    [ResourceType.GOLD]: 25,
    [ResourceType.STONE]: 50
  },
  [BuildingType.GATE]: {
    [ResourceType.GOLD]: 75,
    [ResourceType.WOOD]: 50,
    [ResourceType.STONE]: 100
  },
  [BuildingType.WORKSHOP]: {
    [ResourceType.GOLD]: 200,
    [ResourceType.WOOD]: 100,
    [ResourceType.STONE]: 75
  },
  [BuildingType.TEMPLE]: {
    [ResourceType.GOLD]: 300,
    [ResourceType.STONE]: 150,
    [ResourceType.ENERGY]: 100
  },
  [BuildingType.ACADEMY]: {
    [ResourceType.GOLD]: 400,
    [ResourceType.WOOD]: 150,
    [ResourceType.STONE]: 200
  }
}

// Statystyki jednostek
export interface UnitStats {
  health: number
  attack: number
  defense: number
  range: number
  moveSpeed: number
  buildTime: number // w sekundach
  populationCost: number
}

export const DEFAULT_UNIT_STATS: Record<UnitType, UnitStats> = {
  [UnitType.WORKER]: {
    health: 50,
    attack: 5,
    defense: 1,
    range: 1,
    moveSpeed: 1.2,
    buildTime: 15,
    populationCost: 1
  },
  [UnitType.WARRIOR]: {
    health: 100,
    attack: 20,
    defense: 5,
    range: 1,
    moveSpeed: 1.0,
    buildTime: 25,
    populationCost: 2
  },
  [UnitType.ARCHER]: {
    health: 60,
    attack: 15,
    defense: 2,
    range: 4,
    moveSpeed: 1.1,
    buildTime: 20,
    populationCost: 2
  },
  [UnitType.CAVALRY]: {
    health: 120,
    attack: 25,
    defense: 3,
    range: 1,
    moveSpeed: 1.8,
    buildTime: 40,
    populationCost: 3
  },
  [UnitType.MAGE]: {
    health: 40,
    attack: 30,
    defense: 1,
    range: 5,
    moveSpeed: 0.8,
    buildTime: 35,
    populationCost: 2
  },
  [UnitType.SIEGE_ENGINE]: {
    health: 200,
    attack: 50,
    defense: 8,
    range: 6,
    moveSpeed: 0.5,
    buildTime: 80,
    populationCost: 5
  },
  [UnitType.FLYING_UNIT]: {
    health: 80,
    attack: 20,
    defense: 2,
    range: 3,
    moveSpeed: 2.0,
    buildTime: 45,
    populationCost: 3
  },
  [UnitType.HERO]: {
    health: 300,
    attack: 50,
    defense: 10,
    range: 2,
    moveSpeed: 1.3,
    buildTime: 120,
    populationCost: 0
  }
}

// Statystyki budynków
export interface BuildingStats {
  health: number
  defense: number
  buildTime: number // w sekundach
  populationProvided?: number
  attackRange?: number
  attackDamage?: number
}

export const DEFAULT_BUILDING_STATS: Record<BuildingType, BuildingStats> = {
  [BuildingType.TOWN_HALL]: {
    health: 500,
    defense: 10,
    buildTime: 60,
    populationProvided: 5
  },
  [BuildingType.HOUSE]: {
    health: 100,
    defense: 2,
    buildTime: 20,
    populationProvided: 4
  },
  [BuildingType.BARRACKS]: {
    health: 200,
    defense: 5,
    buildTime: 30
  },
  [BuildingType.FARM]: {
    health: 80,
    defense: 1,
    buildTime: 25
  },
  [BuildingType.LUMBER_MILL]: {
    health: 150,
    defense: 3,
    buildTime: 30
  },
  [BuildingType.MINE]: {
    health: 200,
    defense: 5,
    buildTime: 40
  },
  [BuildingType.QUARRY]: {
    health: 180,
    defense: 4,
    buildTime: 35
  },
  [BuildingType.TOWER]: {
    health: 300,
    defense: 8,
    buildTime: 45,
    attackRange: 6,
    attackDamage: 25
  },
  [BuildingType.WALL]: {
    health: 150,
    defense: 15,
    buildTime: 15
  },
  [BuildingType.GATE]: {
    health: 200,
    defense: 12,
    buildTime: 25
  },
  [BuildingType.WORKSHOP]: {
    health: 180,
    defense: 4,
    buildTime: 50
  },
  [BuildingType.TEMPLE]: {
    health: 250,
    defense: 6,
    buildTime: 70
  },
  [BuildingType.ACADEMY]: {
    health: 300,
    defense: 8,
    buildTime: 80
  }
}

/**
 * Sprawdza czy gracz ma wystarczające zasoby
 */
export function hasEnoughResources(
  playerResources: Record<string, number>,
  requiredResources: ResourceCost
): boolean {
  for (const [resource, amount] of Object.entries(requiredResources)) {
    if (!amount) continue
    
    const playerAmount = playerResources[resource] || 0
    if (playerAmount < amount) {
      return false
    }
  }
  return true
}

/**
 * Odejmuje zasoby od gracza
 */
export function subtractResources(
  playerResources: Record<string, number>,
  cost: ResourceCost
): Record<string, number> {
  const result = { ...playerResources }
  
  for (const [resource, amount] of Object.entries(cost)) {
    if (amount) {
      result[resource] = (result[resource] || 0) - amount
    }
  }
  
  return result
}

/**
 * Dodaje zasoby do gracza
 */
export function addResources(
  playerResources: Record<string, number>,
  resources: ResourceCost
): Record<string, number> {
  const result = { ...playerResources }
  
  for (const [resource, amount] of Object.entries(resources)) {
    if (amount) {
      result[resource] = (result[resource] || 0) + amount
    }
  }
  
  return result
}

/**
 * Generuje początkowe zasoby dla gracza
 */
export function generateStartingResources(): Record<string, number> {
  return {
    [ResourceType.GOLD]: 500,
    [ResourceType.WOOD]: 250,
    [ResourceType.STONE]: 100,
    [ResourceType.FOOD]: 200,
    [ResourceType.ENERGY]: 50
  }
} 