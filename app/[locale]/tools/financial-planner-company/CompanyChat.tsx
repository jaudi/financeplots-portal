"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import GuidedChat, { currencyQuestion, type ChatQuestion } from "@/components/GuidedChat";
import type { AmountUnit } from "@/lib/guided-chat";
import type { SheetValues } from "@/lib/spreadsheet-io";

// The company Financial Journey's questions for GuidedChat, step by step:
// P&L, cash flow, balance sheet, valuation. Each question moves the page to
// its step, so the charts behind the panel change as you answer, and any step
// can be skipped in one tap.

/** One input: its key in the page's values (and in `chatAsk`), its step and unit. */
const FIELDS: { key: string; step: number; unit: AmountUnit; min?: number; max?: number }[] = [
  { key: "revenue", step: 1, unit: "money" },
  { key: "cogs", step: 1, unit: "money" },
  { key: "salaries", step: 1, unit: "money" },
  { key: "rent", step: 1, unit: "money" },
  { key: "marketing", step: 1, unit: "money" },
  { key: "software", step: 1, unit: "money" },
  { key: "otherOpex", step: 1, unit: "money" },
  { key: "da", step: 1, unit: "money" },
  { key: "interest", step: 1, unit: "money" },
  { key: "taxRate", step: 1, unit: "percent", min: 0, max: 100 },
  { key: "arDays", step: 2, unit: "days", min: 0, max: 365 },
  { key: "apDays", step: 2, unit: "days", min: 0, max: 365 },
  { key: "invDays", step: 2, unit: "days", min: 0, max: 365 },
  { key: "capex", step: 2, unit: "money" },
  { key: "debtRepay", step: 2, unit: "money" },
  { key: "bsCash", step: 3, unit: "money" },
  { key: "otherCurrentAssets", step: 3, unit: "money" },
  { key: "fixedAssets", step: 3, unit: "money" },
  { key: "stDebt", step: 3, unit: "money" },
  { key: "ltDebt", step: 3, unit: "money" },
  { key: "otherLiabilities", step: 3, unit: "money" },
  { key: "evEbitdaMult", step: 4, unit: "multiple", min: 0, max: 100 },
  { key: "revMult", step: 4, unit: "multiple", min: 0, max: 100 },
  { key: "peMult", step: 4, unit: "multiple", min: 0, max: 100 },
  { key: "discountRate", step: 4, unit: "percent", min: 0, max: 50 },
  { key: "termGrowth", step: 4, unit: "percent", min: 0, max: 10 },
];

export default function CompanyChat({
  currency, setCurrency, values, setValue, stepLabels, setStep,
}: {
  currency: string;
  setCurrency: (c: string) => void;
  values: SheetValues;
  setValue: (key: string, v: number) => void;
  /** The step names, first step first — used as the chat's sections. */
  stepLabels: string[];
  setStep: (s: number) => void;
}) {
  const t = useTranslations("companyPlanner");

  const { questions, stepOf } = useMemo(() => {
    const stepOf: Record<string, number> = { currency: 1 };
    const list: ChatQuestion[] = [
      currencyQuestion(t("chatAskCurrency"), setCurrency),
      ...FIELDS.map((f): ChatQuestion => {
        stepOf[f.key] = f.step;
        return {
          kind: "amount", id: f.key, section: stepLabels[f.step - 1],
          ask: t(`chatAsk.${f.key}` as Parameters<typeof t>[0]),
          current: typeof values[f.key] === "number" ? (values[f.key] as number) : 0, unit: f.unit, min: f.min ?? 0, max: f.max,
          apply: (v) => setValue(f.key, v),
        };
      }),
    ];
    return { questions: list, stepOf };
  }, [t, setCurrency, values, setValue, stepLabels]);

  return (
    <GuidedChat
      questions={questions}
      currency={currency}
      title={t("chatTitle")}
      openLabel={t("chatOpen")}
      doneText={t("chatDone")}
      doneButton={t("chatSeeResult")}
      onAsk={(q) => setStep(stepOf[q.id] ?? 1)}
      onDone={() => setStep(5)}
    />
  );
}
