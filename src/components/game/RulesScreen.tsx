import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GameTitle } from './GameTitle';
import { StarBackground } from './StarBackground';
import { X, Star, Hash, Zap, Users } from 'lucide-react';

interface RulesScreenProps {
  onClose: () => void;
}

export function RulesScreen({ onClose }: RulesScreenProps) {
  const rules = [
    {
      icon: <Zap className="w-6 h-6 text-primary" />,
      title: 'Draw Chains',
      description: 'Pick 2 chains from the mystery bin, then choose one to move forward!',
    },
    {
      icon: <Hash className="w-6 h-6 text-space-yellow" />,
      title: 'Number Spaces',
      description: 'Land on a number? Move forward that many extra spaces!',
    },
    {
      icon: <Star className="w-6 h-6 text-glow-star" />,
      title: 'Star Spaces',
      description: 'Oops! Landing on a star sends you back to the previous star.',
    },
    {
      icon: <Users className="w-6 h-6 text-player-blue" />,
      title: 'Bump Opponents',
      description: 'Land on your opponent? Bump them back 2 spaces!',
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center p-4 overflow-hidden">
      <StarBackground />
      
      <motion.div
        className="relative z-10 flex flex-col items-center gap-6 max-w-lg w-full py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center justify-between w-full">
          <GameTitle size="sm" />
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>
        
        <h2 className="text-2xl font-display text-foreground">How to Play</h2>
        
        <div className="flex flex-col gap-4 w-full">
          {rules.map((rule, index) => (
            <motion.div
              key={rule.title}
              className="flex items-start gap-4 p-4 rounded-xl bg-card/60 backdrop-blur-sm border border-muted"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="p-2 rounded-lg bg-muted/50">
                {rule.icon}
              </div>
              <div>
                <h3 className="font-display text-lg text-foreground">{rule.title}</h3>
                <p className="text-sm text-muted-foreground font-body">{rule.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          className="p-4 rounded-xl bg-gradient-to-r from-primary/20 to-space-orange/20 border border-primary/30 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-display text-lg text-foreground mb-2">🏆 How to Win</h3>
          <p className="text-sm text-muted-foreground font-body">
            Race to the END! When someone reaches it, the other player gets one last turn. 
            Whoever is farthest along wins!
          </p>
        </motion.div>
        
        <Button variant="cosmic" size="lg" onClick={onClose} className="mt-4">
          Got it!
        </Button>
      </motion.div>
    </div>
  );
}
