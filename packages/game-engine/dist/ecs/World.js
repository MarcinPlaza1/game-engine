"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.World = void 0;
const eventemitter3_1 = require("eventemitter3");
const Entity_1 = require("./Entity");
const System_1 = require("./System");
/**
 * Główny manager dla systemu ECS
 */
class World extends eventemitter3_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.entities = new Map();
        this.systems = [];
        this.renderSystems = [];
        this.nextEntityId = 1;
        this.entitiesToAdd = [];
        this.entitiesToRemove = [];
        this.systemsToAdd = [];
        this.systemsToRemove = [];
    }
    /**
     * Tworzy nową entity
     */
    createEntity(name) {
        const entity = new Entity_1.Entity(this.nextEntityId++, name);
        this.entitiesToAdd.push(entity);
        return entity;
    }
    /**
     * Dodaje istniejącą entity do świata
     */
    addEntity(entity) {
        if (!this.entitiesToAdd.includes(entity)) {
            this.entitiesToAdd.push(entity);
        }
    }
    /**
     * Usuwa entity ze świata (oznacza do usunięcia)
     */
    removeEntity(entityId) {
        if (!this.entitiesToRemove.includes(entityId)) {
            this.entitiesToRemove.push(entityId);
        }
    }
    /**
     * Pobiera entity po ID
     */
    getEntity(entityId) {
        return this.entities.get(entityId) || null;
    }
    /**
     * Pobiera wszystkie entities
     */
    getAllEntities() {
        return Array.from(this.entities.values());
    }
    /**
     * Pobiera entities z określonym komponentem
     */
    getEntitiesWith(componentType) {
        const result = [];
        for (const entity of this.entities.values()) {
            if (entity.hasComponent(componentType)) {
                result.push(entity);
            }
        }
        return result;
    }
    /**
     * Pobiera entities z wszystkimi określonymi komponentami
     */
    getEntitiesWithComponents(componentTypes) {
        const result = [];
        for (const entity of this.entities.values()) {
            if (entity.hasComponents(componentTypes)) {
                result.push(entity);
            }
        }
        return result;
    }
    /**
     * Znajduje entity po nazwie
     */
    findEntityByName(name) {
        for (const entity of this.entities.values()) {
            if (entity.name === name) {
                return entity;
            }
        }
        return null;
    }
    /**
     * Znajduje wszystkie entities o podanej nazwie
     */
    findEntitiesByName(name) {
        const result = [];
        for (const entity of this.entities.values()) {
            if (entity.name === name) {
                result.push(entity);
            }
        }
        return result;
    }
    /**
     * Dodaje system do świata
     */
    addSystem(system) {
        if (!this.systemsToAdd.includes(system)) {
            this.systemsToAdd.push(system);
        }
    }
    /**
     * Usuwa system ze świata
     */
    removeSystem(system) {
        if (!this.systemsToRemove.includes(system)) {
            this.systemsToRemove.push(system);
        }
    }
    /**
     * Pobiera system danego typu
     */
    getSystem(systemType) {
        const allSystems = [...this.systems, ...this.renderSystems];
        return allSystems.find(s => s instanceof systemType) || null;
    }
    /**
     * Pobiera wszystkie systemy
     */
    getAllSystems() {
        return [...this.systems, ...this.renderSystems];
    }
    /**
     * Aktualizuje wszystkie systemy i entities
     */
    update(deltaTime) {
        // Przetwarzanie kolejki dodawania/usuwania
        this.processEntityQueue();
        this.processSystemQueue();
        // Aktualizacja systemów (posortowanych według priorytetu)
        const activeSystems = this.systems.filter(s => s.enabled);
        activeSystems.sort((a, b) => b.priority - a.priority);
        for (const system of activeSystems) {
            system.update(deltaTime);
        }
        this.emit('updated', deltaTime);
    }
    /**
     * Renderuje wszystkie systemy renderujące
     */
    render(deltaTime) {
        const activeRenderSystems = this.renderSystems.filter(s => s.enabled);
        activeRenderSystems.sort((a, b) => b.priority - a.priority);
        for (const system of activeRenderSystems) {
            system.render(deltaTime);
        }
        this.emit('rendered', deltaTime);
    }
    /**
     * Czyści wszystkie entities i systemy
     */
    clear() {
        // Niszczy wszystkie entities
        for (const entity of this.entities.values()) {
            entity.destroy();
        }
        this.entities.clear();
        // Niszczy wszystkie systemy
        for (const system of [...this.systems, ...this.renderSystems]) {
            system.destroy();
        }
        this.systems = [];
        this.renderSystems = [];
        // Czyści kolejki
        this.entitiesToAdd = [];
        this.entitiesToRemove = [];
        this.systemsToAdd = [];
        this.systemsToRemove = [];
        this.emit('cleared');
    }
    /**
     * Zwraca statystyki świata
     */
    getStats() {
        return {
            entityCount: this.entities.size,
            systemCount: this.systems.length,
            renderSystemCount: this.renderSystems.length,
            nextEntityId: this.nextEntityId
        };
    }
    // === METODY PRYWATNE ===
    /**
     * Przetwarza kolejkę dodawania/usuwania entities
     */
    processEntityQueue() {
        // Dodawanie nowych entities
        for (const entity of this.entitiesToAdd) {
            this.entities.set(entity.id, entity);
            this.addEntityToSystems(entity);
            this.emit('entityAdded', entity);
        }
        this.entitiesToAdd = [];
        // Usuwanie entities
        for (const entityId of this.entitiesToRemove) {
            const entity = this.entities.get(entityId);
            if (entity) {
                this.removeEntityFromSystems(entity);
                entity.destroy();
                this.entities.delete(entityId);
                this.emit('entityRemoved', entity);
            }
        }
        this.entitiesToRemove = [];
    }
    /**
     * Przetwarza kolejkę dodawania/usuwania systemów
     */
    processSystemQueue() {
        // Dodawanie nowych systemów
        for (const system of this.systemsToAdd) {
            if (system instanceof System_1.RenderSystem) {
                this.renderSystems.push(system);
            }
            else {
                this.systems.push(system);
            }
            // Dodaj istniejące entities do nowego systemu
            for (const entity of this.entities.values()) {
                if (system.matchesEntity(entity)) {
                    system.addEntity(entity);
                }
            }
            system.onEnable?.();
            this.emit('systemAdded', system);
        }
        this.systemsToAdd = [];
        // Usuwanie systemów
        for (const systemToRemove of this.systemsToRemove) {
            const index = this.systems.indexOf(systemToRemove);
            const renderIndex = this.renderSystems.indexOf(systemToRemove);
            if (index >= 0) {
                this.systems.splice(index, 1);
                systemToRemove.destroy();
                this.emit('systemRemoved', systemToRemove);
            }
            else if (renderIndex >= 0) {
                this.renderSystems.splice(renderIndex, 1);
                systemToRemove.destroy();
                this.emit('systemRemoved', systemToRemove);
            }
        }
        this.systemsToRemove = [];
    }
    /**
     * Dodaje entity do odpowiednich systemów
     */
    addEntityToSystems(entity) {
        const allSystems = [...this.systems, ...this.renderSystems];
        for (const system of allSystems) {
            if (system.matchesEntity(entity)) {
                system.addEntity(entity);
            }
        }
    }
    /**
     * Usuwa entity z wszystkich systemów
     */
    removeEntityFromSystems(entity) {
        const allSystems = [...this.systems, ...this.renderSystems];
        for (const system of allSystems) {
            system.removeEntity(entity);
        }
    }
    /**
     * Aktualizuje przynależność entity do systemów
     * (wywoływane gdy entity dodaje/usuwa komponenty)
     */
    updateEntityInSystems(entity) {
        const allSystems = [...this.systems, ...this.renderSystems];
        for (const system of allSystems) {
            const currentlyInSystem = system.getEntities().includes(entity);
            const shouldBeInSystem = system.matchesEntity(entity);
            if (!currentlyInSystem && shouldBeInSystem) {
                system.addEntity(entity);
            }
            else if (currentlyInSystem && !shouldBeInSystem) {
                system.removeEntity(entity);
            }
        }
    }
}
exports.World = World;
//# sourceMappingURL=World.js.map