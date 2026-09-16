"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("nav");
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<"fpa" | "market" | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setOpenMenu(null);
    setMenuOpen(false);
  }, [pathname]);

  if (pathname?.startsWith("/dashboard") || pathname?.includes("/dashboard")) return null;

  function switchLocale(next: "en" | "es") {
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  const FPA_TOOLS = [
    { label: `🗺️ ${t("financialJourney")}`, href: "/tools/financial-planner", featured: true },
    { label: `⚖️ ${t("breakEven")}`,         href: "/tools/break-even"         },
    { label: `📈 ${t("financialModel")}`,    href: "/tools/financial-model"    },
    { label: `💰 ${t("annualBudget")}`,      href: "/tools/annual-budget"      },
    { label: `💧 ${t("cashFlow")}`,          href: "/tools/cash-flow"          },
    { label: `🏢 ${t("valuation")}`,         href: "/tools/valuation"          },
    { label: `🏦 ${t("lending")}`,           href: "/tools/lending"            },
    { label: `💸 ${t("personalBudget")}`,    href: "/tools/personal-budget"    },
    { label: `💹 ${t("compoundInterest")}`,  href: "/tools/compound-interest"  },
  ];

  const MARKET_TOOLS = [
    { label: `📊 ${t("portfolioAnalysis")}`, href: "/tools/portfolio-analysis" },
    { label: `📉 ${t("stockComparison")}`,   href: "/tools/stock-comparison"   },
    { label: `📈 ${t("stockAnalysis")}`,     href: "/tools/stock-analysis"     },
    { label: `🔎 ${t("stockScreener")}`,     href: "/tools/stock-screener"     },
    { label: `📊 ${t("macroDashboard")}`,    href: "/tools/macro-dashboard"    },
    { label: `🌐 ${t("marketIndices")}`,     href: "/tools/market-indices"     },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1e]/95 backdrop-blur border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-[65px]">

        {/* Logo */}
        <Link href="/" className="text-white font-bold text-xl tracking-tight shrink-0">
          Finance<span className="text-blue-400">Plots</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 text-sm text-gray-400">

          {/* FP&A and Market dropdowns */}
          <div ref={dropdownRef} className="flex items-center gap-1">
            {([
              { key: "fpa",    label: t("fpaSectionLabel"),    items: FPA_TOOLS    },
              { key: "market", label: t("marketSectionLabel"), items: MARKET_TOOLS },
            ] as const).map(menu => {
              const active = menu.items.some(tool => pathname === tool.href);
              const open = openMenu === menu.key;
              return (
                <div key={menu.key} className="relative">
                  <button
                    onClick={() => setOpenMenu(open ? null : menu.key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition font-medium ${
                      active ? "text-white bg-blue-600/10" : "hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {menu.label}
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {open && (
                    <div className="absolute top-[calc(100%+6px)] left-0 w-64 bg-[#0d1426] border border-gray-700 rounded-2xl shadow-2xl shadow-black/60 overflow-y-auto max-h-[80vh]">
                      <div className="p-2">
                        {menu.items.map(tool => (
                          <Link
                            key={tool.href}
                            href={tool.href}
                            className={
                              "featured" in tool
                                ? "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-blue-300 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/20 mb-2 transition"
                                : `flex items-center px-3 py-2 rounded-lg text-sm transition ${
                                    pathname === tool.href ? "text-white bg-blue-600/15" : "text-gray-300 hover:text-white hover:bg-white/5"
                                  }`
                            }
                          >
                            {tool.label}
                          </Link>
                        ))}

                        {/* El glosario define cada métrica del screener de acciones y
                            del resto de herramientas. Va en el menú para que lo
                            encuentre también quien no está ya dentro de una. */}
                        <div className="border-t border-gray-800 mt-2 pt-2">
                          <Link
                            href="/glossary"
                            className={`flex items-center px-3 py-2 rounded-lg text-sm transition ${
                              pathname?.includes("/glossary")
                                ? "text-white bg-blue-600/15"
                                : "text-gray-300 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            📖 {t("glossary")}
                          </Link>
                          <Link
                            href="/tools"
                            className="flex items-center justify-center px-3 py-2 rounded-lg text-xs text-blue-400 hover:text-blue-300 transition"
                          >
                            {t("viewAllTools")}
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Link
            href="/blog"
            className={`px-4 py-2 rounded-lg transition font-medium ${
              pathname?.includes("/blog") ? "text-white bg-blue-600/10" : "hover:text-white hover:bg-white/5"
            }`}
          >
            {t("blog")}
          </Link>

          {/* Language switcher */}
          <div className="flex items-center gap-1 ml-1 border border-gray-700 rounded-lg px-1 py-0.5">
            <button
              onClick={() => switchLocale("en")}
              disabled={isPending}
              title="English"
              className={`text-lg px-1 rounded transition ${locale === "en" ? "opacity-100" : "opacity-40 hover:opacity-80"}`}
            >
              🇬🇧
            </button>
            <button
              onClick={() => switchLocale("es")}
              disabled={isPending}
              title="Español"
              className={`text-lg px-1 rounded transition ${locale === "es" ? "opacity-100" : "opacity-40 hover:opacity-80"}`}
            >
              🇪🇸
            </button>
          </div>

          <Link
            href="/tools/financial-planner"
            className="ml-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-semibold transition shadow-lg shadow-blue-600/20"
          >
            {t("getStarted")}
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-gray-400 hover:text-white p-2 rounded-lg transition"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen
            ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          }
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0d1426] border-t border-gray-800 px-4 py-4 flex flex-col gap-1 text-sm max-h-[80vh] overflow-y-auto">
          <Link href="/tools/financial-planner" className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-blue-300 bg-blue-600/10 border border-blue-600/20 mb-2">
            🗺️ {t("financialJourney")}
          </Link>

          <p className="text-xs text-gray-600 font-bold uppercase tracking-wider px-4 py-1">{t("fpaSectionLabel")}</p>
          {FPA_TOOLS.filter(t => !t.featured).map(tool => (
            <Link key={tool.href} href={tool.href} className={`px-4 py-2.5 rounded-lg transition ${pathname === tool.href ? "text-white bg-blue-600/15" : "text-gray-300 hover:text-white"}`}>
              {tool.label}
            </Link>
          ))}

          <p className="text-xs text-gray-600 font-bold uppercase tracking-wider px-4 py-1 mt-2">{t("marketSectionLabel")}</p>
          {MARKET_TOOLS.map(tool => (
            <Link key={tool.href} href={tool.href} className={`px-4 py-2.5 rounded-lg transition ${pathname === tool.href ? "text-white bg-blue-600/15" : "text-gray-300 hover:text-white"}`}>
              {tool.label}
            </Link>
          ))}

          <Link
            href="/glossary"
            className="flex items-center px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition"
          >
            📖 {t("glossary")}
          </Link>

          <div className="border-t border-gray-800 mt-3 pt-3 flex flex-col gap-1">
            <Link href="/blog" className={`px-4 py-2.5 rounded-lg transition font-semibold ${pathname?.includes("/blog") ? "text-white bg-blue-600/15" : "text-blue-300 hover:text-white"}`}>📝 {t("blog")}</Link>
          </div>

          {/* Mobile language switcher */}
          <div className="border-t border-gray-800 mt-3 pt-3 flex items-center gap-2 px-4">
            <button
              onClick={() => switchLocale("en")}
              className={`text-xl transition ${locale === "en" ? "opacity-100" : "opacity-40"}`}
            >
              🇬🇧
            </button>
            <button
              onClick={() => switchLocale("es")}
              className={`text-xl transition ${locale === "es" ? "opacity-100" : "opacity-40"}`}
            >
              🇪🇸
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
