import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import TakeHomePay from "@/components/TakeHomePay";
import RelatedTools from "@/components/RelatedTools";
import { TAX_YEAR } from "@/lib/calculators";

export const metadata: Metadata = {
  title: `UK Take-Home Pay Calculator ${TAX_YEAR} — Salary After Tax, NI, Pension & Student Loan`,
  description:
    "What you really take home from a UK salary: income tax (including Scotland), National Insurance, pension and student loan, monthly and yearly. Or work backwards from the take-home you want. Free, no signup.",
  alternates: { canonical: "https://www.financeplots.com/tools/take-home-pay" },
};

type Props = { searchParams: Promise<{ salary?: string; target?: string }> };

const amount = (s: string | undefined, max: number) => {
  const n = Number(s);
  return s !== undefined && Number.isFinite(n) && n > 0 && n <= max ? n : null;
};

export default async function TakeHomePayPage({ searchParams }: Props) {
  const { salary, target } = await searchParams;
  // ?salary= / ?target= come from shared links and the MCP tool's tool_page.
  const initialSalary = amount(salary, 10_000_000);
  const initialTarget = amount(target, 500_000);
  // English on every locale: the tool is about UK tax.
  const tc = await getTranslations({ locale: "en", namespace: "toolCommon" });

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "UK Take-Home Pay Calculator",
            description:
              "UK salary after income tax, National Insurance, pension and student loan, or the salary needed for a take-home target.",
            url: "https://www.financeplots.com/tools/take-home-pay",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
            provider: { "@type": "Organization", name: "FinancePlots", url: "https://www.financeplots.com" },
          }),
        }}
      />

      <div className="pt-[100px] pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Link href="/tools/personal" className="text-gray-400 hover:text-white text-sm transition">{tc("backPersonal")}</Link>
          <div className="text-center mt-4 mb-10">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">Take-Home Pay · {TAX_YEAR}</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">What does your salary really pay you?</h1>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">
              Income tax, National Insurance, pension and student loan, taken off a UK salary. Or start from the
              monthly amount you need and see the salary that pays it.
            </p>
          </div>
          <TakeHomePay initialSalary={initialSalary} initialTarget={initialTarget} />
        </div>
      </div>

      <RelatedTools current="take-home-pay" />
      <p className="text-center text-xs text-gray-600 pb-8 px-4">{tc("disclaimer")}</p>
    </main>
  );
}
