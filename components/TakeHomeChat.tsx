"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import GuidedChat, { type ChatOption, type ChatQuestion } from "@/components/GuidedChat";
import { STUDENT_LOAN_THRESHOLDS, type PensionMethod, type StudentLoanPlan, type UkRegion } from "@/lib/calculators";

// Take-Home Pay's questions for GuidedChat. The page is English on every
// locale (it is about UK tax), but the chat speaks the visitor's language like
// the other chats. It ends with a door into the Personal Budget, whose own
// chat opens with this take-home already filled in.

type Mode = "salary" | "target";

export interface TakeHomeChatApi {
  mode: Mode;
  salary: number;
  target: number;
  pensionPct: number;
  /** Monthly take-home for the answers so far. */
  takeHomeMonthly: number;
  setMode: (m: Mode) => void;
  setSalary: (v: number) => void;
  setTarget: (v: number) => void;
  setRegion: (r: UkRegion) => void;
  setPensionPct: (v: number) => void;
  setPensionMethod: (m: PensionMethod) => void;
  setLoan: (l: StudentLoanPlan | "none") => void;
  setPostgrad: (v: boolean) => void;
}

const PLAN_WORDS: Record<StudentLoanPlan, string[]> = {
  plan1: ["1", "one", "uno"],
  plan2: ["2", "two", "dos"],
  plan4: ["4", "four", "cuatro"],
  plan5: ["5", "five", "cinco"],
};
const NONE = ["none", "no", "nothing", "ninguno", "ninguna", "nada"];
const YES = ["yes", "yeah", "si", "claro"];

export default function TakeHomeChat({ api }: { api: TakeHomeChatApi }) {
  const t = useTranslations("takeHomeChat");

  const questions = useMemo((): ChatQuestion[] => {
    const yesNo = (apply: (v: boolean) => void): ChatOption[] => [
      { label: t("yes"), words: YES, apply: () => apply(true) },
      { label: t("no"), words: NONE, apply: () => apply(false) },
    ];
    return [
      {
        kind: "choice", id: "mode", ask: t("askMode"),
        options: [
          { label: t("modeSalary"), words: ["salary", "gross", "salario", "sueldo", "bruto"], apply: () => api.setMode("salary") },
          { label: t("modeTarget"), words: ["take home", "take-home", "want", "net", "neto", "quiero", "cobrar"], apply: () => api.setMode("target") },
        ],
      },
      {
        kind: "amount", id: "salary", ask: t("askSalary"), current: api.salary, unit: "money", min: 0, max: 10_000_000,
        apply: api.setSalary, skip: () => api.mode !== "salary",
      },
      {
        kind: "amount", id: "target", ask: t("askTarget"), current: api.target, unit: "money", min: 0, max: 500_000,
        apply: api.setTarget, skip: () => api.mode !== "target",
      },
      {
        kind: "choice", id: "region", ask: t("askRegion"),
        options: [
          { label: t("regionRest"), words: ["england", "wales", "northern ireland", "inglaterra", "gales", "irlanda"], apply: () => api.setRegion("england_wales_ni") },
          { label: t("regionScotland"), words: ["scotland", "scottish", "escocia"], apply: () => api.setRegion("scotland") },
        ],
      },
      { kind: "amount", id: "pension", ask: t("askPension"), current: api.pensionPct, unit: "percent", min: 0, max: 100, apply: api.setPensionPct },
      {
        kind: "choice", id: "pension-method", ask: t("askPensionMethod"), skip: () => api.pensionPct === 0,
        options: [
          { label: t("methodSacrifice"), words: ["sacrifice", "sacrificio"], apply: () => api.setPensionMethod("salary_sacrifice") },
          { label: t("methodNetPay"), words: ["net pay", "neto"], apply: () => api.setPensionMethod("net_pay") },
          { label: t("methodRelief"), words: ["relief", "source", "origen"], apply: () => api.setPensionMethod("relief_at_source") },
        ],
      },
      {
        kind: "choice", id: "loan", ask: t("askLoan"),
        options: [
          { label: t("none"), words: NONE, apply: () => api.setLoan("none") },
          ...(Object.keys(STUDENT_LOAN_THRESHOLDS) as StudentLoanPlan[]).map((p) => ({
            label: p.replace("plan", "Plan "), words: PLAN_WORDS[p], apply: () => api.setLoan(p),
          })),
        ],
      },
      { kind: "choice", id: "postgrad", ask: t("askPostgrad"), options: yesNo(api.setPostgrad) },
    ];
  }, [t, api]);

  const monthly = Math.round(api.takeHomeMonthly);
  return (
    <GuidedChat
      questions={questions}
      currency="£"
      title={t("title")}
      openLabel={t("open")}
      doneText={t("done", { amount: `£${monthly.toLocaleString("en-GB")}` })}
      doneButton={t("toBudget")}
      doneHref={`/tools/personal-budget?salary=${monthly}&chat=1`}
    />
  );
}
