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
  kpiCardRed: { borderLeft: "3px solid #ef4444" },
  kpiLabel: { fontSize: 7, color: "#9ca3af", textTransform: "uppercase", marginBottom: 3 },
  kpiValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#0a0f1e" },
  kpiSub: { fontSize: 7, color: "#9ca3af", marginTop: 2 },
  tableHeader: { flexDirection: "row", backgroundColor: "#1d4ed8", padding: "6 8" },
  tableHeaderCell: { flex: 1, fontSize: 7, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  tableRow: { flexDirection: "row", padding: "4 8", borderBottom: "1px solid #f1f5f9" },
  tableRowAlt: { flexDirection: "row", padding: "4 8", backgroundColor: "#f8fafc", borderBottom: "1px solid #f1f5f9" },
  tableRowBold: { flexDirection: "row", padding: "4 8", backgroundColor: "#eff6ff", borderBottom: "2px solid #bfdbfe" },
  tableCell: { flex: 1, fontSize: 7, color: "#374151" },
  tableCellBold: { flex: 1, fontSize: 7, fontFamily: "Helvetica-Bold", color: "#0a0f1e" },
  tableCellGreen: { flex: 1, fontSize: 7, color: "#16a34a" },
  tableCellRed: { flex: 1, fontSize: 7, color: "#dc2626" },
  footer: { position: "absolute", bottom: 28, left: 40, right: 40, borderTop: "1px solid #e5e7eb", paddingTop: 6, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 8, color: "#9ca3af" },
  logoImg: { width: 90, height: 34, objectFit: "contain" },
});

const fmt = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 0 });
const fmtM = (n: number) => n.toLocaleString("en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface MonthData {
  month: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  opex: number;
  ebitda: number;
  netIncome: number;
}

interface Props {
  currency: string;
  companyName: string;
  year: number;
  months: MonthData[];
  totalRevenue: number;
  totalCogs: number;
  totalGrossProfit: number;
  totalOpex: number;
  totalEbitda: number;
  totalNetIncome: number;
  avgGrossMargin: number;
  avgEbitdaMargin: number;
}

export default function AnnualBudgetPDF({
  currency,
  companyName, year, months, totalRevenue, totalCogs, totalGrossProfit,
  totalOpex, totalEbitda, totalNetIncome, avgGrossMargin, avgEbitdaMargin,
}: Props) {
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Annual Budget</Text>
            <Text style={styles.headerSub}>{companyName} — {year}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.headerMeta}>Generated {date}</Text>
            <Image style={styles.logoImg} src="https://www.financeplots.com/logo-sm.png" />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Annual Summary</Text>
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, styles.kpiCardGreen]}>
            <Text style={styles.kpiLabel}>Total Revenue</Text>
            <Text style={styles.kpiValue}>{currency}{fmt(totalRevenue)}</Text>
            <Text style={styles.kpiSub}>Full year</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Gross Profit</Text>
            <Text style={styles.kpiValue}>{currency}{fmt(totalGrossProfit)}</Text>
            <Text style={styles.kpiSub}>{fmtM(avgGrossMargin)}% margin</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>EBITDA</Text>
            <Text style={styles.kpiValue}>{currency}{fmt(totalEbitda)}</Text>
            <Text style={styles.kpiSub}>{fmtM(avgEbitdaMargin)}% margin</Text>
          </View>
          <View style={[styles.kpiCard, totalNetIncome >= 0 ? styles.kpiCardGreen : styles.kpiCardRed]}>
            <Text style={styles.kpiLabel}>Net Income</Text>
            <Text style={styles.kpiValue}>{currency}{fmt(totalNetIncome)}</Text>
            <Text style={styles.kpiSub}>Bottom line</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Monthly Budget</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>Month</Text>
          {["Revenue", "COGS", "Gross Profit", "OpEx", "EBITDA", "Net Income"].map(h => (
            <Text key={h} style={styles.tableHeaderCell}>{h}</Text>
          ))}
        </View>
        {months.map((m, idx) => (
          <View key={m.month} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
            <Text style={[styles.tableCellBold, { flex: 1.2 }]}>{m.month}</Text>
            <Text style={styles.tableCellGreen}>{currency}{fmt(m.revenue)}</Text>
            <Text style={styles.tableCellRed}>{currency}{fmt(m.cogs)}</Text>
            <Text style={styles.tableCell}>{currency}{fmt(m.grossProfit)}</Text>
            <Text style={styles.tableCellRed}>{currency}{fmt(m.opex)}</Text>
            <Text style={styles.tableCell}>{currency}{fmt(m.ebitda)}</Text>
            <Text style={m.netIncome >= 0 ? styles.tableCellGreen : styles.tableCellRed}>{currency}{fmt(m.netIncome)}</Text>
          </View>
        ))}
        <View style={styles.tableRowBold}>
          <Text style={[styles.tableCellBold, { flex: 1.2 }]}>TOTAL</Text>
          <Text style={[styles.tableCellBold, { color: "#16a34a" }]}>{currency}{fmt(totalRevenue)}</Text>
          <Text style={[styles.tableCellBold, { color: "#dc2626" }]}>{currency}{fmt(totalCogs)}</Text>
          <Text style={styles.tableCellBold}>{currency}{fmt(totalGrossProfit)}</Text>
          <Text style={[styles.tableCellBold, { color: "#dc2626" }]}>{currency}{fmt(totalOpex)}</Text>
          <Text style={styles.tableCellBold}>{currency}{fmt(totalEbitda)}</Text>
          <Text style={[styles.tableCellBold, { color: totalNetIncome >= 0 ? "#16a34a" : "#dc2626" }]}>{currency}{fmt(totalNetIncome)}</Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>FinancePlots · financeplots.com</Text>
          <Text style={styles.footerText}>For informational purposes only · Not financial advice</Text>
        </View>
      </Page>
    </Document>
  );
}
