// Spreadsheet round-trip for the planning tools: a tool describes its inputs
// as a list of fields, the visitor downloads them as an .xlsx template (filled
// with the values on screen), edits it in Excel, and imports it back — or
// imports a CSV/.xlsx of their own laid out the same way.
//
// Layout, one field per row: the label in column A, the value in column B, or
// for a series (12 months, 13 weeks) one value per column from B onwards.
// Rows are matched by label in either language, so the order doesn't matter
// and extra rows (notes, totals) are ignored. Everything runs in the browser.

export type Lang = "en" | "es";

export type SheetField =
  | { key: string; label: Record<Lang, string>; kind: "number"; unit?: string }
  | { key: string; label: Record<Lang, string>; kind: "text" }
  | { key: string; label: Record<Lang, string>; kind: "series"; periods: string[] };

export type SheetValue = number | string | number[];
export type SheetValues = Record<string, SheetValue>;
export type Cell = string | number | boolean | Date | null | undefined;

export interface ImportResult {
  values: SheetValues;
  /** Fields the file had no row for. */
  missing: string[];
  /** Rows that were found but couldn't be read. */
  problems: { key: string; message: Record<Lang, string> }[];
}

const normalise = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

/**
 * Reads a number the way people type them in either locale: "1,234.5",
 * "1.234,5", "12,5", "25%", "£40,000", "(1,200)" for a negative. A single
 * separator followed by exactly three digits is read as thousands.
 */
export function parseNumber(cell: Cell): number | null {
  if (typeof cell === "number") return Number.isFinite(cell) ? cell : null;
  if (typeof cell !== "string") return null;
  let s = cell.trim();
  if (!s) return null;
  let negative = false;
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1);
  }
  s = s.replace(/[\s £$€%]/g, "").replace(/^(eur|gbp|usd)|(eur|gbp|usd)$/gi, "");
  if (s.startsWith("-")) {
    negative = !negative;
    s = s.slice(1);
  }
  if (!/^[\d.,]+$/.test(s) || !/\d/.test(s)) return null;

  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  if (lastComma !== -1 && lastDot !== -1) {
    // Both present: whichever comes last is the decimal separator.
    const decimal = lastComma > lastDot ? "," : ".";
    const thousands = decimal === "," ? "." : ",";
    s = s.split(thousands).join("").replace(decimal, ".");
  } else if (lastComma !== -1 || lastDot !== -1) {
    const sep = lastComma !== -1 ? "," : ".";
    const parts = s.split(sep);
    const thousandsGrouping = parts.length > 2 || (parts[1].length === 3 && parts[0] !== "0");
    s = thousandsGrouping ? parts.join("") : parts.join(".");
  }
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return negative ? -n : n;
}

/** Splits CSV text into rows, guessing the delimiter (";" from Spanish Excel, ",", or tab). */
export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^﻿/, "");
  const sample = clean.split(/\r?\n/).slice(0, 10).join("\n").replace(/"[^"]*"/g, "");
  const counts = [";", ",", "\t"].map((d) => [d, sample.split(d).length - 1] as const);
  const delimiter = counts.sort((a, b) => b[1] - a[1])[0][1] > 0 ? counts[0][0] : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (quoted) {
      if (c === '"' && clean[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === delimiter) { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && clean[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const isBlank = (c: Cell) => c === null || c === undefined || (typeof c === "string" && c.trim() === "");

/** Matches the file's rows to the fields and reads their values. */
export function readRows(rows: Cell[][], fields: SheetField[]): ImportResult {
  const byLabel = new Map<string, SheetField>();
  for (const f of fields) {
    for (const name of [f.key, f.label.en, f.label.es]) byLabel.set(normalise(name), f);
  }

  const values: SheetValues = {};
  const problems: ImportResult["problems"] = [];
  for (const row of rows) {
    const label = row[0];
    if (typeof label !== "string") continue;
    const field = byLabel.get(normalise(label));
    if (!field || field.key in values || problems.some((p) => p.key === field.key)) continue;
    const rest = row.slice(1);

    if (field.kind === "text") {
      const v = rest.find((c) => !isBlank(c));
      if (v !== undefined) values[field.key] = String(v).trim();
    } else if (field.kind === "number") {
      const first = rest.find((c) => !isBlank(c));
      if (first === undefined) continue;
      const n = parseNumber(first as Cell);
      if (n === null) {
        problems.push({ key: field.key, message: { en: `“${String(first)}” isn't a number`, es: `“${String(first)}” no es un número` } });
      } else values[field.key] = n;
    } else {
      const cells = rest.slice(0, field.periods.length);
      if (cells.every(isBlank)) continue;
      const nums = cells.map((c) => parseNumber(c as Cell));
      const read = nums.filter((n): n is number => n !== null).length;
      if (cells.length < field.periods.length || read < field.periods.length) {
        problems.push({
          key: field.key,
          message: {
            en: `needs ${field.periods.length} numbers in columns B onwards, found ${read}`,
            es: `necesita ${field.periods.length} números a partir de la columna B, hay ${read}`,
          },
        });
      } else values[field.key] = nums as number[];
    }
  }

  const missing = fields
    .filter((f) => !(f.key in values) && !problems.some((p) => p.key === f.key))
    .map((f) => f.key);
  return { values, missing, problems };
}

/** The template: a title, a how-to line, then one row per field. */
export function templateRows(title: string, fields: SheetField[], values: SheetValues, lang: Lang): Cell[][] {
  const scalars = fields.filter((f) => f.kind !== "series");
  const series = fields.filter((f) => f.kind === "series");
  const rows: Cell[][] = [
    [title],
    [lang === "es"
      ? "Cambia los valores y vuelve a importar el archivo. Deja las etiquetas de la columna A como están."
      : "Change the values and import the file back. Keep the labels in column A as they are."],
    [],
  ];
  if (scalars.length) {
    rows.push(lang === "es" ? ["Dato", "Valor", "Unidad"] : ["Input", "Value", "Unit"]);
    for (const f of scalars) {
      rows.push([f.label[lang], values[f.key] as Cell, f.kind === "number" ? f.unit ?? "" : ""]);
    }
    rows.push([]);
  }
  if (series.length) {
    const periods = (series[0] as Extract<SheetField, { kind: "series" }>).periods;
    rows.push([lang === "es" ? "Línea" : "Line", ...periods]);
    for (const f of series) rows.push([f.label[lang], ...((values[f.key] as number[]) ?? [])]);
  }
  return rows;
}
