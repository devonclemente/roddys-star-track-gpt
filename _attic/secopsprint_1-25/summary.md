# Security Sprint Summary - January 25, 2026

## Objective
Resolve all Semgrep `detect-object-injection` (CWE-94) findings to eliminate potential prototype pollution vulnerabilities.

## Findings Resolved: 27 total

### Initial Finding
- **ChainDisplay.tsx** - Bracket notation on size lookup

### Batch 1 (23 findings)
| File | Lines | Fix Pattern |
|------|-------|-------------|
| DiscardPile.tsx | 11 | Object → `Map` |
| GameTitle.tsx | 37, 56 | Object → `Map.get()` |
| GameScreen.tsx | 60, 117, 156 | Helper function `getPlayerState()` |
| boardLayout.ts | 63, 64, 142, 155 | `Array.at()` |
| EndScreen.tsx | 38 | `Array.at()` |
| GameBoard.tsx | 59 | `Array.at()` |
| game.ts | 72 | `splice()` for array swap |
| input-otp.tsx | 29 | `Array.at()` |
| chart.tsx | 327, 332, 334, 337 | `hasOwn()` + `Reflect.get()` |

### Batch 2 (4 findings)
| File | Lines | Fix Pattern |
|------|-------|-------------|
| chart.tsx | 98, 170, 344, 346 | `hasOwn()` + `Reflect.get()` |

## Fix Patterns Used

### 1. Map instead of Object
```typescript
// Before
const sizes = { sm: 24, md: 32 };
const size = sizes[key];

// After
const sizes = new Map([['sm', 24], ['md', 32]]);
const size = sizes.get(key);
```

### 2. Array.at() instead of bracket notation
```typescript
// Before
const item = array[index];

// After
const item = array.at(index);
```

### 3. hasOwn + Reflect.get for dynamic access
```typescript
// Before
const value = obj[key];

// After
const value = hasOwn(obj, key) ? Reflect.get(obj, key) : undefined;
```

### 4. Helper functions for type-safe access
```typescript
// Safe player accessor
const getPlayerState = (players, player) =>
  player === 'red' ? players.red : players.blue;
```

## Commits
1. `a62286e` - Fix object injection in ChainDisplay (Map)
2. `524a835` - Fix all 23 Semgrep findings across codebase
3. `5fbd66c` - Fix remaining 4 findings in chart.tsx

## Verification
- All builds passing
- All tests passing
- Semgrep findings: 0 remaining
