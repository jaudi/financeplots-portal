import { describe, expect, it } from "vitest";
import {
  ACCOUNTS, STORY, STORY_ACCOUNTS, isBalanced, isRightAnswer, lineIncreases, normalSide,
  parseAmount, statements, storyEntries, trialBalance, type Entry,
} from "@/lib/bookkeeping";

describe("chart of accounts", () => {
  it("has unique codes and both languages", () => {
    expect(new Set(ACCOUNTS.map((a) => a.code)).size).toBe(ACCOUNTS.length);
    for (const a of ACCOUNTS) {
      expect(a.name.en).toBeTruthy();
      expect(a.name.es).toBeTruthy();
    }
  });

  it("knows which side makes each account grow", () => {
    expect(normalSide("1000")).toBe("debit"); // asset
    expect(normalSide("6000")).toBe("debit"); // expense
    expect(normalSide("2000")).toBe("credit"); // liability
    expect(normalSide("3000")).toBe("credit"); // capital
    expect(normalSide("4000")).toBe("credit"); // income
    expect(normalSide("1510")).toBe("credit"); // contra asset
    expect(normalSide("3100")).toBe("debit"); // drawings
  });
});

describe("entries", () => {
  it("accepts only balanced, one-sided lines", () => {
    expect(isBalanced([{ account: "1000", debit: 500, credit: 0 }, { account: "4000", debit: 0, credit: 500 }])).toBe(true);
    expect(isBalanced([{ account: "1000", debit: 500, credit: 0 }, { account: "4000", debit: 0, credit: 400 }])).toBe(false);
    expect(isBalanced([{ account: "1000", debit: 500, credit: 500 }, { account: "4000", debit: 0, credit: 0 }])).toBe(false);
    expect(isBalanced([{ account: "9999", debit: 500, credit: 0 }, { account: "4000", debit: 0, credit: 500 }])).toBe(false);
    expect(isBalanced([{ account: "1000", debit: 500, credit: 0 }])).toBe(false);
    expect(isBalanced([{ account: "1000", debit: 0, credit: 0 }, { account: "4000", debit: 0, credit: 0 }])).toBe(false);
  });

  it("says whether a line raises or lowers its account", () => {
    expect(lineIncreases({ account: "1000", debit: 1, credit: 0 })).toBe(true);
    expect(lineIncreases({ account: "1000", debit: 0, credit: 1 })).toBe(false);
    expect(lineIncreases({ account: "2100", debit: 0, credit: 1 })).toBe(true);
    expect(lineIncreases({ account: "1510", debit: 0, credit: 1 })).toBe(true);
  });

  it("parses typed amounts into pence", () => {
    expect(parseAmount("1,250.50")).toBe(125050);
    expect(parseAmount("£300")).toBe(30000);
    expect(parseAmount("")).toBe(0);
    expect(parseAmount("12.345")).toBeNaN();
    expect(parseAmount("-5")).toBeNaN();
  });
});

describe("the coffee-cart story", () => {
  it("uses only story accounts, and every step balances", () => {
    const story = new Set(STORY_ACCOUNTS.map((a) => a.code));
    STORY.forEach((s) => {
      expect(isBalanced(s.lines)).toBe(true);
      for (const l of s.lines) expect(story.has(l.account)).toBe(true);
      for (const k of ["title", "text", "why"] as const) {
        expect(s[k].en).toBeTruthy();
        expect(s[k].es).toBeTruthy();
      }
    });
  });

  it("ends with £600 profit, £5,000 cash and £700 VAT owed", () => {
    const entries = storyEntries(STORY.length);
    const st = statements(entries);
    expect(st.revenue).toBe(350000);
    expect(st.grossProfit).toBe(260000);
    expect(st.profit).toBe(60000);
    expect(st.assets.find((r) => r.code === "1000")?.amount).toBe(500000);
    expect(st.liabilities.find((r) => r.code === "2100")?.amount).toBe(70000);
    expect(st.assets.find((r) => r.code === "1510")?.amount).toBe(-10000);
    expect(st.totalAssets).toBe(1030000);
    expect(st.totalLiabilities + st.totalEquity).toBe(st.totalAssets);
  });

  it("balances after every single step", () => {
    for (let n = 0; n <= STORY.length; n++) {
      const st = statements(storyEntries(n));
      expect(st.totalAssets).toBe(st.totalLiabilities + st.totalEquity);
      const tb = trialBalance(storyEntries(n));
      expect(tb.debit).toBe(tb.credit);
    }
  });

  it("marks quiz answers on the right side", () => {
    const sales = STORY[3];
    expect(isRightAnswer(sales, "debit", "1000")).toBe(true);
    expect(isRightAnswer(sales, "credit", "4000")).toBe(true);
    expect(isRightAnswer(sales, "credit", "2100")).toBe(true);
    expect(isRightAnswer(sales, "debit", "4000")).toBe(false);
  });
});

describe("free entries on top of the story", () => {
  it("keep the balance sheet balanced", () => {
    const extra: Entry = {
      id: "x1", memo: "Loan",
      lines: [{ account: "1000", debit: 200000, credit: 0 }, { account: "2500", debit: 0, credit: 200000 }],
    };
    const st = statements([...storyEntries(STORY.length), extra]);
    expect(st.totalAssets).toBe(1230000);
    expect(st.totalAssets).toBe(st.totalLiabilities + st.totalEquity);
  });
});
