import type { BoardSpace, SpaceType } from '@/types/game';

// Create the board spaces based on the original Star Track layout
// The board winds in an S-curve pattern with ~44 spaces
export function createBoardSpaces(): BoardSpace[] {
  const spaces: BoardSpace[] = [];
  
  // Define the space types along the path
  // Based on the original board: mix of normal, star, and numbered spaces
  const spaceDefinitions: { type: SpaceType; value?: number }[] = [
    { type: 'start' },           // 0: START
    { type: 'numbered', value: 1 }, // 1
    { type: 'normal' },          // 2
    { type: 'normal' },          // 3
    { type: 'numbered', value: 9 }, // 4
    { type: 'normal' },          // 5
    { type: 'normal' },          // 6
    { type: 'star' },            // 7: First star
    { type: 'numbered', value: 4 }, // 8
    { type: 'normal' },          // 9
    { type: 'normal' },          // 10
    { type: 'numbered', value: 1 }, // 11
    { type: 'normal' },          // 12
    { type: 'star' },            // 13: Second star
    { type: 'numbered', value: 3 }, // 14
    { type: 'normal' },          // 15
    { type: 'normal' },          // 16
    { type: 'numbered', value: 0 }, // 17
    { type: 'normal' },          // 18
    { type: 'numbered', value: 6 }, // 19
    { type: 'star' },            // 20: Third star
    { type: 'normal' },          // 21
    { type: 'numbered', value: 0 }, // 22
    { type: 'normal' },          // 23
    { type: 'numbered', value: 3 }, // 24
    { type: 'star' },            // 25: Fourth star
    { type: 'normal' },          // 26
    { type: 'numbered', value: 4 }, // 27
    { type: 'numbered', value: 5 }, // 28
    { type: 'normal' },          // 29
    { type: 'star' },            // 30: Fifth star
    { type: 'numbered', value: 1 }, // 31
    { type: 'normal' },          // 32
    { type: 'normal' },          // 33
    { type: 'numbered', value: 2 }, // 34
    { type: 'normal' },          // 35
    { type: 'star' },            // 36: Sixth star
    { type: 'numbered', value: 7 }, // 37
    { type: 'normal' },          // 38
    { type: 'normal' },          // 39
    { type: 'end' },             // 40: END
  ];

  // Generate positions for an S-curve winding path
  // This creates a responsive grid that can be scaled
  const positions = generateSCurvePath(spaceDefinitions.length);

  spaceDefinitions.forEach((def, index) => {
    spaces.push({
      id: index,
      type: def.type,
      value: def.value,
      x: positions[index].x,
      y: positions[index].y,
    });
  });

  return spaces;
}

function generateSCurvePath(count: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  
  // Create a winding path similar to the original board
  // The board goes: down-right, then up, then down-right, then up to end
  const path = [
    // Bottom left, going up-right
    { x: 10, y: 90 },  // 0 - START
    { x: 15, y: 82 },  // 1
    { x: 12, y: 74 },  // 2
    { x: 18, y: 66 },  // 3
    { x: 14, y: 58 },  // 4
    { x: 20, y: 50 },  // 5
    { x: 16, y: 42 },  // 6
    { x: 22, y: 34 },  // 7 - star
    { x: 28, y: 28 },  // 8
    { x: 35, y: 24 },  // 9
    { x: 42, y: 22 },  // 10
    { x: 49, y: 24 },  // 11
    { x: 55, y: 28 },  // 12
    { x: 60, y: 34 },  // 13 - star
    { x: 64, y: 42 },  // 14
    { x: 60, y: 50 },  // 15
    { x: 55, y: 56 },  // 16
    { x: 48, y: 60 },  // 17
    { x: 42, y: 56 },  // 18
    { x: 36, y: 50 },  // 19
    { x: 32, y: 42 },  // 20 - star
    { x: 38, y: 36 },  // 21
    { x: 45, y: 34 },  // 22
    { x: 52, y: 38 },  // 23
    { x: 56, y: 46 },  // 24
    { x: 52, y: 54 },  // 25 - star
    { x: 46, y: 62 },  // 26
    { x: 52, y: 70 },  // 27
    { x: 58, y: 76 },  // 28
    { x: 66, y: 72 },  // 29
    { x: 72, y: 64 },  // 30 - star
    { x: 78, y: 56 },  // 31
    { x: 82, y: 48 },  // 32
    { x: 78, y: 40 },  // 33
    { x: 72, y: 34 },  // 34
    { x: 78, y: 26 },  // 35
    { x: 84, y: 20 },  // 36 - star
    { x: 88, y: 28 },  // 37
    { x: 86, y: 36 },  // 38
    { x: 90, y: 44 },  // 39
    { x: 92, y: 52 },  // 40 - END
  ];

  // Use the predefined path or generate more if needed
  for (let i = 0; i < count; i++) {
    if (i < path.length) {
      positions.push(path[i]);
    } else {
      // Fallback for any extra spaces
      positions.push({ x: 50 + (i % 10) * 5, y: 50 + Math.floor(i / 10) * 10 });
    }
  }

  return positions;
}

// Find the previous star space from a given position
export function findPreviousStar(spaces: BoardSpace[], currentPosition: number): number {
  for (let i = currentPosition - 1; i >= 0; i--) {
    if (spaces[i].type === 'star') {
      return i;
    }
  }
  // If no previous star, return to start
  return 0;
}

// Get all star positions for quick lookup
export function getStarPositions(spaces: BoardSpace[]): number[] {
  return spaces.filter(s => s.type === 'star').map(s => s.id);
}
