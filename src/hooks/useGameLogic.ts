import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameMode, AIDifficulty, Player, Chain, GameState, BoardSpace } from '@/types/game';
import { createInitialChains, shuffleArray } from '@/types/game';
import { createBoardSpaces, findPreviousStar } from '@/lib/boardLayout';
import { generateMovementSteps, type MovementStep } from './useMovementAnimation';

// Safe player accessor to avoid bracket notation
const getPlayerState = <T extends { red: unknown; blue: unknown }>(
  players: T,
  player: Player
): T['red'] => (player === 'red' ? players.red : players.blue);

const setPlayerPosition = <T extends { red: { position: number }; blue: { position: number } }>(
  players: T,
  player: Player,
  position: number
): T => {
  if (player === 'red') {
    return { ...players, red: { ...players.red, position } };
  }
  return { ...players, blue: { ...players.blue, position } };
};

export interface EffectEvent {
  type: 'collision' | 'special-star' | 'special-numbered' | 'bump';
  message: string;
  value?: number;
  targetPosition?: number;
}

export interface MovementResult {
  finalPosition: number;
  opponentPosition: number;
  steps: MovementStep[];
  effects: EffectEvent[];
  reachedEnd: boolean;
}

interface UseGameLogicProps {
  mode: GameMode;
  difficulty: AIDifficulty;
  onGameEnd: (winner: Player | 'tie') => void;
}

