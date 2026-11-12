"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import AudienceDoors from "@/components/AudienceDoors";
import ToolFinderChat from "@/components/ToolFinderChat";
import { toolCount } from "@/lib/audiences";

// /tools is a chooser: individuals and companies are two different audiences,
// so each has its own hub (/tools/personal, /tools/business — lib/audiences.ts).
export default function ToolsPage() {
  const t = useTranslations("tools");
  const ta = useTranslations("audiences");
  const tm = useTranslations("mcp");

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-blue-400 text-xs font-bold uppercase tracking-widest text-center mb-3">
          {t("label")}
        </p>
        <h1 className="text-4xl font-extrabold text-center mb-3">
          {ta("chooserTitle")}
        </h1>
        <p className="text-gray-400 text-center mb-3 max-w-2xl mx-auto">
          {ta("chooserSubtitle")}
        </p>
        <p className="text-gray-500 text-sm text-center mb-12">
          {t("subtitle", { count: toolCount() })}
        </p>

        <div className="mb-12">
          <AudienceDoors />
        </div>

        {/* The same tools, from inside an AI assistant */}
        <Link
          href="/mcp"
          className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 bg-[#0d1426] border border-blue-600/30 hover:border-blue-500 rounded-2xl px-6 py-5 transition group"
        >
          <span className="text-3xl shrink-0">🤖</span>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold group-hover:text-blue-300 transition">{tm("bannerTitle")}</h2>
            <p className="text-gray-500 text-sm">{tm("bannerDesc")}</p>
          </div>
          <span className="text-blue-400 text-sm font-semibold shrink-0">{tm("bannerCta")}</span>
        </Link>
      </div>
      <ToolFinderChat />
    </main>
  );
}
