import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Star, ArrowRight } from 'lucide-react';

interface SpecialSpaceModalProps {
  isVisible: boolean;
  type: 'star' | 'numbered' | null;
  value?: number;
  onConfirm: () => void;
}

export function SpecialSpaceModal({ isVisible, type, value, onConfirm }: SpecialSpaceModalProps) {
  const getMessage = () => {
    if (type === 'star') {
      return {
        icon: <Star className="w-16 h-16 text-yellow-400 fill-yellow-400" />,
        title: "⭐ Star Space! ⭐",
        message: "Whoops! Go back to the last star!",
        color: "from-yellow-500/20 to-orange-500/20",
        borderColor: "border-yellow-400/50",
      };
    }
    if (type === 'numbered' && value !== undefined) {
      return {
        icon: <ArrowRight className="w-16 h-16 text-green-400" />,
        title: `🎉 Bonus Space! 🎉`,
        message: `Move forward ${value} more space${value > 1 ? 's' : ''}!`,
        color: "from-green-500/20 to-emerald-500/20",
        borderColor: "border-green-400/50",
      };
    }
    return null;
  };

  const content = getMessage();
  if (!content) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`relative w-full max-w-md p-8 rounded-3xl bg-gradient-to-br ${content.color} backdrop-blur-md border-4 ${content.borderColor} shadow-2xl`}
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            {/* Floating stars background effect for star spaces */}
            {type === 'star' && (
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-yellow-300"
                    style={{
                      left: `${15 + i * 15}%`,
                      top: `${10 + (i % 3) * 25}%`,
                    }}
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 15, -15, 0],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity,
                    }}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Icon */}
            <motion.div
              className="flex justify-center mb-4"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: type === 'star' ? [0, -5, 5, 0] : 0,
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {content.icon}
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-3xl font-display text-center text-foreground mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {content.title}
            </motion.h2>

            {/* Message */}
            <motion.p
              className="text-xl text-center text-foreground/90 mb-8 font-medium"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {content.message}
            </motion.p>

            {/* OK Button */}
            <motion.div
              className="flex justify-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                variant="play"
                size="xl"
                onClick={onConfirm}
                className="min-w-32"
              >
                OK!
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
