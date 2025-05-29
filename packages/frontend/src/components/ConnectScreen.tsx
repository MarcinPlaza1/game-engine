import React, { useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { Wifi, WifiOff, User, Loader } from 'lucide-react'
import { useGame } from '../context/GameContext'
import toast from 'react-hot-toast'

const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
`

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: 100%;
`

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 0.5rem;
`

const Subtitle = styled.p`
  text-align: center;
  opacity: 0.8;
  margin-bottom: 2rem;
  font-size: 0.9rem;
`

const ConnectionStatus = styled.div<{ $connected: boolean; $connecting: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  
  ${props => {
    if (props.$connecting) {
      return `
        background: rgba(251, 191, 36, 0.2);
        color: #fbbf24;
        border: 1px solid rgba(251, 191, 36, 0.3);
      `
    }
    if (props.$connected) {
      return `
        background: rgba(34, 197, 94, 0.2);
        color: #22c55e;
        border: 1px solid rgba(34, 197, 94, 0.3);
      `
    }
    return `
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    `
  }}
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  opacity: 0.9;
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  ${props => props.$variant === 'secondary' ? `
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.2);
    }
  ` : `
    background: #4ade80;
    color: #065f46;
    
    &:hover:not(:disabled) {
      background: #22c55e;
      transform: translateY(-1px);
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`

const IconWrapper = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
`

export default function ConnectScreen() {
  const { connected, connectionStatus, connect, joinLobby } = useGame()
  const [playerName, setPlayerName] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  const handleConnect = () => {
    if (!connected && connectionStatus === 'disconnected') {
      connect()
    }
  }

  const handleJoinLobby = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!playerName.trim()) {
      toast.error('Wprowadź nazwę gracza')
      return
    }
    
    if (!connected) {
      toast.error('Najpierw połącz się z serwerem')
      return
    }

    setIsJoining(true)
    try {
      joinLobby(playerName.trim())
    } catch (error) {
      toast.error('Błąd podczas dołączania do lobby')
    } finally {
      setIsJoining(false)
    }
  }

  const getConnectionIcon = () => {
    if (connectionStatus === 'connecting') {
      return (
        <IconWrapper
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader size={16} />
        </IconWrapper>
      )
    }
    return connected ? <Wifi size={16} /> : <WifiOff size={16} />
  }

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connecting': return 'Łączenie...'
      case 'connected': return 'Połączono z serwerem'
      case 'reconnecting': return 'Ponowne łączenie...'
      default: return 'Rozłączono z serwerem'
    }
  }

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Title>Witaj w RTS Engine!</Title>
        <Subtitle>Połącz się z serwerem i dołącz do lobby</Subtitle>

        <ConnectionStatus 
          $connected={connected} 
          $connecting={connectionStatus === 'connecting'}
        >
          {getConnectionIcon()}
          {getConnectionText()}
        </ConnectionStatus>

        {!connected ? (
          <ButtonGroup>
            <Button
              $variant="primary"
              onClick={handleConnect}
              disabled={connectionStatus === 'connecting'}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {connectionStatus === 'connecting' ? (
                <>
                  <IconWrapper
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader size={16} />
                  </IconWrapper>
                  Łączenie...
                </>
              ) : (
                <>
                  <Wifi size={16} />
                  Połącz
                </>
              )}
            </Button>
          </ButtonGroup>
        ) : (
          <Form onSubmit={handleJoinLobby}>
            <InputGroup>
              <Label htmlFor="playerName">Nazwa gracza</Label>
              <Input
                id="playerName"
                type="text"
                placeholder="Wprowadź swoją nazwę..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                required
                autoFocus
              />
            </InputGroup>

            <ButtonGroup>
              <Button
                $variant="primary"
                type="submit"
                disabled={isJoining || !playerName.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isJoining ? (
                  <>
                    <IconWrapper
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader size={16} />
                    </IconWrapper>
                    Dołączanie...
                  </>
                ) : (
                  <>
                    <User size={16} />
                    Dołącz do Lobby
                  </>
                )}
              </Button>
            </ButtonGroup>
          </Form>
        )}
      </Card>
    </Container>
  )
} 