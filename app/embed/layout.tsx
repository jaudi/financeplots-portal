import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "../globals.css";

// Layout for embedded cards (/embed/...): shown inside other people's pages,
// so no navbar, no Vercel Analytics (iframe views would inflate visitor
// numbers — clicks out carry utm_source=embed instead) and never indexed:
// the full pages are what search should find.

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.financeplots.com"),
  robots: { index: false, follow: true },
};

export default function EmbedLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0a0f1e]`}>{children}</body>
    </html>
  );
}
