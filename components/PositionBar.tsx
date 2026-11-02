/** Where one figure sits within its index: one dot on a lowest–highest bar.
 *  "Further right" is a higher figure, never a better one (UK MAR, CLAUDE.md).
 *  Used on the company pages and the company map's card. */
export default function PositionBar({ position, indexLabel }: { position: number | null; indexLabel: string }) {
  if (position === null) return <p className="text-xs text-gray-600">No figure for this company.</p>;
  const p = Math.round(position);
  return (
    <div>
      <div className="relative h-2 rounded-full bg-gray-800" role="img" aria-label={`Higher than ${p}% of the ${indexLabel}`}>
        <div className="absolute inset-y-0 left-1/2 w-px bg-gray-700" />
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-blue-400 ring-2 ring-[#0d1426]" style={{ left: `${p}%` }} />
      </div>
      <div className="flex justify-between text-[11px] text-gray-500 mt-1">
        <span>lowest</span>
        <span className="text-gray-400">higher than {p}% of the {indexLabel}</span>
        <span>highest</span>
      </div>
    </div>
  );
}
