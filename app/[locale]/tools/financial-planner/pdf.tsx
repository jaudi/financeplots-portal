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
  // A coloured dot for each recommendation's status. Not an emoji: the PDF's
  // built-in Helvetica has no emoji glyphs and prints them as "=¸", "<¯"…
  recDot:   { width: 7, height: 7, borderRadius: 4, marginTop: 2, marginRight: 8 },
  recRight: { flex: 1 },
  recTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#0a0f1e", marginBottom: 3 },
  recBody:  { fontSize: 8, color: "#374151", lineHeight: 1.4 },
  // Best practices
  checkItem: {
    flexDirection: "row",
    marginBottom: 5,
  },
  checkMark: { width: 6, height: 6, borderRadius: 1, backgroundColor: "#16a34a", marginTop: 2, marginRight: 8 },
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

const DOT: Record<string, string> = { green: "#22c55e", amber: "#f59e0b", red: "#ef4444" };

// Everything shown is passed in already translated (see handleExportPdf in
// page.tsx), so the PDF matches the page's language. Text must stay within
// Helvetica's character set: no emojis or symbols such as ✓.

export interface PlannerPdfProps {
  text: {
    title: string;
    generated: string;
    snapshot: string;
    recommendations: string;
    bestPractices: string;
    charts: string;
    footerLeft: string;
    footerRight: string;
  };
  snapshot: { label: string; value: string; sub: string; color: "green" | "amber" | "red" | "blue" | "purple" }[];
  recommendations: { title: string; body: string; color: string }[];
  bestPractices: string[];
  /** The report's charts as PNG data URLs (see charts.tsx). */
  charts?: { src: string; title: string }[];
}

const KPI_STYLE = {
  green: styles.kpiCardGreen,
  red: styles.kpiCardRed,
  amber: styles.kpiCardAmber,
  purple: styles.kpiCardPurple,
  blue: {},
};

export function PlannerPdf({ text, snapshot, recommendations, bestPractices, charts = [] }: PlannerPdfProps) {
  const footer = (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>{text.footerLeft}</Text>
      <Text style={styles.footerText}>{text.footerRight}</Text>
    </View>
  );
  const kpiRow = (items: PlannerPdfProps["snapshot"]) => (
    <View style={styles.kpiRow}>
      {items.map((kpi) => (
        <View key={kpi.label} style={[styles.kpiCard, KPI_STYLE[kpi.color]]}>
          <Text style={styles.kpiLabel}>{kpi.label}</Text>
          <Text style={styles.kpiValue}>{kpi.value}</Text>
          <Text style={styles.kpiSub}>{kpi.sub}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>{text.title}</Text>
            <Text style={styles.headerSub}>FinancePlots · financeplots.com</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerMeta}>{text.generated}</Text>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image style={styles.logoImg} src="https://www.financeplots.com/logo-sm.png" />
          </View>
        </View>

        <Text style={styles.sectionLabel}>{text.snapshot}</Text>
        {kpiRow(snapshot.slice(0, 3))}
        {kpiRow(snapshot.slice(3, 6))}

        <Text style={styles.sectionLabel}>{text.recommendations}</Text>
        {recommendations.map((rec, i) => (
          <View key={i} style={[styles.recCard, rec.color === "amber" ? styles.recCardAmber : rec.color === "red" ? styles.recCardRed : {}]}>
            <View style={[styles.recDot, { backgroundColor: DOT[rec.color] ?? DOT.green }]} />
            <View style={styles.recRight}>
              <Text style={styles.recTitle}>{rec.title}</Text>
              <Text style={styles.recBody}>{rec.body}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.sectionLabel}>{text.bestPractices}</Text>
        {bestPractices.map((item, i) => (
          <View key={i} style={styles.checkItem}>
            <View style={styles.checkMark} />
            <Text style={styles.checkText}>{item}</Text>
          </View>
        ))}
        {footer}
      </Page>

      {charts.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={[styles.sectionLabel, { marginTop: 0 }]}>{text.charts}</Text>
          <View style={styles.chartGrid}>
            {charts.map((c, i) => (
              <View key={i} style={styles.chartCard}>
                <Text style={styles.chartTitle}>{c.title}</Text>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image style={styles.chartImg} src={c.src} />
              </View>
            ))}
          </View>
          {footer}
        </Page>
      )}
    </Document>
  );
}
