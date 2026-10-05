"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import GuidedChat, { type ChatQuestion } from "@/components/GuidedChat";
import type { AmountUnit } from "@/lib/guided-chat";

// The 5-Year Financial Model's questions for GuidedChat, in three groups:
// sales and costs, the balance sheet today, and the cash cycle. Each question
// shows the statement it feeds (income, balance sheet, cash flow).

type Tab = "income" | "balance" | "cashflow";

/** Each input: its key (in the page's values and in `chat.ask`), the tab it feeds, its unit and limits. */
const FIELDS: { key: string; tab: Tab; unit: AmountUnit; min?: number; max?: number; allowNegative?: boolean }[] = [
  { key: "baseRevenue", tab: "income", unit: "money", min: 0 },
  { key: "revenueGrowth", tab: "income", unit: "percent", min: 0, max: 500, allowNegative: true },
  { key: "cogsRate", tab: "income", unit: "percent", min: 0, max: 100 },
  { key: "opexRate", tab: "income", unit: "percent", min: 0, max: 100 },
  { key: "daRate", tab: "income", unit: "percent", min: 0, max: 100 },
  { key: "interestExpense", tab: "income", unit: "money", min: 0 },
  { key: "taxRate", tab: "income", unit: "percent", min: 0, max: 100 },
  { key: "startingCash", tab: "balance", unit: "money", min: 0 },
  { key: "startingPPE", tab: "balance", unit: "money", min: 0 },
  { key: "startingDebt", tab: "balance", unit: "money", min: 0 },
  { key: "capexRate", tab: "cashflow", unit: "percent", min: 0, max: 100 },
  { key: "arDays", tab: "cashflow", unit: "days", min: 0, max: 365 },
  { key: "apDays", tab: "cashflow", unit: "days", min: 0, max: 365 },
  { key: "debtRepayment", tab: "cashflow", unit: "money", min: 0 },
];

export default function FinancialModelChat({
  currency, name, setName, values, setValue, setTab, year5Revenue,
}: {
  currency: string;
  name: string;
  setName: (v: string) => void;
  values: Record<string, number>;
  setValue: (key: string, v: number) => void;
  setTab: (tab: Tab) => void;
  year5Revenue: number;
}) {
  const t = useTranslations("financialModel");

  const { questions, tabOf } = useMemo(() => {
    const tabOf: Record<string, Tab> = {};
    const sections: Record<Tab, string> = { income: t("chat.sectionIncome"), balance: t("chat.sectionBalance"), cashflow: t("chat.sectionCash") };
    const list: ChatQuestion[] = [
      { kind: "text", id: "name", ask: t("chat.askName"), current: name, apply: setName },
      ...FIELDS.map((f): ChatQuestion => {
        tabOf[f.key] = f.tab;
        return {
          kind: "amount", id: f.key, section: sections[f.tab], ask: t(`chat.ask.${f.key}` as Parameters<typeof t>[0]),
          current: values[f.key] ?? 0, unit: f.unit, min: f.min, max: f.max, allowNegative: f.allowNegative,
          apply: (v) => setValue(f.key, v),
        };
      }),
    ];
    return { questions: list, tabOf };
  }, [t, name, setName, values, setValue]);

  return (
    <GuidedChat
      questions={questions}
      currency={currency}
      title={t("chat.title")}
      openLabel={t("chat.open")}
      doneText={t("chat.done", { revenue: `${currency}${Math.round(year5Revenue).toLocaleString("en-GB")}` })}
      doneButton={t("chat.see")}
      onAsk={(q) => tabOf[q.id] && setTab(tabOf[q.id])}
    />
  );
}
