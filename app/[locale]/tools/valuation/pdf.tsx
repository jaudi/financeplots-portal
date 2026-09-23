import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: "#ffffff", fontFamily: "Helvetica", fontSize: 10, color: "#111827" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, paddingBottom: 16, borderBottom: "2px solid #1d4ed8" },
  headerTitle: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#0a0f1e" },
  headerSub: { fontSize: 11, color: "#4b5563", marginTop: 4 },
  headerMeta: { fontSize: 9, color: "#9ca3af" },
  sectionLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#3b82f6", textTransform: "uppercase", letterSpacing: 1, marginTop: 20, marginBottom: 8 },
  kpiRow: { flexDirection: "row", gap: 10 },
  kpiCard: { flex: 1, padding: 10, backgroundColor: "#f8fafc", borderRadius: 6, borderLeft: "3px solid #3b82f6" },
  kpiCardGreen: { borderLeft: "3px solid #22c55e" },
  kpiCardGold: { borderLeft: "3px solid #f59e0b" },
  kpiLabel: { fontSize: 7, color: "#9ca3af", textTransform: "uppercase", marginBottom: 3 },
  kpiValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#0a0f1e" },
  kpiSub: { fontSize: 7, color: "#9ca3af", marginTop: 2 },
  tableHeader: { flexDirection: "row", backgroundColor: "#1d4ed8", padding: "6 8" },
  tableHeaderCell: { flex: 1, fontSize: 8, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  tableRow: { flexDirection: "row", padding: "5 8", borderBottom: "1px solid #f1f5f9" },
  tableRowAlt: { flexDirection: "row", padding: "5 8", backgroundColor: "#f8fafc", borderBottom: "1px solid #f1f5f9" },
  tableCell: { flex: 1, fontSize: 8, color: "#374151" },
  tableCellBold: { flex: 1, fontSize: 8, fontFamily: "Helvetica-Bold", color: "#0a0f1e" },
  twoCol: { flexDirection: "row", gap: 16, marginTop: 4 },
  col: { flex: 1 },
  footer: { position: "absolute", bottom: 28, left: 40, right: 40, borderTop: "1px solid #e5e7eb", paddingTop: 6, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 8, color: "#9ca3af" },
  logoImg: { width: 90, height: 34, objectFit: "contain" },
});

const fmt = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 0 });
const gbp = (n: number | null) => (n === null ? "n/a" : `£${fmt(n)}`);
const fmtM = (n: number) => n.toLocaleString("en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

interface DCFRow { year: number; fcf: number; discountedFCF: number; cumulativePV: number }

interface Props {
  companyName: string;
  revenue: number;
  ebitda: number;
  netIncome: number;
  fcf: number;
  growthRate: number;
  discountRate: number;
  terminalGrowth: number;
  ebitdaMultiple: number;
  peRatio: number;
  // null: left out because its input is a loss
  dcfValue: number | null;
  epsValue: number | null;
  evValue: number | null;
  avgValuation: number | null;
  netDebt: number;
  enterpriseAvg: number | null;
  dcfRows: DCFRow[];
}

// Values passed in are equity values (enterprise value minus net debt).
export default function ValuationPDF({
  companyName, revenue, ebitda, netIncome, fcf,
  growthRate, discountRate, terminalGrowth, ebitdaMultiple, peRatio,
  dcfValue, epsValue, evValue, avgValuation, netDebt, enterpriseAvg, dcfRows,
}: Props) {
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const ebitdaMargin = revenue > 0 ? (ebitda / revenue) * 100 : 0;
  const netMargin = revenue > 0 ? (netIncome / revenue) * 100 : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Business Valuation</Text>
            <Text style={styles.headerSub}>{companyName}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.headerMeta}>Generated {date}</Text>
            <Image style={styles.logoImg} src="https://www.financeplots.com/logo-sm.png" />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Valuation Summary</Text>
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, styles.kpiCardGold]}>
            <Text style={styles.kpiLabel}>Average Valuation</Text>
            <Text style={styles.kpiValue}>{gbp(avgValuation)}</Text>
            <Text style={styles.kpiSub}>4-method average, equity value</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>DCF Value</Text>
            <Text style={styles.kpiValue}>{gbp(dcfValue)}</Text>
            <Text style={styles.kpiSub}>{discountRate}% WACC</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>EV/EBITDA Value</Text>
            <Text style={styles.kpiValue}>{gbp(evValue)}</Text>
            <Text style={styles.kpiSub}>{ebitdaMultiple}× multiple</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>P/E Value</Text>
            <Text style={styles.kpiValue}>{gbp(epsValue)}</Text>
            <Text style={styles.kpiSub}>{peRatio}× earnings</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Financials & Assumptions</Text>
        <View style={styles.twoCol}>
          <View style={styles.col}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Financial Metric</Text>
              <Text style={styles.tableHeaderCell}>Value</Text>
            </View>
            {[
              ["Annual Revenue", `£${fmt(revenue)}`],
              ["EBITDA", `£${fmt(ebitda)} (${fmtM(ebitdaMargin)}%)`],
              ["Net Income", `£${fmt(netIncome)} (${fmtM(netMargin)}%)`],
              ["Free Cash Flow", `£${fmt(fcf)}`],
              ["Net Debt (debt − cash)", `£${fmt(netDebt)}`],
              ["Enterprise Value (avg)", gbp(enterpriseAvg)],
            ].map(([label, value], idx) => (
              <View key={label} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{label}</Text>
                <Text style={styles.tableCellBold}>{value}</Text>
              </View>
            ))}
          </View>
          <View style={styles.col}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Assumption</Text>
              <Text style={styles.tableHeaderCell}>Value</Text>
            </View>
            {[
              ["Revenue Growth Rate", `${growthRate}%/yr`],
              ["Discount Rate (WACC)", `${discountRate}%`],
              ["Terminal Growth Rate", `${terminalGrowth}%`],
              ["EV/EBITDA Multiple", `${ebitdaMultiple}×`],
              ["P/E Ratio", `${peRatio}×`],
            ].map(([label, value], idx) => (
              <View key={label} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{label}</Text>
                <Text style={styles.tableCellBold}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionLabel}>DCF — 5-Year Projected Cash Flows</Text>
        <View style={styles.tableHeader}>
          {["Year", "Free Cash Flow", "Discounted FCF", "Cumulative PV"].map(h => (
            <Text key={h} style={styles.tableHeaderCell}>{h}</Text>
          ))}
        </View>
        {dcfRows.map((row, idx) => (
          <View key={row.year} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
            <Text style={styles.tableCellBold}>{row.year}</Text>
            <Text style={styles.tableCell}>£{fmt(row.fcf)}</Text>
            <Text style={styles.tableCell}>£{fmt(row.discountedFCF)}</Text>
            <Text style={styles.tableCell}>£{fmt(row.cumulativePV)}</Text>
          </View>
        ))}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>FinancePlots · financeplots.com</Text>
          <Text style={styles.footerText}>For informational purposes only · Not financial advice</Text>
        </View>
      </Page>
    </Document>
  );
}
