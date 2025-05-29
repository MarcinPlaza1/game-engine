import { useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { 
  Users, 
  Crown, 
  Play, 
  ArrowLeft, 
  Settings,
  UserCheck,
  UserX,
  Shield,
  Bot
} from 'lucide-react'
import { useGame } from '../context/GameContext'
import { FACTION_COLORS, Faction } from '@rts-engine/shared'
import Chat from './Chat'

const Container = styled.div`
  display: flex;
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  height: 80vh;
`

const LeftPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const RightPanel = styled.div`
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`

const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;
`

const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
`

const Button = styled(motion.button)<{ $variant?: 'primary' | 'secondary' | 'danger' | 'ai' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  ${props => {
    if (props.$variant === 'ai') {
      return `
        background: #8b5cf6;
        color: white;
        
        &:hover {
          background: #7c3aed;
        }
      `
    }
    if (props.$variant === 'danger') {
      return `
        background: #ef4444;
        color: white;
        
        &:hover {
          background: #dc2626;
        }
      `
    }
    if (props.$variant === 'secondary') {
      return `
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
        
        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `
    }
    return `
      background: #4ade80;
      color: #065f46;
      
      &:hover {
        background: #22c55e;
      }
    `
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const RoomInfo = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
`

const RoomName = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const RoomDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  font-size: 0.9rem;
  opacity: 0.8;
`

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const PlayersList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  flex: 1;
`

const PlayerCard = styled(motion.div)<{ $isHost: boolean; $isReady: boolean; $isAI: boolean }>`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  border: 2px solid;
  transition: all 0.2s;
  
  ${props => {
    if (props.$isAI) {
      return `border-color: #8b5cf6;`
    }
    if (props.$isHost) {
      return `border-color: #fbbf24;`
    }
    if (props.$isReady) {
      return `border-color: #22c55e;`
    }
    return `border-color: rgba(255, 255, 255, 0.1);`
  }}
`

const PlayerHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`

const PlayerAvatar = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  color: white;
  position: relative;
`

const AIBadge = styled.div`
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: #8b5cf6;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
`

const PlayerInfo = styled.div`
  flex: 1;
`

const PlayerName = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const PlayerStatus = styled.div`
  font-size: 0.8rem;
  opacity: 0.7;
  margin-top: 0.25rem;
`

const PlayerActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const FactionSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.85rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #4ade80;
  }
  
  option {
    background: #1e3c72;
    color: white;
  }
`

const ReadyButton = styled(motion.button)<{ $ready: boolean }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  
  ${props => props.$ready ? `
    background: #22c55e;
    color: white;
  ` : `
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  `}
`

const EmptySlot = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.5rem;
  opacity: 0.6;
  font-size: 0.9rem;
`

const GameSettings = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
`

const SettingsTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
  
  &:last-child {
    border-bottom: none;
  }
`

const SettingLabel = styled.div`
  flex: 1;
  opacity: 0.8;
`

const SettingValue = styled.div`
  font-weight: 600;
`

export default function Room() {
  const { 
    currentRoom, 
    currentPlayer, 
    leaveRoom, 
    startGame,
    addAIPlayer
  } = useGame()

  const [isReady, setIsReady] = useState(false)

  if (!currentRoom || !currentPlayer) {
    return null
  }

  const isHost = currentRoom.createdBy === currentPlayer.id
  const allPlayersReady = currentRoom.players.length >= 2
  const canStartGame = isHost && allPlayersReady && currentRoom.players.length >= 2
  const canAddAI = isHost && currentRoom.players.length < currentRoom.maxPlayers && currentRoom.status === 'waiting'

  const handleLeave = () => {
    leaveRoom()
  }

  const handleStartGame = () => {
    if (canStartGame) {
      startGame()
    }
  }

  const handleAddAI = () => {
    if (canAddAI) {
      addAIPlayer()
    }
  }

  const handleToggleReady = () => {
    setIsReady(!isReady)
    // TODO: Implement ready state change
  }

  const getStatusText = (player: any) => {
    if (player.isAI) {
      return `AI ${player.aiDifficulty || 'medium'}`
    }
    if (player.id === currentRoom.createdBy) {
      return 'Host'
    }
    return 'Gotowy'
  }

  const getStatusIcon = (player: any) => {
    if (player.isAI) {
      return <Bot size={14} style={{ color: '#8b5cf6' }} />
    }
    if (player.id === currentRoom.createdBy) {
      return <Crown size={14} style={{ color: '#fbbf24' }} />
    }
    return <UserCheck size={14} style={{ color: '#22c55e' }} />
  }

  return (
    <Container>
      <LeftPanel>
        {/* Room Header */}
        <Card>
          <Header>
            <Button 
              $variant="secondary" 
              onClick={handleLeave}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={16} />
              Wyjdź z pokoju
            </Button>
            
            <HeaderActions>
              {isHost && canAddAI && (
                <Button
                  $variant="ai"
                  onClick={handleAddAI}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bot size={16} />
                  Dodaj AI
                </Button>
              )}
              
              {isHost && (
                <Button
                  onClick={handleStartGame}
                  disabled={!canStartGame}
                  whileHover={{ scale: canStartGame ? 1.05 : 1 }}
                  whileTap={{ scale: canStartGame ? 0.95 : 1 }}
                >
                  <Play size={16} />
                  Rozpocznij grę
                </Button>
              )}
            </HeaderActions>
          </Header>

          <RoomInfo>
            <RoomName>
              {currentRoom.hasPassword && <Shield size={20} />}
              {currentRoom.name}
            </RoomName>
            
            <RoomDetails>
              <DetailItem>
                <Users size={16} />
                Gracze: {currentRoom.players.length}/{currentRoom.maxPlayers}
              </DetailItem>
              <DetailItem>
                <Bot size={16} />
                AI: {currentRoom.players.filter(p => p.isAI).length}
              </DetailItem>
              <DetailItem>
                <Settings size={16} />
                Tryb: {currentRoom.gameSettings.gameMode}
              </DetailItem>
              <DetailItem>
                <Settings size={16} />
                Prędkość: {currentRoom.gameSettings.gameSpeed}x
              </DetailItem>
            </RoomDetails>
          </RoomInfo>
        </Card>

        {/* Players */}
        <Card style={{ flex: 1 }}>
          <Title>
            <Users size={20} />
            Gracze ({currentRoom.players.length}/{currentRoom.maxPlayers})
          </Title>

          <PlayersList>
            {currentRoom.players.map((player) => (
              <PlayerCard
                key={player.id}
                $isHost={player.id === currentRoom.createdBy}
                $isReady={true}
                $isAI={!!player.isAI}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <PlayerHeader>
                  <PlayerAvatar $color={FACTION_COLORS[player.faction]}>
                    {player.name.charAt(0).toUpperCase()}
                    {player.isAI && (
                      <AIBadge>
                        <Bot size={10} />
                      </AIBadge>
                    )}
                  </PlayerAvatar>
                  
                  <PlayerInfo>
                    <PlayerName>
                      {player.name}
                      {getStatusIcon(player)}
                    </PlayerName>
                    <PlayerStatus>
                      {getStatusText(player)} • {player.faction}
                    </PlayerStatus>
                  </PlayerInfo>
                </PlayerHeader>

                {player.id === currentPlayer.id && !player.isAI && (
                  <PlayerActions>
                    <FactionSelect
                      value={player.faction}
                      onChange={() => {
                        // TODO: Implement faction change
                      }}
                    >
                      {Object.values(Faction).map(faction => (
                        <option key={faction} value={faction}>
                          {faction}
                        </option>
                      ))}
                    </FactionSelect>
                    
                    {!isHost && (
                      <ReadyButton
                        $ready={isReady}
                        onClick={handleToggleReady}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isReady ? (
                          <>
                            <UserCheck size={14} />
                            Gotowy
                          </>
                        ) : (
                          <>
                            <UserX size={14} />
                            Nie gotowy
                          </>
                        )}
                      </ReadyButton>
                    )}
                  </PlayerActions>
                )}
              </PlayerCard>
            ))}

            {/* Empty slots */}
            {Array.from({ length: currentRoom.maxPlayers - currentRoom.players.length }).map((_, index) => (
              <EmptySlot key={`empty-${index}`}>
                <Users size={24} style={{ opacity: 0.3 }} />
                <div>Oczekuje na gracza...</div>
                {isHost && (
                  <Button
                    $variant="ai"
                    onClick={handleAddAI}
                    disabled={!canAddAI}
                    style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bot size={12} />
                    Dodaj AI
                  </Button>
                )}
              </EmptySlot>
            ))}
          </PlayersList>
        </Card>
      </LeftPanel>

      <RightPanel>
        {/* Game Settings */}
        <Card>
          <SettingsTitle>
            <Settings size={16} />
            Ustawienia gry
          </SettingsTitle>
          
          <GameSettings>
            <SettingItem>
              <SettingLabel>Tryb gry</SettingLabel>
              <SettingValue>{currentRoom.gameSettings.gameMode}</SettingValue>
            </SettingItem>
            
            <SettingItem>
              <SettingLabel>Prędkość gry</SettingLabel>
              <SettingValue>{currentRoom.gameSettings.gameSpeed}x</SettingValue>
            </SettingItem>
            
            <SettingItem>
              <SettingLabel>Warunki zwycięstwa</SettingLabel>
              <SettingValue>
                {currentRoom.gameSettings.victoryConditions?.join(', ') || 'Eliminacja'}
              </SettingValue>
            </SettingItem>
            
            <SettingItem>
              <SettingLabel>Obserwatorzy</SettingLabel>
              <SettingValue>
                {currentRoom.gameSettings.allowSpectators ? 'Tak' : 'Nie'}
              </SettingValue>
            </SettingItem>
            
            <SettingItem>
              <SettingLabel>Odkryta mapa</SettingLabel>
              <SettingValue>
                {currentRoom.gameSettings.revealMap ? 'Tak' : 'Nie'}
              </SettingValue>
            </SettingItem>
          </GameSettings>
        </Card>

        {/* Chat */}
        <Chat />
      </RightPanel>
    </Container>
  )
} 