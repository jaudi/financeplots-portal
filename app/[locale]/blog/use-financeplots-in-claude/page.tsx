import Link from "next/link";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import ShareButtons from "@/components/ShareButtons";
import BlogArticleShell from "@/components/BlogArticleShell";

const URL = "https://www.financeplots.com/blog/use-financeplots-in-claude";
const TITLE = "FinancePlots Now Works Inside Claude: Real Formulas and Data for Your AI Assistant";
const DESCRIPTION =
  "Connect FinancePlots to Claude and your AI assistant stops estimating: loans, valuations, a Damodaran startup DCF, US macro data and a stock screener — free, with the same formulas as the site.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    siteName: "FinancePlots",
    type: "article",
    images: [{ url: "https://www.financeplots.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["https://www.financeplots.com/og-image.png"],
  },
  alternates: { canonical: URL },
};

type Props = { params: Promise<{ locale: string }> };

const MCP_URL = "https://www.financeplots.com/api/mcp";

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2 list-none pl-0">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2"><span className="text-blue-400">→</span><span>{item}</span></li>
      ))}
    </ul>
  );
}

export default async function ArticleUseFinancePlotsInClaude({ params }: Props) {
  const { locale } = await params;
  const es = locale === "es";

  const tools: [string, string][] = es
    ? [
        ["Préstamos e hipotecas", "Cuota, intereses totales y cuadro año a año."],
        ["Interés compuesto", "Cómo crece el ahorro con una aportación mensual."],
        ["Punto de equilibrio", "Unidades y ventas necesarias para cubrir los costes."],
        ["Valoración de empresas", "DCF y múltiplos del sector, en valor de empresa y en valor de las acciones."],
        ["Valoración de startups", "El DCF de Damodaran para empresas jóvenes, múltiplo de ventas, precio de la última ronda y meses de caja."],
        ["Datos de Damodaran", "Múltiplos, márgenes, ratio ventas/capital y coste de capital de 25 sectores (enero 2026)."],
        ["Economía de EE. UU.", "PIB, inflación, paro y tipos de interés de la Reserva Federal (FRED)."],
        ["Mercados hoy", "Índices, divisas, oro, petróleo y bitcoin."],
        ["Filtro de acciones", "S&P 500, Nasdaq-100 e IBEX 35 filtrados con tus criterios, por orden alfabético."],
      ]
    : [
        ["Loans and mortgages", "Monthly payment, total interest and a year-by-year schedule."],
        ["Compound interest", "How savings grow with a monthly contribution."],
        ["Break-even", "Units and revenue needed to cover your costs."],
        ["Business valuation", "DCF and industry multiples, as enterprise value and as equity value."],
        ["Startup valuation", "Damodaran’s DCF for young companies, a revenue multiple, the last round’s price and cash runway."],
        ["Damodaran data", "Multiples, margins, sales-to-capital and cost of capital for 25 industries (January 2026)."],
        ["US economy", "GDP, inflation, unemployment and interest rates from the Federal Reserve (FRED)."],
        ["Markets today", "Indices, currencies, gold, oil and Bitcoin."],
        ["Stock screener", "S&P 500, Nasdaq-100 and IBEX 35 filtered on your criteria, listed alphabetically."],
      ];

  const results: [string, string, string][] = es
    ? [
        ["Precio de la última ronda", "44,1 M£", "9 p × 490 M de acciones"],
        ["Múltiplo de ventas (5,3×)", "29,5 M£", "Media de Healthcare IT, más la caja"],
        ["DCF de Damodaran", "13,6 M£", "2,8 p por acción"],
      ]
    : [
        ["Last funding round", "£44.1m", "9p × 490m shares"],
        ["Revenue multiple (5.3×)", "£29.5m", "Healthcare IT average, plus cash"],
        ["Damodaran DCF", "£13.6m", "2.8p per share"],
      ];

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: TITLE,
            description: DESCRIPTION,
            url: URL,
            image: "https://www.financeplots.com/og-image.png",
            datePublished: "2026-09-18",
            author: { "@type": "Organization", name: "FinancePlots" },
            publisher: { "@type": "Organization", name: "FinancePlots", logo: { "@type": "ImageObject", url: "https://www.financeplots.com/logo-sm.png" } },
            mainEntityOfPage: { "@type": "WebPage", "@id": URL },
          }),
        }}
      />
      <BlogArticleShell>
        <Link href="/blog" className="text-blue-400 text-sm hover:text-blue-300 transition mb-8 inline-block">
          {es ? "← Volver al Blog" : "← Back to Blog"}
        </Link>

        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
          {es ? "IA y Agentes" : "AI & Agents"}
        </span>
        <h1 className="text-4xl font-bold mt-2 mb-3 leading-tight">
          {es
            ? "FinancePlots ya funciona dentro de Claude: fórmulas y datos reales para tu asistente de IA"
            : TITLE}
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          {es ? "Septiembre 2026 · 6 min de lectura" : "September 2026 · 6 min read"}
        </p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">
          <p>
            {es
              ? "Pregunta a un asistente de IA cuánto vale una empresa y te dará una respuesta segura y bien redactada. Lo que no siempre te dirá es de dónde salen los múltiplos, qué tipo de descuento ha usado o si ha sumado la deuda. Para trabajo financiero, eso es un problema: una cifra plausible no es lo mismo que una cifra que puedes defender."
              : "Ask an AI assistant what a company is worth and you’ll get a confident, well-written answer. What it won’t always tell you is where the multiples came from, what discount rate it used, or whether it remembered the debt. For finance work that’s a problem: a plausible number is not the same as a number you can defend."}
          </p>
          <p>
            {es
              ? <>Por eso FinancePlots tiene ahora un <strong className="text-white">conector para Claude</strong>. Una vez conectado, Claude deja de estimar: llama a las mismas calculadoras y fuentes de datos que usa esta web, y te dice qué herramienta ha utilizado.</>
              : <>That’s why FinancePlots now has a <strong className="text-white">connector for Claude</strong>. Once it’s connected, Claude stops estimating: it calls the same calculators and data sources this site uses, and tells you which tool it used.</>}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">{es ? "Qué es un conector" : "What a connector is"}</h2>
          <p>
            {es
              ? "Los conectores se basan en MCP, un estándar abierto que permite a un asistente de IA usar herramientas externas. Tú preguntas en lenguaje normal; Claude decide qué herramienta necesita, le pasa tus cifras y te explica el resultado. No tienes que aprender ningún comando."
              : "Connectors are built on MCP, an open standard that lets an AI assistant use outside tools. You ask in plain language; Claude decides which tool it needs, passes it your numbers and explains the result. There’s nothing to learn."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">{es ? "Qué puedes pedirle" : "What you can ask it"}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <tbody className="divide-y divide-gray-800">
                {tools.map(([name, desc]) => (
                  <tr key={name}>
                    <td className="py-3 pr-6 text-blue-300 font-medium align-top whitespace-nowrap">{name}</td>
                    <td className="py-3 text-gray-300">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            {es
              ? "Las calculadoras usan exactamente el mismo código que las herramientas de la web, así que Claude y la web no pueden darte cifras distintas para los mismos datos."
              : "The calculators run the exact same code as the tools on this site, so Claude and the website can’t give you different figures for the same inputs."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">{es ? "Un ejemplo: ¿cuánto vale una startup?" : "An example: what is a startup worth?"}</h2>
          <p>
            {es
              ? "Este es el caso que me convenció de que merecía la pena. Imagina una empresa de software sanitario con 5 M£ de ventas que crecen un 40 % al año, pero que todavía pierde 60 peniques por cada libra que factura. Tiene 3 M£ en caja, quema unos 4,5 M£ al año y su última ronda se cerró a 9 peniques por acción con 490 millones de acciones."
              : "This is the case that convinced me it was worth building. Picture a healthcare-software company with £5m of revenue growing 40% a year, but still losing 60p for every pound it bills. It has £3m in the bank, burns about £4.5m a year, and its last round closed at 9p a share with 490 million shares in issue."}
          </p>
          <p>
            {es
              ? "Una valoración clásica no sirve aquí: sin beneficios, el PER y el múltiplo de EBITDA no significan nada. Así que le pedí a Claude que la valorase de tres formas con FinancePlots:"
              : "A textbook valuation doesn’t work here: with no profits, P/E and EBITDA multiples mean nothing. So I asked Claude to value it three ways with FinancePlots:"}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 pr-6 text-gray-400 font-medium">{es ? "Método" : "Method"}</th>
                  <th className="text-left py-3 pr-6 text-gray-400 font-medium">{es ? "Valor de las acciones" : "Equity value"}</th>
                  <th className="text-left py-3 text-gray-400 font-medium">{es ? "Base" : "Basis"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {results.map(([m, v, b]) => (
                  <tr key={m}>
                    <td className="py-3 pr-6 text-blue-300 font-medium">{m}</td>
                    <td className="py-3 pr-6 text-white font-semibold">{v}</td>
                    <td className="py-3 text-gray-300">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            {es
              ? "El DCF sigue el método que Aswath Damodaran propone para empresas jóvenes. No abandona el descuento de flujos: lo adapta."
              : "The DCF follows the method Aswath Damodaran sets out for young companies. It doesn’t abandon discounted cash flow — it adapts it."}
          </p>
          <Bullets
            items={
              es
                ? [
                    "Las ventas crecen al 40 % cinco años y luego frenan hasta el 2,5 % en el año 10.",
                    "El margen pasa del −60 % actual al 14,7 % típico del sector (datos de Damodaran, enero 2026).",
                    "El crecimiento se paga: cada 1,25 £ de ventas nuevas exige 1 £ de inversión.",
                    "Las pérdidas pasadas (17 M£) ahorran impuestos hasta el año 9.",
                    "El coste de capital baja del 12 % al 8,2 % a medida que la empresa madura.",
                    "Y lo más importante: una probabilidad del 30 % de que no llegue a madurar.",
                  ]
                : [
                    "Revenue grows at 40% for five years, then slows to 2.5% by year 10.",
                    "The margin moves from today’s −60% to the industry’s typical 14.7% (Damodaran data, January 2026).",
                    "Growth has to be paid for: every £1.25 of new revenue needs £1 of investment.",
                    "Past losses (£17m) shelter profits from tax until year 9.",
                    "The cost of capital falls from 12% to 8.2% as the business matures.",
                    "And most important: a 30% chance it never gets there.",
                  ]
            }
          />
          <p>
            {es
              ? <>La lección no está en ninguna de las tres cifras, sino en la distancia entre ellas. <strong className="text-white">El precio de una ronda no es una valoración</strong>: es lo que un inversor pagó por acciones preferentes, que cobran antes que nadie si las cosas van mal. El DCF, en cambio, pregunta qué vale el negocio por sí mismo, y dice que casi todo su valor depende de un futuro que empieza dentro de siete años. Esa conversación —¿qué tiene que salir bien para justificar 9 peniques?— es mucho más útil que cualquier cifra aislada.</>
              : <>The lesson isn’t in any of the three numbers but in the gap between them. <strong className="text-white">A round price is not a valuation</strong>: it’s what an investor paid for preferred shares that get paid first if things go wrong. The DCF asks what the business itself is worth — and says almost all of that value depends on a future that starts seven years from now. That conversation — what has to go right to justify 9p? — is far more useful than any single figure.</>}
          </p>
          <p>
            {es
              ? "Y como todos los supuestos están a la vista, puedes cambiar uno —¿y si el margen objetivo fuera del 20 %?— y ver el efecto al momento."
              : "And because every assumption is on the table, you can change one — what if the target margin were 20%? — and see the effect straight away."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">{es ? "Cómo conectarlo en dos minutos" : "How to connect it in two minutes"}</h2>
          <Bullets
            items={
              es
                ? [
                    <>En Claude, ve a <strong className="text-white">Settings → Connectors → Add custom connector</strong>.</>,
                    <>Ponle de nombre FinancePlots y pega esta URL: <code className="text-blue-300 break-all">{MCP_URL}</code></>,
                    "En un chat nuevo, activa FinancePlots en el menú de herramientas y pregunta.",
                  ]
                : [
                    <>In Claude, go to <strong className="text-white">Settings → Connectors → Add custom connector</strong>.</>,
                    <>Name it FinancePlots and paste this URL: <code className="text-blue-300 break-all">{MCP_URL}</code></>,
                    "In a new chat, switch FinancePlots on in the tools menu and ask away.",
                  ]
            }
          />
          <p>
            {es
              ? <>Es gratis, no necesita cuenta y no guarda lo que envías. Hay instrucciones para Claude Code y otras apps en la <Link href="/mcp" className="text-blue-400 hover:text-blue-300">página del conector</Link>.</>
              : <>It’s free, needs no account and doesn’t store what you send. There are instructions for Claude Code and other apps on the <Link href="/mcp" className="text-blue-400 hover:text-blue-300">connector page</Link>.</>}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">{es ? "Lo que no hace" : "What it won’t do"}</h2>
          <p>
            {es
              ? "No recomienda inversiones. El filtro de acciones aplica los criterios que tú fijas y devuelve las empresas por orden alfabético, sin puntuaciones ni rankings. Y un modelo solo es tan bueno como sus supuestos: la herramienta hace las cuentas bien, pero el crecimiento, el margen o la probabilidad de fracaso los decides tú."
              : "It doesn’t recommend investments. The stock screener applies the criteria you set and lists companies alphabetically, with no scores or rankings. And a model is only as good as its assumptions: the tool gets the arithmetic right, but the growth, the margin and the odds of failure are your call."}
          </p>
        </div>

        <ShareButtons url={URL} title={es ? "FinancePlots ya funciona dentro de Claude" : TITLE} />

        <div className="mt-14 bg-[#0d1426] border border-blue-700/40 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">{es ? "Conecta FinancePlots a Claude" : "Connect FinancePlots to Claude"}</h3>
          <p className="text-gray-400 text-sm mb-6">
            {es ? "Una URL, dos minutos, gratis." : "One URL, two minutes, free."}
          </p>
          <Link href="/mcp" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition inline-block">
            {es ? "Cómo conectarlo" : "How to connect"}
          </Link>
        </div>

        <p className="text-gray-600 text-xs mt-8 text-center">
          {es
            ? "Este artículo es solo para fines informativos y no constituye asesoramiento financiero. La empresa del ejemplo es ficticia."
            : "This article is for informational purposes only and does not constitute financial advice. The company in the example is fictional."}
        </p>
      </BlogArticleShell>
    </main>
  );
}
