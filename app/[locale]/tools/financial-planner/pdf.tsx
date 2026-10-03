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
  headerMeta: { fontSize: 9, color: "#9ca3af", marginBottom: 6 },
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
  // KPI grid
  kpiRow: { flexDirection: "row", gap: 8, marginBottom: 6 },
  kpiCard: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    borderLeft: "3px solid #3b82f6",
  },
  kpiCardGreen:  { borderLeft: "3px solid #22c55e" },
  kpiCardRed:    { borderLeft: "3px solid #ef4444" },
  kpiCardAmber:  { borderLeft: "3px solid #f59e0b" },
  kpiCardPurple: { borderLeft: "3px solid #8b5cf6" },
  kpiLabel: { fontSize: 7, color: "#9ca3af", textTransform: "uppercase", marginBottom: 3 },
  kpiValue: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#0a0f1e" },
  kpiSub:   { fontSize: 7, color: "#9ca3af", marginTop: 2 },
  // Recommendations
  recCard: {
    flexDirection: "row",
    padding: "8 10",
    marginBottom: 5,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    borderLeft: "3px solid #22c55e",
  },
  recCardAmber: { borderLeft: "3px solid #f59e0b" },
  recCardRed:   { borderLeft: "3px solid #ef4444" },
  recIcon:  { fontSize: 12, width: 20 },
  recRight: { flex: 1 },
  recTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#0a0f1e", marginBottom: 3 },
  recBody:  { fontSize: 8, color: "#374151", lineHeight: 1.4 },
  // Best practices
  checkItem: {
    flexDirection: "row",
    marginBottom: 5,
  },
  checkMark: { fontSize: 9, color: "#16a34a", width: 16 },
  checkText: { fontSize: 8, color: "#374151", flex: 1 },
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
  // Charts page
  chartGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chartCard: { width: "48.5%", marginBottom: 10 },
  chartTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#0a0f1e", marginBottom: 4 },
  chartImg: { width: "100%", borderRadius: 6 },
});

const fmt = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 0 });

export interface PlannerPdfProps {
  currency: string;
  income: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  totalDebt: number;
  totalInterestCost: number;
  finalValue: number;
  annualRate: number;
  years: number;
  monthlyContrib: number;
  risk: string;
  allocData: { name: string; value: number }[];
  recommendations: { icon: string; title: string; body: string; color: string }[];
  /** The report's charts as PNG data URLs, drawn on the page (see charts.tsx). */
  charts?: { src: string; title: string }[];
  chartsTitle?: string;
  date: string;
}

