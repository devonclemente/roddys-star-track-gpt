import { useState, useCallback, useEffect, useRef } from 'react';
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
import { RebuttalTurnModal } from './RebuttalTurnModal';
import { EffectModal } from './EffectModal';
import { useGameLogic, type EffectEvent, type MovementResult } from '@/hooks/useGameLogic';
import { useMovementAnimation, generateMovementSteps, type MovementStep } from '@/hooks/useMovementAnimation';
import type { GameMode, AIDifficulty, Player, Chain } from '@/types/game';
import { Home, Volume2, VolumeX, BookOpen } from 'lucide-react';

interface GameScreenProps {
  mode: GameMode;
  difficulty: AIDifficulty;
  onMainMenu: () => void;
  onShowRules: () => void;
  onGameEnd: (winner: Player | 'tie') => void;
}

const STEP_DELAY = 250; // ms per step
const EFFECT_PAUSE = 600; // ms pause before showing effect

export function GameScreen({ mode, difficulty, onMainMenu, onShowRules, onGameEnd }: GameScreenProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [showTurnModal, setShowTurnModal] = useState(false);
  const [showRebuttalModal, setShowRebuttalModal] = useState(false);
  
  // Effect modal state
  const [currentEffect, setCurrentEffect] = useState<EffectEvent | null>(null);
  const [showEffectModal, setShowEffectModal] = useState(false);
  
  // Display positions for animated pawns (separate from logical positions)
  const [displayPositions, setDisplayPositions] = useState({ red: 0, blue: 0 });
  const [animatingPlayer, setAnimatingPlayer] = useState<Player | null>(null);
  
  // Animation queue for sequential effects
  const animationQueueRef = useRef<{
    steps: MovementStep[];
    effects: EffectEvent[];
    result: MovementResult;
  } | null>(null);
  const effectIndexRef = useRef(0);
  const stepIndexRef = useRef(0);

  const {
    gameState,
    boardSpaces,
    isAITurn,
    firstFinisher,
    drawChains,
    selectChain,
    completeMovement,
    endTurn,
    confirmRebuttal,
    getAIChoice,
  } = useGameLogic({ mode, difficulty, onGameEnd });

  // Sync display positions with game state when not animating
  useEffect(() => {
    if (!animatingPlayer) {
      setDisplayPositions({
        red: gameState.players.red.position,
        blue: gameState.players.blue.position,
      });
    }
  }, [gameState.players.red.position, gameState.players.blue.position, animatingPlayer]);

  // Animate pawn step by step
  const animateSteps = useCallback((
    player: Player,
    steps: MovementStep[],
    startIndex: number,
    onComplete: () => void
  ) => {
    if (startIndex >= steps.length) {
      onComplete();
      return;
    }

    const step = steps[startIndex];
    if (!step) {
      onComplete();
      return;
    }

    setAnimatingPlayer(player);
    setDisplayPositions(prev => 
      player === 'red' 
        ? { ...prev, red: step.position }
        : { ...prev, blue: step.position }
    );

    setTimeout(() => {
      animateSteps(player, steps, startIndex + 1, onComplete);
    }, STEP_DELAY);
  }, []);

  // Process the next effect in the queue
  const processNextEffect = useCallback(() => {
    const queue = animationQueueRef.current;
    if (!queue) return;

    const effectIdx = effectIndexRef.current;
    
    if (effectIdx >= queue.effects.length) {
      // All effects processed - complete the movement
      setAnimatingPlayer(null);
      const reachedEnd = completeMovement(queue.result);
      animationQueueRef.current = null;
      
      // Schedule turn end
      setTimeout(() => {
        const turnResult = endTurn(reachedEnd);
        
        if (turnResult.type === 'rebuttal') {
          setShowRebuttalModal(true);
        } else if (turnResult.type === 'continue' && mode === 'two-player' && !turnResult.isAI) {
          setShowTurnModal(true);
        }
      }, 500);
      return;
    }

    // Show the current effect
    const effect = queue.effects[effectIdx];
    if (!effect) return;
    
    setCurrentEffect(effect);
    setShowEffectModal(true);
  }, [completeMovement, endTurn, mode]);

  // Handle effect modal confirmation
  const handleEffectConfirm = useCallback(() => {
    setShowEffectModal(false);
    setCurrentEffect(null);
    
    const queue = animationQueueRef.current;
    if (!queue) return;

    const currentEffectIdx = effectIndexRef.current;
    const effect = queue.effects[currentEffectIdx];
    
    // Calculate which steps to animate for this effect
    // We need to find the steps that correspond to this effect
    const currentStepIdx = stepIndexRef.current;
    
    // Find steps that match this effect type
    let stepsForEffect: MovementStep[] = [];
    let newStepIdx = currentStepIdx;
    
    for (let i = currentStepIdx; i < queue.steps.length; i++) {
      const step = queue.steps[i];
      if (!step) break;
      
      // Check if this step is part of the current effect
      if (
        (effect.type === 'special-numbered' && step.type === 'special-numbered') ||
        (effect.type === 'special-star' && step.type === 'special-star') ||
        (effect.type === 'bump')
      ) {
        stepsForEffect.push(step);
        newStepIdx = i + 1;
      } else if (stepsForEffect.length > 0) {
        // We've finished collecting steps for this effect
        break;
      }
    }

    stepIndexRef.current = newStepIdx;
    effectIndexRef.current = currentEffectIdx + 1;

    // Animate these steps if any
    if (stepsForEffect.length > 0) {
      animateSteps(gameState.currentPlayer, stepsForEffect, 0, () => {
        setTimeout(processNextEffect, EFFECT_PAUSE);
      });
    } else {
      // No steps for this effect (like bump), just continue
      setTimeout(processNextEffect, 200);
    }
  }, [animateSteps, gameState.currentPlayer, processNextEffect]);

  // Start the movement animation sequence
  const startMovementSequence = useCallback((result: MovementResult) => {
    // Find where initial movement ends (before special space effects)
    let initialEndIdx = 0;
    for (let i = 0; i < result.steps.length; i++) {
      const step = result.steps[i];
      if (step?.type === 'move') {
        initialEndIdx = i + 1;
      } else {
        break;
      }
    }

    const initialSteps = result.steps.slice(0, initialEndIdx);
    
    // Store the queue for effect processing
    animationQueueRef.current = {
      steps: result.steps,
      effects: result.effects,
      result,
    };
    effectIndexRef.current = 0;
    stepIndexRef.current = initialEndIdx;

    // Animate initial movement
    if (initialSteps.length > 0) {
      animateSteps(gameState.currentPlayer, initialSteps, 0, () => {
        // After initial movement, process effects
        setTimeout(processNextEffect, EFFECT_PAUSE);
      });
    } else {
      // No initial movement, start processing effects
      processNextEffect();
    }
  }, [animateSteps, gameState.currentPlayer, processNextEffect]);

  // Handle chain selection
  const handleSelectChain = useCallback((chain: Chain) => {
    const result = selectChain(chain);
    startMovementSequence(result);
  }, [selectChain, startMovementSequence]);

  // Handle rebuttal modal confirmation
  const handleRebuttalConfirm = useCallback(() => {
    setShowRebuttalModal(false);
    const { isAI } = confirmRebuttal();
    
    if (mode === 'two-player') {
      setShowTurnModal(true);
    }
  }, [confirmRebuttal, mode]);

  // AI turn logic - drawing chains
  useEffect(() => {
    if (!isAITurn || gameState.phase !== 'playing' || animatingPlayer) return;

    const timeout = setTimeout(() => {
      drawChains();
    }, 1500);

    return () => clearTimeout(timeout);
  }, [isAITurn, gameState.phase, drawChains, animatingPlayer]);

  // AI chain selection
  useEffect(() => {
    if (!isAITurn || gameState.phase !== 'selecting' || !gameState.drawnChains) return;

    const timeout = setTimeout(() => {
      const selectedChain = getAIChoice(gameState.drawnChains!);
      handleSelectChain(selectedChain);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isAITurn, gameState.phase, gameState.drawnChains, getAIChoice, handleSelectChain]);

  const showPulsingButton = !isAITurn && gameState.phase === 'playing' && !animatingPlayer;

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <StarBackground />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4">
        <GameTitle size="sm" showRocket />
        
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
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row gap-4 p-4 pt-0">
        {/* Left panel - Pickup Bin */}
        <div className="flex flex-row lg:flex-col gap-4 lg:w-48 lg:pt-16">
          <PickupBin remainingCount={gameState.pickupBin.length} />
        </div>

        {/* Center - Game board */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <TurnIndicator 
            currentPlayer={gameState.currentPlayer} 
            isAI={isAITurn}
            message={gameState.message}
          />
          
          <div className="flex-1 w-full max-w-2xl">
            <GameBoard
              redPosition={displayPositions.red}
              bluePosition={displayPositions.blue}
              spaces={boardSpaces}
              animatingPlayer={animatingPlayer}
            />
          </div>
        </div>

        {/* Right panel - Discard Pile and Drawn chains */}
        <div className="flex flex-col gap-4 lg:w-56 lg:pt-16">
          <DiscardPile chains={gameState.discardPile} />
          
          {gameState.drawnChains && !isAITurn && (
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
                  onClick={() => handleSelectChain(chain)}
                />
              ))}
            </motion.div>
          )}
        </div>
      </main>

      {/* Take Turn button - positioned to split space between board and bottom */}
      {showPulsingButton && (
        <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button 
              variant="playPulse" 
              size="xl" 
              onClick={drawChains}
            >
              Take Turn
            </Button>
          </motion.div>
        </div>
      )}

      {/* Player turn modal for two-player */}
      <PlayerTurnModal
        player={gameState.currentPlayer}
        isVisible={showTurnModal}
        onDismiss={() => setShowTurnModal(false)}
      />

      {/* Effect modal for special spaces */}
      <EffectModal
        effect={currentEffect}
        isVisible={showEffectModal}
        onConfirm={handleEffectConfirm}
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
