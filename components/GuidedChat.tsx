"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { parseAmount } from "@/lib/planner";

// A form filled in by answering one question at a time, typed or spoken —
// used by the Financial Journey and the Personal Budget. Scripted, not AI:
// free, the same every time, and nothing is stored (speech is turned into text
// by the browser's own service). Each answer is applied as it is given, so the
// tool behind the panel updates as you go.

/** `words`: what someone might say or type to pick this option, in either language. */
export interface ChatOption { label: string; words: string[]; apply: () => void }

export type ChatQuestion =
  | { kind: "choice"; id: string; ask: string; options: ChatOption[]; section?: string }
  | { kind: "amount"; id: string; ask: string; current: number; unit: "money" | "number"; apply: (v: number) => void; min?: number; max?: number; section?: string };

interface Message { from: "bot" | "me"; text: string }

const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** The option an answer names, if exactly one matches. */
export function matchOption(options: ChatOption[], heard: string): ChatOption | null {
  const h = ` ${fold(heard).replace(/[^a-z0-9&%£$€¥₹]+/g, " ")} `;
  const hits = options.filter((o) => [o.label, ...o.words].some((w) => h.includes(` ${fold(w).trim()} `)));
  return hits.length === 1 ? hits[0] : null;
}

const CURRENCY_WORDS: Record<string, string[]> = {
  "£": ["pound", "pounds", "sterling", "libra", "libras", "gbp"],
  "$": ["dollar", "dollars", "dolar", "dolares", "usd"],
  "€": ["euro", "euros", "eur"],
  "¥": ["yen", "yenes", "jpy"],
  "₹": ["rupee", "rupees", "rupia", "rupias", "inr"],
};

/** The usual "which currency?" question. */
export function currencyQuestion(ask: string, setCurrency: (c: string) => void): ChatQuestion {
  return {
    kind: "choice", id: "currency", ask,
    options: Object.keys(CURRENCY_WORDS).map((sym) => ({ label: sym, words: CURRENCY_WORDS[sym], apply: () => setCurrency(sym) })),
  };
}

