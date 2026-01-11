import { motion } from 'framer-motion';
import type { BoardSpace, Player } from '@/types/game';
import { Star } from 'lucide-react';

interface HexSpaceProps {
  space: BoardSpace;
  isHighlighted?: boolean;
  hasRedPawn?: boolean;
  hasBluePawn?: boolean;
  size?: number;
  onClick?: () => void;
}

export function HexSpace({ 
  space, 
  isHighlighted = false,
  hasRedPawn = false,
  hasBluePawn = false,
  size = 48,
  onClick
}: HexSpaceProps) {
  const getSpaceStyles = () => {
    switch (space.type) {
      case 'star':
        return 'bg-gradient-to-br from-space-purple to-secondary border-glow-star';
      case 'numbered':
        return 'bg-gradient-to-br from-space-yellow to-space-orange border-space-orange';
      case 'start':
        return 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-400';
      case 'end':
        return 'bg-gradient-to-br from-primary to-space-orange border-primary';
      default:
        return 'bg-gradient-to-br from-space-yellow/90 to-space-orange/80 border-space-yellow';
    }
  };

  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size * 1.15 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: space.id * 0.02, duration: 0.3 }}
    >
      {/* Hexagon shape */}
      <div
        className={`hex-space w-full h-full ${getSpaceStyles()} border-2 flex items-center justify-center cursor-pointer transition-all duration-200 ${
          isHighlighted ? 'ring-4 ring-primary ring-opacity-60 scale-110' : ''
        }`}
        onClick={onClick}
      >
        {/* Star icon for star spaces */}
        {space.type === 'star' && (
          <Star className="w-5 h-5 text-glow-star fill-glow-star drop-shadow-lg" />
        )}
        
        {/* Number for numbered spaces */}
        {space.type === 'numbered' && space.value !== undefined && (
          <span className="font-display text-lg text-primary-foreground drop-shadow-md">
            {space.value}
          </span>
        )}
        
        {/* Start label */}
        {space.type === 'start' && (
          <span className="font-display text-xs text-white">GO</span>
        )}
        
        {/* End label */}
        {space.type === 'end' && (
          <span className="font-display text-xs text-primary-foreground">END</span>
        )}
      </div>

      {/* Pawns */}
      {(hasRedPawn || hasBluePawn) && (
        <div className="absolute inset-0 flex items-center justify-center gap-0.5 pointer-events-none">
          {hasRedPawn && <Pawn color="red" />}
          {hasBluePawn && <Pawn color="blue" />}
        </div>
      )}
    </motion.div>
  );
}

function Pawn({ color }: { color: Player }) {
  return (
    <motion.div
      className={`w-5 h-7 rounded-full ${
        color === 'red' 
          ? 'bg-gradient-to-b from-red-400 to-red-600' 
          : 'bg-gradient-to-b from-blue-400 to-blue-600'
      } shadow-pawn border-2 border-white/30`}
      style={{
        clipPath: 'polygon(20% 0%, 80% 0%, 100% 30%, 100% 100%, 0% 100%, 0% 30%)',
      }}
      initial={{ scale: 0, y: -20 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    />
  );
}
