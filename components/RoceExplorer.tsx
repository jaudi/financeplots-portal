"use client";

// Margin × turnover map for the ROCE article (/blog/roce-margin-turnover).
// Log–log axes, so every "same ROCE" curve (margin = ROCE ÷ turnover) is a
// straight line. Companies are drawn in one neutral colour — positions, not
// grades — and the reader can add their own business from four figures.
//
// The map is drawn twice — a wide one from `sm` up and a narrow one with
// larger text and short labels for phones — because SVG text scales with
// the viewBox and a 640-wide chart squeezed onto a phone is unreadable.

import { useState } from "react";
import NumberInput from "@/components/NumberInput";

export interface RocePoint {
  name: string;
  /** Shorter label for the phone chart. */
  short?: string;
  /** Sales ÷ capital employed. */
  turnover: number;
  /** Operating profit ÷ sales, in %. */
  marginPct: number;
  /** Drawn hollow: a past year, an estimate or an illustration. */
  hollow?: boolean;
  /** Label placement. */
  dx?: number;
  dy?: number;
  anchor?: "start" | "middle" | "end";
}

const X0 = 0.25, X1 = 10;
const Y0 = 2, Y1 = 64;
const ISO = [10, 25, 50];
// Rounded to 2 decimals: Node and the browser can differ in the last digit of
// a log10, which React reports as a hydration mismatch on the SVG attributes.
const r2 = (v: number) => Math.round(v * 100) / 100;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

interface Layout { w: number; h: number; pad: { l: number; r: number; t: number; b: number }; font: number; compact: boolean; xTicks: number[] }
const WIDE: Layout = { w: 640, h: 440, pad: { l: 56, r: 16, t: 16, b: 52 }, font: 12, compact: false, xTicks: [0.25, 0.5, 1, 2, 5, 10] };
const NARROW: Layout = { w: 360, h: 400, pad: { l: 54, r: 10, t: 14, b: 50 }, font: 13, compact: true, xTicks: [0.25, 0.5, 1, 2, 5, 10] };

interface Labels { xAxis: string; yAxis: string; iso: string; yours: string }

function Chart({ L, points, mine, t, fmtX, id }: {
  L: Layout; points: RocePoint[]; mine: { turnover: number; marginPct: number } | null; t: Labels; fmtX: (v: number) => string; id: string;
}) {
  const { w, h, pad, font } = L;
  const lx = (v: number) => r2(pad.l + ((Math.log10(v) - Math.log10(X0)) / (Math.log10(X1) - Math.log10(X0))) * (w - pad.l - pad.r));
  const ly = (v: number) => r2(h - pad.b - ((Math.log10(v) - Math.log10(Y0)) / (Math.log10(Y1) - Math.log10(Y0))) * (h - pad.t - pad.b));
  const label = font + 1;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label={`${t.yAxis} / ${t.xAxis}`}>
      <defs>
        <clipPath id={id}><rect x={pad.l} y={pad.t} width={w - pad.l - pad.r} height={h - pad.t - pad.b} /></clipPath>
      </defs>
      {L.xTicks.map((v) => (
        <g key={`x${v}`}>
          <line x1={lx(v)} x2={lx(v)} y1={pad.t} y2={h - pad.b} stroke="rgba(255,255,255,0.06)" />
          <text x={lx(v)} y={h - pad.b + font + 6} textAnchor="middle" fontSize={font} fill="#6b7280">{fmtX(v)}</text>
        </g>
      ))}
      {[2, 4, 8, 16, 32, 64].map((v) => (
        <g key={`y${v}`}>
          <line x1={pad.l} x2={w - pad.r} y1={ly(v)} y2={ly(v)} stroke="rgba(255,255,255,0.06)" />
          <text x={pad.l - 6} y={ly(v) + 4} textAnchor="end" fontSize={font} fill="#6b7280">{v}%</text>
        </g>
      ))}
      <text x={(pad.l + w - pad.r) / 2} y={h - 10} textAnchor="middle" fontSize={font} fill="#9ca3af">{t.xAxis}</text>
      <text transform={`translate(${font} ${r2((pad.t + h - pad.b) / 2)}) rotate(-90)`} textAnchor="middle" fontSize={font} fill="#9ca3af">{t.yAxis}</text>

      <g clipPath={`url(#${id})`}>
        {ISO.map((r) => (
          <line key={`iso${r}`} x1={lx(X0)} y1={ly(r / X0)} x2={lx(X1)} y2={ly(r / X1)} stroke="#4b5563" strokeDasharray="5 5" />
        ))}
      </g>
      {ISO.map((r) => {
        // Label each line where it leaves the top of the plot, or at the left edge.
        const xTop = r / Y1;
        const px = xTop > X0 ? lx(xTop) + 4 : lx(X0) + 4;
        const py = xTop > X0 ? pad.t + font + 2 : ly(r / X0) + font + 2;
        // Phones: the number alone; the caption under the chart says what the lines are.
        return <text key={`isol${r}`} x={r2(px)} y={r2(py)} fontSize={font - 1} fill="#6b7280">{L.compact ? `${r}%` : `${t.iso} ${r}%`}</text>;
      })}

      {points.map((p) => {
        const cx = lx(clamp(p.turnover, X0, X1));
        const cy = ly(clamp(p.marginPct, Y0, Y1));
        return (
          <g key={p.name}>
            <circle cx={cx} cy={cy} r={6} fill={p.hollow ? "none" : "#60a5fa"} stroke="#60a5fa" strokeWidth={2} strokeDasharray={p.hollow ? "3 2" : undefined} />
            <text x={r2(cx + (p.dx ?? 10))} y={r2(cy + (p.dy ?? 4))} textAnchor={p.anchor ?? "start"} fontSize={label} fill="#e5e7eb">
              {L.compact ? (p.short ?? p.name) : p.name}
            </text>
          </g>
        );
      })}

      {mine && mine.marginPct > 0 && (() => {
        const cx = lx(clamp(mine.turnover, X0, X1));
        const cy = ly(clamp(mine.marginPct, Y0, Y1));
        return (
          <g>
            <rect x={r2(cx - 6)} y={r2(cy - 6)} width={12} height={12} transform={`rotate(45 ${cx} ${cy})`} fill="#f59e0b" />
            <text x={r2(cx + 12)} y={r2(cy - 8)} fontSize={label} fontWeight="bold" fill="#fbbf24">{t.yours}</text>
          </g>
        );
      })()}
    </svg>
  );
}

