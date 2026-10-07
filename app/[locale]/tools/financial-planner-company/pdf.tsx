import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111827",
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: "2px solid #1d4ed8",
  },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#0a0f1e" },
  headerSub: { fontSize: 11, color: "#4b5563", marginTop: 4 },
  headerRight: { alignItems: "flex-end" },
  headerMeta: { fontSize: 9, color: "#9ca3af", marginBottom: 4 },
  logoImg: { width: 90, height: 34, objectFit: "contain" },
  // Section label
  sectionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#3b82f6",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
  },
  // KPI row
  kpiRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  kpiCard: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    borderLeft: "3px solid #3b82f6",
  },
  kpiCardGreen: { borderLeft: "3px solid #22c55e" },
  kpiCardAmber: { borderLeft: "3px solid #f59e0b" },
  kpiCardRed:   { borderLeft: "3px solid #ef4444" },
  kpiCardPurple: { borderLeft: "3px solid #8b5cf6" },
  kpiLabel: { fontSize: 7, color: "#9ca3af", textTransform: "uppercase", marginBottom: 3 },
  kpiValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#0a0f1e" },
  kpiSub: { fontSize: 7, color: "#9ca3af", marginTop: 2 },
  // Table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1d4ed8",
    padding: "6 8",
    borderTopLeftRadius: 4, borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  tableRow: {
    flexDirection: "row",
    padding: "5 8",
    borderBottom: "1px solid #f1f5f9",
  },
  tableRowAlt: {
    flexDirection: "row",
    padding: "5 8",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #f1f5f9",
  },
  tableRowHighlight: {
    flexDirection: "row",
    padding: "5 8",
    backgroundColor: "#eff6ff",
    borderBottom: "1px solid #dbeafe",
  },
  tableCell: { flex: 1, fontSize: 8, color: "#374151" },
  tableCellBold: { flex: 1, fontSize: 8, fontFamily: "Helvetica-Bold", color: "#0a0f1e" },
  tableCellGreen: { flex: 1, fontSize: 8, color: "#16a34a" },
  tableCellRed: { flex: 1, fontSize: 8, color: "#dc2626" },
  tableCellRight: { flex: 1, fontSize: 8, color: "#374151", textAlign: "right" },
  tableCellBoldRight: { flex: 1, fontSize: 8, fontFamily: "Helvetica-Bold", color: "#0a0f1e", textAlign: "right" },
  // Exit range box
  exitRangeBox: {
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    padding: "12 14",
    marginTop: 6,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 20,
  },
  exitRangeLabel: { fontSize: 7, color: "#6b7280", textTransform: "uppercase", marginBottom: 3 },
  exitRangeValue: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#1d4ed8" },
  exitRangeValueAmber: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#d97706" },
  exitRangeValueGreen: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#16a34a" },
  exitRangeValueGray: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#374151" },
  exitRangeDash: { fontSize: 18, color: "#9ca3af", paddingBottom: 2 },
  // Checklist
  checklistRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 5,
    borderBottom: "1px solid #f1f5f9",
  },
  checklistIcon: { fontSize: 10, width: 16 },
  checklistLabelPass: { fontSize: 9, color: "#16a34a", flex: 1 },
  checklistLabelAmber: { fontSize: 9, color: "#d97706", flex: 1 },
  checklistLabelFail: { fontSize: 9, color: "#dc2626", flex: 1 },
  // Actions
  actionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },
  actionBullet: {
    width: 16,
    height: 16,
    backgroundColor: "#dbeafe",
    borderRadius: 8,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#1d4ed8",
    textAlign: "center",
    paddingTop: 3,
  },
  actionText: { flex: 1, fontSize: 8, color: "#374151", lineHeight: 1.5 },
  // Footer
  footer: {
    position: "absolute",
    bottom: 28,
    left: 40,
    right: 40,
    borderTop: "1px solid #e5e7eb",
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 8, color: "#9ca3af" },
});

