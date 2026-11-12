import type { Metadata } from "next";
import QuizClient from "./QuizClient";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Finance Quiz — Test Your Knowledge",
  description:
    "10 finance questions covering WACC, break-even, EBITDA, compound interest, DCF and more. Test your knowledge and learn from the explanations.",
  path: "/quiz",
});

export default function QuizPage() {
  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-24 px-6">
      <div className="max-w-2xl mx-auto">
        <p className="text-blue-400 text-xs font-bold uppercase tracking-widest text-center mb-3">
          Test Your Knowledge
        </p>
        <h1 className="text-4xl font-extrabold text-center mb-2">Finance Quiz</h1>
        <p className="text-gray-400 text-center text-sm mb-12">
          10 questions · WACC, EBITDA, DCF, break-even, compound interest and more
        </p>
        <QuizClient />
      </div>
    </main>
  );
}
