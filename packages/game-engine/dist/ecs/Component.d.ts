import { Entity } from './Entity';
/**
 * Abstrakcyjna klasa bazowa dla wszystkich komponentów w systemie ECS
 */
export declare abstract class Component {
    entity: Entity | null;
    enabled: boolean;
    /**
     * Wywoływane gdy komponent jest dodawany do entity
     */
    onAttach?(): void;
    /**
     * Wywoływane gdy komponent jest usuwany z entity
     */
    onDetach?(): void;
    /**
     * Wywoływane przy aktualizacji komponentu
     */
    update?(deltaTime: number): void;
    /**
     * Klonuje komponent
     */
    clone?(): Component;
    /**
     * Niszczy komponent i zwalnia zasoby
     */
    destroy?(): void;
    /**
     * Serializuje komponent do JSON
     */
    serialize?(): any;
    /**
     * Deserializuje komponent z JSON
     */
    deserialize?(data: any): void;
}
/**
 * Dekorator do oznaczania komponentów jako singletonów (jeden na entity)
 */
export declare function SingletonComponent<T extends new (...args: any[]) => Component>(target: T): T;
/**
 * Sprawdza czy komponent jest singletonem
 */
export declare function isSingletonComponent(componentType: new (...args: any[]) => Component): boolean;
//# sourceMappingURL=Component.d.ts.map