export interface CompanyPdfProps {
  currency: string;
  // P&L
  revenue: number;
  grossProfit: number;
  grossMargin: number;
  ebitda: number;
  ebitdaMargin: number;
  ebit: number;
  netProfit: number;
  netMargin: number;
  totalOpex: number;
  // Cash Flow
  operatingCF: number;
  freeCashFlow: number;
  netCashFlow: number;
  cashConversion: number;
  // Balance Sheet
  totalAssets: number;
  netDebt: number;
  bookEquity: number;
  leverage: number;
  // Valuation
  eqByEbitda: number;
  eqByRev: number;
  eqByPE: number;
  dcfEquity: number;
  blendedEquity: number;
  exitLow: number;
  exitHigh: number;
  evEbitdaMult: number;
  revMult: number;
  peMult: number;
  // Exit
  exitChecklist: { label: string; pass: boolean; amber: boolean }[];
  dynamicActions: string[];
  date: string;
}

const fmt = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 0 });
const fmtPct = (n: number) => `${n.toFixed(1)}%`;

export function CompanyPdf(props: CompanyPdfProps) {
  const {
    currency,
    revenue, grossProfit, grossMargin,
    ebitda, ebitdaMargin, ebit,
    netProfit, netMargin,
    operatingCF, freeCashFlow, netCashFlow, cashConversion,
    totalAssets, netDebt, bookEquity, leverage,
    eqByEbitda, eqByRev, eqByPE, dcfEquity, blendedEquity,
    exitLow, exitHigh,
    evEbitdaMult, revMult, peMult,
    exitChecklist, dynamicActions, date,
  } = props;

  const c = currency;

  const Header = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>Company Financial Report</Text>
        <Text style={styles.headerSub}>FinancePlots · financeplots.com</Text>
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.headerMeta}>Generated {date}</Text>
        <Image style={styles.logoImg} src="https://www.financeplots.com/logo-sm.png" />
      </View>
    </View>
  );

  const Footer = () => (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>FinancePlots · financeplots.com</Text>
      <Text style={styles.footerText}>For informational purposes only · Not financial advice</Text>
    </View>
  );

  // P&L waterfall rows
  const plRows = [
    { label: "Revenue",       value: revenue,     indent: false },
    { label: "Cost of Goods Sold", value: -(revenue - grossProfit), indent: true },
    { label: "Gross Profit",  value: grossProfit, indent: false, highlight: true },
    { label: "Total OpEx",    value: -props.totalOpex, indent: true },
    { label: "EBITDA",        value: ebitda,      indent: false, highlight: true },
    { label: "EBIT",          value: ebit,        indent: false, highlight: true },
    { label: "Net Profit",    value: netProfit,   indent: false, highlight: true },
  ];

  return (
    <Document>
      {/* ── PAGE 1: P&L + Cash Flow ── */}
      <Page size="A4" style={styles.page}>
        <Header />

        {/* P&L KPI Cards */}
        <Text style={styles.sectionLabel}>P&L Summary</Text>
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Revenue</Text>
            <Text style={styles.kpiValue}>{c}{fmt(revenue)}</Text>
            <Text style={styles.kpiSub}>Total annual revenue</Text>
          </View>
          <View style={[styles.kpiCard, grossMargin >= 40 ? styles.kpiCardGreen : styles.kpiCardAmber]}>
            <Text style={styles.kpiLabel}>Gross Margin</Text>
            <Text style={styles.kpiValue}>{fmtPct(grossMargin)}</Text>
            <Text style={styles.kpiSub}>{c}{fmt(grossProfit)} gross profit</Text>
          </View>
          <View style={[styles.kpiCard, ebitda >= 0 ? styles.kpiCardGreen : styles.kpiCardRed]}>
            <Text style={styles.kpiLabel}>EBITDA</Text>
            <Text style={styles.kpiValue}>{c}{fmt(ebitda)}</Text>
            <Text style={styles.kpiSub}>{fmtPct(ebitdaMargin)} margin</Text>
          </View>
          <View style={[styles.kpiCard, netProfit >= 0 ? styles.kpiCardPurple : styles.kpiCardRed]}>
            <Text style={styles.kpiLabel}>Net Profit</Text>
            <Text style={styles.kpiValue}>{c}{fmt(netProfit)}</Text>
            <Text style={styles.kpiSub}>{fmtPct(netMargin)} net margin</Text>
          </View>
        </View>

        {/* P&L Waterfall Table */}
        <Text style={styles.sectionLabel}>P&L Waterfall</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Line Item</Text>
          <Text style={[styles.tableHeaderCell, { textAlign: "right" }]}>Amount</Text>
          <Text style={[styles.tableHeaderCell, { textAlign: "right" }]}>% Revenue</Text>
        </View>
        {plRows.map((row, idx) => {
          const pct = revenue > 0 ? (Math.abs(row.value) / revenue) * 100 : 0;
          const rowStyle = row.highlight
            ? styles.tableRowHighlight
            : idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt;
          const valStyle = row.highlight
            ? styles.tableCellBoldRight
            : row.value >= 0
            ? styles.tableCellRight
            : styles.tableCellRight;
          const valColor = row.value >= 0 ? "#16a34a" : "#dc2626";
          return (
            <View key={row.label} style={rowStyle}>
              <Text style={[styles.tableCell, { flex: 2, paddingLeft: row.indent ? 12 : 0 }]}>
                {row.label}
              </Text>
              <Text style={[row.highlight ? styles.tableCellBoldRight : styles.tableCellRight, { color: row.value >= 0 ? "#16a34a" : "#dc2626" }]}>
                {row.value >= 0 ? "" : "("}{c}{fmt(Math.abs(row.value))}{row.value >= 0 ? "" : ")"}
              </Text>
              <Text style={[styles.tableCellRight, { color: "#6b7280" }]}>
                {pct.toFixed(1)}%
              </Text>
            </View>
          );
        })}

        {/* Cash Flow KPI Cards */}
        <Text style={styles.sectionLabel}>Cash Flow Summary</Text>
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, operatingCF >= 0 ? styles.kpiCardGreen : styles.kpiCardRed]}>
            <Text style={styles.kpiLabel}>Operating CF</Text>
            <Text style={styles.kpiValue}>{c}{fmt(operatingCF)}</Text>
            <Text style={styles.kpiSub}>Net profit + D&A − ΔWC</Text>
          </View>
          <View style={[styles.kpiCard, freeCashFlow >= 0 ? styles.kpiCardGreen : styles.kpiCardRed]}>
            <Text style={styles.kpiLabel}>Free Cash Flow</Text>
            <Text style={styles.kpiValue}>{c}{fmt(freeCashFlow)}</Text>
            <Text style={styles.kpiSub}>Operating CF − CapEx</Text>
          </View>
          <View style={[styles.kpiCard, netCashFlow >= 0 ? styles.kpiCardGreen : styles.kpiCardRed]}>
            <Text style={styles.kpiLabel}>Net Cash Flow</Text>
            <Text style={styles.kpiValue}>{c}{fmt(netCashFlow)}</Text>
            <Text style={styles.kpiSub}>FCF − Debt repayment</Text>
          </View>
          <View style={[styles.kpiCard, cashConversion >= 70 ? styles.kpiCardGreen : styles.kpiCardAmber]}>
            <Text style={styles.kpiLabel}>Cash Conversion</Text>
            <Text style={styles.kpiValue}>{cashConversion.toFixed(0)}%</Text>
            <Text style={styles.kpiSub}>FCF / EBITDA</Text>
          </View>
        </View>

        <Footer />
      </Page>

      {/* ── PAGE 2: Balance Sheet + Valuation ── */}
      <Page size="A4" style={styles.page}>
        <Header />

        {/* Balance Sheet KPI Cards */}
        <Text style={styles.sectionLabel}>Balance Sheet</Text>
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Assets</Text>
            <Text style={styles.kpiValue}>{c}{fmt(totalAssets)}</Text>
            <Text style={styles.kpiSub}>Current + fixed assets</Text>
          </View>
          <View style={[styles.kpiCard, netDebt < 0 ? styles.kpiCardGreen : styles.kpiCardAmber]}>
            <Text style={styles.kpiLabel}>Net Debt</Text>
            <Text style={styles.kpiValue}>{c}{fmt(netDebt)}</Text>
            <Text style={styles.kpiSub}>Total debt − cash</Text>
          </View>
          <View style={[styles.kpiCard, bookEquity >= 0 ? styles.kpiCardGreen : styles.kpiCardRed]}>
            <Text style={styles.kpiLabel}>Book Equity</Text>
            <Text style={styles.kpiValue}>{c}{fmt(bookEquity)}</Text>
            <Text style={styles.kpiSub}>Assets − liabilities</Text>
          </View>
          <View style={[styles.kpiCard, leverage < 2 ? styles.kpiCardGreen : leverage < 3 ? styles.kpiCardAmber : styles.kpiCardRed]}>
            <Text style={styles.kpiLabel}>Leverage</Text>
            <Text style={styles.kpiValue}>{ebitda > 0 ? `${leverage.toFixed(1)}×` : "N/A"}</Text>
            <Text style={styles.kpiSub}>Net Debt / EBITDA</Text>
          </View>
        </View>

        {/* Balance Sheet table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Balance Sheet Item</Text>
          <Text style={[styles.tableHeaderCell, { textAlign: "right" }]}>Amount ({c})</Text>
        </View>
        {[
          { label: "Total Assets",       value: totalAssets,      highlight: true },
          { label: "Net Debt",           value: netDebt,          highlight: false },
          { label: "Book Equity",        value: bookEquity,       highlight: true },
          { label: "Leverage (×)",       value: ebitda > 0 ? leverage : null, highlight: false, isMultiple: true },
        ].map((row, idx) => (
          <View key={row.label} style={row.highlight ? styles.tableRowHighlight : idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
            <Text style={[styles.tableCell, { flex: 2 }]}>{row.label}</Text>
            <Text style={[row.highlight ? styles.tableCellBoldRight : styles.tableCellRight, {
              color: row.value === null ? "#6b7280" : row.value >= 0 ? "#16a34a" : "#dc2626",
            }]}>
              {row.value === null
                ? "N/A"
                : row.isMultiple
                ? `${(row.value as number).toFixed(1)}×`
                : `${c}${fmt(row.value as number)}`}
            </Text>
          </View>
        ))}

        {/* Valuation KPI Cards */}
        <Text style={styles.sectionLabel}>Valuation</Text>
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>EV/EBITDA Value</Text>
            <Text style={styles.kpiValue}>{eqByEbitda > 0 ? `${c}${fmt(eqByEbitda)}` : "—"}</Text>
            <Text style={styles.kpiSub}>{evEbitdaMult}× EBITDA multiple</Text>
          </View>
          <View style={[styles.kpiCard, styles.kpiCardPurple]}>
            <Text style={styles.kpiLabel}>Rev Multiple Value</Text>
            <Text style={styles.kpiValue}>{eqByRev > 0 ? `${c}${fmt(eqByRev)}` : "—"}</Text>
            <Text style={styles.kpiSub}>{revMult}× revenue multiple</Text>
          </View>
          <View style={[styles.kpiCard, styles.kpiCardGreen]}>
            <Text style={styles.kpiLabel}>DCF Value</Text>
            <Text style={styles.kpiValue}>{dcfEquity > 0 ? `${c}${fmt(dcfEquity)}` : "—"}</Text>
            <Text style={styles.kpiSub}>5-yr discounted FCF</Text>
          </View>
          <View style={[styles.kpiCard, styles.kpiCardAmber]}>
            <Text style={styles.kpiLabel}>Blended Exit Price</Text>
            <Text style={styles.kpiValue}>{blendedEquity > 0 ? `${c}${fmt(blendedEquity)}` : "—"}</Text>
            <Text style={styles.kpiSub}>Average of valid methods</Text>
          </View>
        </View>

        {/* Valuation table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Method</Text>
          <Text style={[styles.tableHeaderCell, { textAlign: "right" }]}>Multiple</Text>
          <Text style={[styles.tableHeaderCell, { textAlign: "right" }]}>Equity Value</Text>
        </View>
        {[
          { label: "EV/EBITDA",    mult: `${evEbitdaMult}×`, value: eqByEbitda },
          { label: "Revenue Multiple", mult: `${revMult}×`, value: eqByRev },
          { label: `P/E`,          mult: `${peMult}×`,        value: eqByPE },
          { label: "DCF",          mult: "5-yr FCF",          value: dcfEquity },
        ].map((row, idx) => (
          <View key={row.label} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
            <Text style={[styles.tableCell, { flex: 2 }]}>{row.label}</Text>
            <Text style={styles.tableCellRight}>{row.mult}</Text>
            <Text style={[styles.tableCellRight, { color: row.value > 0 ? "#16a34a" : "#9ca3af" }]}>
              {row.value > 0 ? `${c}${fmt(row.value)}` : "—"}
            </Text>
          </View>
        ))}

        {/* Exit Price Range box */}
        {blendedEquity > 0 && (
          <>
            <Text style={styles.sectionLabel}>Exit Price Range</Text>
            <View style={styles.exitRangeBox}>
              <View>
                <Text style={styles.exitRangeLabel}>Low</Text>
                <Text style={styles.exitRangeValueAmber}>{c}{fmt(exitLow)}</Text>
              </View>
              <Text style={styles.exitRangeDash}>—</Text>
              <View>
                <Text style={styles.exitRangeLabel}>High</Text>
                <Text style={styles.exitRangeValueGreen}>{c}{fmt(exitHigh)}</Text>
              </View>
              <View style={{ marginLeft: "auto" }}>
                <Text style={styles.exitRangeLabel}>Book Equity</Text>
                <Text style={[styles.exitRangeValueGray, { color: bookEquity >= 0 ? "#374151" : "#dc2626" }]}>
                  {c}{fmt(bookEquity)}
                </Text>
              </View>
            </View>
          </>
        )}

        <Footer />
      </Page>

      {/* ── PAGE 3: Exit Strategy ── */}
      <Page size="A4" style={styles.page}>
        <Header />

        {/* Exit Readiness Checklist */}
        <Text style={styles.sectionLabel}>Exit Readiness Checklist</Text>
        {exitChecklist.map((item, idx) => {
          const icon  = item.pass ? "✓" : item.amber ? "~" : "✗";
          const labelStyle = item.pass
            ? styles.checklistLabelPass
            : item.amber
            ? styles.checklistLabelAmber
            : styles.checklistLabelFail;
          const rowBg = idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt;
          return (
            <View key={idx} style={[rowBg, { flexDirection: "row", alignItems: "center", gap: 8 }]}>
              <Text style={[styles.checklistIcon, {
                color: item.pass ? "#16a34a" : item.amber ? "#d97706" : "#dc2626",
                fontFamily: "Helvetica-Bold",
              }]}>
                {icon}
              </Text>
              <Text style={labelStyle}>{item.label}</Text>
            </View>
          );
        })}

        {/* Key Actions */}
        <Text style={styles.sectionLabel}>Key Actions to Maximise Exit Value</Text>
        {dynamicActions.map((action, idx) => (
          <View key={idx} style={styles.actionRow}>
            <Text style={styles.actionBullet}>{idx + 1}</Text>
            <Text style={styles.actionText}>{action}</Text>
          </View>
        ))}

        {/* Disclaimer */}
        <View style={{ marginTop: 28, padding: "10 12", backgroundColor: "#f8fafc", borderRadius: 6, borderLeft: "3px solid #e5e7eb" }}>
          <Text style={{ fontSize: 7, color: "#6b7280", lineHeight: 1.6 }}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>Disclaimer: </Text>
            This report is for illustrative and planning purposes only. The valuations and insights above are indicative estimates based on simplified models. They do not constitute financial advice, a formal valuation, or an offer to buy or sell any business. Consult a qualified M&amp;A advisor, corporate finance professional, or accountant before making any decisions related to a business sale, acquisition, or restructuring.
          </Text>
        </View>

        <Footer />
      </Page>
    </Document>
  );
}
