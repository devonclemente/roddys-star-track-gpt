import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';

interface GameTitleProps {
  size?: 'sm' | 'md' | 'lg';
  showRocket?: boolean;
}

export function GameTitle({ size = 'lg', showRocket = false }: GameTitleProps) {
  const sizeClasses = new Map([
    ['sm', 'text-3xl md:text-4xl'],
    ['md', 'text-4xl md:text-5xl'],
    ['lg', 'text-6xl md:text-7xl lg:text-8xl'],
  ]);

  const rocketSizeClasses = new Map([
    ['sm', 'w-8 h-8 md:w-10 md:h-10'],
    ['md', 'w-10 h-10 md:w-12 md:h-12'],
    ['lg', 'w-14 h-14 md:w-16 md:h-16'],
  ]);

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {showRocket && (
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative"
        >
          <Rocket 
            className={`${rocketSizeClasses.get(size)} text-primary drop-shadow-[0_0_15px_hsl(var(--primary)/0.8)] rotate-45`}
            strokeWidth={1.5}
          />
          {/* Rocket trail effect */}
          <motion.div
            className="absolute -left-4 top-1/2 -translate-y-1/2 w-6 h-1 bg-gradient-to-l from-primary/80 to-transparent rounded-full"
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scaleX: [0.8, 1.2, 0.8]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      )}
      <h1
        className={`font-display ${sizeClasses.get(size)} text-center tracking-wider drop-shadow-[0_0_30px_hsl(var(--primary)/0.8)]`}
      >
        <span className="bg-gradient-to-r from-yellow-300 via-primary to-orange-400 bg-clip-text text-transparent drop-shadow-lg">
          STAR
        </span>{' '}
        <span className="bg-gradient-to-r from-orange-400 via-primary to-yellow-300 bg-clip-text text-transparent drop-shadow-lg">
          TRACK
        </span>
      </h1>
    </motion.div>
  );
}
