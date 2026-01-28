# Star Track (Digital) - Engineering Handover Document

## Project Overview

Star Track is a digital adaptation of an educational board game designed for children (target age: 6 years old). The game features a cosmic/space theme with warm oranges and purples, hexagonal spaces, and step-by-step animated pawn movement to reinforce counting skills.

**Original Game**: [Math Pentathlon](https://www.mathpentath.org/)  
**Purchase Physical Version**: [Introductory Game Set](https://www.mathpentath.org/product/introductory-game-set/)

---

## Technology Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design tokens
- **Animation**: Framer Motion
- **UI Components**: shadcn/ui (Radix primitives)
- **Routing**: React Router DOM

---

## Project Structure

```
src/
├── components/
│   ├── game/           # All game-specific components
│   │   ├── GameScreen.tsx      # Main game orchestrator
│   │   ├── GameBoard.tsx       # Board rendering
│   │   ├── HexSpace.tsx        # Individual hexagonal spaces
│   │   ├── AnimatedPawn.tsx    # Pawn rendering & animation
│   │   ├── ChainDisplay.tsx    # Chain selection UI
│   │   ├── PickupBin.tsx       # Remaining chains display
│   │   ├── DiscardPile.tsx     # Used chains display
│   │   ├── TurnIndicator.tsx   # Current player display
│   │   ├── EffectModal.tsx     # Special space notifications
│   │   ├── PlayerTurnModal.tsx # Turn announcement
│   │   ├── RebuttalTurnModal.tsx # Final turn announcement
│   │   ├── SpecialSpaceModal.tsx # Star/numbered space info
│   │   ├── StartMenu.tsx       # Game mode selection
│   │   ├── EndScreen.tsx       # Winner celebration
│   │   ├── RulesScreen.tsx     # Game rules display
│   │   ├── GameTitle.tsx       # Animated title
│   │   └── StarBackground.tsx  # Decorative stars
│   └── ui/             # shadcn/ui components
├── hooks/
│   ├── useGameLogic.ts         # Core game state & rules
│   └── useMovementAnimation.ts # Step-by-step animation
├── lib/
│   ├── boardLayout.ts  # Board space positions & types
│   └── utils.ts        # Utility functions
├── types/
│   └── game.ts         # TypeScript interfaces & constants
├── pages/
│   └── Index.tsx       # Main page/screen router
└── assets/
    └── space-bg.jpg    # Background image
```

---

## Core Systems

### 1. Game State Management (`src/hooks/useGameLogic.ts`)

The main game logic hook manages:

- **Player positions** and turn order
- **Chain distribution** (pickup bin and discard pile)
- **Movement calculation** including special space effects
- **Win conditions** and rebuttal turn logic

Key functions:
```typescript
drawChains()        // Draw 2 chains from pickup bin
selectChain(chain)  // Player selects a chain, returns MovementResult
completeMovement()  // Finalize position after animation
endTurn()           // Switch players or trigger end game
confirmRebuttal()   // Handle rebuttal turn confirmation
getAIChoice()       // AI decision based on difficulty
```

### 2. Movement Animation System (`src/hooks/useMovementAnimation.ts`)

Handles step-by-step pawn animation for educational counting:

```typescript
interface MovementStep {
  position: number;
  type: 'move' | 'collision' | 'special-star' | 'special-numbered' | 'bump';
}

// Key timing constants
const STEP_DURATION = 250;      // ms per hop
const PAUSE_AFTER_MOVEMENT = 500; // ms before effects trigger
```

Usage:
```typescript
const { startAnimation, stopAnimation, isAnimating, displayPosition } = useMovementAnimation();

startAnimation(fromPosition, steps, onComplete);
```

### 3. Board Layout (`src/lib/boardLayout.ts`)

Defines the serpentine path from START to END:

```typescript
interface BoardSpace {
  id: number;
  type: 'normal' | 'star' | 'numbered' | 'start' | 'end';
  value?: number;  // For numbered spaces (bonus movement)
  x: number;       // Percentage position (0-100)
  y: number;       // Percentage position (0-100)
}
```

The board uses a 5-row serpentine pattern with wide switchbacks.

---

## Game Rules Implementation

### Chain Distribution
Defined in `src/types/game.ts`:
```typescript
CHAIN_DISTRIBUTION: [
  { length: 9, count: 2 },
  { length: 8, count: 3 },
  { length: 7, count: 4 },
  { length: 6, count: 5 },
  { length: 5, count: 6 },
  { length: 4, count: 7 },
  { length: 3, count: 8 },
  { length: 2, count: 9 },
]
// Total: 44 chains
```

### Special Spaces

1. **Numbered Spaces**: Move forward by the displayed number (chains with bonus moves)
2. **Star Spaces**: Go back to the previous star space (does NOT chain further)
3. **Collision/Bump**: Landing on opponent sends them back 2 spaces

### Win Condition
- First player to reach END triggers a "rebuttal turn" for the opponent
- After rebuttal, whoever is furthest ahead wins (or tie if equal)

---

## Animation System Details

### Pawn Animation (`src/components/game/AnimatedPawn.tsx`)

Uses Framer Motion for smooth transitions:

```tsx
<motion.div
  animate={{
    left: `${targetX}%`,
    top: `${targetY}%`,
    scale: isAnimating ? [1, 1.2, 1] : 1,
  }}
  transition={{
    type: 'spring',
    stiffness: 300,
    damping: 25,
    duration: 0.25,
  }}
/>
```

### Key Animation Parameters

| Parameter | Location | Default | Purpose |
|-----------|----------|---------|---------|
| `STEP_DURATION` | `useMovementAnimation.ts` | 250ms | Time per space hop |
| `PAUSE_AFTER_MOVEMENT` | `useMovementAnimation.ts` | 500ms | Delay before effects |
| `stiffness` | `AnimatedPawn.tsx` | 300 | Spring snappiness |
| `damping` | `AnimatedPawn.tsx` | 25 | Spring bounce reduction |

### Modifying Animation Speed

To make pawns move faster/slower:

```typescript
// In src/hooks/useMovementAnimation.ts
const STEP_DURATION = 250;  // Decrease for faster, increase for slower
```

To change the spring physics:

```tsx
// In src/components/game/AnimatedPawn.tsx
transition={{
  type: 'spring',
  stiffness: 300,  // Higher = snappier, lower = floatier
  damping: 25,     // Higher = less bounce, lower = more bounce
}}
```

### Adding New Animations

1. **CSS Keyframes** (in `src/index.css`):
```css
@keyframes your-animation {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.animate-your-animation {
  animation: your-animation 0.5s ease-in-out;
}
```

2. **Framer Motion** (inline in components):
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
/>
```

3. **Tailwind Animations** (in `tailwind.config.ts`):
```typescript
keyframes: {
  'custom-bounce': {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-10px)' },
  }
},
animation: {
  'custom-bounce': 'custom-bounce 0.5s ease-in-out',
}
```

---

## UI Component Customization

### Design Tokens (`src/index.css`)

All colors use HSL format via CSS custom properties:

```css
:root {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 35 80% 50%;      /* Orange accent */
  --secondary: 280 60% 50%;   /* Purple accent */
  /* ... */
}
```

### Space Styling (`src/components/game/HexSpace.tsx`)

Each space type has distinct styling:
- `start`: Green gradient
- `end`: Gold gradient with glow
- `star`: Purple with star icon
- `numbered`: Orange with number display
- `normal`: Muted gray

### Responsive Breakpoints

The app uses Tailwind's default breakpoints:
- `sm`: 640px (switches from mobile to desktop layout)
- Mobile: Vertical stack, bins above board
- Desktop: Side panels with bins

---

## Common Modification Scenarios

### 1. Change Board Layout

Edit `src/lib/boardLayout.ts`:
```typescript
export function createBoardSpaces(): BoardSpace[] {
  const spaces: BoardSpace[] = [];
  // Modify x, y percentages for position
  // Modify type for special spaces
  // Add/remove spaces as needed
}
```

### 2. Adjust Difficulty

In `src/hooks/useGameLogic.ts`, modify `getAIChoice()`:
```typescript
const getAIChoice = (chains: [Chain, Chain]): Chain => {
  switch (difficulty) {
    case 'easy': // Random selection
    case 'medium': // Prefer longer chains
    case 'hard': // Evaluate optimal outcomes
  }
};
```

### 3. Add Sound Effects

Create a sound hook:
```typescript
// src/hooks/useGameSounds.ts
export function useGameSounds() {
  const playMove = () => new Audio('/sounds/hop.mp3').play();
  const playSelect = () => new Audio('/sounds/select.mp3').play();
  // ...
}
```

Then integrate in `GameScreen.tsx` at appropriate moments.

### 4. Modify Chain Distribution

Edit `CHAIN_DISTRIBUTION` in `src/types/game.ts`:
```typescript
export const CHAIN_DISTRIBUTION = [
  { length: 9, count: 2 },
  // Add/modify chain configurations
];
```

---

## Testing

Unit tests exist for:
- Board layout validation (`src/__tests__/game/boardLayout.test.ts`)
- Chain distribution (`src/__tests__/game/chainDistribution.test.ts`)

Run tests with:
```bash
npm run test
# or
bun run test
```

---

## Known Behaviors

1. **Star Space Logic**: Landing on a star sends you to the previous star ONLY. It does NOT chain (landing on the previous star doesn't trigger another go-back).

2. **Pawn Overlap**: When both pawns occupy the same space, they render side-by-side with horizontal offset.

3. **Mobile Button Position**: The "Take Turn" button is positioned at `bottom-2` on mobile to avoid overlapping the board.

4. **Rebuttal Turn**: When first player reaches END, opponent gets one final turn before winner determination.

---

## Contact & Resources

- **Original Game**: [Math Pentathlon](https://www.mathpentath.org/)
- **Lovable Docs**: [docs.lovable.dev](https://docs.lovable.dev/)
- **Framer Motion Docs**: [framer.com/motion](https://www.framer.com/motion/)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com/)

---

*Last updated: January 2026*
