// Bookkeeping Playground — the double-entry engine and the coffee-cart story
// behind /tools/bookkeeping. Everything here is pure so it can be tested; the
// screen is components/BookkeepingPlayground.tsx.
//
// Amounts are whole pence (integers) so totals never pick up float dust.

export type AccountType = "asset" | "liability" | "equity" | "income" | "expense";
type L = { en: string; es: string };

export interface Account {
  code: string;
  type: AccountType;
  name: L;
  /** Contra accounts sit in a group but run the other way (drawings, accumulated depreciation). */
  contra?: boolean;
  /** Used in the guided story, so offered as answers in the quiz. */
  story?: boolean;
}

export const ACCOUNTS: Account[] = [
  { code: "1000", type: "asset", story: true, name: { en: "Bank", es: "Banco" } },
  { code: "1100", type: "asset", story: true, name: { en: "Trade receivables (debtors)", es: "Clientes (deudores)" } },
  { code: "1200", type: "asset", story: true, name: { en: "Inventory (stock)", es: "Existencias" } },
  { code: "1300", type: "asset", name: { en: "Prepayments", es: "Gastos anticipados" } },
  { code: "1500", type: "asset", story: true, name: { en: "Equipment", es: "Maquinaria" } },
  { code: "1510", type: "asset", contra: true, story: true, name: { en: "Accumulated depreciation", es: "Amortización acumulada" } },
  { code: "2000", type: "liability", story: true, name: { en: "Trade payables (creditors)", es: "Proveedores (acreedores)" } },
  { code: "2100", type: "liability", story: true, name: { en: "VAT owed to HMRC", es: "IVA a pagar a Hacienda" } },
  { code: "2200", type: "liability", name: { en: "Accruals", es: "Gastos devengados" } },
  { code: "2500", type: "liability", name: { en: "Bank loan", es: "Préstamo bancario" } },
  { code: "3000", type: "equity", story: true, name: { en: "Owner's capital", es: "Capital del dueño" } },
  { code: "3100", type: "equity", contra: true, story: true, name: { en: "Drawings", es: "Retiradas del dueño" } },
  { code: "4000", type: "income", story: true, name: { en: "Sales", es: "Ventas" } },
  { code: "4100", type: "income", name: { en: "Other income", es: "Otros ingresos" } },
  { code: "5000", type: "expense", story: true, name: { en: "Cost of sales", es: "Coste de ventas" } },
  { code: "6000", type: "expense", story: true, name: { en: "Rent", es: "Alquiler" } },
  { code: "6100", type: "expense", story: true, name: { en: "Wages", es: "Sueldos" } },
  { code: "6200", type: "expense", story: true, name: { en: "Depreciation", es: "Amortización" } },
  { code: "6300", type: "expense", name: { en: "Utilities", es: "Suministros" } },
  { code: "6400", type: "expense", name: { en: "Marketing", es: "Marketing" } },
  { code: "6500", type: "expense", name: { en: "Interest", es: "Intereses" } },
];

export const STORY_ACCOUNTS = ACCOUNTS.filter((a) => a.story);

const BY_CODE = new Map(ACCOUNTS.map((a) => [a.code, a]));

export function account(code: string): Account {
  const a = BY_CODE.get(code);
  if (!a) throw new Error(`Unknown account ${code}`);
  return a;
}

/** The side that makes an account go up: assets and expenses grow with a
 *  debit, the rest with a credit; contra accounts run the other way. */
export function normalSide(code: string): "debit" | "credit" {
  const a = account(code);
  const debit = a.type === "asset" || a.type === "expense";
  return debit !== !!a.contra ? "debit" : "credit";
}

export interface Line {
  account: string;
  debit: number; // pence
  credit: number; // pence
}

export interface Entry {
  id: string;
  memo: string;
  lines: Line[];
  /** The story step this entry came from, if any. */
  step?: number;
}