export function PlannerPdf({
  currency,
  income,
  totalExpenses,
  netSavings,
  savingsRate,
  totalDebt,
  totalInterestCost,
  finalValue,
  annualRate,
  years,
  monthlyContrib,
  allocData,
  risk,
  recommendations,
  charts = [],
  chartsTitle = "Your plan in charts",
  date,
}: PlannerPdfProps) {
  const snapshot = [
    { label: "Monthly Surplus",        value: `${currency}${fmt(Math.max(0, netSavings))}`, sub: `${currency}${fmt(income)} income · ${currency}${fmt(totalExpenses)} expenses`, color: "green"  },
    { label: "Savings Rate",           value: `${savingsRate.toFixed(1)}%`,                  sub: savingsRate >= 20 ? "Excellent" : savingsRate >= 10 ? "Good start" : "Below target",      color: savingsRate >= 20 ? "green" : savingsRate >= 10 ? "amber" : "red" },
    { label: "Total Debt",             value: `${currency}${fmt(totalDebt)}`,                sub: `${currency}${fmt(totalInterestCost)} est. interest`,                                      color: "red"    },
    { label: "Est. Interest Cost",     value: `${currency}${fmt(totalInterestCost)}`,        sub: "Over repayment terms",                                                                    color: "amber"  },
    { label: `Projected Wealth (${years}yr)`, value: `${currency}${fmt(finalValue)}`,        sub: `At ${annualRate}% p.a. · ${currency}${fmt(monthlyContrib)}/mo`,                          color: "blue"   },
    { label: "Allocation Profile",     value: risk.charAt(0).toUpperCase() + risk.slice(1), sub: `${allocData[0]?.value ?? 0}% stocks`,                                                    color: "purple" },
  ];

  const BEST_PRACTICES = [
    "Pay yourself first — automate savings on payday",
    "Maximise employer pension match before other investments",
    "Build emergency fund (3-6 months expenses) before investing aggressively",
    "Pay off high-interest debt (above 10%) before investing",
    "Diversify across asset classes and geographies",
    "Review and rebalance your portfolio annually",
    "Increase your savings rate by 1% each year",
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Personal Financial Report</Text>
            <Text style={styles.headerSub}>FinancePlots · financeplots.com</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerMeta}>Generated {date}</Text>
            <Image style={styles.logoImg} src="https://www.financeplots.com/logo-sm.png" />
          </View>
        </View>

        {/* Section 1: Financial Snapshot */}
        <Text style={styles.sectionLabel}>Financial Snapshot</Text>
        <View style={styles.kpiRow}>
          {snapshot.slice(0, 3).map((kpi) => {
            const extraStyle =
              kpi.color === "green"  ? styles.kpiCardGreen  :
              kpi.color === "red"    ? styles.kpiCardRed    :
              kpi.color === "amber"  ? styles.kpiCardAmber  :
              kpi.color === "purple" ? styles.kpiCardPurple :
              {};
            return (
              <View key={kpi.label} style={[styles.kpiCard, extraStyle]}>
                <Text style={styles.kpiLabel}>{kpi.label}</Text>
                <Text style={styles.kpiValue}>{kpi.value}</Text>
                <Text style={styles.kpiSub}>{kpi.sub}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.kpiRow}>
          {snapshot.slice(3, 6).map((kpi) => {
            const extraStyle =
              kpi.color === "green"  ? styles.kpiCardGreen  :
              kpi.color === "red"    ? styles.kpiCardRed    :
              kpi.color === "amber"  ? styles.kpiCardAmber  :
              kpi.color === "purple" ? styles.kpiCardPurple :
              {};
            return (
              <View key={kpi.label} style={[styles.kpiCard, extraStyle]}>
                <Text style={styles.kpiLabel}>{kpi.label}</Text>
                <Text style={styles.kpiValue}>{kpi.value}</Text>
                <Text style={styles.kpiSub}>{kpi.sub}</Text>
              </View>
            );
          })}
        </View>

        {/* Section 2: Recommendations */}
        <Text style={styles.sectionLabel}>Personalised Recommendations</Text>
        {recommendations.map((rec, i) => {
          const extraStyle =
            rec.color === "amber" ? styles.recCardAmber :
            rec.color === "red"   ? styles.recCardRed   :
            {};
          return (
            <View key={i} style={[styles.recCard, extraStyle]}>
              <Text style={styles.recIcon}>{rec.icon}</Text>
              <View style={styles.recRight}>
                <Text style={styles.recTitle}>{rec.title}</Text>
                <Text style={styles.recBody}>{rec.body}</Text>
              </View>
            </View>
          );
        })}

        {/* Section 3: Best Practices */}
        <Text style={styles.sectionLabel}>Best Practices Checklist</Text>
        {BEST_PRACTICES.map((item, i) => (
          <View key={i} style={styles.checkItem}>
            <Text style={styles.checkMark}>✓</Text>
            <Text style={styles.checkText}>{item}</Text>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>FinancePlots · financeplots.com</Text>
          <Text style={styles.footerText}>Not financial advice · For informational purposes only</Text>
        </View>

      </Page>

      {charts.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={[styles.sectionLabel, { marginTop: 0 }]}>{chartsTitle}</Text>
          <View style={styles.chartGrid}>
            {charts.map((c, i) => (
              <View key={i} style={styles.chartCard}>
                <Text style={styles.chartTitle}>{c.title}</Text>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image style={styles.chartImg} src={c.src} />
              </View>
            ))}
          </View>
          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>FinancePlots · financeplots.com</Text>
            <Text style={styles.footerText}>Not financial advice · For informational purposes only</Text>
          </View>
        </Page>
      )}
    </Document>
  );
}
