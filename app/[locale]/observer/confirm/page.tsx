import type { Metadata } from "next";
import ObserverConfirm from "@/components/ObserverConfirm";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// Reached only from a confirmation email: never indexed, never in the sitemap.
export const metadata: Metadata = {
  title: "Confirm your subscription — The Observer",
  robots: { index: false, follow: false },
};

const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

export default async function ObserverConfirmPage({ searchParams }: Props) {
  const sp = await searchParams;
  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <ObserverConfirm e={one(sp.e)} x={one(sp.x)} t={one(sp.t)} />
    </main>
  );
}
