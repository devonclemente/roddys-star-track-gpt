import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';

interface GameTitleProps {
  size?: 'sm' | 'md' | 'lg';
  showRocket?: boolean;
}

export function GameTitle({ size = 'lg', showRocket = false }: GameTitleProps) {
  const sizeClasses = {
    sm: 'text-3xl md:text-4xl',
    md: 'text-4xl md:text-5xl',
    lg: 'text-6xl md:text-7xl lg:text-8xl',
  };

  const rocketSizeClasses = {
    sm: 'w-8 h-8 md:w-10 md:h-10',
    md: 'w-10 h-10 md:w-12 md:h-12',
    lg: 'w-14 h-14 md:w-16 md:h-16',
  };

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
            className={`${rocketSizeClasses[size]} text-primary drop-shadow-[0_0_15px_hsl(var(--primary)/0.8)] rotate-45`}
            strokeWidth={1.5}
          />
          {/* Main engine trail */}
          <motion.div
            className="absolute -left-6 top-1/2 -translate-y-1/2 w-8 h-1.5 bg-gradient-to-l from-primary via-primary/60 to-transparent rounded-full"
            animate={{ 
              opacity: [0.6, 1, 0.6],
              scaleX: [0.8, 1.3, 0.8]
            }}
            transition={{ 
              duration: 0.8, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Particle stars trail */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-primary"
              style={{
                width: size === 'lg' ? 4 : size === 'md' ? 3 : 2,
                height: size === 'lg' ? 4 : size === 'md' ? 3 : 2,
                left: -12 - (i * 8),
                top: '50%',
              }}
              animate={{
                opacity: [0, 0.9, 0],
                scale: [0.5, 1, 0.3],
                y: [0, (i % 2 === 0 ? -6 : 6), 0],
                x: [-5, 5, -5],
              }}
              transition={{
                duration: 1.2 + (i * 0.15),
                repeat: Infinity,
                delay: i * 0.12,
                ease: "easeInOut"
              }}
            />
          ))}
          {/* Sparkle effects */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute"
              style={{
                left: -20 - (i * 12),
                top: '50%',
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.25,
                ease: "easeOut"
              }}
            >
              <div className="w-1 h-1 bg-yellow-300 rounded-full shadow-[0_0_6px_2px_hsl(var(--primary)/0.6)]" />
            </motion.div>
          ))}
        </motion.div>
      )}
      <h1
        className={`font-display ${sizeClasses[size]} text-center tracking-wider drop-shadow-[0_0_30px_hsl(var(--primary)/0.8)]`}
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
