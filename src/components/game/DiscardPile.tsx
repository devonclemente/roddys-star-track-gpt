import { motion, AnimatePresence } from 'framer-motion';
import type { Chain } from '@/types/game';

interface DiscardPileProps {
  chains: Chain[];
}

export function DiscardPile({ chains }: DiscardPileProps) {
  // Group chains by length for display
  const chainsByLength = chains.reduce((acc, chain) => {
    acc.set(chain.length, (acc.get(chain.length) ?? 0) + 1);
    return acc;
  }, new Map<number, number>());

  return (
    <div className="flex flex-col items-center p-6 rounded-2xl bg-card/60 backdrop-blur-sm border-2 border-muted w-52 h-44">
      <p className="text-base font-body text-muted-foreground mb-3">Discard Pile</p>
      
      {chains.length === 0 ? (
        <div className="w-32 h-24 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
          <span className="text-sm text-muted-foreground">Empty</span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5 justify-center max-w-44">
          <AnimatePresence>
            {Array.from(chainsByLength.entries())
              .sort(([a], [b]) => b - a)
              .map(([length, count]) => (
                <motion.div
                  key={length}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-muted/50"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <span className="text-sm font-display text-primary">{length}</span>
                  <span className="text-sm text-muted-foreground">×{count}</span>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      )}
      
      {/* Total count */}
      <p className="mt-auto text-sm text-muted-foreground">
        {chains.length} used
      </p>
    </div>
  );
}
