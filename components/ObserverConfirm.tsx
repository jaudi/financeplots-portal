"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { trackEvent } from "@/lib/analytics";
import ObserverSignup from "@/components/ObserverSignup";

type Status = "idle" | "loading" | "ok" | "expired" | "invalid" | "error";

/** Step 2 of the double opt-in: a button, not the link itself, confirms — mail
 *  scanners open every link in an email, and would otherwise subscribe people. */
export default function ObserverConfirm({ e, x, t: token }: { e?: string; x?: string; t?: string }) {
  const t = useTranslations("observerSignup");
  const complete = Boolean(e && x && token);
  const [status, setStatus] = useState<Status>(complete ? "idle" : "invalid");

  async function confirm() {
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ e, x, t: token }),
      });
      const data = (await res.json().catch(() => ({}))) as { status?: Status };
      const next = data.status && ["ok", "expired", "invalid"].includes(data.status) ? data.status : "error";
      setStatus(next);
      if (next === "ok") trackEvent("email_confirm");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">The Observer</p>
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">{t("confirmTitle")}</h1>

      {(status === "idle" || status === "loading") && (
        <>
          <p className="text-gray-400 leading-relaxed mb-6">{t("confirmIntro")}</p>
          <button
            type="button"
            onClick={confirm}
            disabled={status === "loading"}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition text-sm"
          >
            {status === "loading" ? t("confirming") : t("confirmCta")}
          </button>
        </>
      )}

      {status === "ok" && (
        <div role="status">
          <p className="text-blue-200 font-semibold bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-3 mb-6">{t("confirmed")}</p>
          <Link href="/observer" className="text-blue-400 hover:text-blue-300 text-sm font-semibold">
            {t("back")}
          </Link>
        </div>
      )}

      {status === "error" && (
        <>
          <p role="alert" className="text-red-400 mb-6">{t("failed")}</p>
          <button
            type="button"
            onClick={confirm}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition text-sm"
          >
            {t("confirmCta")}
          </button>
        </>
      )}

      {(status === "expired" || status === "invalid") && (
        <>
          <p role="alert" className="text-gray-300 mb-8">{t(status)}</p>
          <ObserverSignup />
        </>
      )}
    </div>
  );
}
