/**
 * Manager lobby - zarządza graczami przed dołączeniem do gier
 */

import { EventEmitter } from 'events';
import { 
  GameId, 
  Player, 
  Faction, 
  PlayerStatus,
  createDefaultPlayer,
  generateGameId,
  FACTION_COLORS 
} from '@rts-engine/shared';
import { logger } from '../utils/Logger.js';

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
export class LobbyManager extends EventEmitter {
  private players: Map<GameId, LobbyPlayer> = new Map();
  private socketToPlayer: Map<string, GameId> = new Map();
  private playerStats: Map<GameId, { gamesPlayed: number; wins: number; losses: number }> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.startPingMonitoring();
    
    logger.info('LobbyManager initialized');
  }

  /**
   * Dodaje gracza do lobby
   */
  addPlayer(socketId: string, playerName: string, faction?: Faction): LobbyPlayer | null {
    // Sprawdź czy socket nie jest już zarejestrowany
    if (this.socketToPlayer.has(socketId)) {
      logger.warn('Socket already has player', { socketId });
      return null;
    }

    // Sprawdź czy nazwa nie jest zajęta
    if (this.isPlayerNameTaken(playerName)) {
      logger.warn('Player name already taken', { playerName });
      return null;
    }

    // Wybierz fakcję jeśli nie podano
    if (!faction) {
      faction = this.getRandomAvailableFaction();
    }

    const playerId = generateGameId();
    const lobbyPlayer: LobbyPlayer = {
      ...createDefaultPlayer(playerId, playerName, faction),
      socketId,
      joinTime: Date.now(),
      lastPing: Date.now(),
      status: PlayerStatus.CONNECTED
    };

    this.players.set(playerId, lobbyPlayer);
    this.socketToPlayer.set(socketId, playerId);
    
    // Inicjalizuj statystyki gracza
    this.playerStats.set(playerId, { gamesPlayed: 0, wins: 0, losses: 0 });

    logger.info('Player joined lobby', { 
      playerId, 
      playerName, 
      faction,
      totalPlayers: this.players.size 
    });

    this.emit('playerJoined', lobbyPlayer);
    return lobbyPlayer;
  }

  /**
   * Usuwa gracza z lobby
   */
  removePlayer(socketId: string): boolean {
    const playerId = this.socketToPlayer.get(socketId);
    if (!playerId) return false;

    const player = this.players.get(playerId);
    if (!player) return false;

    this.players.delete(playerId);
    this.socketToPlayer.delete(socketId);

    logger.info('Player left lobby', { 
      playerId, 
      playerName: player.name,
      remainingPlayers: this.players.size 
    });

    this.emit('playerLeft', player);
    return true;
  }

  /**
   * Pobiera gracza po socket ID
   */
  getPlayerBySocket(socketId: string): LobbyPlayer | null {
    const playerId = this.socketToPlayer.get(socketId);
    return playerId ? this.players.get(playerId) || null : null;
  }

  /**
   * Pobiera gracza po ID
   */
  getPlayer(playerId: GameId): LobbyPlayer | null {
    return this.players.get(playerId) || null;
  }

  /**
   * Pobiera wszystkich graczy w lobby
   */
  getAllPlayers(): LobbyPlayer[] {
    return Array.from(this.players.values());
  }

  /**
   * Pobiera graczy dostępnych do gry (nie w pokoju)
   */
  getAvailablePlayers(): LobbyPlayer[] {
    return Array.from(this.players.values()).filter(player => !player.roomId);
  }

  /**
   * Aktualizuje ping gracza
   */
  updatePlayerPing(socketId: string): boolean {
    const playerId = this.socketToPlayer.get(socketId);
    if (!playerId) return false;

    const player = this.players.get(playerId);
    if (!player) return false;

    player.lastPing = Date.now();
    return true;
  }

  /**
   * Ustawia pokój gracza
   */
  setPlayerRoom(playerId: GameId, roomId: GameId | undefined): boolean {
    const player = this.players.get(playerId);
    if (!player) return false;

    const oldRoomId = player.roomId;
    player.roomId = roomId;
    player.status = roomId ? PlayerStatus.PLAYING : PlayerStatus.CONNECTED;

    logger.info('Player room changed', { 
      playerId, 
      playerName: player.name,
      oldRoomId, 
      newRoomId: roomId 
    });

    this.emit('playerRoomChanged', { player, oldRoomId, newRoomId: roomId });
    return true;
  }

  /**
   * Sprawdza czy nazwa gracza jest zajęta
   */
  isPlayerNameTaken(playerName: string): boolean {
    return Array.from(this.players.values()).some(player => 
      player.name.toLowerCase() === playerName.toLowerCase()
    );
  }

  /**
   * Pobiera dostępną losową fakcję
   */
  private getRandomAvailableFaction(): Faction {
    const allFactions = Object.values(Faction);
    const usedFactions = Array.from(this.players.values()).map(p => p.faction);
    
    // Znajdź najmniej używaną fakcję
    const factionCounts = allFactions.map(faction => ({
      faction,
      count: usedFactions.filter(f => f === faction).length
    }));

    factionCounts.sort((a, b) => a.count - b.count);
    return factionCounts[0].faction;
  }

  /**
   * Pobiera statystyki gracza
   */
  getPlayerStats(playerId: GameId): { gamesPlayed: number; wins: number; losses: number } | null {
    return this.playerStats.get(playerId) || null;
  }

  /**
   * Aktualizuje statystyki gracza po grze
   */
  updatePlayerStats(playerId: GameId, won: boolean): void {
    const stats = this.playerStats.get(playerId);
    if (!stats) return;

    stats.gamesPlayed++;
    if (won) {
      stats.wins++;
    } else {
      stats.losses++;
    }

    logger.debug('Player stats updated', { 
      playerId, 
      stats,
      won 
    });

    this.emit('playerStatsUpdated', { playerId, stats });
  }

  /**
   * Pobiera ranking graczy (top 10)
   */
  getPlayerRanking(): Array<{ player: LobbyPlayer; stats: any; winRate: number }> {
    const rankings = Array.from(this.players.values())
      .map(player => {
        const stats = this.playerStats.get(player.id) || { gamesPlayed: 0, wins: 0, losses: 0 };
        const winRate = stats.gamesPlayed > 0 ? stats.wins / stats.gamesPlayed : 0;
        return { player, stats, winRate };
      })
      .filter(entry => entry.stats.gamesPlayed > 0) // Tylko gracze z grami
      .sort((a, b) => {
        // Sortuj według win rate, potem według liczby gier
        if (b.winRate !== a.winRate) {
          return b.winRate - a.winRate;
        }
        return b.stats.gamesPlayed - a.stats.gamesPlayed;
      })
      .slice(0, 10);

    return rankings;
  }

  /**
   * Wyszukuje graczy według nazwy
   */
  searchPlayers(query: string): LobbyPlayer[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.players.values()).filter(player =>
      player.name.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Pobiera liczba graczy w lobby
   */
  getPlayerCount(): number {
    return this.players.size;
  }

  /**
   * Pobiera statystyki lobby
   */
  getLobbyStats() {
    const players = Array.from(this.players.values());
    const factionCounts = Object.values(Faction).reduce((acc, faction) => {
      acc[faction] = players.filter(p => p.faction === faction).length;
      return acc;
    }, {} as Record<Faction, number>);

    return {
      totalPlayers: this.players.size,
      availablePlayers: this.getAvailablePlayers().length,
      playersInGames: players.filter(p => p.roomId).length,
      factionDistribution: factionCounts,
      averageSessionTime: this.getAverageSessionTime()
    };
  }

  /**
   * Oblicza średni czas sesji
   */
  private getAverageSessionTime(): number {
    const players = Array.from(this.players.values());
    if (players.length === 0) return 0;

    const now = Date.now();
    const totalTime = players.reduce((sum, player) => sum + (now - player.joinTime), 0);
    return totalTime / players.length;
  }

  /**
   * Rozpoczyna monitoring ping
   */
  private startPingMonitoring(): void {
    this.pingInterval = setInterval(() => {
      const now = Date.now();
      const timeoutThreshold = 60000; // 60 sekund

      for (const [playerId, player] of this.players.entries()) {
        if (now - player.lastPing > timeoutThreshold) {
          logger.warn('Player ping timeout', { 
            playerId, 
            playerName: player.name,
            lastPing: player.lastPing 
          });
          
          this.removePlayer(player.socketId);
        }
      }
    }, 30000); // Sprawdzaj co 30 sekund

    logger.debug('Ping monitoring started');
  }

  /**
   * Zatrzymuje monitoring ping
   */
  private stopPingMonitoring(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
      logger.debug('Ping monitoring stopped');
    }
  }

  /**
   * Wysyła wiadomość broadcast do wszystkich graczy w lobby
   */
  broadcastToLobby(message: string, data?: any): void {
    this.emit('broadcastMessage', {
      type: 'lobby_announcement',
      message,
      data,
      timestamp: Date.now()
    });

    logger.info('Broadcast sent to lobby', { 
      message, 
      playerCount: this.players.size 
    });
  }

  /**
   * Wysyła wiadomość do konkretnego gracza
   */
  sendToPlayer(playerId: GameId, message: string, data?: any): boolean {
    const player = this.players.get(playerId);
    if (!player) return false;

    this.emit('playerMessage', {
      playerId,
      socketId: player.socketId,
      type: 'direct_message',
      message,
      data,
      timestamp: Date.now()
    });

    return true;
  }

  /**
   * Zamyka lobby manager
   */
  shutdown(): void {
    logger.info('Shutting down LobbyManager...');
    
    this.stopPingMonitoring();
    
    // Powiadom wszystkich graczy o zamknięciu
    this.broadcastToLobby('Serwer zostanie zamknięty. Dziękujemy za grę!');
    
    // Wyczyść wszystkich graczy
    this.players.clear();
    this.socketToPlayer.clear();
    this.playerStats.clear();
    
    logger.info('LobbyManager shutdown complete');
  }
} 