import { describe, expect, it } from "vitest";
import { matchOption, roundForUnit } from "@/lib/guided-chat";
import { parseAmount } from "@/lib/planner";
import en from "@/messages/en.json";
import es from "@/messages/es.json";

const opt = (label: string, words: string[] = []) => ({ label, words, apply: () => {} });

describe("guided chat", () => {
  it("picks the one option an answer names, in either language", () => {
    const options = [opt("£", ["pounds", "libras"]), opt("€", ["euros"])];
    expect(matchOption(options, "In pounds please")?.label).toBe("£");
    expect(matchOption(options, "Libras")?.label).toBe("£");
    expect(matchOption(options, "€")?.label).toBe("€");
    expect(matchOption(options, "pounds or euros")).toBeNull();
    expect(matchOption(options, "dollars")).toBeNull();
  });

  it.each([
    ["25%", 25], ["2,5 %", 2.5], ["2.5", 2.5], ["8x", 8], ["1.5×", 1.5], ["45 days", 45], ["45 días", 45],
  ])("reads %s as %s", (input, expected) => {
    expect(parseAmount(input)).toBe(expected);
  });

  it("keeps decimals only for percentages and multiples", () => {
    expect(roundForUnit("percent", 2.456)).toBe(2.46);
    expect(roundForUnit("multiple", 1.5)).toBe(1.5);
    expect(roundForUnit("money", 1234.6)).toBe(1235);
    expect(roundForUnit("days", 44.5)).toBe(45);
    expect(roundForUnit("number", 7.4)).toBe(7);
  });

  it("has the same chat copy in English and Spanish", () => {
    expect(Object.keys(es.guidedChat).sort()).toEqual(Object.keys(en.guidedChat).sort());
    expect(Object.keys(es.companyPlanner.chatAsk).sort()).toEqual(Object.keys(en.companyPlanner.chatAsk).sort());
  });
});
