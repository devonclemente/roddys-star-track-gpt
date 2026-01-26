import { describe, it, expect } from "vitest";
import {
  createInitialChains,
  shuffleArray,
  CHAIN_DISTRIBUTION,
} from "@/types/game";

describe("chain pool initialization", () => {
  it("creates exactly 44 chains total", () => {
    const chains = createInitialChains();

    expect(chains).toHaveLength(44);
  });

  it("includes correct count for each chain length", () => {
    const chains = createInitialChains();
    const countByLength = new Map<number, number>();

    for (const chain of chains) {
      countByLength.set(chain.length, (countByLength.get(chain.length) ?? 0) + 1);
    }

    expect(countByLength.get(9)).toBe(2);
    expect(countByLength.get(8)).toBe(3);
    expect(countByLength.get(7)).toBe(4);
    expect(countByLength.get(6)).toBe(5);
    expect(countByLength.get(5)).toBe(6);
    expect(countByLength.get(4)).toBe(7);
    expect(countByLength.get(3)).toBe(8);
    expect(countByLength.get(2)).toBe(9);
  });

  it("assigns a unique ID to each chain", () => {
    const chains = createInitialChains();
    const ids = chains.map((c) => c.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(chains.length);
  });
});

describe("chain distribution constant", () => {
  it("defines chain lengths from 2 to 9", () => {
    const lengths = CHAIN_DISTRIBUTION.map((d) => d.length);

    expect(lengths).toContain(2);
    expect(lengths).toContain(9);
    expect(Math.min(...lengths)).toBe(2);
    expect(Math.max(...lengths)).toBe(9);
  });

  it("totals 44 chains across all lengths", () => {
    const total = CHAIN_DISTRIBUTION.reduce((sum, d) => sum + d.count, 0);

    expect(total).toBe(44);
  });
});

describe("shuffle array", () => {
  it("preserves all elements without loss", () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const shuffled = shuffleArray(original);

    expect(shuffled).toHaveLength(original.length);
    expect(shuffled.sort((a, b) => a - b)).toEqual(original);
  });

  it("does not modify the original array", () => {
    const original = [1, 2, 3, 4, 5];
    const originalCopy = [...original];

    shuffleArray(original);

    expect(original).toEqual(originalCopy);
  });

  it("returns a new array instance", () => {
    const original = [1, 2, 3];

    const shuffled = shuffleArray(original);

    expect(shuffled).not.toBe(original);
  });
});
