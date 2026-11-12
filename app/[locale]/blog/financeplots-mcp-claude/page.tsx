import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import BlogArticleShell from "@/components/BlogArticleShell";
import CopyText from "@/components/CopyText";

const URL = "https://www.financeplots.com/blog/financeplots-mcp-claude";
const TITLE = "FinancePlots Inside Claude: 17 Finance Tools You Can Just Ask For";
const DESCRIPTION =
  "Connect FinancePlots to Claude in a minute and ask in plain English: UK take-home pay, mortgages, a life plan, the real return on your savings, break-even, valuations, US macro data, live markets and a stock screener. Real answers from the connector, free.";

const MCP_URL = "https://www.financeplots.com/api/mcp";
const CLAUDE_CODE_CMD = `claude mcp add --transport http financeplots ${MCP_URL}`;

export const metadata: Metadata = {
  title: TITLE, // the layout's template adds " | FinancePlots"
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, siteName: "FinancePlots", type: "article", images: [{ url: "https://www.financeplots.com/og-image.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["https://www.financeplots.com/og-image.png"] },
};

type Props = { params: Promise<{ locale: string }> };

// Every figure below is a real answer from the live connector (/api/mcp),
// called on 12 Nov 2026, and every chart is the PNG it returned
// (public/blog/financeplots-mcp/). Re-run them if the formulas change.

function Figure({ src, alt, caption, height = 450 }: { src: string; alt: string; caption: string; height?: number }) {
  return (
    <figure className="not-prose my-8">
      <Image src={src} alt={alt} width={800} height={height} className="w-full h-auto rounded-xl border border-gray-800" />
      <figcaption className="text-xs text-gray-500 mt-2 leading-relaxed">{caption}</figcaption>
    </figure>
  );
}

function Ask({ q, label }: { q: string; label: string }) {
  return (
    <div className="not-prose bg-blue-600/10 border border-blue-600/20 rounded-xl px-5 py-4 my-6">
      <p className="text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-1">{label}</p>
      <p className="text-blue-100 italic">“{q}”</p>
    </div>
  );
}

export default async function FinancePlotsMcpClaude({ params }: Props) {
  const { locale } = await params;
  const es = locale === "es";
  const h2 = "text-2xl font-bold text-white mt-10";
  const h3 = "text-lg font-semibold text-white mt-6";
  const ask = es ? "Pregúntale a Claude" : "Ask Claude";

  const tools: { group: string; items: [string, string][] }[] = es
    ? [
        { group: "Tu dinero", items: [["take_home_pay", "Sueldo neto en Reino Unido"], ["loan_repayment", "Préstamos e hipotecas, con amortizaciones anticipadas"], ["compound_interest", "Interés compuesto"], ["investment_return", "Rentabilidad real (XIRR)"], ["life_plan", "Plan de vida y patrimonio"]] },
        { group: "Tu negocio", items: [["break_even", "Punto muerto"], ["business_valuation", "Valoración DCF y por múltiplos"], ["industry_multiples", "Múltiplos por sector"], ["startup_valuation", "Startups: Damodaran, ronda y runway"]] },
        { group: "Mercados", items: [["us_macro_indicators", "Economía de EE. UU. (FRED)"], ["market_snapshot", "Índices, divisas, oro, petróleo, Bitcoin"], ["price_history", "Histórico de precios"], ["portfolio_analysis", "Riesgo y rentabilidad de una cartera"]] },
        { group: "Empresas", items: [["screen_stocks", "Screener con tus criterios"], ["screener_metrics", "Las medidas del screener"], ["company_profile", "Ratios y 10 años de cuentas"], ["company_snowflake", "El copo de nieve"]] },
      ]
    : [
        { group: "Your money", items: [["take_home_pay", "UK take-home pay"], ["loan_repayment", "Loans and mortgages, with overpayments"], ["compound_interest", "Compound interest"], ["investment_return", "Real annual return (XIRR)"], ["life_plan", "Life plan and net worth"]] },
        { group: "Your business", items: [["break_even", "Break-even"], ["business_valuation", "DCF and multiples valuation"], ["industry_multiples", "Multiples by industry"], ["startup_valuation", "Startups: Damodaran, round price, runway"]] },
        { group: "Markets", items: [["us_macro_indicators", "US economy (FRED)"], ["market_snapshot", "Indices, FX, gold, oil, Bitcoin"], ["price_history", "Price history"], ["portfolio_analysis", "Portfolio risk and return"]] },
        { group: "Companies", items: [["screen_stocks", "Screener on your criteria"], ["screener_metrics", "The screener's measures"], ["company_profile", "Ratios and ten years of accounts"], ["company_snowflake", "The snowflake"]] },
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
            datePublished: "2026-11-12",
            image: "https://www.financeplots.com/blog/financeplots-mcp/take-home-pay.png",
            author: { "@type": "Person", name: "Javier Audibert" },
            publisher: { "@type": "Organization", name: "FinancePlots", logo: { "@type": "ImageObject", url: "https://www.financeplots.com/logo-sm.png" } },
            mainEntityOfPage: { "@type": "WebPage", "@id": URL },
          }),
        }}
      />
      <BlogArticleShell>
        <Link href="/blog" className="text-blue-400 text-sm hover:text-blue-300 transition mb-8 inline-block">
          {es ? "← Volver al Blog" : "← Back to Blog"}
        </Link>

        <span className="block text-xs font-semibold text-cyan-400 uppercase tracking-wider">{es ? "IA y Agentes" : "AI & Agents"}</span>
        <h1 className="text-4xl font-bold mt-2 mb-3 leading-tight">
          {es ? "FinancePlots dentro de Claude: 17 herramientas de finanzas que solo tienes que pedir" : TITLE}
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          {es ? "Noviembre 2026 · 7 min de lectura · Por Javier Audibert" : "November 2026 · 7 min read · By Javier Audibert"}
        </p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">
          <p>
            {es
              ? "Le pregunté a Claude: \"Gano 110.000 libras y meto un 5% en el plan de pensiones. ¿Cuánto me llega al mes?\". La respuesta fue 5.855,62 libras. No \"unas 5.800\": 5.855,62, con el impuesto, la Seguridad Social británica y la pensión desglosados. Y una línea más que no le había pedido: de las próximas 100 libras que gane, Hacienda se queda con 58,70."
              : "I asked Claude: “I earn £110,000 and put 5% into my pension. What lands in my account each month?” The answer was £5,855.62. Not “about £5,800”: £5,855.62, with income tax, National Insurance and the pension broken out. And one line I hadn't asked for: of the next £100 I earn, the taxman keeps £58.70."}
          </p>
          <p>
            {es
              ? "Claude no lo calculó de cabeza. Llamó a FinancePlots, que hizo la cuenta con las mismas fórmulas que la calculadora de la web, y le devolvió las cifras y un gráfico. Eso es lo que hace un conector MCP, y FinancePlots tiene uno, gratis y sin registro. Este artículo es la visita guiada: qué puedes pedirle, con respuestas reales."
              : "Claude didn't work that out in its head. It called FinancePlots, which ran the sums with the same formulas as the calculator on this site and sent back the figures and a chart. That's what an MCP connector does, and FinancePlots has one — free, no signup. This article is the guided tour: what you can ask it, with real answers."}
          </p>

          <h2 className={h2}>{es ? "Qué es un MCP, en un párrafo" : "What an MCP is, in one paragraph"}</h2>
          <p>
            {es
              ? "Un modelo de lenguaje escribe muy bien y calcula regular. No sabe la inflación de este mes ni a cuánto cerró el S&P 500 ayer, y en una tabla de amortización de 300 cuotas acaba equivocándose. MCP (Model Context Protocol) es un estándar abierto que deja a un asistente usar herramientas externas: piensa en un USB-C para la IA. Con FinancePlots conectado, Claude decide qué herramienta necesita, le pasa tus números, recibe el resultado exacto y te lo explica — diciéndote qué herramienta ha usado. Tú pones la pregunta; las cuentas las hace el código."
              : "A language model writes well and calculates so-so. It doesn't know this month's inflation or where the S&P 500 closed yesterday, and somewhere in a 300-payment amortisation table it slips. MCP (Model Context Protocol) is an open standard that lets an assistant use outside tools: think USB-C for AI. With FinancePlots connected, Claude picks the tool it needs, passes it your numbers, gets the exact result back and explains it — telling you which tool it used. You bring the question; code does the maths."}
          </p>

          <h2 className={h2}>{es ? "Conectarlo: un minuto" : "Connecting it: one minute"}</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>{es ? "En Claude (web o app de escritorio), ve a Ajustes → Conectores." : "In Claude (web or desktop app), go to Settings → Connectors."}</li>
            <li>{es ? "Pulsa \"Añadir conector personalizado\"." : "Click “Add custom connector”."}</li>
            <li>{es ? "Llámalo FinancePlots, pega esta dirección y pulsa Añadir:" : "Name it FinancePlots, paste this address and click Add:"}</li>
          </ol>
        </div>

        <div className="my-4">
          <CopyText text={MCP_URL} copyLabel={es ? "Copiar" : "Copy"} copiedLabel={es ? "Copiado" : "Copied"} event={["connector_copy", { what: "url" }]} />
        </div>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">
          <p>
            {es
              ? "En un chat nuevo, activa FinancePlots en el menú de herramientas y pregunta. Si usas Claude Code, basta con una línea en la terminal:"
              : "In a new chat, switch FinancePlots on in the tools menu and ask away. If you use Claude Code, it's one line in a terminal:"}
          </p>
        </div>

        <div className="my-4">
          <CopyText text={CLAUDE_CODE_CMD} copyLabel={es ? "Copiar" : "Copy"} copiedLabel={es ? "Copiado" : "Copied"} event={["connector_copy", { what: "claude_code" }]} />
        </div>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">
          <p>
            {es
              ? "Cualquier otra aplicación que acepte conectores MCP remotos sirve con la misma dirección. Estas son las 17 herramientas que tendrá a mano:"
              : "Any other app that accepts remote MCP connectors works with the same address. These are the 17 tools it gets:"}
          </p>
        </div>

        <div className="not-prose grid sm:grid-cols-2 gap-3 my-6">
          {tools.map((g) => (
            <div key={g.group} className="bg-[#0d1426] border border-gray-800 rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">{g.group}</p>
              <ul className="space-y-1.5">
                {g.items.map(([name, desc]) => (
                  <li key={name} className="text-sm">
                    <code className="text-cyan-300 text-xs">{name}</code>
                    <span className="text-gray-400"> — {desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">
          <h2 className={h2}>{es ? "1. Tu sueldo y tus ahorros" : "1. Your pay and your savings"}</h2>
          <p>
            {es
              ? "Volvamos a las 110.000 libras. Ese 58,7% marginal no es un error: entre 100.000 y 125.140 libras, el Reino Unido te quita 1 libra de mínimo exento por cada 2 que ganas, y el tipo real se dispara. El gráfico que devuelve la herramienta lo enseña de un vistazo:"
              : "Back to the £110,000. That 58.7% marginal rate isn't a bug: between £100,000 and £125,140 the UK takes away £1 of tax-free allowance for every £2 you earn, and the real rate shoots up. The chart the tool sends back shows it at a glance:"}
          </p>
        </div>

        <Figure
          src="/blog/financeplots-mcp/take-home-pay.png"
          alt={es ? "Gráfico de barras: a dónde va el sueldo, de 0 a 225.000 libras, con la marca en 110.000" : "Bar chart: where the salary goes from £0 to £225,000, marked at £110,000"}
          caption={es ? "Respuesta real de take_home_pay para 110.000 libras, ejercicio 2026/27." : "Real take_home_pay answer for £110,000, tax year 2026/27."}
        />

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">
          <p>
            {es
              ? "La siguiente pregunta es la interesante: \"¿Y si subo la aportación por salary sacrifice hasta bajar de 100.000?\". Con un 14,2% recuperas el mínimo exento entero. El neto anual baja 4.970 libras, pero tu pensión recibe 10.120 libras más. Cada libra que dejas de cobrar mete más de dos en tu fondo, y el tipo marginal cae al 36%. Eso, que un asesor te explicaría en media hora, son dos preguntas."
              : "The next question is the interesting one: “What if I raise my salary sacrifice until I'm under £100,000?” At 14.2% you get the whole allowance back. Your yearly take-home drops by £4,970, but your pension gets £10,120 more. Every pound you give up puts more than two in your pot, and the marginal rate falls to 36%. What an adviser would explain in half an hour takes two questions."}
          </p>

          <h3 className={h3}>{es ? "La hipoteca, sin hoja de cálculo" : "The mortgage, without a spreadsheet"}</h3>
          <Ask label={ask} q={es ? "Hipoteca de 250.000 libras al 4,5% a 25 años. ¿Y si pago 200 libras más al mes?" : "£250,000 mortgage at 4.5% over 25 years. What if I overpay £200 a month?"} />
          <p>
            {es
              ? "Cuota de 1.389,58 libras y 166.874 libras de intereses en total. Con las 200 libras extra, la terminas 61 meses antes y te ahorras 38.458 libras de intereses. También te dice qué porcentaje del saldo amortizas cada año, porque muchas hipotecas fijas en Reino Unido solo permiten un 10% anual sin penalización."
              : "A payment of £1,389.58 and £166,874 of interest in all. With the extra £200 you're done 61 months early and save £38,458 of interest. It also tells you what share of the balance you overpaid each year, because many UK fixed-rate deals only allow about 10% a year without a charge."}
          </p>
        </div>

        <Figure
          src="/blog/financeplots-mcp/mortgage.png"
          alt={es ? "Gráfico de barras: intereses y capital pagados cada año de una hipoteca a 25 años" : "Bar chart: interest and capital repaid each year of a 25-year mortgage"}
          caption={es ? "loan_repayment: los primeros años pagas sobre todo intereses." : "loan_repayment: in the early years, you mostly pay interest."}
        />

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">
          <h3 className={h3}>{es ? "¿Cuánto he ganado de verdad?" : "What have I really made?"}</h3>
          <p>
            {es
              ? "La pregunta que casi nadie sabe contestar. Si metiste 5.000 dólares cada enero de 2021 a 2025 y hoy tienes 31.500, has ganado un 26%... pero repartido en casi seis años y con el dinero entrando poco a poco. La herramienta investment_return calcula la rentabilidad anual real (XIRR): un 6,14% al año. Y si le pides comparar, repite exactamente los mismos ingresos en el índice que elijas: en el S&P 500 habrían sido unos 42.400 dólares, un 14,31% al año (solo precio, sin dividendos)."
              : "The question almost nobody can answer. If you put in $5,000 every January from 2021 to 2025 and it's worth $31,500 today, you've made 26%... but spread over almost six years, with the money arriving bit by bit. The investment_return tool works out the real annual return (XIRR): 6.14% a year. Ask it to compare and it replays exactly the same deposits in an index you name: in the S&P 500 they'd be worth about $42,400, 14.31% a year (price only, no dividends)."}
          </p>
        </div>

        <Figure
          src="/blog/financeplots-mcp/investment-return.png"
          alt={es ? "Gráfico: dinero aportado frente al mismo dinero invertido en el S&P 500" : "Chart: money put in against the same money in the S&P 500"}
          caption={es ? "investment_return con comparación. Las rentabilidades pasadas no dicen nada de las futuras." : "investment_return with a comparison. Past returns say nothing about future ones."}
        />

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">
          <p>
            {es
              ? "Y la más ambiciosa, life_plan, proyecta los ahorros, la casa, las deudas y el patrimonio de un hogar año a año, con eventos de vida — comprar casa, un bebé, una excedencia, la jubilación — y un Plan B para comparar. Un hogar que ingresa 60.000 libras netas, gasta 30.000 más 1.500 de alquiler al mes y tiene 20.000 ahorradas pasa de 100.000 libras de patrimonio (en dinero de hoy) en 2031. Todo con supuestos que pones tú, no previsiones."
              : "And the most ambitious one, life_plan, projects a household's savings, home, debts and net worth year by year, with life events — buying a home, a baby, a career break, retirement — and a Plan B to compare. A household taking home £60,000, spending £30,000 plus £1,500 a month in rent, with £20,000 saved, passes £100,000 of net worth (in today's money) in 2031. All on assumptions you set, not forecasts."}
          </p>

          <h2 className={h2}>{es ? "2. Tu negocio" : "2. Your business"}</h2>
          <Ask label={ask} q={es ? "Mi cafetería tiene 120.000 libras de costes fijos al año. Vendo el café a 4,50 y me cuesta 1,60. ¿Cuántos tengo que vender para no perder dinero?" : "My café has £120,000 of fixed costs a year. I sell coffee at £4.50 and it costs me £1.60. How many do I need to sell to break even?"} />
          <p>
            {es
              ? "41.380 cafés al año, unas 186.000 libras de ventas. Si hoy vendes 50.000, tu margen de seguridad es del 17%: podrías perder uno de cada seis clientes antes de entrar en pérdidas. Para valorar una empresa tienes business_valuation (DCF y múltiplos EV/EBITDA, EV/ventas y PER de su sector, con descuento por ser privada) e industry_multiples con las medias por sector."
              : "41,380 coffees a year, about £186,000 of sales. If you sell 50,000 today, your margin of safety is 17%: you could lose one customer in six before you make a loss. To value a company there's business_valuation (DCF plus EV/EBITDA, EV/sales and P/E multiples for its industry, with a private-company discount) and industry_multiples with the averages by industry."}
          </p>
          <p>
            {es
              ? "Para startups, startup_valuation aplica el método de Damodaran para empresas jóvenes y con pérdidas, el precio implícito en una ronda y los meses de runway. Lo que más me gusta es que te avisa: con un SaaS de 2 millones de ingresos y un margen del −25%, la herramienta advierte que el múltiplo de ventas del sector probablemente sobrevalora la empresa, porque refleja compañías cotizadas con un 33% de margen. Y con 1,5 millones en caja quemando 900.000 al año, te quedan 20 meses."
              : "For startups, startup_valuation applies Damodaran's method for young, loss-making companies, the price implied by a funding round and the months of runway. What I like most is that it warns you: for a SaaS with £2m of revenue and a −25% margin, it flags that the industry's revenue multiple probably overstates the value, because it reflects listed companies with 33% margins. And with £1.5m in the bank burning £900,000 a year, you have 20 months."}
          </p>

          <h2 className={h2}>{es ? "3. Mercados y economía, en directo" : "3. Markets and the economy, live"}</h2>
          <Ask label={ask} q={es ? "¿Cómo está la economía de EE. UU. ahora mismo?" : "How is the US economy doing right now?"} />
          <p>
            {es
              ? "us_macro_indicators lee la Reserva Federal (FRED) en el momento. Hoy: inflación del 4,1% en octubre (la subyacente, 2,9%), paro del 4,1%, tipos de la Fed en el 3,88% y el bono a 10 años en el 4,88%. Claude no tiene que recordar nada: lo consulta. Lo mismo con market_snapshot (índices, divisas, oro, petróleo y Bitcoin), price_history (cierres, media de 200 sesiones, máximos, mínimos y volatilidad) y portfolio_analysis, que te da rentabilidad, volatilidad, Sharpe, VaR y cuánto riesgo aporta cada posición en una cartera de hasta ocho."
              : "us_macro_indicators reads the Federal Reserve's FRED database on the spot. Today: inflation at 4.1% in October (2.9% core), unemployment at 4.1%, the Fed funds rate at 3.88% and the 10-year Treasury at 4.88%. Claude doesn't have to remember anything: it looks it up. Same with market_snapshot (indices, currencies, gold, oil and Bitcoin), price_history (closes, 200-day average, highs, lows and volatility) and portfolio_analysis, which gives return, volatility, Sharpe ratio, VaR and each holding's share of the risk in a portfolio of up to eight."}
          </p>

          <h2 className={h2}>{es ? "4. Empresas cotizadas" : "4. Listed companies"}</h2>
          <Ask label={ask} q={es ? "Enséñame empresas del IBEX 35 con rentabilidad sobre fondos propios por encima del 15% y PER por debajo de 15." : "Show me IBEX 35 companies with return on equity above 15% and a P/E below 15."} />
          <p>
            {es
              ? "Ocho de las 35 cumplen los dos criterios, y una se queda fuera por falta de datos. El screener cubre el S&P 500, el Nasdaq-100, el FTSE 100 y el IBEX 35 con datos que se actualizan cada semana, y tiene una regla que no se salta: filtra por los criterios que pones tú y devuelve los resultados por orden alfabético. Nunca puntúa, ordena ni recomienda."
              : "Eight of the 35 meet both criteria, and one is left out for missing data. The screener covers the S&P 500, Nasdaq-100, FTSE 100 and IBEX 35 with data refreshed weekly, and it has one rule it never breaks: it filters by the criteria you set and returns the matches in alphabetical order. It never scores, ranks or recommends."}
          </p>
          <p>
            {es
              ? "company_profile te da los ratios de una empresa frente al resto de su índice y, si cotiza en EE. UU., hasta diez años de ventas, beneficio, caja y deuda sacados de sus cuentas en la SEC. Y company_snowflake los dibuja como un copo de nieve, para una empresa o dos superpuestas. Aquí, Costco y Apple, las dos que salían en mi artículo sobre el ROCE:"
              : "company_profile gives you one company's ratios against the rest of its index and, for US listings, up to ten years of revenue, profit, cash and debt from its SEC filings. And company_snowflake draws them as a snowflake, for one company or two on top of each other. Here are Costco and Apple, two of the companies from my ROCE article:"}
          </p>
        </div>

        <Figure
          src="/blog/financeplots-mcp/snowflake.png"
          height={620}
          alt={es ? "Gráfico radar: ratios de Costco y Apple frente al S&P 500" : "Radar chart: Costco and Apple ratios against the S&P 500"}
          caption={
            es
              ? "company_snowflake. Más hacia fuera = una cifra más alta que la de más empresas del índice, no mejor. No es una puntuación."
              : "company_snowflake. Further out = a higher figure than more of the index, not a better one. Not a score."
          }
        />

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">
          <p>
            {es ? (
              <>
                Se ve el contraste del <Link href="/blog/roce-margin-turnover" className="text-blue-400 hover:text-blue-300">artículo sobre el ROCE</Link>: Apple sale mucho más hacia fuera en margen y rentabilidad; Costco, en valoración — su PER de 50 es más alto que el del 89% del S&P 500.
              </>
            ) : (
              <>
                You can see the contrast from the <Link href="/blog/roce-margin-turnover" className="text-blue-400 hover:text-blue-300">ROCE article</Link>: Apple reaches much further out on margin and returns; Costco on valuation — its P/E of 50 is higher than 89% of the S&P 500.
              </>
            )}
          </p>

          <h2 className={h2}>{es ? "Gráficos que puedes tocar" : "Charts you can touch"}</h2>
          <p>
            {es
              ? "En Claude, los gráficos no llegan como imagen: se abren como una pequeña app dentro del chat (MCP Apps). Pasas el ratón y ves cada valor, y con un clic los conviertes en tabla. En las aplicaciones que no lo admiten, llega la imagen que ves en este artículo. Y cada respuesta trae un enlace a la herramienta de la web con tus números ya puestos, por si quieres seguir allí."
              : "In Claude, charts don't arrive as pictures: they open as a small app inside the chat (MCP Apps). Hover for each value, and one click turns them into a table. In apps that don't support that, you get the image you see in this article. And every answer carries a link to the tool on the site with your numbers already filled in, in case you want to carry on there."}
          </p>

          <h2 className={h2}>{es ? "Lo mejor: encadenar herramientas" : "The best part: chaining tools"}</h2>
          <p>
            {es
              ? "Una calculadora te contesta una pregunta. Claude con 17 herramientas contesta la pregunta que de verdad tenías, que casi nunca cabe en una sola. Unos ejemplos que funcionan:"
              : "A calculator answers one question. Claude with 17 tools answers the question you actually had, which rarely fits in one. A few that work:"}
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {es
                ? "\"¿Qué sueldo necesito para cobrar 5.000 libras netas al mes? Con ese neto, ¿me puedo permitir una hipoteca de 300.000 al 4,5%?\" — take_home_pay al revés, y luego loan_repayment."
                : "“What salary do I need to take home £5,000 a month? On that, can I afford a £300,000 mortgage at 4.5%?” — take_home_pay in reverse, then loan_repayment."}
            </li>
            <li>
              {es
                ? "\"Mira el tipo de la Fed y úsalo como tipo sin riesgo para el Sharpe de mi cartera.\" — us_macro_indicators y luego portfolio_analysis."
                : "“Check the Fed funds rate and use it as the risk-free rate for my portfolio's Sharpe ratio.” — us_macro_indicators, then portfolio_analysis."}
            </li>
            <li>
              {es
                ? "\"Compara mi plan con un Plan B en el que me tomo un año sabático en 2029.\" — life_plan con los dos escenarios."
                : "“Compare my plan with a Plan B where I take a career break in 2029.” — life_plan with both scenarios."}
            </li>
            <li>
              {es
                ? "\"Valora mi empresa por DCF y por múltiplos de su sector, y explícame por qué salen distintos.\" — business_valuation e industry_multiples."
                : "“Value my company by DCF and by its industry's multiples, and explain why they differ.” — business_valuation and industry_multiples."}
            </li>
          </ul>

          <h2 className={h2}>{es ? "Lo que conviene saber" : "Good to know"}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>{es ? "Es gratis, sin cuenta ni clave." : "It's free, with no account or key."}</li>
            <li>
              {es
                ? "No guarda tus preguntas ni tus números. Solo cuento qué herramienta se usó, para saber cuáles mejorar."
                : "It doesn't save your questions or your numbers. I only count which tool was called, to know which ones to improve."}
            </li>
            <li>
              {es
                ? "Las fuentes son gratuitas y públicas: FRED, la SEC y Yahoo Finance (con retraso). Las cifras son para aprender y planificar, no asesoramiento."
                : "The sources are free and public: FRED, the SEC and Yahoo Finance (delayed). The figures are for learning and planning, not advice."}
            </li>
            <li>
              {es
                ? "Claude sigue pudiendo equivocarse al interpretar lo que pides. Comprueba siempre qué datos le ha pasado a la herramienta: aparecen en la respuesta."
                : "Claude can still misread what you asked. Always check which inputs it passed to the tool: they're in the answer."}
            </li>
          </ul>
          <p>
            {es
              ? "Hice FinancePlots para aprender y para enseñar, y esto es probablemente la forma más natural de usarlo: preguntar como le preguntarías a un compañero de finanzas, y que las cuentas las haga una fórmula que no se cansa."
              : "I built FinancePlots to learn and to teach, and this is probably the most natural way to use it: ask the way you'd ask a colleague in finance, and let a formula that never gets tired do the sums."}
          </p>
        </div>

        <div className="mt-14 bg-[#0d1426] border border-blue-700/40 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">{es ? "Conéctalo en un minuto" : "Connect it in a minute"}</h3>
          <p className="text-gray-400 text-sm mb-6">
            {es
              ? "Las instrucciones paso a paso y la lista completa de herramientas, en una página. ¿Prefieres hacer clic? Todas están también en la web."
              : "Step-by-step instructions and the full tool list, on one page. Prefer clicking? Every tool is on the site too."}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/mcp" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition inline-block">
              {es ? "Usar en Claude" : "Use in Claude"}
            </Link>
            <Link href="/tools" className="border border-gray-600 hover:border-blue-500 text-gray-200 font-semibold px-6 py-3 rounded-lg transition inline-block">
              {es ? "Ver las herramientas" : "Browse the tools"}
            </Link>
          </div>
        </div>

        <p className="text-gray-600 text-xs mt-8 text-center">
          {es
            ? "Este artículo es educativo. Las cifras son respuestas reales del conector el 12 de noviembre de 2026 con datos de ejemplo. Las empresas se citan para mostrar lo que hace la herramienta; no es una recomendación de compra o venta de ningún valor ni asesoramiento financiero."
            : "This article is educational. The figures are real answers from the connector on 12 November 2026, with example inputs. Companies are named to show what the tool does; it is not a recommendation to buy or sell any security, nor financial advice."}
        </p>
      </BlogArticleShell>
    </main>
  );
}
