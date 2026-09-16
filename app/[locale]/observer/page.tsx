import type { Metadata } from "next";
import Link from "next/link";
import { formatDuration, formatEditionDate, listEditions, MOODS } from "@/lib/observer";

export const metadata: Metadata = {
  title: "The Observer — Weekly Macro Across the US, Europe and Asia",
  description:
    "A weekly read on the world economy: the news that mattered, inflation, rates, debt and politics across the US, the euro area and Asia, and how markets and social media felt about it.",
  alternates: { canonical: "https://www.financeplots.com/observer" },
};

export default function ObserverPage() {
  const editions = listEditions();
  const [latest, ...archive] = editions;

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-14">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">Every Monday</p>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">The Observer</h1>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            The week in the world economy — news, inflation, rates, debt and politics across the US, the
            euro area and Asia, and how markets and social media felt about it.
          </p>
        </header>

        {!latest && (
          <div className="bg-[#0d1426] border border-gray-800 rounded-2xl p-10 text-center">
            <p className="text-4xl mb-4">🔭</p>
            <p className="text-white font-semibold mb-2">The first edition is on its way.</p>
            <p className="text-gray-500 text-sm">New editions arrive every Monday.</p>
          </div>
        )}

        {latest && (
          <Link
            href={`/observer/${latest.slug}`}
            className="block bg-gradient-to-br from-blue-900/40 to-indigo-900/20 border border-blue-700/40 hover:border-blue-500 rounded-2xl p-8 transition group mb-12"
          >
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                Latest edition
              </span>
              <span className="text-gray-400 text-xs">Week of {formatEditionDate(latest.date)}</span>
              {latest.audio && (
                <span className="text-gray-400 text-xs">· 🎧 {formatDuration(latest.audio.durationSeconds)}</span>
              )}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3 group-hover:text-blue-300 transition">
              {latest.title}
            </h2>
            <p className="text-gray-400 leading-relaxed mb-6">{latest.dek}</p>

            <div className="grid md:grid-cols-3 gap-3 mb-6">
              {latest.regions.map((r) => (
                <div key={r.region} className="bg-black/20 border border-gray-800 rounded-xl p-4">
                  <p className="text-gray-500 text-[11px] uppercase tracking-wider mb-1">
                    {r.region === "Euro" ? "Euro area" : r.region === "US" ? "United States" : "Asia"}
                  </p>
                  <p className="text-gray-200 text-sm font-semibold leading-snug">{r.headline}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-xs">Market mood</span>
              <div className="flex gap-1">
                {MOODS.map((m) => (
                  <span key={m} className={`w-6 h-1.5 rounded-full ${m === latest.mood.label ? "bg-blue-400" : "bg-gray-700"}`} />
                ))}
              </div>
              <span className="text-white text-sm font-semibold">{latest.mood.label}</span>
            </div>
          </Link>
        )}

        {archive.length > 0 && (
          <section>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Previous editions</p>
            <div className="space-y-3">
              {archive.map((e) => (
                <Link
                  key={e.slug}
                  href={`/observer/${e.slug}`}
                  className="flex flex-col md:flex-row md:items-center gap-1 md:gap-6 bg-[#0d1426] border border-gray-800 hover:border-blue-600/50 rounded-xl px-5 py-4 transition group"
                >
                  <span className="text-gray-500 text-xs md:w-32 shrink-0">{formatEditionDate(e.date)}</span>
                  <span className="text-gray-200 font-semibold group-hover:text-blue-300 transition flex-1">{e.title}</span>
                  <span className="text-gray-500 text-xs">{e.mood.label}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="mt-14 text-center text-gray-600 text-xs max-w-2xl mx-auto leading-relaxed">
          Written by an AI agent from public data and news, and reviewed before publication. General
          commentary, not investment advice.
        </p>
      </div>
    </main>
  );
}
