export type GameMode = 'vs-ai' | 'two-player';
export type AIDifficulty = 'easy' | 'medium' | 'hard';
export type Player = 'red' | 'blue';
export type SpaceType = 'normal' | 'star' | 'numbered' | 'start' | 'end';

export interface BoardSpace {
  id: number;
  type: SpaceType;
  value?: number; // For numbered spaces
  x: number;
  y: number;
}

export interface Chain {
  id: string;
  length: number;
}

export interface PlayerState {
  color: Player;
  position: number;
  isAI: boolean;
}

export interface GameState {
  mode: GameMode;
  aiDifficulty: AIDifficulty;
  currentPlayer: Player;
  players: {
    red: PlayerState;
    blue: PlayerState;
  };
  pickupBin: Chain[];
  discardPile: Chain[];
  drawnChains: [Chain, Chain] | null;
  selectedChain: Chain | null;
  phase: 'menu' | 'playing' | 'drawing' | 'selecting' | 'moving' | 'ended';
  winner: Player | 'tie' | null;
  message: string | null;
  isAnimating: boolean;
}

// Chain distribution from the rules
export const CHAIN_DISTRIBUTION: { length: number; count: number }[] = [
  { length: 9, count: 2 },
  { length: 8, count: 3 },
  { length: 7, count: 4 },
  { length: 6, count: 5 },
  { length: 5, count: 6 },
  { length: 4, count: 7 },
  { length: 3, count: 8 },
  { length: 2, count: 9 },
];

export function createInitialChains(): Chain[] {
  const chains: Chain[] = [];
  let id = 0;
  
  for (const { length, count } of CHAIN_DISTRIBUTION) {
    for (let i = 0; i < count; i++) {
      chains.push({ id: `chain-${id++}`, length });
    }
  }
  
  return shuffleArray(chains);
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Swap using splice to avoid bracket notation
    const itemI = shuffled.at(i) as T;
    const itemJ = shuffled.at(j) as T;
    shuffled.splice(i, 1, itemJ);
    shuffled.splice(j, 1, itemI);
  }
  return shuffled;
}
