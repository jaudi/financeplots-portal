import Link from "next/link";
import type { Metadata } from "next";
import ShareButtons from "@/components/ShareButtons";
import BlogArticleShell from "@/components/BlogArticleShell";

export const metadata: Metadata = {
  title: "The 13-Week Cash Flow Forecast: Why Every Business Needs One | FinancePlots",
  description: "Profit and cash are not the same thing. Learn how to build a 13-week rolling cash flow forecast that gives your business real financial visibility.",
  openGraph: {
    title: "The 13-Week Cash Flow Forecast: Why Every Business Needs One",
    description: "Profit and cash are not the same thing. Learn how to build a 13-week rolling cash flow forecast that gives your business real financial visibility.",
    url: "https://www.financeplots.com/blog/cash-flow-forecast-guide",
    siteName: "FinancePlots",
    type: "article",
    images: [{ url: "https://www.financeplots.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The 13-Week Cash Flow Forecast: Why Every Business Needs One",
    description: "Profit and cash are not the same thing. Learn how to build a 13-week rolling cash flow forecast that gives your business real financial visibility.",
    images: ["https://www.financeplots.com/og-image.png"],
  },
  alternates: {
    canonical: "https://www.financeplots.com/blog/cash-flow-forecast-guide",
  },
};

type Props = { params: Promise<{ locale: string }> };

export default async function CashFlowForecastGuide({ params }: Props) {
  const { locale } = await params;
  const es = locale === "es";

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: "{\"@context\":\"https://schema.org\",\"@type\":\"Article\",\"headline\":\"The 13-Week Cash Flow Forecast: Why Every Business Needs One\",\"description\":\"Profit and cash are not the same thing. Learn how to build a 13-week rolling cash flow forecast that gives your business real financial visibility.\",\"url\":\"https://www.financeplots.com/blog/cash-flow-forecast-guide\",\"image\":\"https://www.financeplots.com/og-image.png\",\"author\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\"},\"publisher\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\",\"logo\":{\"@type\":\"ImageObject\",\"url\":\"https://www.financeplots.com/logo-sm.png\"}},\"mainEntityOfPage\":{\"@type\":\"WebPage\",\"@id\":\"https://www.financeplots.com/blog/cash-flow-forecast-guide\"}}" }} />
      <BlogArticleShell>

        <Link href="/blog" className="text-blue-400 text-sm hover:text-blue-300 transition mb-8 inline-block">
          {es ? "← Volver al Blog" : "← Back to Blog"}
        </Link>

        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
          {es ? "Finanzas Corporativas" : "Corporate Finance"}
        </span>
        <h1 className="text-4xl font-bold mt-2 mb-3 leading-tight">
          {es
            ? "La Previsión de Flujo de Caja a 13 Semanas: Por Qué Toda Empresa La Necesita"
            : "The 13-Week Cash Flow Forecast: Why Every Business Needs One"}
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          {es ? "Marzo 2026 · 7 min de lectura" : "March 2026 · 7 min read"}
        </p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">

          <p>
            {es
              ? "La mayoría de las empresas fracasan no porque sean deficitarias, sino porque se quedan sin efectivo. Una empresa puede estar generando beneficios saludables sobre el papel y al mismo tiempo ser incapaz de pagar a sus proveedores o hacer la nómina. La previsión de flujo de caja a 13 semanas es la herramienta más eficaz para evitar que eso ocurra."
              : "Most businesses fail not because they are unprofitable, but because they run out of cash. A company can be generating healthy profits on paper while simultaneously unable to pay its suppliers or make payroll. The 13-week cash flow forecast is the single most effective tool to prevent that from happening."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "¿Qué Es una Previsión de Flujo de Caja a 13 Semanas y Por Qué 13 Semanas?" : "What Is a 13-Week Cash Flow Forecast — and Why 13 Weeks?"}
          </h2>
          <p>
            {es
              ? "Una previsión de flujo de caja a 13 semanas es una proyección continua, semana a semana, de cada dólar que entra y sale de una empresa durante el próximo trimestre. El horizonte de 13 semanas no es arbitrario. Es lo suficientemente corto como para prever con una precisión razonable y lo suficientemente largo como para dar a la dirección un plazo significativo para actuar antes de que una falta de liquidez se convierta en una crisis."
              : "A 13-week cash flow forecast is a rolling, week-by-week projection of every dollar coming into and going out of a business over the next quarter. The 13-week horizon is not arbitrary. It is short enough to forecast with reasonable accuracy, and long enough to give management meaningful lead time to act before a cash shortfall becomes a crisis."}
          </p>
          <p>
            {es
              ? "Los prestamistas y asesores de reestructuración utilizan previsiones a 13 semanas como herramienta estándar en situaciones de tensión precisamente porque obligan a una especificidad operativa. A diferencia de los presupuestos anuales —que suelen construirse de arriba abajo y están desconectados de los plazos reales de cobro— una previsión a 13 semanas exige saber cuándo pagan realmente los clientes, cuándo se ejecuta la nómina y cuándo llegan las facturas grandes."
              : "Lenders and restructuring advisors use 13-week forecasts as a standard tool during stressed situations precisely because they force operational specificity. Unlike annual budgets — which are often built top-down and divorced from actual cash timing — a 13-week forecast requires you to know when customers actually pay, when payroll runs, and when large bills land."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Beneficio No Es Efectivo: La Distinción Crítica" : "Profit Is Not Cash: The Critical Distinction"}
          </h2>
          <p>
            {es
              ? "Este es el concepto más importante en la gestión del flujo de caja y es ampliamente malentendido. El beneficio es un constructo contable. El efectivo es lo que hay en tu cuenta bancaria."
              : "This is the most important concept in cash flow management, and it is widely misunderstood. Profit is an accounting construct. Cash is what sits in your bank account."}
          </p>
          <p>
            {es
              ? "Cuando facturas a un cliente por 50.000 $, tu cuenta de resultados registra 50.000 $ en ingresos de inmediato. Pero si ese cliente paga a 60 días, no verás ese efectivo en dos meses. Mientras tanto, puede que ya hayas pagado a tus proveedores, tu personal y tu alquiler para realizar ese trabajo. El desfase temporal entre el reconocimiento del beneficio y la recepción del efectivo es lo que acaba con las empresas."
              : "When you invoice a customer for $50,000, your P&L records $50,000 in revenue immediately. But if that customer pays on 60-day terms, you will not see that cash for two months. Meanwhile, you may have already paid your suppliers, your staff, and your rent to deliver that work. The timing gap between profit recognition and cash receipt is what kills businesses."}
          </p>
          <p>
            {es
              ? "Una previsión de flujo de caja a 13 semanas ignora por completo las facturas y las periodificaciones. Solo captura los movimientos reales de efectivo: cuándo el dinero llega a tu banco y cuándo sale."
              : "A 13-week cash flow forecast ignores invoices and accruals entirely. It captures only actual cash movements: when money hits your bank, and when it leaves."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Cómo Construir una Previsión de Flujo de Caja a 13 Semanas" : "How to Build a 13-Week Cash Flow Forecast"}
          </h2>
          <p>
            {es
              ? "La estructura es sencilla. Cada columna representa una semana. Cada fila representa una línea de entrada o salida de efectivo. Estos son los componentes principales:"
              : "The structure is straightforward. Each column represents one week. Each row represents a line of cash inflow or outflow. Here are the core components:"}
          </p>

          <p className="text-white font-medium">
            {es ? "Saldo Inicial" : "Opening Balance"}
          </p>
          <p>
            {es
              ? "Comienza con el saldo de efectivo real en tu cuenta bancaria al inicio de cada semana. El saldo inicial de la semana 1 es tu posición de caja actual hoy. El saldo inicial de cada semana siguiente es igual al saldo final de la semana anterior."
              : "Start with the actual cash balance in your bank account at the beginning of each week. Week 1 opening balance is your current cash position today. Every subsequent week\u2019s opening balance equals the prior week\u2019s closing balance."}
          </p>

          <p className="text-white font-medium">
            {es ? "Entradas de Efectivo" : "Cash Inflows"}
          </p>
          <ul className="space-y-2 list-none pl-0">
            {es
              ? [
                  "Cobros de clientes — basados en los plazos de pago reales (30, 60, 90 días), no en las fechas de factura",
                  "Préstamos o inversión de capital — cuando se espera que lleguen",
                  "Ingresos por venta de activos — de equipos, inmuebles u otras desinversiones",
                  "Devoluciones de impuestos o subvenciones públicas — en la fecha en que se espera recibirlos",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))
              : [
                  "Customer receipts — based on actual payment terms (30, 60, 90 days), not invoice dates",
                  "Loan proceeds or equity investment — if and when they are expected to land",
                  "Asset sale proceeds — from equipment, property, or other disposals",
                  "Tax refunds or government grants — on the date they are expected to be received",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))}
          </ul>

          <p className="text-white font-medium">
            {es ? "Salidas de Efectivo" : "Cash Outflows"}
          </p>
          <ul className="space-y-2 list-none pl-0">
            {es
              ? [
                  "Nómina — fechas exactas e importes brutos incluyendo cotizaciones de la empresa",
                  "Pagos a proveedores — según las fechas reales de pago, no las de factura",
                  "Alquiler y suministros — en los días en que se cargan",
                  "Devolución de préstamos e intereses — calendario fijo",
                  "Pagos de impuestos — IVA, impuesto de sociedades, impuestos sobre nóminas en sus fechas de vencimiento",
                  "Inversión en capital — equipos, software o mejoras del local",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))
              : [
                  "Payroll — exact dates and gross amounts including employer taxes",
                  "Supplier payments — mapped to your actual payment run dates, not invoice dates",
                  "Rent and utilities — on the days they are debited",
                  "Loan repayments and interest — fixed schedule",
                  "Tax payments — VAT, corporation tax, payroll taxes on their due dates",
                  "Capital expenditure — equipment, software, or leasehold improvements",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))}
          </ul>

          <p className="text-white font-medium">
            {es ? "Flujo de Caja Neto y Saldo Final" : "Net Cash and Closing Balance"}
          </p>
          <p>
            {es
              ? "El flujo de caja neto de cada semana = total de entradas menos total de salidas. Saldo final = saldo inicial más flujo de caja neto. El saldo final se convierte en el saldo inicial de la semana siguiente. Cualquier semana en que el saldo final sea negativo es un problema que necesita atención inmediata."
              : "Net cash for each week = total inflows minus total outflows. Closing balance = opening balance plus net cash. The closing balance becomes next week\u2019s opening balance. Any week where the closing balance goes negative is a problem that needs immediate attention."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Cómo Usar la Previsión de Forma Efectiva" : "How to Use the Forecast Effectively"}
          </h2>
          <p>
            {es
              ? "Construir la previsión es solo la mitad del trabajo. Actualízala cada semana reemplazando las proyecciones por los datos reales de la semana recién completada, ampliando el horizonte una semana más y revisando qué cambió y por qué. La revisión semanal fuerza la rendición de cuentas y detecta sorpresas con anticipación."
              : "Building the forecast is only half the work. Update it every week by replacing projections with actuals for the week just completed, extending the horizon by one more week, and reviewing what changed and why. The weekly review forces accountability and surfaces surprises early."}
          </p>
          <p>
            {es
              ? "Cuando identifiques una semana con un saldo proyectado negativo, tienes opciones: gestionar el cobro de deudores antes, negociar plazos extendidos con proveedores, aplazar una compra de capital o disponer de una línea de crédito revolvente. Cuanto antes veas el problema, más opciones tienes. Una previsión a 13 semanas te da hasta tres meses de margen para actuar."
              : "When you identify a week with a projected negative balance, you have options: chase receivables earlier, negotiate extended supplier terms, delay a capital purchase, or draw on a revolving credit facility. The earlier you see the problem, the more options you have. A 13-week forecast gives you up to three months of runway to act."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "Errores Comunes a Evitar" : "Common Mistakes to Avoid"}
          </h2>
          <ul className="space-y-2 list-none pl-0">
            {es
              ? [
                  "Confundir fechas de factura con fechas de cobro — usa siempre las fechas de pago esperadas basadas en el comportamiento real del cliente",
                  "Tratar la previsión como un ejercicio puntual — debe avanzar cada semana para ser útil",
                  "Ignorar salidas irregulares o puntuales — las primas de seguros anuales, los pagos trimestrales de impuestos y las nóminas de bonificaciones pillan desprevenidas a las empresas",
                  "Ser excesivamente optimista con los cobros de clientes — si un cliente tiene historial de pago tardío, modélalo como pago tardío",
                  "No separar el efectivo operativo del de financiación — mantén las disposiciones de préstamos y las devoluciones claramente etiquetadas",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))
              : [
                  "Confusing invoice dates with receipt dates — always use expected payment dates based on actual customer behaviour",
                  "Treating the forecast as a one-time exercise — it must roll forward every week to be useful",
                  "Ignoring one-off or irregular outflows — annual insurance premiums, quarterly tax payments, and bonus runs catch businesses off guard",
                  "Being overly optimistic about customer receipts — if a customer has a history of paying late, model them as paying late",
                  "Not separating operating cash from financing cash — keep loan drawdowns and repayments clearly labelled",
                ].map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">→</span>{item}</li>
                ))}
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">
            {es ? "¿Quién Necesita una Previsión de Flujo de Caja a 13 Semanas?" : "Who Needs a 13-Week Cash Flow Forecast?"}
          </h2>
          <p>
            {es
              ? "La respuesta honesta es: cualquier empresa que se preocupe por mantenerse solvente. Pero es especialmente crítica para:"
              : "The honest answer is: any business that cares about staying solvent. But it is especially critical for:"}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 pr-6 text-gray-400 font-medium">
                    {es ? "Tipo de Empresa" : "Business Type"}
                  </th>
                  <th className="text-left py-3 text-gray-400 font-medium">
                    {es ? "Por Qué Es Importante" : "Why It Matters"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {es
                  ? [
                      ["Empresas estacionales", "Los ingresos se concentran en ciertos meses; los costes continúan todo el año"],
                      ["Startups", "La gestión de la tasa de quema es existencial; la visibilidad del runway es crítica para captar inversión"],
                      ["Empresas por proyectos", "Las facturas grandes pagadas tarde crean peligrosas brechas de caja entre proyectos"],
                      ["Empresas con plazos de cobro largos", "Los ciclos de cobro a 60–90 días crean presión estructural de caja"],
                      ["Empresas en modo crecimiento", "El crecimiento rápido consume efectivo: más stock, más personal, más cuentas por cobrar"],
                    ].map(([a, b]) => (
                      <tr key={a}>
                        <td className="py-3 pr-6 text-blue-300 font-medium">{a}</td>
                        <td className="py-3 text-gray-300">{b}</td>
                      </tr>
                    ))
                  : [
                      ["Seasonal businesses", "Revenue concentrates in certain months; costs continue year-round"],
                      ["Startups", "Burn rate management is existential; runway visibility is critical for fundraising"],
                      ["Project-based businesses", "Large invoices paid late create dangerous cash gaps between projects"],
                      ["Businesses with long payment terms", "60-90 day receivables cycles create structural cash pressure"],
                      ["Businesses in growth mode", "Fast growth consumes cash — more stock, more staff, more receivables"],
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
              ? "Si tu empresa tiene flujos de caja predecibles y consistentes con reservas sólidas, una previsión a 13 semanas sigue siendo útil, aunque menos urgente. Para todos los demás, no es opcional. Es el estándar mínimo de gestión financiera."
              : "If your business has predictable, consistent cash flows and strong reserves, a 13-week forecast is still useful — but less urgent. For everyone else, it is not optional. It is the minimum standard of financial management."}
          </p>

          <p>
            {es
              ? "Empieza de forma sencilla. Una hoja de cálculo bien mantenida supera a un modelo sofisticado que nadie actualiza. El objetivo es la visibilidad, no la complejidad."
              : "Start simple. A well-maintained spreadsheet beats a sophisticated model that nobody updates. The goal is visibility, not complexity."}
          </p>

        </div>

        <ShareButtons
          url="https://www.financeplots.com/blog/cash-flow-forecast-guide"
          title={es
            ? "La Previsión de Flujo de Caja a 13 Semanas: Por Qué Toda Empresa La Necesita"
            : "The 13-Week Cash Flow Forecast: Why Every Business Needs One"}
        />

        <div className="mt-14 bg-[#0d1426] border border-blue-700/40 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">
            {es ? "Prueba la Herramienta de Previsión de Flujo de Caja a 13 Semanas" : "Try the Free 13-Week Cash Flow Forecast Tool"}
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            {es
              ? "Crea tu previsión de flujo de caja en minutos: sin configurar hojas de cálculo, sin registro."
              : "Build your cash flow forecast in minutes — no spreadsheet setup required, no signup needed."}
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
