"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { Counts, Vote } from "@/lib/feedback";

// "Was this tool useful?" with a thumb up and a thumb down (lib/feedback.ts).
// Counts are shown only after the visitor has voted. Renders nothing until the
// API says the vote store is connected, so the site looks the same without it.

const storageKey = (tool: string) => `financeplots:feedback:${tool}`;

function readVote(tool: string): Vote | null {
  try {
    const v = window.localStorage.getItem(storageKey(tool));
    return v === "up" || v === "down" ? v : null;
  } catch {
    return null;
  }
}

function saveVote(tool: string, vote: Vote) {
  try {
    window.localStorage.setItem(storageKey(tool), vote);
  } catch {
    // Private mode: the vote still counts, it just isn't remembered.
  }
}

export default function ToolFeedback({ tool }: { tool: string }) {
  const t = useTranslations("feedback");
  const [enabled, setEnabled] = useState(false);
  const [vote, setVote] = useState<Vote | null>(null);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mine = readVote(tool);
    setVote(mine);
    let live = true;
    fetch(`/api/feedback?tool=${encodeURIComponent(tool)}${mine ? "&counts=1" : ""}`)
      .then((r) => r.json())
      .then((d: { enabled?: boolean; up?: number; down?: number }) => {
        if (!live) return;
        setEnabled(d.enabled === true);
        if (typeof d.up === "number" && typeof d.down === "number") setCounts({ up: d.up, down: d.down });
      })
      .catch(() => {});
    return () => { live = false; };
  }, [tool]);

  if (!enabled) return null;

  const cast = async (next: Vote) => {
    if (busy || next === vote) return;
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, vote: next, ...(vote ? { previous: vote } : {}) }),
      });
      const d = (await res.json()) as { up?: number; down?: number };
      if (!res.ok || typeof d.up !== "number" || typeof d.down !== "number") throw new Error();
      setVote(next);
      saveVote(tool, next);
      setCounts({ up: d.up, down: d.down });
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const button = (v: Vote, icon: string, label: string) => (
    <button
      type="button"
      onClick={() => cast(v)}
      disabled={busy}
      aria-pressed={vote === v}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition disabled:opacity-60 ${
        vote === v ? "bg-blue-600/20 border-blue-500 text-white" : "bg-[#0d1426] border-gray-700 text-gray-300 hover:text-white hover:border-blue-500"
      }`}
    >
      <span aria-hidden>{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-3 mb-8" aria-live="polite">
      <p className="text-sm text-gray-300 font-semibold mr-1">{t("question")}</p>
      {button("up", "👍", t("up"))}
      {button("down", "👎", t("down"))}
      {vote && counts && !failed && (
        <p className="text-xs text-gray-500 basis-full sm:basis-auto">
          {t("thanks")} {t("counts", { up: counts.up, down: counts.down })}
        </p>
      )}
      {failed && <p className="text-xs text-gray-500 basis-full sm:basis-auto">{t("failed")}</p>}
    </div>
  );
}
