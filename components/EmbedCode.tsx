"use client";

import { useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";

// "Embed this on your site": a closed box that opens to a live preview of the
// card and the code to paste. Copying it is counted (embed_copy) so we know
// whether anyone embeds; the code itself is in lib/embeds.ts.

export default function EmbedCode({ src, snippet, height }: { src: string; snippet: string; height: number }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<"" | "done" | "manual">("");
  const box = useRef<HTMLTextAreaElement>(null);

  const copy = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(snippet);
      ok = true;
    } catch {
      // Clipboard API blocked (some browsers, embedded views): select the code and
      // try the older copy command; failing that, the code is selected for Ctrl+C.
      box.current?.select();
      try { ok = document.execCommand("copy"); } catch { ok = false; }
    }
    setCopied(ok ? "done" : "manual");
    setTimeout(() => setCopied(""), 2500);
    if (ok) trackEvent("embed_copy");
  };

  return (
    <div className="bg-[#0d1426] border border-gray-800 rounded-xl mb-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span>
          <span className="block text-white font-bold">Embed this on your site</span>
          <span className="block text-sm text-gray-400">Free, for blogs and newsletters. Paste the code where you want the card.</span>
        </span>
        <span className="text-gray-400 text-sm shrink-0">{open ? "Hide ▲" : "Get the code ▼"}</span>
      </button>
      {open && (
        <div className="px-5 pb-5 flex flex-col gap-4">
          {/* Same-site path for the preview, so it also works on localhost and preview deploys. */}
          <iframe src={src.replace(/^https?:\/\/[^/]+/, "")} title="Embed preview" height={height} className="w-full max-w-[640px] border border-gray-800 rounded-lg bg-[#0a0f1e]" loading="lazy" />
          <div className="relative">
            <textarea
              ref={box}
              readOnly
              value={snippet}
              rows={4}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full bg-[#111827] border border-gray-700 rounded-lg p-3 pr-24 text-xs text-gray-300 font-mono resize-none outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={copy}
              className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-1.5 rounded-md text-xs transition"
            >
              {copied === "done" ? "Copied ✓" : copied === "manual" ? "Press Ctrl+C" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Please keep the link under the card: it credits FinancePlots and takes readers to the full breakdown.
          </p>
        </div>
      )}
    </div>
  );
}
