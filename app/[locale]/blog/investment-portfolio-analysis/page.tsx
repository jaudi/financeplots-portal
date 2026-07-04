import Link from "next/link";
import type { Metadata } from "next";
import ShareButtons from "@/components/ShareButtons";
import BlogArticleShell from "@/components/BlogArticleShell";

export const metadata: Metadata = {
  title: "How to Analyse Your Investment Portfolio: Return, Risk and Diversification | FinancePlots",
  description: "Most investors only track returns. Learn how to measure risk-adjusted returns, portfolio volatility, Sharpe ratio and diversification properly.",
  openGraph: {
    title: "How to Analyse Your Investment Portfolio: Return, Risk and Diversification",
    description: "Most investors only track returns. Learn how to measure risk-adjusted returns, portfolio volatility, Sharpe ratio and diversification properly.",
    url: "https://www.financeplots.com/blog/investment-portfolio-analysis",
    siteName: "FinancePlots",
    type: "article",
    images: [{ url: "https://www.financeplots.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Analyse Your Investment Portfolio: Return, Risk and Diversification",
    description: "Most investors only track returns. Learn how to measure risk-adjusted returns, portfolio volatility, Sharpe ratio and diversification properly.",
    images: ["https://www.financeplots.com/og-image.png"],
  },
  alternates: {
    canonical: "https://www.financeplots.com/blog/investment-portfolio-analysis",
  },
};

type Props = { params: Promise<{ locale: string }> };

export default async function InvestmentPortfolioAnalysis({ params }: Props) {
  const { locale } = await params;
  const es = locale === "es";

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: "{\"@context\":\"https://schema.org\",\"@type\":\"Article\",\"headline\":\"How to Analyse Your Investment Portfolio: Return, Risk and Diversification\",\"description\":\"Most investors only track returns. Learn how to measure risk-adjusted returns, portfolio volatility, Sharpe ratio and diversification properly.\",\"url\":\"https://www.financeplots.com/blog/investment-portfolio-analysis\",\"image\":\"https://www.financeplots.com/og-image.png\",\"author\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\"},\"publisher\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\",\"logo\":{\"@type\":\"ImageObject\",\"url\":\"https://www.financeplots.com/logo-sm.png\"}},\"mainEntityOfPage\":{\"@type\":\"WebPage\",\"@id\":\"https://www.financeplots.com/blog/investment-portfolio-analysis\"}}" }} />
      <BlogArticleShell>

        <Link href="/blog" className="text-blue-400 text-sm hover:text-blue-300 transition mb-8 inline-block">
          {es ? "← Volver al Blog" : "← Back to Blog"}
        </Link>

        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
          {es ? "Finanzas Personales" : "Personal Finance"}
        </span>
        <h1 className="text-4xl font-bold mt-2 mb-3 leading-tight">
          {es
            ? "Cómo Analizar Tu Cartera de Inversiones: Rentabilidad, Riesgo y Diversificación"
            : "How to Analyse Your Investment Portfolio: Return, Risk and Diversification"}
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          {es ? "Marzo 2026 · 7 min de lectura" : "March 2026 · 7 min read"}
        </p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">

          <p>
            {es
              ? "La mayoría de los inversores comprueban su cartera fijándose en un único número: la rentabilidad total. ¿Está en positivo o en negativo? ¿En qué medida? Aunque la rentabilidad importa, centrarse solo en ella es como evaluar un coche únicamente por su velocidad máxima sin tener en cuenta el consumo de combustible, la manejabilidad o la distancia de frenado. Un análisis riguroso de la cartera requiere entender tanto lo que ganaste como el riesgo que asumiste para ganarlo, y si ambos están en proporción."
              : "Most investors check their portfolio by looking at one number: total return. Is it up or down? By how much? While return matters, focusing on return alone is like evaluating a car purely by its top speed without considering fuel consumption, handling, or braking distance. A rigorous portfolio analysis requires understanding both what you earned and what risk you took to earn it — and whether the two are in proportion."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Rentabilidad Total vs Rentabilidad Anualizada" : "Total Return vs Annualised Return"}
          </h2>
          <p>
            {es
              ? "La rentabilidad total mide la ganancia o pérdida global de una inversión desde la compra hasta la fecha actual, expresada como porcentaje de la inversión inicial. Incluye tanto la revalorización del precio como cualquier ingreso recibido (dividendos, cupones). Sencillo."
              : "Total return measures the overall gain or loss on an investment from purchase to the current date, expressed as a percentage of the initial investment. It includes both price appreciation and any income received (dividends, coupons). Simple enough."}
          </p>
          <p>
            {es
              ? "La rentabilidad anualizada —también llamada Tasa de Crecimiento Anual Compuesto (CAGR)— es más útil para comparar inversiones mantenidas durante diferentes períodos de tiempo. Una rentabilidad total del 60% en 10 años es sustancialmente menos impresionante que una rentabilidad total del 60% en 3 años. La CAGR normaliza el tiempo:"
              : "Annualised return — also called the Compound Annual Growth Rate (CAGR) — is more useful for comparing investments held over different time periods. A 60% total return over 10 years is substantially less impressive than a 60% total return over 3 years. CAGR normalises for time:"}
          </p>
          <div className="bg-[#0d1426] border border-gray-700 rounded-lg px-6 py-4 font-mono text-blue-300 text-sm">
            CAGR = (Valor Final ÷ Valor Inicial)^(1 ÷ Años) − 1
          </div>
          <p>
            {es
              ? "Al evaluar gestores de fondos, comparar carteras o establecer expectativas de rentabilidad, usa siempre cifras anualizadas. La rentabilidad total sin una dimensión temporal dice muy poco."
              : "When evaluating fund managers, comparing portfolios, or setting return expectations, always use annualised figures. Total return without a time dimension tells you very little."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Volatilidad: La Medida de Riesgo Más Infravalorada" : "Volatility: The Most Underappreciated Risk Measure"}
          </h2>
          <p>
            {es
              ? "El riesgo, en sentido cuantitativo, se mide normalmente por la volatilidad, específicamente la desviación estándar de los rendimientos. Una cartera que rinde un 10% al año, cada año, es muy diferente de una que rinde un +40% un año y un −20% al siguiente, aunque la rentabilidad media sea idéntica. La segunda cartera exige aguantar caídas desgarradoras, y muchos inversores no pueden, o no lo hacen."
              : "Risk, in a quantitative sense, is typically measured by volatility — specifically the standard deviation of returns. A portfolio that returns 10% per year, every year, is very different from one that returns +40% one year and −20% the next, even if the average return is identical. The second portfolio requires you to hold on through gut-wrenching drawdowns, and many investors cannot — or do not."}
          </p>
          <p>
            {es
              ? "La volatilidad anualizada se calcula a partir de datos de rentabilidad diaria o mensual:"
              : "Annualised volatility is calculated from daily or monthly return data:"}
          </p>
          <div className="bg-[#0d1426] border border-gray-700 rounded-lg px-6 py-4 font-mono text-blue-300 text-sm">
            Volatilidad Anualizada = DesvEst(rentabilidades mensuales) × √12
          </div>
          <p>
            {es
              ? "Una cartera con una volatilidad anualizada del 8% es relativamente estable (piensa en un fondo multiactivo equilibrado). Una cartera con una volatilidad del 30% es extremadamente turbulenta (piensa en una cartera de renta variable concentrada o en una asignación a criptomonedas). Entender la volatilidad de tu cartera te ayuda a establecer expectativas realistas y a dimensionar las posiciones adecuadamente según tu tolerancia al riesgo."
              : "A portfolio with annualised volatility of 8% is relatively stable (think a balanced multi-asset fund). A portfolio with volatility of 30% is extremely turbulent (think a concentrated equity portfolio or a crypto allocation). Understanding your portfolio\u2019s volatility helps you set realistic expectations and size positions appropriately for your risk tolerance."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "El Ratio de Sharpe: Rentabilidad por Unidad de Riesgo" : "The Sharpe Ratio: Return per Unit of Risk"}
          </h2>
          <p>
            {es
              ? "El ratio de Sharpe es una de las métricas más utilizadas en la gestión profesional de carteras. Mide cuánta rentabilidad excedente obtienes por unidad de volatilidad asumida, es decir, con qué eficiencia convierte tu cartera el riesgo en rentabilidad."
              : "The Sharpe ratio is one of the most widely used metrics in professional portfolio management. It measures how much excess return you are earning per unit of volatility taken on — in other words, how efficiently your portfolio is converting risk into return."}
          </p>
          <div className="bg-[#0d1426] border border-gray-700 rounded-lg px-6 py-4 font-mono text-blue-300 text-sm">
            Ratio de Sharpe = (Rentabilidad de la Cartera − Tasa Libre de Riesgo) ÷ Volatilidad de la Cartera
          </div>
          <p>
            {es
              ? "La tasa libre de riesgo es normalmente el rendimiento actual de la deuda pública a corto plazo (por ejemplo, letras del Tesoro de EE. UU. a 3 meses). Un ratio de Sharpe por encima de 1,0 se considera generalmente bueno. Por encima de 2,0 es excepcional. Una cartera con un Sharpe de 0,3 está generando muy poca rentabilidad en relación con la volatilidad que estás experimentando."
              : "The risk-free rate is typically the current yield on short-term government bonds (e.g., US 3-month T-bills). A Sharpe ratio above 1.0 is generally considered good. Above 2.0 is exceptional. A portfolio with a Sharpe of 0.3 is generating very little return relative to the volatility you are experiencing."}
          </p>
          <p>
            {es
              ? "El ratio de Sharpe es especialmente útil para comparar dos carteras con perfiles de rentabilidad diferentes. Una cartera que rinde un 15% con un Sharpe de 0,6 ofrece un menor rendimiento ajustado al riesgo que una que rinde un 10% con un Sharpe de 1,2. Los números solos no cuentan esa historia: el ratio sí lo hace."
              : "The Sharpe ratio is particularly useful for comparing two portfolios with different return profiles. A portfolio returning 15% with a Sharpe of 0.6 is delivering less risk-adjusted performance than one returning 10% with a Sharpe of 1.2. The numbers alone do not tell that story — the ratio does."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Diversificación: La Correlación Lo Es Todo" : "Diversification: Correlation Is Everything"}
          </h2>
          <p>
            {es
              ? "El objetivo de la diversificación es mantener activos que no se muevan todos en la misma dirección al mismo tiempo. Cuando uno cae, otro se mantiene estable o sube. Esto reduce la volatilidad de la cartera sin reducir necesariamente la rentabilidad esperada, por eso la diversificación a veces se denomina el único almuerzo gratis en las finanzas."
              : "The whole point of diversification is to hold assets that do not all move in the same direction at the same time. When one falls, another holds steady or rises. This reduces portfolio volatility without necessarily reducing expected return — which is why diversification is sometimes called the only free lunch in finance."}
          </p>
          <p>
            {es
              ? "La correlación mide la proximidad con que se mueven dos activos, en una escala de −1 (perfectamente opuesta) a +1 (perfectamente sincronizada). Una cartera de 10 acciones altamente correlacionadas entre sí, por ejemplo 10 acciones tecnológicas de EE. UU., no proporciona prácticamente ninguna diversificación real. Podrías tener una sola. Una cartera que mezcla renta variable global, bonos, materias primas y activos reales con correlaciones más bajas entre sí proporciona una reducción de riesgo significativa."
              : "Correlation measures how closely two assets move together, on a scale from −1 (perfectly opposite) to +1 (perfectly in sync). A portfolio of 10 stocks that are all highly correlated with each other — say, 10 US tech stocks — provides almost no real diversification. You might as well hold one. A portfolio mixing global equities, bonds, commodities, and real assets with lower inter-correlations provides meaningful risk reduction."}
          </p>
          <p>
            {es
              ? "Patrones de correlación comunes que conviene conocer:"
              : "Common correlation patterns worth knowing:"}
          </p>
          <ul className="space-y-2 list-none pl-0">
            {es
              ? [
                  "Renta variable y deuda pública: correlación históricamente baja o negativa: los bonos suben cuando cae la renta variable (aunque esto se rompió en 2022)",
                  "Oro y renta variable: baja correlación, particularmente en entornos de aversión al riesgo: el oro suele mantener su valor cuando los mercados se venden",
                  "Inmobiliario y renta variable: correlación positiva moderada, más pronunciada durante las crisis financieras",
                  "Criptomonedas y renta variable: correlación positiva creciente a medida que ha aumentado la participación institucional",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))
              : [
                  "Equities and government bonds: historically low or negative correlation — bonds rise when equities fall (though this broke down in 2022)",
                  "Gold and equities: low correlation, particularly in risk-off environments — gold often holds value when markets sell off",
                  "Real estate and equities: moderate positive correlation, more so during financial crises",
                  "Crypto and equities: increasingly positive correlation as institutional participation has grown",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))}
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Asignación de Activos: La Decisión que Impulsa la Mayor Parte de Tu Rentabilidad" : "Asset Allocation: The Decision That Drives Most of Your Return"}
          </h2>
          <p>
            {es
              ? "La investigación muestra sistemáticamente que la asignación de activos —la combinación entre renta variable, bonos, efectivo y alternativos— explica la mayor parte de la variación de la rentabilidad de la cartera a lo largo del tiempo. La selección de valores importa marginalmente. La asignación de activos importa estructuralmente."
              : "Research consistently shows that asset allocation — the mix between equities, bonds, cash, and alternatives — explains the majority of portfolio return variation over time. Security selection matters at the margin. Asset allocation matters structurally."}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 pr-6 text-gray-400 font-medium">
                    {es ? "Clase de Activo" : "Asset Class"}
                  </th>
                  <th className="text-left py-3 pr-6 text-gray-400 font-medium">
                    {es ? "Rentabilidad Esperada" : "Expected Return"}
                  </th>
                  <th className="text-left py-3 text-gray-400 font-medium">
                    {es ? "Volatilidad Esperada" : "Expected Volatility"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {es
                  ? [
                      ["Renta Variable Global", "7–10% anual", "15–20%"],
                      ["Deuda Pública", "3–5% anual", "5–8%"],
                      ["Bonos Corporativos", "4–6% anual", "6–10%"],
                      ["Materias Primas", "3–6% anual", "15–25%"],
                      ["Efectivo", "3–5% anual", "~0%"],
                    ].map(([a, b, c]) => (
                      <tr key={a}>
                        <td className="py-3 pr-6 text-blue-300 font-medium">{a}</td>
                        <td className="py-3 pr-6 text-gray-300">{b}</td>
                        <td className="py-3 text-gray-300">{c}</td>
                      </tr>
                    ))
                  : [
                      ["Global Equities", "7–10% p.a.", "15–20%"],
                      ["Government Bonds", "3–5% p.a.", "5–8%"],
                      ["Corporate Bonds", "4–6% p.a.", "6–10%"],
                      ["Commodities", "3–6% p.a.", "15–25%"],
                      ["Cash", "3–5% p.a.", "~0%"],
                    ].map(([a, b, c]) => (
                      <tr key={a}>
                        <td className="py-3 pr-6 text-blue-300 font-medium">{a}</td>
                        <td className="py-3 pr-6 text-gray-300">{b}</td>
                        <td className="py-3 text-gray-300">{c}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-500">
            {es
              ? "Estimaciones a largo plazo. Los rendimientos reales variarán. No constituye una garantía de rentabilidad futura."
              : "Long-run estimates. Actual returns will vary. Not a guarantee of future performance."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Cómo Reequilibrar y Por Qué" : "How to Rebalance — and Why"}
          </h2>
          <p>
            {es
              ? "Con el tiempo, los activos que han tenido buen rendimiento crecerán para representar una mayor participación de tu cartera de la prevista. Una cartera originalmente fijada al 70% en renta variable y 30% en bonos puede derivar a 85/15 tras un fuerte mercado alcista de renta variable. Reequilibrar significa vender activos que han crecido más allá de su peso objetivo y comprar aquellos que han caído por debajo: sistemáticamente comprando barato y vendiendo caro."
              : "Over time, assets that have performed well will grow to represent a larger share of your portfolio than intended. A portfolio originally set at 70% equities and 30% bonds may drift to 85/15 after a strong equity bull market. Rebalancing means selling assets that have grown beyond their target weight and buying those that have fallen below — systematically buying low and selling high."}
          </p>
          <p>
            {es
              ? "La mayoría de los inversores reequilibran con un calendario fijo (anual o semestral) o cuando una clase de activo se desvía más de un umbral (por ejemplo, más de 5 puntos porcentuales respecto a su objetivo). Reequilibrar con demasiada frecuencia genera costes de transacción innecesarios. No reequilibrar nunca significa que tu perfil de riesgo se aleja de lo que pretendías."
              : "Most investors rebalance either on a calendar schedule (annually or semi-annually) or when an asset class drifts beyond a threshold (e.g., more than 5 percentage points from its target). Rebalancing too frequently incurs unnecessary transaction costs. Never rebalancing means your risk profile drifts away from what you intended."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Errores Comunes que Erosionan la Rentabilidad" : "Common Mistakes That Erode Returns"}
          </h2>
          <ul className="space-y-2 list-none pl-0">
            {es
              ? [
                  "Sobreconcentración: mantener más del 10–15% de una cartera en una sola acción o sector sin una razón deliberada",
                  "Sesgo doméstico: sobreponderar sistemáticamente el mercado del propio país, perdiendo la diversificación global",
                  "Ignorar las comisiones: una comisión anual del 1% parece trivial pero se capitaliza en una reducción de riqueza del 26% en 30 años",
                  "Perseguir el rendimiento reciente: rotar hacia activos después de que ya han subido, comprando caro y vendiendo barato al revés",
                  "Descuidar el reequilibrio: dejar que los ganadores deriven a ponderaciones excesivas, aumentando el riesgo por encima de tu nivel previsto",
                  "Confundir actividad con gestión: operar con frecuencia no es gestión de cartera: normalmente es ruido destructivo para el rendimiento",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))
              : [
                  "Overconcentration: holding more than 10–15% of a portfolio in a single stock or sector without a deliberate reason",
                  "Home bias: systematically overweighting your own country's market, missing global diversification",
                  "Ignoring fees: a 1% annual fee sounds trivial but compounds to a 26% reduction in wealth over 30 years",
                  "Chasing recent performance: rotating into assets after they have already run up, buying high and selling low in reverse",
                  "Neglecting rebalancing: letting winners drift to excessive weightings, increasing risk beyond your intended level",
                  "Confusing activity with management: frequent trading is not portfolio management — it is usually performance-destructive noise",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))}
          </ul>

          <p>
            {es
              ? "Un buen análisis de cartera no requiere software sofisticado. Requiere una medición consistente de la rentabilidad y el riesgo, una evaluación honesta de si tu asignación sigue reflejando tus objetivos y horizonte temporal, y la disciplina de reequilibrar en lugar de reaccionar. Esos tres hábitos, aplicados de forma consistente, superan a casi cualquier estrategia táctica a largo plazo."
              : "Good portfolio analysis does not require sophisticated software. It requires consistent measurement of return and risk, honest assessment of whether your allocation still reflects your goals and time horizon, and the discipline to rebalance rather than react. Those three habits — consistently applied — outperform almost any tactical strategy over the long run."}
          </p>

        </div>

        <ShareButtons
          url="https://www.financeplots.com/blog/investment-portfolio-analysis"
          title={es
            ? "Cómo Analizar Tu Cartera de Inversiones: Rentabilidad, Riesgo y Diversificación"
            : "How to Analyse Your Investment Portfolio: Return, Risk and Diversification"}
        />

        <div className="mt-14 bg-[#0d1426] border border-blue-700/40 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">
            {es ? "Analiza Tu Cartera Gratis — Sin Registro" : "Analyse Your Portfolio Free — No Signup"}
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            {es
              ? "Introduce tus posiciones y obtén rentabilidad, volatilidad, ratio de Sharpe y desglose de asignación al instante."
              : "Enter your holdings and get return, volatility, Sharpe ratio, and allocation breakdown instantly."}
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
