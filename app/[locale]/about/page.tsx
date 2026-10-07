import type { Metadata } from "next";
import Link from "next/link";
import ContactLink from "@/components/ContactLink";

export const metadata: Metadata = {
  title: "About — Javier Audibert | FinancePlots",
  description:
    "Javier Audibert, ACCA — 20+ years in finance across biotech, higher education and financial services. The person behind FinancePlots.",
  alternates: { canonical: "https://www.financeplots.com/about" },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="relative px-6 pt-36 pb-24 overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-100 border border-blue-200 rounded-full px-4 py-1.5 mb-6">
            About
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.1] mb-8 tracking-tight text-gray-900">
            Javier <span className="text-blue-600">Audibert</span>
          </h1>

          <p className="text-gray-700 text-lg leading-relaxed text-left md:text-center">
            I&apos;m a senior finance professional and <strong>ACCA member</strong> with <strong>20+ years</strong> of experience across biotech, higher education and financial services. I&apos;m triple-qualified (ACCA, CFA UK IMC, EFPA EFA), hold a Masters in Corporate Finance &amp; Law from ESADE and a Law degree from Universidad Complutense de Madrid.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <ContactLink className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition shadow-lg shadow-blue-600/20">
              Get in touch
            </ContactLink>
            <Link
              href="/tools"
              className="border border-gray-300 hover:border-gray-500 text-gray-700 hover:text-gray-900 font-semibold px-8 py-3 rounded-xl transition bg-white"
            >
              Explore the tools →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
