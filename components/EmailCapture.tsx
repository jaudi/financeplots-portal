"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";

export default function EmailCapture() {
  const t = useTranslations("emailCapture");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        trackEvent("email_signup");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-3 px-6 bg-green-900/20 border border-green-700/40 rounded-xl">
        <p className="text-green-400 font-semibold text-sm">{t("successMsg")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder={t("placeholder")}
        className="flex-1 bg-[#111827] border border-gray-700 focus:border-blue-500 text-white text-sm px-4 py-3 rounded-xl outline-none transition placeholder-gray-600"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition text-sm shrink-0"
      >
        {status === "loading" ? t("loading") : t("cta")}
      </button>
      {status === "error" && (
        <p className="text-red-400 text-xs text-center w-full">{t("errorMsg")}</p>
      )}
    </form>
  );
}
