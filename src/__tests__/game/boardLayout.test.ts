import { describe, it, expect } from "vitest";
import {
  createBoardSpaces,
  findPreviousStar,
  getStarPositions,
} from "@/lib/boardLayout";

describe("board generation", () => {
  it("creates exactly 41 spaces", () => {
    const spaces = createBoardSpaces();

    expect(spaces).toHaveLength(41);
  });

  it("starts with a start space at position 0", () => {
    const spaces = createBoardSpaces();
    const firstSpace = spaces.at(0);

    expect(firstSpace?.id).toBe(0);
    expect(firstSpace?.type).toBe("start");
  });

  it("ends with an end space at position 40", () => {
    const spaces = createBoardSpaces();
    const lastSpace = spaces.at(-1);

    expect(lastSpace?.id).toBe(40);
    expect(lastSpace?.type).toBe("end");
  });

  it("contains exactly 6 star spaces", () => {
    const spaces = createBoardSpaces();
    const starSpaces = spaces.filter((s) => s.type === "star");

    expect(starSpaces).toHaveLength(6);
  });

  it("places star spaces at positions 7, 13, 20, 25, 30, and 36", () => {
    const spaces = createBoardSpaces();
    const starPositions = spaces
      .filter((s) => s.type === "star")
      .map((s) => s.id);

    expect(starPositions).toEqual([7, 13, 20, 25, 30, 36]);
  });

  it("assigns coordinates to every space", () => {
    const spaces = createBoardSpaces();

    for (const space of spaces) {
      expect(typeof space.x).toBe("number");
      expect(typeof space.y).toBe("number");
    }
  });
});

describe("finding previous star", () => {
  it("returns the nearest star before the current position", () => {
    const spaces = createBoardSpaces();

    // From position 13 (second star), previous star is at 7
    expect(findPreviousStar(spaces, 13)).toBe(7);

    // From position 20 (third star), previous star is at 13
    expect(findPreviousStar(spaces, 20)).toBe(13);

    // From position 30, previous star is at 25
    expect(findPreviousStar(spaces, 30)).toBe(25);
  });

  it("returns start (0) when no previous star exists", () => {
    const spaces = createBoardSpaces();

    // Position 7 is the first star, no star before it
    expect(findPreviousStar(spaces, 7)).toBe(0);

    // Position 5 is before any star
    expect(findPreviousStar(spaces, 5)).toBe(0);
  });

  it("returns start (0) when called from position 0", () => {
    const spaces = createBoardSpaces();

    expect(findPreviousStar(spaces, 0)).toBe(0);
  });

  it("finds previous star from non-star positions", () => {
    const spaces = createBoardSpaces();

    // Position 15 is between stars at 13 and 20
    expect(findPreviousStar(spaces, 15)).toBe(13);

    // Position 38 is after star at 36
    expect(findPreviousStar(spaces, 38)).toBe(36);
  });
});

describe("getting star positions", () => {
  it("returns all 6 star positions", () => {
    const spaces = createBoardSpaces();

    const starPositions = getStarPositions(spaces);

    expect(starPositions).toHaveLength(6);
    expect(starPositions).toEqual([7, 13, 20, 25, 30, 36]);
  });

  it("returns positions in ascending order", () => {
    const spaces = createBoardSpaces();

    const starPositions = getStarPositions(spaces);

    const sorted = [...starPositions].sort((a, b) => a - b);
    expect(starPositions).toEqual(sorted);
  });
});
