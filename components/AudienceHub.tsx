import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AUDIENCES, type Audience, type CatalogEntry } from "@/lib/audiences";

// The hub for one audience: its planner up top, then its tools by group.
// Individuals are blue, companies green — the same colours the planners use.
const THEME: Record<Audience, { label: string; card: string; badge: string; hover: string }> = {
  personal: {
    label: "text-blue-400",
    card: "from-blue-900/40 to-purple-900/20 border-blue-700/40 hover:border-blue-500",
    badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    hover: "group-hover:text-blue-300 hover:border-blue-600/60",
  },
  business: {
    label: "text-green-400",
    card: "from-green-900/40 to-teal-900/20 border-green-700/40 hover:border-green-500",
    badge: "bg-green-500/20 text-green-400 border-green-500/30",
    hover: "group-hover:text-green-300 hover:border-green-600/60",
  },
};

export default async function AudienceHub({ audience, locale }: { audience: Audience; locale: string }) {
  const t = await getTranslations({ locale, namespace: "audiences" });
  const tt = await getTranslations({ locale, namespace: "tools" });
  const catalog = tt.raw("catalog") as Record<string, CatalogEntry>;
  const a = AUDIENCES[audience];
  const theme = THEME[audience];
  const planner = catalog[a.planner];
  const other: Audience = audience === "personal" ? "business" : "personal";

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-center mb-6">
          <Link href="/tools" className="text-gray-500 hover:text-white text-sm transition">
            {t("chooserTitle")}
          </Link>
        </p>
        <p className={`${theme.label} text-xs font-bold uppercase tracking-widest text-center mb-3`}>
          {a.icon} {t(`${audience}.label`)}
        </p>
        <h1 className="text-4xl font-extrabold text-center mb-3">{t(`${audience}.title`)}</h1>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">{t(`${audience}.subtitle`)}</p>

        {/* The planner: the guided journey for this audience */}
        <Link
          href={`/tools/${a.planner}`}
          className={`block bg-gradient-to-br ${theme.card} border rounded-2xl p-7 mb-12 transition group`}
        >
          <div className="flex items-start gap-4">
            <span className="text-4xl shrink-0">{planner.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className={`text-white font-bold text-lg ${theme.hover} transition`}>{planner.name}</h2>
                <span className={`text-xs border px-2 py-0.5 rounded-full font-semibold ${theme.badge}`}>
                  {t("featuredBadge")}
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{planner.desc}</p>
            </div>
          </div>
        </Link>

        {a.groups.map(group => (
          <section key={group.key} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xl">{group.icon}</span>
              <div>
                <h2 className="text-white font-bold text-lg">{t(`${audience}.groups.${group.key}.title`)}</h2>
                <p className="text-gray-500 text-xs">{t(`${audience}.groups.${group.key}.subtitle`)}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {group.slugs.map(slug => {
                const tool = catalog[slug];
                return (
                  <Link
                    key={slug}
                    href={`/tools/${slug}`}
                    className={`bg-[#0d1426] border border-gray-800 ${theme.hover} rounded-2xl p-6 transition group block`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl shrink-0">{tool.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-white font-bold text-base mb-1 ${theme.hover} transition`}>{tool.name}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">{tool.desc}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        {/* The way across, for whoever landed on the wrong side */}
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-gray-500 text-sm">{t(`${audience}.otherSide`)}</p>
          <Link href={AUDIENCES[other].href} className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition">
            {t(`${audience}.otherSideCta`)}
          </Link>
        </div>
      </div>
    </main>
  );
}
