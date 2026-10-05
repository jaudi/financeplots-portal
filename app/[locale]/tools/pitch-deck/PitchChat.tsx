"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import GuidedChat, { currencyQuestion, type ChatQuestion } from "@/components/GuidedChat";
import { useCurrency } from "@/components/CurrencyPicker";
import { COMPETITORS, type PitchData, type SlideKey } from "@/lib/pitch-deck";
import { splitList } from "@/lib/guided-chat";

// The Pitch Deck's questions for GuidedChat, slide by slide (the executive
// summary and the titles are built from the answers, so they aren't asked). Founders tell a
// story more easily than they fill in boxes, so each answer is a sentence or a
// short list. Lists ("one per line" on the page) are given on one line,
// separated by commas. Each question opens its slide's tab, any slide can be
// skipped, and the chat ends with the download.

export type PitchChatData = PitchData;

const ROUNDS = [
  { value: "Pre-seed", words: ["pre seed", "preseed", "presemilla"] },
  { value: "Seed", words: ["semilla"] },
  { value: "Series A", words: ["serie a"] },
  { value: "Series B", words: ["serie b"] },
  { value: "Bridge / Convertible", words: ["bridge", "convertible", "puente"] },
];

/** A one-per-line field shown and answered as a comma list. */
const asList = (lines: string) => lines.split("\n").map((s) => s.trim()).filter(Boolean).join(", ");
const toLines = (answer: string) => splitList(answer).join("\n");

