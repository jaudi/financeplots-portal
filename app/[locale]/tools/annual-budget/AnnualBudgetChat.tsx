"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import GuidedChat, { type ChatQuestion } from "@/components/GuidedChat";

// The Annual Budget's questions for GuidedChat: the company and year, a normal
// month's revenue, whether sales follow the seasons (and if so, each month
// against a normal one), then costs as a share of revenue.

export default function AnnualBudgetChat({
  currency, name, setName, year, setYear, baseRevenue, setBaseRevenue, seasonal, setSeasonal, seasonality, setMonth,
  cogsRate, setCogsRate, opexRate, setOpexRate, taxRate, setTaxRate, netIncome,
}: {
  currency: string;
  name: string;
  setName: (v: string) => void;
  year: number;
  setYear: (v: number) => void;
  baseRevenue: number;
  setBaseRevenue: (v: number) => void;
  seasonal: boolean;
  setSeasonal: (v: boolean) => void;
  /** Twelve multipliers, January first: 1 = a normal month. */
  seasonality: number[];
  setMonth: (i: number, v: number) => void;
  cogsRate: number;
  setCogsRate: (v: number) => void;
  opexRate: number;
  setOpexRate: (v: number) => void;
  taxRate: number;
  setTaxRate: (v: number) => void;
  netIncome: number;
}) {
  const t = useTranslations("annualBudget");
  const locale = useLocale();

  const questions = useMemo((): ChatQuestion[] => {
    const seasons = t("chat.sectionSeasons");
    const costs = t("chat.sectionCosts");
    const monthName = (i: number) => new Date(2026, i, 1).toLocaleString(locale === "es" ? "es-ES" : "en-GB", { month: "long" });
    return [
      { kind: "text", id: "name", ask: t("chat.askName"), current: name, apply: setName },
      { kind: "amount", id: "year", ask: t("chat.askYear"), current: year, unit: "number", min: 2000, max: 2100, apply: setYear },
      { kind: "amount", id: "revenue", ask: t("chat.askRevenue"), current: baseRevenue, unit: "money", min: 0, apply: setBaseRevenue },
      {
        kind: "choice", id: "seasonal", section: seasons, ask: t("chat.askSeasonal"),
        options: [
          { label: t("chat.flat"), words: ["flat", "same", "steady", "even", "no", "igual", "plano", "estable"], apply: () => setSeasonal(false) },
          { label: t("chat.seasonal"), words: ["seasonal", "seasons", "busier", "yes", "estacional", "temporada", "si"], apply: () => setSeasonal(true) },
        ],
      },
      ...seasonality.map((m, i): ChatQuestion => ({
        kind: "amount", id: `month-${i}`, section: seasons, ask: i === 0 ? t("chat.askFirstMonth", { month: monthName(i) }) : t("chat.askMonth", { month: monthName(i) }),
        current: m, unit: "decimal", min: 0, max: 10, apply: (v) => setMonth(i, v), skip: () => !seasonal,
      })),
      { kind: "amount", id: "cogs", section: costs, ask: t("chat.askCogs"), current: cogsRate, unit: "percent", min: 0, max: 100, apply: setCogsRate },
      { kind: "amount", id: "opex", section: costs, ask: t("chat.askOpex"), current: opexRate, unit: "percent", min: 0, max: 100, apply: setOpexRate },
      { kind: "amount", id: "tax", section: costs, ask: t("chat.askTax"), current: taxRate, unit: "percent", min: 0, max: 100, apply: setTaxRate },
    ];
  }, [t, locale, name, setName, year, setYear, baseRevenue, setBaseRevenue, setSeasonal, seasonal, seasonality, setMonth, cogsRate, setCogsRate, opexRate, setOpexRate, taxRate, setTaxRate]);

  const profit = `${netIncome < 0 ? "−" : ""}${currency}${Math.abs(Math.round(netIncome)).toLocaleString("en-GB")}`;
  return (
    <GuidedChat
      questions={questions}
      currency={currency}
      title={t("chat.title")}
      openLabel={t("chat.open")}
      doneText={t("chat.done", { year, profit })}
      doneButton={t("chat.see")}
    />
  );
}
