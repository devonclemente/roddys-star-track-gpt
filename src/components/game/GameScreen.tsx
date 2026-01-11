import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GameBoard } from './GameBoard';
import { GameTitle } from './GameTitle';
import { StarBackground } from './StarBackground';
import { TurnIndicator } from './TurnIndicator';
import { ChainDisplay } from './ChainDisplay';
import { PickupBin } from './PickupBin';
import { DiscardPile } from './DiscardPile';
import { PlayerTurnModal } from './PlayerTurnModal';
import type { GameMode, AIDifficulty, Player, Chain, GameState } from '@/types/game';
import { createInitialChains, shuffleArray } from '@/types/game';
import { createBoardSpaces, findPreviousStar } from '@/lib/boardLayout';
import { Home, Volume2, VolumeX, BookOpen } from 'lucide-react';

interface GameScreenProps {
  mode: GameMode;
  difficulty: AIDifficulty;
  onMainMenu: () => void;
  onShowRules: () => void;
  onGameEnd: (winner: Player | 'tie') => void;
}

export function GameScreen({ mode, difficulty, onMainMenu, onShowRules, onGameEnd }: GameScreenProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [showTurnModal, setShowTurnModal] = useState(false);
  
  const [gameState, setGameState] = useState<GameState>(() => ({
    mode,
    aiDifficulty: difficulty,
    currentPlayer: 'red',
    players: {
      red: { color: 'red', position: 0, isAI: false },
      blue: { color: 'blue', position: 0, isAI: mode === 'vs-ai' },
    },
    pickupBin: createInitialChains(),
    discardPile: [],
    drawnChains: null,
    selectedChain: null,
    phase: 'playing',
    winner: null,
    message: 'Tap "Take Turn" to draw chains!',
    isAnimating: false,
  }));

  const currentPlayerState = gameState.players[gameState.currentPlayer];
  const isAITurn = currentPlayerState.isAI;
  const boardSpaces = createBoardSpaces();
  const endPosition = boardSpaces.length - 1;

  // Draw two chains from the pickup bin
  const drawChains = useCallback(() => {
    if (gameState.pickupBin.length < 2) {
      // Reshuffle discard pile into pickup bin
      setGameState(prev => ({
        ...prev,
        pickupBin: shuffleArray([...prev.discardPile]),
        discardPile: [],
        message: 'Reshuffling the chains...',
      }));
      return;
    }

    const newBin = [...gameState.pickupBin];
    const chain1 = newBin.pop()!;
    const chain2 = newBin.pop()!;

    setGameState(prev => ({
      ...prev,
      pickupBin: newBin,
      drawnChains: [chain1, chain2],
      phase: 'selecting',
      message: 'Choose a chain!',
    }));
  }, [gameState.pickupBin]);

  // Select a chain and move
  const selectChain = useCallback((chain: Chain) => {
    const otherChain = gameState.drawnChains?.find(c => c.id !== chain.id);
    
    setGameState(prev => ({
      ...prev,
      selectedChain: chain,
      drawnChains: null,
      phase: 'moving',
      message: `Moving ${chain.length} spaces...`,
      // Put the unselected chain back in the bin
      pickupBin: otherChain ? [...prev.pickupBin, otherChain] : prev.pickupBin,
    }));

    // Simulate movement animation then resolve
    setTimeout(() => {
      resolveMovement(chain.length);
    }, 500);
  }, [gameState.drawnChains]);

  // Resolve movement and special space effects
  const resolveMovement = useCallback((spaces: number) => {
    setGameState(prev => {
      const player = prev.players[prev.currentPlayer];
      let newPosition = Math.min(player.position + spaces, endPosition);
      const landedSpace = boardSpaces[newPosition];
      let message = '';
      const opponent = prev.currentPlayer === 'red' ? 'blue' : 'red';
      let opponentPosition = prev.players[opponent].position;

      // Handle numbered space bonus
      if (landedSpace.type === 'numbered' && landedSpace.value !== undefined) {
        const bonus = landedSpace.value;
        message = `Landed on ${bonus}! Moving ${bonus} more spaces.`;
        newPosition = Math.min(newPosition + bonus, endPosition);
      }

      // Handle star space penalty
      if (landedSpace.type === 'star') {
        const previousStar = findPreviousStar(boardSpaces, newPosition);
        message = 'Landed on a star! Going back...';
        newPosition = previousStar;
      }

      // Handle bumping opponent
      if (newPosition === opponentPosition && newPosition > 0 && newPosition < endPosition) {
        opponentPosition = Math.max(0, opponentPosition - 2);
        message = 'Bump! Opponent goes back 2 spaces!';
      }

      // Check for game end
      const reachedEnd = newPosition >= endPosition;
      
      // Add selected chain to discard
      const newDiscardPile = prev.selectedChain 
        ? [...prev.discardPile, prev.selectedChain]
        : prev.discardPile;

      return {
        ...prev,
        players: {
          ...prev.players,
          [prev.currentPlayer]: { ...player, position: newPosition },
          [opponent]: { ...prev.players[opponent], position: opponentPosition },
        },
        selectedChain: null,
        discardPile: newDiscardPile,
        phase: reachedEnd ? 'ended' : 'playing',
        winner: reachedEnd ? prev.currentPlayer : null,
        message: message || 'Turn complete!',
      };
    });

    // Switch turns after a delay
    setTimeout(() => {
      endTurn();
    }, 1000);
  }, [boardSpaces, endPosition]);

  // End turn and switch players
  const endTurn = useCallback(() => {
    setGameState(prev => {
      if (prev.winner) {
        // Game is over
        onGameEnd(prev.winner);
        return prev;
      }

      const nextPlayer = prev.currentPlayer === 'red' ? 'blue' : 'red';
      const nextPlayerState = prev.players[nextPlayer];
      
      return {
        ...prev,
        currentPlayer: nextPlayer,
        phase: 'playing',
        message: nextPlayerState.isAI ? 'Computer is thinking...' : 'Tap "Take Turn" to draw chains!',
      };
    });

    // Show turn modal for two-player mode
    if (mode === 'two-player') {
      setShowTurnModal(true);
    }
  }, [mode, onGameEnd]);

  // AI turn logic
  useEffect(() => {
    if (!isAITurn || gameState.phase !== 'playing') return;

    const timeout = setTimeout(() => {
      drawChains();
    }, 1500);

    return () => clearTimeout(timeout);
  }, [isAITurn, gameState.phase, drawChains]);

  // AI chain selection
  useEffect(() => {
    if (!isAITurn || gameState.phase !== 'selecting' || !gameState.drawnChains) return;

    const timeout = setTimeout(() => {
      const [chain1, chain2] = gameState.drawnChains!;
      let selectedChain: Chain;

      switch (difficulty) {
        case 'easy':
          // Random choice
          selectedChain = Math.random() > 0.5 ? chain1 : chain2;
          break;
        case 'medium':
          // Choose the one that moves farther
          selectedChain = chain1.length > chain2.length ? chain1 : chain2;
          break;
        case 'hard':
          // Simple heuristic: avoid stars if possible
          // For now, just pick the longer one
          selectedChain = chain1.length > chain2.length ? chain1 : chain2;
          break;
        default:
          selectedChain = chain1;
      }

      selectChain(selectedChain);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isAITurn, gameState.phase, gameState.drawnChains, difficulty, selectChain]);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <StarBackground />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4">
        <GameTitle size="sm" />
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onShowRules}>
            <BookOpen className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onMainMenu}>
            <Home className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main game area */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row gap-4 p-4">
        {/* Left panel - Chains */}
        <div className="flex flex-row lg:flex-col gap-4 lg:w-48">
          <PickupBin 
            remainingCount={gameState.pickupBin.length} 
            onDraw={!isAITurn && gameState.phase === 'playing' ? drawChains : undefined}
            isDisabled={isAITurn || gameState.phase !== 'playing'}
          />
          <DiscardPile chains={gameState.discardPile} />
        </div>

        {/* Center - Game board */}
        <div className="flex-1 flex flex-col items-center gap-4">
          <TurnIndicator 
            currentPlayer={gameState.currentPlayer} 
            isAI={isAITurn}
            message={gameState.message}
          />
          
          <div className="flex-1 w-full max-w-2xl">
            <GameBoard
              redPosition={gameState.players.red.position}
              bluePosition={gameState.players.blue.position}
            />
          </div>

          {/* Take Turn button */}
          {!isAITurn && gameState.phase === 'playing' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button variant="play" size="xl" onClick={drawChains}>
                Take Turn
              </Button>
            </motion.div>
          )}
        </div>

        {/* Right panel - Drawn chains */}
        <div className="lg:w-56 lg:mr-8">
          {gameState.drawnChains && (
            <motion.div
              className="flex flex-col gap-4 p-5 rounded-2xl bg-card/70 backdrop-blur-md border-2 border-primary/30 shadow-glow"
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
            >
              <h3 className="font-display text-lg text-center text-foreground">Your Chains</h3>
              {gameState.drawnChains.map((chain) => (
                <ChainDisplay
                  key={chain.id}
                  chain={chain}
                  isSelected={gameState.selectedChain?.id === chain.id}
                  onClick={!isAITurn ? () => selectChain(chain) : undefined}
                />
              ))}
            </motion.div>
          )}
        </div>
      </main>

      {/* Player turn modal for two-player */}
      <PlayerTurnModal
        player={gameState.currentPlayer}
        isVisible={showTurnModal}
        onDismiss={() => setShowTurnModal(false)}
      />
    </div>
  );
}
