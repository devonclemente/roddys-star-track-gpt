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
  'from-red-400 to-red-600',
  'from-blue-400 to-blue-600',
  'from-green-400 to-green-600',
  'from-yellow-400 to-yellow-600',
  'from-purple-400 to-purple-600',
  'from-pink-400 to-pink-600',
  'from-orange-400 to-orange-600',
  'from-cyan-400 to-cyan-600',
];

export function ChainDisplay({ 
  chain, 
  isSelected = false, 
  isRevealed = true,
  onClick,
  size = 'md'
}: ChainDisplayProps) {
  const sizeMap = {
    sm: { link: 'w-4 h-6', gap: '-ml-1' },
    md: { link: 'w-6 h-9', gap: '-ml-1.5' },
    lg: { link: 'w-8 h-12', gap: '-ml-2' },
  };

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
      className={`flex items-center p-3 rounded-xl bg-card/50 backdrop-blur-sm border-2 cursor-pointer transition-all ${
        isSelected 
          ? 'border-primary shadow-glow scale-105' 
          : 'border-transparent hover:border-primary/50'
      }`}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
      animate={{ opacity: 1, scale: isSelected ? 1.05 : 1, rotate: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Chain links */}
      <div className="flex items-center">
        {Array.from({ length: chain.length }).map((_, i) => (
          <div
            key={i}
            className={`${sizeMap[size].link} ${i > 0 ? sizeMap[size].gap : ''} bg-gradient-to-b ${chainColors[colorIndex]} rounded-full border-2 border-white/30 shadow-md`}
            style={{
              borderRadius: '40%',
            }}
          />
        ))}
      </div>
      
      {/* Chain length badge */}
      <div className="ml-3 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-display text-lg shadow-glow">
        {chain.length}
      </div>
    </motion.div>
  );
}
