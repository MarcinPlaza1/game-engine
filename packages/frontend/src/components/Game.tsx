import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Users, 
  Crown,
  Zap,
  TreePine,
  Coins,
  Home,
  Shield
} from 'lucide-react'
import { useGame } from '../context/GameContext'
import { 
  FACTION_COLORS, 
  ResourceType, 
  UnitType, 
  BuildingType
} from '@rts-engine/shared'
import Chat from './Chat'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1400px;
  height: 90vh;
  gap: 1rem;
`

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`

const GameInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`

const ResourceDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 8px;
`

const ResourceItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
`

const PlayersList = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const PlayerIndicator = styled.div<{ $color: string; $isCurrentPlayer: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  background: ${props => props.$color};
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  border: ${props => props.$isCurrentPlayer ? '2px solid #fbbf24' : 'none'};
`

const GameControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

const GameArea = styled.div`
  display: flex;
  gap: 1rem;
  flex: 1;
`

const GameCanvas = styled.div`
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
`

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #0f4c3a 0%, #1e6b4e 50%, #2d8a62 100%);
  position: relative;
  cursor: crosshair;
`

const MapGrid = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.3;
`

const GameEntity = styled(motion.div)<{ $x: number; $y: number; $color: string; $type: 'unit' | 'building' | 'resource' }>`
  position: absolute;
  left: ${props => props.$x * 20}px;
  top: ${props => props.$y * 20}px;
  width: ${props => props.$type === 'building' ? '40px' : '20px'};
  height: ${props => props.$type === 'building' ? '40px' : '20px'};
  background: ${props => props.$color};
  border-radius: ${props => props.$type === 'unit' ? '50%' : '4px'};
  border: 2px solid rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  z-index: ${props => props.$type === 'building' ? 2 : props.$type === 'unit' ? 3 : 1};
  
  &:hover {
    transform: scale(1.1);
    border-color: #fbbf24;
  }
`

const GameUI = styled.div`
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const UnitPanel = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`

const PanelTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
`

const ActionButton = styled(motion.button)<{ $disabled?: boolean }>`
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    border-color: #4ade80;
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`

const MiniMap = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  width: 100%;
  height: 120px;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.2);
`

const GameStats = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.8rem;
`

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`

