import { motion } from 'framer-motion';
import type { Chain } from '@/types/game';

interface ChainDisplayProps {
  chain: Chain;
  isSelected?: boolean;
  isRevealed?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const chainColors = [
  { main: '#ef4444', shine: '#fca5a5', shadow: '#991b1b' },  // Red
  { main: '#3b82f6', shine: '#93c5fd', shadow: '#1d4ed8' },  // Blue
  { main: '#22c55e', shine: '#86efac', shadow: '#15803d' },  // Green
  { main: '#eab308', shine: '#fde047', shadow: '#a16207' },  // Yellow
  { main: '#a855f7', shine: '#d8b4fe', shadow: '#7e22ce' },  // Purple
  { main: '#ec4899', shine: '#f9a8d4', shadow: '#be185d' },  // Pink
  { main: '#f97316', shine: '#fdba74', shadow: '#c2410c' },  // Orange
  { main: '#06b6d4', shine: '#67e8f9', shadow: '#0e7490' },  // Cyan
];

// Individual chain link SVG component
function ChainLink({ 
  color, 
  index, 
  size 
}: { 
  color: { main: string; shine: string; shadow: string }; 
  index: number;
  size: 'sm' | 'md' | 'lg';
}) {
  const sizeMap = {
    sm: { width: 20, height: 32, overlap: -10 },
    md: { width: 28, height: 44, overlap: -14 },
    lg: { width: 36, height: 56, overlap: -18 },
  };
  
  const { width, height, overlap } = sizeMap[size];
  const isEven = index % 2 === 0;
  
  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 28 44"
      style={{ 
        marginLeft: index > 0 ? overlap : 0,
        zIndex: isEven ? 2 : 1,
        transform: isEven ? 'rotate(0deg)' : 'rotate(90deg) translateY(-8px)',
      }}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: isEven ? 0 : 90 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      {/* Outer ring of chain link */}
      <ellipse
        cx="14"
        cy="22"
        rx="11"
        ry="18"
        fill="none"
        stroke={color.shadow}
        strokeWidth="6"
      />
      {/* Main body of chain link */}
      <ellipse
        cx="14"
        cy="22"
        rx="11"
        ry="18"
        fill="none"
        stroke={color.main}
        strokeWidth="4"
      />
      {/* Inner highlight */}
      <ellipse
        cx="14"
        cy="22"
        rx="8"
        ry="15"
        fill="none"
        stroke={color.shine}
        strokeWidth="1"
        opacity="0.5"
      />
      {/* Top shine effect */}
      <ellipse
        cx="10"
        cy="12"
        rx="3"
        ry="4"
        fill={color.shine}
        opacity="0.6"
      />
    </motion.svg>
  );
}

// Interlocking chain visual
function InterlockingChain({ 
  length, 
  colorIndex, 
  size 
}: { 
  length: number; 
  colorIndex: number; 
  size: 'sm' | 'md' | 'lg';
}) {
  const color = chainColors[colorIndex % chainColors.length];
  
  return (
    <div className="flex items-center justify-center" style={{ minHeight: size === 'lg' ? 60 : size === 'md' ? 48 : 36 }}>
      {Array.from({ length }).map((_, i) => (
        <ChainLink key={i} color={color} index={i} size={size} />
      ))}
    </div>
  );
}

export function ChainDisplay({ 
  chain, 
  isSelected = false, 
  isRevealed = true,
  onClick,
  size = 'md'
}: ChainDisplayProps) {
  const colorIndex = (chain.length - 2) % chainColors.length;

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
      <InterlockingChain length={chain.length} colorIndex={colorIndex} size={size} />
      
      {/* Chain length badge */}
      <div className="flex items-center justify-center px-3 py-1 rounded-full bg-primary text-primary-foreground font-display text-lg shadow-glow">
        {chain.length} links
      </div>
    </motion.div>
  );
}
