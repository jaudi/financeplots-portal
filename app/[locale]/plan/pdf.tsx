import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

// The financial plan as a PDF, built in the browser from the /plan page's own
// figures and charts (rasterised from the same ChartSpecs the MCP returns).
// Copy arrives translated; this file holds layout only.

const styles = StyleSheet.create({
  page: { padding: 40, paddingBottom: 56, backgroundColor: "#ffffff", fontFamily: "Helvetica", fontSize: 10, color: "#111827" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, paddingBottom: 12, borderBottom: "2px solid #1d4ed8" },
  headerTitle: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#0a0f1e" },
  headerMeta: { fontSize: 9, color: "#9ca3af", marginTop: 4 },
  logoImg: { width: 90, height: 34, objectFit: "contain" },
  section: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#3b82f6", textTransform: "uppercase", letterSpacing: 1, marginTop: 16, marginBottom: 6 },
  kpiRow: { flexDirection: "row", gap: 8 },
  kpi: { flex: 1, padding: 8, backgroundColor: "#f8fafc", borderRadius: 4, borderLeft: "3px solid #3b82f6" },
  kpiLabel: { fontSize: 7, color: "#6b7280", textTransform: "uppercase", marginBottom: 2 },
  kpiValue: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#0a0f1e" },
  bullet: { fontSize: 9, color: "#374151", marginBottom: 3 },
  note: { fontSize: 8, color: "#6b7280", marginBottom: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "33%", marginBottom: 6 },
  cellLabel: { fontSize: 7, color: "#6b7280" },
  cellValue: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  th: { flexDirection: "row", backgroundColor: "#1d4ed8", padding: "5 6" },
  thCell: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  tr: { flexDirection: "row", padding: "4 6", borderBottom: "1px solid #f1f5f9" },
  td: { fontSize: 8, color: "#374151" },
  chart: { width: "80%", alignSelf: "center", marginBottom: 8 },
  important: { marginTop: 14, padding: 10, border: "1px solid #f59e0b", borderRadius: 4, backgroundColor: "#fffbeb" },
  importantText: { fontSize: 8.5, color: "#374151", lineHeight: 1.4 },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, borderTop: "1px solid #e5e7eb", paddingTop: 6, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7.5, color: "#9ca3af" },
});

export interface PlanPdfStrings {
  title: string;
  generated: string;
  secSituation: string;
  secFlags: string;
  secMilestones: string;
  secStress: string;
  secLevers: string;
  secCharts: string;
  secAssumptions: string;
  secGaps: string;
  secImportant: string;
  colTest: string;
  colOutcome: string;
  colAtEnd: string;
  colLever: string;
  colWith: string;
  colChange: string;
  colAssumption: string;
  colValue: string;
  colReason: string;
  noFlags: string;
  leversNote: string;
  resilience: string;
  gapsBody: string;
  footer: string;
}

interface Props {
  s: PlanPdfStrings;
  kpis: [string, string][];
  flags: string[];
  milestones: [string, string][];
  scenarios: { name: string; outcome: string; atEnd: string }[];
  levers: { name: string; outcome: string; change: string }[];
  assumptions: { name: string; value: string; reason: string }[];
  charts: string[];
}

function Table({ head, rows, widths }: { head: string[]; rows: string[][]; widths: number[] }) {
  return (
    <View>
      <View style={styles.th}>{head.map((h, i) => <Text key={i} style={[styles.thCell, { flex: widths[i] }]}>{h}</Text>)}</View>
      {rows.map((r, k) => (
        <View key={k} style={styles.tr} wrap={false}>{r.map((c, i) => <Text key={i} style={[styles.td, { flex: widths[i] }]}>{c}</Text>)}</View>
      ))}
    </View>
  );
}

export default function PlanPDF({ s, kpis, flags, milestones, scenarios, levers, assumptions, charts }: Props) {
  const footer = (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>financeplots.com · {s.title}</Text>
      <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
  return (
    <Document title={s.title}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{s.title}</Text>
            <Text style={styles.headerMeta}>{s.generated}</Text>
          </View>
          <Image style={styles.logoImg} src="https://www.financeplots.com/logo-sm.png" />
        </View>

        <Text style={styles.section}>{s.secSituation}</Text>
        <View style={styles.kpiRow}>
          {kpis.map(([k, v]) => (
            <View key={k} style={styles.kpi}><Text style={styles.kpiLabel}>{k}</Text><Text style={styles.kpiValue}>{v}</Text></View>
          ))}
        </View>

        <Text style={styles.section}>{s.secFlags}</Text>
        {flags.length ? flags.map((f) => <Text key={f} style={styles.bullet}>• {f}</Text>) : <Text style={styles.bullet}>{s.noFlags}</Text>}

        <Text style={styles.section}>{s.secMilestones}</Text>
        <View style={styles.grid}>
          {milestones.map(([k, v]) => (
            <View key={k} style={styles.cell}><Text style={styles.cellLabel}>{k}</Text><Text style={styles.cellValue}>{v}</Text></View>
          ))}
        </View>

        <Text style={styles.section}>{s.secStress}</Text>
        <Text style={styles.note}>{s.resilience}</Text>
        <Table head={[s.colTest, s.colOutcome, s.colAtEnd]} widths={[3, 2, 1.5]} rows={scenarios.map((r) => [r.name, r.outcome, r.atEnd])} />

        <Text style={styles.section}>{s.secLevers}</Text>
        <Text style={styles.note}>{s.leversNote}</Text>
        <Table head={[s.colLever, s.colWith, s.colChange]} widths={[3, 2, 1.5]} rows={levers.map((r) => [r.name, r.outcome, r.change])} />
        {footer}
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.section}>{s.secCharts}</Text>
        {charts.map((src, i) => <Image key={i} style={styles.chart} src={src} />)}
        {footer}
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.section}>{s.secAssumptions}</Text>
        <Table head={[s.colAssumption, s.colValue, s.colReason]} widths={[2, 1.2, 4]} rows={assumptions.map((a) => [a.name, a.value, a.reason])} />

        <Text style={styles.section}>{s.secGaps}</Text>
        <Text style={styles.bullet}>{s.gapsBody}</Text>

        <View style={styles.important} wrap={false}>
          <Text style={[styles.section, { marginTop: 0, color: "#b45309" }]}>{s.secImportant}</Text>
          <Text style={styles.importantText}>{s.footer}</Text>
        </View>
        {footer}
      </Page>
    </Document>
  );
}
