import { describe, expect, it } from "vitest";
import {
  SP500, AHEAD_MONTHS, EVENTS, MIN_SHOW_MONTHS, ROUNDS, eventsIn, makeGame, monthAt, monthIndex, rankKey, upShare,
} from "@/lib/bull-or-bear";

// A small seeded generator so a game is reproducible.
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

describe("Bull or Bear data", () => {
  it("has one close per month from December 1927", () => {
    expect(SP500.start).toBe("1927-12");
    expect(SP500.closes.length).toBeGreaterThan(1180);
    expect(SP500.closes.every((c) => Number.isFinite(c) && c > 0)).toBe(true);
  });

  it("reads months both ways", () => {
    expect(monthIndex("1927-12")).toBe(0);
    expect(monthIndex("1929-10")).toBe(22);
    expect(monthAt(22)).toBe("1929-10");
    expect(monthAt(monthIndex("2008-09"))).toBe("2008-09");
  });

  it("knows the 1929 crash and 2008 as falls", () => {
    const i = monthIndex("1929-08");
    expect(SP500.closes[i + 12] / SP500.closes[i]).toBeLessThan(0.8);
    const j = monthIndex("2008-05");
    expect(SP500.closes[j + 12] / SP500.closes[j]).toBeLessThan(0.7);
  });

  it("every event is inside the data", () => {
    for (const e of EVENTS) {
      const i = monthIndex(e.month);
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(SP500.closes.length);
    }
  });
});

describe("makeGame", () => {
  for (const seed of [1, 7, 42, 2026]) {
    it(`builds ${ROUNDS} valid, spaced rounds (seed ${seed})`, () => {
      const game = makeGame(SP500.closes, seeded(seed));
      expect(game).toHaveLength(ROUNDS);
      for (const r of game) {
        expect(r.to).toBe(r.guess + AHEAD_MONTHS);
        expect(r.to).toBeLessThan(SP500.closes.length);
        expect(r.guess - r.from + 1).toBeGreaterThanOrEqual(MIN_SHOW_MONTHS);
        expect(r.up).toBe(SP500.closes[r.to] >= SP500.closes[r.guess]);
        if (r.event) {
          const e = monthIndex(r.event.month);
          expect(e).toBeGreaterThan(r.guess);
          expect(e).toBeLessThanOrEqual(r.to);
          expect(eventsIn(r)).toContain(r.event);
        }
      }
      const guesses = game.map((r) => r.guess).sort((a, b) => a - b);
      for (let i = 1; i < guesses.length; i++) expect(guesses[i] - guesses[i - 1]).toBeGreaterThanOrEqual(24);
      expect(game.filter((r) => r.event).length).toBe(Math.ceil(ROUNDS / 2));
    });
  }
});

describe("scoring", () => {
  it("the index was higher a year later after most months", () => {
    const share = upShare();
    expect(share).toBeGreaterThan(0.6);
    expect(share).toBeLessThan(0.8);
  });

  it("titles a score", () => {
    expect(rankKey(10)).toBe("wizard");
    expect(rankKey(7)).toBe("sharp");
    expect(rankKey(5)).toBe("coin");
    expect(rankKey(2)).toBe("contrarian");
  });
});
