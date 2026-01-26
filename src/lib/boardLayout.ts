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
    { type: 'numbered', value: 8 }, // 17
    { type: 'normal' },          // 18
    { type: 'numbered', value: 6 }, // 19
    { type: 'star' },            // 20: Third star
    { type: 'normal' },          // 21
    { type: 'numbered', value: 8 }, // 22
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
    const pos = positions.at(index);
    spaces.push({
      id: index,
      type: def.type,
      value: def.value,
      x: pos?.x ?? 0,
      y: pos?.y ?? 0,
    });
  });

  return spaces;
}

function generateSCurvePath(count: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  
  // Non-overlapping serpentine path using wide switchbacks
  // Path flows: left-to-right (row 1), right-to-left (row 2), left-to-right (row 3), etc.
  // This creates a clear, readable winding path with no crossings
  
  const path = [
    // Row 1: Top, going left to right (spaces 0-8)
    { x: 8, y: 12 },   // 0 - START
    { x: 18, y: 14 },  // 1
    { x: 28, y: 12 },  // 2
    { x: 38, y: 14 },  // 3
    { x: 48, y: 12 },  // 4
    { x: 58, y: 14 },  // 5
    { x: 68, y: 12 },  // 6
    { x: 78, y: 14 },  // 7 - star
    { x: 88, y: 16 },  // 8
    
    // Curve down to row 2
    { x: 92, y: 26 },  // 9
    
    // Row 2: Going right to left (spaces 10-17)
    { x: 84, y: 32 },  // 10
    { x: 74, y: 30 },  // 11
    { x: 64, y: 32 },  // 12
    { x: 54, y: 30 },  // 13 - star
    { x: 44, y: 32 },  // 14
    { x: 34, y: 30 },  // 15
    { x: 24, y: 32 },  // 16
    { x: 14, y: 30 },  // 17
    
    // Curve down to row 3
    { x: 8, y: 42 },   // 18
    
    // Row 3: Going left to right (spaces 19-26)
    { x: 16, y: 50 },  // 19
    { x: 26, y: 52 },  // 20 - star
    { x: 36, y: 50 },  // 21
    { x: 46, y: 52 },  // 22
    { x: 56, y: 50 },  // 23
    { x: 66, y: 52 },  // 24
    { x: 76, y: 50 },  // 25 - star
    { x: 86, y: 52 },  // 26
    
    // Curve down to row 4
    { x: 92, y: 62 },  // 27
    
    // Row 4: Going right to left (spaces 28-35)
    { x: 84, y: 68 },  // 28
    { x: 74, y: 66 },  // 29
    { x: 64, y: 68 },  // 30 - star
    { x: 54, y: 66 },  // 31
    { x: 44, y: 68 },  // 32
    { x: 34, y: 66 },  // 33
    { x: 24, y: 68 },  // 34
    
    // Curve down to row 5
    { x: 14, y: 76 },  // 35
    
    // Row 5: Final stretch going right (spaces 36-40)
    { x: 24, y: 84 },  // 36 - star
    { x: 36, y: 86 },  // 37
    { x: 48, y: 88 },  // 38
    { x: 60, y: 86 },  // 39
    { x: 72, y: 88 },  // 40 - END
  ];

  // Use the predefined path or generate more if needed
  for (let i = 0; i < count; i++) {
    const pathPos = path.at(i);
    if (pathPos) {
      positions.push(pathPos);
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
    const space = spaces.at(i);
    if (space?.type === 'star') {
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
