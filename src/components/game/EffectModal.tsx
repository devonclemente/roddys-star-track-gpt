import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Star, Zap, Users } from 'lucide-react';
import type { EffectEvent } from '@/hooks/useGameLogic';

interface EffectModalProps {
  effect: EffectEvent | null;
  isVisible: boolean;
  onConfirm: () => void;
}

export function EffectModal({ effect, isVisible, onConfirm }: EffectModalProps) {
  if (!effect) return null;

  const getIcon = () => {
    switch (effect.type) {
      case 'special-star':
        return <Star className="w-16 h-16 text-glow-star fill-glow-star" />;
      case 'special-numbered':
        return <Zap className="w-16 h-16 text-space-yellow" />;
      case 'bump':
        return <Users className="w-16 h-16 text-primary" />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (effect.type) {
      case 'special-star':
        return 'Star Space!';
      case 'special-numbered':
        return 'Bonus Space!';
      case 'bump':
        return 'Bump!';
      default:
        return 'Effect';
    }
  };

  const getDescription = () => {
    switch (effect.type) {
      case 'special-star':
        return 'Going back to the previous star!';
      case 'special-numbered':
        return `Moving ${effect.value} more spaces forward!`;
      case 'bump':
        return 'Opponent goes back 2 spaces!';
      default:
        return effect.message;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gradient-to-br from-card to-card/90 border-2 border-primary/40 rounded-3xl p-8 mx-4 max-w-sm text-center shadow-2xl"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <motion.div
              className="mb-4 flex justify-center"
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {getIcon()}
            </motion.div>

            <h2 className="font-display text-3xl text-foreground mb-2">
              {getTitle()}
            </h2>
            
            <p className="font-body text-lg text-muted-foreground mb-6">
              {getDescription()}
            </p>

            <Button 
              variant="cosmic" 
              size="lg"
              onClick={onConfirm}
              className="w-full"
            >
              OK!
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
