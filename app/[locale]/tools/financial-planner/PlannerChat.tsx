"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { parseAmount, RISK_PROFILES, type RiskKey } from "@/lib/planner";

// Fill in the Financial Journey by answering one question at a time, typed or
// spoken. Scripted, not AI: free, private (nothing leaves the browser except
// what the browser's own speech service hears), and the same every time.
// Each answer updates the plan behind the panel, so the charts move as you go.

export interface PlannerChatApi {
  currency: string;
  income: number;
  expenses: Record<string, number>;
  debts: Record<string, number>;
  years: number;
  age: number;
  setCurrency: (c: string) => void;
  setIncome: (v: number) => void;
  setExpense: (key: string, v: number) => void;
  setDebt: (key: string, v: number) => void;
  setYears: (v: number) => void;
  setRatePreset: (i: number) => void;
  setCustomRate: (v: number) => void;
  setAge: (v: number) => void;
  setRisk: (r: RiskKey) => void;
  setStep: (s: number) => void;
}

type Question =
  | { kind: "choice"; id: string; step: number; ask: string; options: Option[] }
  | { kind: "amount"; id: string; step: number; ask: string; current: number; unit: "money" | "years" | "age"; apply: (v: number) => void; min?: number; max?: number };

interface Message { from: "bot" | "me"; text: string }
/** `words`: what someone might say to pick this option, in either language. */
interface Option { label: string; words: string[]; apply: () => void }

const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/** The option a spoken (or typed) answer names, if exactly one matches. */
function matchOption(options: Option[], heard: string): Option | null {
  const h = ` ${fold(heard).replace(/[^a-z0-9&%]+/g, " ")} `;
  const hits = options.filter((o) => o.words.some((w) => h.includes(` ${fold(w)} `)));
  return hits.length === 1 ? hits[0] : null;
}

const CURRENCY_WORDS: Record<string, string[]> = {
  "£": ["pound", "pounds", "sterling", "libra", "libras", "gbp"],
  "$": ["dollar", "dollars", "dolar", "dolares", "usd"],
  "€": ["euro", "euros", "eur"],
  "¥": ["yen", "yenes", "jpy"],
  "₹": ["rupee", "rupees", "rupia", "rupias", "inr"],
};
const RATE_WORDS = [["s&p", "sp", "500", "s p"], ["global", "world", "mundial", "msci"], ["bonds", "bond", "bonos", "renta fija"], ["custom", "other", "otra", "otro", "personalizada"]];
const RISK_WORDS: Record<RiskKey, string[]> = {
  conservative: ["conservative", "cautious", "conservador", "conservadora", "prudente"],
  moderate: ["moderate", "balanced", "moderado", "moderada", "equilibrado"],
  aggressive: ["aggressive", "adventurous", "agresivo", "agresiva", "dinamico", "arriesgado"],
};

