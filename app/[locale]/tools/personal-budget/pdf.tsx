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
  tableHeaderCell: { flex: 1, fontSize: 8, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  tableRow: { flexDirection: "row", padding: "5 8", borderBottom: "1px solid #f1f5f9" },
  tableRowAlt: { flexDirection: "row", padding: "5 8", backgroundColor: "#f8fafc", borderBottom: "1px solid #f1f5f9" },
  tableCell: { flex: 1, fontSize: 8, color: "#374151" },
  tableCellBold: { flex: 1, fontSize: 8, fontFamily: "Helvetica-Bold", color: "#0a0f1e" },
  footer: { position: "absolute", bottom: 28, left: 40, right: 40, borderTop: "1px solid #e5e7eb", paddingTop: 6, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 8, color: "#9ca3af" },
  logoImg: { width: 90, height: 34, objectFit: "contain" },
});

interface BudgetRow { category: string; item: string; monthly: number; annual: number; pctExpenses: number }

/** Every label, already translated by the page. Helvetica (the PDF's font) has
 *  no emojis. */
export interface BudgetPdfText {
  title: string; generated: string; summary: string;
  income: string; incomeSub: string; expenses: string; expensesSub: string;
  savings: string; savingsSub: string; rate: string; rateSub: string;
  breakdown: string; colCategory: string; colItem: string; colMonthly: string; colAnnual: string; colPct: string;
  footer: string;
}

interface Props {
  text: BudgetPdfText;
  budgetName: string;
  currency: string;
  totalIncome: number;
  totalExpenses: number;
  netSaving: number;
  savingRate: number;
  rows: BudgetRow[];
}

const fmtC = (n: number, cur: string) => `${cur}${Math.abs(n).toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;

export default function PersonalBudgetPDF({ text, budgetName, currency, totalIncome, totalExpenses, netSaving, savingRate, rows }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{text.title}</Text>
            <Text style={styles.headerSub}>{budgetName}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.headerMeta}>{text.generated}</Text>
            <Image style={styles.logoImg} src="https://www.financeplots.com/logo-sm.png" />
          </View>
        </View>

        <Text style={styles.sectionLabel}>{text.summary}</Text>
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>{text.income}</Text>
            <Text style={styles.kpiValue}>{fmtC(totalIncome, currency)}</Text>
            <Text style={styles.kpiSub}>{text.incomeSub}</Text>
          </View>
          <View style={[styles.kpiCard, styles.kpiCardRed]}>
            <Text style={styles.kpiLabel}>{text.expenses}</Text>
            <Text style={styles.kpiValue}>{fmtC(totalExpenses, currency)}</Text>
            <Text style={styles.kpiSub}>{text.expensesSub}</Text>
          </View>
          <View style={[styles.kpiCard, netSaving >= 0 ? styles.kpiCardGreen : styles.kpiCardRed]}>
            <Text style={styles.kpiLabel}>{text.savings}</Text>
            <Text style={styles.kpiValue}>{fmtC(netSaving, currency)}</Text>
            <Text style={styles.kpiSub}>{text.savingsSub}</Text>
          </View>
          <View style={[styles.kpiCard, savingRate >= 20 ? styles.kpiCardGreen : savingRate >= 10 ? styles.kpiCard : styles.kpiCardRed]}>
            <Text style={styles.kpiLabel}>{text.rate}</Text>
            <Text style={styles.kpiValue}>{savingRate.toFixed(1)}%</Text>
            <Text style={styles.kpiSub}>{text.rateSub}</Text>
          </View>
        </View>

        {rows.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>{text.breakdown}</Text>
            <View style={styles.tableHeader}>
              {[text.colCategory, text.colItem, text.colMonthly, text.colAnnual, text.colPct].map((h, i) => (
                <Text key={i} style={[styles.tableHeaderCell, i === 1 ? { flex: 2 } : {}]}>{h}</Text>
              ))}
            </View>
            {rows.map((row, idx) => (
              <View key={idx} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={styles.tableCell}>{row.category}</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>{row.item}</Text>
                <Text style={styles.tableCell}>{fmtC(row.monthly, currency)}</Text>
                <Text style={styles.tableCell}>{fmtC(row.annual, currency)}</Text>
                <Text style={styles.tableCell}>{row.pctExpenses.toFixed(1)}%</Text>
              </View>
            ))}
          </>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>FinancePlots · financeplots.com</Text>
          <Text style={styles.footerText}>{text.footer}</Text>
        </View>
      </Page>
    </Document>
  );
}
