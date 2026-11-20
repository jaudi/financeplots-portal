import { parseMortgageSlug } from "@/lib/mortgage-pages";
import { parseSalarySlug } from "@/lib/salary-pages";
import { mortgageShareImage, salaryShareImage } from "@/lib/share-image";

// Share cards for the salary and mortgage pages: /api/share-image/salary/45000,
// /api/share-image/mortgage/200000. Each page names its own card in its
// metadata (pageMetadata's `image`). Only amounts that have a page are drawn.
// The figures change once a tax year, so the CDN keeps a card for a week.

const CACHE = "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400";

export async function GET(_req: Request, { params }: { params: Promise<{ kind: string; value: string }> }) {
  const { kind, value } = await params;
  let res: Response | null = null;
  if (kind === "salary") {
    const salary = parseSalarySlug(`${value}-after-tax`);
    if (salary !== null) res = salaryShareImage(salary);
  } else if (kind === "mortgage") {
    const amount = parseMortgageSlug(`${value}-mortgage`);
    if (amount !== null) res = mortgageShareImage(amount);
  }
  if (!res) return new Response("Not found", { status: 404 });
  res.headers.set("Cache-Control", CACHE);
  return res;
}
