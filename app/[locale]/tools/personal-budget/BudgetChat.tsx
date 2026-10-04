"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import GuidedChat, { currencyQuestion, type ChatQuestion } from "@/components/GuidedChat";

// The Personal Budget's questions for GuidedChat: currency, each income, then
// each spending line group by group — any group can be skipped in one tap.
// Asking about a group opens it in the sidebar, so the answer lands in view.
// Arriving from the Take-Home Pay chat (`fromTakeHome`), it opens by itself
// and skips the currency and salary it already knows.

export default function BudgetChat({
  currency, setCurrency, incomeItems, income, setIncome, groups, expenses, setExpense, openGroup, fromTakeHome = false,
}: {
  currency: string;
  setCurrency: (c: string) => void;
  incomeItems: { key: string; label: string }[];
  income: Record<string, number>;
  setIncome: (key: string, v: number) => void;
  groups: { category: string; label: string; items: { key: string; label: string }[] }[];
  expenses: Record<string, number>;
  setExpense: (key: string, v: number) => void;
  openGroup: (category: string) => void;
  fromTakeHome?: boolean;
}) {
  const t = useTranslations("personalBudget");

  const { questions, groupOf } = useMemo(() => {
    const groupOf: Record<string, string> = {};
    const incomeSection = t("chatSectionIncome");
    const list: ChatQuestion[] = [
      { ...currencyQuestion(t("chatAskCurrency"), setCurrency), skip: () => fromTakeHome },
      ...incomeItems.map((i): ChatQuestion => ({
        kind: "amount", id: `inc-${i.key}`, section: incomeSection, ask: t("chatAskIncome", { item: i.label.toLowerCase() }),
        current: income[i.key] ?? 0, unit: "money", apply: (v) => setIncome(i.key, v),
        skip: () => fromTakeHome && i.key === "salary",
      })),
      ...groups.flatMap((g) =>
        g.items.map((i): ChatQuestion => {
          groupOf[`exp-${i.key}`] = g.category;
          return {
            kind: "amount", id: `exp-${i.key}`, section: g.label, ask: t("chatAskExpense", { item: i.label.toLowerCase() }),
            current: expenses[i.key] ?? 0, unit: "money", apply: (v) => setExpense(i.key, v),
          };
        }),
      ),
    ];
    return { questions: list, groupOf };
  }, [t, setCurrency, incomeItems, income, setIncome, groups, expenses, setExpense, fromTakeHome]);

  return (
    <GuidedChat
      questions={questions}
      currency={currency}
      title={t("chatTitle")}
      openLabel={t("chatOpen")}
      doneText={t("chatDone")}
      doneButton={t("chatSeeResult")}
      onAsk={(q) => groupOf[q.id] && openGroup(groupOf[q.id])}
      startOpen={fromTakeHome}
      greeting={fromTakeHome ? t("chatFromTakeHome", { amount: `${currency}${(income.salary ?? 0).toLocaleString("en-GB")}` }) : undefined}
    />
  );
}
