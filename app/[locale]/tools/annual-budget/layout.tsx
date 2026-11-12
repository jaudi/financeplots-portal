import type { ReactNode } from "react";
import { messagesMetadata } from "@/lib/page-metadata";

// The page is a client component, so its metadata lives here.
export const generateMetadata = messagesMetadata("annual-budget", "/tools/annual-budget");

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
