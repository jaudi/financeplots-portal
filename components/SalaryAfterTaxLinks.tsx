import Link from "next/link";
import { TAX_YEAR } from "@/lib/calculators";
import { gbp, SALARY_PAGES, salaryPath } from "@/lib/salary-pages";

// Every "£X after tax" page, linked from the calculator: how crawlers (and
// people) reach them. Server component, plain links.

const GROUPS: { label: string; from: number; to: number }[] = [
  { label: "£15,000 to £40,000", from: 15_000, to: 40_000 },
  { label: "£41,000 to £70,000", from: 41_000, to: 70_000 },
  { label: "£71,000 to £200,000", from: 71_000, to: 200_000 },
];

export default function SalaryAfterTaxLinks() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
      <h2 className="text-white font-bold text-xl mb-1">Salary after tax, salary by salary</h2>
      <p className="text-sm text-gray-400 mb-5">
        Take-home pay for each salary in {TAX_YEAR}, with Scotland, a pension and student loans side by side.
      </p>
      <div className="grid md:grid-cols-3 gap-6">
        {GROUPS.map((g) => (
          <div key={g.label}>
            <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">{g.label}</h3>
            <div className="flex flex-wrap gap-1.5">
              {SALARY_PAGES.filter((s) => s >= g.from && s <= g.to).map((s) => (
                <Link
                  key={s}
                  href={salaryPath(s)}
                  className="text-xs bg-[#111827] border border-gray-800 text-gray-300 hover:text-white hover:border-gray-500 rounded-md px-2 py-1 transition"
                >
                  {gbp(s / 1000)}k
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
