/**
 * Instancja pojedynczej gry RTS
 */
import { EventEmitter } from 'events';
import { GameId, GameState, GameSettings, Player, PlayerAction } from '@rts-engine/shared';
/**
 * Instancja pojedynczej gry
 */
export declare class GameInstance extends EventEmitter {
    private gameState;
    private lastUpdate;
    private actionQueue;
    constructor(gameId: GameId, players: Player[], gameSettings: GameSettings);
    /**
     * Tworzy początkowy stan gry
     */
    private createInitialGameState;
    /**
     * Tworzy domyślną mapę
     */
    private createDefaultMap;
    /**
     * Generuje węzły zasobów
     */
    private generateResourceNodes;
    /**
     * Generuje punkty spawnu dla graczy
     */
    private generateSpawnPoints;
    /**
     * Tworzy początkowe jednostki dla graczy
     */
    private setupInitialUnits;
    /**
     * Główna metoda aktualizacji gry
     */
    update(deltaTime: number): void;
    /**
     * Dodaje akcję gracza do kolejki
     */
    addPlayerAction(playerId: GameId, action: PlayerAction): boolean;
    /**
     * Przetwarza kolejkę akcji graczy
     */
    private processActionQueue;
    /**
     * Wykonuje akcję gracza
     */
    private executePlayerAction;
    /**
     * Obsługuje ruch jednostek
     */
    private handleMoveUnits;
    /**
     * Obsługuje atak na cel
     */
    private handleAttackTarget;
    /**
     * Obsługuje trenowanie jednostek
     */
    private handleTrainUnit;
    /**
     * Obsługuje budowanie struktur
     */
    private handleBuildStructure;
    /**
     * Obsługuje zbieranie zasobów
     */
    private handleGatherResource;
    /**
     * Aktualizuje jednostki
     */
    private updateUnits;
    /**
     * Aktualizuje budynki
     */
    private updateBuildings;
    /**
     * Aktualizuje zasoby
     */
    private updateResources;
    /**
     * Sprawdza warunki zwycięstwa
     */
    private checkVictoryConditions;
    /**
     * Obsługuje śmierć jednostki
     */
    private handleUnitDeath;
    /**
     * Sprawdza czy gracz ma wystarczające zasoby
     */
    private hasEnoughResources;
    /**
     * Odejmuje zasoby od gracza
     */
    private subtractPlayerResources;
    /**
     * Emituje aktualizację stanu gry
     */
    private emitGameUpdate;
    /**
     * Sprawdza czy jednostka się zmieniła (uproszczone)
     */
    private hasUnitChanged;
    /**
     * Emituje event gry
     */
    private emitGameEvent;
    /**
     * Zwraca pełny stan gry
     */
    getGameState(): GameState;
    /**
     * Kończy grę
     */
    endGame(winnerId?: GameId): void;
}
//# sourceMappingURL=GameInstance.d.ts.map