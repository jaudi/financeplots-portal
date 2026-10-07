"use client";

import type { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

/** The contact email link, counted (no address or text is sent with the event). */
export default function ContactLink({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <a href="mailto:hello@financeplots.com" onClick={() => trackEvent("contact_click")} className={className}>
      {children}
    </a>
  );
}
