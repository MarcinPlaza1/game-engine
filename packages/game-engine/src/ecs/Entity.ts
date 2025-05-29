import { Component } from './Component';

/**
 * Unikalne ID dla Entity
 */
export type EntityId = number;

/**
 * Entity w systemie ECS - kontener dla komponentów
 */
export class Entity {
  public readonly id: EntityId;
  public name?: string;
  public active: boolean = true;
  
  private components: Map<string, Component> = new Map();
  private componentTypes: Set<string> = new Set();

  constructor(id: EntityId, name?: string) {
    this.id = id;
    this.name = name;
  }

  /**
   * Dodaje komponent do entity
   */
  addComponent<T extends Component>(component: T): T {
    const type = component.constructor.name;
    
    if (this.components.has(type)) {
      console.warn(`Entity ${this.id} już ma komponent typu ${type}`);
    }
    
    this.components.set(type, component);
    this.componentTypes.add(type);
    component.entity = this;
    
    return component;
  }

  /**
   * Usuwa komponent z entity
   */
  removeComponent<T extends Component>(componentType: new () => T): boolean {
    const type = componentType.name;
    const component = this.components.get(type);
    
    if (component) {
      this.components.delete(type);
      this.componentTypes.delete(type);
      component.entity = null;
      return true;
    }
    
    return false;
  }

  /**
   * Pobiera komponent danego typu
   */
  getComponent<T extends Component>(componentType: new () => T): T | null {
    const type = componentType.name;
    return (this.components.get(type) as T) || null;
  }

  /**
   * Sprawdza czy entity ma komponent danego typu
   */
  hasComponent<T extends Component>(componentType: new () => T): boolean {
    const type = componentType.name;
    return this.components.has(type);
  }

  /**
   * Sprawdza czy entity ma wszystkie podane komponenty
   */
  hasComponents(componentTypes: Array<new () => Component>): boolean {
    return componentTypes.every(type => this.hasComponent(type));
  }

  /**
   * Pobiera wszystkie komponenty
   */
  getAllComponents(): Component[] {
    return Array.from(this.components.values());
  }

  /**
   * Pobiera nazwy typów wszystkich komponentów
   */
  getComponentTypes(): string[] {
    return Array.from(this.componentTypes);
  }

  /**
   * Klonuje entity (z komponentami)
   */
  clone(newId: EntityId): Entity {
    const cloned = new Entity(newId, this.name);
    cloned.active = this.active;
    
    // Klonowanie komponentów
    for (const component of this.components.values()) {
      if (component.clone) {
        cloned.addComponent(component.clone());
      }
    }
    
    return cloned;
  }

  /**
   * Niszczy entity i wszystkie jej komponenty
   */
  destroy(): void {
    for (const component of this.components.values()) {
      if (component.destroy) {
        component.destroy();
      }
      component.entity = null;
    }
    
    this.components.clear();
    this.componentTypes.clear();
    this.active = false;
  }

  /**
   * Zwraca reprezentację tekstową
   */
  toString(): string {
    const components = Array.from(this.componentTypes).join(', ');
    return `Entity(id: ${this.id}, name: ${this.name || 'unnamed'}, components: [${components}])`;
  }
} 