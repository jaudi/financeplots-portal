import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: "#ffffff", fontFamily: "Helvetica", fontSize: 10, color: "#111827" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, paddingBottom: 16, borderBottom: "2px solid #1d4ed8" },
  headerTitle: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#0a0f1e" },
  headerSub: { fontSize: 11, color: "#4b5563", marginTop: 4 },
  headerMeta: { fontSize: 9, color: "#9ca3af" },
  sectionLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#3b82f6", textTransform: "uppercase", letterSpacing: 1, marginTop: 20, marginBottom: 8 },
  kpiRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  kpiCard: { flex: 1, padding: 10, backgroundColor: "#f8fafc", borderRadius: 6, borderLeft: "3px solid #3b82f6" },
  kpiCardGreen: { borderLeft: "3px solid #22c55e" },
  kpiCardGold: { borderLeft: "3px solid #f59e0b" },
  kpiLabel: { fontSize: 7, color: "#9ca3af", textTransform: "uppercase", marginBottom: 3 },
  kpiValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#0a0f1e" },
  kpiSub: { fontSize: 7, color: "#9ca3af", marginTop: 2 },
  tableHeader: { flexDirection: "row", backgroundColor: "#1d4ed8", padding: "6 8", borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  tableHeaderCell: { flex: 1, fontSize: 8, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  tableRow: { flexDirection: "row", padding: "5 8", borderBottom: "1px solid #f1f5f9" },
  tableRowAlt: { flexDirection: "row", padding: "5 8", backgroundColor: "#f8fafc", borderBottom: "1px solid #f1f5f9" },
  tableCell: { flex: 1, fontSize: 8, color: "#374151" },
  tableCellBold: { flex: 1, fontSize: 8, fontFamily: "Helvetica-Bold", color: "#0a0f1e" },
  footer: { position: "absolute", bottom: 28, left: 40, right: 40, borderTop: "1px solid #e5e7eb", paddingTop: 6, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 8, color: "#9ca3af" },
  logoImg: { width: 90, height: 34, objectFit: "contain" },
});

const fmt = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 0 });

interface Row { year: number; portfolioValue: number; totalContributed: number; interestEarned: number }

interface Props {
  currency: string;
  initialCapital: number;
  monthlyContribution: number;
  years: number;
  annualRate: number;
  finalValue: number;
  totalInvested: number;
  totalInterest: number;
  returnMultiple: number;
  rows: Row[];
}

export default function CompoundPDF({ currency, initialCapital, monthlyContribution, years, annualRate, finalValue, totalInvested, totalInterest, returnMultiple, rows }: Props) {
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Compound Interest Calculator</Text>
            <Text style={styles.headerSub}>{currency}{fmt(initialCapital)} initial · {currency}{fmt(monthlyContribution)}/mo · {years} years · {annualRate}% p.a.</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.headerMeta}>Generated {date}</Text>
            <Image style={styles.logoImg} src="https://www.financeplots.com/logo-sm.png" />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Key Metrics</Text>
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Final Portfolio Value</Text>
            <Text style={styles.kpiValue}>{currency}{fmt(finalValue)}</Text>
            <Text style={styles.kpiSub}>After {years} years</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Invested</Text>
            <Text style={styles.kpiValue}>{currency}{fmt(totalInvested)}</Text>
            <Text style={styles.kpiSub}>Initial + contributions</Text>
          </View>
          <View style={[styles.kpiCard, styles.kpiCardGreen]}>
            <Text style={styles.kpiLabel}>Interest Earned</Text>
            <Text style={styles.kpiValue}>{currency}{fmt(totalInterest)}</Text>
            <Text style={styles.kpiSub}>{finalValue > 0 ? ((totalInterest / finalValue) * 100).toFixed(0) : 0}% of final value</Text>
          </View>
          <View style={[styles.kpiCard, styles.kpiCardGold]}>
            <Text style={styles.kpiLabel}>Return Multiple</Text>
            <Text style={styles.kpiValue}>{returnMultiple.toFixed(1)}×</Text>
            <Text style={styles.kpiSub}>{currency}1 → {currency}{returnMultiple.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Year-by-Year Breakdown</Text>
        <View style={styles.tableHeader}>
          {["Year", "Portfolio Value", "Total Contributed", "Interest Earned"].map(h => (
            <Text key={h} style={styles.tableHeaderCell}>{h}</Text>
          ))}
        </View>
        {rows.map((row, idx) => (
          <View key={row.year} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
            <Text style={styles.tableCellBold}>{row.year}</Text>
            <Text style={styles.tableCell}>{currency}{fmt(row.portfolioValue)}</Text>
            <Text style={styles.tableCell}>{currency}{fmt(row.totalContributed)}</Text>
            <Text style={styles.tableCell}>{currency}{fmt(row.interestEarned)}</Text>
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
