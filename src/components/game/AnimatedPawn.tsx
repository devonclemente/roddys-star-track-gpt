import { motion, AnimatePresence } from 'framer-motion';
import type { Player, BoardSpace } from '@/types/game';

interface AnimatedPawnProps {
  color: Player;
  position: number;
  spaces: BoardSpace[];
  isAnimating?: boolean;
  isSharing?: boolean; // True when both pawns are on the same space
}

export function AnimatedPawn({ color, position, spaces, isAnimating = false, isSharing = false }: AnimatedPawnProps) {
  // Validate index before array access to prevent object injection (CWE-94)
  if (position < 0 || position >= spaces.length || !Number.isInteger(position)) return null;
  const space = spaces.at(position);
  if (!space) return null;

  // Offset pawns horizontally when sharing a space
  const xOffset = isSharing ? (color === 'red' ? -0.8 : 0.8) : 0;

  return (
    <motion.div
      className="absolute pointer-events-none z-20"
      style={{
        left: `${space.x + xOffset}%`,
        top: `${space.y}%`,
      }}
      animate={{
        left: `${space.x + xOffset}%`,
        top: `${space.y}%`,
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
        mass: 0.8,
      }}
    >
      <motion.div
        className="transform -translate-x-1/2 -translate-y-1/2"
        animate={isAnimating ? {
          y: [0, -12, 0],
          scale: [1, 1.1, 1],
        } : {}}
        transition={{
          duration: 0.25,
          ease: 'easeOut',
        }}
      >
        <div
          className={`w-6 h-8 rounded-sm ${
            color === 'red' 
              ? 'bg-gradient-to-b from-red-400 to-red-600 shadow-[0_0_12px_rgba(239,68,68,0.6)]' 
              : 'bg-gradient-to-b from-blue-400 to-blue-600 shadow-[0_0_12px_rgba(59,130,246,0.6)]'
          } border-2 border-white/40`}
          style={{
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 25%, 100% 100%, 0% 100%, 0% 25%)',
          }}
        />
      </motion.div>
    </motion.div>
  );
}

interface PawnLayerProps {
  redPosition: number;
  bluePosition: number;
  spaces: BoardSpace[];
  animatingPlayer?: Player | null;
}

export function PawnLayer({ redPosition, bluePosition, spaces, animatingPlayer }: PawnLayerProps) {
  const isSharing = redPosition === bluePosition;

  return (
    <>
      <AnimatedPawn 
        color="red" 
        position={redPosition} 
        spaces={spaces}
        isAnimating={animatingPlayer === 'red'}
        isSharing={isSharing}
      />
      <AnimatedPawn 
        color="blue" 
        position={bluePosition} 
        spaces={spaces}
        isAnimating={animatingPlayer === 'blue'}
        isSharing={isSharing}
      />
    </>
  );
}
