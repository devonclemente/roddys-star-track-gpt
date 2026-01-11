import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GameTitle } from './GameTitle';
import { StarBackground } from './StarBackground';
import type { Player } from '@/types/game';
import { Trophy, RotateCcw, Home } from 'lucide-react';

interface EndScreenProps {
  winner: Player | 'tie';
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export function EndScreen({ winner, onPlayAgain, onMainMenu }: EndScreenProps) {
  const isTie = winner === 'tie';
  const winnerName = isTie ? 'It\'s a Tie!' : winner === 'red' ? 'Red Wins!' : 'Blue Wins!';
  const winnerColor = isTie 
    ? 'from-primary to-space-orange' 
    : winner === 'red' 
      ? 'from-red-400 to-red-600' 
      : 'from-blue-400 to-blue-600';

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      <StarBackground />
      
      <motion.div
        className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <motion.div
          className="relative"
          initial={{ rotate: -10, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <Trophy className="w-24 h-24 text-primary drop-shadow-lg" />
          <motion.div
            className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        
        <motion.h1
          className={`text-5xl md:text-6xl font-display bg-gradient-to-r ${winnerColor} bg-clip-text text-transparent text-center`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {winnerName}
        </motion.h1>
        
        <motion.p
          className="text-muted-foreground text-center text-lg font-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {isTie 
            ? 'Both players reached the end! Want a rematch?' 
            : 'Great game! Ready for another adventure?'}
        </motion.p>
        
        <motion.div
          className="flex flex-col gap-3 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button variant="cosmic" size="xl" onClick={onPlayAgain} className="w-full">
            <RotateCcw className="w-5 h-5" />
            Play Again
          </Button>
          
          <Button variant="outline" size="lg" onClick={onMainMenu} className="w-full">
            <Home className="w-5 h-5" />
            Main Menu
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
