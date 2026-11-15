import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { RevisionCard } from "@/lib/strategy-cards";

// A4, three cards per page. Each row is one card: front on the left, back on
// the right, so cutting along the dashed lines and folding down the middle
// gives a double-sided card.

const CREAM = "#fdf8e4";
const RED = "#c8382e";
const INK = "#1f2a44";

const s = StyleSheet.create({
  page: { paddingVertical: 30, paddingHorizontal: 28, backgroundColor: "#ffffff", fontFamily: "Helvetica", fontSize: 9, color: INK },
  head: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  headTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#0a0f1e" },
  headNote: { fontSize: 7.5, color: "#6b7280" },
  row: { flexDirection: "row", height: 236, borderTop: "1px dashed #9ca3af", borderBottom: "1px dashed #9ca3af", marginBottom: 6 },
  face: { flex: 1, backgroundColor: CREAM, padding: 16, position: "relative" },
  fold: { width: 0, borderLeft: "1px dashed #9ca3af" },
  topic: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 },
  num: { position: "absolute", top: 12, right: 14, fontSize: 9, fontFamily: "Helvetica-Bold", color: RED },
  rule: { borderBottom: `1.5px solid ${RED}`, marginTop: 6, marginBottom: 10 },
  question: { fontSize: 15, fontFamily: "Helvetica-Bold", color: RED, lineHeight: 1.25, marginTop: 26 },
  backTitle: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: RED, marginBottom: 6 },
  point: { flexDirection: "row", marginBottom: 3.5 },
  bullet: { width: 9, color: RED },
  pointText: { flex: 1, lineHeight: 1.3 },
  tip: { marginTop: 6, fontSize: 8.5, fontFamily: "Helvetica-Oblique", color: RED, lineHeight: 1.3 },
  foot: { position: "absolute", bottom: 14, left: 28, right: 28, fontSize: 7, color: "#9ca3af", flexDirection: "row", justifyContent: "space-between" },
});

export default function RevisionCardsPdf({ cards, es, url }: { cards: RevisionCard[]; es: boolean; url: string }) {
  const pages: RevisionCard[][] = [];
  for (let i = 0; i < cards.length; i += 3) pages.push(cards.slice(i, i + 3));
  return (
    <Document title={es ? "Fichas de estrategia — FinancePlots" : "Strategy revision cards — FinancePlots"} author="Javier Audibert">
      {pages.map((group, p) => (
        <Page key={p} size="A4" style={s.page}>
          <View style={s.head}>
            <Text style={s.headTitle}>{es ? "Fichas de repaso: modelos de estrategia" : "Revision cards: strategy models"}</Text>
            <Text style={s.headNote}>{es ? "Recorta por las líneas discontinuas y dobla por la mitad" : "Cut along the dashed lines, fold down the middle"}</Text>
          </View>
          {group.map((c, k) => {
            const n = p * 3 + k + 1;
            return (
              <View key={n} style={s.row} wrap={false}>
                <View style={s.face}>
                  <Text style={s.topic}>{c.topic}</Text>
                  <Text style={s.num}>{n}</Text>
                  <Text style={s.question}>{c.question}</Text>
                </View>
                <View style={s.fold} />
                <View style={s.face}>
                  <Text style={s.backTitle}>{c.question}</Text>
                  <View style={s.rule} />
                  {c.points.map((pt) => (
                    <View key={pt} style={s.point}>
                      <Text style={s.bullet}>•</Text>
                      <Text style={s.pointText}>{pt}</Text>
                    </View>
                  ))}
                  {c.tip && <Text style={s.tip}>{c.tip}</Text>}
                </View>
              </View>
            );
          })}
          <View style={s.foot} fixed>
            <Text>FinancePlots · {url}</Text>
            <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
          </View>
        </Page>
      ))}
    </Document>
  );
}
