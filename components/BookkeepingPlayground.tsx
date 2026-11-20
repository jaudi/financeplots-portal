"use client";

// Bookkeeping Playground — the screen on /tools/bookkeeping. The engine and the
// coffee-cart story are in lib/bookkeeping.ts. Left: the story (a quiz per
// transaction) or a free journal form. Right: the books, updated live.
//
// Progress is kept in this browser only (localStorage, with an in-memory
// fallback), read through useSyncExternalStore. Nothing is sent anywhere.

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";
import {
  ACCOUNTS, STORY, STORY_ACCOUNTS, account, isBalanced, isRightAnswer, lineIncreases, parseAmount,
  statements, storyEntries, totals, trialBalance, type AccountType, type Entry, type Line,
} from "@/lib/bookkeeping";

// ── Saved state ──────────────────────────────────────────────────────────────

type Mode = "story" | "free";
type Phase = "debit" | "credit" | "revealed";

interface State {
  mode: Mode;
  step: number; // the story step on screen (0-based); STORY.length = finished
  phase: Phase;
  picks: { debit?: string; credit?: string };
  right: number;
  asked: number;
  base: number; // story entries kept under the free entries
  extra: Entry[];
}

const INITIAL: State = { mode: "story", step: 0, phase: "debit", picks: {}, right: 0, asked: 0, base: 0, extra: [] };
const KEY = "financeplots:bookkeeping:v1";

let current: State | null = null;
const listeners = new Set<() => void>();

function load(): State {
  if (current) return current;
  current = INITIAL;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as State;
      const ok =
        (s.mode === "story" || s.mode === "free") &&
        Number.isInteger(s.step) && s.step >= 0 && s.step <= STORY.length &&
        ["debit", "credit", "revealed"].includes(s.phase) &&
        Array.isArray(s.extra) && s.extra.every((e) => e && typeof e.id === "string" && isBalanced(e.lines));
      if (ok) current = { ...INITIAL, ...s, picks: s.picks ?? {} };
    }
  } catch {
    // Blocked or corrupt storage: start fresh.
  }
  return current;
}

