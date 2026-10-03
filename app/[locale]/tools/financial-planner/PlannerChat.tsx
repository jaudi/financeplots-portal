"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import GuidedChat, { currencyQuestion, type ChatQuestion } from "@/components/GuidedChat";
import { RISK_PROFILES, type RiskKey } from "@/lib/planner";

// The Financial Journey's questions for GuidedChat. Each question moves the
// page to its step, so the charts behind the panel change as you answer.

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

const RATE_WORDS = [["s&p", "sp", "500"], ["global", "world", "mundial", "msci"], ["bonds", "bond", "bonos"], ["custom", "other", "otra", "otro", "personalizada"]];
const RISK_WORDS: Record<RiskKey, string[]> = {
  conservative: ["conservative", "cautious", "conservador", "conservadora", "prudente"],
  moderate: ["moderate", "balanced", "moderado", "moderada", "equilibrado"],
  aggressive: ["aggressive", "adventurous", "agresivo", "agresiva", "dinamico", "arriesgado"],
};

export default function PlannerChat({
  api, expenseCats, debtItems, ratePresets,
}: {
  api: PlannerChatApi;
  expenseCats: { key: string; label: string }[];
  debtItems: { key: string; label: string }[];
  ratePresets: { label: string; rate: number | null }[];
}) {
  const t = useTranslations("financialPlanner");
  const [askCustomRate, setAskCustomRate] = useState(false);

  // Which step of the journey each question belongs to.
  const { questions, stepOf } = useMemo(() => {
    const steps: Record<string, number> = {};
    const add = (step: number, q: ChatQuestion) => ((steps[q.id] = step), q);
    const list: ChatQuestion[] = [
      add(1, currencyQuestion(t("chatAskCurrency"), api.setCurrency)),
      add(1, { kind: "amount", id: "income", ask: t("chatAskIncome"), current: api.income, unit: "money", apply: api.setIncome }),
      ...expenseCats.map((e) => add(1, {
        kind: "amount", id: `exp-${e.key}`, ask: t("chatAskExpense", { item: e.label.toLowerCase() }),
        current: api.expenses[e.key] ?? 0, unit: "money", apply: (v) => api.setExpense(e.key, v),
      })),
      ...debtItems.map((d) => add(2, {
        kind: "amount", id: `debt-${d.key}`, ask: t("chatAskDebt", { item: d.label.toLowerCase() }),
        current: api.debts[d.key] ?? 0, unit: "money", apply: (v) => api.setDebt(d.key, v),
      })),
      add(3, { kind: "amount", id: "years", ask: t("chatAskYears"), current: api.years, unit: "number", apply: api.setYears, min: 1, max: 40 }),
      add(3, {
        kind: "choice", id: "rate", ask: t("chatAskRate"),
        options: ratePresets.map((p, i) => ({
          label: p.rate === null ? p.label : `${p.label} ${p.rate}%`,
          words: [...(RATE_WORDS[i] ?? []), ...(p.rate !== null ? [String(p.rate)] : [])],
          apply: () => {
            api.setRatePreset(i);
            setAskCustomRate(p.rate === null);
          },
        })),
      }),
    ];
    if (askCustomRate) {
      list.push(add(3, { kind: "amount", id: "custom-rate", ask: t("chatAskCustomRate"), current: 8, unit: "number", apply: api.setCustomRate, min: 0, max: 30 }));
    }
    list.push(
      add(4, { kind: "amount", id: "age", ask: t("chatAskAge"), current: api.age, unit: "number", apply: api.setAge, min: 18, max: 90 }),
      add(4, {
        kind: "choice", id: "risk", ask: t("chatAskRisk"),
        options: (Object.keys(RISK_PROFILES) as RiskKey[]).map((k) => ({
          label: `${t(RISK_PROFILES[k].labelKey as Parameters<typeof t>[0])} · ${RISK_PROFILES[k].stocks}% ${t("allocStocks").toLowerCase()}`,
          words: RISK_WORDS[k],
          apply: () => api.setRisk(k),
        })),
      }),
    );
    return { questions: list, stepOf: steps };
  }, [api, expenseCats, debtItems, ratePresets, askCustomRate, t]);

  return (
    <GuidedChat
      questions={questions}
      currency={api.currency}
      title={t("chatTitle")}
      openLabel={t("chatOpen")}
      doneText={t("chatDone")}
      doneButton={t("chatSeeReport")}
      onAsk={(q) => api.setStep(stepOf[q.id] ?? 1)}
      onDone={() => api.setStep(5)}
    />
  );
}
