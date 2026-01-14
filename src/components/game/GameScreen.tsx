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
import { SpecialSpaceModal } from './SpecialSpaceModal';
import { RebuttalTurnModal } from './RebuttalTurnModal';
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
  const [specialSpaceModal, setSpecialSpaceModal] = useState<{
    isVisible: boolean;
    type: 'star' | 'numbered' | null;
    value?: number;
    pendingMovement?: { newPosition: number; opponentPosition: number; message: string };
  }>({ isVisible: false, type: null });
  
  // Track if a player has reached the end (for final turn logic)
  const [firstFinisher, setFirstFinisher] = useState<Player | null>(null);
  const [finalTurnTaken, setFinalTurnTaken] = useState(false);
  const [showRebuttalModal, setShowRebuttalModal] = useState(false);

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

  // Track pending turn end
  const [pendingTurnEnd, setPendingTurnEnd] = useState<{ reachedEnd: boolean } | null>(null);

  // Complete the movement after special space modal is confirmed
  const completeMovement = useCallback((newPosition: number, opponentPosition: number, message: string) => {
    setGameState(prev => {
      const player = prev.players[prev.currentPlayer];
      const opponent = prev.currentPlayer === 'red' ? 'blue' : 'red';
      
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
        phase: 'playing',
        message: message || 'Turn complete!',
      };
    });

    // Schedule turn end
    setTimeout(() => {
      setPendingTurnEnd({ reachedEnd: newPosition >= endPosition });
    }, 800);
  }, [endPosition]);

  // Handle special space modal confirmation
  const handleSpecialSpaceConfirm = useCallback(() => {
    const { pendingMovement } = specialSpaceModal;
    setSpecialSpaceModal({ isVisible: false, type: null });
    
    if (pendingMovement) {
      completeMovement(pendingMovement.newPosition, pendingMovement.opponentPosition, pendingMovement.message);
    }
  }, [specialSpaceModal, completeMovement]);

  // Resolve movement and special space effects
  const resolveMovement = useCallback((spaces: number) => {
    const player = gameState.players[gameState.currentPlayer];
    let newPosition = Math.min(player.position + spaces, endPosition);
    const landedSpace = boardSpaces[newPosition];
    let message = '';
    const opponent = gameState.currentPlayer === 'red' ? 'blue' : 'red';
    let opponentPosition = gameState.players[opponent].position;

    // Check for special spaces first (before calculating final position)
    if (landedSpace.type === 'numbered' && landedSpace.value !== undefined) {
      const bonus = landedSpace.value;
      const finalPosition = Math.min(newPosition + bonus, endPosition);
      message = `Bonus! Moving ${bonus} more!`;
      
      // Show modal, then complete movement
      setSpecialSpaceModal({
        isVisible: true,
        type: 'numbered',
        value: bonus,
        pendingMovement: { newPosition: finalPosition, opponentPosition, message },
      });
      return;
    }

    if (landedSpace.type === 'star') {
      const previousStar = findPreviousStar(boardSpaces, newPosition);
      message = 'Star! Going back!';
      
      // Show modal, then complete movement
      setSpecialSpaceModal({
        isVisible: true,
        type: 'star',
        pendingMovement: { newPosition: previousStar, opponentPosition, message },
      });
      return;
    }

    // Handle bumping opponent (no modal needed)
    if (newPosition === opponentPosition && newPosition > 0 && newPosition < endPosition) {
      opponentPosition = Math.max(0, opponentPosition - 2);
      message = 'Bump! Opponent goes back 2 spaces!';
    }

    // No special space - complete movement immediately
    completeMovement(newPosition, opponentPosition, message);
  }, [gameState.players, gameState.currentPlayer, boardSpaces, endPosition, completeMovement]);

  // Handle rebuttal modal confirmation
  const handleRebuttalConfirm = useCallback(() => {
    setShowRebuttalModal(false);
    
    const nextPlayer = gameState.currentPlayer === 'red' ? 'blue' : 'red';
    const nextPlayerState = gameState.players[nextPlayer];
    
    setGameState(prev => ({
      ...prev,
      currentPlayer: nextPlayer,
      phase: 'playing',
      message: nextPlayerState.isAI ? 'Computer is thinking...' : 'Tap "Take Turn" to draw chains!',
    }));

    // Show turn modal for two-player mode
    if (mode === 'two-player') {
      setShowTurnModal(true);
    }
  }, [gameState.currentPlayer, gameState.players, mode]);

  // Handle pending turn end
  useEffect(() => {
    if (!pendingTurnEnd) return;
    
    const { reachedEnd } = pendingTurnEnd;
    setPendingTurnEnd(null);
    
    // Determine if we should end the game
    const shouldEndGame = () => {
      if (reachedEnd && !firstFinisher) {
        return false;
      }
      if (firstFinisher) {
        setFinalTurnTaken(true);
        return true;
      }
      return false;
    };

    if (shouldEndGame()) {
      setGameState(prev => {
        const redPos = prev.players.red.position;
        const bluePos = prev.players.blue.position;
        
        let winner: Player | 'tie';
        if (redPos === bluePos) {
          winner = 'tie';
        } else if (redPos > bluePos) {
          winner = 'red';
        } else {
          winner = 'blue';
        }
        
        onGameEnd(winner);
        return { ...prev, phase: 'ended', winner };
      });
      return;
    }

    const nextPlayer = gameState.currentPlayer === 'red' ? 'blue' : 'red';
    const justReachedEnd = reachedEnd && !firstFinisher;

    if (justReachedEnd) {
      setFirstFinisher(gameState.currentPlayer);
      setShowRebuttalModal(true);
      return;
    }

    setGameState(prev => {
      const nextPlayerState = prev.players[nextPlayer];
      return {
        ...prev,
        currentPlayer: nextPlayer,
        phase: 'playing',
        message: nextPlayerState.isAI ? 'Computer is thinking...' : 'Tap "Take Turn" to draw chains!',
      };
    });

    if (mode === 'two-player') {
      setShowTurnModal(true);
    }
  }, [pendingTurnEnd, firstFinisher, gameState.currentPlayer, mode, onGameEnd]);

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
          <PickupBin remainingCount={gameState.pickupBin.length} />
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

      {/* Special space modal */}
      <SpecialSpaceModal
        isVisible={specialSpaceModal.isVisible}
        type={specialSpaceModal.type}
        value={specialSpaceModal.value}
        onConfirm={handleSpecialSpaceConfirm}
      />

      {/* Rebuttal turn modal */}
      <RebuttalTurnModal
        isVisible={showRebuttalModal}
        finisher={firstFinisher || 'red'}
        rebuttalPlayer={firstFinisher === 'red' ? 'blue' : 'red'}
        onConfirm={handleRebuttalConfirm}
      />
    </div>
  );
}
