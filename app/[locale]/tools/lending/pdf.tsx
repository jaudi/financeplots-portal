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

const fmt = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 0 });
const fmtM = (n: number) => n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface AmorRow { period: number; payment: number; interest: number; principal: number; balance: number }

interface Props {
  currency: string;
  mode: "loan" | "mortgage";
  amount: number;
  rate: number;
  years: number;
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  schedule: AmorRow[];
}

export default function LendingPDF({ currency, mode, amount, rate, years, monthlyPayment, totalPaid, totalInterest, schedule }: Props) {
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const title = mode === "loan" ? "Loan Calculator" : "Mortgage Calculator";
  const preview = schedule.slice(0, 24);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSub}>{currency}{fmt(amount)} · {rate}% · {years} years</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.headerMeta}>Generated {date}</Text>
            <Image style={styles.logoImg} src="https://www.financeplots.com/logo-sm.png" />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Key Metrics</Text>
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Monthly Payment</Text>
            <Text style={styles.kpiValue}>{currency}{fmtM(monthlyPayment)}</Text>
            <Text style={styles.kpiSub}>{years}-year term</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Repayment</Text>
            <Text style={styles.kpiValue}>{currency}{fmt(totalPaid)}</Text>
            <Text style={styles.kpiSub}>Loan: {currency}{fmt(amount)}</Text>
          </View>
          <View style={[styles.kpiCard, styles.kpiCardRed]}>
            <Text style={styles.kpiLabel}>Total Interest</Text>
            <Text style={styles.kpiValue}>{currency}{fmt(totalInterest)}</Text>
            <Text style={styles.kpiSub}>{amount > 0 ? ((totalInterest / amount) * 100).toFixed(1) : 0}% of loan</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Interest Rate</Text>
            <Text style={styles.kpiValue}>{rate}%</Text>
            <Text style={styles.kpiSub}>Annual</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Amortisation Schedule (First 24 Months)</Text>
        <View style={styles.tableHeader}>
          {["Month", "Payment", "Interest", "Principal", "Balance"].map(h => (
            <Text key={h} style={styles.tableHeaderCell}>{h}</Text>
          ))}
        </View>
        {preview.map((row, idx) => (
          <View key={row.period} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
            <Text style={styles.tableCellBold}>{row.period}</Text>
            <Text style={styles.tableCell}>{currency}{fmtM(row.payment)}</Text>
            <Text style={styles.tableCell}>{currency}{fmtM(row.interest)}</Text>
            <Text style={styles.tableCell}>{currency}{fmtM(row.principal)}</Text>
            <Text style={styles.tableCell}>{currency}{fmt(row.balance)}</Text>
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
