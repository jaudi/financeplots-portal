import Link from "next/link";
import type { Metadata } from "next";
import ShareButtons from "@/components/ShareButtons";
import BlogArticleShell from "@/components/BlogArticleShell";

export const metadata: Metadata = {
  title: "Bootstrapping & Runway: How to Extend Your Startup's Life Without Giving Up Equity | FinancePlots",
  description: "How founders can think rigorously about burn rate, runway and capital efficiency — before the pressure is on.",
  openGraph: {
    title: "Bootstrapping & Runway: How to Extend Your Startup's Life Without Giving Up Equity",
    description: "How founders can think rigorously about burn rate, runway and capital efficiency — before the pressure is on.",
    url: "https://www.financeplots.com/blog/bootstrapping-runway",
    siteName: "FinancePlots",
    type: "article",
    images: [{ url: "https://www.financeplots.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bootstrapping & Runway: How to Extend Your Startup's Life Without Giving Up Equity",
    description: "How founders can think rigorously about burn rate, runway and capital efficiency — before the pressure is on.",
    images: ["https://www.financeplots.com/og-image.png"],
  },
  alternates: {
    canonical: "https://www.financeplots.com/blog/bootstrapping-runway",
  },
};

type Props = { params: Promise<{ locale: string }> };

export default async function ArticleBootstrappingRunway({ params }: Props) {
  const { locale } = await params;
  const es = locale === "es";

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: "{\"@context\":\"https://schema.org\",\"@type\":\"Article\",\"headline\":\"Bootstrapping & Runway: How to Extend Your Startup's Life Without Giving Up Equity\",\"description\":\"How founders can think rigorously about burn rate, runway and capital efficiency — before the pressure is on.\",\"url\":\"https://www.financeplots.com/blog/bootstrapping-runway\",\"image\":\"https://www.financeplots.com/og-image.png\",\"author\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\"},\"publisher\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\",\"logo\":{\"@type\":\"ImageObject\",\"url\":\"https://www.financeplots.com/logo-sm.png\"}},\"mainEntityOfPage\":{\"@type\":\"WebPage\",\"@id\":\"https://www.financeplots.com/blog/bootstrapping-runway\"}}" }} />
      <BlogArticleShell>

        <Link href="/blog" className="text-blue-400 text-sm hover:text-blue-300 transition mb-8 inline-block">
          {es ? "← Volver al Blog" : "← Back to Blog"}
        </Link>

        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
          {es ? "Finanzas para Startups" : "Startup Finance"}
        </span>
        <h1 className="text-4xl font-bold mt-2 mb-3 leading-tight">
          {es
            ? "Bootstrapping y Runway: Cómo Extender la Vida de tu Startup sin Ceder Capital"
            : "Bootstrapping & Runway: How to Extend Your Startup\u2019s Life Without Giving Up Equity"}
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          {es ? "Marzo 2026 · 7 min de lectura" : "March 2026 · 7 min read"}
        </p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">

          <p>
            {es
              ? "Cada mes de runway es un mes de opcionalidad. Es un mes para encontrar el product-market fit, cerrar ese primer cliente enterprise, demostrar la economía unitaria o captar inversión desde una posición de fortaleza en lugar de desesperación."
              : "Every month of runway is a month of optionality. It is a month to find product-market fit, to close that first enterprise customer, to prove the unit economics, to raise from a position of strength rather than desperation."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Los Fundamentos: Tasa de Quema y Runway" : "The Fundamentals: Burn Rate and Runway"}
          </h2>
          <p>
            {es
              ? <><strong className="text-white">La tasa de quema</strong> es el efectivo neto que consume tu empresa cada mes. Existen dos versiones:</>
              : <><strong className="text-white">Burn rate</strong> is the net cash your business consumes each month. There are two versions:</>}
          </p>
          <ul className="space-y-2 list-none pl-0">
            {es
              ? [
                  "Quema bruta: total de salidas de caja mensuales (salarios, software, alquiler, marketing)",
                  "Quema neta: quema bruta menos ingresos mensuales",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))
              : [
                  "Gross burn: total monthly cash outflows (salaries, software, rent, marketing)",
                  "Net burn: gross burn minus monthly revenue",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))}
          </ul>
          <p>
            {es
              ? "La quema neta es lo que importa. Una empresa con 60.000 £ en costes mensuales y 20.000 £ en ingresos tiene una quema neta de 40.000 £/mes."
              : "Net burn is what matters. A business with £60,000 in monthly costs and £20,000 in revenue has a net burn of £40,000/month."}
          </p>
          <div className="bg-[#0d1426] border border-gray-700 rounded-lg p-4 font-mono text-sm text-blue-300">
            {es
              ? "Runway (meses) = Efectivo en banco ÷ Quema neta mensual"
              : "Runway (months) = Cash in bank ÷ Monthly net burn"}
          </div>
          <p>
            {es
              ? <>Si tienes 400.000 £ en el banco y una quema neta de 40.000 £/mes, tienes 10 meses de runway. Captar financiación lleva entre 3 y 6 meses. Debes iniciar el proceso con al menos 6 meses restantes, idealmente 9. <strong className="text-white">Objetivo de runway: mantener siempre entre 12 y 18 meses.</strong></>
              : <>If you have £400,000 in the bank and net burn of £40,000/month, you have 10 months of runway. Fundraising takes 3–6 months. You need to start the process with at least 6 months remaining, ideally 9. <strong className="text-white">Target runway: always maintain 12–18 months.</strong></>}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "La Mentalidad Bootstrapper" : "The Bootstrapping Mindset"}
          </h2>
          <p>
            {es
              ? "Hacer bootstrapping no significa ser tacaño. Significa ser eficiente en el uso del capital: maximizar el valor generado por cada libra gastada."
              : "Bootstrapping does not mean being cheap. It means being capital-efficient — maximising value generated per pound spent."}
          </p>

          <h3 className="text-lg font-semibold text-white">
            {es ? "1. Ingresos antes que personal" : "1. Revenue before headcount"}
          </h3>
          <p>
            {es
              ? "Contrata cuando los ingresos lo justifiquen, no cuando parezca el momento adecuado. Cada contratación debe tener una justificación clara en términos de ingresos o costes. «Necesitamos un VP de X» no es un argumento financiero."
              : "Hire when revenue justifies it, not when it feels right. Every hire should come with a clear revenue or cost justification. \"We need a VP of X\" is not a financial argument."}
          </p>

          <h3 className="text-lg font-semibold text-white">
            {es ? "2. Los costes fijos son el enemigo" : "2. Fixed costs are the enemy"}
          </h3>
          <p>
            {es
              ? "Los costes fijos consumen al mismo ritmo independientemente del rendimiento. Convierte el mayor número posible de costes en variables: autónomos en lugar de empleados fijos, acuerdos de reparto de ingresos en lugar de tarifas planas, infraestructura de pago por uso en lugar de contratos comprometidos."
              : "Fixed costs burn at the same rate regardless of performance. Push as many costs as possible toward variable: freelancers over permanent hires, revenue-share deals over flat fees, pay-as-you-go infrastructure over committed contracts."}
          </p>

          <h3 className="text-lg font-semibold text-white">
            {es ? "3. Amplía los plazos de pago siempre que sea posible" : "3. Extend payment terms wherever possible"}
          </h3>
          <p>
            {es
              ? "Negocia plazos de pago de 60–90 días con los proveedores. Impulsa a los clientes hacia pagos anuales por adelantado (ofrece un descuento del 10–15%; casi siempre vale la pena por el beneficio en el flujo de caja)."
              : "Negotiate 60–90 day payment terms with suppliers. Push customers toward upfront annual payments (offer a 10–15% discount — it is almost always worth it for the cash flow benefit)."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Planificación de Escenarios para el Runway" : "Scenario Planning for Runway"}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 pr-6 text-gray-400 font-medium">
                    {es ? "Escenario" : "Scenario"}
                  </th>
                  <th className="text-left py-3 pr-6 text-gray-400 font-medium">
                    {es ? "Descripción" : "Description"}
                  </th>
                  <th className="text-left py-3 text-gray-400 font-medium">
                    {es ? "Implicación" : "Implication"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {es
                  ? [
                      ["Base", "Los ingresos crecen un 10–15% MoM", "14 meses de runway"],
                      ["Negativo", "Ingresos estancados 3 meses, luego 5% MoM", "9 meses — captar o recortar"],
                      ["Positivo", "Ingresos crecen más del 20% MoM", "Rentabilidad en 8 meses"],
                    ].map(([s, d, i]) => (
                      <tr key={s}>
                        <td className="py-3 pr-6 text-blue-300 font-medium">{s}</td>
                        <td className="py-3 pr-6 text-gray-300">{d}</td>
                        <td className="py-3 text-gray-300">{i}</td>
                      </tr>
                    ))
                  : [
                      ["Base", "Revenue grows 10–15% MoM", "14 months runway"],
                      ["Downside", "Revenue flat for 3 months, then 5% MoM", "9 months — raise or cut"],
                      ["Upside", "Revenue grows 20%+ MoM", "Profitable in 8 months"],
                    ].map(([s, d, i]) => (
                      <tr key={s}>
                        <td className="py-3 pr-6 text-blue-300 font-medium">{s}</td>
                        <td className="py-3 pr-6 text-gray-300">{d}</td>
                        <td className="py-3 text-gray-300">{i}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          <p>
            {es
              ? <>El escenario negativo es el más importante. Obliga a plantearse: <em>&quot;¿Qué recortaríamos y en qué orden si los ingresos se estancaran durante un trimestre?&quot;</em></>
              : <>The downside scenario is the most important. It forces the question: <em>&quot;What would we cut, and in what order, if revenue stalled for a quarter?&quot;</em></>}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Cuándo Captar Inversión vs Cuándo Hacer Bootstrapping" : "When to Raise vs When to Bootstrap"}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-950/30 border border-blue-700/40 rounded-xl p-5">
              <h4 className="text-blue-400 font-bold mb-3">
                {es ? "Capta si:" : "Raise if:"}
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                {es
                  ? [
                      "Dinámica de mercado de todo o nada",
                      "Economía unitaria probada, limitado por capital",
                      "El capital cambia la posición competitiva en 18 meses",
                    ].map((i) => <li key={i} className="flex gap-2"><span className="text-green-400">✓</span>{i}</li>)
                  : [
                      "Winner-take-all market dynamics",
                      "Unit economics proven, capital-constrained",
                      "Capital changes competitive position in 18 months",
                    ].map((i) => <li key={i} className="flex gap-2"><span className="text-green-400">✓</span>{i}</li>)}
              </ul>
            </div>
            <div className="bg-[#0d1426] border border-gray-700 rounded-xl p-5">
              <h4 className="text-gray-300 font-bold mb-3">
                {es ? "Haz bootstrapping si:" : "Bootstrap if:"}
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                {es
                  ? [
                      "Aún no has encontrado el product-market fit",
                      "El mercado permite un negocio rentable a menor escala",
                      "Más runway te da mejores puntos de prueba",
                    ].map((i) => <li key={i} className="flex gap-2"><span className="text-yellow-400">→</span>{i}</li>)
                  : [
                      "No product-market fit yet",
                      "Market allows durable profitable business at smaller scale",
                      "More runway gets you to better proof points",
                    ].map((i) => <li key={i} className="flex gap-2"><span className="text-yellow-400">→</span>{i}</li>)}
              </ul>
            </div>
          </div>
          <p>
            {es
              ? "La dilución es permanente. Cada libra de capital captado tiene un coste a largo plazo, aunque en el momento no lo parezca."
              : "Dilution is permanent. Every pound of capital raised has a long-term cost — even if it does not feel that way in the moment."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Las Métricas en las que Se Fijan los Inversores" : "The Metrics Investors Focus On"}
          </h2>
          <ul className="space-y-2 list-none pl-0">
            {es
              ? [
                  "Ingresos recurrentes mensuales (MRR) y su tasa de crecimiento",
                  "Retención neta de ingresos (NRR) — ¿los clientes existentes amplían o se van?",
                  "Ratio CAC:LTV — ¿adquieres clientes de forma eficiente?",
                  "Meses hasta recuperar la inversión — ¿cuánto tarda en ser rentable un nuevo cliente?",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))
              : [
                  "Monthly Recurring Revenue (MRR) and its growth rate",
                  "Net Revenue Retention (NRR) — are existing customers expanding or churning?",
                  "CAC:LTV ratio — are you acquiring customers efficiently?",
                  "Months to payback — how long before a new customer is profitable?",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))}
          </ul>
          <p>
            {es
              ? "Un fundador que puede explicar su economía unitaria en dos minutos es un fundador que capta más rápido y en mejores condiciones."
              : "A founder who can explain their unit economics in two minutes is a founder who raises faster and at better terms."}
          </p>

        </div>

        <ShareButtons
          url="https://www.financeplots.com/blog/bootstrapping-runway"
          title={es
            ? "Bootstrapping y Runway: Cómo Extender la Vida de tu Startup sin Ceder Capital"
            : "Bootstrapping & Runway: How to Extend Your Startup's Life Without Giving Up Equity"}
        />

        <div className="mt-14 bg-[#0d1426] border border-blue-700/40 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">
            {es ? "Modela Tu Runway" : "Model Your Runway"}
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            {es
              ? "Modelo Financiero a 5 Años y Previsión de Flujo de Caja — construye tus escenarios antes de la próxima conversación con inversores."
              : "Free 5-Year Financial Model and Cash Flow Forecast — build your scenarios before your next investor conversation."}
          </p>
          <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition inline-block">
            {es ? "Abrir Herramientas Financieras" : "Open Finance Tools"}
          </Link>
        </div>

        <p className="text-gray-600 text-xs mt-8 text-center">
          {es
            ? "Este artículo es solo para fines informativos y no constituye asesoramiento financiero."
            : "This article is for informational purposes only and does not constitute financial advice."}
        </p>
      </BlogArticleShell>
    </main>
  );
}
