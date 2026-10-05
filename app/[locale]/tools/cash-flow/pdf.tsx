import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { INFLOW_LINES, OUTFLOW_LINES, type Line, type Summary, type WeekRow } from "@/lib/cash-flow";

// Landscape, so the 13 weeks fit across as they do on screen: lines down the
// side, weeks along the top, totals on the right.

const styles = StyleSheet.create({
  page: { padding: 32, backgroundColor: "#ffffff", fontFamily: "Helvetica", fontSize: 9, color: "#111827" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, paddingBottom: 12, borderBottom: "2px solid #1d4ed8" },
  headerTitle: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#0a0f1e" },
  headerSub: { fontSize: 10, color: "#4b5563", marginTop: 4 },
  headerMeta: { fontSize: 8, color: "#9ca3af" },
  sectionLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#3b82f6", textTransform: "uppercase", letterSpacing: 1, marginTop: 14, marginBottom: 6 },
  kpiRow: { flexDirection: "row", gap: 8 },
  kpiCard: { flex: 1, padding: 8, backgroundColor: "#f8fafc", borderRadius: 6, borderLeft: "3px solid #3b82f6" },
  kpiCardGreen: { borderLeft: "3px solid #22c55e" },
  kpiCardRed: { borderLeft: "3px solid #ef4444" },
  kpiCardAmber: { borderLeft: "3px solid #f59e0b" },
  kpiLabel: { fontSize: 7, color: "#9ca3af", textTransform: "uppercase", marginBottom: 3 },
  kpiValue: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#0a0f1e" },
  kpiSub: { fontSize: 7, color: "#9ca3af", marginTop: 2 },
  row: { flexDirection: "row", borderBottom: "1px solid #f1f5f9", paddingVertical: 3 },
  headRow: { flexDirection: "row", backgroundColor: "#1d4ed8", paddingVertical: 4 },
  groupRow: { flexDirection: "row", paddingTop: 6, paddingBottom: 2 },
  totalRow: { flexDirection: "row", borderBottom: "1px solid #cbd5e1", paddingVertical: 3, backgroundColor: "#f8fafc" },
  closingRow: { flexDirection: "row", borderTop: "1.5px solid #0a0f1e", paddingVertical: 4 },
  labelCell: { width: 120, paddingLeft: 4, fontSize: 7 },
  cell: { flex: 1, textAlign: "right", paddingRight: 3, fontSize: 6.5 },
  headCell: { flex: 1, textAlign: "right", paddingRight: 3, fontSize: 6.5, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  bold: { fontFamily: "Helvetica-Bold" },
  red: { color: "#dc2626" },
  footer: { position: "absolute", bottom: 20, left: 32, right: 32, borderTop: "1px solid #e5e7eb", paddingTop: 6, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#9ca3af" },
  logoImg: { width: 80, height: 30, objectFit: "contain" },
});

const fmt = (n: number) => Math.round(Math.abs(n)).toLocaleString("en-GB", { maximumFractionDigits: 0 });

interface Props {
  currency: string;
  forecastName: string;
  openingBalance: number;
  buffer: number;
  summary: Summary;
  rows: WeekRow[];
  lineNames: Record<Line, string>;
}

export default function CashFlowPDF({ currency, forecastName, openingBalance, buffer, summary, rows, lineNames }: Props) {
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const money = (n: number) => `${n < 0 ? "-" : ""}${currency}${fmt(n)}`;

  const valueRow = (label: string, values: number[], total: number | null, style: (typeof styles)[keyof typeof styles] = styles.row, bold = false) => (
    <View style={style} wrap={false}>
      <Text style={[styles.labelCell, bold ? styles.bold : {}]}>{label}</Text>
      {values.map((v, i) => (
        <Text key={i} style={[styles.cell, bold ? styles.bold : {}, v < 0 ? styles.red : {}]}>{v === 0 && !bold ? "–" : money(v)}</Text>
      ))}
      <Text style={[styles.cell, styles.bold, total !== null && total < 0 ? styles.red : {}]}>{total === null ? "" : money(total)}</Text>
    </View>
  );
  const group = (label: string, color: string) => (
    <View style={styles.groupRow}>
      <Text style={[styles.labelCell, styles.bold, { color, fontSize: 7, textTransform: "uppercase" }]}>{label}</Text>
    </View>
  );

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>13-Week Cash Flow Forecast</Text>
            <Text style={styles.headerSub}>{forecastName}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.headerMeta}>Generated {date}</Text>
            <Image style={styles.logoImg} src="https://www.financeplots.com/logo-sm.png" />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Summary</Text>
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Opening balance</Text>
            <Text style={styles.kpiValue}>{money(openingBalance)}</Text>
            <Text style={styles.kpiSub}>Start of week 1</Text>
          </View>
          <View style={[styles.kpiCard, styles.kpiCardGreen]}>
            <Text style={styles.kpiLabel}>Cash in</Text>
            <Text style={styles.kpiValue}>{money(summary.totalIn)}</Text>
            <Text style={styles.kpiSub}>13-week total</Text>
          </View>
          <View style={[styles.kpiCard, styles.kpiCardRed]}>
            <Text style={styles.kpiLabel}>Cash out</Text>
            <Text style={styles.kpiValue}>{money(summary.totalOut)}</Text>
            <Text style={styles.kpiSub}>13-week total</Text>
          </View>
          <View style={[styles.kpiCard, summary.closing >= 0 ? {} : styles.kpiCardRed]}>
            <Text style={styles.kpiLabel}>Closing balance</Text>
            <Text style={styles.kpiValue}>{money(summary.closing)}</Text>
            <Text style={styles.kpiSub}>End of week 13</Text>
          </View>
          <View style={[styles.kpiCard, summary.lowest < 0 ? styles.kpiCardRed : summary.lowest < buffer ? styles.kpiCardAmber : styles.kpiCardGreen]}>
            <Text style={styles.kpiLabel}>Lowest balance</Text>
            <Text style={styles.kpiValue}>{money(summary.lowest)}</Text>
            <Text style={styles.kpiSub}>Week {summary.lowestWeek} · buffer {money(buffer)}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Week by week</Text>
        <View style={styles.headRow}>
          <Text style={[styles.labelCell, { color: "#ffffff", fontFamily: "Helvetica-Bold" }]} />
          {rows.map(r => <Text key={r.week} style={styles.headCell}>W{r.week}</Text>)}
          <Text style={styles.headCell}>Total</Text>
        </View>
        {valueRow("Opening balance", rows.map(r => r.opening), null)}
        {group("Cash in", "#16a34a")}
        {INFLOW_LINES.map(l => <View key={l}>{valueRow(lineNames[l], rows.map(r => r.lines[l]), summary.totals[l])}</View>)}
        {valueRow("Total cash in", rows.map(r => r.inflows), summary.totalIn, styles.totalRow, true)}
        {group("Cash out", "#dc2626")}
        {OUTFLOW_LINES.map(l => <View key={l}>{valueRow(lineNames[l], rows.map(r => r.lines[l]), summary.totals[l])}</View>)}
        {valueRow("Total cash out", rows.map(r => r.outflows), summary.totalOut, styles.totalRow, true)}
        {valueRow("Net cash flow", rows.map(r => r.net), summary.totalIn - summary.totalOut, styles.row, true)}
        {valueRow("Closing balance", rows.map(r => r.closing), null, styles.closingRow, true)}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>FinancePlots · financeplots.com</Text>
          <Text style={styles.footerText}>For informational purposes only · Not financial advice</Text>
        </View>
      </Page>
    </Document>
  );
}
