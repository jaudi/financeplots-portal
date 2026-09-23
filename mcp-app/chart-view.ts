import { App, applyHostFonts, applyHostStyleVariables, type McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import { layoutChart, THEMES, type Hit, type Scene } from "@/lib/charts/layout";
import { CHARTS_META_KEY, formatValue, type ChartSpec } from "@/lib/charts/spec";
import { FONT_STACK, sceneToSvg } from "@/lib/charts/svg";

// The interactive chart view for MCP Apps hosts (Claude, ChatGPT…). The host
// renders this page in a sandboxed iframe next to a FinancePlots tool call and
// sends it the tool's result; the charts arrive under _meta[CHARTS_META_KEY],
// the same specs the PNGs were drawn from, and are laid out by the same code,
// at the iframe's width, in the host's light or dark theme.
//
// Bundled into one inline HTML page by scripts/build-mcp-app.mjs: no network.

const root = document.getElementById("root")!;
let specs: ChartSpec[] | null = null;
/** Charts whose data table is open; kept across re-renders (theme, width). */
const openTables = new Set<number>();
let lastWidth = 0;
let themeName: "light" | "dark" = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}, ...children: (Node | string)[]) {
  const e = Object.assign(document.createElement(tag), props);
  e.append(...children);
  return e;
}

function message(text: string) {
  root.replaceChildren(el("p", { className: "message", textContent: text }));
}

function render() {
  if (!specs) return;
  const theme = THEMES[themeName];
  document.documentElement.dataset.theme = themeName;
  const width = Math.max(320, Math.floor(root.clientWidth || window.innerWidth));
  lastWidth = width;
  root.replaceChildren(...specs.map((spec, k) => chartCard(spec, k, width, theme)));
}

function chartCard(spec: ChartSpec, k: number, width: number, theme: (typeof THEMES)["dark"]) {
  const height = Math.round(Math.min(420, Math.max(300, width * 0.56)));
  const scene = layoutChart(spec, { width, height, theme });
  const frame = el("div", { className: "frame" });
  frame.innerHTML = sceneToSvg(scene);
  const svg = frame.querySelector("svg")!;
  svg.setAttribute("aria-label", `${spec.title}. ${spec.subtitle ?? ""}`);
  svg.setAttribute("tabindex", "0");
  svg.style.display = "block";
  svg.style.width = "100%";
  svg.style.height = "auto";

  const tip = el("div", { className: "tip", role: "status" });
  tip.hidden = true;
  frame.append(tip);
  wireHover(svg, scene, tip);

  const tableId = `table-${k}`;
  const table = dataTable(spec);
  table.id = tableId;
  table.hidden = !openTables.has(k);
  const toggle = el("button", { className: "toggle", type: "button" });
  toggle.setAttribute("aria-controls", tableId);
  const sync = () => {
    toggle.textContent = table.hidden ? "Show table" : "Hide table";
    toggle.setAttribute("aria-expanded", String(!table.hidden));
  };
  toggle.onclick = () => {
    table.hidden = !table.hidden;
    if (table.hidden) openTables.delete(k);
    else openTables.add(k);
    sync();
  };
  sync();
  return el("section", { className: "card" }, frame, el("div", { className: "actions" }, toggle), table);
}

