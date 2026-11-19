import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import RelatedTools from "@/components/RelatedTools";
import { BASE, pageMetadata } from "@/lib/page-metadata";
import { gbp } from "@/lib/salary-pages";
import {
  GRID_RATES_PCT,
  GRID_YEARS,
  HEADLINE_RATE_PCT,
  HEADLINE_YEARS,
  MORTGAGE_PAGES,
  mortgagePage,
  mortgagePath,
  mortgageSlug,
  parseMortgageSlug,
  yearsMonths,
} from "@/lib/mortgage-pages";

// One static page per amount in MORTGAGE_PAGES ("/tools/lending/200000-mortgage").
// English, in pounds: the searches it answers are UK ones. The /es copy exists
// so the language switch doesn't 404, and its canonical is English.

type Props = { params: Promise<{ locale: string; mortgage: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return MORTGAGE_PAGES.flatMap((a) => [
    { locale: "en", mortgage: mortgageSlug(a) },
    { locale: "es", mortgage: mortgageSlug(a) },
  ]);
}

const headline = `${HEADLINE_RATE_PCT}% over ${HEADLINE_YEARS} years`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mortgage: slug } = await params;
  const amount = parseMortgageSlug(slug);
  if (amount === null) return {};
  const p = mortgagePage(amount);
  return pageMetadata({
    title: `${gbp(amount)} Mortgage Monthly Payments: ${gbp(p.monthly)} a Month at ${headline}`,
    description: `A ${gbp(amount)} repayment mortgage costs ${gbp(p.monthly)} a month at ${headline}, ${gbp(p.totalInterest)} in interest in total. Payments at rates from ${GRID_RATES_PCT[0]}% to ${GRID_RATES_PCT.at(-1)}% and terms of ${GRID_YEARS[0]} to ${GRID_YEARS.at(-1)} years, overpaying, and the income lenders usually look for.`,
    path: mortgagePath(amount),
  });
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-[#0d1426] border border-gray-800 border-l-4 border-l-blue-500 rounded-xl p-4">
      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{label}</div>
      <div className="text-2xl font-extrabold text-white mt-1">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

const roundTo = (n: number, step: number) => Math.round(n / step) * step;

export default async function MortgageAmountPage({ params }: Props) {
  const { mortgage: slug } = await params;
  const amount = parseMortgageSlug(slug);
  if (amount === null) notFound();
  const p = mortgagePage(amount);
  const url = `${BASE}${mortgagePath(amount)}`;
  const hr = GRID_RATES_PCT.indexOf(HEADLINE_RATE_PCT);
  const hy = GRID_YEARS.indexOf(HEADLINE_YEARS);
  const [incomeLow, incomeHigh] = p.incomeRange.map((n) => roundTo(n, 1_000));
  const calculatorHref = `/tools/lending?tab=mortgage&amount=${amount}&rate=${HEADLINE_RATE_PCT}&years=${HEADLINE_YEARS}`;

  const faq = [
    {
      q: `How much is a ${gbp(amount)} mortgage a month?`,
      a: `${gbp(p.monthly)} a month on a repayment mortgage at ${headline}. At ${GRID_RATES_PCT[0]}% it would be ${gbp(p.grid[0][hy])}, and at ${GRID_RATES_PCT.at(-1)}% ${gbp(p.grid.at(-1)![hy])}.`,
    },
    {
      q: `How much interest will I pay on a ${gbp(amount)} mortgage?`,
      a: `${gbp(p.totalInterest)} at ${headline}, if the rate stayed the same for the whole term, so ${gbp(p.totalRepaid)} repaid in total. Overpaying £100 a month would save ${gbp(p.overpaying[0].interestSaved)} of that.`,
    },
    {
      q: `What income do I need for a ${gbp(amount)} mortgage?`,
      a: `Lenders often lend up to about 4 to 4.5 times income, so roughly ${gbp(incomeLow)} to ${gbp(incomeHigh)} a year for the household. Each lender also looks at your outgoings, your deposit and the rate, so the real figure varies.`,
    },
  ];

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            url,
            mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }),
        }}
      />

      <div className="pt-[100px] pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Link href="/tools/lending" className="text-gray-400 hover:text-white text-sm transition">← Mortgage &amp; Loan Calculator</Link>

          <div className="text-center mt-4 mb-10">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">Mortgage payments</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">{gbp(amount)} mortgage</h1>
            <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Borrowing {gbp(amount)} on a repayment mortgage costs <strong className="text-white">{gbp(p.monthly)} a month</strong> at{" "}
              {headline}. {HEADLINE_RATE_PCT}% is an example rate, not a quote: the table below shows other rates and terms.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <Kpi label="Per month" value={gbp(p.monthly)} sub={headline} />
            <Kpi label="Total interest" value={gbp(p.totalInterest)} sub="if the rate never changed" />
            <Kpi label="Total repaid" value={gbp(p.totalRepaid)} sub={`${(p.totalRepaid / amount).toFixed(2)}× what you borrow`} />
            <Kpi label="First payment" value={`${Math.round(p.firstPaymentInterestShare * 100)}% interest`} sub="the rest pays off the loan" />
          </div>

          <section className="bg-[#0d1426] border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-white font-bold mb-1">Monthly payments on {gbp(amount)}</h2>
            <p className="text-xs text-gray-500 mb-4">Repayment mortgage, by interest rate and term. The highlighted figure is the example above.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-xs text-gray-400 uppercase tracking-wider py-2 pr-4 font-semibold">Rate</th>
                    {GRID_YEARS.map((y) => (
                      <th key={y} className="text-left text-xs text-gray-400 uppercase tracking-wider py-2 pr-4 font-semibold whitespace-nowrap">{y} years</th>
                    ))}
                    <th className="text-left text-xs text-gray-400 uppercase tracking-wider py-2 pr-4 font-semibold whitespace-nowrap">Interest-only</th>
                  </tr>
                </thead>
                <tbody>
                  {GRID_RATES_PCT.map((r, ri) => (
                    <tr key={r} className="border-b border-gray-800 text-gray-300">
                      <td className="py-2 pr-4 font-semibold text-gray-200">{r}%</td>
                      {GRID_YEARS.map((y, yi) => (
                        <td key={y} className={`py-2 pr-4 ${ri === hr && yi === hy ? "text-white font-bold bg-blue-500/15 rounded" : ""}`}>
                          {gbp(p.grid[ri][yi])}
                        </td>
                      ))}
                      <td className="py-2 pr-4 text-gray-400">{gbp(p.interestOnly[ri])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-300 leading-relaxed list-disc pl-5">
              <li>
                Every percentage point on the rate adds about {gbp(p.onePointMore)} a month ({gbp(p.onePointMore * 12)} a year) at{" "}
                {HEADLINE_YEARS} years: worth knowing before a fixed deal ends.
              </li>
              <li>
                A longer term lowers the payment but costs more interest: at {HEADLINE_RATE_PCT}%, {GRID_YEARS.at(-1)} years instead of{" "}
                {HEADLINE_YEARS} saves {gbp(p.grid[hr][hy] - p.grid[hr].at(-1)!)} a month but adds{" "}
                {gbp(p.grid[hr].at(-1)! * GRID_YEARS.at(-1)! * 12 - p.totalRepaid)} of interest over the life of the loan.
              </li>
              <li>
                An interest-only mortgage pays no capital back: after the term you still owe the full {gbp(amount)}.
              </li>
            </ul>
          </section>

          <section className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
              <h2 className="text-white font-bold mb-3">What you&apos;d still owe</h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                At {headline}, after a 2-year fix you would still owe <strong className="text-white">{gbp(p.balanceAfter2)}</strong>, and
                after a 5-year fix <strong className="text-white">{gbp(p.balanceAfter5)}</strong>. That balance is what you remortgage
                when the deal ends.
              </p>
            </div>
            <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
              <h2 className="text-white font-bold mb-3">Overpaying</h2>
              <ul className="text-sm text-gray-300 leading-relaxed space-y-2">
                {p.overpaying.map((o) => (
                  <li key={o.extra}>
                    <strong className="text-white">£{o.extra} a month</strong> extra clears it {yearsMonths(o.monthsSaved)} sooner and
                    saves {gbp(o.interestSaved)} of interest.
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 mt-3">
                Many fixed deals allow up to 10% of the balance a year without a charge; check yours.
              </p>
            </div>
          </section>

          <div className="bg-[#0d1426] border border-blue-500/40 rounded-xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-white font-bold mb-1">Your own rate and term</h2>
              <p className="text-sm text-gray-400">
                The full schedule, overpayments and lump sums by month, and investing instead of overpaying.
              </p>
            </div>
            <Link href={calculatorHref} className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition">
              Open the calculator with {gbp(amount)} →
            </Link>
          </div>

          <section className="mb-6">
            <h2 className="text-white font-bold mb-3">Questions</h2>
            <div className="space-y-3">
              {faq.map((f) => (
                <div key={f.q} className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                  <h3 className="text-white font-semibold text-sm mb-1">{f.q}</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          <nav aria-label="Other mortgage amounts" className="mb-6">
            <h2 className="text-white font-bold mb-3">Other mortgage amounts</h2>
            <div className="flex flex-wrap gap-2">
              {p.nearby.map((a) => (
                <Link key={a} href={mortgagePath(a)} className="text-sm bg-[#111827] border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 rounded-lg px-3 py-1.5 transition">
                  {gbp(a)}
                </Link>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-sm">
              {p.prev ? <Link href={mortgagePath(p.prev)} className="text-blue-400 hover:text-blue-300">← {gbp(p.prev)} mortgage</Link> : <span />}
              {p.next ? <Link href={mortgagePath(p.next)} className="text-blue-400 hover:text-blue-300">{gbp(p.next)} mortgage →</Link> : <span />}
            </div>
          </nav>

          <p className="text-xs text-gray-500 leading-relaxed">
            Monthly payments on a capital-and-interest (repayment) mortgage at a fixed rate for the whole term, paid monthly.
            Rates are examples, not offers. Not included: arrangement and other fees, insurance, and rate changes when a deal
            ends. For planning only; a mortgage adviser or lender can tell you what you could actually borrow.
          </p>
        </div>
      </div>

      <RelatedTools current="lending" />
    </main>
  );
}
