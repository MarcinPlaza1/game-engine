"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterableSystem = exports.RenderSystem = exports.System = void 0;
/**
 * Abstrakcyjna klasa bazowa dla wszystkich systemów w ECS
 */
class System {
    constructor(world) {
        this.entities = [];
        this.enabled = true;
        this.priority = 0; // Wyższy priorytet = wcześniejsze wykonanie
        this.world = world;
    }
    /**
     * Sprawdza czy entity spełnia wymagania systemu
     */
    matchesEntity(entity) {
        if (!entity.active)
            return false;
        const requiredComponents = this.getRequiredComponents();
        return entity.hasComponents(requiredComponents);
    }
    /**
     * Dodaje entity do systemu
     */
    addEntity(entity) {
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
    removeEntity(entity) {
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
    getEntities() {
        return this.entities.slice(); // Zwraca kopię
    }
    /**
     * Zwraca liczbę entities w systemie
     */
    getEntityCount() {
        return this.entities.length;
    }
    /**
     * Pobiera entities z określonym komponentem
     */
    getEntitiesWith(componentType) {
        return this.entities.filter(entity => entity.hasComponent(componentType));
    }
    /**
     * Czyści wszystkie entities z systemu
     */
    clear() {
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
    destroy() {
        this.clear();
        if (this.onDisable) {
            this.onDisable();
        }
        this.enabled = false;
    }
}
exports.System = System;
/**
 * System specjalizujący się w renderowaniu
 */
class RenderSystem extends System {
    /**
     * Update może być pusty dla systemów renderujących
     */
    update(deltaTime) {
        // Domyślnie pusta implementacja
    }
}
exports.RenderSystem = RenderSystem;
/**
 * System z możliwością dodania dodatkowych filtrów
 */
class FilterableSystem extends System {
    constructor() {
        super(...arguments);
        this.entityFilters = [];
    }
    /**
     * Dodaje dodatkowy filtr dla entities
     */
    addEntityFilter(filter) {
        this.entityFilters.push(filter);
    }
    /**
     * Usuwa filtr
     */
    removeEntityFilter(filter) {
        const index = this.entityFilters.indexOf(filter);
        if (index >= 0) {
            this.entityFilters.splice(index, 1);
        }
    }
    /**
     * Sprawdza czy entity przechodzi przez wszystkie filtry
     */
    matchesEntity(entity) {
        if (!super.matchesEntity(entity))
            return false;
        return this.entityFilters.every(filter => filter(entity));
    }
}
exports.FilterableSystem = FilterableSystem;
//# sourceMappingURL=System.js.map