// The browser's speech recognition, where there is one (Chrome, Edge, Safari).
type Recognition = { lang: string; interimResults: boolean; maxAlternatives: number; start: () => void; stop: () => void; onresult: ((e: { results: { 0: { transcript: string } }[] }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };
function makeRecognition(): Recognition | null {
  if (typeof window === "undefined") return null;
  const W = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export default function PlannerChat({
  api, expenseCats, debtItems, ratePresets,
}: {
  api: PlannerChatApi;
  expenseCats: { key: string; label: string }[];
  debtItems: { key: string; label: string }[];
  ratePresets: { label: string; rate: number | null }[];
}) {
  const t = useTranslations("financialPlanner");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const [askCustomRate, setAskCustomRate] = useState(false);
  const [readAloud, setReadAloud] = useState(false);
  const recognition = useRef<Recognition | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const c = api.currency;
  const money = (v: number) => `${c}${v.toLocaleString(locale === "es" ? "es-ES" : "en-GB", { maximumFractionDigits: 0 })}`;

  // The script. Rebuilt each render so "current" values and the currency stay fresh.
  const questions: Question[] = useMemo(() => {
    const q: Question[] = [
      {
        kind: "choice", id: "currency", step: 1, ask: t("chatAskCurrency"),
        options: ["£", "$", "€", "¥", "₹"].map((sym) => ({ label: sym, words: CURRENCY_WORDS[sym], apply: () => api.setCurrency(sym) })),
      },
      { kind: "amount", id: "income", step: 1, ask: t("chatAskIncome"), current: api.income, unit: "money", apply: api.setIncome },
      ...expenseCats.map((e): Question => ({
        kind: "amount", id: `exp-${e.key}`, step: 1, ask: t("chatAskExpense", { item: e.label.toLowerCase() }),
        current: api.expenses[e.key] ?? 0, unit: "money", apply: (v) => api.setExpense(e.key, v),
      })),
      ...debtItems.map((d): Question => ({
        kind: "amount", id: `debt-${d.key}`, step: 2, ask: t("chatAskDebt", { item: d.label.toLowerCase() }),
        current: api.debts[d.key] ?? 0, unit: "money", apply: (v) => api.setDebt(d.key, v),
      })),
      { kind: "amount", id: "years", step: 3, ask: t("chatAskYears"), current: api.years, unit: "years", apply: api.setYears, min: 1, max: 40 },
      {
        kind: "choice", id: "rate", step: 3, ask: t("chatAskRate"),
        options: ratePresets.map((p, i) => ({
          label: p.rate === null ? p.label : `${p.label} ${p.rate}%`,
          words: [...(RATE_WORDS[i] ?? []), ...(p.rate !== null ? [String(p.rate)] : [])],
          apply: () => {
            api.setRatePreset(i);
            if (p.rate === null) setAskCustomRate(true);
          },
        })),
      },
    ];
    if (askCustomRate) {
      q.push({ kind: "amount", id: "custom-rate", step: 3, ask: t("chatAskCustomRate"), current: 8, unit: "years", apply: api.setCustomRate, min: 0, max: 30 });
    }
    q.push(
      { kind: "amount", id: "age", step: 4, ask: t("chatAskAge"), current: api.age, unit: "age", apply: api.setAge, min: 18, max: 90 },
      {
        kind: "choice", id: "risk", step: 4, ask: t("chatAskRisk"),
        options: (Object.keys(RISK_PROFILES) as RiskKey[]).map((k) => ({
          label: `${t(RISK_PROFILES[k].labelKey as Parameters<typeof t>[0])} · ${RISK_PROFILES[k].stocks}% ${t("allocStocks").toLowerCase()}`,
          words: RISK_WORDS[k],
          apply: () => api.setRisk(k),
        })),
      },
    );
    return q;
  }, [api, expenseCats, debtItems, ratePresets, askCustomRate, t]);

  const q = questions[index] as Question | undefined;
  const done = !q;

  // Read the bot's latest message aloud, when asked to.
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!readAloud || !last || last.from !== "bot" || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(last.text);
    u.lang = locale === "es" ? "es-ES" : "en-GB";
    window.speechSynthesis.speak(u);
  }, [messages, readAloud, locale]);

  // Ask the current question (once per question).
  useEffect(() => {
    if (!open) return;
    setMessages((m) => {
      const text = q ? q.ask : t("chatDone");
      return m.length && m[m.length - 1].from === "bot" && m[m.length - 1].text === text ? m : [...m, { from: "bot", text }];
    });
    if (q) api.setStep(q.step);
    else api.setStep(5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
    if (open && q?.kind === "amount") input.current?.focus();
  }, [messages, open, q]);

  useEffect(() => setCanSpeak(makeRecognition() !== null), []);
  useEffect(() => () => recognition.current?.stop(), []);

  const say = (text: string) => setMessages((m) => [...m, { from: "me", text }]);
  const next = () => setIndex((i) => i + 1);

  const answer = (raw: string) => {
    if (!q || q.kind !== "amount") return;
    const text = raw.trim();
    if (!text) {
      // Enter on an empty box keeps the current figure.
      say(t("chatKept", { value: q.unit === "money" ? money(q.current) : String(q.current) }));
      setValue("");
      return next();
    }
    const v = parseAmount(text);
    if (v === null || (q.min !== undefined && v < q.min) || (q.max !== undefined && v > q.max)) {
      say(text);
      setMessages((m) => [...m, { from: "bot", text: q.min !== undefined ? t("chatNotUnderstoodRange", { min: q.min, max: q.max ?? "" }) : t("chatNotUnderstood") }]);
      setValue("");
      return;
    }
    const clean = q.unit === "money" ? Math.round(v) : Math.round(v);
    q.apply(clean);
    say(q.unit === "money" ? money(clean) : String(clean));
    setValue("");
    next();
  };

  const choose = (label: string, apply: () => void) => {
    apply();
    say(label);
    next();
  };

  const listen = () => {
    if (listening) return recognition.current?.stop();
    const r = makeRecognition();
    if (!r) return;
    recognition.current = r;
    r.lang = locale === "es" ? "es-ES" : "en-GB";
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (e) => {
      const heard = e.results[0][0].transcript;
      if (q?.kind === "choice") {
        const o = matchOption(q.options, heard);
        if (o) choose(o.label, o.apply);
        else setMessages((m) => [...m, { from: "me", text: heard }, { from: "bot", text: t("chatPickOne") }]);
        return;
      }
      setValue(heard);
      if (parseAmount(heard) !== null) answer(heard);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    setListening(true);
    r.start();
  };

  const restart = () => {
    setMessages([]);
    setAskCustomRate(false);
    setIndex(0);
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-3 rounded-full shadow-2xl shadow-blue-900/50 transition"
        >
          <span aria-hidden="true">💬</span> {t("chatOpen")}
        </button>
      )}

      {open && (
        <section
          role="dialog"
          aria-label={t("chatTitle")}
          className="fixed z-50 bottom-0 right-0 sm:bottom-5 sm:right-5 w-full sm:w-[380px] h-[75vh] sm:h-[560px] flex flex-col bg-[#0d1426] border border-gray-700 sm:rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
        >
          <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#111827]">
            <div>
              <p className="text-white font-bold text-sm">{t("chatTitle")}</p>
              <p className="text-gray-500 text-[11px]">
                {done ? t("chatProgressDone") : t("chatProgress", { n: index + 1, total: questions.length })}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {typeof window !== "undefined" && "speechSynthesis" in window && (
                <button
                  type="button"
                  onClick={() => {
                    if (readAloud) window.speechSynthesis.cancel();
                    setReadAloud(!readAloud);
                  }}
                  aria-pressed={readAloud}
                  title={readAloud ? t("chatReadAloudOff") : t("chatReadAloudOn")}
                  className={`text-xs px-2 py-1 rounded ${readAloud ? "text-blue-300" : "text-gray-500 hover:text-white"}`}
                >
                  {readAloud ? "🔊" : "🔈"}
                </button>
              )}
              <button type="button" onClick={restart} className="text-gray-500 hover:text-white text-xs px-2 py-1" title={t("chatRestart")}>↺</button>
              <button type="button" onClick={() => setOpen(false)} aria-label={t("chatClose")} className="text-gray-400 hover:text-white text-lg px-2">×</button>
            </div>
          </header>
          <div className="h-1 bg-gray-800">
            <div className="h-full bg-blue-600 transition-all" style={{ width: `${(Math.min(index, questions.length) / questions.length) * 100}%` }} />
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2" aria-live="polite">
            {messages.length === 0 && <p className="text-xs text-gray-500">{t("chatIntro")}</p>}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-snug ${
                  m.from === "bot" ? "self-start bg-[#111827] border border-gray-800 text-gray-200 rounded-bl-sm" : "self-end bg-blue-600 text-white rounded-br-sm"
                }`}
              >
                {m.text}
              </div>
            ))}
            {q?.kind === "choice" && (
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {canSpeak && (
                  <button
                    type="button"
                    onClick={listen}
                    aria-label={listening ? t("chatStopListening") : t("chatSpeak")}
                    aria-pressed={listening}
                    className={`text-sm rounded-full px-3 py-1.5 border transition ${listening ? "bg-red-600 border-red-500 text-white animate-pulse" : "bg-[#111827] border-gray-700 text-gray-300 hover:text-white"}`}
                  >
                    🎤
                  </button>
                )}
                {q.options.map((o) => (
                  <button
                    key={o.label}
                    type="button"
                    onClick={() => choose(o.label, o.apply)}
                    className="text-sm bg-[#111827] border border-gray-700 hover:border-blue-500 text-gray-200 hover:text-white rounded-full px-3 py-1.5 transition"
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
            {done && (
              <button type="button" onClick={() => setOpen(false)} className="self-start mt-1 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-full px-4 py-1.5">
                {t("chatSeeReport")}
              </button>
            )}
            <div ref={bottom} />
          </div>

          {q?.kind === "amount" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                answer(value);
              }}
              className="border-t border-gray-800 p-3 flex flex-col gap-1.5"
            >
              <div className="flex gap-2">
                <input
                  ref={input}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  inputMode="decimal"
                  placeholder={q.unit === "money" ? t("chatPlaceholderMoney", { value: money(q.current) }) : t("chatPlaceholderNumber", { value: q.current })}
                  aria-label={q.ask}
                  className="flex-1 min-w-0 bg-[#111827] border border-gray-700 focus:border-blue-500 rounded-lg px-3 py-2 text-white text-sm outline-none"
                />
                {canSpeak && (
                  <button
                    type="button"
                    onClick={listen}
                    aria-label={listening ? t("chatStopListening") : t("chatSpeak")}
                    aria-pressed={listening}
                    className={`shrink-0 w-10 rounded-lg border transition ${listening ? "bg-red-600 border-red-500 text-white animate-pulse" : "bg-[#111827] border-gray-700 text-gray-300 hover:text-white"}`}
                  >
                    🎤
                  </button>
                )}
                <button type="submit" className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg px-3">
                  {t("chatSend")}
                </button>
              </div>
              <p className="text-[11px] text-gray-500">{listening ? t("chatListening") : t("chatHint")}</p>
            </form>
          )}
        </section>
      )}
    </>
  );
}
