"use client";

import { useState } from "react";
import { EJES } from "@/components/FactorSnowflake";

/** Lo que el pipeline escribe en el JSON. Todo opcional: un informe anterior al
 *  motor multifactor no trae nada de esto y la sección simplemente no aparece. */
export interface MetodologiaFactores {
  approach?: string;
  why_not_filters?: string;
  why_ranks_not_values?: string;
  weights?: Record<string, number>;
  weights_summary?: string;
  factors?: Record<
    string,
    { weight_pct?: number; what_it_measures?: string; metrics?: { name: string; better_when: string }[] }
  >;
  missing_data?: string;
  coverage?: string;
  no_trend_penalty?: string;
  what_the_score_is_not?: string;
  read_the_breakdown?: string;
  two_stage?: string;
  report_size?: string;
}

const COLORES: Record<string, string> = {
  value: "bg-sky-400",
  quality: "bg-emerald-400",
  growth: "bg-violet-400",
  momentum: "bg-amber-400",
  expectativas: "bg-rose-400",
};

/** Nombre de pantalla del factor. Sale de EJES para que la nota y el radar no
 *  puedan llamar a lo mismo de dos maneras distintas. */
function etiquetaDe(clave: string) {
  return EJES.find((e) => e.clave === clave)?.etiqueta ?? clave;
}

/** La nota que explica los pesos. Todo su contenido viene del JSON, que el
 *  pipeline genera desde su propia configuración: cambiar un peso cambia esta
 *  nota en el mismo commit, sin que nadie tenga que acordarse de actualizarla. */
export default function FactorMethodology({ metodologia }: { metodologia?: MetodologiaFactores }) {
  const [abierto, setAbierto] = useState(false);
  const pesos = metodologia?.weights;
  if (!metodologia || !pesos || Object.keys(pesos).length === 0) return null;

  const entradas = Object.entries(pesos).sort((a, b) => b[1] - a[1]);
  const maximo = Math.max(...entradas.map(([, v]) => v));

  // El `weights_summary` del pipeline usa sus nombres internos — "momentum",
  // "expectativas" — y el resto de la página dice Trend y Priced In. Dos nombres
  // para lo mismo en la misma pantalla es peor que uno feo, así que la línea se
  // rehace aquí con las etiquetas visibles.
  const resumen = entradas.map(([clave, peso]) => `${etiquetaDe(clave)} ${peso}%`).join(" · ");

  return (
    <div className="bg-[#0d1426] border border-gray-800 rounded-2xl p-5 sm:p-6 mb-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
        <h3 className="text-white font-bold text-base">How the score is built</h3>
        <span className="text-xs text-gray-500">{resumen}</span>
      </div>
      <p className="text-sm text-gray-400 leading-relaxed mb-5">{metodologia.approach}</p>

      <div className="space-y-3 mb-5">
        {entradas.map(([clave, peso]) => {
          const detalle = metodologia.factors?.[clave];
          return (
            <div key={clave}>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm font-semibold text-white w-24 shrink-0">{etiquetaDe(clave)}</span>
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${COLORES[clave] ?? "bg-blue-400"}`}
                    style={{ width: `${(peso / maximo) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-mono text-gray-400 w-10 text-right shrink-0">{peso}%</span>
              </div>
              {detalle?.what_it_measures && (
                <p className="text-xs text-gray-500 leading-relaxed ml-[6.75rem] mr-14">
                  {detalle.what_it_measures}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setAbierto((v) => !v)}
        className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
      >
        {abierto ? "Hide the detail −" : "Why these weights, and what the score is not +"}
      </button>

      {abierto && (
        <div className="mt-4 pt-4 border-t border-gray-800 space-y-3 text-xs text-gray-500 leading-relaxed">
          {[
            ["Why weights at all", metodologia.why_not_filters],
            ["Why ranks, not raw values", metodologia.why_ranks_not_values],
            ["Missing data", metodologia.missing_data],
            ["Data coverage", metodologia.coverage],
            ["When there is no trend to measure", metodologia.no_trend_penalty],
            ["Two stages", metodologia.two_stage],
            ["What the score is not", metodologia.what_the_score_is_not],
            ["Read the breakdown, not the total", metodologia.read_the_breakdown],
          ]
            .filter(([, texto]) => Boolean(texto))
            .map(([titulo, texto]) => (
              <p key={titulo as string}>
                <span className="text-gray-400 font-semibold">{titulo}.</span> {texto}
              </p>
            ))}

          {metodologia.factors && (
            <div className="pt-2">
              <p className="text-gray-400 font-semibold mb-2">What goes into each factor</p>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
                {Object.entries(metodologia.factors).map(([clave, d]) => (
                  <p key={clave}>
                    <span className="text-gray-400">{etiquetaDe(clave)}:</span>{" "}
                    {(d.metrics ?? [])
                      .map((m) => `${m.name} (${m.better_when === "higher" ? "↑" : "↓"})`)
                      .join(", ")}
                  </p>
                ))}
              </div>
              <p className="mt-2 text-gray-600">
                ↑ higher is better · ↓ lower is better. Every metric is defined in the{" "}
                <a href="/glossary" className="text-blue-400 hover:underline">
                  glossary
                </a>
                .
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
