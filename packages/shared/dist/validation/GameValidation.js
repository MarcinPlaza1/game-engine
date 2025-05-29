/**
 * Funkcje walidacji dla gry RTS
 */
import { ResourceType, UnitType, BuildingType, Faction, GameMode, VictoryCondition } from '../types/GameState';
import { PlayerActionType, validateNetworkMessage } from '../protocols/NetworkProtocol';
/**
 * Tworzy pozytywny rezultat walidacji
 */
export function createValidResult(warnings) {
    return {
        isValid: true,
        errors: [],
        warnings: warnings || []
    };
}
/**
 * Tworzy negatywny rezultat walidacji
 */
export function createInvalidResult(errors, warnings) {
    return {
        isValid: false,
        errors: Array.isArray(errors) ? errors : [errors],
        warnings: warnings || []
    };
}
/**
 * Waliduje pozycję
 */
export function validatePosition(position) {
    const errors = [];
    if (!position || typeof position !== 'object') {
        errors.push('Position must be an object');
        return createInvalidResult(errors);
    }
    if (typeof position.x !== 'number' || isNaN(position.x)) {
        errors.push('Position.x must be a valid number');
    }
    if (typeof position.y !== 'number' || isNaN(position.y)) {
        errors.push('Position.y must be a valid number');
    }
    // Sprawdź rozsądne granice
    if (position.x < -10000 || position.x > 10000) {
        errors.push('Position.x is out of reasonable bounds');
    }
    if (position.y < -10000 || position.y > 10000) {
        errors.push('Position.y is out of reasonable bounds');
    }
    return errors.length > 0 ? createInvalidResult(errors) : createValidResult();
}
/**
 * Waliduje rozmiar
 */
export function validateSize(size) {
    const errors = [];
    if (!size || typeof size !== 'object') {
        errors.push('Size must be an object');
        return createInvalidResult(errors);
    }
    if (typeof size.width !== 'number' || isNaN(size.width) || size.width <= 0) {
        errors.push('Size.width must be a positive number');
    }
    if (typeof size.height !== 'number' || isNaN(size.height) || size.height <= 0) {
        errors.push('Size.height must be a positive number');
    }
    // Sprawdź maksymalne rozmiary
    if (size.width > 1000) {
        errors.push('Size.width is too large');
    }
    if (size.height > 1000) {
        errors.push('Size.height is too large');
    }
    return errors.length > 0 ? createInvalidResult(errors) : createValidResult();
}
/**
 * Waliduje Game ID
 */
export function validateGameId(id) {
    const errors = [];
    if (typeof id !== 'string') {
        errors.push('GameId must be a string');
        return createInvalidResult(errors);
    }
    if (id.length === 0) {
        errors.push('GameId cannot be empty');
    }
    if (id.length > 100) {
        errors.push('GameId is too long');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
        errors.push('GameId contains invalid characters');
    }
    return errors.length > 0 ? createInvalidResult(errors) : createValidResult();
}
/**
 * Waliduje nazwę gracza
 */
export function validatePlayerName(name) {
    const errors = [];
    if (typeof name !== 'string') {
        errors.push('Player name must be a string');
        return createInvalidResult(errors);
    }
    if (name.length === 0) {
        errors.push('Player name cannot be empty');
    }
    if (name.length < 2) {
        errors.push('Player name must be at least 2 characters long');
    }
    if (name.length > 20) {
        errors.push('Player name must be 20 characters or less');
    }
    if (!/^[a-zA-Z0-9_\-\s]+$/.test(name)) {
        errors.push('Player name contains invalid characters');
    }
    return errors.length > 0 ? createInvalidResult(errors) : createValidResult();
}
/**
 * Waliduje zasoby
 */
export function validateResources(resources) {
    const errors = [];
    if (!resources || typeof resources !== 'object') {
        errors.push('Resources must be an object');
        return createInvalidResult(errors);
    }
    for (const [type, amount] of Object.entries(resources)) {
        if (!Object.values(ResourceType).includes(type)) {
            errors.push(`Invalid resource type: ${type}`);
        }
        if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
            errors.push(`Invalid resource amount for ${type}: must be a non-negative number`);
        }
        if (amount > 1000000) {
            errors.push(`Resource amount for ${type} is too large`);
        }
    }
    return errors.length > 0 ? createInvalidResult(errors) : createValidResult();
}
/**
 * Waliduje gracza
 */
