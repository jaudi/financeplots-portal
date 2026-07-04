import Link from "next/link";
import type { Metadata } from "next";
import ShareButtons from "@/components/ShareButtons";
import BlogArticleShell from "@/components/BlogArticleShell";

export const metadata: Metadata = {
  title: "Break-Even Analysis: The First Financial Calculation Every Business Owner Should Know | FinancePlots",
  description: "Fixed costs, variable costs, contribution margin and margin of safety — the break-even formula every founder and finance team should master.",
  openGraph: {
    title: "Break-Even Analysis: The First Financial Calculation Every Business Owner Should Know",
    description: "Fixed costs, variable costs, contribution margin and margin of safety — the break-even formula every founder and finance team should master.",
    url: "https://www.financeplots.com/blog/break-even-analysis-guide",
    siteName: "FinancePlots",
    type: "article",
    images: [{ url: "https://www.financeplots.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Break-Even Analysis: The First Financial Calculation Every Business Owner Should Know",
    description: "Fixed costs, variable costs, contribution margin and margin of safety — the break-even formula every founder and finance team should master.",
    images: ["https://www.financeplots.com/og-image.png"],
  },
  alternates: {
    canonical: "https://www.financeplots.com/blog/break-even-analysis-guide",
  },
};

type Props = { params: Promise<{ locale: string }> };

export default async function BreakEvenAnalysisGuide({ params }: Props) {
  const { locale } = await params;
  const es = locale === "es";

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: "{\"@context\":\"https://schema.org\",\"@type\":\"Article\",\"headline\":\"Break-Even Analysis: The First Financial Calculation Every Business Owner Should Know\",\"description\":\"Fixed costs, variable costs, contribution margin and margin of safety — the break-even formula every founder and finance team should master.\",\"url\":\"https://www.financeplots.com/blog/break-even-analysis-guide\",\"image\":\"https://www.financeplots.com/og-image.png\",\"author\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\"},\"publisher\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\",\"logo\":{\"@type\":\"ImageObject\",\"url\":\"https://www.financeplots.com/logo-sm.png\"}},\"mainEntityOfPage\":{\"@type\":\"WebPage\",\"@id\":\"https://www.financeplots.com/blog/break-even-analysis-guide\"}}" }} />
      <BlogArticleShell>

        <Link href="/blog" className="text-blue-400 text-sm hover:text-blue-300 transition mb-8 inline-block">
          {es ? "← Volver al Blog" : "← Back to Blog"}
        </Link>

        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
          {es ? "Finanzas para Pymes" : "Small Business Finance"}
        </span>
        <h1 className="text-4xl font-bold mt-2 mb-3 leading-tight">
          {es
            ? "Análisis del Punto de Equilibrio: El Primer Cálculo Financiero que Todo Empresario Debe Conocer"
            : "Break-Even Analysis: The First Financial Calculation Every Business Owner Should Know"}
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          {es ? "Marzo 2026 · 6 min de lectura" : "March 2026 · 6 min read"}
        </p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">

          <p>
            {es
              ? "Antes de abrir las puertas, lanzar un producto o contratar al primer empleado, hay un número que necesitas conocer: tu punto de equilibrio. Es el nivel de ingresos en el que tu empresa cubre todos sus costes y obtiene exactamente cero de beneficio. Todo lo que supere ese nivel es ganancia. Todo lo que quede por debajo es pérdida. Es el concepto financiero más fundamental en los negocios y, sin embargo, un número significativo de empresarios opera sin calcularlo nunca."
              : "Before you open your doors, launch a product, or hire your first employee, there is one number you need to know: your break-even point. It is the level of revenue at which your business covers all of its costs and makes exactly zero profit. Everything above it is profit. Everything below it is a loss. It is the most fundamental financial concept in business, and yet a significant number of business owners operate without ever calculating it."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Qué Significa Realmente el Punto de Equilibrio" : "What Break-Even Actually Means"}
          </h2>
          <p>
            {es
              ? "El punto de equilibrio es el nivel exacto de ventas —medido en unidades o en ingresos— en el que los ingresos totales igualan los costes totales. Por debajo del equilibrio, pierdes dinero. En el equilibrio, cubres todos los costes pero no ganas nada. Por encima del equilibrio, cada unidad adicional vendida genera beneficio puro."
              : "The break-even point is the exact level of sales — measured in units or in revenue — at which total revenue equals total costs. Below break-even, you are losing money. At break-even, you are covering every cost but making nothing. Above break-even, every additional unit sold generates pure profit."}
          </p>
          <p>
            {es
              ? "Comprender este umbral te aporta una claridad que la mayoría de las intuiciones operativas no pueden: ¿es viable el modelo de negocio con los precios actuales? ¿Cuántos clientes necesitas realmente? ¿Qué ocurre si sube el alquiler? ¿Y si bajas el precio un 10%?"
              : "Understanding this boundary gives you clarity that most operational intuition cannot: is the business model viable at current pricing? How many customers do you actually need? What happens if rent increases? What if you drop your price by 10%?"}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Costes Fijos vs Costes Variables" : "Fixed Costs vs Variable Costs"}
          </h2>
          <p>
            {es
              ? "El cálculo del punto de equilibrio depende de distinguir claramente dos tipos de costes."
              : "The break-even calculation depends on distinguishing two types of costs clearly."}
          </p>
          <p>
            {es
              ? <><span className="text-white font-medium">Los costes fijos</span> no cambian independientemente de cuánto vendas. Existen tanto si vendes una unidad como diez mil. Ejemplos: alquiler, salarios del personal fijo, seguros, suscripciones de software, pagos de préstamos y amortización de equipos. Estos costes son el suelo que debes superar antes de obtener cualquier beneficio.</>
              : <><span className="text-white font-medium">Fixed costs</span> do not change regardless of how much you sell. They exist whether you sell one unit or ten thousand. Examples: rent, salaries for permanent staff, insurance, software subscriptions, loan repayments, and depreciation on equipment. These costs are the floor you must clear before making any profit at all.</>}
          </p>
          <p>
            {es
              ? <><span className="text-white font-medium">Los costes variables</span> aumentan directamente con la producción. Cada unidad adicional vendida genera un coste adicional. Ejemplos: materias primas, embalaje, comisiones de procesamiento de pagos, costes de entrega y comisiones de ventas. Si no vendes nada, tus costes variables son cero. Si vendes 10.000 unidades, tus costes variables son 10.000 veces el coste por unidad.</>
              : <><span className="text-white font-medium">Variable costs</span> increase directly with output. Every additional unit sold incurs additional cost. Examples: raw materials, packaging, payment processing fees, delivery costs, and sales commissions. If you sell nothing, your variable costs are zero. If you sell 10,000 units, your variable costs are 10,000 times the cost per unit.</>}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "La Fórmula del Punto de Equilibrio" : "The Break-Even Formula"}
          </h2>
          <div className="bg-[#0d1426] border border-gray-700 rounded-lg px-6 py-4 font-mono text-blue-300 text-sm">
            {es
              ? "Punto de equilibrio (unidades) = Costes fijos ÷ (Precio de venta − Coste variable por unidad)"
              : "Break-Even (units) = Fixed Costs ÷ (Selling Price − Variable Cost per Unit)"}
          </div>
          <p>
            {es
              ? <> El denominador —precio de venta menos coste variable por unidad— se denomina <span className="text-white font-medium">margen de contribución</span>. Representa cuánto contribuye cada unidad vendida a cubrir los costes fijos y, eventualmente, a generar beneficio. Una vez que las contribuciones totales de todas las unidades vendidas igualan los costes fijos totales, has alcanzado el punto de equilibrio.</>
              : <> The denominator — selling price minus variable cost per unit — is called the <span className="text-white font-medium">contribution margin</span>. It represents how much each unit sold contributes toward covering fixed costs, and eventually toward profit. Once total contributions across all units sold equals total fixed costs, you have broken even.</>}
          </p>
          <p>
            {es
              ? "Para expresar el punto de equilibrio en ingresos en lugar de unidades:"
              : "To express break-even in revenue rather than units:"}
          </p>
          <div className="bg-[#0d1426] border border-gray-700 rounded-lg px-6 py-4 font-mono text-blue-300 text-sm">
            {es
              ? "Punto de equilibrio (ingresos) = Costes fijos ÷ Ratio de margen de contribución"
              : "Break-Even (revenue) = Fixed Costs ÷ Contribution Margin Ratio"}
          </div>
          <p>
            {es
              ? "Donde el ratio de margen de contribución = (Precio de venta − Coste variable) ÷ Precio de venta. Esto es útil cuando tu empresa vende múltiples productos a diferentes precios y no puede expresar fácilmente la producción en una sola unidad."
              : "Where the contribution margin ratio = (Selling Price − Variable Cost) ÷ Selling Price. This is useful when your business sells multiple products at different prices and cannot easily express output in a single unit."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Un Ejemplo Práctico: Una Pequeña Cafetería" : "A Practical Example: A Small Café"}
          </h2>
          <p>
            {es
              ? "Supongamos que gestionas una cafetería con la siguiente estructura de costes:"
              : "Suppose you run a café with the following cost structure:"}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 pr-6 text-gray-400 font-medium">
                    {es ? "Concepto" : "Item"}
                  </th>
                  <th className="text-left py-3 text-gray-400 font-medium">
                    {es ? "Importe" : "Amount"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {es
                  ? [
                      ["Alquiler mensual", "$3.000"],
                      ["Salarios del personal (fijos)", "$6.000"],
                      ["Seguros y suministros", "$800"],
                      ["Total costes fijos", "$9.800"],
                      ["Precio de venta medio por cliente", "$12,00"],
                      ["Coste variable medio por cliente", "$4,50"],
                      ["Margen de contribución por cliente", "$7,50"],
                    ].map(([a, b]) => (
                      <tr key={a}>
                        <td className="py-3 pr-6 text-blue-300 font-medium">{a}</td>
                        <td className="py-3 text-gray-300">{b}</td>
                      </tr>
                    ))
                  : [
                      ["Monthly rent", "$3,000"],
                      ["Staff wages (fixed)", "$6,000"],
                      ["Insurance &amp; utilities", "$800"],
                      ["Total fixed costs", "$9,800"],
                      ["Average selling price per customer", "$12.00"],
                      ["Average variable cost per customer", "$4.50"],
                      ["Contribution margin per customer", "$7.50"],
                    ].map(([a, b]) => (
                      <tr key={a}>
                        <td className="py-3 pr-6 text-blue-300 font-medium" dangerouslySetInnerHTML={{ __html: a }} />
                        <td className="py-3 text-gray-300">{b}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          <p>
            {es
              ? <>Punto de equilibrio = $9.800 ÷ $7,50 = <span className="text-white font-medium">1.307 clientes al mes</span>, o aproximadamente 44 clientes al día (asumiendo 30 días de operación). Ese es tu afluencia mínima viable antes de ganar un solo dólar de beneficio. Si actualmente atiendes a 35 clientes al día, tienes pérdidas. Si atiendes a 55, obtienes un beneficio de unos $75 al día.</>
              : <>Break-even = $9,800 ÷ $7.50 = <span className="text-white font-medium">1,307 customers per month</span>, or roughly 44 customers per day (assuming 30 operating days). That is your minimum viable footfall before you make a single dollar of profit. If you are currently serving 35 customers a day, you are loss-making. If you are serving 55, you are profitable by roughly $75 per day.</>}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Margen de Seguridad: ¿Cuánto Estás por Encima del Punto de Equilibrio?" : "Margin of Safety: How Far Above Break-Even Are You?"}
          </h2>
          <p>
            {es
              ? "El margen de seguridad te indica cuánto pueden caer tus ingresos antes de entrar en pérdidas. Se calcula así:"
              : "The margin of safety tells you how much your revenue can fall before you slip into a loss. It is calculated as:"}
          </p>
          <div className="bg-[#0d1426] border border-gray-700 rounded-lg px-6 py-4 font-mono text-blue-300 text-sm">
            {es
              ? "Margen de seguridad = (Ingresos reales − Ingresos en el punto de equilibrio) ÷ Ingresos reales × 100"
              : "Margin of Safety = (Actual Revenue − Break-Even Revenue) ÷ Actual Revenue × 100"}
          </div>
          <p>
            {es
              ? "Una empresa que genera $15.000 al mes con un punto de equilibrio de $9.800 tiene un margen de seguridad del 35%. Eso significa que los ingresos pueden caer hasta un 35% antes de que empiecen las pérdidas. Una empresa con un margen de seguridad de solo el 5% está peligrosamente al límite y tiene casi ningún colchón ante un mes flojo, un cliente perdido o un coste inesperado."
              : "A business generating $15,000 per month with a break-even of $9,800 has a margin of safety of 35%. That means revenue can fall by up to 35% before losses begin. A business with a margin of safety of only 5% is dangerously close to the edge and has almost no buffer against a slow month, a lost client, or an unexpected cost."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Cómo los Precios Cambian Drásticamente el Punto de Equilibrio" : "How Pricing Changes Break-Even Dramatically"}
          </h2>
          <p>
            {es
              ? "La palanca más poderosa en el análisis del punto de equilibrio es el precio de venta. Como el precio fluye íntegramente al margen de contribución, incluso un pequeño cambio de precio tiene un efecto desproporcionado sobre el volumen de equilibrio."
              : "The single most powerful lever in break-even analysis is selling price. Because price flows entirely into the contribution margin, even a small pricing change has an outsized effect on break-even volume."}
          </p>
          <p>
            {es
              ? "En el ejemplo de la cafetería: si el gasto medio sube de $12 a $14 (quizás mediante la venta adicional de un pastel), el margen de contribución crece de $7,50 a $9,50. El punto de equilibrio baja de 1.307 clientes a 1.032, una reducción del 21% en el volumen requerido con la misma base de costes fijos. Por eso la estrategia de precios es una de las decisiones de mayor palanca que toma un empresario."
              : "In the café example: if the average spend rises from $12 to $14 (perhaps by upselling a pastry), the contribution margin grows from $7.50 to $9.50. Break-even drops from 1,307 customers to 1,032 — a 21% reduction in required volume for the same fixed cost base. This is why pricing strategy is one of the highest-leverage decisions a business owner makes."}
          </p>
          <p>
            {es
              ? "Por el contrario, los descuentos tienen un efecto brutalmente amplificado en sentido contrario. Un recorte del 10% en el precio de un producto con un margen de contribución del 30% puede requerir un aumento del 50% en el volumen de unidades solo para mantener el mismo beneficio. Calcula siempre los números del punto de equilibrio antes de aceptar un descuento."
              : "Conversely, discounting has a brutally amplified effect in the opposite direction. A 10% price cut on a product with a 30% contribution margin can require a 50% increase in unit volume just to maintain the same profit. Always run the break-even numbers before agreeing to a discount."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Aplícalo a Cada Decisión Importante" : "Apply It to Every Major Decision"}
          </h2>
          <p>
            {es
              ? "El análisis del punto de equilibrio no debe ser un cálculo puntual. Es una herramienta para la toma de decisiones. Antes de añadir una nueva línea de productos, pregúntate: ¿cuál es el punto de equilibrio de este producto dado su coste fijo de desarrollo o puesta en marcha? Antes de contratar a un nuevo comercial, pregúntate: ¿qué ingresos adicionales necesita generar para cubrir su salario y costes asociados? Antes de firmar un nuevo contrato de arrendamiento, pregúntate: ¿cómo aumenta esto mi punto de equilibrio mensual y estoy seguro de poder alcanzarlo?"
              : "Break-even analysis should not be a one-time calculation. It is a decision-making tool. Before adding a new product line, ask: what is the break-even for this product given its fixed development or setup cost? Before hiring a new salesperson, ask: how much additional revenue do they need to generate to cover their salary and on-costs? Before signing a new lease, ask: how does this increase my monthly break-even, and am I confident I can hit it?"}
          </p>
          <ul className="space-y-2 list-none pl-0">
            {es
              ? [
                  "Lanzamiento de nuevo producto: establece un objetivo de unidades en el punto de equilibrio antes de comprometerte con la producción",
                  "Contratación: calcula la contribución de ingresos necesaria para justificar cada nueva incorporación",
                  "Decisiones de precios: modela el punto de equilibrio antes y después de cualquier cambio de precio",
                  "Expansión: comprende cómo una nueva ubicación cambia tu base total de costes fijos y el punto de equilibrio",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))
              : [
                  "New product launch: set a break-even unit target before committing to production",
                  "Hiring: calculate the revenue contribution needed to justify each new hire",
                  "Pricing decisions: model break-even before and after any price change",
                  "Expansion: understand how a new location changes your total fixed cost base and break-even",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))}
          </ul>

          <p>
            {es
              ? "El análisis del punto de equilibrio no te dirá todo sobre un negocio. Pero impone la disciplina de comprender la estructura de costes, los mecanismos de precios y los requisitos de volumen, los cimientos sobre los que debe construirse todo plan de negocio."
              : "Break-even analysis will not tell you everything about a business. But it forces the discipline of understanding cost structure, pricing mechanics, and volume requirements — the foundations on which every business plan should be built."}
          </p>

        </div>

        <ShareButtons
          url="https://www.financeplots.com/blog/break-even-analysis-guide"
          title={es
            ? "Análisis del Punto de Equilibrio: El Primer Cálculo Financiero que Todo Empresario Debe Conocer"
            : "Break-Even Analysis: The First Financial Calculation Every Business Owner Should Know"}
        />

        <div className="mt-14 bg-[#0d1426] border border-blue-700/40 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">
            {es ? "Calcula Tu Punto de Equilibrio Gratis" : "Calculate Your Break-Even Point Free"}
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            {es
              ? "Introduce tus costes fijos, costes variables y precio: obtén tu punto de equilibrio y margen de seguridad al instante."
              : "Enter your fixed costs, variable costs, and price — get your break-even point and margin of safety instantly."}
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
