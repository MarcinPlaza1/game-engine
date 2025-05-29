import React, { useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { X, Lock, Users, Settings, Trophy } from 'lucide-react'
import { useGame } from '../context/GameContext'
import { GameMode, VictoryCondition, createDefaultGameSettings } from '@rts-engine/shared'
import toast from 'react-hot-toast'

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`

const Modal = styled(motion.div)`
  background: rgba(30, 60, 114, 0.95);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  color: white;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
`

const Title = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const CloseButton = styled(motion.button)`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #4ade80;
    box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.1);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.2s;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #4ade80;
    box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.1);
  }
  
  option {
    background: #1e3c72;
    color: white;
  }
`

const Checkbox = styled.input`
  margin-right: 0.5rem;
`

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  cursor: pointer;
`

const RangeGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const RangeInput = styled.input`
  flex: 1;
`

const RangeValue = styled.span`
  font-weight: 600;
  min-width: 3rem;
  text-align: center;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`

const Button = styled(motion.button)<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  
  ${props => props.$variant === 'secondary' ? `
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  ` : `
    background: #4ade80;
    color: #065f46;
    
    &:hover {
      background: #22c55e;
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

interface CreateRoomModalProps {
  onClose: () => void
}

export default function CreateRoomModal({ onClose }: CreateRoomModalProps) {
  const { createRoom } = useGame()
  
  const [roomName, setRoomName] = useState('')
  const [hasPassword, setHasPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.REAL_TIME)
  const [gameSpeed, setGameSpeed] = useState(1.0)
  const [allowSpectators, setAllowSpectators] = useState(true)
  const [revealMap, setRevealMap] = useState(false)
  const [victoryConditions, setVictoryConditions] = useState<VictoryCondition[]>([VictoryCondition.ELIMINATION])
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!roomName.trim()) {
      toast.error('Wprowadź nazwę pokoju')
      return
    }

    if (hasPassword && !password.trim()) {
      toast.error('Wprowadź hasło dla pokoju')
      return
    }

    setIsCreating(true)
    
    try {
      const gameSettings = {
        ...createDefaultGameSettings(),
        maxPlayers,
        gameMode,
        gameSpeed,
        allowSpectators,
        revealMap,
        victoryConditions
      }

      createRoom(
        roomName.trim(),
        gameSettings,
        hasPassword ? password.trim() : undefined
      )

      onClose()
      toast.success('Pokój został utworzony!')
    } catch (error) {
      toast.error('Błąd podczas tworzenia pokoju')
    } finally {
      setIsCreating(false)
    }
  }

  const handleVictoryConditionChange = (condition: VictoryCondition, checked: boolean) => {
    if (checked) {
      if (!victoryConditions.includes(condition)) {
        setVictoryConditions([...victoryConditions, condition])
      }
    } else {
      setVictoryConditions(victoryConditions.filter(c => c !== condition))
    }
  }

  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <Modal
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Header>
          <Title>
            <Settings size={24} />
            Utwórz nowy pokój
          </Title>
          <CloseButton
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={20} />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          {/* Room Name */}
          <FormGroup>
            <Label htmlFor="roomName">Nazwa pokoju</Label>
            <Input
              id="roomName"
              type="text"
              placeholder="Wprowadź nazwę pokoju..."
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              maxLength={30}
              required
            />
          </FormGroup>

          {/* Password */}
          <FormGroup>
            <CheckboxLabel>
              <Checkbox
                type="checkbox"
                checked={hasPassword}
                onChange={(e) => setHasPassword(e.target.checked)}
              />
              <Lock size={16} />
              Pokój z hasłem
            </CheckboxLabel>
            {hasPassword && (
              <Input
                type="password"
                placeholder="Wprowadź hasło..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={50}
              />
            )}
          </FormGroup>

          {/* Max Players */}
          <FormGroup>
            <Label htmlFor="maxPlayers">
              <Users size={16} />
              Maksymalna liczba graczy
            </Label>
            <RangeGroup>
              <RangeInput
                id="maxPlayers"
                type="range"
                min="2"
                max="8"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
              />
              <RangeValue>{maxPlayers}</RangeValue>
            </RangeGroup>
          </FormGroup>

          {/* Game Mode */}
          <FormGroup>
            <Label htmlFor="gameMode">Tryb gry</Label>
            <Select
              id="gameMode"
              value={gameMode}
              onChange={(e) => setGameMode(e.target.value as GameMode)}
            >
              <option value={GameMode.REAL_TIME}>Real-time</option>
              <option value={GameMode.TURN_BASED}>Turowy</option>
              <option value={GameMode.SANDBOX}>Sandbox</option>
            </Select>
          </FormGroup>

          {/* Game Speed */}
          <FormGroup>
            <Label htmlFor="gameSpeed">Prędkość gry</Label>
            <RangeGroup>
              <RangeInput
                id="gameSpeed"
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={gameSpeed}
                onChange={(e) => setGameSpeed(parseFloat(e.target.value))}
              />
              <RangeValue>{gameSpeed}x</RangeValue>
            </RangeGroup>
          </FormGroup>

          {/* Victory Conditions */}
          <FormGroup>
            <Label>
              <Trophy size={16} />
              Warunki zwycięstwa
            </Label>
            {Object.values(VictoryCondition).map((condition) => (
              <CheckboxLabel key={condition}>
                <Checkbox
                  type="checkbox"
                  checked={victoryConditions.includes(condition)}
                  onChange={(e) => handleVictoryConditionChange(condition, e.target.checked)}
                />
                {condition === VictoryCondition.ELIMINATION && 'Eliminacja przeciwników'}
                {condition === VictoryCondition.DOMINATION && 'Dominacja (kontrola mapy)'}
                {condition === VictoryCondition.ECONOMIC && 'Gospodarcze (zasoby)'}
                {condition === VictoryCondition.TIME_LIMIT && 'Limit czasu'}
              </CheckboxLabel>
            ))}
          </FormGroup>

          {/* Additional Options */}
          <FormGroup>
            <CheckboxLabel>
              <Checkbox
                type="checkbox"
                checked={allowSpectators}
                onChange={(e) => setAllowSpectators(e.target.checked)}
              />
              Pozwól na obserwatorów
            </CheckboxLabel>
            
            <CheckboxLabel>
              <Checkbox
                type="checkbox"
                checked={revealMap}
                onChange={(e) => setRevealMap(e.target.checked)}
              />
              Odkryj całą mapę
            </CheckboxLabel>
          </FormGroup>

          <ButtonGroup>
            <Button
              type="button"
              $variant="secondary"
              onClick={onClose}
              disabled={isCreating}
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !roomName.trim()}
            >
              {isCreating ? 'Tworzenie...' : 'Utwórz pokój'}
            </Button>
          </ButtonGroup>
        </Form>
      </Modal>
    </Overlay>
  )
} 