export default function Game() {
  const { 
    gameState, 
    currentPlayer, 
    currentRoom,
    sendPlayerAction,
    leaveRoom
  } = useGame()

  const [selectedUnits, setSelectedUnits] = useState<string[]>([])
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Request game state periodically
    const interval = setInterval(() => {
      // Auto-sync handled by socket
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!gameState || !currentPlayer || !currentRoom) {
    return (
      <Container>
        <TopBar>
          <div>Ładowanie gry...</div>
        </TopBar>
      </Container>
    )
  }

  const currentPlayerData = gameState.players.find(p => p.id === currentPlayer.id)
  const myUnits = gameState.units.filter(u => u.playerId === currentPlayer.id)
  const myBuildings = gameState.buildings.filter(b => b.playerId === currentPlayer.id)

  // Helper functions
  const getPlayerFaction = (playerId: string) => {
    const player = gameState.players.find(p => p.id === playerId)
    return player?.faction || 'humans'
  }

  const getPlayerColor = (playerId: string) => {
    const faction = getPlayerFaction(playerId)
    return FACTION_COLORS[faction] || '#9ca3af'
  }

  const handleMapClick = (e: React.MouseEvent) => {
    if (!mapRef.current) return

    const rect = mapRef.current.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / 20)
    const y = Math.floor((e.clientY - rect.top) / 20)

    if (selectedUnits.length > 0) {
      // Send move command
      sendPlayerAction({
        type: 'MOVE_UNITS',
        unitIds: selectedUnits,
        target: { x, y }
      })
    }
  }

  const handleUnitClick = (unitId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (e.ctrlKey) {
      setSelectedUnits(prev => 
        prev.includes(unitId) 
          ? prev.filter(id => id !== unitId)
          : [...prev, unitId]
      )
    } else {
      setSelectedUnits([unitId])
    }
  }

  const handleTrainUnit = (unitType: UnitType) => {
    const selectedBuilding = gameState.buildings.find(b => 
      selectedUnits.includes(b.id) && b.playerId === currentPlayer.id
    )

    if (selectedBuilding) {
      sendPlayerAction({
        type: 'TRAIN_UNIT',
        buildingId: selectedBuilding.id,
        unitType
      })
    }
  }

  const handleBuildStructure = (buildingType: BuildingType) => {
    // For demo - build near first selected unit
    const selectedUnit = gameState.units.find(u => selectedUnits.includes(u.id))
    if (selectedUnit) {
      sendPlayerAction({
        type: 'BUILD_STRUCTURE',
        unitId: selectedUnit.id,
        buildingType,
        position: { x: selectedUnit.position.x + 2, y: selectedUnit.position.y }
      })
    }
  }

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case ResourceType.GOLD: return <Coins size={14} />
      case ResourceType.WOOD: return <TreePine size={14} />
      case ResourceType.STONE: return <Shield size={14} />
      case ResourceType.FOOD: return <Home size={14} />
      case ResourceType.ENERGY: return <Zap size={14} />
      default: return null
    }
  }

  const getEntityIcon = (type: string) => {
    if (type.includes('WORKER')) return '👷'
    if (type.includes('WARRIOR')) return '⚔️'
    if (type.includes('ARCHER')) return '🏹'
    if (type.includes('TOWN_HALL')) return '🏛️'
    if (type.includes('BARRACKS')) return '🏰'
    if (type.includes('RESOURCE')) return '💎'
    return '?'
  }

  return (
    <Container>
      <TopBar>
        <GameInfo>
          <Button 
            $variant="secondary" 
            onClick={leaveRoom}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={16} />
            Wyjdź
          </Button>

          {currentPlayerData && (
            <ResourceDisplay>
              {Object.entries(currentPlayerData.resources).map(([resource, amount]) => (
                <ResourceItem key={resource}>
                  {getResourceIcon(resource as ResourceType)}
                  <span>{amount}</span>
                </ResourceItem>
              ))}
            </ResourceDisplay>
          )}

          <PlayersList>
            {gameState.players.map((player) => (
              <PlayerIndicator
                key={player.id}
                $color={FACTION_COLORS[player.faction]}
                $isCurrentPlayer={player.id === currentPlayer.id}
              >
                {player.id === currentRoom.createdBy && <Crown size={12} />}
                {player.name}
              </PlayerIndicator>
            ))}
          </PlayersList>
        </GameInfo>

        <GameControls>
          <div>Tur: {gameState.turnNumber || 0}</div>
          <div>Czas: {Math.floor((gameState.gameTime || 0) / 1000)}s</div>
        </GameControls>
      </TopBar>

      <GameArea>
        <GameCanvas>
          <MapContainer 
            ref={mapRef}
            onClick={handleMapClick}
          >
            <MapGrid />
            
            {/* Resources */}
            {gameState.map?.resources?.map((resource) => (
              <GameEntity
                key={resource.id}
                $x={resource.position.x}
                $y={resource.position.y}
                $color="#fbbf24"
                $type="resource"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {getEntityIcon(resource.type)}
              </GameEntity>
            )) || []}

            {/* Buildings */}
            {gameState.buildings.map((building) => (
              <GameEntity
                key={building.id}
                $x={building.position.x}
                $y={building.position.y}
                $color={getPlayerColor(building.playerId)}
                $type="building"
                onClick={(e) => handleUnitClick(building.id, e)}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {getEntityIcon(building.type)}
              </GameEntity>
            ))}

            {/* Units */}
            {gameState.units.map((unit) => (
              <GameEntity
                key={unit.id}
                $x={unit.position.x}
                $y={unit.position.y}
                $color={getPlayerColor(unit.playerId)}
                $type="unit"
                onClick={(e) => handleUnitClick(unit.id, e)}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
                style={{
                  border: selectedUnits.includes(unit.id) ? '2px solid #fbbf24' : '2px solid rgba(255,255,255,0.8)'
                }}
              >
                {getEntityIcon(unit.type)}
              </GameEntity>
            ))}
          </MapContainer>
        </GameCanvas>

        <GameUI>
          {/* Unit Control Panel */}
          <UnitPanel>
            <PanelTitle>
              <Users size={16} />
              Kontrola ({selectedUnits.length} wybranych)
            </PanelTitle>

            {selectedUnits.length > 0 && (
              <ActionButtons>
                <ActionButton
                  onClick={() => handleTrainUnit(UnitType.WORKER)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>👷</span>
                  Worker
                </ActionButton>
                
                <ActionButton
                  onClick={() => handleTrainUnit(UnitType.WARRIOR)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>⚔️</span>
                  Warrior
                </ActionButton>
                
                <ActionButton
                  onClick={() => handleBuildStructure(BuildingType.BARRACKS)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>🏰</span>
                  Barracks
                </ActionButton>
              </ActionButtons>
            )}

            {/* Mini Map */}
            <PanelTitle style={{ marginTop: '1rem' }}>
              Mapa
            </PanelTitle>
            <MiniMap />

            {/* Game Stats */}
            <PanelTitle style={{ marginTop: '1rem' }}>
              Statystyki
            </PanelTitle>
            <GameStats>
              <StatItem>
                <span>Jednostki:</span>
                <span>{myUnits.length}</span>
              </StatItem>
              <StatItem>
                <span>Budynki:</span>
                <span>{myBuildings.length}</span>
              </StatItem>
              <StatItem>
                <span>Populacja:</span>
                <span>{myUnits.length}</span>
              </StatItem>
            </GameStats>
          </UnitPanel>

          {/* Chat */}
          <Chat />
        </GameUI>
      </GameArea>
    </Container>
  )
} 