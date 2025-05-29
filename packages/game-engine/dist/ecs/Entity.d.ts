import { Component } from './Component';
/**
 * Unikalne ID dla Entity
 */
export type EntityId = number;
/**
 * Entity w systemie ECS - kontener dla komponentów
 */
export declare class Entity {
    readonly id: EntityId;
    name?: string;
    active: boolean;
    private components;
    private componentTypes;
    constructor(id: EntityId, name?: string);
    /**
     * Dodaje komponent do entity
     */
    addComponent<T extends Component>(component: T): T;
    /**
     * Usuwa komponent z entity
     */
    removeComponent<T extends Component>(componentType: new () => T): boolean;
    /**
     * Pobiera komponent danego typu
     */
    getComponent<T extends Component>(componentType: new () => T): T | null;
    /**
     * Sprawdza czy entity ma komponent danego typu
     */
    hasComponent<T extends Component>(componentType: new () => T): boolean;
    /**
     * Sprawdza czy entity ma wszystkie podane komponenty
     */
    hasComponents(componentTypes: Array<new () => Component>): boolean;
    /**
     * Pobiera wszystkie komponenty
     */
    getAllComponents(): Component[];
    /**
     * Pobiera nazwy typów wszystkich komponentów
     */
    getComponentTypes(): string[];
    /**
     * Klonuje entity (z komponentami)
     */
    clone(newId: EntityId): Entity;
    /**
     * Niszczy entity i wszystkie jej komponenty
     */
    destroy(): void;
    /**
     * Zwraca reprezentację tekstową
     */
    toString(): string;
}
//# sourceMappingURL=Entity.d.ts.map