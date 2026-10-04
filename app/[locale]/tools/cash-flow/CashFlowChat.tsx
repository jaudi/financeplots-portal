"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import GuidedChat, { type ChatQuestion } from "@/components/GuidedChat";

// The 13-week Cash Flow's questions for GuidedChat: the cash today, then a
// typical week in and out and how each changes week by week. Every answer
// refills all 13 weeks (as the page's quick-setup button does), so the
// closing message can give the lowest balance.

export default function CashFlowChat({
  name, setName, opening, setOpening, inflow, inflowGrowth, outflow, outflowGrowth, setInflows, setOutflows, minBalance,
}: {
  name: string;
  setName: (v: string) => void;
  opening: number;
  setOpening: (v: number) => void;
  inflow: number;
  inflowGrowth: number;
  outflow: number;
  outflowGrowth: number;
  /** Fill all 13 weeks from week 1 and a weekly % change, and remember both. */
  setInflows: (week1: number, growthPct: number) => void;
  setOutflows: (week1: number, growthPct: number) => void;
  minBalance: number;
}) {
  const t = useTranslations("cashFlow");

  const questions = useMemo((): ChatQuestion[] => [
    { kind: "text", id: "name", ask: t("chat.askName"), current: name, apply: setName },
    { kind: "amount", id: "opening", ask: t("chat.askOpening"), current: opening, unit: "money", allowNegative: true, apply: setOpening },
    { kind: "amount", id: "inflow", ask: t("chat.askInflow"), current: inflow, unit: "money", min: 0, apply: (v) => setInflows(v, inflowGrowth) },
    { kind: "amount", id: "inflowGrowth", ask: t("chat.askInflowGrowth"), current: inflowGrowth, unit: "percent", allowNegative: true, min: 0, max: 50, apply: (v) => setInflows(inflow, v) },
    { kind: "amount", id: "outflow", ask: t("chat.askOutflow"), current: outflow, unit: "money", min: 0, apply: (v) => setOutflows(v, outflowGrowth) },
    { kind: "amount", id: "outflowGrowth", ask: t("chat.askOutflowGrowth"), current: outflowGrowth, unit: "percent", allowNegative: true, min: 0, max: 50, apply: (v) => setOutflows(outflow, v) },
  ], [t, name, setName, opening, setOpening, inflow, inflowGrowth, outflow, outflowGrowth, setInflows, setOutflows]);

  const lowest = `${minBalance < 0 ? "−" : ""}£${Math.abs(Math.round(minBalance)).toLocaleString("en-GB")}`;
  return (
    <GuidedChat
      questions={questions}
      currency="£"
      title={t("chat.title")}
      openLabel={t("chat.open")}
      doneText={t(minBalance < 0 ? "chat.doneNegative" : "chat.done", { lowest })}
      doneButton={t("chat.see")}
    />
  );
}
