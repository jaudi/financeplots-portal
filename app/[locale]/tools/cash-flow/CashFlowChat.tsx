"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import GuidedChat, { type ChatQuestion, type ChatOption } from "@/components/GuidedChat";
import type { Frequency, Line, Schedule, Schedules } from "@/lib/cash-flow";

// The 13-week Cash Flow's questions for GuidedChat: the cash today, then each
// line in turn — customer receipts and other income in; supplier runs, payroll,
// taxes and direct debits out — with how often and when the lumpy ones land.
// Every answer refills that line's 13 weeks, so the closing message can give
// the lowest balance and its week.

/** Words for the frequencies a visitor can choose by voice, English and Spanish. */
const FREQ_WORDS: Record<Exclude<Frequency, "once">, { words: string[]; whole?: string[] }> = {
  weekly: { words: ["weekly", "every week", "each week", "semanal", "cada semana", "todas las semanas"] },
  fortnightly: { words: ["fortnightly", "every two weeks", "every 2 weeks", "biweekly", "quincenal", "cada dos semanas", "cada 2 semanas", "cada quince dias"] },
  monthly: { words: ["monthly", "every month", "once a month", "mensual", "cada mes", "una vez al mes", "al mes"] },
};

export default function CashFlowChat({
  currency, name, setName, opening, setOpening, schedules, setSchedule, lowest, lowestWeek,
}: {
  currency: string;
  name: string;
  setName: (v: string) => void;
  opening: number;
  setOpening: (v: number) => void;
  schedules: Schedules;
  /** Change a line's schedule and refill its 13 weeks. */
  setSchedule: (line: Line, patch: Partial<Schedule>) => void;
  lowest: number;
  lowestWeek: number;
}) {
  const t = useTranslations("cashFlow");

  const questions = useMemo((): ChatQuestion[] => {
    const freqOptions = (line: Line): ChatOption[] =>
      (Object.keys(FREQ_WORDS) as (keyof typeof FREQ_WORDS)[]).map((f) => ({
        label: t(`freq.${f}`), ...FREQ_WORDS[f], apply: () => setSchedule(line, { frequency: f }),
      }));
    const week = (id: string, ask: string, line: Line): ChatQuestion => ({
      kind: "amount", id, ask, current: schedules[line].firstWeek, unit: "number", min: 1, max: 13,
      apply: (v) => setSchedule(line, { firstWeek: Math.round(v) }),
      skip: () => schedules[line].amount === 0,
    });
    return [
      { kind: "text", id: "name", ask: t("chat.askName"), current: name, apply: setName },
      { kind: "amount", id: "opening", ask: t("chat.askOpening"), current: opening, unit: "money", allowNegative: true, apply: setOpening },
      { kind: "amount", id: "revenue", ask: t("chat.askRevenue"), current: schedules.revenue.amount, unit: "money", min: 0,
        apply: (v) => setSchedule("revenue", { amount: v, frequency: "weekly", firstWeek: 1 }) },
      { kind: "amount", id: "revenueGrowth", ask: t("chat.askRevenueGrowth"), current: schedules.revenue.growthPct ?? 0, unit: "percent", allowNegative: true, min: 0, max: 50,
        apply: (v) => setSchedule("revenue", { growthPct: v }) },
      { kind: "amount", id: "otherIncome", ask: t("chat.askOtherIncome"), current: schedules.otherIncome.amount, unit: "money", min: 0,
        apply: (v) => setSchedule("otherIncome", { amount: v, frequency: "monthly" }) },
      { kind: "amount", id: "suppliers", ask: t("chat.askSuppliers"), current: schedules.suppliers.amount, unit: "money", min: 0,
        apply: (v) => setSchedule("suppliers", { amount: v }) },
      { kind: "choice", id: "suppliersFreq", ask: t("chat.askSuppliersFreq"), options: freqOptions("suppliers"), skip: () => schedules.suppliers.amount === 0 },
      { kind: "amount", id: "payroll", ask: t("chat.askPayroll"), current: schedules.payroll.amount, unit: "money", min: 0,
        apply: (v) => setSchedule("payroll", { amount: v }) },
      { kind: "choice", id: "payrollFreq", ask: t("chat.askPayrollFreq"), options: freqOptions("payroll"), skip: () => schedules.payroll.amount === 0 },
      week("payrollWeek", t("chat.askPayrollWeek"), "payroll"),
      { kind: "amount", id: "taxes", ask: t("chat.askTaxes"), current: schedules.taxes.amount, unit: "money", min: 0,
        apply: (v) => setSchedule("taxes", { amount: v, frequency: "once" }) },
      week("taxesWeek", t("chat.askTaxesWeek"), "taxes"),
      { kind: "amount", id: "directDebits", ask: t("chat.askDirectDebits"), current: schedules.directDebits.amount, unit: "money", min: 0,
        apply: (v) => setSchedule("directDebits", { amount: v, frequency: "monthly" }) },
    ];
  }, [t, name, setName, opening, setOpening, schedules, setSchedule]);

  const shown = `${lowest < 0 ? "−" : ""}${currency}${Math.abs(Math.round(lowest)).toLocaleString("en-GB")}`;
  return (
    <GuidedChat
      questions={questions}
      currency={currency}
      title={t("chat.title")}
      openLabel={t("chat.open")}
      doneText={t(lowest < 0 ? "chat.doneNegative" : "chat.done", { lowest: shown, week: lowestWeek })}
      doneButton={t("chat.see")}
    />
  );
}
