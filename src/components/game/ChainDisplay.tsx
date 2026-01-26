import { motion } from 'framer-motion';
import type { Chain } from '@/types/game';

interface ChainDisplayProps {
  chain: Chain;
  isSelected?: boolean;
  isRevealed?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;
}

// Silver chain color
const silverColor = { main: '#a8a8a8', shine: '#e8e8e8', shadow: '#5a5a5a' };

// Individual chain link SVG component
function ChainLink({ 
  index, 
  size 
}: { 
  index: number;
  size: 'sm' | 'md' | 'lg';
}) {
  const sizeMap = new Map([
    ['sm', { width: 24, height: 36 }],
    ['md', { width: 32, height: 48 }],
    ['lg', { width: 40, height: 60 }],
  ]);

  const { width, height } = sizeMap.get(size) ?? { width: 32, height: 48 };
  const isEven = index % 2 === 0;
  
  // Serpentine vertical offset for easier counting
  const yOffset = isEven ? -4 : 4;
  
  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 32 48"
      style={{ 
        marginLeft: index > 0 ? -6 : 0,
        marginTop: yOffset,
        zIndex: isEven ? 2 : 1,
      }}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: isEven ? 0 : 90 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
    >
      {/* Outer ring of chain link */}
      <ellipse
        cx="16"
        cy="24"
        rx="12"
        ry="20"
        fill="none"
        stroke={silverColor.shadow}
        strokeWidth="5"
      />
      {/* Main body of chain link */}
      <ellipse
        cx="16"
        cy="24"
        rx="12"
        ry="20"
        fill="none"
        stroke={silverColor.main}
        strokeWidth="3"
      />
      {/* Inner highlight */}
      <ellipse
        cx="16"
        cy="24"
        rx="9"
        ry="16"
        fill="none"
        stroke={silverColor.shine}
        strokeWidth="1.5"
        opacity="0.6"
      />
      {/* Top shine effect */}
      <ellipse
        cx="11"
        cy="14"
        rx="3"
        ry="5"
        fill={silverColor.shine}
        opacity="0.7"
      />
    </motion.svg>
  );
}

// Interlocking chain visual
function InterlockingChain({ 
  length, 
  size 
}: { 
  length: number; 
  size: 'sm' | 'md' | 'lg';
}) {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: size === 'lg' ? 70 : size === 'md' ? 56 : 44 }}>
      {Array.from({ length }).map((_, i) => (
        <ChainLink key={i} index={i} size={size} />
      ))}
    </div>
  );
}

export function ChainDisplay({ 
  chain, 
  isSelected = false, 
  isRevealed = true,
  onClick,
  size = 'md',
  compact = false
}: ChainDisplayProps) {
  if (!isRevealed) {
    return (
      <motion.div
        className={`flex items-center justify-center bg-muted/50 rounded-xl p-4 border-2 border-dashed border-muted-foreground/30 cursor-pointer hover:border-primary/50 transition-colors ${
          isSelected ? 'ring-2 ring-primary' : ''
        }`}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-muted-foreground font-body">?</span>
      </motion.div>
    );
  }

  // Compact mode for mobile
  if (compact) {
    return (
      <motion.div
        className={`flex flex-col items-center gap-1 p-2 rounded-lg bg-card/50 backdrop-blur-sm border-2 cursor-pointer transition-all ${
          isSelected 
            ? 'border-primary shadow-glow' 
            : 'border-transparent hover:border-primary/50'
        }`}
        onClick={onClick}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.95 }}
      >
        <InterlockingChain length={chain.length} size="sm" />
        <div className="flex items-center justify-center px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-display text-sm">
          {chain.length}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-card/50 backdrop-blur-sm border-2 cursor-pointer transition-all ${
        isSelected 
          ? 'border-primary shadow-glow scale-105' 
          : 'border-transparent hover:border-primary/50 hover:bg-card/70'
      }`}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: isSelected ? 1.05 : 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Interlocking chain links */}
      <InterlockingChain length={chain.length} size={size} />
      
      {/* Chain length badge */}
      <div className="flex items-center justify-center px-3 py-1 rounded-full bg-primary text-primary-foreground font-display text-lg shadow-glow">
        {chain.length} links
      </div>
    </motion.div>
  );
}
