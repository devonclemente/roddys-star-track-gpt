import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { StarBackground } from './StarBackground';
import type { Player } from '@/types/game';
import { Trophy, RotateCcw, Home, Star, Sparkles } from 'lucide-react';

interface EndScreenProps {
  winner: Player | 'tie';
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

// Floating particle component
function FloatingParticle({ delay, x, color }: { delay: number; x: number; color: string }) {
  return (
    <motion.div
      className={`absolute w-3 h-3 ${color} rounded-full`}
      style={{ left: `${x}%`, bottom: 0 }}
      initial={{ y: 0, opacity: 0, scale: 0 }}
      animate={{
        y: [-20, -400],
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0.5],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
  );
}

// Confetti piece component
function ConfettiPiece({ index }: { index: number }) {
  const colors = ['bg-primary', 'bg-space-orange', 'bg-yellow-400', 'bg-pink-400', 'bg-cyan-400'];
  const color = colors.at(index % colors.length) ?? colors.at(0);
  const startX = Math.random() * 100;
  const endX = startX + (Math.random() - 0.5) * 40;
  const rotation = Math.random() * 720 - 360;
  
  return (
    <motion.div
      className={`absolute w-2 h-4 ${color} rounded-sm`}
      style={{ left: `${startX}%`, top: -20 }}
      initial={{ y: -20, x: 0, rotate: 0, opacity: 1 }}
      animate={{
        y: [0, 600],
        x: [0, endX - startX],
        rotate: [0, rotation],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 0.5,
        ease: 'easeIn',
      }}
    />
  );
}

// Orbiting star component
function OrbitingStar({ delay, radius, duration }: { delay: number; radius: number; duration: number }) {
  return (
    <motion.div
      className="absolute"
      style={{ width: radius * 2, height: radius * 2, left: '50%', top: '50%', marginLeft: -radius, marginTop: -radius }}
      animate={{ rotate: 360 }}
      transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
    >
      <Star className="absolute w-4 h-4 text-yellow-400 fill-yellow-400" style={{ left: radius - 8, top: -8 }} />
    </motion.div>
  );
}

export function EndScreen({ winner, onPlayAgain, onMainMenu }: EndScreenProps) {
  const isTie = winner === 'tie';
  const winnerName = isTie ? "It's a Tie!" : winner === 'red' ? 'Red Wins!' : 'Blue Wins!';
  const winnerColor = isTie 
    ? 'from-primary via-space-orange to-primary' 
    : winner === 'red' 
      ? 'from-red-400 via-red-500 to-orange-400' 
      : 'from-blue-400 via-cyan-400 to-blue-500';
  
  const glowColor = isTie 
    ? 'shadow-[0_0_60px_rgba(var(--primary),0.5)]'
    : winner === 'red'
      ? 'shadow-[0_0_60px_rgba(239,68,68,0.5)]'
      : 'shadow-[0_0_60px_rgba(59,130,246,0.5)]';

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      <StarBackground />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <FloatingParticle
            key={i}
            delay={i * 0.3}
            x={10 + (i * 7)}
            color={i % 2 === 0 ? 'bg-primary/60' : 'bg-space-orange/60'}
          />
        ))}
      </div>
      
      {/* Confetti burst */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <ConfettiPiece key={i} index={i} />
        ))}
      </div>
      
      <motion.div
        className="relative z-10 flex flex-col items-center gap-6 max-w-md w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Trophy with effects */}
        <motion.div
          className="relative"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: 'spring', 
            stiffness: 200, 
            damping: 15,
            delay: 0.2 
          }}
        >
          {/* Orbiting stars */}
          <OrbitingStar delay={0} radius={70} duration={4} />
          <OrbitingStar delay={0.5} radius={90} duration={5} />
          <OrbitingStar delay={1} radius={110} duration={6} />
          
          {/* Pulsing glow rings */}
          <motion.div
            className={`absolute inset-0 rounded-full ${glowColor}`}
            style={{ width: 160, height: 160, left: -32, top: -32 }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-space-orange/20"
            style={{ width: 140, height: 140, left: -22, top: -22 }}
            animate={{ 
              scale: [1.1, 1.3, 1.1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 2, delay: 0.3, repeat: Infinity }}
          />
          
          {/* Trophy icon */}
          <motion.div
            animate={{ 
              y: [0, -8, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Trophy className="w-24 h-24 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
          </motion.div>
          
          {/* Sparkle effects */}
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Sparkles className="w-6 h-6 text-yellow-300" />
          </motion.div>
          <motion.div
            className="absolute -bottom-1 -left-3"
            animate={{ scale: [1, 0.7, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.2, delay: 0.5, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5 text-primary" />
          </motion.div>
        </motion.div>
        
        {/* Winner text with letter animation */}
        <motion.div className="overflow-hidden">
          <motion.h1
            className={`text-5xl md:text-7xl font-display bg-gradient-to-r ${winnerColor} bg-clip-text text-transparent text-center drop-shadow-lg`}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              type: 'spring',
              stiffness: 100,
              damping: 15,
              delay: 0.5 
            }}
          >
            {winnerName}
          </motion.h1>
        </motion.div>
        
        {/* Animated underline */}
        <motion.div
          className={`h-1 rounded-full bg-gradient-to-r ${winnerColor}`}
          initial={{ width: 0 }}
          animate={{ width: '80%' }}
          transition={{ delay: 0.8, duration: 0.5, ease: 'easeOut' }}
        />
        
        {/* Subtitle */}
        <motion.p
          className="text-muted-foreground text-center text-lg font-body"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          {isTie 
            ? '🌟 Both players reached the stars! Ready for a rematch? 🌟' 
            : '🚀 Amazing journey through the cosmos! 🚀'}
        </motion.p>
        
        {/* Buttons with staggered animation */}
        <motion.div
          className="flex flex-col gap-3 w-full mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.3, type: 'spring' }}
          >
            <Button 
              variant="cosmic" 
              size="xl" 
              onClick={onPlayAgain} 
              className="w-full group"
            >
              <motion.span
                animate={{ rotate: [0, -15, 15, 0] }}
                transition={{ duration: 0.5, delay: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <RotateCcw className="w-5 h-5 group-hover:animate-spin" />
              </motion.span>
              Play Again
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.5, type: 'spring' }}
          >
            <Button variant="outline" size="lg" onClick={onMainMenu} className="w-full">
              <Home className="w-5 h-5" />
              Main Menu
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
