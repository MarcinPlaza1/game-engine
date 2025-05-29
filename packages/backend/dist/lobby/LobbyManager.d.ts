/**
 * Manager lobby - zarządza graczami przed dołączeniem do gier
 */
import { EventEmitter } from 'events';
import { GameId, Player, Faction } from '@rts-engine/shared';
/**
 * Rozszerzony gracz w lobby z dodatkowymi informacjami o połączeniu
 */
interface LobbyPlayer extends Player {
    socketId: string;
    joinTime: number;
    lastPing: number;
    roomId?: GameId;
}
/**
 * Manager lobby
 */
export declare class LobbyManager extends EventEmitter {
    private players;
    private socketToPlayer;
    private playerStats;
    private pingInterval;
    constructor();
    /**
     * Dodaje gracza do lobby
     */
    addPlayer(socketId: string, playerName: string, faction?: Faction): LobbyPlayer | null;
    /**
     * Usuwa gracza z lobby
     */
    removePlayer(socketId: string): boolean;
    /**
     * Pobiera gracza po socket ID
     */
    getPlayerBySocket(socketId: string): LobbyPlayer | null;
    /**
     * Pobiera gracza po ID
     */
    getPlayer(playerId: GameId): LobbyPlayer | null;
    /**
     * Pobiera wszystkich graczy w lobby
     */
    getAllPlayers(): LobbyPlayer[];
    /**
     * Pobiera graczy dostępnych do gry (nie w pokoju)
     */
    getAvailablePlayers(): LobbyPlayer[];
    /**
     * Aktualizuje ping gracza
     */
    updatePlayerPing(socketId: string): boolean;
    /**
     * Ustawia pokój gracza
     */
    setPlayerRoom(playerId: GameId, roomId: GameId | undefined): boolean;
    /**
     * Sprawdza czy nazwa gracza jest zajęta
     */
    isPlayerNameTaken(playerName: string): boolean;
    /**
     * Pobiera dostępną losową fakcję
     */
    private getRandomAvailableFaction;
    /**
     * Pobiera statystyki gracza
     */
    getPlayerStats(playerId: GameId): {
        gamesPlayed: number;
        wins: number;
        losses: number;
    } | null;
    /**
     * Aktualizuje statystyki gracza po grze
     */
    updatePlayerStats(playerId: GameId, won: boolean): void;
    /**
     * Pobiera ranking graczy (top 10)
     */
    getPlayerRanking(): Array<{
        player: LobbyPlayer;
        stats: any;
        winRate: number;
    }>;
    /**
     * Wyszukuje graczy według nazwy
     */
    searchPlayers(query: string): LobbyPlayer[];
    /**
     * Pobiera liczba graczy w lobby
     */
    getPlayerCount(): number;
    /**
     * Pobiera statystyki lobby
     */
    getLobbyStats(): {
        totalPlayers: number;
        availablePlayers: number;
        playersInGames: number;
        factionDistribution: Record<Faction, number>;
        averageSessionTime: number;
    };
    /**
     * Oblicza średni czas sesji
     */
    private getAverageSessionTime;
    /**
     * Rozpoczyna monitoring ping
     */
    private startPingMonitoring;
    /**
     * Zatrzymuje monitoring ping
     */
    private stopPingMonitoring;
    /**
     * Wysyła wiadomość broadcast do wszystkich graczy w lobby
     */
    broadcastToLobby(message: string, data?: any): void;
    /**
     * Wysyła wiadomość do konkretnego gracza
     */
    sendToPlayer(playerId: GameId, message: string, data?: any): boolean;
    /**
     * Zamyka lobby manager
     */
    shutdown(): void;
}
export {};
//# sourceMappingURL=LobbyManager.d.ts.map