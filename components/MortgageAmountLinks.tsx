import Link from "next/link";
import { HEADLINE_RATE_PCT, HEADLINE_YEARS, MORTGAGE_PAGES, mortgagePath } from "@/lib/mortgage-pages";

// Every "£200,000 mortgage" page, linked from the Lending Calculator: how
// crawlers (and people) reach them. No hooks, so a client page can render it.

const GROUPS: { label: string; from: number; to: number }[] = [
  { label: "£50,000 to £200,000", from: 50_000, to: 200_000 },
  { label: "£205,000 to £350,000", from: 205_000, to: 350_000 },
  { label: "£355,000 to £1,000,000", from: 355_000, to: 1_000_000 },
];

const short = (a: number) => (a >= 1_000_000 ? "£1m" : `£${a / 1000}k`);

export default function MortgageAmountLinks() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
      <h2 className="text-white font-bold text-xl mb-1">Mortgage payments, amount by amount</h2>
      <p className="text-sm text-gray-400 mb-5">
        Monthly payments for each amount at rates from 3.5% to 6% and terms of 15 to 35 years (example: {HEADLINE_RATE_PCT}% over{" "}
        {HEADLINE_YEARS} years), in pounds.
      </p>
      <div className="grid md:grid-cols-3 gap-6">
        {GROUPS.map((g) => (
          <div key={g.label}>
            <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">{g.label}</h3>
            <div className="flex flex-wrap gap-1.5">
              {MORTGAGE_PAGES.filter((a) => a >= g.from && a <= g.to).map((a) => (
                <Link
                  key={a}
                  href={mortgagePath(a)}
                  className="text-xs bg-[#111827] border border-gray-800 text-gray-300 hover:text-white hover:border-gray-500 rounded-md px-2 py-1 transition"
                >
                  {short(a)}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
