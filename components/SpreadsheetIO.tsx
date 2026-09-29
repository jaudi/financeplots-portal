"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { parseCsv, readRows, templateRows, type Cell, type ImportResult, type Lang, type SheetField, type SheetValues } from "@/lib/spreadsheet-io";

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * "Download Excel template" + "Import Excel / CSV" for a tool's inputs
 * (lib/spreadsheet-io.ts). The file never leaves the browser.
 */
export default function SpreadsheetIO({
  title,
  fileName,
  fields,
  getValues,
  onImport,
}: {
  title: string;
  fileName: string;
  fields: SheetField[];
  getValues: () => SheetValues;
  /** Receives only the fields the file had; returns an optional note shown to the visitor. */
  onImport: (values: SheetValues) => string | void;
}) {
  const t = useTranslations("toolCommon");
  const lang: Lang = useLocale() === "es" ? "es" : "en";
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "warn" | "error"; lines: string[] } | null>(null);

  const labelOf = (key: string) => fields.find((f) => f.key === key)?.label[lang] ?? key;

  async function download() {
    setBusy(true);
    try {
      const { default: writeXlsxFile } = await import("write-excel-file/browser");
      const rows = templateRows(title, fields, getValues(), lang).map((row, i) =>
        row.map((value) => ({ value: value ?? undefined, fontWeight: i === 0 ? ("bold" as const) : undefined })),
      );
      await writeXlsxFile(rows, { columns: [{ width: 34 }, ...Array(13).fill({ width: 12 })] }).toFile(`${fileName}.xlsx`);
    } finally {
      setBusy(false);
    }
  }

  async function importFile(file: File) {
    setMessage(null);
    if (file.size > MAX_BYTES) {
      setMessage({ tone: "error", lines: [t("sheetTooBig")] });
      return;
    }
    setBusy(true);
    try {
      let rows: Cell[][];
      if (/\.csv$|\.txt$/i.test(file.name)) {
        rows = parseCsv(await file.text());
      } else if (/\.xlsx$/i.test(file.name)) {
        const { readSheet } = await import("read-excel-file/browser");
        rows = (await readSheet(file)) as Cell[][];
      } else {
        setMessage({ tone: "error", lines: [t("sheetWrongType")] });
        return;
      }
      const result: ImportResult = readRows(rows, fields);
      const found = Object.keys(result.values).length;
      if (found === 0) {
        setMessage({ tone: "error", lines: [t("sheetNothingFound")] });
        return;
      }
      const note = onImport(result.values);
      const lines = [t("sheetImported", { count: found })];
      if (note) lines.push(note);
      for (const p of result.problems) lines.push(`${labelOf(p.key)}: ${p.message[lang]}`);
      if (result.missing.length > 5) lines.push(t("sheetKeptCount", { count: result.missing.length }));
      else if (result.missing.length) lines.push(t("sheetKept", { fields: result.missing.map(labelOf).join(", ") }));
      setMessage({ tone: result.problems.length ? "warn" : "ok", lines });
    } catch {
      setMessage({ tone: "error", lines: [t("sheetUnreadable")] });
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  const tone = message?.tone === "ok" ? "text-green-300" : message?.tone === "warn" ? "text-amber-300" : "text-red-300";

  return (
    <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">{t("sheetTitle")}</h3>
      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{t("sheetHelp")}</p>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold px-3 py-2 rounded-lg transition"
        >
          {t("sheetImport")}
        </button>
        <button
          type="button"
          onClick={download}
          disabled={busy}
          className="w-full bg-white/5 hover:bg-white/10 border border-gray-700 disabled:opacity-50 text-gray-200 text-sm px-3 py-2 rounded-lg transition"
        >
          {t("sheetTemplate")}
        </button>
        <input
          ref={input}
          type="file"
          accept=".xlsx,.csv,.txt,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          aria-label={t("sheetImport")}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void importFile(file);
          }}
        />
      </div>
      {message && (
        <ul className={`mt-3 space-y-1 text-xs leading-relaxed ${tone}`} role="status">
          {message.lines.map((line) => <li key={line}>{line}</li>)}
        </ul>
      )}
      <p className="mt-3 text-[11px] text-gray-600">{t("sheetPrivacy")}</p>
    </div>
  );
}
