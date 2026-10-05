import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const S = StyleSheet.create({
  page: { padding: 36, backgroundColor: "#ffffff", fontFamily: "Helvetica", fontSize: 9, color: "#111827" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, paddingBottom: 12, borderBottom: "2px solid #1d4ed8" },
  headerTitle: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#0a0f1e" },
  headerSub: { fontSize: 10, color: "#4b5563", marginTop: 3 },
  headerMeta: { fontSize: 8, color: "#9ca3af" },
  sectionLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#1d4ed8", textTransform: "uppercase", letterSpacing: 1, marginTop: 16, marginBottom: 6 },
  sectionLabelPurple: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#7c3aed", textTransform: "uppercase", letterSpacing: 1, marginTop: 16, marginBottom: 6 },
  kpiRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  kpiCard: { flex: 1, padding: 8, backgroundColor: "#f8fafc", borderRadius: 5, borderLeft: "3px solid #3b82f6" },
  kpiCardGreen: { borderLeft: "3px solid #22c55e" },
  kpiCardRed: { borderLeft: "3px solid #ef4444" },
  kpiLabel: { fontSize: 7, color: "#9ca3af", textTransform: "uppercase", marginBottom: 2 },
  kpiValue: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#0a0f1e" },
  kpiSub: { fontSize: 7, color: "#9ca3af", marginTop: 1 },
  th: { flexDirection: "row", backgroundColor: "#1d4ed8", padding: "5 6" },
  thPurple: { flexDirection: "row", backgroundColor: "#6d28d9", padding: "5 6" },
  thCell: { flex: 1, fontSize: 7, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  tr: { flexDirection: "row", padding: "4 6", borderBottom: "1px solid #f1f5f9" },
  trAlt: { flexDirection: "row", padding: "4 6", backgroundColor: "#f8fafc", borderBottom: "1px solid #f1f5f9" },
  trBold: { flexDirection: "row", padding: "4 6", backgroundColor: "#eff6ff", borderBottom: "2px solid #bfdbfe" },
  trSection: { flexDirection: "row", padding: "5 6", backgroundColor: "#e0e7ff" },
  td: { flex: 1, fontSize: 7, color: "#374151" },
  tdBold: { flex: 1, fontSize: 7, fontFamily: "Helvetica-Bold", color: "#0a0f1e" },
  tdGreen: { flex: 1, fontSize: 7, color: "#15803d" },
  tdRed: { flex: 1, fontSize: 7, color: "#dc2626" },
  tdBlue: { flex: 1, fontSize: 7, color: "#1d4ed8" },
  tdPurple: { flex: 1, fontSize: 7, color: "#7c3aed" },
  footer: { position: "absolute", bottom: 24, left: 36, right: 36, borderTop: "1px solid #e5e7eb", paddingTop: 5, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#9ca3af" },
  logoImg: { width: 90, height: 34, objectFit: "contain" },
});

const fmt = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 0 });
const fmtM = (n: number) => n.toLocaleString("en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fmtVal = (val: number, currency: string, isPct?: boolean) =>
  isPct ? `${fmtM(val)}%` : val < 0 ? `(${currency}${fmt(Math.abs(val))})` : `${currency}${fmt(val)}`;

interface YearData {
  year: number; revenue: number; cogs: number; grossProfit: number; grossMargin: number;
  opex: number; ebitda: number; ebitdaMargin: number; depreciation: number; ebit: number;
  interest: number; ebt: number; tax: number; netIncome: number; netMargin: number;
}

interface BsCfData {
  year: number;
  // CF
  netIncome: number; depreciation: number; changeAR: number; changeAP: number;
  operatingCF: number; capex: number; investingCF: number; debtRepayment: number;
  financingCF: number; netCF: number; beginningCash: number; endingCash: number;
  // BS
  cash: number; ar: number; totalCurrentAssets: number; ppeNet: number; totalAssets: number;
  ap: number; debt: number; totalLiabilities: number; equity: number; totalLE: number;
}

interface Props {
  currency: string;
  companyName: string;
  years: YearData[];
  bsAndCf: BsCfData[];
  cagr: number;
  avgEbitdaMargin: number;
  avgNetMargin: number;
  year5Revenue: number;
}

const YR = (years: { year: number }[]) => years.map(y => `Year ${y.year}`);

export default function FinancialModelPDF({ currency, companyName, years, bsAndCf, cagr, avgEbitdaMargin, avgNetMargin }: Props) {
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const y1 = years[0]; const y5 = years[years.length - 1];

  const IS_ROWS: { label: string; key: keyof YearData; bold?: boolean; color?: string; pct?: boolean }[] = [
    { label: "Revenue",          key: "revenue",       bold: true,  color: "green" },
    { label: "COGS",             key: "cogs",           color: "red" },
    { label: "Gross Profit",     key: "grossProfit",    bold: true },
    { label: "Gross Margin %",   key: "grossMargin",    pct: true },
    { label: "OpEx",             key: "opex",           color: "red" },
    { label: "EBITDA",           key: "ebitda",         bold: true },
    { label: "EBITDA Margin %",  key: "ebitdaMargin",   pct: true },
    { label: "D&A",              key: "depreciation",   color: "red" },
    { label: "EBIT",             key: "ebit",           bold: true },
    { label: "Interest Expense", key: "interest",       color: "red" },
    { label: "EBT",              key: "ebt" },
    { label: "Tax",              key: "tax",            color: "red" },
    { label: "Net Income",       key: "netIncome",      bold: true,  color: "dynamic" },
    { label: "Net Margin %",     key: "netMargin",      pct: true },
  ];

  const BS_ROWS: { label: string; key: keyof BsCfData; bold?: boolean; color?: string; section?: string }[] = [
    { label: "ASSETS", key: "cash", section: "blue" },
    { label: "Cash & Equivalents",   key: "cash",              color: "blue" },
    { label: "Accounts Receivable",  key: "ar" },
    { label: "Total Current Assets", key: "totalCurrentAssets", bold: true },
    { label: "PP&E (net)",           key: "ppeNet" },
    { label: "Total Assets",         key: "totalAssets",        bold: true, color: "bold" },
    { label: "LIABILITIES & EQUITY", key: "ap", section: "blue" },
    { label: "Accounts Payable",     key: "ap",                 color: "red" },
    { label: "Long-term Debt",       key: "debt",               color: "red" },
    { label: "Total Liabilities",    key: "totalLiabilities",   bold: true, color: "red" },
    { label: "Shareholders' Equity", key: "equity",             color: "green" },
    { label: "Total L&E",            key: "totalLE",            bold: true, color: "bold" },
  ];

  const CF_ROWS: { label: string; key: keyof BsCfData; bold?: boolean; color?: string; section?: string }[] = [
    { label: "OPERATING ACTIVITIES",                    key: "netIncome",     section: "purple" },
    { label: "Net Income",                              key: "netIncome" },
    { label: "Add: Depreciation & Amortisation",        key: "depreciation" },
    { label: "Change in Accounts Receivable",           key: "changeAR" },
    { label: "Change in Accounts Payable",              key: "changeAP" },
    { label: "Cash from Operations",                    key: "operatingCF",   bold: true, color: "blue" },
    { label: "INVESTING ACTIVITIES",                    key: "capex",         section: "purple" },
    { label: "Capital Expenditure",                     key: "capex",         color: "red" },
    { label: "Cash from Investing",                     key: "investingCF",   bold: true, color: "red" },
    { label: "FINANCING ACTIVITIES",                    key: "debtRepayment", section: "purple" },
    { label: "Debt Repayment",                          key: "debtRepayment", color: "red" },
    { label: "Cash from Financing",                     key: "financingCF",   bold: true, color: "red" },
    { label: "NET CHANGE IN CASH",                      key: "netCF",         bold: true, section: "purple" },
    { label: "Beginning Cash",                          key: "beginningCash" },
    { label: "Ending Cash",                             key: "endingCash",    bold: true, color: "green" },
  ];

  const getCellStyle = (color?: string, val?: number) => {
    if (color === "green") return S.tdGreen;
    if (color === "red") return S.tdRed;
    if (color === "blue") return S.tdBlue;
    if (color === "bold") return S.tdBold;
    if (color === "dynamic") return (val ?? 0) >= 0 ? S.tdGreen : S.tdRed;
    return S.td;
  };

  const PageHeader = ({ title }: { title: string }) => (
    <View style={S.header}>
      <View>
        <Text style={S.headerTitle}>{title}</Text>
        <Text style={S.headerSub}>{companyName}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={S.headerMeta}>Generated {date}</Text>
        <Image style={S.logoImg} src="https://www.financeplots.com/logo-sm.png" />
      </View>
    </View>
  );

  const Footer = () => (
    <View style={S.footer} fixed>
      <Text style={S.footerText}>FinancePlots · financeplots.com</Text>
      <Text style={S.footerText}>For informational purposes only · Not financial advice</Text>
    </View>
  );

  return (
    <Document>
      {/* Page 1 — KPIs + Income Statement */}
      <Page size="A4" orientation="landscape" style={S.page}>
        <PageHeader title="5-Year Financial Model" />

        <Text style={S.sectionLabel}>5-Year Highlights</Text>
        <View style={S.kpiRow}>
          <View style={S.kpiCard}>
            <Text style={S.kpiLabel}>Year 1 Revenue</Text>
            <Text style={S.kpiValue}>{currency}{fmt(y1.revenue)}</Text>
            <Text style={S.kpiSub}>Base year</Text>
          </View>
          <View style={[S.kpiCard, S.kpiCardGreen]}>
            <Text style={S.kpiLabel}>Year 5 Revenue</Text>
            <Text style={S.kpiValue}>{currency}{fmt(y5.revenue)}</Text>
            <Text style={S.kpiSub}>CAGR {fmtM(cagr)}%</Text>
          </View>
          <View style={S.kpiCard}>
            <Text style={S.kpiLabel}>Avg EBITDA Margin</Text>
            <Text style={S.kpiValue}>{fmtM(avgEbitdaMargin)}%</Text>
            <Text style={S.kpiSub}>5-year average</Text>
          </View>
          <View style={[S.kpiCard, y5.netIncome >= 0 ? S.kpiCardGreen : S.kpiCardRed]}>
            <Text style={S.kpiLabel}>Avg Net Margin</Text>
            <Text style={S.kpiValue}>{fmtM(avgNetMargin)}%</Text>
            <Text style={S.kpiSub}>5-year average</Text>
          </View>
        </View>

        <Text style={S.sectionLabel}>Income Statement — 5-Year Projection</Text>
        <View style={S.th}>
          <Text style={[S.thCell, { flex: 2 }]}>Metric</Text>
          {YR(years).map(h => <Text key={h} style={S.thCell}>{h}</Text>)}
        </View>
        {IS_ROWS.map(({ label, key, bold, color, pct: isPct }, idx) => (
          <View key={label} style={bold ? S.trBold : idx % 2 === 0 ? S.tr : S.trAlt}>
            <Text style={[bold ? S.tdBold : S.td, { flex: 2 }]}>{label}</Text>
            {years.map(y => {
              const val = y[key as keyof YearData] as number;
              return (
                <Text key={y.year} style={getCellStyle(color === "dynamic" ? "dynamic" : color, val)}>
                  {isPct ? `${fmtM(val)}%` : `${currency}${fmt(val)}`}
                </Text>
              );
            })}
          </View>
        ))}

        <Footer />
      </Page>

      {/* Page 2 — Balance Sheet */}
      <Page size="A4" orientation="landscape" style={S.page}>
        <PageHeader title="Balance Sheet — 5-Year Projection" />

        <View style={S.th}>
          <Text style={[S.thCell, { flex: 2.5 }]}>Item</Text>
          {YR(bsAndCf).map(h => <Text key={h} style={S.thCell}>{h}</Text>)}
        </View>
        {BS_ROWS.map(({ label, key, bold, color, section }, idx) => {
          if (section) {
            return (
              <View key={`s-${idx}`} style={S.trSection}>
                <Text style={[S.tdBold, { flex: 2.5, color: "#1d4ed8" }]}>{label}</Text>
                {bsAndCf.map(y => <Text key={y.year} style={S.tdBold}> </Text>)}
              </View>
            );
          }
          const rowStyle = bold ? S.trBold : idx % 2 === 0 ? S.tr : S.trAlt;
          return (
            <View key={label} style={rowStyle}>
              <Text style={[bold ? S.tdBold : S.td, { flex: 2.5 }]}>{label}</Text>
              {bsAndCf.map(y => {
                const val = y[key] as number;
                return <Text key={y.year} style={getCellStyle(color, val)}>{fmtVal(val, currency)}</Text>;
              })}
            </View>
          );
        })}

        <Footer />
      </Page>

      {/* Page 3 — Cash Flow Statement */}
      <Page size="A4" orientation="landscape" style={S.page}>
        <PageHeader title="Cash Flow Statement — 5-Year Projection" />

        <View style={S.thPurple}>
          <Text style={[S.thCell, { flex: 2.5 }]}>Item</Text>
          {YR(bsAndCf).map(h => <Text key={h} style={S.thCell}>{h}</Text>)}
        </View>
        {CF_ROWS.map(({ label, key, bold, color, section }, idx) => {
          if (section) {
            return (
              <View key={`s-${idx}`} style={[S.trSection, { backgroundColor: "#ede9fe" }]}>
                <Text style={[S.tdBold, { flex: 2.5, color: "#6d28d9" }]}>{label}</Text>
                {bsAndCf.map(y => <Text key={y.year} style={S.tdBold}> </Text>)}
              </View>
            );
          }
          const rowStyle = bold ? S.trBold : idx % 2 === 0 ? S.tr : S.trAlt;
          return (
            <View key={label} style={rowStyle}>
              <Text style={[bold ? S.tdBold : S.td, { flex: 2.5 }]}>{label}</Text>
              {bsAndCf.map(y => {
                const val = y[key] as number;
                return <Text key={y.year} style={getCellStyle(color, val)}>{fmtVal(val, currency)}</Text>;
              })}
            </View>
          );
        })}

        <Footer />
      </Page>
    </Document>
  );
}
