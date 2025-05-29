import { Entity } from './Entity';
import { Component } from './Component';
import { World } from './World';
/**
 * Abstrakcyjna klasa bazowa dla wszystkich systemów w ECS
 */
export declare abstract class System {
    protected world: World;
    protected entities: Entity[];
    enabled: boolean;
    priority: number;
    constructor(world: World);
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
    matchesEntity(entity: Entity): boolean;
    /**
     * Dodaje entity do systemu
     */
    addEntity(entity: Entity): void;
    /**
     * Usuwa entity z systemu
     */
    removeEntity(entity: Entity): void;
    /**
     * Zwraca wszystkie entities w systemie
     */
    getEntities(): Entity[];
    /**
     * Zwraca liczbę entities w systemie
     */
    getEntityCount(): number;
    /**
     * Pobiera entities z określonym komponentem
     */
    getEntitiesWith<T extends Component>(componentType: new () => T): Entity[];
    /**
     * Czyści wszystkie entities z systemu
     */
    clear(): void;
    /**
     * Niszczy system
     */
    destroy(): void;
}
/**
 * System specjalizujący się w renderowaniu
 */
export declare abstract class RenderSystem extends System {
    /**
     * Główna metoda renderowania
     */
    abstract render(deltaTime: number): void;
    /**
     * Update może być pusty dla systemów renderujących
     */
    update(deltaTime: number): void;
}
/**
 * Typ funkcji filtrującej entities
 */
export type EntityFilter = (entity: Entity) => boolean;
/**
 * System z możliwością dodania dodatkowych filtrów
 */
export declare abstract class FilterableSystem extends System {
    private entityFilters;
    /**
     * Dodaje dodatkowy filtr dla entities
     */
    addEntityFilter(filter: EntityFilter): void;
    /**
     * Usuwa filtr
     */
    removeEntityFilter(filter: EntityFilter): void;
    /**
     * Sprawdza czy entity przechodzi przez wszystkie filtry
     */
    matchesEntity(entity: Entity): boolean;
}
//# sourceMappingURL=System.d.ts.map