export function validatePlayer(player) {
    const errors = [];
    if (!player || typeof player !== 'object') {
        errors.push('Player must be an object');
        return createInvalidResult(errors);
    }
    // Waliduj ID
    const idResult = validateGameId(player.id);
    if (!idResult.isValid) {
        errors.push(...idResult.errors.map(e => `Player ID: ${e}`));
    }
    // Waliduj nazwę
    const nameResult = validatePlayerName(player.name);
    if (!nameResult.isValid) {
        errors.push(...nameResult.errors.map(e => `Player name: ${e}`));
    }
    // Waliduj fakcję
    if (!Object.values(Faction).includes(player.faction)) {
        errors.push('Invalid faction');
    }
    // Waliduj zasoby
    if (player.resources) {
        const resourcesResult = validateResources(player.resources);
        if (!resourcesResult.isValid) {
            errors.push(...resourcesResult.errors.map(e => `Player resources: ${e}`));
        }
    }
    // Waliduj kolor
    if (player.color && !/^#[0-9a-fA-F]{6}$/.test(player.color)) {
        errors.push('Player color must be a valid hex color');
    }
    // Waliduj AI difficulty
    if (player.isAI && player.aiDifficulty) {
        const validDifficulties = ['easy', 'medium', 'hard'];
        if (!validDifficulties.includes(player.aiDifficulty)) {
            errors.push('Invalid AI difficulty');
        }
    }
    return errors.length > 0 ? createInvalidResult(errors) : createValidResult();
}
/**
 * Waliduje jednostkę
 */
export function validateUnit(unit) {
    const errors = [];
    if (!unit || typeof unit !== 'object') {
        errors.push('Unit must be an object');
        return createInvalidResult(errors);
    }
    // Waliduj ID
    const idResult = validateGameId(unit.id);
    if (!idResult.isValid) {
        errors.push(...idResult.errors.map(e => `Unit ID: ${e}`));
    }
    // Waliduj player ID
    const playerIdResult = validateGameId(unit.playerId);
    if (!playerIdResult.isValid) {
        errors.push(...playerIdResult.errors.map(e => `Unit player ID: ${e}`));
    }
    // Waliduj typ
    if (!Object.values(UnitType).includes(unit.type)) {
        errors.push('Invalid unit type');
    }
    // Waliduj pozycję
    const positionResult = validatePosition(unit.position);
    if (!positionResult.isValid) {
        errors.push(...positionResult.errors.map(e => `Unit position: ${e}`));
    }
    // Waliduj rotację
    if (typeof unit.rotation !== 'number' || isNaN(unit.rotation)) {
        errors.push('Unit rotation must be a number');
    }
    // Waliduj statystyki
    if (unit.stats) {
        const statsResult = validateUnitStats(unit.stats);
        if (!statsResult.isValid) {
            errors.push(...statsResult.errors.map(e => `Unit stats: ${e}`));
        }
    }
    return errors.length > 0 ? createInvalidResult(errors) : createValidResult();
}
/**
 * Waliduje statystyki jednostki/budynku
 */
export function validateUnitStats(stats) {
    const errors = [];
    if (!stats || typeof stats !== 'object') {
        errors.push('Stats must be an object');
        return createInvalidResult(errors);
    }
    // Health
    if (typeof stats.health !== 'number' || stats.health < 0) {
        errors.push('Health must be a non-negative number');
    }
    if (typeof stats.maxHealth !== 'number' || stats.maxHealth <= 0) {
        errors.push('Max health must be a positive number');
    }
    if (stats.health > stats.maxHealth) {
        errors.push('Health cannot exceed max health');
    }
    // Armor
    if (typeof stats.armor !== 'number' || stats.armor < 0) {
        errors.push('Armor must be a non-negative number');
    }
    // Optional stats
    if (stats.attack !== undefined && (typeof stats.attack !== 'number' || stats.attack < 0)) {
        errors.push('Attack must be a non-negative number');
    }
    if (stats.range !== undefined && (typeof stats.range !== 'number' || stats.range < 0)) {
        errors.push('Range must be a non-negative number');
    }
    if (stats.moveSpeed !== undefined && (typeof stats.moveSpeed !== 'number' || stats.moveSpeed < 0)) {
        errors.push('Move speed must be a non-negative number');
    }
    // Cost
    if (stats.cost) {
        const costResult = validateResources(stats.cost);
        if (!costResult.isValid) {
            errors.push(...costResult.errors.map(e => `Cost: ${e}`));
        }
    }
    return errors.length > 0 ? createInvalidResult(errors) : createValidResult();
}
/**
 * Waliduje budynek
 */
