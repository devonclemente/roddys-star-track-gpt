import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GameTitle } from './GameTitle';
import { StarBackground } from './StarBackground';
import { Bot, Users, BookOpen } from 'lucide-react';
import type { GameMode, AIDifficulty } from '@/types/game';
import { useState } from 'react';

interface StartMenuProps {
  onStartGame: (mode: GameMode, difficulty: AIDifficulty) => void;
  onShowRules: () => void;
}

export function StartMenu({ onStartGame, onShowRules }: StartMenuProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<AIDifficulty>('easy');

  const handleModeSelect = (mode: GameMode) => {
    setSelectedMode(mode);
    if (mode === 'two-player') {
      onStartGame(mode, 'easy');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
      <StarBackground />
      
      <motion.div
        className="relative z-10 flex flex-col items-center gap-6 max-w-md w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <GameTitle />
        
        <motion.p
          className="text-foreground/80 text-center text-lg font-body"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          A cosmic chain-picking adventure!
        </motion.p>

        {selectedMode === null ? (
          <motion.div
            className="flex flex-col gap-4 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              variant="cosmic"
              size="xl"
              className="w-full"
              onClick={() => handleModeSelect('vs-ai')}
            >
              <Bot className="w-6 h-6" />
              Play vs Computer
            </Button>
            
            <Button
              variant="cosmic"
              size="xl"
              className="w-full"
              onClick={() => handleModeSelect('two-player')}
            >
              <Users className="w-6 h-6" />
              Two Players
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="w-full mt-4"
              onClick={onShowRules}
            >
              <BookOpen className="w-5 h-5" />
              How to Play
            </Button>
          </motion.div>
        ) : (
          <motion.div
            className="flex flex-col gap-4 w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="text-xl font-display text-center text-foreground">
              Choose Difficulty
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((difficulty) => (
                <Button
                  key={difficulty}
                  variant={selectedDifficulty === difficulty ? 'cosmic' : 'outline'}
                  size="lg"
                  className="w-full capitalize"
                  onClick={() => setSelectedDifficulty(difficulty)}
                >
                  {difficulty === 'easy' && '🌟 '}
                  {difficulty === 'medium' && '⭐ '}
                  {difficulty === 'hard' && '💫 '}
                  {difficulty}
                </Button>
              ))}
            </div>
            
            <Button
              variant="play"
              size="xl"
              className="w-full mt-4"
              onClick={() => onStartGame('vs-ai', selectedDifficulty)}
            >
              Start Game!
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMode(null)}
            >
              ← Back
            </Button>
          </motion.div>
        )}
        
        {/* Attribution */}
        <motion.p
          className="text-xs text-foreground/40 text-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Inspired by Star Track™ (1980s) — Fan-made educational game
        </motion.p>
      </motion.div>
    </div>
  );
}
