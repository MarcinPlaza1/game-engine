"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
/**
 * Entity w systemie ECS - kontener dla komponentów
 */
class Entity {
    constructor(id, name) {
        this.active = true;
        this.components = new Map();
        this.componentTypes = new Set();
        this.id = id;
        this.name = name;
    }
    /**
     * Dodaje komponent do entity
     */
    addComponent(component) {
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
    removeComponent(componentType) {
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
    getComponent(componentType) {
        const type = componentType.name;
        return this.components.get(type) || null;
    }
    /**
     * Sprawdza czy entity ma komponent danego typu
     */
    hasComponent(componentType) {
        const type = componentType.name;
        return this.components.has(type);
    }
    /**
     * Sprawdza czy entity ma wszystkie podane komponenty
     */
    hasComponents(componentTypes) {
        return componentTypes.every(type => this.hasComponent(type));
    }
    /**
     * Pobiera wszystkie komponenty
     */
    getAllComponents() {
        return Array.from(this.components.values());
    }
    /**
     * Pobiera nazwy typów wszystkich komponentów
     */
    getComponentTypes() {
        return Array.from(this.componentTypes);
    }
    /**
     * Klonuje entity (z komponentami)
     */
    clone(newId) {
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
    destroy() {
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
    toString() {
        const components = Array.from(this.componentTypes).join(', ');
        return `Entity(id: ${this.id}, name: ${this.name || 'unnamed'}, components: [${components}])`;
    }
}
exports.Entity = Entity;
//# sourceMappingURL=Entity.js.map