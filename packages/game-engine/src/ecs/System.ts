import { Entity } from './Entity';
import { Component } from './Component';
import { World } from './World';

/**
 * Abstrakcyjna klasa bazowa dla wszystkich systemów w ECS
 */
export abstract class System {
  protected world: World;
  protected entities: Entity[] = [];
  public enabled: boolean = true;
  public priority: number = 0; // Wyższy priorytet = wcześniejsze wykonanie

  constructor(world: World) {
    this.world = world;
  }

  /**
   * Definiuje które komponenty są wymagane dla tego systemu
   */
  abstract getRequiredComponents(): Array<new () => Component>;

  /**
   * Główna logika systemu - wywoływana każdą klatkę
   */
  abstract update(deltaTime: number): void;

  /**
   * Wywoływane gdy system jest dodawany do świata
   */
  onEnable?(): void;

  /**
   * Wywoływane gdy system jest usuwany ze świata
   */
  onDisable?(): void;

  /**
   * Wywoływane gdy nowa entity spełnia wymagania systemu
   */
  onEntityAdded?(entity: Entity): void;

  /**
   * Wywoływane gdy entity przestaje spełniać wymagania systemu
   */
  onEntityRemoved?(entity: Entity): void;

  /**
   * Sprawdza czy entity spełnia wymagania systemu
   */
  matchesEntity(entity: Entity): boolean {
    if (!entity.active) return false;
    
    const requiredComponents = this.getRequiredComponents();
    return entity.hasComponents(requiredComponents);
  }

  /**
   * Dodaje entity do systemu
   */
  addEntity(entity: Entity): void {
    if (!this.entities.includes(entity)) {
      this.entities.push(entity);
      if (this.onEntityAdded) {
        this.onEntityAdded(entity);
      }
    }
  }

  /**
   * Usuwa entity z systemu
   */
  removeEntity(entity: Entity): void {
    const index = this.entities.indexOf(entity);
    if (index >= 0) {
      this.entities.splice(index, 1);
      if (this.onEntityRemoved) {
        this.onEntityRemoved(entity);
      }
    }
  }

  /**
   * Zwraca wszystkie entities w systemie
   */
  getEntities(): Entity[] {
    return this.entities.slice(); // Zwraca kopię
  }

  /**
   * Zwraca liczbę entities w systemie
   */
  getEntityCount(): number {
    return this.entities.length;
  }

  /**
   * Pobiera entities z określonym komponentem
   */
  getEntitiesWith<T extends Component>(componentType: new () => T): Entity[] {
    return this.entities.filter(entity => entity.hasComponent(componentType));
  }

  /**
   * Czyści wszystkie entities z systemu
   */
  clear(): void {
    for (const entity of this.entities) {
      if (this.onEntityRemoved) {
        this.onEntityRemoved(entity);
      }
    }
    this.entities = [];
  }

  /**
   * Niszczy system
   */
  destroy(): void {
    this.clear();
    if (this.onDisable) {
      this.onDisable();
    }
    this.enabled = false;
  }
}

/**
 * System specjalizujący się w renderowaniu
 */
export abstract class RenderSystem extends System {
  /**
   * Główna metoda renderowania
   */
  abstract render(deltaTime: number): void;

  /**
   * Update może być pusty dla systemów renderujących
   */
  update(deltaTime: number): void {
    // Domyślnie pusta implementacja
  }
}

/**
 * Typ funkcji filtrującej entities
 */
export type EntityFilter = (entity: Entity) => boolean;

/**
 * System z możliwością dodania dodatkowych filtrów
 */
export abstract class FilterableSystem extends System {
  private entityFilters: EntityFilter[] = [];

  /**
   * Dodaje dodatkowy filtr dla entities
   */
  addEntityFilter(filter: EntityFilter): void {
    this.entityFilters.push(filter);
  }

  /**
   * Usuwa filtr
   */
  removeEntityFilter(filter: EntityFilter): void {
    const index = this.entityFilters.indexOf(filter);
    if (index >= 0) {
      this.entityFilters.splice(index, 1);
    }
  }

  /**
   * Sprawdza czy entity przechodzi przez wszystkie filtry
   */
  override matchesEntity(entity: Entity): boolean {
    if (!super.matchesEntity(entity)) return false;
    
    return this.entityFilters.every(filter => filter(entity));
  }
} 