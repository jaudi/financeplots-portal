"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import FactorSnowflake, { EJES } from "@/components/FactorSnowflake";
import FactorMethodology, { type MetodologiaFactores } from "@/components/FactorMethodology";
import type { UniverseCompany, UniverseData, UniverseScreen } from "@/lib/screener";

const PANTALLAS: { clave: UniverseScreen; etiqueta: string; emoji: string }[] = [
  { clave: "sp500", etiqueta: "S&P 500", emoji: "🇺🇸" },
  { clave: "nasdaq100", etiqueta: "Nasdaq-100", emoji: "🚀" },
  { clave: "ibex35", etiqueta: "IBEX 35", emoji: "🇪🇸" },
];

/** Shown when a card is opened. Deliberately not on the card itself — the point
 *  of the grid is the shape, and sixteen numbers per tile is the spreadsheet
 *  this is meant to replace. */
const DETALLE: { clave: keyof UniverseCompany; etiqueta: string; sufijo?: string; decimales?: number }[] = [
  { clave: "per_normalizado", etiqueta: "P/E (normalised)", decimales: 1 },
  { clave: "per", etiqueta: "P/E (trailing)", decimales: 1 },
  { clave: "precio_valor_libros", etiqueta: "Price / book", decimales: 2 },
  { clave: "ev_ebit", etiqueta: "EV / EBIT", decimales: 1 },
  { clave: "fcf_yield", etiqueta: "Free cash flow yield", sufijo: "%", decimales: 1 },
  { clave: "roic", etiqueta: "Return on invested capital", sufijo: "%", decimales: 1 },
  { clave: "roe", etiqueta: "Return on equity", sufijo: "%", decimales: 1 },
  { clave: "margen_operativo", etiqueta: "Operating margin", sufijo: "%", decimales: 1 },
  { clave: "conversion_fcf", etiqueta: "Profit → cash conversion", decimales: 2 },
  { clave: "deuda_neta_ebitda", etiqueta: "Net debt / EBITDA", decimales: 2 },
  { clave: "cobertura_intereses", etiqueta: "Interest cover", decimales: 1 },
  { clave: "crecimiento_ingresos_normalizado", etiqueta: "Revenue growth", sufijo: "%", decimales: 1 },
  { clave: "crecimiento_beneficios_normalizado", etiqueta: "Earnings growth", sufijo: "%", decimales: 1 },
  { clave: "retorno_6m", etiqueta: "6-month return", sufijo: "%", decimales: 1 },
  { clave: "retorno_12m", etiqueta: "12-month return", sufijo: "%", decimales: 1 },
  { clave: "rsi", etiqueta: "RSI (14-day)", decimales: 1 },
];

function fmt(valor: unknown, sufijo = "", decimales = 1) {
  if (valor === null || valor === undefined || typeof valor !== "number") return "—";
  return `${valor.toFixed(decimales)}${sufijo}`;
}

function tono(v: number | null | undefined) {
  if (v === null || v === undefined) return "text-gray-600";
  if (v >= 60) return "text-emerald-400";
  if (v >= 40) return "text-amber-400";
  return "text-red-400";
}

