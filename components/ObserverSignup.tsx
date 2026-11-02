"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";

/** "Get The Observer by email" — step 1 of the double opt-in (see lib/newsletter.ts). */
export default function ObserverSignup({ className = "", id }: { className?: string; id?: string }) {
  const t = useTranslations("observerSignup");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale, website }),
      });
      if (res.ok) {
        setStatus("sent");
        trackEvent("email_signup");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id={id} className={`scroll-mt-28 bg-[#0d1426] border border-blue-700/30 rounded-2xl p-6 md:p-8 ${className}`}>
      <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">{t("label")}</p>
      <h2 className="text-2xl font-extrabold mb-2">{t("title")}</h2>
      <p className="text-gray-400 text-sm leading-relaxed mb-5 max-w-2xl">{t("intro")}</p>

      {status === "sent" ? (
        <p role="status" className="text-blue-200 text-sm font-semibold bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-3">
          {t("sent")}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <label className="sr-only" htmlFor="observer-signup-email">
            {t("placeholder")}
          </label>
          <input
            id="observer-signup-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("placeholder")}
            className="flex-1 min-w-0 bg-[#111827] border border-gray-700 focus:border-blue-500 text-white text-sm px-4 py-3 rounded-xl outline-none transition placeholder-gray-600"
          />
          {/* Hidden from people and screen readers; bots fill it in. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="hidden"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition text-sm shrink-0"
          >
            {status === "loading" ? t("loading") : t("cta")}
          </button>
        </form>
      )}
      {status === "error" && (
        <p role="alert" className="text-red-400 text-xs mt-3">
          {t("error")}
        </p>
      )}
      <p className="text-gray-600 text-xs leading-relaxed mt-4 max-w-2xl">{t("privacy")}</p>
    </section>
  );
}
