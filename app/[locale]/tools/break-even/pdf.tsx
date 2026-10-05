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
  headerCompany: { fontSize: 11, color: "#4b5563", marginTop: 4 },
  headerRight: { alignItems: "flex-end" },
  headerMeta: { fontSize: 9, color: "#9ca3af" },
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
  kpiCardRed: { borderLeft: "3px solid #ef4444" },
  kpiLabel: { fontSize: 7, color: "#9ca3af", textTransform: "uppercase", marginBottom: 3 },
  kpiValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#0a0f1e" },
  kpiSub: { fontSize: 7, color: "#9ca3af", marginTop: 2 },
  // Table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1d4ed8",
    padding: "6 8",
    borderRadius: "4 4 0 0",
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
  logoImg: { width: 90, height: 34, objectFit: "contain" },
});

interface FixedCosts {
  rent: number;
  payroll: number;
  insurance: number;
  depreciation: number;
  marketing: number;
  other: number;
}

interface SensitivityRow {
  units: number;
  revenue: number;
  totalCost: number;
  profit: number;
  isCurrent: boolean;
}

interface Props {
  currency: string;
  companyName: string;
  bepUnits: number;
  bepRevenue: number;
  contributionMargin: number;
  cmRatio: number;
  currentProfit: number;
  currentUnits: number;
  mosUnits: number;
  mosPct: number;
  totalFixed: number;
  fixedCosts: FixedCosts;
  sensitivityRows: SensitivityRow[];
}

const fmt = (n: number) =>
  n.toLocaleString("en-GB", { maximumFractionDigits: 0 });
const fmtM = (n: number) =>
  n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const FIXED_LABELS: [keyof FixedCosts, string][] = [
  ["rent", "Rent & Utilities"],
  ["payroll", "Payroll"],
  ["insurance", "Insurance"],
  ["depreciation", "Depreciation"],
  ["marketing", "Marketing"],
  ["other", "Other Fixed"],
];

export default function BreakEvenPDF({
  currency,
  companyName,
  bepUnits,
  bepRevenue,
  contributionMargin,
  cmRatio,
  currentProfit,
  currentUnits,
  mosUnits,
  mosPct,
  totalFixed,
  fixedCosts,
  sensitivityRows,
}: Props) {
  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Break-Even Analysis</Text>
            <Text style={styles.headerCompany}>{companyName}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerMeta}>Generated {date}</Text>
            <Image style={styles.logoImg} src="https://www.financeplots.com/logo-sm.png" />
          </View>
        </View>

        {/* KPI Cards */}
        <Text style={styles.sectionLabel}>Key Metrics</Text>
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Break-Even Units</Text>
            <Text style={styles.kpiValue}>{fmt(bepUnits)}</Text>
            <Text style={styles.kpiSub}>BEP revenue: {currency}{fmt(bepRevenue)}</Text>
          </View>
          <View style={[styles.kpiCard, styles.kpiCardGreen]}>
            <Text style={styles.kpiLabel}>Contribution Margin</Text>
            <Text style={styles.kpiValue}>{currency}{fmtM(contributionMargin)}</Text>
            <Text style={styles.kpiSub}>CM ratio: {(cmRatio * 100).toFixed(1)}%</Text>
          </View>
          <View style={[styles.kpiCard, currentProfit >= 0 ? styles.kpiCardGreen : styles.kpiCardRed]}>
            <Text style={styles.kpiLabel}>Current Profit</Text>
            <Text style={styles.kpiValue}>{currency}{fmt(currentProfit)}</Text>
            <Text style={styles.kpiSub}>At {fmt(currentUnits)} units</Text>
          </View>
          <View style={[styles.kpiCard, mosUnits >= 0 ? styles.kpiCardGreen : styles.kpiCardRed]}>
            <Text style={styles.kpiLabel}>Margin of Safety</Text>
            <Text style={styles.kpiValue}>{mosPct.toFixed(1)}%</Text>
            <Text style={styles.kpiSub}>{fmt(mosUnits)} units above BEP</Text>
          </View>
        </View>

        {/* Sensitivity Table */}
        <Text style={styles.sectionLabel}>Sensitivity Analysis</Text>
        <View style={styles.tableHeader}>
          {["Units", "Revenue", "Total Cost", "Profit", "Margin", "Status"].map((h) => (
            <Text key={h} style={styles.tableHeaderCell}>{h}</Text>
          ))}
        </View>
        {sensitivityRows.map((row, idx) => {
          const margin = row.revenue > 0 ? (row.profit / row.revenue) * 100 : 0;
          const rowStyle = row.isCurrent
            ? styles.tableRowHighlight
            : idx % 2 === 0
            ? styles.tableRow
            : styles.tableRowAlt;
          return (
            <View key={row.units} style={rowStyle}>
              <Text style={row.isCurrent ? styles.tableCellBold : styles.tableCell}>
                {fmt(row.units)}
              </Text>
              <Text style={styles.tableCell}>{currency}{fmt(row.revenue)}</Text>
              <Text style={styles.tableCell}>{currency}{fmt(row.totalCost)}</Text>
              <Text style={row.profit >= 0 ? styles.tableCellGreen : styles.tableCellRed}>
                {currency}{fmt(row.profit)}
              </Text>
              <Text style={styles.tableCell}>{margin.toFixed(1)}%</Text>
              <Text style={styles.tableCell}>
                {row.profit > 0 ? "Profit" : row.profit === 0 ? "Break-Even" : "Loss"}
              </Text>
            </View>
          );
        })}

        {/* Fixed Cost Breakdown */}
        <Text style={styles.sectionLabel}>Fixed Cost Breakdown</Text>
        <View style={styles.tableHeader}>
          {["Cost Category", "Amount", "% of Total"].map((h) => (
            <Text key={h} style={styles.tableHeaderCell}>{h}</Text>
          ))}
        </View>
        {FIXED_LABELS.filter(([key]) => fixedCosts[key] > 0).map(([key, label], idx) => (
          <View key={key} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
            <Text style={styles.tableCell}>{label}</Text>
            <Text style={styles.tableCell}>{currency}{fmt(fixedCosts[key])}</Text>
            <Text style={styles.tableCell}>
              {totalFixed > 0 ? ((fixedCosts[key] / totalFixed) * 100).toFixed(1) : "0"}%
            </Text>
          </View>
        ))}
        <View style={[styles.tableRow, { backgroundColor: "#f0f4ff" }]}>
          <Text style={styles.tableCellBold}>Total</Text>
          <Text style={styles.tableCellBold}>{currency}{fmt(totalFixed)}</Text>
          <Text style={styles.tableCellBold}>100%</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>FinancePlots · financeplots.com</Text>
          <Text style={styles.footerText}>For informational purposes only · Not financial advice</Text>
        </View>
      </Page>
    </Document>
  );
}
