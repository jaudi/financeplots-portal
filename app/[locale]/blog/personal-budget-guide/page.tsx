import Link from "next/link";
import type { Metadata } from "next";
import ShareButtons from "@/components/ShareButtons";
import BlogArticleShell from "@/components/BlogArticleShell";

export const metadata: Metadata = {
  title: "How to Build a Personal Budget That Actually Works | FinancePlots",
  description: "Most people try to budget and give up within a month. Here is a simple, honest framework for taking control of your money — income, expenses, savings rate, and what to do first.",
  openGraph: {
    title: "How to Build a Personal Budget That Actually Works",
    description: "Most people try to budget and give up within a month. Here is a simple, honest framework for taking control of your money — income, expenses, savings rate, and what to do first.",
    url: "https://www.financeplots.com/blog/personal-budget-guide",
    siteName: "FinancePlots",
    type: "article",
    images: [{ url: "https://www.financeplots.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Build a Personal Budget That Actually Works",
    description: "Most people try to budget and give up within a month. Here is a simple, honest framework for taking control of your money — income, expenses, savings rate, and what to do first.",
    images: ["https://www.financeplots.com/og-image.png"],
  },
  alternates: {
    canonical: "https://www.financeplots.com/blog/personal-budget-guide",
  },
};

type Props = { params: Promise<{ locale: string }> };

export default async function PersonalBudgetGuide({ params }: Props) {
  const { locale } = await params;
  const es = locale === "es";

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: "{\"@context\":\"https://schema.org\",\"@type\":\"Article\",\"headline\":\"How to Build a Personal Budget That Actually Works\",\"description\":\"Most people try to budget and give up within a month. Here is a simple, honest framework for taking control of your money — income, expenses, savings rate, and what to do first.\",\"url\":\"https://www.financeplots.com/blog/personal-budget-guide\",\"image\":\"https://www.financeplots.com/og-image.png\",\"author\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\"},\"publisher\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\",\"logo\":{\"@type\":\"ImageObject\",\"url\":\"https://www.financeplots.com/logo-sm.png\"}},\"mainEntityOfPage\":{\"@type\":\"WebPage\",\"@id\":\"https://www.financeplots.com/blog/personal-budget-guide\"}}" }} />
      <BlogArticleShell>

        <Link href="/blog" className="text-blue-400 text-sm hover:text-blue-300 transition mb-8 inline-block">
          {es ? "← Volver al Blog" : "← Back to Blog"}
        </Link>

        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
          {es ? "Finanzas Personales" : "Personal Finance"}
        </span>
        <h1 className="text-4xl font-bold mt-2 mb-3 leading-tight">
          {es
            ? "Cómo Construir un Presupuesto Personal que Realmente Funcione"
            : "How to Build a Personal Budget That Actually Works"}
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          {es ? "Marzo 2026 · 7 min de lectura" : "March 2026 · 7 min read"}
        </p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">

          <p>
            {es
              ? "La mayoría de las personas han intentado hacer un presupuesto al menos una vez. La mayoría también lo han abandonado en un mes. No porque presupuestar sea complicado —no lo es— sino porque la forma en que la mayoría de la gente lo aborda hace que parezca un castigo en lugar de una herramienta. Un presupuesto personal no consiste en restringir lo que disfrutas. Consiste en entender a dónde va tu dinero para poder tomar decisiones deliberadas sobre lo que te importa."
              : "Most people have tried to budget at least once. Most have also stopped within a month. Not because budgeting is complicated — it is not — but because the way most people approach it makes it feel like a punishment rather than a tool. A personal budget is not about restricting what you enjoy. It is about understanding where your money goes so you can make deliberate choices about what matters to you."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Empieza por Tus Ingresos Netos, No por Tu Salario Bruto" : "Start With Your Net Income, Not Your Salary"}
          </h2>
          <p>
            {es
              ? "El primer número de cualquier presupuesto es tu salario neto: lo que realmente llega a tu cuenta bancaria después de impuestos, cotizaciones a la Seguridad Social, aportaciones a la pensión y cualquier otra deducción. Este es tu punto de partida real. Usar tu salario bruto inflará todos los cálculos posteriores y te dará una falsa sensación de lo que tienes disponible para gastar."
              : "The first number in any budget is your take-home pay — what actually lands in your bank account after tax, National Insurance, pension contributions, and any other deductions. This is your real starting point. Using your gross salary will inflate every calculation that follows and give you a false sense of what you have available to spend."}
          </p>
          <p>
            {es
              ? "Si tus ingresos varían de mes a mes, por trabajo freelance, comisiones u horas irregulares, usa una estimación conservadora basada en tus meses más bajos recientes. Es mejor presupuestar con un mínimo y tener una grata sorpresa que planificar con un máximo y quedarse corto."
              : "If your income varies month to month — freelance work, commission, irregular hours — use a conservative estimate based on your lowest recent months. It is better to budget against a floor and be pleasantly surprised than to plan around a peak and run short."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Los Tres Cubos: Fijo, Variable y Ahorro" : "The Three Buckets: Fixed, Variable, and Savings"}
          </h2>
          <p>
            {es
              ? "Todo presupuesto personal funciona mejor cuando organizas el gasto en tres cubos:"
              : "Every personal budget works best when you organise spending into three buckets:"}
          </p>
          <ul className="space-y-3 list-none pl-0">
            {es
              ? [
                  ["Gastos fijos", "Costes que son los mismos cada mes y en gran medida no negociables. Alquiler o hipoteca, primas de seguros, contrato de teléfono, suscripciones, pagos de préstamos. Estos impactan en tu cuenta tanto si haces algo como si no."],
                  ["Gastos variables", "Costes que fluctúan según el comportamiento. Compra, restaurantes, transporte, entretenimiento, ropa, vacaciones. Aquí es donde realmente viven la mayoría de tus decisiones de presupuesto."],
                  ["Ahorro e inversiones", "La cantidad que apartas antes de gastar libremente. No lo que sobra al final del mes, sino lo que sacas de tu cuenta corriente al principio."],
                ].map(([title, desc]) => (
                  <li key={title as string} className="flex gap-3">
                    <span className="text-blue-400 mt-0.5 shrink-0">→</span>
                    <span><span className="text-white font-medium">{title as string}:</span> {desc as string}</span>
                  </li>
                ))
              : [
                  ["Fixed expenses", "Costs that are the same every month and largely non-negotiable. Rent or mortgage, insurance premiums, phone contract, subscriptions, loan repayments. These hit your account whether you do anything or not."],
                  ["Variable expenses", "Costs that fluctuate based on behaviour. Groceries, dining out, transport, entertainment, clothing, holidays. These are where most of your budgeting decisions actually live."],
                  ["Savings and investments", "The amount you set aside before you spend freely. Not what's left over at the end of the month — what you move out of your current account at the start of it."],
                ].map(([title, desc]) => (
                  <li key={title as string} className="flex gap-3">
                    <span className="text-blue-400 mt-0.5 shrink-0">→</span>
                    <span><span className="text-white font-medium">{title as string}:</span> {desc as string}</span>
                  </li>
                ))}
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "La Regla 50/30/20 — Un Punto de Partida Útil" : "The 50/30/20 Rule — A Useful Starting Point"}
          </h2>
          <p>
            {es
              ? "Si estás construyendo un presupuesto desde cero y quieres un marco con el que empezar, la regla 50/30/20 es ampliamente utilizada:"
              : "If you are building a budget from scratch and want a framework to start with, the 50/30/20 rule is widely used:"}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 pr-6 text-gray-400 font-medium">
                    {es ? "Categoría" : "Category"}
                  </th>
                  <th className="text-left py-3 pr-6 text-gray-400 font-medium">
                    {es ? "% de Ingresos Netos" : "% of Net Income"}
                  </th>
                  <th className="text-left py-3 text-gray-400 font-medium">
                    {es ? "Qué cubre" : "What it covers"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {es
                  ? [
                      ["Necesidades", "50%", "Alquiler, suministros, alimentación, transporte, seguros"],
                      ["Deseos", "30%", "Restaurantes, entretenimiento, vacaciones, hobbies"],
                      ["Ahorro y deudas", "20%", "Fondo de emergencia, inversiones, pagos extra de deudas"],
                    ].map(([cat, pct, desc]) => (
                      <tr key={cat as string}>
                        <td className="py-3 pr-6 text-blue-300 font-medium">{cat as string}</td>
                        <td className="py-3 pr-6 text-white font-semibold">{pct as string}</td>
                        <td className="py-3 text-gray-400">{desc as string}</td>
                      </tr>
                    ))
                  : [
                      ["Needs", "50%", "Rent, utilities, food, transport, insurance"],
                      ["Wants", "30%", "Dining out, entertainment, holidays, hobbies"],
                      ["Savings & debt repayment", "20%", "Emergency fund, investments, extra debt payments"],
                    ].map(([cat, pct, desc]) => (
                      <tr key={cat as string}>
                        <td className="py-3 pr-6 text-blue-300 font-medium">{cat as string}</td>
                        <td className="py-3 pr-6 text-white font-semibold">{pct as string}</td>
                        <td className="py-3 text-gray-400">{desc as string}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          <p>
            {es
              ? "Esto es una orientación, no una regla. Si vives en Madrid o en otra ciudad cara, la vivienda sola puede consumir más del 50% de tus ingresos y eso está bien: el marco se ajusta. El valor no está en alcanzar porcentajes exactos sino en hacerte reflexionar sobre las proporciones y si estás cómodo con ellas."
              : "This is a guideline, not a rule. If you live in London or another expensive city, housing alone may consume more than 50% of your income and that is fine — the framework adjusts. The value is not in hitting exact percentages but in making you think about the proportions and whether you are comfortable with them."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Tu Tasa de Ahorro Es el Número que Más Importa" : "Your Savings Rate Is the Number That Matters Most"}
          </h2>
          <p>
            {es
              ? "Si hay una métrica que seguir en un presupuesto personal, es tu tasa de ahorro: el porcentaje de tus ingresos netos que ahorras o inviertes cada mes. Este único número te dice más sobre tu trayectoria financiera que cualquier otro."
              : "If there is one metric to track in a personal budget, it is your savings rate — the percentage of your net income you save or invest each month. This single number tells you more about your financial trajectory than any other."}
          </p>
          <div className="bg-[#0d1426] border border-gray-700 rounded-lg px-6 py-4 font-mono text-blue-300 text-sm">
            {es
              ? "Tasa de Ahorro = (Ahorro Mensual ÷ Ingresos Netos Mensuales) × 100"
              : "Savings Rate = (Monthly Savings ÷ Net Monthly Income) × 100"}
          </div>
          <p>
            {es
              ? "Una tasa de ahorro del 10% significa que aproximadamente 9 años de trabajo financian 1 año de jubilación. Una tasa de ahorro del 30% acorta drásticamente esa proporción. Una tasa de ahorro del 50%, alcanzada por muchos en el movimiento de independencia financiera, significa que cada año de trabajo financia aproximadamente un año de libertad financiera."
              : "A savings rate of 10% means roughly 9 years of work funds 1 year of retirement. A savings rate of 30% shortens that ratio dramatically. A savings rate of 50% — achieved by many in the financial independence movement — means every year of work funds roughly a year of financial freedom."}
          </p>
          <p>
            {es
              ? "La mayoría de los asesores financieros sugieren apuntar a al menos el 15–20% de los ingresos netos en ahorro e inversiones. Si partes de cero, incluso el 5% de forma constante es una mejor base que depósitos grandes irregulares."
              : "Most financial advisers suggest targeting at least 15–20% of net income in savings and investments. If you are starting from zero, even 5% consistently is a better foundation than irregular large deposits."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Págate Primero a Ti Mismo" : "Pay Yourself First"}
          </h2>
          <p>
            {es
              ? "El comportamiento de presupuestación más fiable es también el más sencillo: transfiere tu objetivo de ahorro a una cuenta separada el día de cobro, antes de gastar nada. No ahorres lo que queda al final del mes: rara vez queda algo. Configura una orden permanente para que ocurra automáticamente."
              : "The most reliable budgeting behaviour is also the simplest: move your savings target to a separate account on payday, before you spend anything. Do not save what is left at the end of the month — there is rarely anything left. Set up a standing order so it happens automatically."}
          </p>
          <p>
            {es
              ? "Cuando el ahorro se vuelve automático, tu mente se ajusta a gastar el resto. Dejas de echar de menos el dinero que no está en tu cuenta corriente. Este único hábito —pagarte primero a ti mismo— tiene más impacto en los resultados financieros a largo plazo que cualquier hoja de cálculo o aplicación."
              : "When savings become automatic, your brain adjusts to spending the remainder. You stop missing the money that is not in your current account. This single habit — paying yourself first — has more impact on long-term financial outcomes than any spreadsheet or app."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Registra el Gasto Durante un Mes Antes de Presupuestar" : "Track Spending for One Month Before You Budget"}
          </h2>
          <p>
            {es
              ? "La mayoría de la gente subestima significativamente lo que gasta en categorías variables. Antes de construir un presupuesto con números objetivo, dedica un mes simplemente a registrar el gasto real sin cambiar nada. Mira tus extractos bancarios. Clasifica cada transacción. El resultado suele ser revelador, y en ocasiones incómodo."
              : "Most people significantly underestimate what they spend on variable categories. Before building a budget with target numbers, spend one month simply tracking actual expenditure without changing anything. Look at your bank statements. Categorise every transaction. The result is usually illuminating — and occasionally uncomfortable."}
          </p>
          <p>
            {es
              ? "Las sorpresas habituales incluyen: cuánto va en comida y café, cuántas suscripciones están funcionando en segundo plano que habías olvidado, y con qué frecuencia las pequeñas compras discrecionales se acumulan en un total mensual significativo. No puedes construir un presupuesto realista sin datos de referencia honestos."
              : "Common surprises include: how much goes on food and coffee, how many subscriptions are running in the background that you had forgotten about, and how often small discretionary purchases accumulate into a material monthly total. You cannot build a realistic budget without honest baseline data."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Incluye una Categoría de Gastos Imprevistos" : "Build in a Miscellaneous Category"}
          </h2>
          <p>
            {es
              ? "Todo presupuesto necesita un cajón de sastre para gastos irregulares e impredecibles: reparaciones del coche, gastos médicos, regalos de cumpleaños, suscripciones anuales, mantenimiento del hogar. Si no los contabilizas, seguirán saltándose tus números mensuales y harán que tu presupuesto parezca que falla cuando no es así."
              : "Every budget needs a catch-all for irregular and unpredictable spending — car repairs, medical expenses, birthday presents, annual subscriptions, home maintenance. If you do not account for these, they will continuously blow up your monthly numbers and make your budget feel like it is failing when it is not."}
          </p>
          <p>
            {es
              ? "Un enfoque práctico: calcula tu gasto irregular anual medio, divídelo entre 12 y reserva esa cantidad cada mes en un fondo dedicado. Cuando llegan los costes irregulares, los sacas de ese fondo en lugar de tu presupuesto de gasto principal. El presupuesto se mantiene intacto; los gastos irregulares simplemente se prefinancian."
              : "A practical approach: calculate your average annual irregular spend, divide by 12, and set that amount aside each month into a dedicated pot. When irregular costs hit, you draw from that pot rather than from your main spending budget. The budget stays intact; the irregular expenses are simply pre-funded."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Revisa Mensualmente, Actualiza Trimestralmente" : "Review Monthly, Revise Quarterly"}
          </h2>
          <p>
            {es
              ? "Un presupuesto no es un documento estático. Revisa tus datos reales frente al presupuesto al final de cada mes: tarda diez minutos y te dice exactamente dónde te estás desviando. Revisa el propio presupuesto cada trimestre, o siempre que tus circunstancias cambien significativamente: nuevo trabajo, nuevo piso, cambio en la relación, aumento de sueldo."
              : "A budget is not a static document. Review your actuals against budget at the end of each month — it takes ten minutes and tells you exactly where you are drifting. Revise the budget itself every quarter, or whenever your circumstances change significantly: new job, new flat, relationship change, pay rise."}
          </p>
          <p>
            {es
              ? "El objetivo no es la perfección. Algunos meses te pasarás en vacaciones o tendrás una factura inesperada. El valor de un presupuesto no es que evite toda desviación: es que te da una referencia a la que volver y visibilidad sobre si tu dirección financiera es la que realmente quieres."
              : "The goal is not perfection. Some months you will overspend on holidays or have an unexpected bill. The value of a budget is not that it prevents every deviation — it is that it gives you a baseline to return to, and visibility into whether your financial direction is the one you actually want."}
          </p>

        </div>

        <ShareButtons
          url="https://www.financeplots.com/blog/personal-budget-guide"
          title={es
            ? "Cómo Construir un Presupuesto Personal que Realmente Funcione"
            : "How to Build a Personal Budget That Actually Works"}
        />

        <div className="mt-14 bg-[#0d1426] border border-blue-700/40 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">
            {es ? "Construye Tu Presupuesto Personal Gratis" : "Build Your Personal Budget Free"}
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            {es
              ? "Introduce tus ingresos y gastos: ve tu tasa de ahorro, desglose de gasto y análisis por categorías al instante."
              : "Enter your income and expenses — see your savings rate, spending breakdown, and category analysis instantly."}
          </p>
          <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition inline-block">
            {es ? "Abrir Herramientas Financieras" : "Open Personal Budget Tool"}
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