export default function UniverseScreener() {
  const [pantalla, setPantalla] = useState<UniverseScreen>("sp500");
  const [data, setData] = useState<UniverseData | null>(null);
  const [estado, setEstado] = useState<"loading" | "ready" | "error">("loading");
  const [minimos, setMinimos] = useState<Record<string, number>>({});
  const [orden, setOrden] = useState<string>("score");
  const [sector, setSector] = useState<string>("all");
  const [abierta, setAbierta] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    let cancelado = false;
    setEstado("loading");
    (async () => {
      try {
        const res = await fetch(`/api/universe?screen=${pantalla}`);
        if (!res.ok) throw new Error(String(res.status));
        const json: UniverseData = await res.json();
        if (cancelado) return;
        setData(json);
        setEstado("ready");
      } catch {
        if (!cancelado) setEstado("error");
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [pantalla]);

  const sectores = useMemo(() => {
    const s = new Set((data?.companies ?? []).map((c) => c.sector).filter(Boolean));
    return ["all", ...Array.from(s).sort()];
  }, [data]);

  const visibles = useMemo(() => {
    let lista = data?.companies ?? [];

    if (sector !== "all") lista = lista.filter((c) => c.sector === sector);
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      lista = lista.filter(
        (c) => c.ticker.toLowerCase().includes(q) || (c.nombre ?? "").toLowerCase().includes(q),
      );
    }

    // Un mínimo sólo excluye a quien puntúa por debajo — no a quien no tiene el
    // dato. Descartar por un hueco es castigar a la empresa por un fallo del
    // proveedor, y el usuario no vería por qué desapareció.
    lista = lista.filter((c) =>
      EJES.every((e) => {
        const min = minimos[e.clave] ?? 0;
        if (min === 0) return true;
        const v = c.factores?.[e.clave];
        return v === undefined ? true : v >= min;
      }),
    );

    const dir = orden === "ticker" ? 1 : -1;
    return [...lista].sort((a, b) => {
      if (orden === "ticker") return a.ticker.localeCompare(b.ticker);
      const va = orden === "score" ? a.score : a.factores?.[orden as keyof typeof a.factores];
      const vb = orden === "score" ? b.score : b.factores?.[orden as keyof typeof b.factores];
      return ((vb ?? -1) - (va ?? -1)) * (dir === -1 ? 1 : -1);
    });
  }, [data, minimos, orden, sector, busqueda]);

  return (
    <div>
      {/* Selector de índice */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {PANTALLAS.map((p) => (
          <button
            key={p.clave}
            onClick={() => {
              setPantalla(p.clave);
              setAbierta(null);
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition border ${
              pantalla === p.clave
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-[#0d1426] border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
            }`}
          >
            {p.emoji} {p.etiqueta}
          </button>
        ))}
      </div>

      {estado === "loading" && (
        <p className="text-center text-gray-500 py-16 text-sm">Loading the index…</p>
      )}

      {estado === "error" && (
        <div className="max-w-xl mx-auto bg-[#0d1426] border border-gray-800 rounded-xl p-6 text-center text-sm text-gray-400">
          This index hasn&apos;t been published yet. The screens run weekly — check back after the next run.
        </div>
      )}

      {estado === "ready" && data && (
        <>
          {/* Controles */}
          <div className="bg-[#0d1426] border border-gray-800 rounded-2xl p-5 sm:p-6 mb-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                  Search
                </label>
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Ticker or company"
                  className="w-full bg-[#070d1a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                  Sector
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full bg-[#070d1a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  {sectores.map((s) => (
                    <option key={s} value={s}>
                      {s === "all" ? "All sectors" : s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                  Sort by
                </label>
                <select
                  value={orden}
                  onChange={(e) => setOrden(e.target.value)}
                  className="w-full bg-[#070d1a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="score">Overall score</option>
                  {EJES.map((e) => (
                    <option key={e.clave} value={e.clave}>
                      {e.etiqueta}
                    </option>
                  ))}
                  <option value="ticker">Ticker (A-Z)</option>
                </select>
              </div>
            </div>

            <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">
              Minimum score per factor
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {EJES.map((e) => (
                <div key={e.clave}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-400 cursor-help" title={e.ayuda}>
                      {e.etiqueta}
                    </span>
                    <span className="text-xs font-mono text-gray-500">{minimos[e.clave] ?? 0}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={minimos[e.clave] ?? 0}
                    onChange={(ev) =>
                      setMinimos((m) => ({ ...m, [e.clave]: Number(ev.target.value) }))
                    }
                    className="w-full accent-blue-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-800">
              <p className="text-sm text-gray-400">
                <span className="text-white font-bold">{visibles.length}</span> of {data.count} companies
              </p>
              <button
                onClick={() => {
                  setMinimos({});
                  setSector("all");
                  setBusqueda("");
                }}
                className="text-xs text-gray-500 hover:text-white transition"
              >
                Reset filters
              </button>
            </div>
          </div>

          <FactorMethodology metodologia={data.methodology as MetodologiaFactores} />

          {/* Tarjetas */}
          {visibles.length === 0 ? (
            <p className="text-center text-gray-500 py-16 text-sm">
              Nothing clears those minimums. Drag a slider back down.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibles.map((c) => {
                const abierto = abierta === c.ticker;
                return (
                  <div
                    key={c.ticker}
                    className={`bg-[#0d1426] border rounded-2xl p-5 transition ${
                      abierto ? "border-blue-500/60 sm:col-span-2 lg:col-span-3" : "border-gray-800 hover:border-gray-600"
                    }`}
                  >
                    <button
                      onClick={() => setAbierta(abierto ? null : c.ticker)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start gap-4">
                        <div className="shrink-0">
                          <FactorSnowflake
                            factores={c.factores}
                            size={abierto ? 210 : 110}
                            conEtiquetas={abierto}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="font-mono font-bold text-blue-300">{c.ticker}</span>
                            {c.beneficio_en_pico && (
                              <span
                                className="text-[10px] font-bold uppercase tracking-wide text-amber-300 bg-amber-400/10 border border-amber-400/25 rounded-full px-2 py-0.5 cursor-help"
                                title="Earnings are at a multi-year high. In a cyclical business that is a warning — the multiple looks cheapest at the top of the cycle."
                              >
                                peak earnings
                              </span>
                            )}
                          </div>
                          <p className="text-white text-sm font-semibold truncate" title={c.nombre}>{c.nombre}</p>
                          <p className="text-gray-500 text-xs mb-2">{c.sector}</p>
                          <div className="flex items-baseline gap-1.5">
                            <span className={`text-2xl font-extrabold ${tono(c.score)}`}>
                              {c.score === null ? "—" : c.score.toFixed(0)}
                            </span>
                            <span className="text-gray-600 text-xs">/ 100</span>
                          </div>
                          {c.cobertura_pct < 70 && (
                            <p
                              className="text-[10px] text-amber-400/70 mt-1 cursor-help"
                              title="This score is built on partial data — several metrics were not reported."
                            >
                              {c.cobertura_pct}% data coverage
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-1 mt-4">
                        {EJES.map((e) => {
                          const v = c.factores?.[e.clave];
                          return (
                            <div key={e.clave} className="text-center" title={e.ayuda}>
                              <div className={`text-sm font-bold ${tono(v)}`}>
                                {v === undefined ? "—" : v.toFixed(0)}
                              </div>
                              <div className="text-[9px] uppercase tracking-wide text-gray-600">
                                {e.corta}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </button>

                    {abierto && (
                      <div className="mt-5 pt-5 border-t border-gray-800">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2">
                          {DETALLE.map((d) => (
                            <div key={String(d.clave)} className="flex justify-between text-xs py-1 border-b border-gray-800/50">
                              <span className="text-gray-500">{d.etiqueta}</span>
                              <span className="text-gray-300 font-mono">
                                {fmt(c[d.clave], d.sufijo, d.decimales)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 mt-4">
                          Every number here is explained in the{" "}
                          <Link href="/glossary" className="text-blue-400 hover:underline">
                            glossary
                          </Link>
                          .
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
