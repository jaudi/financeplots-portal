import { describe, expect, it } from "vitest";
import { parseCsv, parseNumber, readRows, templateRows, type SheetField } from "@/lib/spreadsheet-io";

const MONTHS = ["Jan", "Feb", "Mar"];
const FIELDS: SheetField[] = [
  { key: "company", kind: "text", label: { en: "Company name", es: "Nombre de la empresa" } },
  { key: "tax", kind: "number", unit: "%", label: { en: "Tax rate", es: "Tipo impositivo" } },
  { key: "revenue", kind: "series", periods: MONTHS, label: { en: "Revenue", es: "Ingresos" } },
];

describe("parseNumber", () => {
  it.each([
    [1234.5, 1234.5],
    ["1,234.5", 1234.5],
    ["1.234,5", 1234.5],
    ["12,5", 12.5],
    ["1,234", 1234],
    ["1.234.567", 1234567],
    ["0.500", 0.5],
    ["25%", 25],
    ["£40,000", 40000],
    ["40 000 €", 40000],
    ["(1,200)", -1200],
    ["-3.5", -3.5],
  ])("%s → %s", (input, expected) => {
    expect(parseNumber(input)).toBe(expected);
  });

  it.each(["", "abc", "12a", null, true])("%s is not a number", (input) => {
    expect(parseNumber(input as never)).toBeNull();
  });
});

describe("parseCsv", () => {
  it("reads Spanish Excel's semicolons and decimal commas", () => {
    expect(parseCsv("Ingresos;1.000,5;2000\r\nTipo impositivo;25\r\n")).toEqual([
      ["Ingresos", "1.000,5", "2000"],
      ["Tipo impositivo", "25"],
    ]);
  });

  it("keeps quoted commas inside a field", () => {
    expect(parseCsv('Company name,"Acme, Ltd"\nRevenue,1,2,3')).toEqual([
      ["Company name", "Acme, Ltd"],
      ["Revenue", "1", "2", "3"],
    ]);
  });
});

describe("readRows", () => {
  it("matches labels in either language, in any order, ignoring other rows", () => {
    const result = readRows(
      [["Notes about this file"], ["ingresos", 10, 20, 30, 999], ["Company Name", "Acme"], ["TIPO IMPOSITIVO", "25%"]],
      FIELDS,
    );
    expect(result.values).toEqual({ revenue: [10, 20, 30], company: "Acme", tax: 25 });
    expect(result.missing).toEqual([]);
    expect(result.problems).toEqual([]);
  });

  it("reports a short series and an unreadable number instead of guessing", () => {
    const result = readRows([["Revenue", 10, "", 30], ["Tax rate", "n/a"]], FIELDS);
    expect(result.values).toEqual({});
    expect(result.problems.map((p) => p.key)).toEqual(["revenue", "tax"]);
    expect(result.missing).toEqual(["company"]);
  });

  it("round-trips its own template", () => {
    const values = { company: "Acme", tax: 25, revenue: [1, 2, 3] };
    for (const lang of ["en", "es"] as const) {
      expect(readRows(templateRows("Budget", FIELDS, values, lang), FIELDS).values).toEqual(values);
    }
  });
});
