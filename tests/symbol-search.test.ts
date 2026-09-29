import { describe, expect, it } from "vitest";
import { rankMatches, type SymbolMatch } from "@/lib/symbol-search";

const m = (symbol: string, name: string, local = false): SymbolMatch => ({ symbol, name, exchange: "", local });

describe("rankMatches", () => {
  it("orders by match quality, then our own lists, then alphabetically — never by the source's order", () => {
    const input = [
      m("ZZZ", "Something with santander inside"),
      m("SAN", "Banco Santander, S.A."),
      m("BNC.L", "Banco Santander, S.A."),
      m("SAN.MC", "Banco Santander S.A.", true),
      m("XYZ", "Unrelated Ltd"),
    ];
    expect(rankMatches(input, "santander").map((x) => x.symbol)).toEqual(["SAN.MC", "BNC.L", "SAN", "ZZZ", "XYZ"]);
  });

  it("puts an exact ticker first, with or without the exchange suffix", () => {
    const input = [m("AAPD", "Direxion Daily AAPL Bear"), m("AAPL.TO", "Apple Inc."), m("AAPL", "Apple Inc.", true)];
    expect(rankMatches(input, "aapl")[0].symbol).toBe("AAPL");
    expect(rankMatches([m("ITXN.MX", "Inditex"), m("ITX.MC", "Industria de Diseño Textil", true)], "itx")[0].symbol).toBe("ITX.MC");
  });

  it("matches brand names given as `also`, and ignores accents", () => {
    const input = [m("ITX.MC", "Industria de Diseño Textil, S.A.", true), m("OTHER", "Other plc")];
    input[0].also = "Inditex Zara";
    expect(rankMatches(input, "zara")[0].symbol).toBe("ITX.MC");
    expect(rankMatches(input, "diseno")[0].symbol).toBe("ITX.MC");
  });
});