export default function RoceExplorer({ points, es }: { points: RocePoint[]; es: boolean }) {
  const [rev, setRev] = useState(0);
  const [ebit, setEbit] = useState(0);
  const [assets, setAssets] = useState(0);
  const [cl, setCl] = useState(0);

  const ce = assets - cl;
  const ready = rev > 0 && ce > 0 && ebit !== 0;
  const mine = ready ? { turnover: rev / ce, marginPct: (ebit / rev) * 100, roce: (ebit / ce) * 100 } : null;
  const nf = es ? "es-ES" : "en-GB";
  const pct = (v: number) => `${v.toLocaleString(nf, { maximumFractionDigits: 1 })}%`;
  const fmtX = (v: number) => `${v.toLocaleString(nf, { maximumFractionDigits: 2 })}×`;

  const t = es
    ? {
        xAxis: "Ventas ÷ capital empleado (rotación)",
        yAxis: "Margen operativo",
        iso: "ROCE",
        yours: "Tu negocio",
        hollow: "Líneas discontinuas: mismo ROCE (10%, 25%, 50%). Círculos huecos: un año anterior, Ferrari sobre activo total y la cafetería de ejemplo.",
        calc: "Pon tu negocio en el mapa",
        calcHelp: "Cuatro cifras de tus últimas cuentas anuales. Se calcula en tu navegador; no se envía ni se guarda nada.",
        rev: "Ventas",
        ebit: "Beneficio operativo (EBIT)",
        assets: "Activo total",
        cl: "Pasivo corriente",
        margin: "Margen",
        turnover: "Rotación",
        roce: "ROCE",
        offChart: "Con beneficio operativo negativo no hay punto en el mapa: el margen es la primera palanca.",
        ceNeg: "El pasivo corriente supera al activo total: revisa las cifras.",
      }
    : {
        xAxis: "Sales ÷ capital employed (turnover)",
        yAxis: "Operating margin",
        iso: "ROCE",
        yours: "Your business",
        hollow: "Dashed lines: the same ROCE (10%, 25%, 50%). Hollow circles: a past year, Ferrari on total assets, and the illustrative café.",
        calc: "Put your business on the map",
        calcHelp: "Four figures from your latest annual accounts. Worked out in your browser; nothing is sent or stored.",
        rev: "Sales",
        ebit: "Operating profit (EBIT)",
        assets: "Total assets",
        cl: "Current liabilities",
        margin: "Margin",
        turnover: "Turnover",
        roce: "ROCE",
        offChart: "With an operating loss there is no point on the map: margin is the first lever.",
        ceNeg: "Current liabilities are larger than total assets — check the figures.",
      };

  const box = "flex items-center bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 focus-within:border-blue-500 transition";
  const field = (label: string, value: number, set: (v: number) => void, allowNeg = false) => (
    <label className="flex flex-col gap-1 text-xs text-gray-400">
      {label}
      <span className={box}>
        <NumberInput aria-label={label} min={allowNeg ? -1e15 : 0} value={value} onChange={set} className="bg-transparent text-white text-sm w-full outline-none" />
      </span>
    </label>
  );

  return (
    <div className="not-prose my-8 bg-[#0d1426] border border-gray-800 rounded-xl p-3 sm:p-6">
      <div className="hidden sm:block"><Chart L={WIDE} points={points} mine={mine} t={t} fmtX={fmtX} id="roce-plot-wide" /></div>
      <div className="sm:hidden"><Chart L={NARROW} points={points} mine={mine} t={t} fmtX={fmtX} id="roce-plot-narrow" /></div>
      <p className="text-xs text-gray-500 mt-2">{t.hollow}</p>

      <div className="mt-6 border-t border-gray-800 pt-5">
        <p className="text-sm font-semibold text-white mb-1">{t.calc}</p>
        <p className="text-xs text-gray-500 mb-4">{t.calcHelp}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {field(t.rev, rev, setRev)}
          {field(t.ebit, ebit, setEbit, true)}
          {field(t.assets, assets, setAssets)}
          {field(t.cl, cl, setCl)}
        </div>
        {assets > 0 && ce <= 0 && <p className="text-xs text-yellow-300 mt-3">{t.ceNeg}</p>}
        {mine && (
          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            <div className="bg-[#111827] rounded-lg p-3"><div className="text-xs text-gray-400">{t.margin}</div><div className="text-lg font-bold text-white">{pct(mine.marginPct)}</div></div>
            <div className="bg-[#111827] rounded-lg p-3"><div className="text-xs text-gray-400">{t.turnover}</div><div className="text-lg font-bold text-white">{fmtX(mine.turnover)}</div></div>
            <div className="bg-[#111827] rounded-lg p-3"><div className="text-xs text-gray-400">{t.roce}</div><div className="text-lg font-bold text-white">{pct(mine.roce)}</div></div>
          </div>
        )}
        {mine && mine.marginPct <= 0 && <p className="text-xs text-gray-400 mt-3">{t.offChart}</p>}
      </div>
    </div>
  );
}