function save(next: State) {
  current = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode: kept for this visit only.
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

/** Everything posted so far, in order. */
function posted(s: State): Entry[] {
  if (s.mode === "free") return [...storyEntries(s.base), ...s.extra];
  return storyEntries(Math.min(STORY.length, s.step + (s.phase === "revealed" ? 1 : 0)));
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const TYPES: AccountType[] = ["asset", "liability", "equity", "income", "expense"];
const TYPE_STYLE: Record<AccountType, string> = {
  asset: "text-sky-300 border-sky-500/40 bg-sky-500/10",
  liability: "text-orange-300 border-orange-500/40 bg-orange-500/10",
  equity: "text-violet-300 border-violet-500/40 bg-violet-500/10",
  income: "text-emerald-300 border-emerald-500/40 bg-emerald-500/10",
  expense: "text-rose-300 border-rose-500/40 bg-rose-500/10",
};
const TYPE_KEY = { asset: "typeAsset", liability: "typeLiability", equity: "typeEquity", income: "typeIncome", expense: "typeExpense" } as const;

function useMoney() {
  const locale = useLocale() === "es" ? "es-ES" : "en-GB";
  return useMemo(() => {
    const whole = new Intl.NumberFormat(locale, { style: "currency", currency: "GBP", currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 });
    const exact = new Intl.NumberFormat(locale, { style: "currency", currency: "GBP", currencyDisplay: "narrowSymbol", minimumFractionDigits: 2 });
    return (pence: number) => {
      const f = pence % 100 === 0 ? whole : exact;
      const s = f.format(Math.abs(pence) / 100);
      return pence < 0 ? `(${s})` : s;
    };
  }, [locale]);
}

/** A fresh id for a free entry: one past the highest used so far. */
const nextId = (extra: Entry[]) => `j${extra.reduce((m, e) => Math.max(m, Number(e.id.slice(1)) || 0), 0) + 1}`;

const ref = (e: Entry, i: number) => (e.step ? `#${e.step}` : `J${i + 1}`);

// ── Main ─────────────────────────────────────────────────────────────────────

export default function BookkeepingPlayground() {
  const t = useTranslations("bookkeeping");
  const lang = useLocale() === "es" ? "es" : "en";
  const s = useSyncExternalStore(subscribe, load, () => INITIAL);
  const entries = posted(s);
  const last = entries[entries.length - 1];
  const done = s.mode === "story" && s.step >= STORY.length;

  const name = (code: string) => account(code).name[lang];

  // Enter moves to the next transaction once one is revealed.
  useEffect(() => {
    if (s.mode !== "story" || s.phase !== "revealed" || done) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || (e.target as HTMLElement)?.closest("input,textarea,select,button")) return;
      next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function pick(side: "debit" | "credit", code: string) {
    const step = STORY[s.step];
    const right = isRightAnswer(step, side, code);
    save({
      ...s,
      picks: { ...s.picks, [side]: code },
      phase: side === "debit" ? "credit" : "revealed",
      right: s.right + (right ? 1 : 0),
      asked: s.asked + 1,
    });
  }

  function next() {
    const step = s.step + 1;
    if (step >= STORY.length) trackEvent("bookkeeping_done");
    save({ ...s, step, phase: "debit", picks: {} });
  }

  function restart() {
    save({ ...INITIAL });
  }

  function goFree() {
    save({ ...s, mode: "free", base: posted({ ...s, mode: "story" }).length, extra: s.mode === "free" ? s.extra : [] });
  }

  function goStory() {
    save({ ...s, mode: "story" });
  }

  async function exportExcel() {
    const { default: writeXlsxFile } = await import("write-excel-file/browser");
    const st = statements(entries);
    const tb = trialBalance(entries);
    const p = (n: number) => n / 100;
    const head = (...cells: string[]) => cells.map((value) => ({ value, fontWeight: "bold" as const }));
    const row = (label: string, amount?: number, bold = false) => [
      { value: label, fontWeight: bold ? ("bold" as const) : undefined },
      amount === undefined ? null : { value: p(amount), format: "#,##0.00", fontWeight: bold ? ("bold" as const) : undefined },
    ];
    const journal = [head(t("colRef"), t("memo"), t("colAccount"), t("colDebit"), t("colCredit"))];
    entries.forEach((e, i) => {
      const memo = e.step ? STORY[e.step - 1].title[lang] : e.memo;
      for (const l of e.lines) {
        journal.push([
          { value: ref(e, i - s.base) }, { value: memo }, { value: `${l.account} ${name(l.account)}` },
          l.debit ? { value: p(l.debit), format: "#,##0.00" } : null, l.credit ? { value: p(l.credit), format: "#,##0.00" } : null,
        ] as never);
      }
    });
    const trial = [
      head(t("colAccount"), t("colDebit"), t("colCredit")),
      ...tb.rows.map((r) => [
        { value: `${r.code} ${name(r.code)}` },
        r.debit ? { value: p(r.debit), format: "#,##0.00" } : null,
        r.credit ? { value: p(r.credit), format: "#,##0.00" } : null,
      ]),
      [{ value: t("total"), fontWeight: "bold" as const }, { value: p(tb.debit), format: "#,##0.00", fontWeight: "bold" as const }, { value: p(tb.credit), format: "#,##0.00", fontWeight: "bold" as const }],
    ];
    const pl = [
      ...st.income.map((r) => row(name(r.code), r.amount)),
      row(t("revenue"), st.revenue, true),
      ...st.costOfSales.map((r) => row(name(r.code), -r.amount)),
      row(t("grossProfit"), st.grossProfit, true),
      ...st.overheads.map((r) => row(name(r.code), -r.amount)),
      row(st.profit >= 0 ? t("netProfit") : t("netLoss"), st.profit, true),
    ];
    const bs = [
      [{ value: t("assets"), fontWeight: "bold" as const }, null],
      ...st.assets.map((r) => row(name(r.code), r.amount)),
      row(t("totalAssets"), st.totalAssets, true),
      [{ value: t("liabilities"), fontWeight: "bold" as const }, null],
      ...st.liabilities.map((r) => row(name(r.code), r.amount)),
      [{ value: t("equity"), fontWeight: "bold" as const }, null],
      ...st.equity.map((r) => row(name(r.code), r.amount)),
      row(t("profitLine"), st.profit),
      row(t("totalLE"), st.totalLiabilities + st.totalEquity, true),
    ];
    await writeXlsxFile([
      { data: journal as never, sheet: t("tabJ"), columns: [{ width: 6 }, { width: 36 }, { width: 34 }, { width: 12 }, { width: 12 }] },
      { data: trial as never, sheet: t("tabTB"), columns: [{ width: 34 }, { width: 12 }, { width: 12 }] },
      { data: pl as never, sheet: t("tabPL"), columns: [{ width: 34 }, { width: 14 }] },
      { data: bs as never, sheet: t("tabBS"), columns: [{ width: 34 }, { width: 14 }] },
    ]).toFile("financeplots-bookkeeping.xlsx");
    trackEvent("export", { format: "xlsx" });
  }

  return (
    <div>
      {/* Mode switch and actions */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="inline-flex rounded-xl border border-gray-700 bg-[#0d1426] p-1">
          {(["story", "free"] as const).map((m) => (
            <button
              key={m}
              onClick={m === "story" ? goStory : goFree}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${s.mode === m ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              {m === "story" ? t("storyTab") : t("freeTab")}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={exportExcel} disabled={entries.length === 0} className="px-3 py-2 rounded-lg text-sm border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 disabled:opacity-40 transition">
            {t("excel")}
          </button>
          <button onClick={restart} className="px-3 py-2 rounded-lg text-sm border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition">
            {t("startOver")}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-6 items-start">
        <div className="min-w-0">
          {s.mode === "free" ? (
            <FreeEntry
              onPost={(e) => save({ ...s, extra: [...s.extra, { ...e, id: nextId(s.extra) }] })}
              onBlank={() => save({ ...s, base: 0, extra: [] })}
            />
          ) : done ? (
            <Finished
              right={s.right}
              asked={s.asked}
              onFree={goFree}
              onAgain={restart}
            />
          ) : (
            <StoryStep s={s} onPick={pick} onSkip={() => save({ ...s, phase: "revealed" })} onNext={next} />
          )}
        </div>

        <Books entries={entries} last={last} base={s.mode === "free" ? s.base : entries.length} onRemove={
          s.mode === "free" ? (id) => save({ ...s, extra: s.extra.filter((e) => e.id !== id) }) : undefined
        } />
      </div>

      {s.mode === "story" && !done && s.step === 0 && s.phase === "debit" && (
        <p className="mt-4 text-xs text-gray-500">{t("private")}</p>
      )}
    </div>
  );
}

// ── Story ────────────────────────────────────────────────────────────────────

function StoryStep({ s, onPick, onSkip, onNext }: {
  s: State;
  onPick: (side: "debit" | "credit", code: string) => void;
  onSkip: () => void;
  onNext: () => void;
}) {
  const t = useTranslations("bookkeeping");
  const lang = useLocale() === "es" ? "es" : "en";
  const money = useMoney();
  const step = STORY[s.step];
  const side = s.phase === "revealed" ? null : s.phase;
  const name = (code: string) => account(code).name[lang];
  const last = s.step === STORY.length - 1;

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
        <span>{t("progress", { n: s.step + 1, total: STORY.length })}</span>
        {s.asked > 0 && <span className="text-emerald-300">{t("score", { right: s.right, asked: s.asked })}</span>}
      </div>
      <div className="h-1.5 rounded-full bg-gray-800 mb-5 overflow-hidden">
        <div className="h-full bg-blue-500 transition-all" style={{ width: `${((s.step + (s.phase === "revealed" ? 1 : 0)) / STORY.length) * 100}%` }} />
      </div>

      <div className="rounded-2xl border border-gray-700 bg-[#0d1426] p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-300 mb-2">☕ {t("cart")}</p>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{step.title[lang]}</h2>
        <p className="text-gray-300 leading-relaxed">{step.text[lang]}</p>

        {side && (
          <div className="mt-5">
            <p className="font-semibold text-white mb-1">{side === "debit" ? t("askDebit") : t("askCredit")}</p>
            <p className="text-xs text-gray-500 mb-3">{t("hint")}</p>
            {s.picks.debit && (
              <Verdict ok={isRightAnswer(step, "debit", s.picks.debit)} label={t("debitWas", { account: debitAnswer(step, lang) })} />
            )}
            <div className="space-y-2">
              {TYPES.map((type) => (
                <div key={type} className="flex flex-wrap items-center gap-1.5">
                  <span className="w-16 text-[11px] uppercase tracking-wide text-gray-500">{t(TYPE_KEY[type])}</span>
                  {STORY_ACCOUNTS.filter((a) => a.type === type).map((a) => (
                    <button
                      key={a.code}
                      onClick={() => onPick(side, a.code)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs sm:text-sm font-medium hover:brightness-150 transition ${TYPE_STYLE[type]}`}
                    >
                      {a.name[lang]}
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <button onClick={onSkip} className="mt-4 text-xs text-gray-500 underline hover:text-gray-300">{t("skip")}</button>
          </div>
        )}

        {!side && (
          <div className="mt-5">
            {s.picks.credit && s.picks.debit && (
              <div className="flex flex-wrap gap-2 mb-4">
                <Verdict ok={isRightAnswer(step, "debit", s.picks.debit)} label={t("debitWas", { account: debitAnswer(step, lang) })} />
                <Verdict ok={isRightAnswer(step, "credit", s.picks.credit)} label={t("creditWas", { account: creditAnswer(step, lang) })} />
              </div>
            )}
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{t("entryTitle")}</p>
            <EntryTable lines={step.lines} />
            <ul className="mt-4 space-y-1.5 text-sm">
              {step.lines.map((l, i) => {
                const up = lineIncreases(l);
                return (
                  <li key={i} className="flex gap-2">
                    <span className={up ? "text-emerald-400" : "text-rose-400"}>{up ? "▲" : "▼"}</span>
                    <span className="text-gray-300">
                      {t(up ? "effectUp" : "effectDown", { account: name(l.account), amount: money(l.debit || l.credit) })}
                      <span className="text-gray-500"> · {t(TYPE_KEY[account(l.account).type])}, {t(l.debit ? "byDebit" : "byCredit")}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-sm text-gray-300 leading-relaxed border-l-2 border-amber-400/60 pl-3">{step.why[lang]}</p>
            <button onClick={onNext} className="mt-5 w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition">
              {last ? t("finish") : t("next")}
            </button>
            <p className="mt-2 text-xs text-gray-600 hidden sm:block">{t("keys")}</p>
            <a href="#books" className="mt-3 inline-block text-sm text-blue-400 lg:hidden">{t("seeBooks")}</a>
          </div>
        )}
      </div>
    </div>
  );
}

function debitAnswer(step: (typeof STORY)[number], lang: "en" | "es") {
  return step.lines.filter((l) => l.debit).map((l) => account(l.account).name[lang]).join(" + ");
}
function creditAnswer(step: (typeof STORY)[number], lang: "en" | "es") {
  return step.lines.filter((l) => l.credit).map((l) => account(l.account).name[lang]).join(" + ");
}

function Verdict({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`mb-3 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${ok ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
      <span>{ok ? "✓" : "✗"}</span>
      <span>{label}</span>
    </div>
  );
}

function EntryTable({ lines }: { lines: Line[] }) {
  const t = useTranslations("bookkeeping");
  const lang = useLocale() === "es" ? "es" : "en";
  const money = useMoney();
  const tot = totals(lines);
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-gray-500 text-xs">
          <th className="text-left font-medium pb-1">{t("colAccount")}</th>
          <th className="text-right font-medium pb-1 w-24">{t("colDebit")}</th>
          <th className="text-right font-medium pb-1 w-24">{t("colCredit")}</th>
        </tr>
      </thead>
      <tbody>
        {lines.map((l, i) => (
          <tr key={i} className="border-t border-gray-800">
            <td className={`py-1.5 text-white ${l.credit ? "pl-6" : ""}`}>{account(l.account).name[lang]}</td>
            <td className="py-1.5 text-right tabular-nums text-sky-300">{l.debit ? money(l.debit) : ""}</td>
            <td className="py-1.5 text-right tabular-nums text-orange-300">{l.credit ? money(l.credit) : ""}</td>
          </tr>
        ))}
        <tr className="border-t border-gray-600 text-gray-400">
          <td className="pt-1.5 text-xs">{t("total")}</td>
          <td className="pt-1.5 text-right tabular-nums">{money(tot.debit)}</td>
          <td className="pt-1.5 text-right tabular-nums">{money(tot.credit)}</td>
        </tr>
      </tbody>
    </table>
  );
}

function Finished({ right, asked, onFree, onAgain }: { right: number; asked: number; onFree: () => void; onAgain: () => void }) {
  const t = useTranslations("bookkeeping");
  const money = useMoney();
  const st = statements(storyEntries(STORY.length));
  const cash = st.assets.find((r) => r.code === "1000")?.amount ?? 0;
  const vat = st.liabilities.find((r) => r.code === "2100")?.amount ?? 0;
  const start = STORY[0].lines[0].debit;
  const drawings = STORY[STORY.length - 1].lines[0].debit;

  return (
    <div className="rounded-2xl border border-emerald-500/40 bg-[#0d1426] p-5 sm:p-6">
      <div className="text-4xl mb-2">☕</div>
      <h2 className="text-2xl font-bold text-white mb-4">{t("doneTitle")}</h2>
      <div className="grid grid-cols-3 gap-2 mb-5">
        <Stat label={t("doneProfit")} value={money(st.profit)} tone="text-emerald-300" />
        <Stat label={t("doneCash")} value={money(cash)} sub={t("doneCashFrom", { amount: money(start) })} tone="text-sky-300" />
        <Stat label={t("doneVat")} value={money(vat)} tone="text-orange-300" />
      </div>
      <p className="text-gray-300 leading-relaxed mb-3">
        {t("doneLesson", { profit: money(st.profit), drop: money(start - cash), drawings: money(drawings), vat: money(vat) })}
      </p>
      {asked > 0 && <p className="text-sm text-gray-400 mb-5">{t("doneScore", { right, asked })}</p>}
      <div className="flex flex-wrap gap-2">
        <button onClick={onFree} className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition">{t("tryOwn")}</button>
        <button onClick={onAgain} className="px-5 py-3 rounded-xl border border-gray-600 text-gray-300 hover:text-white transition">{t("playAgain")}</button>
      </div>
      <p className="mt-5 text-sm text-gray-400">
        {t("nextSteps")}{" "}
        <Link href="/tools/break-even" className="text-blue-400 hover:underline">{t("linkBreakEven")}</Link>
        {" · "}
        <Link href="/tools/cash-flow" className="text-blue-400 hover:underline">{t("linkCashFlow")}</Link>
      </p>
    </div>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone: string }) {
  return (
    <div className="rounded-xl bg-[#0a0f1e] border border-gray-800 p-3">
      <p className="text-[11px] text-gray-500 leading-tight">{label}</p>
      <p className={`text-lg sm:text-xl font-bold tabular-nums ${tone}`}>{value}</p>
      {sub && <p className="text-[11px] text-gray-500 leading-tight">{sub}</p>}
    </div>
  );
}

// ── Free entries ─────────────────────────────────────────────────────────────

interface Draft { account: string; debit: string; credit: string }
const blankDraft = (): Draft[] => [{ account: "", debit: "", credit: "" }, { account: "", debit: "", credit: "" }];

const EXAMPLES: { key: "ex1" | "ex2" | "ex3" | "ex4"; lines: Draft[] }[] = [
  { key: "ex1", lines: [{ account: "1000", debit: "2000", credit: "" }, { account: "2500", debit: "", credit: "2000" }] },
  { key: "ex2", lines: [{ account: "6300", debit: "150", credit: "" }, { account: "1000", debit: "", credit: "150" }] },
  { key: "ex3", lines: [{ account: "1300", debit: "800", credit: "" }, { account: "1000", debit: "", credit: "800" }] },
  { key: "ex4", lines: [{ account: "6400", debit: "300", credit: "" }, { account: "2200", debit: "", credit: "300" }] },
];

function FreeEntry({ onPost, onBlank }: { onPost: (e: Omit<Entry, "id">) => void; onBlank: () => void }) {
  const t = useTranslations("bookkeeping");
  const lang = useLocale() === "es" ? "es" : "en";
  const money = useMoney();
  const [memo, setMemo] = useState("");
  const [rows, setRows] = useState<Draft[]>(blankDraft);
  const [flash, setFlash] = useState(false);

  const lines: Line[] = rows.map((r) => ({ account: r.account, debit: parseAmount(r.debit), credit: parseAmount(r.credit) }));
  const used = lines.filter((l) => l.account || l.debit || l.credit);
  const numeric = used.every((l) => !Number.isNaN(l.debit) && !Number.isNaN(l.credit));
  const tot = numeric ? totals(used) : { debit: 0, credit: 0 };
  const ok = numeric && isBalanced(used);
  const touched = used.length > 0;

  function set(i: number, patch: Partial<Draft>) {
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
    setFlash(false);
  }

  function post() {
    if (!ok) return;
    onPost({ memo: memo.trim() || t("untitled"), lines: used });
    setMemo("");
    setRows(blankDraft());
    setFlash(true);
  }

  return (
    <div className="rounded-2xl border border-gray-700 bg-[#0d1426] p-5 sm:p-6">
      <h2 className="text-xl font-bold text-white mb-1">{t("freeTitle")}</h2>
      <p className="text-sm text-gray-400 mb-4">{t("freeHelp")}</p>

      <div className="flex flex-wrap gap-1.5 mb-5">
        <span className="text-xs text-gray-500 self-center mr-1">{t("examples")}</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.key}
            onClick={() => { setRows(ex.lines.map((l) => ({ ...l }))); setMemo(t(ex.key)); setFlash(false); }}
            className="px-2.5 py-1 rounded-lg border border-gray-700 text-xs text-gray-300 hover:border-blue-500 hover:text-white transition"
          >
            {t(ex.key)}
          </button>
        ))}
      </div>

      <label className="block text-xs text-gray-500 mb-1" htmlFor="bk-memo">{t("memo")}</label>
      <input
        id="bk-memo"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder={t("memoPh")}
        maxLength={80}
        className="w-full mb-4 rounded-lg bg-[#0a0f1e] border border-gray-700 px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
      />

      <div className="grid grid-cols-[minmax(0,1fr)_4.75rem_4.75rem_1.25rem] sm:grid-cols-[minmax(0,1fr)_5.5rem_5.5rem_1.5rem] gap-1.5 text-xs text-gray-500 mb-1">
        <span>{t("colAccount")}</span><span className="text-right">{t("colDebit")}</span><span className="text-right">{t("colCredit")}</span><span />
      </div>
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-[minmax(0,1fr)_4.75rem_4.75rem_1.25rem] sm:grid-cols-[minmax(0,1fr)_5.5rem_5.5rem_1.5rem] gap-1.5 mb-1.5">
          <select
            value={r.account}
            onChange={(e) => set(i, { account: e.target.value })}
            aria-label={t("colAccount")}
            className="min-w-0 rounded-lg bg-[#0a0f1e] border border-gray-700 px-2 py-2 text-sm text-white focus:border-blue-500 outline-none"
          >
            <option value="">{t("chooseAccount")}</option>
            {TYPES.map((type) => (
              <optgroup key={type} label={t(TYPE_KEY[type])}>
                {ACCOUNTS.filter((a) => a.type === type).map((a) => (
                  <option key={a.code} value={a.code}>{a.code} · {a.name[lang]}</option>
                ))}
              </optgroup>
            ))}
          </select>
          {(["debit", "credit"] as const).map((side) => (
            <input
              key={side}
              inputMode="decimal"
              value={r[side]}
              onChange={(e) => set(i, side === "debit" ? { debit: e.target.value, credit: e.target.value ? "" : r.credit } : { credit: e.target.value, debit: e.target.value ? "" : r.debit })}
              aria-label={t(side === "debit" ? "colDebit" : "colCredit")}
              placeholder="0"
              className={`min-w-0 rounded-lg bg-[#0a0f1e] border px-2 py-2 text-sm text-right tabular-nums text-white outline-none focus:border-blue-500 ${Number.isNaN(parseAmount(r[side])) ? "border-rose-500" : "border-gray-700"}`}
            />
          ))}
          <button
            onClick={() => setRows((rs) => (rs.length > 2 ? rs.filter((_, j) => j !== i) : rs))}
            disabled={rows.length <= 2}
            aria-label={t("removeLine")}
            className="text-gray-500 hover:text-rose-400 disabled:opacity-20"
          >
            ×
          </button>
        </div>
      ))}
      <button onClick={() => setRows((rs) => [...rs, { account: "", debit: "", credit: "" }])} className="text-xs text-blue-400 hover:underline">
        {t("addLine")}
      </button>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <span className="text-gray-400">{t("colDebit")}: <span className="tabular-nums text-sky-300">{money(tot.debit)}</span></span>
        <span className="text-gray-400">{t("colCredit")}: <span className="tabular-nums text-orange-300">{money(tot.credit)}</span></span>
        {touched && !ok && tot.debit !== tot.credit && (
          <span className="text-rose-300">{t("diff", { amount: money(Math.abs(tot.debit - tot.credit)) })}</span>
        )}
        {flash && <span className="text-emerald-300">{t("postedOk")}</span>}
      </div>
      {touched && !ok && tot.debit === tot.credit && <p className="mt-2 text-xs text-rose-300">{t("errUnbalanced")}</p>}

      <button onClick={post} disabled={!ok} className="mt-4 w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition disabled:opacity-40 disabled:hover:bg-blue-600">
        {t("post")}
      </button>

      <p className="mt-5 text-xs text-gray-500">
        {t("freeBase")}{" "}
        <button onClick={onBlank} className="underline hover:text-gray-300">{t("blank")}</button>
      </p>
    </div>
  );
}

// ── The books ────────────────────────────────────────────────────────────────

type Tab = "t" | "tb" | "pl" | "bs" | "j";

function Books({ entries, last, base, onRemove }: { entries: Entry[]; last?: Entry; base: number; onRemove?: (id: string) => void }) {
  const t = useTranslations("bookkeeping");
  const lang = useLocale() === "es" ? "es" : "en";
  const money = useMoney();
  const [tab, setTab] = useState<Tab>("t");
  const st = statements(entries);
  const name = (code: string) => account(code).name[lang];
  const touched = new Set(last?.lines.map((l) => l.account));
  const balanced = st.totalAssets === st.totalLiabilities + st.totalEquity;

  const tabs: [Tab, string][] = [["t", t("tabT")], ["tb", t("tabTB")], ["pl", t("tabPL")], ["bs", t("tabBS")], ["j", t("tabJ")]];

  return (
    <div id="books" className="min-w-0 scroll-mt-[140px] rounded-2xl border border-gray-700 bg-[#0d1426] p-4 sm:p-5 lg:sticky lg:top-[150px]">
      <div className={`mb-4 rounded-xl px-3 py-2 text-sm flex flex-wrap items-center gap-x-2 ${balanced ? "bg-emerald-500/10 text-emerald-200" : "bg-rose-500/10 text-rose-200"}`}>
        <span className="font-semibold">{balanced ? "⚖️ " + t("checkOk") : "⚠️"}</span>
        <span className="tabular-nums">{t("check", { assets: money(st.totalAssets), liab: money(st.totalLiabilities), equity: money(st.totalEquity) })}</span>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {tabs.map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${tab === k ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-500 py-10 text-center">{t("emptyLedger")}</p>
      ) : tab === "t" ? (
        <TAccounts entries={entries} touched={touched} lastId={last?.id} base={base} />
      ) : tab === "tb" ? (
        <TrialTable entries={entries} />
      ) : tab === "pl" ? (
        <div className="text-sm">
          {st.income.map((r) => <Row key={r.code} label={name(r.code)} value={money(r.amount)} />)}
          <Row label={t("revenue")} value={money(st.revenue)} bold />
          {st.costOfSales.map((r) => <Row key={r.code} label={name(r.code)} value={money(-r.amount)} />)}
          <Row label={t("grossProfit")} value={money(st.grossProfit)} bold />
          {st.overheads.length > 0 && <p className="mt-3 mb-1 text-xs uppercase tracking-wide text-gray-500">{t("overheads")}</p>}
          {st.overheads.map((r) => <Row key={r.code} label={name(r.code)} value={money(-r.amount)} />)}
          <Row label={st.profit >= 0 ? t("netProfit") : t("netLoss")} value={money(st.profit)} bold big tone={st.profit >= 0 ? "text-emerald-300" : "text-rose-300"} />
        </div>
      ) : tab === "bs" ? (
        <div className="text-sm">
          <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">{t("assets")}</p>
          {st.assets.map((r) => <Row key={r.code} label={name(r.code)} value={money(r.amount)} />)}
          <Row label={t("totalAssets")} value={money(st.totalAssets)} bold big />
          <p className="mt-4 mb-1 text-xs uppercase tracking-wide text-gray-500">{t("liabilities")}</p>
          {st.liabilities.length === 0 && <Row label="—" value={money(0)} />}
          {st.liabilities.map((r) => <Row key={r.code} label={name(r.code)} value={money(r.amount)} />)}
          <p className="mt-3 mb-1 text-xs uppercase tracking-wide text-gray-500">{t("equity")}</p>
          {st.equity.map((r) => <Row key={r.code} label={name(r.code)} value={money(r.amount)} />)}
          {st.profit !== 0 && <Row label={t("profitLine")} value={money(st.profit)} />}
          <Row label={t("totalLE")} value={money(st.totalLiabilities + st.totalEquity)} bold big />
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((e, i) => (
            <div key={e.id} className={`rounded-xl border p-3 ${e.id === last?.id ? "border-amber-400/50" : "border-gray-800"}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono text-gray-500">{ref(e, i - base)}</span>
                <span className="text-sm text-white truncate">{e.step ? STORY[e.step - 1].title[lang] : e.memo}</span>
                {onRemove && !e.step && (
                  <button onClick={() => onRemove(e.id)} className="ml-auto text-xs text-gray-500 hover:text-rose-400">{t("undo")}</button>
                )}
              </div>
              <EntryTable lines={e.lines} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold, big, tone }: { label: string; value: string; bold?: boolean; big?: boolean; tone?: string }) {
  return (
    <div className={`flex justify-between gap-3 py-1 ${bold ? "border-t border-gray-700 font-semibold text-white" : "text-gray-300"} ${big ? "text-base" : ""}`}>
      <span className="min-w-0">{label}</span>
      <span className={`tabular-nums ${tone ?? ""}`}>{value}</span>
    </div>
  );
}

function TrialTable({ entries }: { entries: Entry[] }) {
  const t = useTranslations("bookkeeping");
  const lang = useLocale() === "es" ? "es" : "en";
  const money = useMoney();
  const tb = trialBalance(entries);
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-gray-500 text-xs">
          <th className="text-left font-medium pb-1">{t("colAccount")}</th>
          <th className="text-right font-medium pb-1">{t("colDebit")}</th>
          <th className="text-right font-medium pb-1">{t("colCredit")}</th>
        </tr>
      </thead>
      <tbody>
        {tb.rows.map((r) => (
          <tr key={r.code} className="border-t border-gray-800">
            <td className="py-1.5 text-gray-300"><span className="text-gray-600 font-mono text-xs mr-2">{r.code}</span>{account(r.code).name[lang]}</td>
            <td className="py-1.5 text-right tabular-nums text-sky-300">{r.debit ? money(r.debit) : ""}</td>
            <td className="py-1.5 text-right tabular-nums text-orange-300">{r.credit ? money(r.credit) : ""}</td>
          </tr>
        ))}
        <tr className="border-t-2 border-gray-600 font-semibold text-white">
          <td className="pt-2">{t("total")}</td>
          <td className="pt-2 text-right tabular-nums">{money(tb.debit)}</td>
          <td className="pt-2 text-right tabular-nums">{money(tb.credit)}</td>
        </tr>
      </tbody>
    </table>
  );
}

function TAccounts({ entries, touched, lastId, base }: { entries: Entry[]; touched: Set<string>; lastId?: string; base: number }) {
  const t = useTranslations("bookkeeping");
  const lang = useLocale() === "es" ? "es" : "en";
  const money = useMoney();

  const byAccount = new Map<string, { ref: string; debit: number; credit: number; isLast: boolean }[]>();
  entries.forEach((e, i) => {
    for (const l of e.lines) {
      const list = byAccount.get(l.account) ?? [];
      list.push({ ref: ref(e, i - base), debit: l.debit, credit: l.credit, isLast: e.id === lastId });
      byAccount.set(l.account, list);
    }
  });
  const codes = [...byAccount.keys()].sort();

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {codes.map((code) => {
        const a = account(code);
        const items = byAccount.get(code)!;
        const dr = items.filter((x) => x.debit);
        const cr = items.filter((x) => x.credit);
        const net = items.reduce((s, x) => s + x.debit - x.credit, 0);
        return (
          <div
            key={code + (touched.has(code) ? lastId : "")}
            className={`rounded-xl border p-2.5 ${touched.has(code) ? "border-amber-400/70 bk-flash" : "border-gray-800"}`}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-sm font-semibold text-white truncate">{a.name[lang]}</span>
              <span className={`shrink-0 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border ${TYPE_STYLE[a.type]}`}>{t(TYPE_KEY[a.type])}</span>
            </div>
            <div className="grid grid-cols-2 border-t border-gray-500 text-xs tabular-nums">
              <div className="border-r border-gray-500 pr-1.5 pt-1 min-h-[1.5rem]">
                {dr.map((x, i) => (
                  <div key={i} className={`flex justify-between gap-1 ${x.isLast ? "text-amber-200 font-semibold" : "text-sky-300"}`}>
                    <span className="text-gray-600">{x.ref}</span><span>{money(x.debit)}</span>
                  </div>
                ))}
              </div>
              <div className="pl-1.5 pt-1">
                {cr.map((x, i) => (
                  <div key={i} className={`flex justify-between gap-1 ${x.isLast ? "text-amber-200 font-semibold" : "text-orange-300"}`}>
                    <span className="text-gray-600">{x.ref}</span><span>{money(x.credit)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-1.5 pt-1 border-t border-gray-800 flex justify-between text-xs">
              <span className="text-gray-500">{t("balance")}</span>
              <span className="tabular-nums text-white">{net === 0 ? money(0) : `${money(Math.abs(net))} ${net > 0 ? t("dr") : t("cr")}`}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
