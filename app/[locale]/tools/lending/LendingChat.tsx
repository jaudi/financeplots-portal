"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import GuidedChat, { type ChatQuestion } from "@/components/GuidedChat";

// The Lending calculator's questions for GuidedChat: a loan or a mortgage
// (which opens that tab), then the amount, rate and term — and for a
// mortgage, what your savings could earn instead, for the early-repayment
// comparison. Ends with the monthly payment and the total interest.

type Tab = "loan" | "mortgage";

export interface LendingChatApi {
  tab: Tab;
  setTab: (t: Tab) => void;
  loan: { amount: number; rate: number; years: number };
  setLoan: (patch: Partial<{ amount: number; rate: number; years: number }>) => void;
  mortgage: { amount: number; rate: number; years: number; savingsRate: number };
  setMortgage: (patch: Partial<{ amount: number; rate: number; years: number; savingsRate: number }>) => void;
  payment: number;
  totalInterest: number;
}

export default function LendingChat({ api, currency }: { api: LendingChatApi; currency: string }) {
  const t = useTranslations("lending");

  const questions = useMemo((): ChatQuestion[] => {
    const isLoan = () => api.tab === "loan";
    return [
      {
        kind: "choice", id: "kind", ask: t("chat.askKind"),
        options: [
          { label: t("chat.loan"), words: ["loan", "personal loan", "car", "prestamo", "coche"], apply: () => api.setTab("loan") },
          { label: t("chat.mortgage"), words: ["mortgage", "house", "home", "hipoteca", "casa", "piso", "vivienda"], apply: () => api.setTab("mortgage") },
        ],
      },
      { kind: "amount", id: "l-amount", ask: t("chat.askLoanAmount"), current: api.loan.amount, unit: "money", min: 0, apply: (v) => api.setLoan({ amount: v }), skip: () => !isLoan() },
      { kind: "amount", id: "l-rate", ask: t("chat.askRate"), current: api.loan.rate, unit: "percent", min: 0.1, max: 20, apply: (v) => api.setLoan({ rate: v }), skip: () => !isLoan() },
      { kind: "amount", id: "l-years", ask: t("chat.askYears"), current: api.loan.years, unit: "number", min: 1, max: 40, apply: (v) => api.setLoan({ years: v }), skip: () => !isLoan() },
      { kind: "amount", id: "m-amount", ask: t("chat.askMortgageAmount"), current: api.mortgage.amount, unit: "money", min: 0, apply: (v) => api.setMortgage({ amount: v }), skip: isLoan },
      { kind: "amount", id: "m-rate", ask: t("chat.askRate"), current: api.mortgage.rate, unit: "percent", min: 0.1, max: 20, apply: (v) => api.setMortgage({ rate: v }), skip: isLoan },
      { kind: "amount", id: "m-years", ask: t("chat.askYears"), current: api.mortgage.years, unit: "number", min: 1, max: 40, apply: (v) => api.setMortgage({ years: v }), skip: isLoan },
      { kind: "amount", id: "m-savings", ask: t("chat.askSavingsRate"), current: api.mortgage.savingsRate, unit: "percent", min: 0.1, max: 20, apply: (v) => api.setMortgage({ savingsRate: v }), skip: isLoan },
    ];
  }, [t, api]);

  const gbp = (n: number) => `${currency}${Math.round(n).toLocaleString("en-GB")}`;
  return (
    <GuidedChat
      questions={questions}
      currency={currency}
      title={t("chat.title")}
      openLabel={t("chat.open")}
      doneText={t(api.tab === "loan" ? "chat.doneLoan" : "chat.doneMortgage", { payment: gbp(api.payment), interest: gbp(api.totalInterest) })}
      doneButton={t("chat.see")}
    />
  );
}
