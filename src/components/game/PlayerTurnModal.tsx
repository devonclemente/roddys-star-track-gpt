import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import type { Player } from '@/types/game';

interface PlayerTurnModalProps {
  player: Player;
  isVisible: boolean;
  onDismiss: () => void;
}

export function PlayerTurnModal({ player, isVisible, onDismiss }: PlayerTurnModalProps) {
  const playerColor = player === 'red' ? 'from-red-500 to-red-600' : 'from-blue-500 to-blue-600';
  const playerName = player === 'red' ? 'Red' : 'Blue';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex flex-col items-center gap-6 p-8 rounded-3xl bg-card border-2 border-muted shadow-card"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
          >
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${playerColor} shadow-glow flex items-center justify-center`}>
              <div className="w-8 h-12 bg-white/30 rounded-full" style={{
                clipPath: 'polygon(20% 0%, 80% 0%, 100% 30%, 100% 100%, 0% 100%, 0% 30%)',
              }} />
            </div>
            
            <h2 className={`text-4xl font-display bg-gradient-to-r ${playerColor} bg-clip-text text-transparent`}>
              {playerName}'s Turn!
            </h2>
            
            <p className="text-muted-foreground font-body">Get ready to pick your chains</p>
            
            <Button variant="cosmic" size="lg" onClick={onDismiss}>
              I'm Ready!
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
