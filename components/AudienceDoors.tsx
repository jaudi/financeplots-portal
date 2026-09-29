"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { AUDIENCE_KEYS, AUDIENCES, audienceSlugs, type Audience, type CatalogEntry } from "@/lib/audiences";

// Two doors, one per audience — on /tools and the homepage. Each lists what
// is inside so the visitor can tell which side they belong on before clicking.
const CARD: Record<Audience, { card: string; label: string; title: string; chip: string }> = {
  personal: {
    card: "from-blue-900/40 to-purple-900/20 border-blue-700/40 hover:border-blue-500",
    label: "text-blue-400",
    title: "group-hover:text-blue-300",
    chip: "border-blue-700/30 text-blue-200/80",
  },
  business: {
    card: "from-green-900/40 to-teal-900/20 border-green-700/40 hover:border-green-500",
    label: "text-green-400",
    title: "group-hover:text-green-300",
    chip: "border-green-700/30 text-green-200/80",
  },
};

export default function AudienceDoors() {
  const t = useTranslations("audiences");
  const tt = useTranslations("tools");
  const catalog = tt.raw("catalog") as Record<string, CatalogEntry>;

  return (
    <div className="grid md:grid-cols-2 gap-5">
      {AUDIENCE_KEYS.map(audience => {
        const a = AUDIENCES[audience];
        const c = CARD[audience];
        const slugs = audienceSlugs(audience);
        return (
          <Link
            key={audience}
            href={a.href}
            className={`flex flex-col bg-gradient-to-br ${c.card} border rounded-2xl p-7 transition group`}
          >
            <span className="text-4xl mb-4">{a.icon}</span>
            <p className={`${c.label} text-xs font-bold uppercase tracking-widest mb-2`}>
              {t(`${audience}.label`)} · {t("toolsCount", { count: slugs.length })}
            </p>
            <h2 className={`text-white font-extrabold text-2xl mb-2 transition ${c.title}`}>{t(`${audience}.title`)}</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">{t(`${audience}.subtitle`)}</p>
            <ul className="flex flex-wrap gap-2 mb-6">
              {slugs.map(slug => (
                <li key={slug} className={`text-xs border rounded-full px-2.5 py-1 bg-black/20 ${c.chip}`}>
                  {catalog[slug].icon} {catalog[slug].name}
                </li>
              ))}
            </ul>
            <span className={`mt-auto ${c.label} text-sm font-semibold`}>{t("enter")}</span>
          </Link>
        );
      })}
    </div>
  );
}
