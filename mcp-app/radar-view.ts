import type { Theme } from "@/lib/charts/layout";
import { FLAT, layoutRadar, positionText, TILTED, type RadarSpec, type RadarView } from "@/lib/charts/radar";
import { sceneToSvg } from "@/lib/charts/svg";
import { el, tableToggle } from "./dom";

// The snowflake card in the MCP App view: turnable in 3D. Drag to turn and
// tilt, tap a point for its figure, or step through the ratios with the arrow
// keys (up/down switches company). State is kept per card, so a theme or width
// change doesn't reset the view.

interface RadarState {
  mode: "3d" | "flat";
  goal: RadarView;
  now: RadarView;
  autoTurn: boolean;
  selected: { layer: number; spoke: number } | null;
}

const states = new Map<number, RadarState>();
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

export function radarCard(spec: RadarSpec, k: number, width: number, theme: Theme) {
  const st: RadarState = states.get(k) ?? { mode: "3d", goal: { ...TILTED }, now: { ...TILTED }, autoTurn: !reduceMotion, selected: null };
  states.set(k, st);
  const height = Math.round(Math.min(600, Math.max(400, width * 0.82)));
  const colour = (li: number) => theme.series[li % theme.series.length];

  const frame = el("div", { className: "frame" });
  frame.tabIndex = 0;
  frame.style.touchAction = "pan-y"; // horizontal drags turn the shape; vertical ones still scroll
  frame.setAttribute("role", "img");
  frame.setAttribute("aria-label", `${spec.title}. ${spec.subtitle ?? ""}. Arrow keys step through the ratios.`);
  const tip = el("div", { className: "tip", role: "status" });
  tip.hidden = true;
  frame.append(tip);

  let scene = layoutRadar(spec, { width, height, theme, view: st.now, selected: st.selected });

  const placeTip = () => {
    const sel = st.selected;
    const node = sel && scene.nodes.find((nd) => nd.layer === sel.layer && nd.spoke === sel.spoke);
    if (!sel || !node) return void (tip.hidden = true);
    const layer = spec.layers[sel.layer];
    const sw = el("span", { className: "sw" });
    sw.style.background = colour(sel.layer);
    tip.replaceChildren(
      el("div", { className: "tip-title", textContent: `${spec.spokes[sel.spoke].label} · ${spec.spokes[sel.spoke].group}` }),
      el("div", { className: "row" }, sw, el("span", { className: "name", textContent: layer.name }), el("span", { className: "val", textContent: layer.values[sel.spoke] })),
      el("div", { className: "name", textContent: positionText(spec, sel.layer, sel.spoke) }),
    );
    tip.hidden = false;
    const scale = frame.clientWidth / scene.width;
    const x = node.x * scale, y = node.y * scale;
    const w = tip.offsetWidth, h = tip.offsetHeight;
    tip.style.left = `${Math.max(4, Math.min(frame.clientWidth - w - 4, x - w / 2))}px`;
    tip.style.top = `${y - h - 12 < 0 ? y + 14 : y - h - 12}px`;
  };

  const draw = () => {
    scene = layoutRadar(spec, { width, height, theme, view: st.now, selected: st.selected });
    const holder = document.createElement("div");
    holder.innerHTML = sceneToSvg(scene);
    const svg = holder.firstElementChild as SVGSVGElement;
    Object.assign(svg.style, { display: "block", width: "100%", height: "auto" });
    const old = frame.querySelector("svg");
    if (old) old.replaceWith(svg);
    else frame.prepend(svg);
    placeTip();
  };

  // Ease towards the goal; turn slowly until the user takes over. The loop
  // stops once the view has settled and nothing is turning.
  let raf = 0;
  const tick = () => {
    raf = 0;
    if (!frame.isConnected) return;
    if (st.mode === "3d" && st.autoTurn) st.goal.yaw += 0.004;
    const target = st.mode === "3d" ? st.goal : FLAT;
    const dy = target.yaw - st.now.yaw, dp = target.pitch - st.now.pitch;
    st.now = { yaw: st.now.yaw + dy * 0.2, pitch: st.now.pitch + dp * 0.2 };
    draw();
    if (Math.abs(dy) + Math.abs(dp) > 1e-3 || (st.mode === "3d" && st.autoTurn)) raf = requestAnimationFrame(tick);
  };
  const animate = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };

  const nearest = (clientX: number, clientY: number) => {
    const box = frame.getBoundingClientRect();
    const sx = ((clientX - box.left) / box.width) * scene.width;
    const sy = ((clientY - box.top) / box.height) * scene.height;
    let best: (typeof scene.nodes)[number] | null = null;
    let bestD = 16; // generous, so a fingertip finds the point
    for (const nd of scene.nodes) {
      const d = Math.hypot(nd.x - sx, nd.y - sy);
      if (d < bestD) [best, bestD] = [nd, d];
    }
    return best;
  };

  let press: { x: number; y: number; goal: RadarView; moved: boolean } | null = null;
  frame.addEventListener("pointerdown", (e) => {
    press = { x: e.clientX, y: e.clientY, goal: { ...st.goal }, moved: false };
  });
  frame.addEventListener("pointermove", (e) => {
    if (!press) {
      frame.style.cursor = nearest(e.clientX, e.clientY) ? "pointer" : st.mode === "3d" ? "grab" : "default";
      return;
    }
    if (st.mode !== "3d") return;
    if (!press.moved && Math.hypot(e.clientX - press.x, e.clientY - press.y) < 5) return; // a tap, not a drag
    if (!press.moved) {
      try {
        frame.setPointerCapture(e.pointerId);
      } catch {
        // the pointer is already gone; turning still works while it's over the chart
      }
    }
    press.moved = true;
    st.autoTurn = false;
    st.goal = {
      yaw: press.goal.yaw - (e.clientX - press.x) * 0.008,
      pitch: Math.max(0.15, Math.min(1.3, press.goal.pitch - (e.clientY - press.y) * 0.006)),
    };
    animate();
  });
  frame.addEventListener("pointerup", (e) => {
    if (press && !press.moved) {
      const nd = nearest(e.clientX, e.clientY);
      const same = nd && st.selected?.layer === nd.layer && st.selected.spoke === nd.spoke;
      st.selected = nd && !same ? { layer: nd.layer, spoke: nd.spoke } : null;
      if (nd) st.autoTurn = false;
      draw();
    }
    press = null;
  });
  frame.addEventListener("pointercancel", () => (press = null));
  frame.addEventListener("keydown", (e) => {
    const n = spec.spokes.length, layers = spec.layers.length;
    if (e.key === "Escape") st.selected = null;
    else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      const step = e.key === "ArrowRight" ? 1 : -1;
      const cur = st.selected?.spoke ?? (step > 0 ? -1 : 0);
      st.selected = { layer: st.selected?.layer ?? 0, spoke: (cur + step + n) % n };
      st.autoTurn = false;
    } else if ((e.key === "ArrowUp" || e.key === "ArrowDown") && st.selected && layers > 1) {
      st.selected = { ...st.selected, layer: (st.selected.layer + (e.key === "ArrowUp" ? 1 : layers - 1)) % layers };
    } else return;
    e.preventDefault();
    draw();
  });

  const modes = el("div", { className: "modes" });
  for (const m of ["3d", "flat"] as const) {
    const b = el("button", { className: "toggle", type: "button", textContent: m === "3d" ? "3D" : "Flat" });
    b.setAttribute("aria-pressed", String(st.mode === m));
    b.onclick = () => {
      st.mode = m;
      modes.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      animate();
    };
    modes.append(b);
  }

  draw();
  animate();
  const table = radarTable(spec);
  const hint = el("span", { className: "hint", textContent: "Drag to turn · tap a point for its figure" });
  return el("section", { className: "card" }, frame, el("div", { className: "actions" }, modes, hint, tableToggle(table, k)), table);
}

function radarTable(spec: RadarSpec) {
  const head = el("tr", {}, el("th", { textContent: "Ratio" }), ...spec.layers.map((l) => el("th", { textContent: `${l.name} (vs ${l.within})` })));
  const rows = spec.spokes.map((s, i) =>
    el(
      "tr",
      {},
      el("th", { textContent: s.label }),
      ...spec.layers.map((l) => {
        const p = l.positions[i];
        return el("td", { textContent: p === null ? "—" : `${l.values[i]} · higher than ${Math.round(p)}%` });
      }),
    ),
  );
  return el(
    "div",
    { className: "table-wrap" },
    el("table", {}, el("caption", { textContent: `${spec.title}: each figure and its position within the company's index` }), el("thead", {}, head), el("tbody", {}, ...rows)),
  );
}
