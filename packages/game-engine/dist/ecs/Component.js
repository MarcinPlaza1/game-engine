"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Component = void 0;
exports.SingletonComponent = SingletonComponent;
exports.isSingletonComponent = isSingletonComponent;
/**
 * Abstrakcyjna klasa bazowa dla wszystkich komponentów w systemie ECS
 */
class Component {
    constructor() {
        this.entity = null;
        this.enabled = true;
    }
}
exports.Component = Component;
/**
 * Dekorator do oznaczania komponentów jako singletonów (jeden na entity)
 */
function SingletonComponent(target) {
    target.__singleton = true;
    return target;
}
/**
 * Sprawdza czy komponent jest singletonem
 */
function isSingletonComponent(componentType) {
    return componentType.__singleton === true;
}
//# sourceMappingURL=Component.js.map