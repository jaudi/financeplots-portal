import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { pageMetadata } from "@/lib/page-metadata";
import en from "@/messages/en.json";
import es from "@/messages/es.json";

const APP = path.join(__dirname, "..", "app", "[locale]");

function pages(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? pages(p) : e.name === "page.tsx" ? [p] : [];
  });
}

describe("pageMetadata", () => {
  it("gives a localized page its own canonical, languages and both share cards", () => {
    const m = pageMetadata({ title: "T", description: "D", path: "/tools/lending", locale: "es", localized: true });
    expect(m.alternates).toEqual({
      canonical: "https://www.financeplots.com/es/tools/lending",
      languages: { en: "https://www.financeplots.com/tools/lending", es: "https://www.financeplots.com/es/tools/lending" },
    });
    expect(m.openGraph).toMatchObject({ title: "T", description: "D", url: "https://www.financeplots.com/es/tools/lending" });
    expect((m.openGraph as { images: unknown[] }).images).toHaveLength(1);
    expect(m.twitter).toMatchObject({ card: "summary_large_image", title: "T", description: "D" });
  });

  it("points English-only pages at the English URL and leaves noindex pages without a canonical", () => {
    expect(pageMetadata({ title: "T", description: "D", path: "/about", locale: "es" }).alternates).toEqual({
      canonical: "https://www.financeplots.com/about",
    });
    expect(pageMetadata({ title: "T", description: "D", path: "/x", canonical: false }).alternates).toBeUndefined();
  });

  it("has every pageMeta entry in both languages", () => {
    expect(Object.keys(es.pageMeta).sort()).toEqual(Object.keys(en.pageMeta).sort());
  });

  // A page without its own metadata inherits the root layout's: the site's
  // generic title on X and, before 2026-11-12, the homepage's canonical URL.
  it("every page builds its metadata through the helper (blog posts and Observer editions set their own)", () => {
    const missing = pages(APP).filter((p) => {
      const rel = path.relative(APP, p).replace(/\\/g, "/");
      if (/^(blog\/[^/]+|observer\/\[slug\])\/page\.tsx$/.test(rel)) return !/twitter:/.test(fs.readFileSync(p, "utf8"));
      const dir = path.dirname(p);
      const src = [p, path.join(dir, "layout.tsx")].filter((f) => fs.existsSync(f)).map((f) => fs.readFileSync(f, "utf8")).join("\n");
      return !/pageMetadata|messagesMetadata|audienceMetadata|robots: \{ index: false/.test(src);
    });
    expect(missing.map((p) => path.relative(APP, p))).toEqual([]);
  });
});
