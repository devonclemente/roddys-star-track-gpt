import { motion } from 'framer-motion';

interface GameTitleProps {
  size?: 'sm' | 'md' | 'lg';
}

export function GameTitle({ size = 'lg' }: GameTitleProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl md:text-7xl lg:text-8xl',
  };

  return (
    <motion.h1
      className={`font-display ${sizeClasses[size]} text-center tracking-wider drop-shadow-[0_0_30px_hsl(var(--primary)/0.8)]`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <span className="bg-gradient-to-r from-yellow-300 via-primary to-orange-400 bg-clip-text text-transparent drop-shadow-lg">
        STAR
      </span>{' '}
      <span className="bg-gradient-to-r from-orange-400 via-primary to-yellow-300 bg-clip-text text-transparent drop-shadow-lg">
        TRACK
      </span>
    </motion.h1>
  );
}
