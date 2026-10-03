"use client";

import {
  Area, AreaChart, CartesianGrid, ComposedChart, Legend, Line, ReferenceLine, ResponsiveContainer,
  Sankey, Tooltip, XAxis, YAxis,
} from "recharts";
import type { GrowthRow } from "@/lib/planner";

// The Financial Journey's four charts, one per step, also shown small together
// on the report (and copied into the PDF as images — see chartImages).

const fmt = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 0 });
const money = (c: string, v: number) =>
  Math.abs(v) >= 1e6 ? `${c}${(v / 1e6).toFixed(1)}M` : Math.abs(v) >= 1e3 ? `${c}${(v / 1e3).toFixed(0)}k` : `${c}${fmt(v)}`;

const AXIS = { stroke: "#374151", tick: { fill: "#6b7280", fontSize: 11 } };
const GRID = <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />;
const TOOLTIP = { backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", fontSize: 12 };

// ── Step 1: where the money goes (Sankey) ───────────────────────────────────

export interface FlowItem { name: string; value: number; color: string }

interface SankeyNodeProps { x: number; y: number; width: number; height: number; payload: { name: string; value: number; color: string; side: "left" | "middle" | "right" } }
interface SankeyLinkProps { sourceX: number; targetX: number; sourceY: number; targetY: number; sourceControlX: number; targetControlX: number; linkWidth: number; payload: { target: { color: string } } }

export function BudgetFlow({
  currency, income, categories, labels, height = 380,
}: {
  currency: string;
  income: number;
  categories: FlowItem[];
  labels: { income: string; spending: string; savings: string; shortfall: string };
  height?: number;
}) {
  const spending = categories.reduce((a, c) => a + c.value, 0);
  const saved = income - spending;
  if (income <= 0 && spending <= 0) return null;
  const pct = (v: number) => (income > 0 ? ` · ${Math.round((v / income) * 100)}%` : "");

  // Two columns: take-home pay (plus any shortfall) on the left; savings, then
  // each spending category, on the right. A middle "spending" node made the
  // savings flow cross it, so it was dropped.
  const nodes: { name: string; color: string; side: "left" | "middle" | "right" }[] = [
    { name: labels.income, color: "#22c55e", side: "left" },
  ];
  const links: { source: number; target: number; value: number }[] = [];
  const shortfall = saved < 0 ? nodes.push({ name: labels.shortfall, color: "#ef4444", side: "left" }) - 1 : -1;
  if (saved > 0) {
    nodes.push({ name: labels.savings, color: "#3b82f6", side: "right" });
    links.push({ source: 0, target: nodes.length - 1, value: saved });
  }
  // Spending is paid from income first; whatever income can't cover comes from the shortfall.
  let fromIncome = Math.max(0, income);
  for (const c of categories.filter((c) => c.value > 0)) {
    nodes.push({ name: c.name, color: c.color, side: "right" });
    const target = nodes.length - 1;
    const a = Math.min(fromIncome, c.value);
    if (a > 0) links.push({ source: 0, target, value: a });
    if (c.value - a > 0 && shortfall >= 0) links.push({ source: shortfall, target, value: c.value - a });
    fromIncome -= a;
  }

  const Node = ({ x, y, width, height: h, payload }: SankeyNodeProps) => {
    const right = payload.side === "right";
    const tx = right ? x + width + 8 : payload.side === "middle" ? x + width / 2 : x - 8;
    const anchor = right ? "start" : payload.side === "middle" ? "middle" : "end";
    const ty = payload.side === "middle" ? y - 8 : y + h / 2;
    return (
      <g>
        <rect x={x} y={y} width={width} height={Math.max(2, h)} rx={2} fill={payload.color} />
        <text x={tx} y={ty} textAnchor={anchor} dominantBaseline="middle" fontSize={11} fill="#e5e7eb">
          {payload.name}
          <tspan fill="#9ca3af">{` ${currency}${fmt(payload.value)}${payload.side === "right" ? pct(payload.value) : ""}`}</tspan>
        </text>
      </g>
    );
  };
  const Link = ({ sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, payload }: SankeyLinkProps) => (
    <path
      d={`M${sourceX},${sourceY}C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
      fill="none"
      stroke={payload.target.color}
      strokeOpacity={0.35}
      strokeWidth={Math.max(1, linkWidth)}
    />
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <Sankey
        data={{ nodes, links }}
        nodeWidth={10}
        nodePadding={14}
        iterations={0}
        margin={{ top: 10, right: 190, bottom: 10, left: 150 }}
        node={(p: unknown) => <Node {...(p as SankeyNodeProps)} />}
        link={(p: unknown) => <Link {...(p as SankeyLinkProps)} />}
      >
        <Tooltip contentStyle={TOOLTIP} formatter={(v: unknown) => `${currency}${fmt(Number(v))}`} />
      </Sankey>
    </ResponsiveContainer>
  );
}

// ── Step 2: when each debt is repaid ─────────────────────────────────────────

export function DebtPayoff({
  currency, rows, debts, debtFreeYears, debtFreeLabel, yearLabel, height = 320, compact = false,
}: {
  currency: string;
  rows: Record<string, number>[];
  debts: { key: string; name: string; color: string }[];
  debtFreeYears: number;
  debtFreeLabel: string;
  yearLabel: string;
  height?: number;
  compact?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={rows} margin={{ top: 24, right: 24, bottom: compact ? 0 : 20, left: 10 }}>
        {GRID}
        <XAxis dataKey="year" {...AXIS} label={compact ? undefined : { value: yearLabel, position: "insideBottom", offset: -10, fill: "#6b7280", fontSize: 11 }} />
        <YAxis {...AXIS} width={64} tickFormatter={(v) => money(currency, v)} />
        <Tooltip contentStyle={TOOLTIP} labelFormatter={(y) => `${yearLabel} ${y}`} formatter={(v: unknown) => `${currency}${fmt(Number(v))}`} />
        {!compact && <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12, paddingTop: 16 }} />}
        {debts.map((d) => (
          <Area key={d.key} type="monotone" dataKey={d.key} name={d.name} stackId="d" stroke={d.color} fill={d.color} fillOpacity={0.55} isAnimationActive={!compact} />
        ))}
        {debtFreeYears > 0 && (
          <ReferenceLine x={debtFreeYears} stroke="#22c55e" strokeDasharray="4 4" label={{ value: debtFreeLabel, position: "insideTopRight", fill: "#4ade80", fontSize: 12 }} />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Step 3: growth, with lower and higher returns and the crossover year ─────

export function GrowthChart({
  currency, rows, crossover, labels, height = 340, compact = false,
}: {
  currency: string;
  rows: GrowthRow[];
  crossover: number | null;
  labels: { paidIn: string; growth: string; low: string; high: string; crossover: string; year: string };
  height?: number;
  compact?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={rows} margin={{ top: 24, right: 24, bottom: compact ? 0 : 20, left: 10 }}>
        {GRID}
        <XAxis dataKey="year" {...AXIS} label={compact ? undefined : { value: labels.year, position: "insideBottom", offset: -10, fill: "#6b7280", fontSize: 11 }} />
        <YAxis {...AXIS} width={70} tickFormatter={(v) => money(currency, v)} />
        <Tooltip contentStyle={TOOLTIP} labelFormatter={(y) => `${labels.year} ${y}`} formatter={(v: unknown) => `${currency}${fmt(Number(v))}`} />
        {!compact && <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12, paddingTop: 16 }} />}
        <Area type="monotone" dataKey="contributions" name={labels.paidIn} stackId="g" stroke="#1d4ed8" fill="#1d4ed8" fillOpacity={0.75} isAnimationActive={!compact} />
        <Area type="monotone" dataKey="interest" name={labels.growth} stackId="g" stroke="#22c55e" fill="#22c55e" fillOpacity={0.7} isAnimationActive={!compact} />
        <Line type="monotone" dataKey="high" name={labels.high} stroke="#94a3b8" strokeDasharray="5 5" dot={false} isAnimationActive={!compact} />
        <Line type="monotone" dataKey="low" name={labels.low} stroke="#e2e8f0" strokeDasharray="2 4" dot={false} isAnimationActive={!compact} />
        {crossover !== null && (
          <ReferenceLine x={crossover} stroke="#fbbf24" strokeDasharray="4 4" label={{ value: labels.crossover, position: "insideTopLeft", fill: "#fbbf24", fontSize: 12 }} />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ── Step 4: the model mix from today to retirement ───────────────────────────

export function GlidePathChart({
  rows, age, retirementAge, series, labels, height = 320, compact = false,
}: {
  rows: { age: number; stocks: number; bonds: number; cash: number; alternatives: number }[];
  age: number;
  retirementAge: number;
  series: { key: "stocks" | "bonds" | "cash" | "alternatives"; name: string; color: string }[];
  labels: { you: string; retirement: string; age: string };
  height?: number;
  compact?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={rows} margin={{ top: 24, right: 24, bottom: compact ? 0 : 20, left: 0 }}>
        {GRID}
        <XAxis dataKey="age" type="number" domain={["dataMin", "dataMax"]} allowDecimals={false} tickCount={8} {...AXIS} label={compact ? undefined : { value: labels.age, position: "insideBottom", offset: -10, fill: "#6b7280", fontSize: 11 }} />
        <YAxis {...AXIS} width={44} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} />
        <Tooltip contentStyle={TOOLTIP} labelFormatter={(a) => `${labels.age} ${a}`} formatter={(v: unknown) => `${Number(v)}%`} />
        {!compact && <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12, paddingTop: 16 }} />}
        {series.map((s) => (
          <Area key={s.key} type="linear" dataKey={s.key} name={s.name} stackId="a" stroke={s.color} fill={s.color} fillOpacity={0.7} isAnimationActive={!compact} />
        ))}
        <ReferenceLine x={age} stroke="#ffffff" strokeDasharray="4 4" label={{ value: labels.you, position: "insideTopLeft", fill: "#ffffff", fontSize: 12 }} />
        {retirementAge > age && (
          <ReferenceLine x={retirementAge} stroke="#9ca3af" strokeDasharray="2 4" label={{ value: labels.retirement, position: "insideTopRight", fill: "#9ca3af", fontSize: 12 }} />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── PDF: the report's charts as images ──────────────────────────────────────

/** Rasterises every chart SVG inside `root` (in order) to a PNG data URL, on the
 *  card's dark background, so the PDF shows the same pictures as the page. */
export async function chartImages(root: HTMLElement, scale = 2): Promise<string[]> {
  const svgs = [...root.querySelectorAll<SVGSVGElement>("svg.recharts-surface")];
  return Promise.all(
    svgs.map(
      (svg) =>
        new Promise<string>((resolve, reject) => {
          const { width, height } = svg.getBoundingClientRect();
          const clone = svg.cloneNode(true) as SVGSVGElement;
          clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
          clone.setAttribute("width", String(width));
          clone.setAttribute("height", String(height));
          clone.style.fontFamily = "Helvetica, Arial, sans-serif";
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = width * scale;
            canvas.height = height * scale;
            const ctx = canvas.getContext("2d")!;
            ctx.fillStyle = "#0d1426";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/png"));
          };
          img.onerror = reject;
          img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`;
        }),
    ),
  );
}
