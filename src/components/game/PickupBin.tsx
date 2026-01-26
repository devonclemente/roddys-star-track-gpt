import { motion } from 'framer-motion';

interface PickupBinProps {
  remainingCount: number;
}

export function PickupBin({ remainingCount }: PickupBinProps) {
  return (
    <motion.div
      className="relative flex flex-col items-center p-6 rounded-2xl bg-card/60 backdrop-blur-sm border-2 border-muted w-52 h-44"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Mystery container visual */}
      <div className="relative w-32 h-24 bg-gradient-to-b from-muted to-space-deep rounded-xl border-4 border-muted-foreground/30 overflow-hidden">
        {/* Question marks floating */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl text-muted-foreground/50 font-display">?</span>
        </div>
        
        {/* Colorful chains peeking out */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
          {remainingCount > 0 && (
            <>
              <div className="w-3 h-6 bg-gradient-to-b from-red-400 to-red-600 rounded-full -mb-1" />
              <div className="w-3 h-5 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full -mb-0.5" />
              <div className="w-3 h-7 bg-gradient-to-b from-green-400 to-green-600 rounded-full -mb-2" />
            </>
          )}
        </div>
      </div>
      
      {/* Label */}
      <p className="mt-3 text-base font-body text-muted-foreground">Pickup Bin</p>
      
      {/* Count badge */}
      <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-secondary flex items-center justify-center shadow-md">
        <span className="text-base font-display text-secondary-foreground">{remainingCount}</span>
      </div>
    </motion.div>
  );
}
