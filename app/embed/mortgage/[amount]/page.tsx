import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EmbedFooter from "@/components/EmbedFooter";
import { mortgageEmbed, withUtm } from "@/lib/embeds";
import { GRID_RATES_PCT, GRID_YEARS, HEADLINE_RATE_PCT, HEADLINE_YEARS, MORTGAGE_PAGES, mortgagePage, parseMortgageSlug } from "@/lib/mortgage-pages";
import { gbp } from "@/lib/salary-pages";

// The embeddable card for one mortgage page: /embed/mortgage/200000.

type Props = { params: Promise<{ amount: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => MORTGAGE_PAGES.map((a) => ({ amount: String(a) }));

const parse = (v: string) => parseMortgageSlug(`${v}-mortgage`);

// A slice of the page's grid that fits a narrow card: four rates around the example, three terms.
const RATES = [4, 4.5, 5, 5.5];
const YEARS = [20, 25, 30];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const amount = parse((await params).amount);
  if (amount === null) return {};
  const e = mortgageEmbed(amount);
  return { title: `${e.title} — FinancePlots`, alternates: { canonical: e.pageUrl } };
}

export default async function MortgageEmbed({ params }: Props) {
  const amount = parse((await params).amount);
  if (amount === null) notFound();
  const p = mortgagePage(amount);
  const e = mortgageEmbed(amount);
  const cell = (r: number, y: number) => p.grid[GRID_RATES_PCT.indexOf(r)][GRID_YEARS.indexOf(y)];
  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white p-4 sm:p-5 flex flex-col">
      <p className="text-xs text-gray-400">{gbp(amount)} repayment mortgage</p>
      <p className="mt-1 text-3xl sm:text-4xl font-extrabold leading-tight">
        {gbp(p.monthly)} <span className="text-base sm:text-lg text-gray-400 font-semibold">a month</span>
      </p>
      <p className="text-sm text-gray-400">
        at {HEADLINE_RATE_PCT}% over {HEADLINE_YEARS} years (example rate) · {gbp(p.totalInterest)} interest in total
      </p>
      <table className="mt-3 w-full text-sm">
        <thead>
          <tr className="text-[11px] text-gray-400 uppercase tracking-wider">
            <th className="text-left font-semibold py-1 pr-2">Rate</th>
            {YEARS.map((y) => <th key={y} className="text-left font-semibold py-1 pr-2 whitespace-nowrap">{y} yrs</th>)}
          </tr>
        </thead>
        <tbody>
          {RATES.map((r) => (
            <tr key={r} className="border-t border-gray-800 text-gray-300">
              <td className="py-1 pr-2 font-semibold text-gray-200">{r}%</td>
              {YEARS.map((y) => (
                <td key={y} className={`py-1 pr-2 whitespace-nowrap ${r === HEADLINE_RATE_PCT && y === HEADLINE_YEARS ? "text-white font-bold" : ""}`}>
                  {gbp(cell(r, y))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <EmbedFooter href={withUtm(e.pageUrl)} label="All rates, overpaying, income needed →" short="All rates and terms →" />
    </main>
  );
}
