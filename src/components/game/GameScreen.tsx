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
      
      {/* Header - Compact on mobile */}
      <header className="relative z-10 flex items-center justify-between p-2 sm:p-4">
        <div className="scale-75 sm:scale-100 origin-left">
          <GameTitle size="sm" showRocket />
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" className="w-8 h-8 sm:w-10 sm:h-10" onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 sm:w-10 sm:h-10" onClick={onShowRules}>
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 sm:w-10 sm:h-10" onClick={onMainMenu}>
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </header>

      {/* Main game area - optimized for mobile */}
      <main className="relative z-10 flex-1 flex flex-col gap-2 sm:gap-4 p-2 sm:p-4 pt-0">
        {/* Turn indicator - always visible at top */}
        <div className="flex justify-center">
          <TurnIndicator 
            currentPlayer={gameState.currentPlayer} 
            isAI={isAITurn}
            message={gameState.message}
          />
        </div>

        {/* Desktop layout with side panels */}
        <div className="hidden lg:flex lg:flex-row lg:gap-4 lg:flex-1">
          {/* Left panel - Pickup Bin */}
          <div className="flex flex-col gap-4 w-48 pt-8">
            <PickupBin remainingCount={gameState.pickupBin.length} />
          </div>

          {/* Center - Game board */}
          <div className="flex-1 flex flex-col items-center">
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
          <div className="flex flex-col gap-4 w-56 pt-8">
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
        </div>

        {/* Mobile layout - board focused */}
        <div className="flex lg:hidden flex-col flex-1 gap-2">
          {/* Mobile bins row - larger, side by side */}
          <div className="flex justify-center gap-3 px-3">
            {/* Compact Pickup Bin */}
            <div className="flex-1 max-w-[160px] flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-card/60 backdrop-blur-sm border-2 border-muted">
              <div className="relative w-16 h-12 bg-gradient-to-b from-muted to-space-deep rounded-lg border-2 border-muted-foreground/30 overflow-hidden flex items-center justify-center">
                <span className="text-xl text-muted-foreground/50 font-display">?</span>
                {gameState.pickupBin.length > 0 && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
                    <div className="w-1.5 h-3 bg-gradient-to-b from-red-400 to-red-600 rounded-full" />
                    <div className="w-1.5 h-2.5 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full" />
                    <div className="w-1.5 h-4 bg-gradient-to-b from-green-400 to-green-600 rounded-full" />
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground">Pickup Bin</span>
              <span className="text-lg font-display text-primary">{gameState.pickupBin.length}</span>
            </div>

            {/* Compact Discard Pile */}
            <div className="flex-1 max-w-[160px] flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-card/60 backdrop-blur-sm border-2 border-muted">
              <div className="w-16 h-12 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                {gameState.discardPile.length > 0 ? (
                  <div className="flex gap-0.5">
                    {gameState.discardPile.slice(-4).map((_, i) => (
                      <div key={i} className="w-2 h-5 bg-muted-foreground/40 rounded-full" />
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground/50">Empty</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">Discard Pile</span>
              <span className="text-lg font-display text-secondary">{gameState.discardPile.length}</span>
            </div>
          </div>

          {/* Game board - larger and closer to bins */}
          <div className="flex-1 w-full flex items-start justify-center pt-1">
            <div className="w-full max-w-lg aspect-[4/3]">
              <GameBoard
                redPosition={displayPositions.red}
                bluePosition={displayPositions.blue}
                spaces={boardSpaces}
                animatingPlayer={animatingPlayer}
              />
            </div>
          </div>

          {/* Drawn chains for mobile - horizontal layout */}
          {gameState.drawnChains && !isAITurn && (
            <motion.div
              className="flex flex-col gap-2 p-3 rounded-xl bg-card/70 backdrop-blur-md border-2 border-primary/30 mx-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="font-display text-sm text-center text-foreground">Choose Your Chain</h3>
              <div className="flex gap-2 justify-center">
                {gameState.drawnChains.map((chain) => (
                  <ChainDisplay
                    key={chain.id}
                    chain={chain}
                    isSelected={gameState.selectedChain?.id === chain.id}
                    onClick={() => handleSelectChain(chain)}
                    compact
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Take Turn button - positioned closer to board on mobile */}
      {showPulsingButton && (
        <div className="absolute bottom-16 sm:bottom-[6%] left-1/2 -translate-x-1/2 z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button 
              variant="playPulse" 
              size="xl" 
              className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
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
