"use client";

import { useCallback, useState } from "react";
import { strategyCards } from "@/lib/strategy-cards";
import { trackEvent } from "@/lib/analytics";

// Flip cards for /blog/strategy-models-balanced-scorecard, plus a printable PDF
// of the same cards. Both faces are in the HTML (the back is only hidden
// visually), so the text is readable by search engines and screen readers.

export default function RevisionCards({ es, url }: { es: boolean; url: string }) {
  const cards = strategyCards(es);
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);

  const toggle = (i: number) =>
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const download = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { default: RevisionCardsPdf } = await import("./RevisionCardsPdf");
      const blob = await pdf(<RevisionCardsPdf cards={strategyCards(es)} es={es} url={url} />).toBlob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = es ? "fichas-modelos-de-estrategia.pdf" : "strategy-models-revision-cards.pdf";
      a.click();
      trackEvent("export", { format: "pdf" });
      URL.revokeObjectURL(href);
    } finally {
      setBusy(false);
    }
  }, [busy, es, url]);

  return (
    <section className="mt-14" aria-labelledby="revision-cards">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <h2 id="revision-cards" className="text-2xl font-bold text-white">
            {es ? "Las fichas, para repasar" : "The cards, to revise with"}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {es
              ? "Las diez fichas de este artículo. Toca una para darle la vuelta, o descárgalas para imprimir, recortar y doblar."
              : "The ten cards behind this article. Tap one to flip it, or download them to print, cut out and fold."}
          </p>
        </div>
        <button
          type="button"
          onClick={download}
          disabled={busy}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg transition text-sm"
        >
          {busy ? (es ? "Preparando…" : "Preparing…") : es ? "Descargar las fichas (PDF)" : "Download the cards (PDF)"}
        </button>
      </div>

      <ol className="grid gap-4 sm:grid-cols-2">
        {cards.map((c, i) => {
          const isFlipped = flipped.has(i);
          return (
            <li key={c.question} className="[perspective:1200px]">
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-pressed={isFlipped}
                aria-label={`${i + 1}. ${c.question} — ${isFlipped ? (es ? "ver pregunta" : "show question") : es ? "ver respuesta" : "show answer"}`}
                className="relative block w-full h-72 text-left transition-transform duration-500 [transform-style:preserve-3d] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-lg"
                style={{ transform: isFlipped ? "rotateY(180deg)" : "none" }}
              >
                <span className="absolute inset-0 rounded-lg bg-[#fdf8e4] p-5 shadow-lg [backface-visibility:hidden] flex flex-col">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{c.topic}</span>
                  <span className="absolute top-4 right-4 w-8 h-8 rounded-full border-2 border-[#c8382e] text-[#c8382e] text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="mt-8 text-xl font-bold leading-snug text-[#c8382e]">{c.question}</span>
                  <span className="mt-auto text-xs text-gray-500">{es ? "Toca para ver la respuesta →" : "Tap to reveal →"}</span>
                </span>
                <span
                  className="absolute inset-0 rounded-lg bg-[#fdf8e4] p-5 shadow-lg [backface-visibility:hidden] overflow-y-auto"
                  style={{ transform: "rotateY(180deg)" }}
                >
                  <span className="block text-sm font-bold text-[#c8382e] border-b-2 border-[#c8382e] pb-2 mb-3">{c.question}</span>
                  <span className="block space-y-1.5">
                    {c.points.map((p) => (
                      <span key={p} className="flex gap-2 text-[13px] leading-snug text-[#1f2a44]">
                        <span className="text-[#c8382e]" aria-hidden>•</span>
                        <span>{p}</span>
                      </span>
                    ))}
                  </span>
                  {c.tip && <span className="block mt-3 text-[13px] italic text-[#c8382e]">{c.tip}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