export function totals(lines: Line[]) {
  return lines.reduce(
    (t, l) => ({ debit: t.debit + l.debit, credit: t.credit + l.credit }),
    { debit: 0, credit: 0 },
  );
}

/** A postable entry: every line has an account and exactly one positive side,
 *  and debits equal credits. */
export function isBalanced(lines: Line[]): boolean {
  if (lines.length < 2) return false;
  for (const l of lines) {
    if (!BY_CODE.has(l.account)) return false;
    if (!Number.isInteger(l.debit) || !Number.isInteger(l.credit)) return false;
    if (l.debit < 0 || l.credit < 0) return false;
    if ((l.debit > 0) === (l.credit > 0)) return false;
  }
  const t = totals(lines);
  return t.debit > 0 && t.debit === t.credit;
}

/** Whether a line makes its account go up (true) or down (false). */
export function lineIncreases(l: Line): boolean {
  return (l.debit > 0 ? "debit" : "credit") === normalSide(l.account);
}

/** Net debit (debits minus credits) per account touched by the entries. */
export function netDebits(entries: Entry[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const e of entries) for (const l of e.lines) out.set(l.account, (out.get(l.account) ?? 0) + l.debit - l.credit);
  return out;
}

export interface TrialRow { code: string; debit: number; credit: number }

/** Each account's closing balance on its side; the two columns always agree. */
export function trialBalance(entries: Entry[]): { rows: TrialRow[]; debit: number; credit: number } {
  const rows = [...netDebits(entries)]
    .filter(([, n]) => n !== 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, n]) => ({ code, debit: Math.max(n, 0), credit: Math.max(-n, 0) }));
  const t = rows.reduce((s, r) => ({ debit: s.debit + r.debit, credit: s.credit + r.credit }), { debit: 0, credit: 0 });
  return { rows, ...t };
}

export interface StatementRow { code: string; amount: number }

export interface Statements {
  income: StatementRow[];
  costOfSales: StatementRow[];
  overheads: StatementRow[];
  revenue: number;
  grossProfit: number;
  profit: number;
  assets: StatementRow[];
  liabilities: StatementRow[];
  equity: StatementRow[]; // capital and drawings; profit is added on its own line
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number; // includes profit for the period
}

/** The P&L and balance sheet. Amounts are shown the way an accountant reads
 *  them: income, liabilities and equity as positives; contra accounts negative. */
export function statements(entries: Entry[]): Statements {
  const net = netDebits(entries);
  const rows = (pred: (a: Account) => boolean, sign: 1 | -1) =>
    [...net]
      .filter(([code, n]) => n !== 0 && pred(account(code)))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([code, n]) => ({ code, amount: sign * n }));
  const sum = (r: StatementRow[]) => r.reduce((s, x) => s + x.amount, 0);

  const income = rows((a) => a.type === "income", -1);
  const costOfSales = rows((a) => a.code === "5000", 1);
  const overheads = rows((a) => a.type === "expense" && a.code !== "5000", 1);
  const revenue = sum(income);
  const grossProfit = revenue - sum(costOfSales);
  const profit = grossProfit - sum(overheads);

  const assets = rows((a) => a.type === "asset", 1);
  const liabilities = rows((a) => a.type === "liability", -1);
  const equity = rows((a) => a.type === "equity", -1);
  const totalAssets = sum(assets);
  const totalLiabilities = sum(liabilities);
  const totalEquity = sum(equity) + profit;

  return { income, costOfSales, overheads, revenue, grossProfit, profit, assets, liabilities, equity, totalAssets, totalLiabilities, totalEquity };
}

// ── The story ────────────────────────────────────────────────────────────────

export interface Step {
  title: L;
  text: L;
  why: L;
  lines: Line[];
}

const pence = (pounds: number) => Math.round(pounds * 100);
const dr = (account: string, pounds: number): Line => ({ account, debit: pence(pounds), credit: 0 });
const cr = (account: string, pounds: number): Line => ({ account, debit: 0, credit: pence(pounds) });

