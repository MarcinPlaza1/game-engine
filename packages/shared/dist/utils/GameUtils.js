/**
 * Utility functions dla gry RTS
 */
import { ResourceType } from '../types/GameState';
/**
 * Generuje unikalny ID
 */
export function generateGameId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}
/**
 * Sprawdza czy punkt jest w prostokącie
 */
export function isPointInRectangle(point, rect) {
    return (point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height);
}
/**
 * Sprawdza czy dwa prostokąty się przecinają
 */
export function rectanglesIntersect(rect1, rect2) {
    return !(rect1.x + rect1.width < rect2.x ||
        rect2.x + rect2.width < rect1.x ||
        rect1.y + rect1.height < rect2.y ||
        rect2.y + rect2.height < rect1.y);
}
/**
 * Oblicza odległość między dwoma punktami
 */
export function distanceBetween(pos1, pos2) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
}
/**
 * Oblicza kwadrat odległości (szybsze dla porównań)
 */
export function distanceSquared(pos1, pos2) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return dx * dx + dy * dy;
}
/**
 * Normalizuje kąt do zakresu 0-2π
 */
export function normalizeAngle(angle) {
    while (angle < 0)
        angle += Math.PI * 2;
    while (angle >= Math.PI * 2)
        angle -= Math.PI * 2;
    return angle;
}
/**
 * Oblicza kąt między dwoma punktami
 */
export function angleBetween(from, to) {
    return Math.atan2(to.y - from.y, to.x - from.x);
}
/**
 * Interpoluje liniowo między dwoma wartościami
 */
export function lerp(start, end, t) {
    return start + (end - start) * t;
}
/**
 * Interpoluje pozycję
 */
export function lerpPosition(start, end, t) {
    return {
        x: lerp(start.x, end.x, t),
        y: lerp(start.y, end.y, t)
    };
}
/**
 * Ogranicza wartość do zakresu
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
/**
 * Sprawdza czy pozycja jest w zasięgu
 */
export function isInRange(from, to, range) {
    return distanceSquared(from, to) <= range * range;
}
/**
 * Znajduje najbliższą jednostkę do pozycji
 */
export function findNearestUnit(position, units, maxDistance) {
    let nearest = null;
    let nearestDistance = maxDistance ? maxDistance * maxDistance : Infinity;
    for (const unit of units) {
        const dist = distanceSquared(position, unit.position);
        if (dist < nearestDistance) {
            nearest = unit;
            nearestDistance = dist;
        }
    }
    return nearest;
}
/**
 * Znajduje jednostki w zasięgu
 */
export function findUnitsInRange(center, units, range) {
    const rangeSquared = range * range;
    return units.filter(unit => distanceSquared(center, unit.position) <= rangeSquared);
}
/**
 * Sprawdza czy gracz ma wystarczające zasoby
 */
export function hasEnoughResources(playerResources, requiredResources) {
    for (const [resourceType, amount] of Object.entries(requiredResources)) {
        const playerAmount = playerResources[resourceType] || 0;
        if (playerAmount < amount) {
            return false;
        }
    }
    return true;
}
/**
 * Odejmuje zasoby od gracza
 */
export function subtractResources(playerResources, cost) {
    const result = { ...playerResources };
    for (const [resourceType, amount] of Object.entries(cost)) {
        const currentAmount = result[resourceType] || 0;
        result[resourceType] = Math.max(0, currentAmount - amount);
    }
    return result;
}
/**
 * Dodaje zasoby do gracza
 */
export function addResources(playerResources, resources) {
    const result = { ...playerResources };
    for (const [resourceType, amount] of Object.entries(resources)) {
        const currentAmount = result[resourceType] || 0;
        result[resourceType] = currentAmount + amount;
    }
    return result;
}
/**
 * Oblicza całkowitą wartość zasobów
 */
export function getTotalResourceValue(resources) {
    return Object.values(resources).reduce((sum, amount) => sum + (amount || 0), 0);
}
/**
 * Sprawdza czy jednostka należy do gracza
 */
export function isOwnedByPlayer(unit, playerId) {
    return unit.playerId === playerId;
}
/**
 * Filtruje jednostki według gracza
 */
export function filterUnitsByPlayer(units, playerId) {
    return units.filter(unit => unit.playerId === playerId);
}
/**
 * Filtruje budynki według gracza
 */
export function filterBuildingsByPlayer(buildings, playerId) {
    return buildings.filter(building => building.playerId === playerId);
}
/**
 * Sprawdza czy jednostka żyje
 */
export function isUnitAlive(unit) {
    return unit.stats.health > 0;
}
/**
 * Sprawdza czy budynek jest ukończony
 */
export function isBuildingComplete(building) {
    return !building.isUnderConstruction && building.constructionProgress >= 1;
}
/**
 * Oblicza bounding box dla jednostki
 */
