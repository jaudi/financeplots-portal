import Link from "next/link";
import type { Metadata } from "next";
import ShareButtons from "@/components/ShareButtons";
import BlogArticleShell from "@/components/BlogArticleShell";

export const metadata: Metadata = {
  title: "How to Build an Annual Budget That Your Finance Team Will Actually Use | FinancePlots",
  description: "Most company budgets fail because they are set once and ignored. Learn zero-based budgeting, rolling forecasts, and how to get department buy-in.",
  openGraph: {
    title: "How to Build an Annual Budget That Your Finance Team Will Actually Use",
    description: "Most company budgets fail because they are set once and ignored. Learn zero-based budgeting, rolling forecasts, and how to get department buy-in.",
    url: "https://www.financeplots.com/blog/annual-budget-guide",
    siteName: "FinancePlots",
    type: "article",
    images: [{ url: "https://www.financeplots.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Build an Annual Budget That Your Finance Team Will Actually Use",
    description: "Most company budgets fail because they are set once and ignored. Learn zero-based budgeting, rolling forecasts, and how to get department buy-in.",
    images: ["https://www.financeplots.com/og-image.png"],
  },
  alternates: {
    canonical: "https://www.financeplots.com/blog/annual-budget-guide",
  },
};

type Props = { params: Promise<{ locale: string }> };

export default async function AnnualBudgetGuide({ params }: Props) {
  const { locale } = await params;
  const es = locale === "es";

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: "{\"@context\":\"https://schema.org\",\"@type\":\"Article\",\"headline\":\"How to Build an Annual Budget That Your Finance Team Will Actually Use\",\"description\":\"Most company budgets fail because they are set once and ignored. Learn zero-based budgeting, rolling forecasts, and how to get department buy-in.\",\"url\":\"https://www.financeplots.com/blog/annual-budget-guide\",\"image\":\"https://www.financeplots.com/og-image.png\",\"author\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\"},\"publisher\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\",\"logo\":{\"@type\":\"ImageObject\",\"url\":\"https://www.financeplots.com/logo-sm.png\"}},\"mainEntityOfPage\":{\"@type\":\"WebPage\",\"@id\":\"https://www.financeplots.com/blog/annual-budget-guide\"}}" }} />
      <BlogArticleShell>

        <Link href="/blog" className="text-blue-400 text-sm hover:text-blue-300 transition mb-8 inline-block">
          {es ? "← Volver al Blog" : "← Back to Blog"}
        </Link>

        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
          {es ? "Finanzas Corporativas" : "Corporate Finance"}
        </span>
        <h1 className="text-4xl font-bold mt-2 mb-3 leading-tight">
          {es
            ? "Cómo Construir un Presupuesto Anual que Tu Equipo Financiero Realmente Use"
            : "How to Build an Annual Budget That Your Finance Team Will Actually Use"}
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          {es ? "Marzo 2026 · 7 min de lectura" : "March 2026 · 7 min read"}
        </p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">

          <p>
            {es
              ? "La mayoría de los presupuestos empresariales se construyen en noviembre, se aprueban en diciembre y se ignoran silenciosamente en febrero. En el segundo trimestre no guardan ningún parecido con la realidad y en el tercero nadie recuerda qué supuestos se hicieron. El proceso de presupuestación anual es uno de los ejercicios más laboriosos en las finanzas corporativas y uno de los más frecuentemente desperdiciados. El problema rara vez son los números. Es el proceso, la estructura y la falta de responsabilidad."
              : "Most company budgets are built in November, approved in December, and quietly ignored by February. By Q2 they bear no resemblance to reality, and by Q3 nobody can remember what they assumed. The annual budget process is one of the most time-consuming exercises in corporate finance — and one of the most frequently wasted. The problem is rarely the numbers. It is the process, the structure, and the lack of ownership."}
          </p>
          <p>
            {es
              ? "Aquí se explica cómo construir un presupuesto que siga siendo útil durante todo el año."
              : "Here is how to build a budget that remains useful throughout the year."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Por Qué Fracasan la Mayoría de los Presupuestos" : "Why Most Budgets Fail"}
          </h2>
          <ul className="space-y-2 list-none pl-0">
            {es
              ? [
                  "Fijado una vez, nunca actualizado: un presupuesto bloqueado en diciembre no puede anticipar un nuevo competidor, una interrupción en la cadena de suministro o una gran captación de clientes en marzo",
                  "Demasiado descendente: cuando el CEO fija objetivos de ingresos y los responsables de departamento simplemente retroingeniería los costes para ajustarse, el presupuesto refleja una negociación política más que la realidad operativa",
                  "Demasiado granular: los presupuestos de 400 líneas que tardan meses en construirse son imposibles de mantener. La complejidad se convierte en una excusa para no actualizar",
                  "Sin rendición de cuentas: si nadie es responsable de una línea presupuestaria, nadie la defiende y las variaciones se explican en lugar de actuarse sobre ellas",
                  "Tratado como un techo en lugar de una guía: en el momento en que un presupuesto se convierte en una restricción que gestionar en lugar de una herramienta para navegar, deja de ser útil",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))
              : [
                  "Set once, never updated: a budget locked in December cannot anticipate a new competitor, a supply chain shock, or a large client win in March",
                  "Too top-down: when the CEO sets revenue targets and department heads simply reverse-engineer costs to fit, the budget reflects political negotiation rather than operational reality",
                  "Too granular: 400-line budgets that take months to build are impossible to maintain. Complexity becomes an excuse not to update",
                  "No accountability: if no one owns a budget line, no one defends it — and variances get explained away rather than acted on",
                  "Treated as a ceiling rather than a guide: the moment a budget becomes a constraint to game rather than a tool to navigate, it stops being useful",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))}
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Presupuestación Base Cero vs Presupuestación Incremental" : "Zero-Based vs Incremental Budgeting"}
          </h2>
          <p>
            {es
              ? "Existen dos filosofías dominantes para construir un presupuesto, y la elección correcta depende del contexto de tu negocio."
              : "There are two dominant philosophies for how to construct a budget, and the right choice depends on your business context."}
          </p>
          <p>
            {es
              ? <><span className="text-white font-medium">La presupuestación incremental</span> toma los datos reales del año anterior como punto de partida y aplica ajustes: normalmente un aumento por inflación en los costes y una tasa de crecimiento en los ingresos. Es rápida e intuitiva. La debilidad es que incorpora todas las ineficiencias del año anterior. Las líneas presupuestarias que han agotado su utilidad sobreviven simplemente porque existían antes. Con el tiempo, la presupuestación incremental acumula residuos.</>
              : <><span className="text-white font-medium">Incremental budgeting</span> takes last year&apos;s actuals as the starting point and applies adjustments — typically an inflation uplift on costs and a growth rate on revenue. It is fast and intuitive. The weakness is that it embeds all of last year&apos;s inefficiencies. Budget lines that have outlived their purpose survive simply because they existed before. Over time, incremental budgeting accumulates waste.</>}
          </p>
          <p>
            {es
              ? <><span className="text-white font-medium">La presupuestación base cero (ZBB)</span> parte de cero. Cada línea de costes debe justificarse desde cero: ¿para qué sirve, qué entrega y es la forma más rentable de alcanzar ese objetivo? El ZBB es más riguroso y suele revelar ahorros significativos, pero también requiere sustancialmente más tiempo. Funciona mejor en organizaciones grandes con bases de costes establecidas que han crecido sin suficiente escrutinio, o cuando una empresa está llevando a cabo una reestructuración importante.</>
              : <><span className="text-white font-medium">Zero-based budgeting (ZBB)</span> starts from zero. Every cost line must be justified from scratch — what is it for, what does it deliver, and is it the most cost-effective way to achieve that outcome? ZBB is more rigorous and often surfaces significant savings, but it is also substantially more time-intensive. It works best in large organisations with established cost bases that have grown without sufficient scrutiny, or when a business is undertaking a major restructuring.</>}
          </p>
          <p>
            {es
              ? "Para la mayoría de las empresas en crecimiento, un enfoque híbrido es práctico: usa la presupuestación incremental para la mayoría de los costes operativos, pero aplica la lógica base cero a tus tres o cuatro categorías de costes más grandes cada año, rotando cuáles examinas."
              : "For most growing businesses, a hybrid approach is practical: use incremental budgeting for most operational costs, but apply zero-based logic to your three or four largest cost categories each year, rotating which ones you scrutinise."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Cómo Estructurar un Presupuesto Anual" : "How to Structure an Annual Budget"}
          </h2>
          <p>
            {es
              ? "Un presupuesto bien estructurado tiene secciones claras que reflejan la P&L:"
              : "A well-structured budget has clear sections that mirror the P&amp;L:"}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 pr-6 text-gray-400 font-medium">
                    {es ? "Sección" : "Section"}
                  </th>
                  <th className="text-left py-3 text-gray-400 font-medium">
                    {es ? "Qué Incluir" : "What to Include"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {es
                  ? [
                      ["Ingresos por producto/segmento", "Desglosa los ingresos por línea de producto, geografía o segmento de clientes. No modeles los ingresos totales en una sola línea: necesitas visibilidad sobre qué los impulsa"],
                      ["Costes de personal", "El mayor coste para la mayoría de las empresas. Modela por función: salario, cotizaciones empresariales, beneficios y costes de reclutamiento. Incluye las nuevas incorporaciones planificadas con fechas de inicio"],
                      ["OpEx por departamento", "Gasto de marketing, suscripciones de software, viajes, honorarios profesionales, costes de oficina: gestionados por el responsable del departamento correspondiente"],
                      ["Inversión en capital", "Compras planificadas de equipos, mejoras del local o infraestructura tecnológica. Separadas de los costes operativos"],
                      ["Costes de financiación", "Intereses sobre la deuda existente, disposiciones planificadas y reembolsos"],
                    ].map(([a, b]) => (
                      <tr key={a}>
                        <td className="py-3 pr-6 text-blue-300 font-medium">{a}</td>
                        <td className="py-3 text-gray-300">{b}</td>
                      </tr>
                    ))
                  : [
                      ["Revenue by product/segment", "Break revenue down by product line, geography, or customer segment. Do not model total revenue as a single line — you need visibility into what is driving it"],
                      ["Headcount costs", "The largest cost for most businesses. Model by role: salary, employer taxes, benefits, and recruiting costs. Include planned new hires with start dates"],
                      ["Department OpEx", "Marketing spend, software subscriptions, travel, professional fees, office costs — owned by the relevant department head"],
                      ["Capital expenditure", "Planned purchases of equipment, leasehold improvements, or technology infrastructure. Separate from operating costs"],
                      ["Financing costs", "Interest on existing debt, planned drawdowns, and repayments"],
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
              ? "Cada sección debe consolidarse limpiamente en beneficio bruto, EBITDA y beneficio neto, coincidiendo con la estructura de tus cuentas de gestión para que la comparación entre presupuesto y datos reales sea sencilla."
              : "Each section should roll up cleanly to gross profit, EBITDA, and net profit — matching the structure of your management accounts so that budget-versus-actual comparison is straightforward."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Previsiones Continuas: Lo Mejor de Ambos Mundos" : "Rolling Forecasts: The Best of Both Worlds"}
          </h2>
          <p>
            {es
              ? "La limitación de un presupuesto anual estático es que envejece. En el tercer trimestre, los supuestos del presupuesto de enero pueden estar completamente obsoletos. Una previsión continua resuelve esto actualizando permanentemente la visión hacia adelante."
              : "The limitation of a static annual budget is that it ages. By Q3, the assumptions behind January\u2019s budget may be completely obsolete. A rolling forecast solves this by continuously updating the forward view."}
          </p>
          <p>
            {es
              ? "Un enfoque habitual es la previsión continua a 12 meses: cada mes, amplías el horizonte de previsión un mes, incorporas los datos reales más recientes y revisas los supuestos futuros basándote en lo que sabes ahora. El presupuesto anual permanece como objetivo fijo para el año: tu ancla de rendición de cuentas. La previsión continua es la visión viva de hacia dónde te diriges realmente."
              : "A common approach is the 12-month rolling forecast: each month, you extend the forecast horizon by one month, incorporate the most recent actuals, and revise forward assumptions based on what you now know. The annual budget remains as the fixed target for the year — your accountability anchor. The rolling forecast is the living view of where you are actually headed."}
          </p>
          <p>
            {es
              ? "Los dos tienen finalidades diferentes. El presupuesto responde: ¿a qué nos comprometimos a lograr este año? La previsión continua responde: dado lo que sabemos hoy, ¿dónde acabaremos realmente? La brecha entre ambos es donde deben producirse las decisiones de gestión."
              : "The two serve different purposes. The budget answers: what did we commit to achieving this year? The rolling forecast answers: given what we know today, where will we actually land? The gap between the two is where management decisions need to happen."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Presupuesto vs Real: Análisis de Variaciones" : "Budget vs Actual: Variance Analysis"}
          </h2>
          <p>
            {es
              ? "El valor real de un presupuesto no está en la planificación, sino en la comparación. Cada mes, tus cuentas de gestión deben mostrar el presupuesto, los datos reales y la variación de cada partida material. El análisis de variaciones te obliga a responder: ¿por qué difirió esto y cambia nuestra visión futura?"
              : "The real value of a budget is not in the planning — it is in the comparison. Every month, your management accounts should show budget, actual, and variance for every material line item. Variance analysis forces you to answer: why did this differ, and does it change our forward view?"}
          </p>
          <p>
            {es
              ? <>Hay dos tipos de variaciones. Las <span className="text-white font-medium">variaciones de calendario</span> —un coste presupuestado en marzo que cayó en abril— se resuelven solas con el tiempo y no requieren ninguna acción. Las <span className="text-white font-medium">variaciones estructurales</span> —los ingresos que sistemáticamente se sitúan un 15% por debajo del presupuesto— indican que los supuestos subyacentes eran erróneos y requieren una respuesta: un plan revisado, una acción acelerada o una conversación con el consejo.</>
              : <>There are two types of variance. <span className="text-white font-medium">Timing variances</span> — a cost was budgeted in March but fell in April — resolve themselves over time and require no action. <span className="text-white font-medium">Structural variances</span> — revenue is consistently tracking 15% below budget — signal that the underlying assumptions were wrong and require a response: a revised plan, accelerated action, or a conversation with the board.</>}
          </p>
          <ul className="space-y-2 list-none pl-0">
            {es
              ? [
                  "Ingresos por debajo del presupuesto: ¿es un problema de calendario (operaciones retrasadas) o estructural (tasas de conversión inferiores a las esperadas)?",
                  "Costes de personal por encima del presupuesto: ¿se están incorporando nuevas contrataciones antes de lo previsto o están disparadas las horas extras y los costes de contratistas?",
                  "Gasto de marketing por debajo del presupuesto: ¿es porque se han pausado las campañas o el subgasto se concentra en canales que realmente están funcionando?",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))
              : [
                  "Revenue below budget: is it a timing issue (deals delayed) or a structural issue (conversion rates lower than expected)?",
                  "Headcount costs above budget: are new hires joining earlier than planned, or are overtime and contractor costs running high?",
                  "Marketing spend below budget: is this because campaigns have been paused, or is underspend concentrated in channels that are actually performing?",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))}
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Conseguir el Compromiso de los Responsables de Departamento" : "Getting Buy-In From Department Heads"}
          </h2>
          <p>
            {es
              ? "Un presupuesto construido íntegramente por el equipo financiero y entregado a los responsables de departamento no será asumido por ellos. Un presupuesto construido íntegramente de abajo hacia arriba por los responsables de departamento suele estar inflado con márgenes de seguridad y supuestos sin contestar. El mejor proceso es colaborativo e iterativo."
              : "A budget built entirely by the finance team and handed down to department heads will not be owned by them. A budget built entirely bottom-up by department heads will typically be padded with safety margins and uncontested assumptions. The best process is collaborative and iterative."}
          </p>
          <p>
            {es
              ? "El equipo financiero debe establecer el marco macro: objetivo total de ingresos, envolvente total de costes, supuestos clave sobre el crecimiento del personal. Los responsables de departamento deben construir sus costes de abajo hacia arriba dentro de ese marco, con una justificación explícita de cada partida material. El equipo financiero desafía, consolida y concilia. El proceso es una negociación, y eso es saludable: obliga a ambas partes a articular los supuestos."
              : "Finance should set the macro framework: total revenue target, total cost envelope, key assumptions about headcount growth. Department heads should build their costs from the ground up within that framework, with explicit justification for each material line. Finance then challenges, consolidates, and reconciles. The process is a negotiation, and that is healthy — it forces both sides to articulate assumptions."}
          </p>
          <p>
            {es
              ? "De manera crucial, cada responsable de departamento debe dar su visto bueno a su sección del presupuesto. La rendición de cuentas personal —este es tu número— es lo que convierte un ejercicio de hoja de cálculo en una herramienta de gestión."
              : "Critically, every department head should sign off on their section of the budget. Personal accountability — this is your number — is what converts a spreadsheet exercise into a management tool."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Calendario Práctico: Cuándo Empezar, Cuándo Cerrar" : "Practical Timeline: When to Start, When to Lock"}
          </h2>
          <ul className="space-y-2 list-none pl-0">
            {es
              ? [
                  "Octubre: el equipo financiero establece los supuestos macro y distribuye las plantillas presupuestarias a los responsables de departamento",
                  "Noviembre (primeras dos semanas): los responsables de departamento presentan los presupuestos de costes; el equipo de ingresos presenta la previsión de ingresos basada en la cartera",
                  "Noviembre (últimas dos semanas): el equipo financiero consolida, identifica brechas, realiza sesiones de análisis con cada departamento",
                  "Principios de diciembre: presupuesto revisado presentado al CEO y al consejo para su aprobación",
                  "Mediados de diciembre: presupuesto cerrado y comunicado a la organización",
                  "A partir de enero: datos reales mensuales cargados, análisis de variaciones producido en un plazo de 5 días hábiles desde el cierre del mes",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))
              : [
                  "October: finance sets macro assumptions and distributes budget templates to department heads",
                  "November (first two weeks): department heads submit cost budgets; revenue team submits pipeline-based revenue forecast",
                  "November (last two weeks): finance consolidates, identifies gaps, runs challenge sessions with each department",
                  "Early December: revised budget submitted to CEO and board for approval",
                  "Mid-December: budget locked, communicated to the organisation",
                  "January onwards: monthly actuals loaded, variance analysis produced within 5 working days of month-end",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))}
          </ul>

          <p>
            {es
              ? "Cerrar el presupuesto después de mediados de enero significa que ya llevas un mes en el año sin objetivos acordados, una situación que inevitablemente lleva al presupuesto a ser ignorado en silencio. Iniciar el proceso demasiado pronto (en septiembre) significa que los supuestos están demasiado obsoletos cuando se utiliza el presupuesto. Octubre suele ser el equilibrio adecuado."
              : "Locking the budget after mid-January means you are already a month into the year with no agreed targets — a situation that invariably leads to the budget being quietly sidelined. Starting the process too early (September) means assumptions are too stale by the time the budget is used. October is typically the right balance."}
          </p>
          <p>
            {es
              ? "El objetivo no es una previsión perfecta. El objetivo es un plan compartido y comprendido que cree responsabilidad, detecte problemas con antelación y dé a la dirección un marco consistente para la toma de decisiones durante todo el año."
              : "The goal is not a perfect forecast. The goal is a shared, understood plan that creates accountability, surfaces problems early, and gives leadership a consistent frame for decision-making throughout the year."}
          </p>

        </div>

        <ShareButtons
          url="https://www.financeplots.com/blog/annual-budget-guide"
          title={es
            ? "Cómo Construir un Presupuesto Anual que Tu Equipo Financiero Realmente Use"
            : "How to Build an Annual Budget That Your Finance Team Will Actually Use"}
        />

        <div className="mt-14 bg-[#0d1426] border border-blue-700/40 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">
            {es ? "Construye Tu Presupuesto Anual Gratis" : "Build Your Annual Budget Free"}
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            {es
              ? "Estructura tus ingresos, personal y costes departamentales en un solo lugar, con seguimiento presupuesto vs real integrado."
              : "Structure your revenue, headcount, and department costs in one place — with budget vs actual tracking built in."}
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
