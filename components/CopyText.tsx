"use client";

import { useState } from "react";

/** A monospace value with a copy button — the MCP URL, a terminal command. */
export default function CopyText({ text, copyLabel, copiedLabel }: { text: string; copyLabel: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context, permissions): the text is selectable anyway.
    }
  }

  return (
    <div className="flex items-stretch bg-[#070d1a] border border-gray-700 rounded-xl overflow-hidden">
      <code className="flex-1 min-w-0 px-4 py-3 text-sm text-blue-200 font-mono break-all select-all">
        {text}
      </code>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition"
      >
        {copied ? `✓ ${copiedLabel}` : copyLabel}
      </button>
    </div>
  );
}
