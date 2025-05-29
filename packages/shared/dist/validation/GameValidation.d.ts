/**
 * Funkcje walidacji dla gry RTS
 */
import { GameId } from '../types/GameState';
/**
 * Rezultat walidacji
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
}
/**
 * Tworzy pozytywny rezultat walidacji
 */
export declare function createValidResult(warnings?: string[]): ValidationResult;
/**
 * Tworzy negatywny rezultat walidacji
 */
export declare function createInvalidResult(errors: string[], warnings?: string[]): ValidationResult;
/**
 * Waliduje pozycję
 */
export declare function validatePosition(position: any): ValidationResult;
/**
 * Waliduje rozmiar
 */
export declare function validateSize(size: any): ValidationResult;
/**
 * Waliduje Game ID
 */
export declare function validateGameId(id: any): ValidationResult;
/**
 * Waliduje nazwę gracza
 */
export declare function validatePlayerName(name: any): ValidationResult;
/**
 * Waliduje zasoby
 */
export declare function validateResources(resources: any): ValidationResult;
/**
 * Waliduje gracza
 */
export declare function validatePlayer(player: any): ValidationResult;
/**
 * Waliduje jednostkę
 */
export declare function validateUnit(unit: any): ValidationResult;
/**
 * Waliduje statystyki jednostki/budynku
 */
export declare function validateUnitStats(stats: any): ValidationResult;
/**
 * Waliduje budynek
 */
export declare function validateBuilding(building: any): ValidationResult;
/**
 * Waliduje ustawienia gry
 */
export declare function validateGameSettings(settings: any): ValidationResult;
/**
 * Waliduje akcję gracza
 */
export declare function validatePlayerAction(action: any): ValidationResult;
/**
 * Waliduje wiadomość sieciową
 */
export declare function validateMessage(message: any): ValidationResult;
/**
 * Waliduje cały stan gry
 */
export declare function validateGameState(gameState: any): ValidationResult;
/**
 * Sanityzuje input (usuwa potencjalnie niebezpieczne znaki)
 */
export declare function sanitizeString(input: string, maxLength?: number): string;
/**
 * Sprawdza rate limiting dla gracza
 */
export declare function checkRateLimit(playerId: GameId, action: string, rateLimits: Map<string, number>): boolean;
//# sourceMappingURL=GameValidation.d.ts.map