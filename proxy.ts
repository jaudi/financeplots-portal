import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // The first pattern skips anything with a dot (files). Company pages are the
  // exception: tickers like SAN.MC and BRK.B contain one. /embed is skipped too:
  // embedded cards live outside [locale] and must never be redirected by a
  // visitor's language cookie inside someone else's page.
  matcher: ["/((?!api|embed|_next|_vercel|.*\\..*).*)", "/tools/stocks/:ticker", "/es/tools/stocks/:ticker"],
};
