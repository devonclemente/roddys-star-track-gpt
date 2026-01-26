import { motion } from 'framer-motion';
import { HexSpace } from './HexSpace';
import { PawnLayer } from './AnimatedPawn';
import { createBoardSpaces } from '@/lib/boardLayout';
import type { Player, BoardSpace } from '@/types/game';
import { useMemo } from 'react';

interface GameBoardProps {
  redPosition: number;
  bluePosition: number;
  highlightedSpace?: number;
  animatingPlayer?: Player | null;
  spaces?: BoardSpace[];
  onSpaceClick?: (spaceId: number) => void;
}

export function GameBoard({ 
  redPosition, 
  bluePosition, 
  highlightedSpace,
  animatingPlayer,
  spaces: externalSpaces,
  onSpaceClick 
}: GameBoardProps) {
  const defaultSpaces = useMemo(() => createBoardSpaces(), []);
  const spaces = externalSpaces ?? defaultSpaces;

  return (
    <motion.div
      className="relative w-full h-full min-h-[400px] max-h-[600px] aspect-[4/3]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Board background with subtle glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-space-deep/80 to-card/60 backdrop-blur-sm border-2 border-muted overflow-hidden">
        {/* Nebula overlay */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_30%_30%,hsl(35_80%_30%/0.4)_0%,transparent_50%),radial-gradient(ellipse_at_70%_70%,hsl(280_60%_30%/0.4)_0%,transparent_50%)]" />
      </div>

      {/* Spaces - without pawns, they're rendered separately */}
      {spaces.map((space) => (
        <div
          key={space.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${space.x}%`,
            top: `${space.y}%`,
          }}
        >
          <HexSpace
            space={space}
            isHighlighted={highlightedSpace === space.id}
            size={38}
            onClick={() => onSpaceClick?.(space.id)}
          />
        </div>
      ))}

      {/* Animated pawns layer */}
      <PawnLayer
        redPosition={redPosition}
        bluePosition={bluePosition}
        spaces={spaces}
        animatingPlayer={animatingPlayer}
      />

      {/* Path lines connecting spaces (decorative) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        {spaces.slice(0, -1).map((space, i) => {
          const nextSpace = spaces.at(i + 1);
          return (
            <line
              key={space.id}
              x1={`${space.x}%`}
              y1={`${space.y}%`}
              x2={`${nextSpace?.x}%`}
              y2={`${nextSpace?.y}%`}
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          );
        })}
      </svg>
    </motion.div>
  );
}
