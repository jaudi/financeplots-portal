import Link from "next/link";
import type { Metadata } from "next";
import ShareButtons from "@/components/ShareButtons";
import BlogArticleShell from "@/components/BlogArticleShell";

export const metadata: Metadata = {
  title: "DCF Valuation Explained: How to Value a Business Using Discounted Cash Flow | FinancePlots",
  description: "The gold standard for business valuation explained clearly — free cash flows, WACC, terminal value, and how to interpret the output.",
  openGraph: {
    title: "DCF Valuation Explained: How to Value a Business Using Discounted Cash Flow",
    description: "The gold standard for business valuation explained clearly — free cash flows, WACC, terminal value, and how to interpret the output.",
    url: "https://www.financeplots.com/blog/dcf-valuation-guide",
    siteName: "FinancePlots",
    type: "article",
    images: [{ url: "https://www.financeplots.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DCF Valuation Explained: How to Value a Business Using Discounted Cash Flow",
    description: "The gold standard for business valuation explained clearly — free cash flows, WACC, terminal value, and how to interpret the output.",
    images: ["https://www.financeplots.com/og-image.png"],
  },
  alternates: {
    canonical: "https://www.financeplots.com/blog/dcf-valuation-guide",
  },
};

type Props = { params: Promise<{ locale: string }> };

export default async function DcfValuationGuide({ params }: Props) {
  const { locale } = await params;
  const es = locale === "es";

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: "{\"@context\":\"https://schema.org\",\"@type\":\"Article\",\"headline\":\"DCF Valuation Explained: How to Value a Business Using Discounted Cash Flow\",\"description\":\"The gold standard for business valuation explained clearly — free cash flows, WACC, terminal value, and how to interpret the output.\",\"url\":\"https://www.financeplots.com/blog/dcf-valuation-guide\",\"image\":\"https://www.financeplots.com/og-image.png\",\"author\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\"},\"publisher\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\",\"logo\":{\"@type\":\"ImageObject\",\"url\":\"https://www.financeplots.com/logo-sm.png\"}},\"mainEntityOfPage\":{\"@type\":\"WebPage\",\"@id\":\"https://www.financeplots.com/blog/dcf-valuation-guide\"}}" }} />
      <BlogArticleShell>

        <Link href="/blog" className="text-blue-400 text-sm hover:text-blue-300 transition mb-8 inline-block">
          {es ? "← Volver al Blog" : "← Back to Blog"}
        </Link>

        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
          {es ? "Valoración" : "Valuation"}
        </span>
        <h1 className="text-4xl font-bold mt-2 mb-3 leading-tight">
          {es
            ? "Valoración DCF Explicada: Cómo Valorar una Empresa Usando el Flujo de Caja Descontado"
            : "DCF Valuation Explained: How to Value a Business Using Discounted Cash Flow"}
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          {es ? "Marzo 2026 · 8 min de lectura" : "March 2026 · 8 min read"}
        </p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">

          <p>
            {es
              ? "El análisis de flujo de caja descontado —DCF— es lo más cercano que tiene las finanzas a una verdad universal. Elimina el ruido de mercado, las transacciones comparables y los múltiplos sectoriales, y lo que queda es una pregunta fundamental: ¿cuánto vale hoy una corriente de flujos de caja futuros? Eso es lo que responde el DCF. Es el estándar de oro para la valoración empresarial, enseñado en todos los programas MBA y utilizado por todos los asesores de M&A, inversores y equipos de finanzas corporativas serios."
              : "Discounted cash flow analysis — DCF — is the closest thing finance has to a universal truth. Strip away the market noise, the comparable transactions, and the industry multiples, and what you are left with is a fundamental question: how much is a stream of future cash flows worth today? That is what DCF answers. It is the gold standard for business valuation, taught in every MBA program and used by every serious M&amp;A advisor, investor, and corporate finance team."}
          </p>
          <p>
            {es
              ? "Entender el DCF no es solo un ejercicio académico. Si estás captando capital, vendiendo un negocio, adquiriendo un competidor o evaluando una inversión importante, necesitas ser capaz de construir un modelo DCF o, como mínimo, interrogar críticamente uno que haya construido otra persona."
              : "Understanding DCF is not just an academic exercise. If you are raising capital, selling a business, acquiring a competitor, or evaluating a major investment, you need to be able to build a DCF model — or at minimum, critically interrogate one that someone else has built."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "El Principio Fundamental: El Dinero Hoy Vale Más que el Dinero Mañana" : "The Core Principle: Money Today Is Worth More Than Money Tomorrow"}
          </h2>
          <p>
            {es
              ? "Un dólar recibido hoy vale más que un dólar recibido dentro de cinco años. Esto no es solo intuición: refleja el coste real de esperar: la inflación erosiona el poder adquisitivo, siempre existe el riesgo de que el pago no se materialice y el dinero en mano hoy puede invertirse para generar rendimientos. La tasa a la que el efectivo futuro se descuenta al presente se denomina tasa de descuento. Cuanto mayor es el riesgo, mayor es la tasa de descuento y menor el valor de un flujo de caja futuro en términos actuales."
              : "A dollar received today is worth more than a dollar received in five years. This is not just intuition — it reflects the real cost of waiting: inflation erodes purchasing power, there is always a risk the payment does not materialise, and money in hand today can be invested to generate returns. The rate at which future cash is discounted back to today is called the discount rate. The higher the risk, the higher the discount rate, and the less a future cash flow is worth in today\u2019s terms."}
          </p>
          <p>
            {es
              ? "El valor presente de un único flujo de caja futuro se calcula como:"
              : "The present value of a single future cash flow is calculated as:"}
          </p>
          <div className="bg-[#0d1426] border border-gray-700 rounded-lg px-6 py-4 font-mono text-blue-300 text-sm">
            PV = FCF ÷ (1 + r)^t
          </div>
          <p>
            {es
              ? "Donde FCF es el flujo de caja libre en el año t, r es la tasa de descuento y t es el número de años en el futuro. Un DCF suma este cálculo a lo largo de todos los años del período de previsión y luego añade el valor terminal."
              : "Where FCF is the free cash flow in year t, r is the discount rate, and t is the number of years into the future. A DCF sums this calculation across every year of the forecast period, then adds the terminal value."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Paso 1: Prever los Flujos de Caja Libres" : "Step 1: Forecast Free Cash Flows"}
          </h2>
          <p>
            {es
              ? "El flujo de caja libre (FCF) es el efectivo que genera una empresa después de contabilizar los costes operativos y la inversión en capital: el efectivo que está genuinamente disponible para los inversores. Se calcula como:"
              : "Free cash flow (FCF) is the cash a business generates after accounting for operating costs and capital expenditure — the cash that is genuinely available to investors. It is calculated as:"}
          </p>
          <div className="bg-[#0d1426] border border-gray-700 rounded-lg px-6 py-4 font-mono text-blue-300 text-sm">
            FCF = EBIT × (1 − tax rate) + Depreciation − Capital Expenditure − Change in Working Capital
          </div>
          <p>
            {es
              ? "La previsión del FCF suele cubrir entre 5 y 10 años, dependiendo de hasta qué punto se pueden formular supuestos razonables. Las proyecciones de los años 1 y 2 deben estar fundamentadas en supuestos operativos detallados: contratos de ingresos específicos, aumentos de costes conocidos, inversiones planificadas. Los años 3 a 5 implicarán necesariamente más criterio."
              : "Forecasting FCF typically covers 5 to 10 years, depending on how far out you can make reasonable assumptions. Year 1 and 2 projections should be grounded in detailed operational assumptions — specific revenue contracts, known cost increases, planned capex. Years 3 to 5 will necessarily involve more judgment."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Paso 2: Elegir una Tasa de Descuento (WACC)" : "Step 2: Choose a Discount Rate (WACC)"}
          </h2>
          <p>
            {es
              ? "La tasa de descuento más utilizada en un DCF corporativo es el Coste Medio Ponderado del Capital (WACC, por sus siglas en inglés). El WACC refleja el coste combinado de todo el capital utilizado para financiar la empresa —tanto deuda como capital propio— ponderado por su proporción en la estructura de capital."
              : "The most commonly used discount rate in a corporate DCF is the Weighted Average Cost of Capital (WACC). WACC reflects the blended cost of all capital used to fund the business — both debt and equity — weighted by their proportion in the capital structure."}
          </p>
          <div className="bg-[#0d1426] border border-gray-700 rounded-lg px-6 py-4 font-mono text-blue-300 text-sm">
            WACC = (E/V × Ke) + (D/V × Kd × (1 − tax rate))
          </div>
          <p>
            {es
              ? "Donde E es el valor de mercado de los fondos propios, D es el valor de mercado de la deuda, V es el valor total de la empresa (E + D), Ke es el coste del capital propio (estimado normalmente mediante el Modelo de Valoración de Activos de Capital) y Kd es el coste de la deuda (el tipo de interés de los préstamos). El escudo fiscal sobre los intereses de la deuda reduce el coste efectivo de la deuda, por eso la financiación mediante deuda suele ser más barata que la financiación mediante capital propio."
              : "Where E is the market value of equity, D is the market value of debt, V is total firm value (E + D), Ke is the cost of equity (typically estimated using the Capital Asset Pricing Model), and Kd is the cost of debt (the interest rate on borrowings). The tax shield on debt interest reduces the effective cost of debt, which is why debt financing is often cheaper than equity."}
          </p>
          <p>
            {es
              ? "Para la mayoría de las empresas privadas, el WACC se sitúa entre el 8% y el 20%, dependiendo del perfil de riesgo del negocio. Las empresas en fase inicial con flujos de caja inciertos tendrán un WACC mucho más alto que un negocio estable con muchos activos en infraestructuras."
              : "For most private companies, WACC falls somewhere between 8% and 20%, depending on the risk profile of the business. Early-stage companies with uncertain cash flows will carry a much higher WACC than a stable, asset-heavy infrastructure business."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Paso 3: Calcular el Valor Terminal" : "Step 3: Calculate Terminal Value"}
          </h2>
          <p>
            {es
              ? "El período de previsión —digamos 5 años— solo capta una fracción del valor total de la empresa. La mayor parte del valor de una empresa se encuentra más allá del horizonte de previsión explícito. El valor terminal captura esto. El enfoque más utilizado es el Modelo de Gordon:"
              : "The forecast period — say 5 years — only captures a fraction of the business\u2019s total value. Most of a business\u2019s value lies beyond the explicit forecast horizon. Terminal value captures this. The most widely used approach is the Gordon Growth Model:"}
          </p>
          <div className="bg-[#0d1426] border border-gray-700 rounded-lg px-6 py-4 font-mono text-blue-300 text-sm">
            Terminal Value = FCF in final year × (1 + g) ÷ (WACC − g)
          </div>
          <p>
            {es
              ? "Donde g es la tasa de crecimiento sostenible a largo plazo, que normalmente se fija en el nivel o por debajo de la tasa de crecimiento nominal del PIB a largo plazo (2–3% para la mayoría de las economías desarrolladas). Asumir una tasa de crecimiento superior a esa es agresivo y rara vez es defendible."
              : "Where g is the long-term sustainable growth rate — typically set at or below the long-run nominal GDP growth rate (2–3% for most developed economies). Assuming a growth rate above that is aggressive and rarely defensible."}
          </p>
          <p>
            {es
              ? "El valor terminal se descuenta entonces al presente utilizando el mismo WACC. En muchos modelos DCF, el valor terminal representa entre el 60% y el 80% del valor total de la empresa, por eso la tasa de crecimiento asumida y la tasa de descuento son tan determinantes."
              : "The terminal value is then discounted back to today using the same WACC. In many DCF models, the terminal value represents 60–80% of total enterprise value — which is why the assumed growth rate and discount rate are so consequential."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Paso 4: Sumar para Obtener el Valor de la Empresa" : "Step 4: Sum to Get Enterprise Value"}
          </h2>
          <p>
            {es
              ? "El valor de la empresa (EV) es la suma de todos los flujos de caja libres descontados a lo largo del período de previsión más el valor terminal descontado. Para pasar del valor de la empresa al valor de los fondos propios, resta la deuda neta (deuda total menos efectivo y equivalentes). El resultado es lo que teóricamente vale el capital de la empresa."
              : "Enterprise value (EV) is the sum of all discounted free cash flows across the forecast period plus the discounted terminal value. To get from enterprise value to equity value, subtract net debt (total debt minus cash and cash equivalents). The result is what the equity of the business is theoretically worth."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Análisis de Sensibilidad: El Resultado Es un Rango, No un Número" : "Sensitivity Analysis: The Output Is a Range, Not a Number"}
          </h2>
          <p>
            {es
              ? "Cualquiera que presente un DCF con un único número de salida es ingenuo o intenta engañarte. El resultado de un DCF es muy sensible a la tasa de descuento y a la tasa de crecimiento terminal. Un cambio de un punto porcentual en cualquiera de los supuestos puede mover la valoración entre un 20% y un 40% o más."
              : "Anyone who presents a DCF with a single output number is either naive or trying to mislead you. The output of a DCF is deeply sensitive to the discount rate and the terminal growth rate. A one-percentage-point change in either assumption can move the valuation by 20–40% or more."}
          </p>
          <p>
            {es
              ? "La buena práctica es presentar una tabla de sensibilidad que muestre el valor de la empresa bajo una gama de combinaciones de WACC y tasas de crecimiento. Esto proporciona un rango de valoración en lugar de una estimación puntual de falsa precisión, lo que es una representación mucho más honesta de lo que puede decirte un DCF."
              : "Best practice is to present a sensitivity table showing enterprise value under a range of WACC and growth rate combinations. This gives a valuation range rather than a false-precision point estimate, which is a far more honest representation of what a DCF can tell you."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Limitaciones: Basura Entra, Basura Sale" : "Limitations: Garbage In, Garbage Out"}
          </h2>
          <ul className="space-y-2 list-none pl-0">
            {es
              ? [
                  "El DCF es tan bueno como las previsiones de flujo de caja que lo alimentan: las proyecciones de ingresos excesivamente optimistas producen valoraciones infladas",
                  "El WACC se estima, no se observa: diferentes analistas llegarán a tasas de descuento distintas para el mismo negocio",
                  "El valor terminal domina el valor total, lo que significa que pequeños cambios en los supuestos a largo plazo tienen un impacto desproporcionado en el resultado",
                  "El DCF no captura la opcionalidad, las sinergias estratégicas ni el sentimiento del mercado, por eso suele utilizarse junto con múltiplos de mercado",
                  "Los DCF de empresas privadas son más difíciles: no hay beta de mercado observable y los supuestos sobre la estructura de capital son menos estables",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))
              : [
                  "DCF is only as good as the cash flow forecasts that feed it — overly optimistic revenue projections produce inflated valuations",
                  "WACC is estimated, not observed — different analysts will arrive at different discount rates for the same business",
                  "Terminal value dominates total value, meaning small changes in long-term assumptions have an outsized impact on the output",
                  "DCF does not capture optionality, strategic synergies, or market sentiment — which is why it is often used alongside market multiples",
                  "Private company DCFs are harder — there is no market beta to observe, and capital structure assumptions are less stable",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))}
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Cuándo Usar un DCF" : "When to Use a DCF"}
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 pr-6 text-gray-400 font-medium">
                    {es ? "Situación" : "Situation"}
                  </th>
                  <th className="text-left py-3 text-gray-400 font-medium">
                    {es ? "Por Qué el DCF Es Apropiado" : "Why DCF Is Appropriate"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {es
                  ? [
                      ["Due diligence en M&A", "Evaluar si el precio objetivo está justificado por los fundamentales"],
                      ["Captación de capital", "Anclar una valoración pre-money en las negociaciones con inversores"],
                      ["Presupuestación de capital", "Evaluar si una inversión importante genera rentabilidades adecuadas"],
                      ["Venta de negocio", "Comprender el valor intrínseco antes de contactar compradores"],
                      ["Informes de equidad", "Proporcionar una visión independiente sobre el precio de la transacción"],
                    ].map(([a, b]) => (
                      <tr key={a}>
                        <td className="py-3 pr-6 text-blue-300 font-medium">{a}</td>
                        <td className="py-3 text-gray-300">{b}</td>
                      </tr>
                    ))
                  : [
                      ["M&A due diligence", "Assessing whether the target price is justified by fundamentals"],
                      ["Equity fundraising", "Anchoring a pre-money valuation in investor negotiations"],
                      ["Capital budgeting", "Evaluating whether a major investment generates adequate returns"],
                      ["Business sale", "Understanding intrinsic value before engaging buyers"],
                      ["Fairness opinions", "Providing an independent view on transaction pricing"],
                    ].map(([a, b]) => (
                      <tr key={a}>
                        <td className="py-3 pr-6 text-blue-300 font-medium">{a}</td>
                        <td className="py-3 text-gray-300">{b}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          <p>
            {es
              ? "El DCF no es adecuado para empresas sin un camino visible hacia flujos de caja positivos, donde abundan datos de mercado comparables y fiables, o donde la valoración basada en activos es más apropiada (por ejemplo, sociedades holding o inmobiliarias). Pero para la gran mayoría de las empresas operativas, sigue siendo la metodología de valoración más rigurosa y defendible disponible."
              : "DCF is not suited for businesses with no visible path to positive cash flow, where comparable market data is abundant and reliable, or where asset-based valuation is more appropriate (e.g., holding companies or real estate). But for the vast majority of operating businesses, it remains the most rigorous and defensible valuation methodology available."}
          </p>

        </div>

        <ShareButtons
          url="https://www.financeplots.com/blog/dcf-valuation-guide"
          title={es
            ? "Valoración DCF Explicada: Cómo Valorar una Empresa Usando el Flujo de Caja Descontado"
            : "DCF Valuation Explained: How to Value a Business Using Discounted Cash Flow"}
        />

        <div className="mt-14 bg-[#0d1426] border border-blue-700/40 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">
            {es ? "Prueba la Herramienta de Valoración DCF Gratuita" : "Try the Free DCF Valuation Tool"}
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            {es
              ? "Introduce tus proyecciones de flujo de caja y tasa de descuento: obtén un resultado DCF completo con tabla de sensibilidad en segundos."
              : "Input your cash flow projections and discount rate — get a full DCF output with sensitivity table in seconds."}
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