/** Crosshair and tooltip for the x band under the pointer; arrow keys step through bands. */
function wireHover(svg: SVGSVGElement, scene: Scene, tip: HTMLElement) {
  const NS = "http://www.w3.org/2000/svg";
  const layer = document.createElementNS(NS, "g");
  layer.setAttribute("pointer-events", "none");
  svg.append(layer);
  let current = -1;

  const show = (hit: Hit | undefined) => {
    if (!hit) return hide();
    current = hit.index;
    const { plot, theme } = scene;
    const line = document.createElementNS(NS, "line");
    Object.entries({ x1: hit.cx, x2: hit.cx, y1: plot.y, y2: plot.y + plot.h, stroke: theme.text2, "stroke-width": 1, "stroke-opacity": 0.5 }).forEach(([a, v]) =>
      line.setAttribute(a, String(v)),
    );
    const dots = hit.rows
      .filter((r) => r.y !== null)
      .map((r) => {
        const c = document.createElementNS(NS, "circle");
        Object.entries({ cx: hit.cx, cy: r.y!, r: 4, fill: r.color, stroke: theme.bg, "stroke-width": 2 }).forEach(([a, v]) => c.setAttribute(a, String(v)));
        return c;
      });
    layer.replaceChildren(line, ...dots);

    tip.replaceChildren(
      el("div", { className: "tip-title", textContent: hit.label }),
      ...hit.rows.map((r) => {
        const sw = el("span", { className: "sw" });
        sw.style.background = r.color;
        return el("div", { className: "row" }, sw, el("span", { className: "name", textContent: r.name }), el("span", { className: "val", textContent: r.value }));
      }),
    );
    tip.hidden = false;
    // Place beside the crosshair, flipping sides near the right edge.
    const scale = svg.getBoundingClientRect().width / scene.width;
    const x = hit.cx * scale;
    const w = tip.offsetWidth;
    tip.style.left = `${x + 12 + w > svg.clientWidth ? Math.max(0, x - 12 - w) : x + 12}px`;
    tip.style.top = `${scene.plot.y * scale}px`;
  };
  const hide = () => {
    current = -1;
    layer.replaceChildren();
    tip.hidden = true;
  };
  const hitAt = (clientX: number) => {
    const box = svg.getBoundingClientRect();
    const x = ((clientX - box.left) / box.width) * scene.width;
    return scene.hits.find((h) => x >= h.x && x < h.x + h.w);
  };

  svg.addEventListener("pointermove", (e) => show(hitAt(e.clientX)));
  svg.addEventListener("pointerleave", hide);
  svg.addEventListener("blur", hide);
  svg.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = current < 0 ? 0 : current + (e.key === "ArrowRight" ? 1 : -1);
    show(scene.hits[Math.min(scene.hits.length - 1, Math.max(0, next))]);
  });
}

function dataTable(spec: ChartSpec) {
  const fmt = (v: number | null) => formatValue(v, spec.y.format, spec.y.currency, "full");
  const head = el("tr", {}, el("th", { textContent: spec.x.title ?? "" }), ...spec.series.map((s) => el("th", { textContent: s.name })));
  const rows = spec.x.labels.map((label, i) => el("tr", {}, el("th", { textContent: label }), ...spec.series.map((s) => el("td", { textContent: fmt(s.values[i] ?? null) }))));
  return el("div", { className: "table-wrap" }, el("table", {}, el("caption", { textContent: spec.title }), el("thead", {}, head), el("tbody", {}, ...rows)));
}

function applyContext(ctx: McpUiHostContext | undefined) {
  if (!ctx) return;
  if (ctx.theme === "light" || ctx.theme === "dark") themeName = ctx.theme;
  if (ctx.styles?.variables) applyHostStyleVariables(ctx.styles.variables);
  if (ctx.styles?.css?.fonts) applyHostFonts(ctx.styles.css.fonts);
}

document.documentElement.style.setProperty("--font", FONT_STACK);
message("Drawing the chart…");

const app = new App({ name: "FinancePlots charts", version: "1.0.0" }, {}, { autoResize: true });
app.ontoolresult = (result) => {
  const charts = (result._meta as Record<string, unknown> | undefined)?.[CHARTS_META_KEY];
  if (result.isError) return message("No chart: the tool returned an error.");
  if (!Array.isArray(charts) || charts.length === 0) return message("No chart for this result.");
  specs = charts as ChartSpec[];
  render();
};
app.onhostcontextchanged = (ctx) => {
  applyContext(ctx as McpUiHostContext);
  render();
};

// Re-lay out when the width changes. Height changes are our own doing (a table
// opening) and must not trigger a redraw.
let resizeTimer = 0;
new ResizeObserver(() => {
  const width = Math.max(320, Math.floor(root.clientWidth || window.innerWidth));
  if (width === lastWidth) return;
  clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(render, 120);
}).observe(root);

app.connect().then(() => {
  applyContext(app.getHostContext());
  render();
});
