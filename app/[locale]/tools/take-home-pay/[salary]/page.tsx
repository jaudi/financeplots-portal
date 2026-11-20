import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import RelatedTools from "@/components/RelatedTools";
import { TAX_YEAR } from "@/lib/calculators";
import { BASE, pageMetadata } from "@/lib/page-metadata";
import { gbp, HOURS_PER_WEEK, parseSalarySlug, perHundred, SALARY_PAGES, salaryPage, salaryPath, salarySlug } from "@/lib/salary-pages";
import PerHundredGrid, { PerHundredLegend } from "@/components/PerHundredGrid";
import EmbedCode from "@/components/EmbedCode";
import { embedSnippet, salaryEmbed } from "@/lib/embeds";

// One static page per salary in SALARY_PAGES ("/tools/take-home-pay/45000-after-tax").
// English on every locale, like the calculator: the subject is UK tax. The /es
// copy exists so the language switch doesn't 404, and its canonical is English.

type Props = { params: Promise<{ locale: string; salary: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return SALARY_PAGES.flatMap((s) => [
    { locale: "en", salary: salarySlug(s) },
    { locale: "es", salary: salarySlug(s) },
  ]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { salary: slug } = await params;
  const salary = parseSalarySlug(slug);
  if (salary === null) return {};
  const p = salaryPage(salary);
  return pageMetadata({
    title: `${gbp(salary)} After Tax UK ${TAX_YEAR}: ${gbp(p.monthly)} a Month Take-Home`,
    description: `On a ${gbp(salary)} salary you take home ${gbp(p.base.takeHome)} a year, ${gbp(p.monthly)} a month, after ${gbp(p.base.incomeTax)} income tax and ${gbp(p.base.nationalInsurance)} National Insurance (${TAX_YEAR}). With Scotland, pension and student loan figures.`,
    path: salaryPath(salary),
    image: { url: `/api/share-image/salary/${salary}`, alt: `${gbp(salary)} after tax: ${gbp(p.monthly)} a month, and what is kept of every £100` },
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

const signed = (n: number) => (Math.round(n) === 0 ? "—" : `${n > 0 ? "▲ +" : "▼ −"}${gbp(Math.abs(n))}`);

export default async function SalaryAfterTaxPage({ params }: Props) {
  const { salary: slug } = await params;
  const salary = parseSalarySlug(slug);
  if (salary === null) notFound();
  const p = salaryPage(salary);
  const r = p.base;
  const standard = p.scenarios[0].result;
  const scotland = p.scenarios.find((s) => s.key === "scotland")!.result;
  const scotDiff = (scotland.takeHome - standard.takeHome) / 12;
  const url = `${BASE}${salaryPath(salary)}`;
  const h = perHundred(r); // the "of every £100" grid
  const embed = salaryEmbed(salary);

  const faq = [
    {
      q: `How much is ${gbp(salary)} after tax in the UK?`,
      a: `${gbp(r.takeHome)} a year, or ${gbp(p.monthly)} a month, in England, Wales or Northern Ireland in ${TAX_YEAR}, with no pension or student loan. Income tax is ${gbp(r.incomeTax)} and National Insurance ${gbp(r.nationalInsurance, 2)}.`,
    },
    {
      q: `How much is ${gbp(salary)} after tax in Scotland?`,
      a: `${gbp(scotland.takeHome / 12)} a month (${gbp(scotland.takeHome)} a year), because Scotland sets its own income tax bands.`,
    },
    {
      q: `How much of a £1,000 pay rise would I keep on ${gbp(salary)}?`,
      a: `${gbp(p.keepOfRaise)} a year, about ${gbp(p.keepOfRaise / 12)} a month, before any pension or student loan.`,
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
          <Link href="/tools/take-home-pay" className="text-gray-400 hover:text-white text-sm transition">← Take-Home Pay Calculator</Link>

          <div className="text-center mt-4 mb-10">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">Salary after tax · {TAX_YEAR}</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">{gbp(salary)} after tax</h1>
            <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">
              On a {gbp(salary)} salary you take home <strong className="text-white">{gbp(r.takeHome)} a year</strong>, or{" "}
              <strong className="text-white">{gbp(p.monthly)} a month</strong>, in England, Wales or Northern Ireland.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <Kpi label="Per month" value={gbp(p.monthly)} sub={`${gbp(salary / 12)} before deductions`} />
            <Kpi label="Per week" value={gbp(p.weekly)} sub="take-home ÷ 52" />
            <Kpi label="Per hour" value={gbp(p.hourly, 2)} sub={`at ${HOURS_PER_WEEK} hours a week`} />
            <Kpi label="Effective rate" value={`${r.effectiveRatePct.toFixed(1)}%`} sub="of salary to tax and NI" />
          </div>

          <section className="bg-[#0d1426] border border-gray-800 rounded-xl p-6 mb-6 flex flex-col sm:flex-row gap-6 sm:items-center">
            <PerHundredGrid h={h} className="w-full max-w-[260px] shrink-0 mx-auto sm:mx-0" />
            <div>
              <h2 className="text-white font-bold text-lg mb-3">Of every £100 you earn</h2>
              <PerHundredLegend h={h} />
              <p className="text-xs text-gray-500 mt-3">Each square is £1 of every £100 of salary, with no pension or student loan.</p>
            </div>
          </section>

          <section className="bg-[#0d1426] border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-white font-bold mb-4">Where the {gbp(salary)} goes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    {["", "Per year", "Per month"].map((h) => (
                      <th key={h} className="text-left text-xs text-gray-400 uppercase tracking-wider py-2 pr-4 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Gross salary", y: r.grossSalary },
                    { label: "Income tax", y: -r.incomeTax },
                    { label: "National Insurance", y: -r.nationalInsurance },
                  ].map((row) => (
                    <tr key={row.label} className="border-b border-gray-800 text-gray-300">
                      <td className="py-2 pr-4">{row.label}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{row.y < 0 ? "−" : ""}{gbp(Math.abs(row.y))}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{row.y < 0 ? "−" : ""}{gbp(Math.abs(row.y) / 12)}</td>
                    </tr>
                  ))}
                  <tr className="text-white font-bold">
                    <td className="py-2 pr-4">Take-home</td>
                    <td className="py-2 pr-4">{gbp(r.takeHome)}</td>
                    <td className="py-2 pr-4">{gbp(p.monthly)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-300 leading-relaxed list-disc pl-5">
              {p.notes.map((n) => <li key={n}>{n}</li>)}
              <li>
                A £1,000 pay rise would add {gbp(p.keepOfRaise)} a year to your take-home ({gbp(p.keepOfRaise / 12)} a month): you keep{" "}
                {Math.round(p.keepOfRaise / 10)}p of every £1.
              </li>
              <li>
                In Scotland the same salary takes home {gbp(Math.abs(scotDiff))} a month {scotDiff < 0 ? "less" : "more"}
                {Math.round(scotDiff) === 0 ? " (about the same)" : ""}.
              </li>
            </ul>
          </section>

          <section className="bg-[#0d1426] border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-white font-bold mb-1">{gbp(salary)} in other situations</h2>
            <p className="text-xs text-gray-500 mb-4">Take-home pay. The difference is per month, against the first row.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    {["", "Per month", "Per year", "Difference"].map((h) => (
                      <th key={h} className="text-left text-xs text-gray-400 uppercase tracking-wider py-2 pr-4 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {p.scenarios.map((s, i) => (
                    <tr key={s.key} className={`border-b border-gray-800 ${i === 0 ? "text-white font-semibold" : "text-gray-300"}`}>
                      <td className="py-2 pr-4">{s.label}</td>
                      <td className="py-2 pr-4">{gbp(s.result.takeHome / 12)}</td>
                      <td className="py-2 pr-4">{gbp(s.result.takeHome)}</td>
                      <td className="py-2 pr-4 text-gray-400 whitespace-nowrap">{i === 0 ? "" : signed((s.result.takeHome - standard.takeHome) / 12)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              The pension rows take 5% of salary through a net pay scheme. That money is still yours, in the pension pot: it
              leaves your pay but isn&apos;t lost the way tax is.
            </p>
          </section>

          <div className="bg-[#0d1426] border border-blue-500/40 rounded-xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-white font-bold mb-1">Your own payslip</h2>
              <p className="text-sm text-gray-400">
                Salary sacrifice, other pension rates, Plan 1 or 4 loans, a postgraduate loan, or work backwards from a take-home target.
              </p>
            </div>
            <Link
              href={`/tools/take-home-pay?salary=${salary}`}
              className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition"
            >
              Open the calculator with {gbp(salary)} →
            </Link>
          </div>

          <EmbedCode src={embed.src} snippet={embedSnippet(embed)} height={embed.height} />

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

          <nav aria-label="Other salaries" className="mb-6">
            <h2 className="text-white font-bold mb-3">Other salaries after tax</h2>
            <div className="flex flex-wrap gap-2">
              {p.nearby.map((s) => (
                <Link key={s} href={salaryPath(s)} className="text-sm bg-[#111827] border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 rounded-lg px-3 py-1.5 transition">
                  {gbp(s)}
                </Link>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-sm">
              {p.prev ? <Link href={salaryPath(p.prev)} className="text-blue-400 hover:text-blue-300">← {gbp(p.prev)} after tax</Link> : <span />}
              {p.next ? <Link href={salaryPath(p.next)} className="text-blue-400 hover:text-blue-300">{gbp(p.next)} after tax →</Link> : <span />}
            </div>
          </nav>

          <p className="text-xs text-gray-500 leading-relaxed">
            Tax year {TAX_YEAR}, rates from GOV.UK. Assumes an employee on the standard tax code (1257L) with one job.
            Monthly is yearly ÷ 12, so a real payslip can differ by a few pounds. Not included: other tax codes, benefits in
            kind, bonuses, and pension relief claimed through self-assessment.
          </p>
        </div>
      </div>

      <RelatedTools current="take-home-pay" />
    </main>
  );
}