export default function PitchChat({
  data, set, setSlide, sym, download,
}: {
  data: PitchChatData;
  /** Replace part of the deck's data. */
  set: (patch: Partial<PitchChatData>) => void;
  /** Open a slide's tab. */
  setSlide: (k: SlideKey) => void;
  sym: string;
  download: () => void;
}) {
  const t = useTranslations("pitchChat");
  const [, setCurrency] = useCurrency();

  const { questions, slideOf } = useMemo(() => {
    const slideOf: Record<string, SlideKey> = {};
    const list: ChatQuestion[] = [];
    const add = (slide: SlideKey, q: ChatQuestion) => {
      slideOf[q.id] = slide;
      list.push({ ...q, section: t(`section.${slide}` as Parameters<typeof t>[0]) });
    };
    // Replace item i of an array field.
    const at = <T,>(arr: T[], i: number, item: T) => arr.map((x, j) => (j === i ? item : x));
    // "None" for item i ends the list: it and every later item are emptied, so
    // no example left in a later slot reaches the deck.
    const endAt = <T,>(arr: T[], i: number, empty: T) => arr.map((x, j) => (j >= i ? empty : x));

    // 1 · Cover
    add("cover", { kind: "text", id: "company", ask: t("askCompany"), current: data.company, apply: (v) => set({ company: v }) });
    add("cover", { kind: "text", id: "tagline", ask: t("askTagline"), current: data.tagline, apply: (v) => set({ tagline: v }) });
    add("cover", { kind: "text", id: "industry", ask: t("askIndustry"), current: data.industry, apply: (v) => set({ industry: v }) });
    add("cover", currencyQuestion(t("askCurrency"), setCurrency));

    // 2 · Problem: two named problems, a third if they have one.
    data.problems.forEach((p, i) => {
      const optional = i >= 2;
      add("problem", {
        kind: "text", id: `problem-${i}`, ask: t(optional ? "askProblemOptional" : "askProblem", { n: i + 1 }), current: p.label, optional,
        apply: (v) => set({ problems: v ? at(data.problems, i, { ...p, label: v }) : endAt(data.problems, i, { label: "", desc: "" }) }),
      });
      add("problem", {
        kind: "text", id: `problem-desc-${i}`, ask: t("askProblemDesc", { item: p.label }), current: p.desc,
        apply: (v) => set({ problems: at(data.problems, i, { ...p, desc: v }) }), skip: () => !data.problems[i].label,
      });
    });

    // 3 · Solution
    add("solution", { kind: "text", id: "solution", ask: t("askSolution"), current: data.solNarrative, apply: (v) => set({ solNarrative: v }) });
    add("solution", {
      kind: "text", id: "diffs", ask: t("askDiffs"), current: data.differentiators.filter(Boolean).join(", "),
      apply: (v) => set({ differentiators: [...splitList(v), "", "", ""].slice(0, 3) }),
    });

    // Why now
    add("whyNow", { kind: "text", id: "why-now", ask: t("askWhyNow"), current: asList(data.whyNow), apply: (v) => set({ whyNow: toLines(v) }) });

    // 4 · Market
    add("market", { kind: "amount", id: "tam", ask: t("askTam", { sym }), current: data.tamVal, unit: "decimal", min: 0, max: 100_000, apply: (v) => set({ tamVal: v }) });
    add("market", { kind: "amount", id: "sam", ask: t("askSam", { sym }), current: data.samVal, unit: "decimal", min: 0, max: 100_000, apply: (v) => set({ samVal: v }) });
    add("market", { kind: "amount", id: "som", ask: t("askSom", { sym }), current: data.somVal, unit: "decimal", min: 0, max: 1_000_000, apply: (v) => set({ somVal: v }) });
    add("market", { kind: "text", id: "market-note", ask: t("askMarketNote"), current: data.mktNarrative, optional: true, apply: (v) => set({ mktNarrative: v }) });
    add("market", { kind: "text", id: "market-source", ask: t("askMarketSource"), current: data.mktSource, optional: true, apply: (v) => set({ mktSource: v }) });

    // Competition: the names; which criteria each meets is ticked on the page.
    add("competition", {
      kind: "text", id: "competitors", ask: t("askCompetitors"), current: data.competitors.map((c) => c.name).filter(Boolean).join(", "), optional: true,
      apply: (v) => {
        const names = [...splitList(v), ...Array(COMPETITORS).fill("")].slice(0, COMPETITORS);
        set({ competitors: data.competitors.map((c, i) => ({ ...c, name: names[i] })) });
      },
    });

    // 5 · Business model
    add("model", { kind: "text", id: "streams", ask: t("askRevStreams"), current: asList(data.revStreams), apply: (v) => set({ revStreams: toLines(v) }) });
    add("model", { kind: "text", id: "pricing", ask: t("askPricing"), current: asList(data.pricing), optional: true, apply: (v) => set({ pricing: toLines(v) }) });

    // 6 · Traction: up to four key numbers; "none" ends the list.
    data.kpis.forEach((k, i) => {
      const earlierBlank = () => data.kpis.slice(0, i).some((x) => !x.label);
      add("traction", {
        kind: "text", id: `kpi-${i}`, ask: t("askKpiLabel", { n: i + 1 }), current: k.label, optional: true,
        apply: (v) => set({ kpis: v ? at(data.kpis, i, { ...k, label: v }) : endAt(data.kpis, i, { label: "", value: "" }) }), skip: earlierBlank,
      });
      add("traction", {
        kind: "text", id: `kpi-value-${i}`, ask: t("askKpiValue", { item: k.label }), current: k.value,
        apply: (v) => set({ kpis: at(data.kpis, i, { ...k, value: v }) }), skip: () => earlierBlank() || !data.kpis[i].label,
      });
    });
    add("traction", { kind: "text", id: "milestones", ask: t("askMilestones"), current: asList(data.milestones), optional: true, apply: (v) => set({ milestones: toLines(v) }) });

    // Unit economics
    add("unitEconomics", { kind: "amount", id: "arpa", ask: t("askArpa", { sym }), current: data.arpa, unit: "money", min: 0, apply: (v) => set({ arpa: v }) });
    add("unitEconomics", { kind: "amount", id: "gross-margin", ask: t("askGrossMargin"), current: data.grossMarginPct, unit: "percent", min: 0, max: 100, apply: (v) => set({ grossMarginPct: v }) });
    add("unitEconomics", { kind: "amount", id: "churn", ask: t("askChurn"), current: data.churnPct, unit: "percent", min: 0, max: 100, apply: (v) => set({ churnPct: v }) });
    add("unitEconomics", { kind: "amount", id: "cac", ask: t("askCac", { sym }), current: data.cac, unit: "money", min: 0, apply: (v) => set({ cac: v }) });

    // 7 · Financials: five years of revenue and EBITDA (a loss is negative).
    data.revVals.forEach((r, i) => {
      add("financials", {
        kind: "amount", id: `rev-${i}`, ask: t("askRevenue", { n: i + 1 }), current: r, unit: "money", min: 0,
        apply: (v) => set({ revVals: at(data.revVals, i, v) }),
      });
      add("financials", {
        kind: "amount", id: `profit-${i}`, ask: t(i === 0 ? "askProfitFirst" : "askProfit", { n: i + 1 }), current: data.profVals[i], unit: "money", allowNegative: true,
        apply: (v) => set({ profVals: at(data.profVals, i, v) }),
      });
    });

    add("financials", { kind: "text", id: "assumptions", ask: t("askAssumptions"), current: asList(data.assumptions), optional: true, apply: (v) => set({ assumptions: toLines(v) }) });

    // 8 · Team: up to four people; "none" ends the list after the first.
    data.team.forEach((m, i) => {
      const earlierBlank = () => data.team.slice(0, i).some((x) => !x.name);
      const gone = () => earlierBlank() || !data.team[i].name;
      add("team", {
        kind: "text", id: `member-${i}`, ask: t(i === 0 ? "askMemberFirst" : "askMember", { n: i + 1 }), current: m.name, optional: i > 0,
        apply: (v) => set({ team: v ? at(data.team, i, { ...m, name: v }) : endAt(data.team, i, { name: "", role: "", bio: "" }) }), skip: earlierBlank,
      });
      add("team", {
        kind: "text", id: `member-role-${i}`, ask: t("askMemberRole", { name: m.name }), current: m.role,
        apply: (v) => set({ team: at(data.team, i, { ...m, role: v }) }), skip: gone,
      });
      add("team", {
        kind: "text", id: `member-bio-${i}`, ask: t("askMemberBio", { name: m.name }), current: m.bio, optional: true,
        apply: (v) => set({ team: at(data.team, i, { ...m, bio: v }) }), skip: gone,
      });
    });

    // 9 · The ask
    add("ask", { kind: "amount", id: "funding", ask: t("askFunding", { sym }), current: data.fundingAmt, unit: "money", min: 0, apply: (v) => set({ fundingAmt: v }) });
    add("ask", {
      kind: "choice", id: "round", ask: t("askRound"),
      options: ROUNDS.map((r) => ({ label: r.value, words: r.words, apply: () => set({ fundingType: r.value }) })),
    });
    add("ask", { kind: "amount", id: "runway", ask: t("askRunway"), current: data.runwayMonths, unit: "number", min: 0, max: 60, apply: (v) => set({ runwayMonths: Math.round(v) }) });
    add("ask", { kind: "text", id: "achieve", ask: t("askAchieve"), current: asList(data.achieveText), apply: (v) => set({ achieveText: toLines(v) }) });
    data.useOfFunds.forEach((u, i) => {
      const earlierBlank = () => data.useOfFunds.slice(0, i).some((x) => !x.label);
      add("ask", {
        kind: "text", id: `funds-${i}`, ask: t(i === 0 ? "askFundsFirst" : "askFunds", { n: i + 1 }), current: u.label, optional: i > 0,
        apply: (v) => set({ useOfFunds: v ? at(data.useOfFunds, i, { ...u, label: v }) : endAt(data.useOfFunds, i, { label: "", pct: 0 }) }), skip: earlierBlank,
      });
      add("ask", {
        kind: "amount", id: `funds-pct-${i}`, ask: t("askFundsPct", { item: u.label }), current: u.pct, unit: "percent", min: 0, max: 100,
        apply: (v) => set({ useOfFunds: at(data.useOfFunds, i, { ...u, pct: v }) }), skip: () => earlierBlank() || !data.useOfFunds[i].label,
      });
    });

    // Contact
    add("closing", { kind: "text", id: "contact-email", ask: t("askContact"), current: data.contactEmail, optional: true, apply: (v) => set({ contactEmail: v }) });

    return { questions: list, slideOf };
  }, [t, data, set, sym, setCurrency]);

  const fundsTotal = data.useOfFunds.reduce((s, u) => s + (u.label ? u.pct : 0), 0);
  return (
    <GuidedChat
      questions={questions}
      currency={sym}
      title={t("title")}
      openLabel={t("open")}
      doneText={fundsTotal === 100 || fundsTotal === 0 ? t("done") : t("doneFundsOff", { total: fundsTotal })}
      doneButton={t("download")}
      doneAction={download}
      onAsk={(q) => setSlide(slideOf[q.id] ?? "cover")}
    />
  );
}
