import { Routes, Route, Navigate } from 'react-router-dom'
import styled from 'styled-components'
import { GameProvider, useGame } from './context/GameContext'
import ConnectScreen from './components/ConnectScreen'
import Lobby from './components/Lobby'
import Room from './components/Room'
import Game from './components/Game'

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
`

const Header = styled.header`
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
`

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  text-align: center;
  
  span {
    color: #4ade80;
  }
`

const MainContent = styled.main`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`

function AppRouter() {
  const { connected, currentPlayer, currentRoom, isInGame } = useGame()

  if (!connected || !currentPlayer) {
    return <ConnectScreen />
  }

  if (isInGame && currentRoom) {
    return <Game />
  }

  if (currentRoom) {
    return <Room />
  }

  return <Lobby />
}

function App() {
  return (
    <GameProvider>
      <AppContainer>
        <Header>
          <Title>
            RTS Game Engine <span>v1.2</span> - Demo
          </Title>
        </Header>
        
        <MainContent>
          <Routes>
            <Route path="/" element={<AppRouter />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainContent>
      </AppContainer>
    </GameProvider>
  )
}

export default App 