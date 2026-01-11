import { motion } from 'framer-motion';
import type { Player } from '@/types/game';

interface TurnIndicatorProps {
  currentPlayer: Player;
  isAI: boolean;
  message?: string | null;
}

export function TurnIndicator({ currentPlayer, isAI, message }: TurnIndicatorProps) {
  const playerName = isAI ? 'Computer' : currentPlayer === 'red' ? 'Red Player' : 'Blue Player';
  const playerColor = currentPlayer === 'red' ? 'from-red-500 to-red-600' : 'from-blue-500 to-blue-600';

  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      key={currentPlayer}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r ${playerColor} shadow-lg`}>
        <div className={`w-4 h-4 rounded-full ${currentPlayer === 'red' ? 'bg-red-300' : 'bg-blue-300'}`} />
        <span className="font-display text-white text-lg">{playerName}'s Turn</span>
      </div>
      
      {message && (
        <motion.p
          className="text-sm text-muted-foreground text-center font-body max-w-xs"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}