export function validateBuilding(building) {
    const errors = [];
    if (!building || typeof building !== 'object') {
        errors.push('Building must be an object');
        return createInvalidResult(errors);
    }
    // Waliduj ID
    const idResult = validateGameId(building.id);
    if (!idResult.isValid) {
        errors.push(...idResult.errors.map(e => `Building ID: ${e}`));
    }
    // Waliduj typ
    if (!Object.values(BuildingType).includes(building.type)) {
        errors.push('Invalid building type');
    }
    // Waliduj pozycję
    const positionResult = validatePosition(building.position);
    if (!positionResult.isValid) {
        errors.push(...positionResult.errors.map(e => `Building position: ${e}`));
    }
    // Waliduj rozmiar
    const sizeResult = validateSize(building.size);
    if (!sizeResult.isValid) {
        errors.push(...sizeResult.errors.map(e => `Building size: ${e}`));
    }
    // Waliduj construction progress
    if (typeof building.constructionProgress !== 'number' ||
        building.constructionProgress < 0 ||
        building.constructionProgress > 1) {
        errors.push('Construction progress must be between 0 and 1');
    }
    return errors.length > 0 ? createInvalidResult(errors) : createValidResult();
}
/**
 * Waliduje ustawienia gry
 */
export function validateGameSettings(settings) {
    const errors = [];
    if (!settings || typeof settings !== 'object') {
        errors.push('Game settings must be an object');
        return createInvalidResult(errors);
    }
    // Game mode
    if (!Object.values(GameMode).includes(settings.gameMode)) {
        errors.push('Invalid game mode');
    }
    // Max players
    if (typeof settings.maxPlayers !== 'number' ||
        settings.maxPlayers < 1 ||
        settings.maxPlayers > 8) {
        errors.push('Max players must be between 1 and 8');
    }
    // Game speed
    if (typeof settings.gameSpeed !== 'number' ||
        settings.gameSpeed <= 0 ||
        settings.gameSpeed > 10) {
        errors.push('Game speed must be between 0 and 10');
    }
    // Victory conditions
    if (!Array.isArray(settings.victoryConditions)) {
        errors.push('Victory conditions must be an array');
    }
    else {
        for (const condition of settings.victoryConditions) {
            if (!Object.values(VictoryCondition).includes(condition)) {
                errors.push(`Invalid victory condition: ${condition}`);
            }
        }
    }
    // Turn time (dla turn-based)
    if (settings.turnTime !== undefined) {
        if (typeof settings.turnTime !== 'number' || settings.turnTime < 10 || settings.turnTime > 300) {
            errors.push('Turn time must be between 10 and 300 seconds');
        }
    }
    return errors.length > 0 ? createInvalidResult(errors) : createValidResult();
}
/**
 * Waliduje akcję gracza
 */
export function validatePlayerAction(action) {
    const errors = [];
    if (!action || typeof action !== 'object') {
        errors.push('Player action must be an object');
        return createInvalidResult(errors);
    }
    // Action type
    if (!Object.values(PlayerActionType).includes(action.actionType)) {
        errors.push('Invalid action type');
    }
    // Unit IDs
    if (action.unitIds !== undefined) {
        if (!Array.isArray(action.unitIds)) {
            errors.push('Unit IDs must be an array');
        }
        else {
            for (const unitId of action.unitIds) {
                const idResult = validateGameId(unitId);
                if (!idResult.isValid) {
                    errors.push(`Invalid unit ID: ${unitId}`);
                }
            }
        }
    }
    // Target position
    if (action.targetPosition !== undefined) {
        const positionResult = validatePosition(action.targetPosition);
        if (!positionResult.isValid) {
            errors.push(...positionResult.errors.map(e => `Target position: ${e}`));
        }
    }
    // Target ID
    if (action.targetId !== undefined) {
        const idResult = validateGameId(action.targetId);
        if (!idResult.isValid) {
            errors.push(...idResult.errors.map(e => `Target ID: ${e}`));
        }
    }
    return errors.length > 0 ? createInvalidResult(errors) : createValidResult();
}
/**
 * Waliduje wiadomość sieciową
 */
