import { BASE } from "@/lib/page-metadata";
import { withUtm } from "@/lib/embeds";

// The bottom line of an embedded card: a link to the full page and the
// FinancePlots name. Both open in a new tab — never navigate the host page.
// Narrow frames (under 640px) get the short label, which fits at 300px.

export default function EmbedFooter({ href, label, short }: { href: string; label: string; short: string }) {
  return (
    <div className="mt-auto pt-3 border-t border-gray-800 flex items-center justify-between gap-3 text-xs">
      <a href={href} target="_blank" rel="noopener" className="text-blue-400 hover:text-blue-300 truncate">
        <span className="sm:hidden">{short}</span>
        <span className="hidden sm:inline">{label}</span>
      </a>
      <a href={withUtm(BASE)} target="_blank" rel="noopener" className="font-bold text-sm shrink-0">
        Finance<span className="text-blue-400">Plots</span>
      </a>
    </div>
  );
}
