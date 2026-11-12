"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

const TAG_COLORS: Record<string, string> = {
  "Corporate Finance": "text-blue-400",
  "Finanzas Corporativas": "text-blue-400",
  "Valuation": "text-purple-400",
  "Valoración": "text-purple-400",
  "Small Business Finance": "text-yellow-400",
  "Finanzas para Pymes": "text-yellow-400",
  "Personal Finance": "text-green-400",
  "Finanzas Personales": "text-green-400",
  "Startup Finance": "text-orange-400",
  "Finanzas para Startups": "text-orange-400",
  "Analysis": "text-gray-400",
  "Análisis": "text-gray-400",
  "Opinion": "text-red-400",
  "Opinión": "text-red-400",
  "Tutorial": "text-teal-400",
  "Tutorial (es)": "text-teal-400",
  "Guide": "text-purple-400",
  "Guía": "text-purple-400",
  "AI & Agents": "text-cyan-400",
  "IA y Agentes": "text-cyan-400",
};

export default function BlogPage() {
  const t = useTranslations("blog");
  const articles = t.raw("articles") as {
    slug: string;
    title: string;
    date: string;
    description: string;
    tag: string;
  }[];

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">{t("title")}</h1>
        <p className="text-gray-400 mb-12">{t("subtitle")}</p>

        <div className="space-y-4">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/blog/${a.slug}`}
              className="block bg-[#0d1426] border border-gray-700 hover:border-blue-500 rounded-xl p-6 transition"
            >
              <span className={`text-xs font-semibold uppercase tracking-wider ${TAG_COLORS[a.tag] ?? "text-blue-400"}`}>
                {a.tag}
              </span>
              <h2 className="text-xl font-bold mt-2 mb-2 leading-snug">{a.title}</h2>
              <p className="text-gray-400 text-sm mb-3">{a.description}</p>
              <span className="text-gray-500 text-xs">{a.date}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
