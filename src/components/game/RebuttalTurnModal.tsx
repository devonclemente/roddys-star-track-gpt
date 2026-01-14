import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import type { Player } from '@/types/game';
import { Zap, Trophy } from 'lucide-react';

interface RebuttalTurnModalProps {
  isVisible: boolean;
  finisher: Player;
  rebuttalPlayer: Player;
  onConfirm: () => void;
}

export function RebuttalTurnModal({ isVisible, finisher, rebuttalPlayer, onConfirm }: RebuttalTurnModalProps) {
  const finisherName = finisher === 'red' ? 'Red' : 'Blue';
  const rebuttalName = rebuttalPlayer === 'red' ? 'Red' : 'Blue';
  const rebuttalColor = rebuttalPlayer === 'red' ? 'text-red-400' : 'text-blue-400';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative bg-card/95 backdrop-blur-md rounded-3xl p-8 max-w-sm w-full border-2 border-primary/50 shadow-glow text-center"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            {/* Trophy icon for the finisher */}
            <motion.div
              className="flex justify-center mb-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Trophy className="w-16 h-16 text-yellow-400 drop-shadow-lg" />
            </motion.div>

            {/* First player finished message */}
            <motion.h2
              className="text-2xl font-display text-foreground mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {finisherName} Reached the End!
            </motion.h2>

            {/* Rebuttal turn message */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className={`w-6 h-6 ${rebuttalColor}`} />
                <span className={`text-xl font-display ${rebuttalColor}`}>
                  {rebuttalName} Gets a Rebuttal Turn!
                </span>
                <Zap className={`w-6 h-6 ${rebuttalColor}`} />
              </div>
              <p className="text-muted-foreground font-body">
                One last chance to catch up and tie the game!
              </p>
            </motion.div>

            {/* Confirm button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                variant="cosmic"
                size="lg"
                onClick={onConfirm}
                className="w-full text-lg"
              >
                Let's Go!
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}