// The browser's speech recognition, where there is one (Chrome, Edge, Safari).
type Recognition = { lang: string; interimResults: boolean; maxAlternatives: number; start: () => void; stop: () => void; onresult: ((e: { results: { 0: { transcript: string } }[] }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };
function makeRecognition(): Recognition | null {
  if (typeof window === "undefined") return null;
  const W = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export default function GuidedChat({
  questions, currency, title, openLabel, doneText, doneButton, onAsk, onDone,
}: {
  questions: ChatQuestion[];
  currency: string;
  title: string;
  openLabel: string;
  doneText: string;
  doneButton: string;
  /** Called with each question as it is asked (to show the matching part of the tool). */
  onAsk?: (q: ChatQuestion) => void;
  onDone?: () => void;
}) {
  const t = useTranslations("guidedChat");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const [canRead, setCanRead] = useState(false);
  const [readAloud, setReadAloud] = useState(false);
  const recognition = useRef<Recognition | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const money = (v: number) => `${currency}${v.toLocaleString(locale === "es" ? "es-ES" : "en-GB", { maximumFractionDigits: 0 })}`;
  const show = (q: ChatQuestion, v: number) => (q.kind === "amount" && q.unit === "money" ? money(v) : String(v));
  const q = questions[index] as ChatQuestion | undefined;
  const done = !q;

  useEffect(() => {
    setCanSpeak(makeRecognition() !== null);
    setCanRead("speechSynthesis" in window);
    return () => recognition.current?.stop();
  }, []);

  // Ask the current question (once per question), and let the tool follow along.
  useEffect(() => {
    if (!open) return;
    const text = q ? q.ask : doneText;
    setMessages((m) => (m.length && m[m.length - 1].from === "bot" && m[m.length - 1].text === text ? m : [...m, { from: "bot", text }]));
    if (q) onAsk?.(q);
    else onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index]);

  // Read the latest question aloud, when asked to.
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!readAloud || !last || last.from !== "bot") return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(last.text);
    u.lang = locale === "es" ? "es-ES" : "en-GB";
    window.speechSynthesis.speak(u);
  }, [messages, readAloud, locale]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
    if (open) input.current?.focus();
  }, [messages, open]);

  const say = (text: string) => setMessages((m) => [...m, { from: "me", text }]);
  const reply = (text: string) => setMessages((m) => [...m, { from: "bot", text }]);
  const next = () => setIndex((i) => i + 1);

  const choose = (o: ChatOption) => {
    o.apply();
    say(o.label);
    next();
  };

  const answer = (raw: string) => {
    if (!q) return;
    const text = raw.trim();
    setValue("");
    if (q.kind === "choice") {
      if (!text) return;
      const o = matchOption(q.options, text);
      if (o) return choose(o);
      say(text);
      return reply(t("pickOne"));
    }
    if (!text) {
      // Enter on an empty box keeps the figure shown.
      say(t("kept", { value: show(q, q.current) }));
      return next();
    }
    const v = parseAmount(text);
    if (v === null || (q.min !== undefined && v < q.min) || (q.max !== undefined && v > q.max)) {
      say(text);
      return reply(q.min !== undefined && q.max !== undefined ? t("notUnderstoodRange", { min: q.min, max: q.max }) : t("notUnderstood"));
    }
    const clean = Math.round(v);
    q.apply(clean);
    say(show(q, clean));
    next();
  };

  const skipSection = () => {
    if (!q?.section) return;
    let i = index;
    while (i < questions.length && questions[i].section === q.section) i++;
    say(t("skipped", { section: q.section }));
    setIndex(i);
  };

  const listen = () => {
    if (listening) return recognition.current?.stop();
    const r = makeRecognition();
    if (!r) return;
    recognition.current = r;
    r.lang = locale === "es" ? "es-ES" : "en-GB";
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (e) => answer(e.results[0][0].transcript);
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    setListening(true);
    r.start();
  };

  const restart = () => {
    setMessages([]);
    setIndex(0);
  };

  const pill = "text-sm rounded-full px-3 py-1.5 border transition";

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-3 rounded-full shadow-2xl shadow-blue-900/50 transition"
        >
          <span aria-hidden="true">💬</span> {openLabel}
        </button>
      )}

      {open && (
        <section
          role="dialog"
          aria-label={title}
          className="fixed z-50 bottom-0 right-0 sm:bottom-5 sm:right-5 w-full sm:w-[380px] h-[75vh] sm:h-[560px] flex flex-col bg-[#0d1426] border border-gray-700 sm:rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
        >
          <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#111827]">
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">{title}</p>
              <p className="text-gray-500 text-[11px]">
                {done ? t("progressDone") : `${t("progress", { n: index + 1, total: questions.length })}${q?.section ? ` · ${q.section}` : ""}`}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {canRead && (
                <button
                  type="button"
                  onClick={() => {
                    if (readAloud) window.speechSynthesis.cancel();
                    setReadAloud(!readAloud);
                  }}
                  aria-pressed={readAloud}
                  title={readAloud ? t("readAloudOff") : t("readAloudOn")}
                  className={`text-xs px-2 py-1 rounded ${readAloud ? "text-blue-300" : "text-gray-500 hover:text-white"}`}
                >
                  {readAloud ? "🔊" : "🔈"}
                </button>
              )}
              <button type="button" onClick={restart} className="text-gray-500 hover:text-white text-xs px-2 py-1" title={t("restart")}>↺</button>
              <button type="button" onClick={() => setOpen(false)} aria-label={t("close")} className="text-gray-400 hover:text-white text-lg px-2">×</button>
            </div>
          </header>
          <div className="h-1 bg-gray-800">
            <div className="h-full bg-blue-600 transition-all" style={{ width: `${(Math.min(index, questions.length) / questions.length) * 100}%` }} />
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2" aria-live="polite">
            {messages.length === 0 && <p className="text-xs text-gray-500">{t("intro")}</p>}
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
              <div className="flex flex-wrap gap-2 mt-1">
                {q.options.map((o) => (
                  <button key={o.label} type="button" onClick={() => choose(o)} className={`${pill} bg-[#111827] border-gray-700 hover:border-blue-500 text-gray-200 hover:text-white`}>
                    {o.label}
                  </button>
                ))}
              </div>
            )}
            {q?.section && (
              <button type="button" onClick={skipSection} className="self-start text-xs text-gray-500 hover:text-gray-300 underline underline-offset-2 mt-1">
                {t("skipSection", { section: q.section })}
              </button>
            )}
            {done && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="self-start mt-1 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-full px-4 py-1.5"
              >
                {doneButton}
              </button>
            )}
            <div ref={bottom} />
          </div>

          {q && (
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
                  inputMode={q.kind === "amount" ? "decimal" : "text"}
                  placeholder={q.kind === "amount" ? t("placeholderAmount", { value: show(q, q.current) }) : t("placeholderChoice")}
                  aria-label={q.ask}
                  className="flex-1 min-w-0 bg-[#111827] border border-gray-700 focus:border-blue-500 rounded-lg px-3 py-2 text-white text-sm outline-none"
                />
                {canSpeak && (
                  <button
                    type="button"
                    onClick={listen}
                    aria-label={listening ? t("stopListening") : t("speak")}
                    aria-pressed={listening}
                    className={`shrink-0 w-10 rounded-lg border transition ${listening ? "bg-red-600 border-red-500 text-white animate-pulse" : "bg-[#111827] border-gray-700 text-gray-300 hover:text-white"}`}
                  >
                    🎤
                  </button>
                )}
                <button type="submit" className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg px-3">
                  {t("send")}
                </button>
              </div>
              <p className="text-[11px] text-gray-500">{listening ? t("listening") : q.kind === "amount" ? t("hintAmount") : t("hintChoice")}</p>
            </form>
          )}
        </section>
      )}
    </>
  );
}
