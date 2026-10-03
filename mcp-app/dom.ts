// Small DOM helpers shared by the chart view's cards.

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}, ...children: (Node | string)[]) {
  const e = Object.assign(document.createElement(tag), props);
  e.append(...children);
  return e;
}

/** Charts whose data table is open; kept across re-renders (theme, width). */
export const openTables = new Set<number>();

/** Show/hide button for card k's data table. */
export function tableToggle(table: HTMLElement, k: number) {
  const tableId = `table-${k}`;
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
  return toggle;
}
