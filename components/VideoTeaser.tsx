"use client";

import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";

// A slim "watch the story" card that opens a vertical video in a phone-sized
// player. The card is small on purpose: people come to a tool page to use the
// tool, so the video must never push it down. Nothing loads until the click
// (only the poster), and the video plays with sound because the visitor asked.

type Props = {
  src: string;
  poster: string;
  /** Short name for analytics, e.g. "life-plan-cartoon". */
  name: string;
  title: string;
  subtitle: string;
  closeLabel: string;
};

export default function VideoTeaser({ src, poster, name, title, subtitle, closeLabel }: Props) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          trackEvent("video_play", { video: name });
        }}
        className="group mx-auto mt-6 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-2 pr-5 text-left transition hover:border-blue-400/50 hover:bg-white/10"
      >
        <span
          className="relative h-[72px] w-[41px] shrink-0 overflow-hidden rounded-lg bg-cover bg-center"
          style={{ backgroundImage: `url(${poster})` }}
          aria-hidden
        >
          <span className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] text-[#0a0f1e] transition group-hover:scale-110">▶</span>
          </span>
        </span>
        <span>
          <span className="block text-sm font-bold text-white">{title}</span>
          <span className="block text-xs text-gray-400">{subtitle}</span>
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <video
              src={src}
              poster={poster}
              controls
              autoPlay
              playsInline
              className="aspect-[9/16] max-h-[85vh] w-auto max-w-[92vw] rounded-2xl bg-black shadow-2xl"
            />
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -top-3 -right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-bold text-[#0a0f1e] shadow-lg"
              aria-label={closeLabel}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
