"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import GuidedChat, { type ChatOption, type ChatQuestion } from "@/components/GuidedChat";
import { INDUSTRIES, type Industry } from "@/lib/calculators";
import type { AmountUnit } from "@/lib/guided-chat";

// Business Valuation's questions for GuidedChat. The industry comes first:
// picking one fills in its Damodaran multiples (as the page's selector does),
// so the multiple questions then show those figures. A loss, net cash (a
// negative net debt) and shrinking sales can all be said.

const FIELDS: { key: string; section: "figures" | "rates" | "multiples"; unit: AmountUnit; min?: number; max?: number; allowNegative?: boolean }[] = [
  { key: "revenue", section: "figures", unit: "money", min: 0 },
  { key: "ebitda", section: "figures", unit: "money", allowNegative: true },
  { key: "netIncome", section: "figures", unit: "money", allowNegative: true },
  { key: "fcf", section: "figures", unit: "money", allowNegative: true },
  { key: "netDebt", section: "figures", unit: "money", allowNegative: true },
  { key: "growthRate", section: "rates", unit: "percent", min: 0, max: 200, allowNegative: true },
  { key: "discountRate", section: "rates", unit: "percent", min: 0, max: 50 },
  { key: "terminalGrowth", section: "rates", unit: "percent", min: 0, max: 10, allowNegative: true },
  { key: "ebitdaMultiple", section: "multiples", unit: "multiple", min: 0, max: 200 },
  { key: "evSalesMultiple", section: "multiples", unit: "multiple", min: 0, max: 200 },
  { key: "peRatio", section: "multiples", unit: "multiple", min: 0, max: 500 },
];

const SKIP_WORDS = new Set(["and", "other", "services", "products", "business", "general"]);

/** Words to pick an industry by voice: the distinctive words of its name. */
function industryWords(ind: Industry): string[] {
  return ind.label.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3 && !SKIP_WORDS.has(w));
}

export default function ValuationChat({
  currency, name, setName, applyIndustry, values, setValue, average,
}: {
  currency: string;
  name: string;
  setName: (v: string) => void;
  applyIndustry: (ind: Industry) => void;
  values: Record<string, number>;
  setValue: (key: string, v: number) => void;
  /** The average of the methods that apply, or null when none does. */
  average: number | null;
}) {
  const t = useTranslations("valuation");

  const questions = useMemo((): ChatQuestion[] => {
    const sections = { figures: t("chat.sectionFigures"), rates: t("chat.sectionRates"), multiples: t("chat.sectionMultiples") };
    const industries: ChatOption[] = [
      { label: t("chat.noIndustry"), words: ["none", "skip", "ninguno", "ninguna", "saltar"], apply: () => {} },
      ...INDUSTRIES.map((ind) => ({ label: ind.label, words: industryWords(ind), apply: () => applyIndustry(ind) })),
    ];
    return [
      { kind: "text", id: "name", ask: t("chat.askName"), current: name, apply: setName },
      { kind: "choice", id: "industry", ask: t("chat.askIndustry"), options: industries },
      ...FIELDS.map((f): ChatQuestion => ({
        kind: "amount", id: f.key, section: sections[f.section], ask: t(`chat.ask.${f.key}` as Parameters<typeof t>[0]),
        current: values[f.key] ?? 0, unit: f.unit, min: f.min, max: f.max, allowNegative: f.allowNegative,
        apply: (v) => setValue(f.key, v),
      })),
    ];
  }, [t, name, setName, applyIndustry, values, setValue]);

  return (
    <GuidedChat
      questions={questions}
      currency={currency}
      title={t("chat.title")}
      openLabel={t("chat.open")}
      doneText={average === null ? t("chat.doneNone") : t("chat.done", { value: `${currency}${Math.round(average).toLocaleString("en-GB")}` })}
      doneButton={t("chat.see")}
    />
  );
}
