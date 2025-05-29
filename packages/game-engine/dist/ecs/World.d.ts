import { EventEmitter } from 'eventemitter3';
import { Entity, EntityId } from './Entity';
import { Component } from './Component';
import { System } from './System';
/**
 * Główny manager dla systemu ECS
 */
export declare class World extends EventEmitter {
    private entities;
    private systems;
    private renderSystems;
    private nextEntityId;
    private entitiesToAdd;
    private entitiesToRemove;
    private systemsToAdd;
    private systemsToRemove;
    /**
     * Tworzy nową entity
     */
    createEntity(name?: string): Entity;
    /**
     * Dodaje istniejącą entity do świata
     */
    addEntity(entity: Entity): void;
    /**
     * Usuwa entity ze świata (oznacza do usunięcia)
     */
    removeEntity(entityId: EntityId): void;
    /**
     * Pobiera entity po ID
     */
    getEntity(entityId: EntityId): Entity | null;
    /**
     * Pobiera wszystkie entities
     */
    getAllEntities(): Entity[];
    /**
     * Pobiera entities z określonym komponentem
     */
    getEntitiesWith<T extends Component>(componentType: new () => T): Entity[];
    /**
     * Pobiera entities z wszystkimi określonymi komponentami
     */
    getEntitiesWithComponents(componentTypes: Array<new () => Component>): Entity[];
    /**
     * Znajduje entity po nazwie
     */
    findEntityByName(name: string): Entity | null;
    /**
     * Znajduje wszystkie entities o podanej nazwie
     */
    findEntitiesByName(name: string): Entity[];
    /**
     * Dodaje system do świata
     */
    addSystem(system: System): void;
    /**
     * Usuwa system ze świata
     */
    removeSystem(system: System): void;
    /**
     * Pobiera system danego typu
     */
    getSystem<T extends System>(systemType: new (world: World) => T): T | null;
    /**
     * Pobiera wszystkie systemy
     */
    getAllSystems(): System[];
    /**
     * Aktualizuje wszystkie systemy i entities
     */
    update(deltaTime: number): void;
    /**
     * Renderuje wszystkie systemy renderujące
     */
    render(deltaTime: number): void;
    /**
     * Czyści wszystkie entities i systemy
     */
    clear(): void;
    /**
     * Zwraca statystyki świata
     */
    getStats(): {
        entityCount: number;
        systemCount: number;
        renderSystemCount: number;
        nextEntityId: EntityId;
    };
    /**
     * Przetwarza kolejkę dodawania/usuwania entities
     */
    private processEntityQueue;
    /**
     * Przetwarza kolejkę dodawania/usuwania systemów
     */
    private processSystemQueue;
    /**
     * Dodaje entity do odpowiednich systemów
     */
    private addEntityToSystems;
    /**
     * Usuwa entity z wszystkich systemów
     */
    private removeEntityFromSystems;
    /**
     * Aktualizuje przynależność entity do systemów
     * (wywoływane gdy entity dodaje/usuwa komponenty)
     */
    updateEntityInSystems(entity: Entity): void;
}
//# sourceMappingURL=World.d.ts.map