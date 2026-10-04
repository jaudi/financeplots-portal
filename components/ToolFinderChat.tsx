"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import GuidedChat, { type ChatQuestion } from "@/components/GuidedChat";
import { GOALS, WHO, type Audience } from "@/lib/tool-finder";

// "Which tool do I need?" on the homepage and /tools: two questions (who it is
// for, then what they want to know) and a door to the one tool that answers
// it. Tool names and descriptions come from `tools.catalog`, so they match
// the menus. Goals are offered in a fixed order and nothing is recommended
// beyond the visitor's own answer.

export default function ToolFinderChat() {
  const t = useTranslations("toolFinder");
  const tc = useTranslations("tools.catalog");
  const [audience, setAudience] = useState<Audience>("personal");
  const [slug, setSlug] = useState<string | null>(null);

  // The second question follows the first answer, so only two are ever counted.
  const questions = useMemo((): ChatQuestion[] => [
    {
      kind: "choice", id: "who", ask: t("askWho"),
      options: [
        { label: t("whoPersonal"), ...WHO.personal, apply: () => setAudience("personal") },
        { label: t("whoBusiness"), ...WHO.business, apply: () => setAudience("business") },
      ],
    },
    {
      kind: "choice", id: `goal-${audience}`, ask: t(audience === "personal" ? "askGoalPersonal" : "askGoalBusiness"),
      options: GOALS[audience].map((g) => ({
        label: t(`goal.${g.key}` as Parameters<typeof t>[0]), words: g.words, apply: () => setSlug(g.slug),
      })),
    },
  ], [t, audience]);

  const name = slug ? tc(`${slug}.name` as Parameters<typeof tc>[0]) : "";
  return (
    <GuidedChat
      questions={questions}
      currency=""
      title={t("title")}
      openLabel={t("open")}
      doneText={slug ? t("done", { name, desc: tc(`${slug}.desc` as Parameters<typeof tc>[0]) }) : ""}
      doneButton={t("go", { name })}
      doneHref={slug ? `/tools/${slug}` : "/tools"}
    />
  );
}
