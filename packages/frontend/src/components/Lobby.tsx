import { useState } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Plus, 
  Crown, 
  Lock, 
  LogOut
} from 'lucide-react'
import { useGame } from '../context/GameContext'
import { FACTION_COLORS } from '@rts-engine/shared'
import CreateRoomModal from './CreateRoomModal'
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
  width: 300px;
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
  justify-content: between;
  margin-bottom: 1.5rem;
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

const Button = styled(motion.button)<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
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
`

const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 1rem;
`

const PlayerAvatar = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
  color: white;
`

const PlayerDetails = styled.div`
  flex: 1;
`

const PlayerName = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
`

const PlayerStatus = styled.div`
  font-size: 0.8rem;
  opacity: 0.7;
`

const RoomsList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const RoomCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }
`

const RoomHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  margin-bottom: 0.5rem;
`

const RoomName = styled.div`
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
`

const RoomInfo = styled.div`
  font-size: 0.85rem;
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: 1rem;
`

const PlayerCount = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => {
    switch (props.$status) {
      case 'waiting':
        return `
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
        `
      case 'in_progress':
        return `
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
        `
      default:
        return `
          background: rgba(156, 163, 175, 0.2);
          color: #9ca3af;
        `
    }
  }}
`

const PlayersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
`

const PlayerItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
`

const SmallAvatar = styled.div<{ $color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.7rem;
  color: white;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  opacity: 0.6;
`

export default function Lobby() {
  const { 
    currentPlayer, 
    lobbyPlayers, 
    availableRooms, 
    joinRoom, 
    leaveLobby 
  } = useGame()

  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleJoinRoom = (roomId: string) => {
    joinRoom(roomId)
  }

  const handleCreateRoom = () => {
    setShowCreateModal(true)
  }

  const handleLeave = () => {
    leaveLobby()
  }

  return (
    <Container>
      <LeftPanel>
        {/* Current Player Info */}
        {currentPlayer && (
          <PlayerInfo>
            <PlayerAvatar $color={FACTION_COLORS[currentPlayer.faction]}>
              {currentPlayer.name.charAt(0).toUpperCase()}
            </PlayerAvatar>
            <PlayerDetails>
              <PlayerName>{currentPlayer.name}</PlayerName>
              <PlayerStatus>
                Fakcja: {currentPlayer.faction} • W lobby
              </PlayerStatus>
            </PlayerDetails>
            <Button 
              $variant="danger" 
              onClick={handleLeave}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut size={16} />
              Wyjdź
            </Button>
          </PlayerInfo>
        )}

        {/* Rooms List */}
        <Card style={{ flex: 1 }}>
          <Header>
            <Title>
              <Crown size={20} />
              Pokoje gry ({availableRooms.length})
            </Title>
            <Button 
              onClick={handleCreateRoom}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={16} />
              Utwórz pokój
            </Button>
          </Header>

          <RoomsList>
            <AnimatePresence>
              {availableRooms.length === 0 ? (
                <EmptyState>
                  <Crown size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                  <div>Brak dostępnych pokoi</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    Utwórz pierwszy pokój!
                  </div>
                </EmptyState>
              ) : (
                availableRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    onClick={() => handleJoinRoom(room.id)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <RoomHeader>
                      <RoomName>
                        {room.hasPassword && <Lock size={14} />}
                        {room.name}
                      </RoomName>
                      <StatusBadge $status={room.status}>
                        {room.status === 'waiting' ? 'Oczekuje' : 
                         room.status === 'in_progress' ? 'W grze' : room.status}
                      </StatusBadge>
                    </RoomHeader>
                    <RoomInfo>
                      <PlayerCount>
                        <Users size={14} />
                        {room.players.length}/{room.maxPlayers}
                      </PlayerCount>
                      <div>Tryb: {room.gameSettings.gameMode}</div>
                    </RoomInfo>
                  </RoomCard>
                ))
              )}
            </AnimatePresence>
          </RoomsList>
        </Card>
      </LeftPanel>

      <RightPanel>
        {/* Players Online */}
        <Card>
          <Title>
            <Users size={20} />
            Gracze online ({lobbyPlayers.length})
          </Title>
          
          <PlayersList>
            {lobbyPlayers.map((player) => (
              <PlayerItem key={player.id}>
                <SmallAvatar $color={FACTION_COLORS[player.faction]}>
                  {player.name.charAt(0).toUpperCase()}
                </SmallAvatar>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                    {player.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                    {player.faction}
                  </div>
                </div>
                {player.id === currentPlayer?.id && (
                  <Crown size={14} style={{ color: '#fbbf24' }} />
                )}
              </PlayerItem>
            ))}
          </PlayersList>
        </Card>

        {/* Chat */}
        <Chat />
      </RightPanel>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateRoomModal onClose={() => setShowCreateModal(false)} />
        )}
      </AnimatePresence>
    </Container>
  )
} 