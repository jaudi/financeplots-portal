import type { ReactNode } from "react";
import { messagesMetadata } from "@/lib/page-metadata";

// The page is a client component, so its metadata lives here.
export const generateMetadata = messagesMetadata("pitch-deck", "/tools/pitch-deck");

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
