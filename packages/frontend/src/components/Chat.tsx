import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, MessageCircle } from 'lucide-react'
import { useGame } from '../context/GameContext'
import { FACTION_COLORS } from '@rts-engine/shared'

const Container = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  height: 400px;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

const Title = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
`

const ChannelSelector = styled.div`
  display: flex;
  gap: 0.25rem;
`

const ChannelButton = styled(motion.button)<{ $active: boolean }>`
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  
  ${props => props.$active ? `
    background: #4ade80;
    color: #065f46;
  ` : `
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }
  `}
`

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
  scroll-behavior: smooth;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }
`

const MessagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-right: 0.5rem;
`

const Message = styled(motion.div)<{ $isOwn: boolean; $isSystem: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  
  ${props => props.$isSystem && `
    justify-content: center;
    
    .message-content {
      background: rgba(156, 163, 175, 0.2);
      color: #9ca3af;
      font-style: italic;
      font-size: 0.8rem;
      text-align: center;
    }
  `}
  
  ${props => props.$isOwn && !props.$isSystem && `
    flex-direction: row-reverse;
    
    .message-content {
      background: #4ade80;
      color: #065f46;
    }
  `}
`

const Avatar = styled.div<{ $color: string }>`
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
  flex-shrink: 0;
`

const MessageContent = styled.div`
  max-width: 80%;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 0.85rem;
  line-height: 1.4;
  word-wrap: break-word;
`

const MessageHeader = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  opacity: 0.8;
`

const MessageText = styled.div`
  /* No additional styles needed */
`

const MessageTime = styled.div`
  font-size: 0.65rem;
  opacity: 0.6;
  margin-top: 0.25rem;
`

const InputContainer = styled.form`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`

const MessageInput = styled.input`
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #4ade80;
    box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.1);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`

const SendButton = styled(motion.button)`
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  background: #4ade80;
  color: #065f46;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: #22c55e;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  opacity: 0.5;
  text-align: center;
  gap: 0.5rem;
`

type ChatChannel = 'all' | 'team'

export default function Chat() {
  const { 
    chatMessages, 
    sendChatMessage, 
    currentPlayer, 
    currentRoom 
  } = useGame()
  
  const [message, setMessage] = useState('')
  const [currentChannel, setCurrentChannel] = useState<ChatChannel>('all')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim()) return
    
    sendChatMessage(message.trim(), currentChannel)
    setMessage('')
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredMessages = chatMessages.filter(msg => {
    if (currentChannel === 'all') return true
    return msg.channel === currentChannel
  })

  const getPlayerColor = (playerId?: string) => {
    if (!currentRoom || !playerId) return '#9ca3af'
    
    const player = currentRoom.players.find(p => p.id === playerId)
    return player ? FACTION_COLORS[player.faction] : '#9ca3af'
  }

  const getPlayerName = (playerId?: string) => {
    if (!currentRoom || !playerId) return 'System'
    
    const player = currentRoom.players.find(p => p.id === playerId)
    return player?.name || 'Nieznany'
  }

  return (
    <Container>
      <Header>
        <MessageCircle size={16} />
        <Title>Chat</Title>
        
        {currentRoom && (
          <ChannelSelector>
            <ChannelButton
              $active={currentChannel === 'all'}
              onClick={() => setCurrentChannel('all')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Wszyscy
            </ChannelButton>
            <ChannelButton
              $active={currentChannel === 'team'}
              onClick={() => setCurrentChannel('team')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Drużyna
            </ChannelButton>
          </ChannelSelector>
        )}
      </Header>

      <MessagesContainer>
        {filteredMessages.length === 0 ? (
          <EmptyState>
            <MessageCircle size={24} style={{ opacity: 0.3 }} />
            <div>Brak wiadomości</div>
            <div style={{ fontSize: '0.7rem' }}>
              Napisz pierwszą wiadomość!
            </div>
          </EmptyState>
        ) : (
          <MessagesList>
            <AnimatePresence>
              {filteredMessages.map((msg, index) => (
                <Message
                  key={`${msg.timestamp}-${index}`}
                  $isOwn={msg.playerId === currentPlayer?.id}
                  $isSystem={false}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Avatar $color={getPlayerColor(msg.playerId)}>
                    {getPlayerName(msg.playerId).charAt(0).toUpperCase()}
                  </Avatar>
                  
                  <MessageContent className="message-content">
                    <MessageHeader>
                      {getPlayerName(msg.playerId)}
                      {msg.channel === 'team' && ' (drużyna)'}
                    </MessageHeader>
                    <MessageText>{msg.message}</MessageText>
                    <MessageTime>{formatTime(msg.timestamp)}</MessageTime>
                  </MessageContent>
                </Message>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </MessagesList>
        )}
      </MessagesContainer>

      <InputContainer onSubmit={handleSubmit}>
        <MessageInput
          type="text"
          placeholder={`Napisz wiadomość${currentChannel === 'team' ? ' do drużyny' : ''}...`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={200}
          disabled={!currentPlayer}
        />
        <SendButton
          type="submit"
          disabled={!message.trim() || !currentPlayer}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Send size={16} />
        </SendButton>
      </InputContainer>
    </Container>
  )
} 