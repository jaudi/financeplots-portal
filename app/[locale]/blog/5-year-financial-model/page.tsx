import Link from "next/link";
import type { Metadata } from "next";
import ShareButtons from "@/components/ShareButtons";
import BlogArticleShell from "@/components/BlogArticleShell";

export const metadata: Metadata = {
  title: "How to Build a 5-Year Financial Model for Your Business | FinancePlots",
  description: "A complete guide to building a three-statement financial model — P&L, cash flow and balance sheet — that investors and banks will trust.",
  openGraph: {
    title: "How to Build a 5-Year Financial Model for Your Business",
    description: "A complete guide to building a three-statement financial model — P&L, cash flow and balance sheet — that investors and banks will trust.",
    url: "https://www.financeplots.com/blog/5-year-financial-model",
    siteName: "FinancePlots",
    type: "article",
    images: [{ url: "https://www.financeplots.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Build a 5-Year Financial Model for Your Business",
    description: "A complete guide to building a three-statement financial model — P&L, cash flow and balance sheet — that investors and banks will trust.",
    images: ["https://www.financeplots.com/og-image.png"],
  },
  alternates: {
    canonical: "https://www.financeplots.com/blog/5-year-financial-model",
  },
};

type Props = { params: Promise<{ locale: string }> };

export default async function FiveYearFinancialModel({ params }: Props) {
  const { locale } = await params;
  const es = locale === "es";

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: "{\"@context\":\"https://schema.org\",\"@type\":\"Article\",\"headline\":\"How to Build a 5-Year Financial Model for Your Business\",\"description\":\"A complete guide to building a three-statement financial model — P&L, cash flow and balance sheet — that investors and banks will trust.\",\"url\":\"https://www.financeplots.com/blog/5-year-financial-model\",\"image\":\"https://www.financeplots.com/og-image.png\",\"author\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\"},\"publisher\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\",\"logo\":{\"@type\":\"ImageObject\",\"url\":\"https://www.financeplots.com/logo-sm.png\"}},\"mainEntityOfPage\":{\"@type\":\"WebPage\",\"@id\":\"https://www.financeplots.com/blog/5-year-financial-model\"}}" }} />
      <BlogArticleShell>

        <Link href="/blog" className="text-blue-400 text-sm hover:text-blue-300 transition mb-8 inline-block">
          {es ? "← Volver al Blog" : "← Back to Blog"}
        </Link>

        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
          {es ? "Finanzas Corporativas" : "Corporate Finance"}
        </span>
        <h1 className="text-4xl font-bold mt-2 mb-3 leading-tight">
          {es
            ? "Cómo Construir un Modelo Financiero a 5 Años para Tu Empresa"
            : "How to Build a 5-Year Financial Model for Your Business"}
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          {es ? "Marzo 2026 · 8 min de lectura" : "March 2026 · 8 min read"}
        </p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">

          <p>
            {es
              ? "Cuando un inversor o un banco pide un modelo financiero a 5 años, no lo hace porque crea que las proyecciones serán exactas. Sabe que no lo serán. Lo que evalúan es si entiendes tu propio negocio lo suficientemente bien como para modelarlo: los impulsores de ingresos, la estructura de costes, los requisitos de capital y cómo interactúan los tres estados financieros. El modelo es una prueba de comprensión financiera y operativa tanto como una previsión."
              : "When an investor or bank asks for a 5-year financial model, they are not asking because they believe the projections will be accurate. They know they will not be. What they are evaluating is whether you understand your own business well enough to model it — the revenue drivers, the cost structure, the capital requirements, and how the three financial statements interact. The model is a test of financial literacy and operational understanding as much as it is a forecast."}
          </p>
          <p>
            {es
              ? "Esta guía explica cómo construir un modelo a 5 años creíble y listo para inversores desde cero."
              : "This guide walks through how to build a credible, investor-ready 5-year model from scratch."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Por Qué los Inversores y los Bancos Exigen Proyecciones a 5 Años" : "Why Investors and Banks Require 5-Year Projections"}
          </h2>
          <p>
            {es
              ? "Cinco años es suficiente para mostrar que un negocio alcanza la madurez o una escala significativa, pero lo suficientemente corto para que los supuestos puedan vincularse a datos de mercado observables y planes operativos. También es el horizonte de inversión típico del capital riesgo y del capital privado. Para los bancos, las proyecciones a 5 años demuestran que la empresa puede atender la deuda durante el plazo del préstamo. Para los inversores de capital, proporciona la base para una valoración DCF."
              : "Five years is long enough to show a business reaching maturity or meaningful scale, but short enough that assumptions can be tied to observable market data and operational plans. It is also the typical investment horizon for venture capital and private equity. For banks, 5-year projections demonstrate that the business can service debt over the loan term. For equity investors, it provides the basis for a DCF valuation."}
          </p>
          <p>
            {es
              ? "Un modelo a 5 años señala a cualquier contraparte que gestionas tu empresa con intención: que has pensado en cómo crecerán los ingresos, dónde aumentarán los costes y cuánto efectivo necesitará la empresa en el camino."
              : "A 5-year model signals to any counterparty that you are running your business with intention — that you have thought through how revenue will grow, where costs will increase, and how much cash the business will need along the way."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "El Modelo de Tres Estados: Cómo Se Relacionan" : "The Three Statement Model: How They Link"}
          </h2>
          <p>
            {es
              ? "Un modelo financiero completo integra tres estados que están mecánicamente conectados. No puedes cambiar uno sin que los otros se actualicen, y esa integración es lo que hace útil al modelo en lugar de decorativo."
              : "A complete financial model integrates three statements that are mechanically connected. You cannot change one without the others updating — and that integration is what makes the model useful rather than decorative."}
          </p>
          <ul className="space-y-2 list-none pl-0">
            {es
              ? [
                  "Cuenta de resultados (P&L): muestra ingresos, costes y rentabilidad durante el período. El EBITDA y el beneficio neto se encuentran aquí.",
                  "Estado de flujos de caja: parte del beneficio neto de la P&L, ajusta por partidas no monetarias (amortización) y contabiliza los movimientos de capital circulante y la inversión en capital para llegar al flujo de caja libre.",
                  "Balance: muestra activos, pasivos y patrimonio neto en un momento dado. El beneficio neto de la P&L fluye hacia los beneficios retenidos; el efectivo del estado de flujos de caja alimenta el saldo de caja.",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))
              : [
                  "Profit & Loss (P&L): shows revenue, costs, and profitability over the period. EBITDA and net profit live here.",
                  "Cash Flow Statement: starts with net profit from the P&L, adjusts for non-cash items (depreciation, amortisation), and accounts for working capital movements and capex to arrive at free cash flow.",
                  "Balance Sheet: shows assets, liabilities, and equity at a point in time. Net profit from the P&L flows into retained earnings; cash from the cash flow statement feeds into the cash balance.",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))}
          </ul>
          <p>
            {es
              ? "El balance es la verificación final: si no cuadra (activos = pasivos + patrimonio neto), hay un error en algún lugar del modelo. Construir el modelo de tres estados te enseña de dónde viene cada número y a dónde va."
              : "The balance sheet is the ultimate check: if it does not balance (assets = liabilities + equity), there is an error somewhere in the model. Building the three-statement model teaches you where every number comes from and where it goes."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Impulsores de Ingresos: Bottom-Up vs Top-Down" : "Revenue Drivers: Bottom-Up vs Top-Down"}
          </h2>
          <p>
            {es
              ? "Existen dos enfoques generales para la previsión de ingresos. Ambos son válidos en diferentes contextos y los mejores modelos suelen utilizar ambos como verificación cruzada."
              : "There are two broad approaches to revenue forecasting. Both are valid in different contexts, and the best models often use both as a cross-check."}
          </p>
          <p>
            {es
              ? <><span className="text-white font-medium">Top-down:</span> Comienza con el mercado total disponible (TAM) y aplica un supuesto de cuota de mercado. Si el mercado de software de nóminas en el Reino Unido es de 500 millones de dólares y esperas capturar el 0,5% en el año 3, eso son 2,5 millones de dólares en ingresos. Este enfoque es útil para mostrar la oportunidad de mercado, pero puede manipularse fácilmente: un pequeño cambio en el supuesto de cuota de mercado tiene un gran impacto en el resultado.</>
              : <><span className="text-white font-medium">Top-down:</span> Start with the total addressable market (TAM) and apply a market share assumption. If the UK payroll software market is $500m and you expect to capture 0.5% in year 3, that is $2.5m in revenue. This approach is useful for showing the market opportunity, but it can be gamed easily — a small change in market share assumption has a large impact on the output.</>}
          </p>
          <p>
            {es
              ? <><span className="text-white font-medium">Bottom-up:</span> Construye los ingresos a partir de unidades operativas: número de comerciales, número de clientes, valor medio del contrato, tasa de abandono. Para un negocio SaaS: (número de clientes × ingresos recurrentes mensuales medios) × 12 = ingresos anuales. Esto es más difícil de construir pero mucho más creíble, porque cada supuesto está fundamentado en algo operativo.</>
              : <><span className="text-white font-medium">Bottom-up:</span> Build revenue from operational units — number of salespeople, number of customers, average contract value, churn rate. For a SaaS business: (number of customers × average monthly recurring revenue) × 12 = annual revenue. This is harder to build but far more credible, because every assumption is grounded in something operational.</>}
          </p>
          <p>
            {es
              ? "Para los años 1 y 2, usa el enfoque bottom-up. Para los años 3 a 5, puedes aplicar una tasa de crecimiento sobre la base bottom-up, verificada contra la cuota de mercado top-down que esto implica."
              : "For years 1 and 2, use bottom-up. For years 3 to 5, you can use a growth rate applied to the bottom-up base, sanity-checked against the top-down market share this implies."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Estructura de Costes: De Ingresos a EBITDA" : "Cost Structure: From Revenue to EBITDA"}
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 pr-6 text-gray-400 font-medium">
                    {es ? "Partida" : "Line Item"}
                  </th>
                  <th className="text-left py-3 text-gray-400 font-medium">
                    {es ? "Qué Captura" : "What It Captures"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {es
                  ? [
                      ["Ingresos", "Ventas totales de todos los productos y segmentos"],
                      ["Coste de Ventas (COGS)", "Costes directos para entregar el producto o servicio: alojamiento, materiales, mano de obra directa"],
                      ["Beneficio Bruto", "Ingresos menos COGS. El margen bruto % es un referente clave en tu sector"],
                      ["Gastos Operativos (OpEx)", "Ventas y marketing, I+D, gastos generales y administrativos: los gastos generales de gestión del negocio"],
                      ["EBITDA", "Beneficio antes de intereses, impuestos, depreciación y amortización. La métrica de rentabilidad principal para la mayoría de los modelos"],
                      ["Depreciación y Amortización", "Cargo no monetario por el desgaste de los activos: reduce el beneficio pero no el efectivo"],
                      ["EBIT / Beneficio Operativo", "EBITDA menos D&A"],
                      ["Intereses e Impuestos", "Costes de financiación y cargo fiscal"],
                      ["Beneficio Neto", "La línea de fondo: lo que fluye a los beneficios retenidos del balance"],
                    ].map(([a, b]) => (
                      <tr key={a}>
                        <td className="py-3 pr-6 text-blue-300 font-medium">{a}</td>
                        <td className="py-3 text-gray-300">{b}</td>
                      </tr>
                    ))
                  : [
                      ["Revenue", "Total sales across all products and segments"],
                      ["Cost of Goods Sold (COGS)", "Direct costs to deliver the product or service — hosting, materials, direct labour"],
                      ["Gross Profit", "Revenue minus COGS. Gross margin % is a key benchmark for your industry"],
                      ["Operating Expenses (OpEx)", "Sales & marketing, R&D, general & administrative costs — the overhead of running the business"],
                      ["EBITDA", "Earnings before interest, tax, depreciation & amortisation. The primary profitability metric for most models"],
                      ["Depreciation & Amortisation", "Non-cash charge for the wear of assets — reduces profit but not cash"],
                      ["EBIT / Operating Profit", "EBITDA minus D&A"],
                      ["Interest & Tax", "Financing costs and tax charge"],
                      ["Net Profit", "The bottom line — what flows into retained earnings on the balance sheet"],
                    ].map(([a, b]) => (
                      <tr key={a}>
                        <td className="py-3 pr-6 text-blue-300 font-medium">{a}</td>
                        <td className="py-3 text-gray-300">{b}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Ratios Clave a Incluir en el Modelo" : "Key Ratios to Include in the Model"}
          </h2>
          <p>
            {es
              ? "Todos los inversores calcularán estos ratios a partir de tu modelo. Preséntelos explícitamente: demuestra que entiendes lo que buscan."
              : "Every investor will calculate these ratios from your model. Present them explicitly — it shows you understand what they are looking for."}
          </p>
          <ul className="space-y-2 list-none pl-0">
            {es
              ? [
                  "Margen bruto %: beneficio bruto como porcentaje de los ingresos. Los negocios SaaS suelen apuntar al 70–80%; los de fabricación al 30–50%",
                  "Margen EBITDA %: EBITDA como porcentaje de los ingresos. Muestra el apalancamiento operativo: cómo escala la rentabilidad con el crecimiento de los ingresos",
                  "Tasa de crecimiento de ingresos: variación porcentual interanual, debe seguir una trayectoria creíble",
                  "Conversión de efectivo: cuánto del EBITDA se convierte en flujo de caja libre real después de la inversión en capital y el capital circulante",
                  "Tasa de quema y runway (para empresas pre-rentabilidad): consumo mensual de caja y meses de efectivo restantes",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))
              : [
                  "Gross margin %: gross profit as a percentage of revenue. SaaS businesses typically target 70–80%; manufacturing businesses 30–50%",
                  "EBITDA margin %: EBITDA as a percentage of revenue. Shows operating leverage — how profitability scales with revenue growth",
                  "Revenue growth rate: year-on-year percentage change, should follow a credible trajectory",
                  "Cash conversion: how much of EBITDA converts to actual free cash flow after capex and working capital",
                  "Burn rate and runway (for pre-profitability businesses): monthly cash consumption and months of cash remaining",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))}
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Errores Comunes que Socavan la Credibilidad" : "Common Mistakes That Undermine Credibility"}
          </h2>
          <ul className="space-y-2 list-none pl-0">
            {es
              ? [
                  "Crecimiento de ingresos lineal: asumir un crecimiento del 20% cada año sin variación indica falta de comprensión de los ciclos empresariales y la dinámica de ventas",
                  "Ignorar el capital circulante: a medida que crecen los ingresos, también lo hace el efectivo inmovilizado en cuentas por cobrar e inventario; los modelos que ignoran esto sobreestiman significativamente la generación de caja",
                  "Sin análisis de sensibilidad: presentar un único escenario sin mostrar qué pasa si los ingresos son un 20% inferiores o los costes un 15% superiores sugiere supuestos frágiles",
                  "Subestimar los costes de personal: los costes salariales incluyendo beneficios, cotizaciones empresariales y gastos de reclutamiento superan sistemáticamente las estimaciones de salario base en un 25–30%",
                  "Estados desconectados: un modelo en el que los tres estados no están mecánicamente vinculados es inmediatamente evidente para cualquier revisor con experiencia",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))
              : [
                  "Straight-line revenue growth: assuming 20% growth every year with no variation signals a lack of understanding of business cycles and sales dynamics",
                  "Ignoring working capital: as revenue grows, so does the cash tied up in receivables and inventory — models that ignore this overstate cash generation significantly",
                  "No sensitivity analysis: presenting a single scenario without showing what happens if revenue is 20% lower or costs are 15% higher suggests fragile assumptions",
                  "Underestimating headcount costs: staff costs including benefits, employer taxes, and recruitment fees routinely exceed base salary estimates by 25–30%",
                  "Disconnected statements: a model where the three statements do not mechanically link is immediately apparent to any experienced reviewer",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))}
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Qué Incluir al Presentar a Inversores" : "What to Include When Presenting to Investors"}
          </h2>
          <p>
            {es
              ? "El modelo en sí debe ir acompañado de una narrativa clara. Los inversores quieren entender los supuestos clave que impulsan cada línea de ingresos, para qué se usarán los fondos captados y cuándo, qué hitos se alcanzarán en cada etapa del plan y cómo queda el modelo en un escenario negativo."
              : "The model itself should be accompanied by a clear narrative. Investors want to understand the key assumptions driving each revenue line, what the proceeds of investment will be used for and when, what milestones will be hit at each stage of the plan, and what the model looks like under a downside scenario."}
          </p>
          <p>
            {es
              ? "Presenta tres escenarios: caso base, caso positivo (15–20% por encima de los ingresos base) y caso negativo (20–25% por debajo de los ingresos base). Muestra que el negocio sobrevive al caso negativo: los inversores son gestores de riesgo tanto como buscadores de rentabilidad, y demostrar resiliencia es tan importante como demostrar ambición."
              : "Present three scenarios: base case, upside (15–20% above base revenue), and downside (20–25% below base revenue). Show that the business survives the downside case — investors are risk managers as much as return seekers, and demonstrating resilience is as important as demonstrating ambition."}
          </p>
          <p>
            {es
              ? "Un sólido modelo a 5 años no es una predicción. Es una expresión estructurada de la lógica de tu negocio: cómo se generan los ingresos, cómo se gestionan los costes y cómo fluye el efectivo a través de la empresa. Hazlo bien y los números se convierten en el punto de partida de una conversación creíble."
              : "A strong 5-year model is not a prediction. It is a structured expression of your business logic — how revenue is earned, how costs are managed, and how cash flows through the business. Get that right, and the numbers become a starting point for a credible conversation."}
          </p>

        </div>

        <ShareButtons
          url="https://www.financeplots.com/blog/5-year-financial-model"
          title={es
            ? "Cómo Construir un Modelo Financiero a 5 Años para Tu Empresa"
            : "How to Build a 5-Year Financial Model for Your Business"}
        />

        <div className="mt-14 bg-[#0d1426] border border-blue-700/40 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">
            {es ? "Construye Tu Modelo Financiero a 5 Años Gratis" : "Build Your 5-Year Financial Model Free"}
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            {es
              ? "Introduce tus impulsores de ingresos y supuestos de costes: obtén una P&L integrada, flujo de caja y ratios clave al instante."
              : "Input your revenue drivers and cost assumptions — get a fully integrated P&amp;L, cash flow, and key ratio output instantly."}
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
