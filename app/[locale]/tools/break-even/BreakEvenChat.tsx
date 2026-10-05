"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import GuidedChat, { type ChatQuestion } from "@/components/GuidedChat";

// Break-even's questions for GuidedChat: the fixed costs of a period, then the
// price, the cost of each unit and how many sell. Ends with the break-even point.

export const FIXED_KEYS = ["rent", "payroll", "insurance", "depreciation", "marketing", "other"] as const;
export type FixedKey = (typeof FIXED_KEYS)[number];

export default function BreakEvenChat({
  currency, name, setName, fixed, setFixed, price, setPrice, unitCost, setUnitCost, units, setUnits, bepUnits,
}: {
  currency: string;
  name: string;
  setName: (v: string) => void;
  fixed: Record<FixedKey, number>;
  setFixed: (key: FixedKey, v: number) => void;
  price: number;
  setPrice: (v: number) => void;
  unitCost: number;
  setUnitCost: (v: number) => void;
  units: number;
  setUnits: (v: number) => void;
  /** null when the price does not cover the cost of a unit. */
  bepUnits: number | null;
}) {
  const t = useTranslations("breakEven");

  const questions = useMemo((): ChatQuestion[] => {
    const costs = t("sectionFixed");
    const sales = t("sectionRevenue");
    return [
      { kind: "text", id: "name", ask: t("chat.askName"), current: name, apply: setName },
      ...FIXED_KEYS.map((k): ChatQuestion => ({
        kind: "amount", id: k, section: costs, ask: t(`chat.ask.${k}` as Parameters<typeof t>[0]),
        current: fixed[k], unit: "money", min: 0, apply: (v) => setFixed(k, v),
      })),
      { kind: "amount", id: "price", section: sales, ask: t("chat.ask.price"), current: price, unit: "price", min: 0, apply: setPrice },
      { kind: "amount", id: "unitCost", section: sales, ask: t("chat.ask.unitCost"), current: unitCost, unit: "price", min: 0, apply: setUnitCost },
      { kind: "amount", id: "units", section: sales, ask: t("chat.ask.units"), current: units, unit: "number", min: 0, apply: setUnits },
    ];
  }, [t, name, setName, fixed, setFixed, price, setPrice, unitCost, setUnitCost, units, setUnits]);

  return (
    <GuidedChat
      questions={questions}
      currency={currency}
      title={t("chat.title")}
      openLabel={t("chat.open")}
      doneText={bepUnits === null ? t("chat.doneNoMargin") : t("chat.done", { units: Math.ceil(bepUnits).toLocaleString("en-GB") })}
      doneButton={t("chat.see")}
    />
  );
}
