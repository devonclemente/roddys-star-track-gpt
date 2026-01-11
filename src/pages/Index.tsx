import { useState } from 'react';
import { StartMenu } from '@/components/game/StartMenu';
import { GameScreen } from '@/components/game/GameScreen';
import { RulesScreen } from '@/components/game/RulesScreen';
import { EndScreen } from '@/components/game/EndScreen';
import type { GameMode, AIDifficulty, Player } from '@/types/game';
import spaceBg from '@/assets/space-bg.jpg';

type Screen = 'menu' | 'rules' | 'playing' | 'ended';

const Index = () => {
  const [screen, setScreen] = useState<Screen>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('vs-ai');
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>('easy');
  const [winner, setWinner] = useState<Player | 'tie'>('red');
  const [previousScreen, setPreviousScreen] = useState<Screen>('menu');

  const handleStartGame = (mode: GameMode, difficulty: AIDifficulty) => {
    setGameMode(mode);
    setAIDifficulty(difficulty);
    setScreen('playing');
  };

  const handleShowRules = () => {
    setPreviousScreen(screen);
    setScreen('rules');
  };

  const handleCloseRules = () => {
    setScreen(previousScreen);
  };

  const handleGameEnd = (gameWinner: Player | 'tie') => {
    setWinner(gameWinner);
    setScreen('ended');
  };

  const handlePlayAgain = () => {
    setScreen('playing');
  };

  const handleMainMenu = () => {
    setScreen('menu');
  };

  return (
    <div 
      className="min-h-screen bg-background relative"
      style={{
        backgroundImage: `url(${spaceBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark overlay for better readability */}
      <div className="fixed inset-0 bg-background/70 pointer-events-none" />
      
      {screen === 'menu' && (
        <StartMenu onStartGame={handleStartGame} onShowRules={handleShowRules} />
      )}
      
      {screen === 'rules' && (
        <RulesScreen onClose={handleCloseRules} />
      )}
      
      {screen === 'playing' && (
        <GameScreen
          mode={gameMode}
          difficulty={aiDifficulty}
          onMainMenu={handleMainMenu}
          onShowRules={handleShowRules}
          onGameEnd={handleGameEnd}
        />
      )}
      
      {screen === 'ended' && (
        <EndScreen
          winner={winner}
          onPlayAgain={handlePlayAgain}
          onMainMenu={handleMainMenu}
        />
      )}
    </div>
  );
};

export default Index;