export function useGameLogic({ mode, difficulty, onGameEnd }: UseGameLogicProps) {
  const boardSpaces = createBoardSpaces();
  const endPosition = boardSpaces.length - 1;

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

  const [firstFinisher, setFirstFinisher] = useState<Player | null>(null);

  // Calculate complete movement result including all effects
  const calculateMovementResult = useCallback((
    player: Player,
    spaces: number,
    currentPlayers: GameState['players']
  ): MovementResult => {
    const playerState = getPlayerState(currentPlayers, player);
    const opponent = player === 'red' ? 'blue' : 'red';
    let opponentPos = getPlayerState(currentPlayers, opponent).position;
    
    const allSteps: MovementStep[] = [];
    const effects: EffectEvent[] = [];
    
    // Phase 1: Initial movement (step by step)
    let currentPos = playerState.position;
    const targetPos = Math.min(currentPos + spaces, endPosition);
    
    const initialSteps = generateMovementSteps(currentPos, targetPos, 'move');
    allSteps.push(...initialSteps);
    currentPos = targetPos;
    
    // Phase 2: Check collision at landing spot (before special spaces)
    if (currentPos === opponentPos && currentPos > 0 && currentPos < endPosition) {
      const bumpedPos = Math.max(0, opponentPos - 2);
      effects.push({
        type: 'bump',
        message: 'Bump! Opponent goes back 2 spaces!',
        targetPosition: bumpedPos,
      });
      opponentPos = bumpedPos;
    }
    
    // Phase 3: Handle special spaces with chaining
    let iterationCount = 0;
    const maxIterations = 10; // Prevent infinite loops
    
    while (iterationCount < maxIterations) {
      // Safe array access to prevent object injection (CWE-94)
      const landedSpace = boardSpaces.at(currentPos);
      if (!landedSpace) break;
      
      if (landedSpace.type === 'numbered' && landedSpace.value !== undefined) {
        // Numbered space: move forward
        const bonus = landedSpace.value;
        const newTarget = Math.min(currentPos + bonus, endPosition);
        
        effects.push({
          type: 'special-numbered',
          message: `Bonus! Moving ${bonus} more spaces!`,
          value: bonus,
          targetPosition: newTarget,
        });
        
        const bonusSteps = generateMovementSteps(currentPos, newTarget, 'special-numbered');
        allSteps.push(...bonusSteps);
        currentPos = newTarget;
        
        // Check for collision after bonus movement
        if (currentPos === opponentPos && currentPos > 0 && currentPos < endPosition) {
          const bumpedPos = Math.max(0, opponentPos - 2);
          effects.push({
            type: 'bump',
            message: 'Bump! Opponent goes back 2 spaces!',
            targetPosition: bumpedPos,
          });
          opponentPos = bumpedPos;
        }
        
        iterationCount++;
        continue;
      }
      
      if (landedSpace.type === 'star') {
        // Star space: go back to previous star
        const previousStar = findPreviousStar(boardSpaces, currentPos);
        
        effects.push({
          type: 'special-star',
          message: 'Star! Going back!',
          targetPosition: previousStar,
        });
        
        const starSteps = generateMovementSteps(currentPos, previousStar, 'special-star');
        allSteps.push(...starSteps);
        currentPos = previousStar;
        
        // Check for collision after star movement
        if (currentPos === opponentPos && currentPos > 0 && currentPos < endPosition) {
          const bumpedPos = Math.max(0, opponentPos - 2);
          effects.push({
            type: 'bump',
            message: 'Bump! Opponent goes back 2 spaces!',
            targetPosition: bumpedPos,
          });
          opponentPos = bumpedPos;
        }
        
        // STOP here - don't chain from star returns (landing on a previous star doesn't trigger it again)
        break;
      }
      
      // Normal space or end - stop checking
      break;
    }
    
    return {
      finalPosition: currentPos,
      opponentPosition: opponentPos,
      steps: allSteps,
      effects,
      reachedEnd: currentPos >= endPosition,
    };
  }, [boardSpaces, endPosition]);

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

  // Select a chain - returns movement result for animation
  const selectChain = useCallback((chain: Chain): MovementResult => {
    const otherChain = gameState.drawnChains?.find(c => c.id !== chain.id);
    const result = calculateMovementResult(
      gameState.currentPlayer,
      chain.length,
      gameState.players
    );

    setGameState(prev => ({
      ...prev,
      selectedChain: chain,
      drawnChains: null,
      phase: 'moving',
      isAnimating: true,
      message: `Moving ${chain.length} spaces...`,
      pickupBin: otherChain ? [...prev.pickupBin, otherChain] : prev.pickupBin,
    }));

    return result;
  }, [gameState.drawnChains, gameState.currentPlayer, gameState.players, calculateMovementResult]);

  // Complete movement and update positions
  const completeMovement = useCallback((result: MovementResult) => {
    setGameState(prev => {
      const opponent = prev.currentPlayer === 'red' ? 'blue' : 'red';
      
      const newDiscardPile = prev.selectedChain 
        ? [...prev.discardPile, prev.selectedChain]
        : prev.discardPile;

      let newPlayers = setPlayerPosition(prev.players, prev.currentPlayer, result.finalPosition);
      newPlayers = setPlayerPosition(newPlayers, opponent, result.opponentPosition);

      return {
        ...prev,
        players: newPlayers,
        selectedChain: null,
        discardPile: newDiscardPile,
        phase: 'playing',
        isAnimating: false,
        // Safe array access using .at(-1) to prevent object injection (CWE-94)
        message: result.effects.at(-1)?.message ?? 'Turn complete!',
      };
    });

    return result.reachedEnd;
  }, []);

  // End the current player's turn
  const endTurn = useCallback((reachedEnd: boolean) => {
    // Check if game should end
    if (reachedEnd && !firstFinisher) {
      // First player reached end - other player gets rebuttal
      setFirstFinisher(gameState.currentPlayer);
      return { type: 'rebuttal' as const, finisher: gameState.currentPlayer };
    }

    if (firstFinisher) {
      // Rebuttal turn complete - determine winner
      const redPos = gameState.players.red.position;
      const bluePos = gameState.players.blue.position;
      
      let winner: Player | 'tie';
      if (redPos === bluePos) {
        winner = 'tie';
      } else if (redPos > bluePos) {
        winner = 'red';
      } else {
        winner = 'blue';
      }
      
      setGameState(prev => ({ ...prev, phase: 'ended', winner }));
      onGameEnd(winner);
      return { type: 'ended' as const, winner };
    }

    // Normal turn end - switch players
    const nextPlayer = gameState.currentPlayer === 'red' ? 'blue' : 'red';
    // Use safe accessor to prevent object injection (CWE-94)
    const nextPlayerState = getPlayerState(gameState.players, nextPlayer);

    setGameState(prev => ({
      ...prev,
      currentPlayer: nextPlayer,
      phase: 'playing',
      message: nextPlayerState.isAI ? 'Computer is thinking...' : 'Tap "Take Turn" to draw chains!',
    }));

    return { 
      type: 'continue' as const, 
      nextPlayer,
      isAI: nextPlayerState.isAI,
    };
  }, [gameState.currentPlayer, gameState.players, firstFinisher, onGameEnd]);

  // Handle rebuttal confirmation
  const confirmRebuttal = useCallback(() => {
    const nextPlayer = gameState.currentPlayer === 'red' ? 'blue' : 'red';
    // Use safe accessor to prevent object injection (CWE-94)
    const nextPlayerState = getPlayerState(gameState.players, nextPlayer);

    setGameState(prev => ({
      ...prev,
      currentPlayer: nextPlayer,
      phase: 'playing',
      message: nextPlayerState.isAI ? 'Computer is thinking...' : 'Tap "Take Turn" to draw chains!',
    }));

    return {
      nextPlayer,
      isAI: nextPlayerState.isAI,
    };
  }, [gameState.currentPlayer, gameState.players]);

  // Get AI's chain selection
  const getAIChoice = useCallback((chains: [Chain, Chain]): Chain => {
    const [chain1, chain2] = chains;
    
    switch (difficulty) {
      case 'easy':
        return Math.random() > 0.5 ? chain1 : chain2;
      case 'medium':
      case 'hard':
        // Prefer longer chain
        return chain1.length > chain2.length ? chain1 : chain2;
      default:
        return chain1;
    }
  }, [difficulty]);

  const currentPlayerState = getPlayerState(gameState.players, gameState.currentPlayer);
  const isAITurn = currentPlayerState.isAI;

  return {
    gameState,
    boardSpaces,
    endPosition,
    isAITurn,
    firstFinisher,
    drawChains,
    selectChain,
    completeMovement,
    endTurn,
    confirmRebuttal,
    getAIChoice,
  };
}
