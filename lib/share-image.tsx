import { ImageResponse } from "next/og";
import { TAX_YEAR } from "@/lib/calculators";
import { gbp, perHundred, salaryPage } from "@/lib/salary-pages";
import { HEADLINE_RATE_PCT, HEADLINE_YEARS, mortgagePage } from "@/lib/mortgage-pages";

// Share cards (Open Graph / X) for the "£45,000 after tax" and "£200,000
// mortgage" pages: one big number, one bar, the page's address. Drawn per page
// from the same figures the page shows, so a post on LinkedIn, X or WhatsApp
// carries the answer instead of the site's generic card. Colours follow the
// position of each part (the site's chart palette), never good/bad.

export const SHARE_SIZE = { width: 1200, height: 630 } as const;

const BG = "#0a0f1e";
const PANEL = "#0d1426";
const MUTED = "#94a3b8";
const FAINT = "#64748b";
const PART_COLOURS = ["#3b82f6", "#64748b", "#94a3b8"];

interface Part { label: string; value: number; display: string }

function Card({ kicker, from, big, sub, parts, barCaption, url }: {
  kicker: string; from: string; big: string; sub: string; parts: Part[]; barCaption: string; url: string;
}) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: BG, padding: "56px 64px", color: "#ffffff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 28 }}>
        <div style={{ display: "flex" }}>
          <span>Finance</span>
          <span style={{ color: "#60a5fa" }}>Plots</span>
        </div>
        <div style={{ display: "flex", color: MUTED, fontSize: 24 }}>{kicker}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", marginTop: 48 }}>
        <div style={{ display: "flex", fontSize: 44, color: MUTED }}>{from}</div>
        <div style={{ display: "flex", fontSize: 112, lineHeight: 1.05, marginTop: 6, letterSpacing: -2 }}>{big}</div>
        <div style={{ display: "flex", fontSize: 30, color: MUTED, marginTop: 10 }}>{sub}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", background: PANEL, borderRadius: 18, padding: "22px 26px" }}>
        <div style={{ display: "flex", fontSize: 22, color: MUTED, marginBottom: 12 }}>{barCaption}</div>
        <div style={{ display: "flex", width: "100%", height: 34, borderRadius: 8, overflow: "hidden" }}>
          {parts.map((p, i) => (
            <div key={p.label} style={{ display: "flex", width: `${(p.value / total) * 100}%`, height: "100%", background: PART_COLOURS[i] }} />
          ))}
        </div>
        <div style={{ display: "flex", marginTop: 14, fontSize: 24 }}>
          {parts.map((p, i) => (
            <div key={p.label} style={{ display: "flex", alignItems: "center", marginRight: 36 }}>
              <div style={{ display: "flex", width: 16, height: 16, borderRadius: 4, background: PART_COLOURS[i], marginRight: 10 }} />
              <span style={{ color: MUTED, marginRight: 8 }}>{p.label}</span>
              <span>{p.display}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", marginTop: 18, fontSize: 22, color: FAINT }}>{url}</div>
    </div>
  );
}

export function salaryShareImage(salary: number) {
  const p = salaryPage(salary);
  const h = perHundred(p.base);
  return new ImageResponse(
    (
      <Card
        kicker={`UK take-home pay · ${TAX_YEAR}`}
        from={`${gbp(salary)} salary`}
        big={`${gbp(p.monthly)} a month`}
        sub={`${gbp(p.base.takeHome)} a year after income tax and National Insurance`}
        barCaption="Of every £100 you earn"
        parts={[
          { label: "You keep", value: h.keep, display: `£${h.keep}` },
          { label: "Income tax", value: h.incomeTax, display: `£${h.incomeTax}` },
          { label: "NI", value: h.ni, display: `£${h.ni}` },
        ]}
        url={`financeplots.com/tools/take-home-pay/${salary}-after-tax`}
      />
    ),
    SHARE_SIZE,
  );
}

export function mortgageShareImage(amount: number) {
  const p = mortgagePage(amount);
  return new ImageResponse(
    (
      <Card
        kicker="Mortgage payments"
        from={`${gbp(amount)} mortgage`}
        big={`${gbp(p.monthly)} a month`}
        sub={`at ${HEADLINE_RATE_PCT}% over ${HEADLINE_YEARS} years (example rate), repayment`}
        barCaption={`You repay ${gbp(p.totalRepaid)} in total`}
        parts={[
          { label: "Borrowed", value: amount, display: gbp(amount) },
          { label: "Interest", value: p.totalInterest, display: gbp(p.totalInterest) },
        ]}
        url={`financeplots.com/tools/lending/${amount}-mortgage`}
      />
    ),
    SHARE_SIZE,
  );
}