export function validateMessage(message) {
    const errors = [];
    if (!validateNetworkMessage(message)) {
        errors.push('Invalid network message format');
        return createInvalidResult(errors);
    }
    // Waliduj timestamp
    const now = Date.now();
    if (message.timestamp > now + 5000) { // 5 sekund w przyszłości
        errors.push('Message timestamp is too far in the future');
    }
    if (message.timestamp < now - 300000) { // 5 minut w przeszłości
        errors.push('Message timestamp is too old');
    }
    // Waliduj player ID jeśli istnieje
    if (message.playerId) {
        const idResult = validateGameId(message.playerId);
        if (!idResult.isValid) {
            errors.push(...idResult.errors.map(e => `Message player ID: ${e}`));
        }
    }
    // Waliduj game ID jeśli istnieje
    if (message.gameId) {
        const idResult = validateGameId(message.gameId);
        if (!idResult.isValid) {
            errors.push(...idResult.errors.map(e => `Message game ID: ${e}`));
        }
    }
    return errors.length > 0 ? createInvalidResult(errors) : createValidResult();
}
/**
 * Waliduje cały stan gry
 */
export function validateGameState(gameState) {
    const errors = [];
    const warnings = [];
    if (!gameState || typeof gameState !== 'object') {
        errors.push('Game state must be an object');
        return createInvalidResult(errors);
    }
    // Podstawowe pola
    const idResult = validateGameId(gameState.id);
    if (!idResult.isValid) {
        errors.push(...idResult.errors.map(e => `Game state ID: ${e}`));
    }
    // Game time
    if (typeof gameState.gameTime !== 'number' || gameState.gameTime < 0) {
        errors.push('Game time must be a non-negative number');
    }
    // Players
    if (!Array.isArray(gameState.players)) {
        errors.push('Players must be an array');
    }
    else {
        for (let i = 0; i < gameState.players.length; i++) {
            const playerResult = validatePlayer(gameState.players[i]);
            if (!playerResult.isValid) {
                errors.push(...playerResult.errors.map(e => `Player ${i}: ${e}`));
            }
        }
    }
    // Units
    if (!Array.isArray(gameState.units)) {
        errors.push('Units must be an array');
    }
    else {
        if (gameState.units.length > 1000) {
            warnings.push('Large number of units may impact performance');
        }
        for (let i = 0; i < gameState.units.length; i++) {
            const unitResult = validateUnit(gameState.units[i]);
            if (!unitResult.isValid) {
                errors.push(...unitResult.errors.map(e => `Unit ${i}: ${e}`));
            }
        }
    }
    // Buildings
    if (!Array.isArray(gameState.buildings)) {
        errors.push('Buildings must be an array');
    }
    else {
        for (let i = 0; i < gameState.buildings.length; i++) {
            const buildingResult = validateBuilding(gameState.buildings[i]);
            if (!buildingResult.isValid) {
                errors.push(...buildingResult.errors.map(e => `Building ${i}: ${e}`));
            }
        }
    }
    // Game settings
    if (gameState.gameSettings) {
        const settingsResult = validateGameSettings(gameState.gameSettings);
        if (!settingsResult.isValid) {
            errors.push(...settingsResult.errors.map(e => `Game settings: ${e}`));
        }
    }
    return errors.length > 0 ? createInvalidResult(errors, warnings) : createValidResult(warnings);
}
/**
 * Sanityzuje input (usuwa potencjalnie niebezpieczne znaki)
 */
export function sanitizeString(input, maxLength = 255) {
    if (typeof input !== 'string')
        return '';
    return input
        .replace(/[<>'"&]/g, '') // Usuń HTML/XSS
        .trim()
        .substring(0, maxLength);
}
/**
 * Sprawdza rate limiting dla gracza
 */
export function checkRateLimit(playerId, action, rateLimits) {
    const key = `${playerId}:${action}`;
    const now = Date.now();
    const lastAction = rateLimits.get(key) || 0;
    // Różne limity dla różnych akcji
    const limits = {
        'move': 100, // 100ms między ruchami
        'attack': 500, // 500ms między atakami
        'build': 1000, // 1s między budowaniem
        'chat': 2000, // 2s między wiadomościami
        'default': 50 // 50ms domyślnie
    };
    const limit = limits[action] || limits.default;
    if (now - lastAction < limit) {
        return false; // Rate limit exceeded
    }
    rateLimits.set(key, now);
    return true;
}
//# sourceMappingURL=GameValidation.js.map