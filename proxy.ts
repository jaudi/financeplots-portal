import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // The first pattern skips anything with a dot (files). Company pages are the
  // exception: tickers like SAN.MC and BRK.B contain one.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)", "/tools/stocks/:ticker", "/es/tools/stocks/:ticker"],
};
