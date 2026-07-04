import Link from "next/link";
import type { Metadata } from "next";
import ShareButtons from "@/components/ShareButtons";
import BlogArticleShell from "@/components/BlogArticleShell";

export const metadata: Metadata = {
  title: "The Smartest £25 You Can Spend on Your Child's Future: Junior SIPPs Explained | FinancePlots",
  description: "How opening a pension for your child — with just £1,000 and £25/month — could hand them a quarter of a million pounds at retirement. The maths, the government top-up, and three age scenarios.",
  openGraph: {
    title: "The Smartest £25 You Can Spend on Your Child's Future: Junior SIPPs Explained",
    description: "How opening a pension for your child — with just £1,000 and £25/month — could hand them a quarter of a million pounds at retirement.",
    url: "https://www.financeplots.com/blog/junior-sipp-kids",
    siteName: "FinancePlots",
    type: "article",
    images: [{ url: "https://www.financeplots.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Smartest £25 You Can Spend on Your Child's Future: Junior SIPPs Explained",
    description: "How opening a pension for your child — with just £1,000 and £25/month — could hand them a quarter of a million pounds at retirement.",
    images: ["https://www.financeplots.com/og-image.png"],
  },
  alternates: {
    canonical: "https://www.financeplots.com/blog/junior-sipp-kids",
  },
};

type Props = { params: Promise<{ locale: string }> };

// Bar chart data: £1,000 lump sum + £25/month until 18, pension at 57
// Groups: age 7 (50 yrs), age 11 (46 yrs), age 14 (43 yrs)
// Returns: 5%, 7%, 9% p.a.
const CHART_DATA = [
  { age: 7,  label: "Age 7",  c5: 51,  c7: 124, c9: 296 },
  { age: 11, label: "Age 11", c5: 33,  c7: 75,  c9: 171 },
  { age: 14, label: "Age 14", c5: 21,  c7: 47,  c9: 103 },
];

function GrowthBarChart({ es }: { es: boolean }) {
  const svgW = 520;
  const svgH = 280;
  const chartTop = 20;
  const chartBottom = 220;
  const chartHeight = chartBottom - chartTop;
  const maxVal = 310; // thousands
  const scale = (v: number) => chartHeight * (v / maxVal);

  const barW = 32;
  const gap = 6;
  const groupW = 3 * barW + 2 * gap;
  const groupCenters = [110, 270, 430];

  const colors = { c5: "#4B5563", c7: "#3B82F6", c9: "#10B981" };

  const yGridLines = [0, 100, 200, 300];

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" aria-label={es ? "Gráfico de crecimiento del SIPP Junior" : "Junior SIPP growth chart"}>
      {/* grid lines */}
      {yGridLines.map((v) => {
        const y = chartBottom - scale(v);
        return (
          <g key={v}>
            <line x1={40} y1={y} x2={svgW - 10} y2={y} stroke="#1f2937" strokeWidth={1} />
            <text x={35} y={y + 4} textAnchor="end" fill="#6b7280" fontSize={10}>
              {v === 0 ? "£0" : `£${v}k`}
            </text>
          </g>
        );
      })}

      {/* bars */}
      {CHART_DATA.map((d, gi) => {
        const cx = groupCenters[gi];
        const x0 = cx - groupW / 2;
        const bars = [
          { key: "c5", val: d.c5, color: colors.c5 },
          { key: "c7", val: d.c7, color: colors.c7 },
          { key: "c9", val: d.c9, color: colors.c9 },
        ];
        return (
          <g key={d.age}>
            {bars.map((b, bi) => {
              const h = scale(b.val);
              const x = x0 + bi * (barW + gap);
              const y = chartBottom - h;
              return (
                <g key={b.key}>
                  <rect x={x} y={y} width={barW} height={h} fill={b.color} rx={3} opacity={0.9} />
                  <text x={x + barW / 2} y={y - 4} textAnchor="middle" fill="#e5e7eb" fontSize={9} fontWeight="600">
                    £{b.val}k
                  </text>
                </g>
              );
            })}
            {/* group label */}
            <text x={cx} y={chartBottom + 18} textAnchor="middle" fill="#9ca3af" fontSize={11} fontWeight="600">
              {es ? `${d.age} años` : d.label}
            </text>
            <text x={cx} y={chartBottom + 30} textAnchor="middle" fill="#6b7280" fontSize={9}>
              {es ? `${57 - d.age} años de crecimiento` : `${57 - d.age} yrs growth`}
            </text>
          </g>
        );
      })}

      {/* legend */}
      {[
        { color: colors.c5, label: es ? "5% anual" : "5% p.a." },
        { color: colors.c7, label: es ? "7% anual" : "7% p.a." },
        { color: colors.c9, label: es ? "9% anual" : "9% p.a." },
      ].map((l, i) => (
        <g key={l.label} transform={`translate(${svgW - 160 + i * 53}, ${svgH - 14})`}>
          <rect width={10} height={10} fill={l.color} rx={2} />
          <text x={13} y={9} fill="#9ca3af" fontSize={9}>{l.label}</text>
        </g>
      ))}
    </svg>
  );
}

export default async function ArticleJuniorSIPP({ params }: Props) {
  const { locale } = await params;
  const es = locale === "es";

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: "{\"@context\":\"https://schema.org\",\"@type\":\"Article\",\"headline\":\"The Smartest £25 You Can Spend on Your Child's Future: Junior SIPPs Explained\",\"description\":\"How opening a pension for your child — with just £1,000 and £25/month — could hand them a quarter of a million pounds at retirement.\",\"url\":\"https://www.financeplots.com/blog/junior-sipp-kids\",\"image\":\"https://www.financeplots.com/og-image.png\",\"author\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\"},\"publisher\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\",\"logo\":{\"@type\":\"ImageObject\",\"url\":\"https://www.financeplots.com/logo-sm.png\"}},\"mainEntityOfPage\":{\"@type\":\"WebPage\",\"@id\":\"https://www.financeplots.com/blog/junior-sipp-kids\"}}" }} />
      <BlogArticleShell>

        <Link href="/blog" className="text-blue-400 text-sm hover:text-blue-300 transition mb-8 inline-block">
          {es ? "← Volver al Blog" : "← Back to Blog"}
        </Link>

        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
          {es ? "Finanzas Personales" : "Personal Finance"}
        </span>
        <h1 className="text-4xl font-bold mt-2 mb-3 leading-tight">
          {es
            ? "La Decisión Financiera Más Inteligente para tus Hijos: SIPP Junior Explicado"
            : "The Smartest Financial Decision You Can Make for Your Kids: Junior SIPPs Explained"}
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          {es ? "Junio 2026 · 5 min de lectura" : "June 2026 · 5 min read"}
        </p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">

          <p>
            {es
              ? "El sábado pasado, mi mujer, un amigo y yo acabamos hablando del futuro de nuestros hijos. Tenemos tres, con 7, 11 y 14 años. La vivienda está fuera del alcance de la mayoría de los jóvenes, la IA está redefiniendo el mercado laboral, y la pensión estatal no va a bastar. Mi mujer había estado investigando durante la semana y llegó con una propuesta sencilla: abrir un SIPP Junior para cada uno."
              : "Last Saturday, my wife, a friend, and I ended up talking about our kids' futures. We have three — aged 7, 11, and 14. Housing is out of reach for most young people, AI is reshaping the job market, and the state pension will not be enough. My wife had spent the week researching and arrived with a simple proposal: open a Junior SIPP for each of them."}
          </p>
          <p>
            {es
              ? "Cuanto más lo analizamos, más claro estaba. Es una de las decisiones más baratas e inteligentes que un padre puede tomar. Aquí están los números reales."
              : "The more we looked at it, the clearer it became. It is one of the cheapest and most intelligent decisions a parent can make. Here are the real numbers."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "¿Qué es un SIPP Junior?" : "What is a Junior SIPP?"}
          </h2>
          <p>
            {es
              ? "Una cuenta de pensión privada que puedes abrir para cualquier niño residente en el Reino Unido menor de 18 años. Tú la gestionas hasta los 18, luego pasa a ser suya. No pueden retirar el dinero hasta los 57 años. El límite anual de aportación es de 2.880 £ netas — más que suficiente para el escenario de 25 £/mes."
              : "A private pension account you can open for any UK-resident child under 18. You manage it until they turn 18, then it becomes theirs. They cannot withdraw until age 57. The annual contribution limit is £2,880 net — more than enough for a £25/month scenario."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Ventaja #1: El Gobierno Aporta el 25% Desde el Día 1" : "Advantage #1: The Government Adds 25% From Day One"}
          </h2>
          <p>
            {es
              ? "El gobierno añade una desgravación fiscal del 20% sobre cada aportación — convirtiendo cada 80 £ que aportas en 100 £ dentro del fondo, automáticamente y sin trámites. En la práctica, eso supone un incremento inmediato del 25% sobre lo que tú desembolsas."
              : "The government adds 20% tax relief on every contribution — turning every £80 you put in into £100 inside the pension, automatically and with no forms needed. In practice, that is an instant 25% boost on what you actually spend."}
          </p>
          <div className="bg-[#0d1426] border border-blue-700/40 rounded-xl p-5 my-2">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-white">£1,000</p>
                <p className="text-gray-400 text-xs mt-1">{es ? "aportación inicial" : "lump sum"}</p>
                <p className="text-blue-400 text-sm font-semibold mt-1">→ £1,250</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">£25<span className="text-base font-normal text-gray-400">/mo</span></p>
                <p className="text-gray-400 text-xs mt-1">{es ? "pago recurrente" : "monthly"}</p>
                <p className="text-blue-400 text-sm font-semibold mt-1">→ £31.25</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">£6,400</p>
                <p className="text-gray-400 text-xs mt-1">{es ? "de tu bolsillo (18 años)" : "out of pocket (18 yrs)"}</p>
                <p className="text-blue-400 text-sm font-semibold mt-1">→ £8,000</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Ventaja #2: El Tiempo es el Activo Más Escaso" : "Advantage #2: Time is the Scarcest Asset"}
          </h2>
          <p>
            {es
              ? "El interés compuesto es exponencial. Un niño de 7 años tiene 50 años de crecimiento por delante antes de los 57. Uno de 14 tiene 43. Esa diferencia de 7 años se traduce en multiplicar el resultado por 2,5×. Y ningún adulto puede recuperar esos años."
              : "Compound interest is exponential. A 7-year-old has 50 years of growth ahead before age 57. A 14-year-old has 43. That 7-year gap translates to a 2.5× difference in the final pot. And no adult can buy those years back."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Los Números: Tres Edades, Tres Escenarios" : "The Numbers: Three Ages, Three Scenarios"}
          </h2>
          <p className="text-sm text-gray-400">
            {es
              ? "£1.000 de aportación inicial + 25 £/mes hasta los 18 años. Dinero invertido en un fondo indexado global hasta los 57 años. Cifras en miles de libras."
              : "£1,000 lump sum + £25/month until age 18. Money invested in a global index fund until age 57. Figures in thousands of pounds."}
          </p>

          <div className="bg-[#0d1426] border border-gray-700 rounded-xl p-4 my-4">
            <GrowthBarChart es={es} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 pr-4 text-gray-400 font-medium">{es ? "Edad actual" : "Current age"}</th>
                  <th className="text-left py-3 pr-4 text-gray-500 font-medium">{es ? "5% anual" : "5% p.a."}</th>
                  <th className="text-left py-3 pr-4 text-blue-400 font-medium">{es ? "7% anual" : "7% p.a."}</th>
                  <th className="text-left py-3 text-green-400 font-medium">{es ? "9% anual" : "9% p.a."}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {[
                  { age: es ? "7 años" : "Age 7",  c5: "£51,000",  c7: "£124,000", c9: "£296,000" },
                  { age: es ? "11 años" : "Age 11", c5: "£33,000",  c7: "£75,000",  c9: "£171,000" },
                  { age: es ? "14 años" : "Age 14", c5: "£21,000",  c7: "£47,000",  c9: "£103,000" },
                ].map((row) => (
                  <tr key={row.age}>
                    <td className="py-3 pr-4 text-white font-semibold">{row.age}</td>
                    <td className="py-3 pr-4 text-gray-400">{row.c5}</td>
                    <td className="py-3 pr-4 text-blue-300 font-semibold">{row.c7}</td>
                    <td className="py-3 text-green-400 font-semibold">{row.c9}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500">
            {es
              ? "Cálculos basados en rentabilidades históricas de mercados de renta variable global. El rendimiento pasado no garantiza el futuro. Las aportaciones se realizan hasta los 18 años y el fondo crece hasta los 57."
              : "Based on historical global equity market returns. Past performance does not guarantee future results. Contributions made until age 18; fund grows until age 57."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "El ROI Real: Lo Que Cuesta vs. Lo Que Vale" : "The Real ROI: What It Costs vs. What It Becomes"}
          </h2>
          <p>
            {es
              ? "En el escenario moderado del 7%, los 6.400 £ que sale de tu bolsillo a lo largo de 18 años se convierten en 124.000 £ para el hijo de 7 años y en 47.000 £ para el de 14. Casi 20× y 7× respectivamente. Nada en el mercado financiero minorista ofrece ese tipo de retorno con ese nivel de simplicidad."
              : "At a moderate 7%, the £6,400 out of your pocket over 18 years becomes £124,000 for the 7-year-old and £47,000 for the 14-year-old. Nearly 20× and 7× respectively. Nothing in retail finance offers that kind of return with that level of simplicity."}
          </p>
          <p>
            {es
              ? "Y eso sin contar que el niño, cuando empiece a trabajar, puede seguir aportando por su cuenta. Esta base es solo el punto de partida."
              : "And that is before the child starts contributing themselves when they begin working. This is just the foundation."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Cómo Abrirlo en 15 Minutos" : "How to Open One in 15 Minutes"}
          </h2>
          <ul className="space-y-2 list-none pl-0">
            {es
              ? [
                  "Elige un proveedor: Vanguard (comisión ~0,15%) o Hargreaves Lansdown son las opciones más populares.",
                  "Abre la cuenta online con el certificado de nacimiento del niño o su número de la Seguridad Social.",
                  "Transfiere 1.000 £. El proveedor solicita la desgravación a HMRC y verás 1.250 £ en semanas.",
                  "Domicilia 25 £/mes. Cada mes entran 31,25 £ brutos en el fondo.",
                  "Elige un fondo indexado global (ej. Vanguard LifeStrategy 100% Equity) y no lo toques.",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 items-start"><span className="text-blue-400 font-bold shrink-0">{i + 1}.</span><span>{item}</span></li>
                ))
              : [
                  "Pick a provider: Vanguard (~0.15% fee) or Hargreaves Lansdown are the most popular options.",
                  "Open the account online using the child's birth certificate or National Insurance number.",
                  "Transfer £1,000. The provider claims tax relief from HMRC and you will see £1,250 within weeks.",
                  "Set up a £25/month direct debit. Each month £31.25 gross lands in the pension.",
                  "Choose a global index fund (e.g. Vanguard LifeStrategy 100% Equity) and leave it alone.",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 items-start"><span className="text-blue-400 font-bold shrink-0">{i + 1}.</span><span>{item}</span></li>
                ))}
          </ul>

          <div className="bg-[#0d1426] border border-yellow-700/40 rounded-xl p-5 mt-6">
            <p className="text-yellow-300 font-semibold text-sm mb-1">
              {es ? "Una cosa a tener en cuenta" : "One thing to be aware of"}
            </p>
            <p className="text-gray-300 text-sm">
              {es
                ? "El dinero queda bloqueado hasta los 57 años. Para necesidades más inmediatas — universidad, depósito de vivienda — un Junior ISA es más apropiado. Ambos productos son compatibles: puedes tener los dos a la vez."
                : "The money is locked until age 57. For shorter-term needs — university, house deposit — a Junior ISA is more appropriate. Both products are compatible: you can hold both at the same time."}
            </p>
          </div>


        </div>

        <ShareButtons
          url="https://www.financeplots.com/blog/junior-sipp-kids"
          title={es
            ? "La Decisión Financiera Más Inteligente para tus Hijos: SIPP Junior Explicado"
            : "The Smartest Financial Decision You Can Make for Your Kids: Junior SIPPs Explained"}
        />

        <div className="mt-14 bg-[#0d1426] border border-blue-700/40 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">
            {es ? "Modela el Futuro Financiero de tus Hijos" : "Model Your Children's Financial Future"}
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            {es
              ? "Usa nuestro modelo financiero gratuito para proyectar el crecimiento bajo distintos escenarios de aportación y rentabilidad."
              : "Use our free Financial Model to project growth under different contribution and return scenarios."}
          </p>
          <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition inline-block">
            {es ? "Abrir Herramientas Financieras" : "Open Finance Tools"}
          </Link>
        </div>

        <p className="text-gray-600 text-xs mt-8 text-center">
          {es
            ? "Este artículo es solo para fines informativos y no constituye asesoramiento financiero ni fiscal. Las normas fiscales están sujetas a cambios. Cifras basadas en el ejercicio fiscal 2024/25 del Reino Unido y rentabilidades históricas de mercado. Consulta a un asesor financiero independiente cualificado para orientación personalizada."
            : "This article is for informational purposes only and does not constitute financial or tax advice. Tax rules are subject to change. Figures based on 2024/25 UK tax year and historical market returns. Consult a qualified IFA for personal guidance."}
        </p>
      </BlogArticleShell>
    </main>
  );
}