export function getUnitBounds(unit) {
    // Dla jednostek używamy stałego rozmiaru
    const size = 16; // Default unit size
    return {
        x: unit.position.x - size / 2,
        y: unit.position.y - size / 2,
        width: size,
        height: size
    };
}
/**
 * Oblicza bounding box dla budynku
 */
export function getBuildingBounds(building) {
    return {
        x: building.position.x,
        y: building.position.y,
        width: building.size.width,
        height: building.size.height
    };
}
/**
 * Sprawdza kolizję między jednostkami
 */
export function checkUnitCollision(unit1, unit2) {
    const bounds1 = getUnitBounds(unit1);
    const bounds2 = getUnitBounds(unit2);
    return rectanglesIntersect(bounds1, bounds2);
}
/**
 * Sprawdza kolizję jednostki z budynkiem
 */
export function checkUnitBuildingCollision(unit, building) {
    const unitBounds = getUnitBounds(unit);
    const buildingBounds = getBuildingBounds(building);
    return rectanglesIntersect(unitBounds, buildingBounds);
}
/**
 * Oblicza centrum prostokąta
 */
export function getRectangleCenter(rect) {
    return {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2
    };
}
/**
 * Sprawdza czy pozycja jest wolna (brak kolizji)
 */
export function isPositionFree(position, units, buildings, excludeUnit) {
    // Sprawdź kolizje z jednostkami
    for (const unit of units) {
        if (excludeUnit && unit.id === excludeUnit)
            continue;
        if (distanceSquared(position, unit.position) < 16 * 16) { // 16px radius
            return false;
        }
    }
    // Sprawdź kolizje z budynkami
    for (const building of buildings) {
        const bounds = getBuildingBounds(building);
        if (isPointInRectangle(position, bounds)) {
            return false;
        }
    }
    return true;
}
/**
 * Znajduje najbliższą wolną pozycję
 */
export function findNearestFreePosition(targetPosition, units, buildings, maxDistance = 100, step = 8) {
    // Sprawdź czy target jest już wolny
    if (isPositionFree(targetPosition, units, buildings)) {
        return targetPosition;
    }
    // Sprawdź pozycje w spirali
    for (let radius = step; radius <= maxDistance; radius += step) {
        const positions = getCirclePositions(targetPosition, radius, 8);
        for (const pos of positions) {
            if (isPositionFree(pos, units, buildings)) {
                return pos;
            }
        }
    }
    return null;
}
/**
 * Generuje pozycje na okręgu
 */
export function getCirclePositions(center, radius, count) {
    const positions = [];
    const angleStep = (Math.PI * 2) / count;
    for (let i = 0; i < count; i++) {
        const angle = i * angleStep;
        positions.push({
            x: center.x + Math.cos(angle) * radius,
            y: center.y + Math.sin(angle) * radius
        });
    }
    return positions;
}
/**
 * Sortuje jednostki według odległości od punktu
 */
export function sortUnitsByDistance(units, from) {
    return [...units].sort((a, b) => {
        const distA = distanceSquared(from, a.position);
        const distB = distanceSquared(from, b.position);
        return distA - distB;
    });
}
/**
 * Grupuje jednostki według typu
 */
export function groupUnitsByType(units) {
    const groups = new Map();
    for (const unit of units) {
        if (!groups.has(unit.type)) {
            groups.set(unit.type, []);
        }
        groups.get(unit.type).push(unit);
    }
    return groups;
}
/**
 * Oblicza statystyki zespołu jednostek
 */
export function calculateGroupStats(units) {
    if (units.length === 0) {
        return { totalHealth: 0, totalAttack: 0, averageSpeed: 0, count: 0 };
    }
    let totalHealth = 0;
    let totalAttack = 0;
    let totalSpeed = 0;
    for (const unit of units) {
        totalHealth += unit.stats.health;
        totalAttack += unit.stats.attack || 0;
        totalSpeed += unit.stats.moveSpeed || 0;
    }
    return {
        totalHealth,
        totalAttack,
        averageSpeed: totalSpeed / units.length,
        count: units.length
    };
}
/**
 * Formatuje zasoby jako string
 */
export function formatResources(resources) {
    const parts = [];
    for (const [type, amount] of Object.entries(resources)) {
        if (amount && amount > 0) {
            parts.push(`${amount} ${type}`);
        }
    }
    return parts.join(', ');
}
/**
 * Parsuje string z zasobami
 */
export function parseResources(resourceString) {
    const resources = {};
    const parts = resourceString.split(',');
    for (const part of parts) {
        const match = part.trim().match(/(\d+)\s+(\w+)/);
        if (match) {
            const amount = parseInt(match[1]);
            const type = match[2];
            if (Object.values(ResourceType).includes(type)) {
                resources[type] = amount;
            }
        }
    }
    return resources;
}
//# sourceMappingURL=GameUtils.js.map