/** One month of a coffee cart, in twelve transactions. It ends with £600 of
 *  profit, £5,000 in the bank (from £10,000) and £700 owed to HMRC — the
 *  point being that profit is not cash. */
export const STORY: Step[] = [
  {
    title: { en: "You put in your savings", es: "Pones tus ahorros" },
    text: { en: "You open a business bank account for your coffee cart and pay in £10,000 of your own savings.", es: "Abres una cuenta bancaria para tu carrito de café e ingresas 10.000 £ de tus ahorros." },
    why: { en: "The business is separate from you. The bank balance goes up, and the business now owes you that money back as capital.", es: "El negocio es distinto de ti. El banco sube y el negocio te debe ese dinero como capital." },
    lines: [dr("1000", 10000), cr("3000", 10000)],
  },
  {
    title: { en: "Buy a coffee machine", es: "Compras una cafetera" },
    text: { en: "You buy a second-hand espresso machine for £4,800 from a private seller (no VAT) and pay by bank transfer.", es: "Compras una cafetera de segunda mano por 4.800 £ a un particular (sin IVA) y pagas por transferencia." },
    why: { en: "One asset swaps for another: cash goes down, equipment goes up. It isn't an expense yet, because the machine will last years.", es: "Un activo se cambia por otro: baja el banco y sube la maquinaria. Aún no es gasto, porque la cafetera durará años." },
    lines: [dr("1500", 4800), cr("1000", 4800)],
  },
  {
    title: { en: "Stock up on credit", es: "Compras género a crédito" },
    text: { en: "Your supplier delivers £1,500 of beans, milk and cups. You have 30 days to pay.", es: "Tu proveedor te entrega 1.500 £ de café, leche y vasos. Tienes 30 días para pagar." },
    why: { en: "Nothing leaves the bank yet. You now own stock, and you owe the supplier: a creditor.", es: "Aún no sale nada del banco. Ahora tienes existencias y le debes al proveedor: un acreedor." },
    lines: [dr("1200", 1500), cr("2000", 1500)],
  },
  {
    title: { en: "A busy week of sales", es: "Una semana de ventas" },
    text: { en: "Customers pay £3,000 by card. Prices include 20% VAT.", es: "Los clientes pagan 3.000 £ con tarjeta. Los precios incluyen un 20 % de IVA." },
    why: { en: "Only £2,500 is your sale. The other £500 is VAT you collected for HMRC, so it's a debt, not income.", es: "Solo 2.500 £ son tu venta. Los otros 500 £ son IVA que cobraste para Hacienda: una deuda, no un ingreso." },
    lines: [dr("1000", 3000), cr("4000", 2500), cr("2100", 500)],
  },
  {
    title: { en: "What the coffee cost you", es: "Lo que te costó el café" },
    text: { en: "The drinks you sold used up £900 of the stock you bought.", es: "Las bebidas que vendiste gastaron 900 £ de tus existencias." },
    why: { en: "Stock becomes an expense only when it's sold, so the cost lands in the same month as the sales it earned (matching).", es: "Las existencias solo son gasto cuando se venden, así el coste cae en el mismo mes que las ventas (correlación)." },
    lines: [dr("5000", 900), cr("1200", 900)],
  },
  {
    title: { en: "Cater an office breakfast", es: "Un desayuno para una oficina" },
    text: { en: "You cater a breakfast for a local office and invoice them £1,200 including VAT. They'll pay next month.", es: "Sirves un desayuno a una oficina y les facturas 1.200 £ con IVA. Pagarán el mes que viene." },
    why: { en: "You earned it now, so it's a sale now, even with no cash yet. The office becomes a debtor.", es: "Lo has ganado ya, así que es venta ya, aunque no haya cobro. La oficina pasa a ser deudora." },
    lines: [dr("1100", 1200), cr("4000", 1000), cr("2100", 200)],
  },
  {
    title: { en: "Pay the rent", es: "Pagas el alquiler" },
    text: { en: "You pay £800 for your pitch at the market this month.", es: "Pagas 800 £ por tu puesto en el mercado este mes." },
    why: { en: "Used up this month and gone: an expense. Expenses grow with a debit, the bank falls with a credit.", es: "Se consume este mes: es un gasto. Los gastos suben con un cargo y el banco baja con un abono." },
    lines: [dr("6000", 800), cr("1000", 800)],
  },
  {
    title: { en: "Pay your barista", es: "Pagas a tu barista" },
    text: { en: "Your part-time barista's wages for the month are £1,100.", es: "El sueldo del mes de tu barista a media jornada es de 1.100 £." },
    why: { en: "Another expense paid from the bank. (Real payroll adds PAYE and National Insurance; we keep it simple.)", es: "Otro gasto pagado desde el banco. (Una nómina real añade retenciones y Seguridad Social; aquí lo simplificamos.)" },
    lines: [dr("6100", 1100), cr("1000", 1100)],
  },
  {
    title: { en: "Pay the supplier", es: "Pagas al proveedor" },
    text: { en: "You pay the £1,500 you owe for the beans and milk.", es: "Pagas los 1.500 £ que debías del café y la leche." },
    why: { en: "No new expense: you recorded the stock when it arrived. Paying just clears the debt and lowers the bank.", es: "No hay gasto nuevo: lo anotaste al recibir el género. Pagar solo cancela la deuda y baja el banco." },
    lines: [dr("2000", 1500), cr("1000", 1500)],
  },
  {
    title: { en: "The office pays up", es: "La oficina te paga" },
    text: { en: "The office pays its £1,200 invoice into your bank.", es: "La oficina ingresa en tu banco su factura de 1.200 £." },
    why: { en: "Not a new sale: that was booked when you invoiced. Cash comes in and the debtor goes away.", es: "No es una venta nueva: se anotó al facturar. Entra dinero y desaparece el deudor." },
    lines: [dr("1000", 1200), cr("1100", 1200)],
  },
  {
    title: { en: "The machine wears out", es: "La cafetera se desgasta" },
    text: { en: "The £4,800 machine should last four years, so a month of it is used up: £100.", es: "La cafetera de 4.800 £ debería durar cuatro años, así que se consume un mes: 100 £." },
    why: { en: "Depreciation spreads the cost over the machine's life. No cash moves; the machine's book value goes down.", es: "La amortización reparte el coste a lo largo de su vida. No se mueve dinero; baja el valor contable." },
    lines: [dr("6200", 100), cr("1510", 100)],
  },
  {
    title: { en: "Pay yourself", es: "Te pagas a ti" },
    text: { en: "You take £1,000 out of the business for yourself.", es: "Sacas 1.000 £ del negocio para ti." },
    why: { en: "Drawings aren't an expense: they don't reduce profit, they reduce what the business owes you.", es: "Las retiradas no son un gasto: no bajan el beneficio, bajan lo que el negocio te debe." },
    lines: [dr("3100", 1000), cr("1000", 1000)],
  },
];

/** The story's entries up to (and not including) step `n`. */
export function storyEntries(n: number): Entry[] {
  return STORY.slice(0, n).map((s, i) => ({ id: `s${i + 1}`, memo: s.title.en, lines: s.lines, step: i + 1 }));
}

/** A quiz answer is right if the chosen account is on that side of the step's entry. */
export function isRightAnswer(step: Step, side: "debit" | "credit", code: string): boolean {
  return step.lines.some((l) => l.account === code && (side === "debit" ? l.debit > 0 : l.credit > 0));
}

/** Parse a typed amount ("1,250.50", "£300") into pence; NaN if it isn't one. */
export function parseAmount(s: string): number {
  const clean = s.replace(/[£,\s]/g, "");
  if (clean === "") return 0;
  if (!/^\d+(\.\d{0,2})?$/.test(clean)) return NaN;
  return Math.round(Number(clean) * 100);
}
