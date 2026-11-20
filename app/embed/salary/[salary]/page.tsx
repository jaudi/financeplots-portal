import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PerHundredGrid, { PerHundredLegend } from "@/components/PerHundredGrid";
import EmbedFooter from "@/components/EmbedFooter";
import { TAX_YEAR } from "@/lib/calculators";
import { salaryEmbed, withUtm } from "@/lib/embeds";
import { gbp, parseSalarySlug, perHundred, SALARY_PAGES, salaryPage } from "@/lib/salary-pages";

// The embeddable card for one salary page: /embed/salary/45000.

type Props = { params: Promise<{ salary: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => SALARY_PAGES.map((s) => ({ salary: String(s) }));

const parse = (v: string) => parseSalarySlug(`${v}-after-tax`);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const salary = parse((await params).salary);
  if (salary === null) return {};
  const e = salaryEmbed(salary);
  return { title: `${e.title} — FinancePlots`, alternates: { canonical: e.pageUrl } };
}

export default async function SalaryEmbed({ params }: Props) {
  const salary = parse((await params).salary);
  if (salary === null) notFound();
  const p = salaryPage(salary);
  const h = perHundred(p.base);
  const e = salaryEmbed(salary);
  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white p-4 sm:p-5 flex flex-col">
      <p className="text-xs text-gray-400">{gbp(salary)} salary · UK take-home pay {TAX_YEAR}</p>
      <p className="mt-1 text-3xl sm:text-4xl font-extrabold leading-tight">
        {gbp(p.monthly)} <span className="text-base sm:text-lg text-gray-400 font-semibold">a month</span>
      </p>
      <p className="text-sm text-gray-400">{gbp(p.base.takeHome)} a year after income tax and National Insurance</p>
      <div className="mt-4 flex items-center gap-4 sm:gap-6">
        <PerHundredGrid h={h} className="w-[112px] sm:w-[150px] shrink-0" />
        <div className="min-w-0">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Of every £100 you earn</p>
          <PerHundredLegend h={h} big={false} />
        </div>
      </div>
      <EmbedFooter href={withUtm(e.pageUrl)} label="Scotland, pension and student loans →" short="Full breakdown →" />
    </main>
  );
}
