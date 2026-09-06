import Link from "next/link";
import type { Metadata } from "next";
import ShareButtons from "@/components/ShareButtons";
import BlogArticleShell from "@/components/BlogArticleShell";

export const metadata: Metadata = {
  title: "Building My First AI Agents: The S&P 500 and IBEX 35 Quality Screeners",
  description:
    "How I built my first AI agents — two weekly quality screeners combining fundamental and technical filters with a Groq tool-use loop, running on GitHub Actions with no server. And why agents aren't just for engineers.",
  openGraph: {
    title: "Building My First AI Agents: The S&P 500 and IBEX 35 Quality Screeners",
    description:
      "Two weekly quality screeners combining fundamental and technical filters with a Groq tool-use loop, running on GitHub Actions with no server.",
    url: "https://www.financeplots.com/blog/building-my-first-ai-agents",
    siteName: "FinancePlots",
    type: "article",
    images: [{ url: "https://www.financeplots.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Building My First AI Agents: The S&P 500 and IBEX 35 Quality Screeners",
    description:
      "Two weekly quality screeners combining fundamental and technical filters with a Groq tool-use loop, running on GitHub Actions with no server.",
    images: ["https://www.financeplots.com/og-image.png"],
  },
  alternates: { canonical: "https://www.financeplots.com/blog/building-my-first-ai-agents" },
};

type Props = { params: Promise<{ locale: string }> };

export default async function ArticleBuildingMyFirstAIAgents({ params }: Props) {
  const { locale } = await params;
  const es = locale === "es";

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: "{\"@context\":\"https://schema.org\",\"@type\":\"Article\",\"headline\":\"Building My First AI Agents: The S&P 500 and IBEX 35 Quality Screeners\",\"description\":\"How I built my first AI agents — two weekly quality screeners combining fundamental and technical filters with a Groq tool-use loop, running on GitHub Actions with no server.\",\"url\":\"https://www.financeplots.com/blog/building-my-first-ai-agents\",\"image\":\"https://www.financeplots.com/og-image.png\",\"author\":{\"@type\":\"Person\",\"name\":\"Javier Audibert\"},\"publisher\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\",\"logo\":{\"@type\":\"ImageObject\",\"url\":\"https://www.financeplots.com/logo-sm.png\"}},\"mainEntityOfPage\":{\"@type\":\"WebPage\",\"@id\":\"https://www.financeplots.com/blog/building-my-first-ai-agents\"}}" }} />
      <BlogArticleShell>

        <Link href="/blog" className="text-blue-400 text-sm hover:text-blue-300 transition mb-8 inline-block">
          {es ? "← Volver al Blog" : "← Back to Blog"}
        </Link>

        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
          {es ? "IA y Agentes" : "AI & Agents"}
        </span>
        <h1 className="text-4xl font-bold mt-2 mb-3 leading-tight">
          {es
            ? "Construyendo mis primeros agentes de IA: los screeners del S&P 500 y el IBEX 35"
            : "Building My First AI Agents: The S&P 500 and IBEX 35 Quality Screeners"}
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          {es ? "Septiembre 2026 · 6 min de lectura · Por Javier Audibert" : "September 2026 · 6 min read · By Javier Audibert"}
        </p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">

          <p>
            {es
              ? <>Trabajé como la única persona de finanzas en un par de startups: si un sistema no existía, lo construía yo. Ese mismo instinto es el que me llevó a construir mi primer agente de IA. No fue un proyecto de "quiero aprender machine learning", fue: <em>quiero un informe cada lunes que me diga qué empresas merecen mi tiempo esta semana</em>.</>
              : <>I worked as the only finance person at a couple of startups: if a system didn't exist, I built it. That same instinct is what led me to build my first AI agent. It wasn't a "I want to learn machine learning" project, it was: <em>I want a report every Monday telling me which companies deserve my time this week</em>.</>}
          </p>
          <p>
            {es
              ? "Hoy son dos herramientas que corren solas cada semana: el Quality Screener del S&P 500 y el del IBEX 35. Criban el índice entero por fundamentales y técnicos, y un agente de IA investiga en la web y escribe el informe final. Cero servidor: el repositorio de GitHub es la base de datos y el portal lo lee en directo."
              : "Today they're two tools that run themselves every week: the S&P 500 Quality Screener and the IBEX 35 one. They screen the whole index on fundamentals and technicals, and an AI agent researches the web and writes the final report. No server: the GitHub repo is the database, and the portal reads it live."}
          </p>

          <p className="text-sm text-gray-400 bg-white/5 border border-gray-700 rounded-xl px-4 py-3">
            {es
              ? "Una aclaración antes de seguir: estos screeners son proyectos personales, construidos en mi tiempo libre para aprender. No son trabajo profesional, no están asociados a ningún empleador ni cliente, y nada de lo que publican es asesoramiento de inversión. Son una herramienta para decidir a qué empresas dedico yo mi propio tiempo de análisis — nada más."
              : "One clarification before going further: these screeners are personal projects, built in my own time to learn. They aren't professional work, they're not associated with any employer or client, and nothing they publish is investment advice. They're a tool for deciding which companies get my own research time — nothing more."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "El filtro: 6 criterios antes de tocar la IA" : "The filter: 6 criteria before any AI"}
          </h2>
          <p>
            {es
              ? "Cada ejecución descarga los componentes del índice desde Wikipedia y los pasa por seis criterios — cuatro fundamentales y dos técnicos, vía yfinance:"
              : "Every run pulls the index constituents from Wikipedia and puts them through six criteria — four fundamental, two technical, via yfinance:"}
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-white">ROE &gt; 20%</strong> — {es ? "el filtro de calidad clásico." : "the classic quality screen."}</li>
            <li><strong className="text-white">ROA &gt; 12%</strong> — {es ? "filtro duro en el S&P 500; en el IBEX 35 no, y luego explico por qué." : "a hard filter on the S&P 500; not on the IBEX 35 — more on that below."}</li>
            <li><strong className="text-white">P/E &lt; 20</strong> — {es ? "evita pagar de más por el crecimiento." : "avoids overpaying for growth."}</li>
            <li><strong className="text-white">{es ? "Deuda/Patrimonio < 100%" : "Debt/Equity < 100%"}</strong> — {es ? "descarta ROE inflado por apalancamiento." : "screens out ROE inflated by leverage."}</li>
            <li><strong className="text-white">RSI &gt; 30</strong> — {es ? "excluye sobreventa, sin techo para no penalizar el momentum." : "excludes oversold names, with no cap so momentum isn't penalized."}</li>
            <li>{es ? "Precio > media móvil de 50 días" : "Price > 50-day moving average"} — {es ? "confirma tendencia alcista." : "confirms the trend is up."}</li>
          </ul>
          <p>
            {es
              ? "De 500 empresas suelen sobrevivir una veintena. Eso importa: el modelo razona mucho mejor sobre 20 empresas preseleccionadas que sobre 500 sin filtrar."
              : "Out of 500 companies, usually a couple dozen survive. That matters: the model reasons far better over 20 pre-screened companies than over 500 unfiltered ones."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "El agente: Groq y un bucle de tool-use" : "The agent: Groq and a tool-use loop"}
          </h2>
          <p>
            {es
              ? <>Aquí está lo que convierte esto en un agente y no en un script más. El filtro es determinista: mismos datos, mismo resultado. El agente no — le das un objetivo y unas herramientas, y es <em>él</em> quien decide en cada paso si necesita usarlas. Uso Groq con gpt-oss-120b y le doy una sola herramienta: búsqueda de noticias por ticker, declarada como un esquema JSON de function-calling.</>
              : <>Here's what makes this an agent and not just another script. The filter is deterministic: same inputs, same output. The agent isn't — you give it a goal and some tools, and <em>it</em> decides at each step whether it needs them. I use Groq with gpt-oss-120b and give it one single tool: a news search per ticker, declared as a JSON function-calling schema.</>}
          </p>
          <pre className="bg-[#050810] border border-gray-800 rounded-2xl p-5 overflow-x-auto text-sm text-gray-300 font-mono leading-relaxed">{`messages = [{"role": "user", "content": prompt_analista}]

while True:
    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=messages,
        tools=tools,
        tool_choice="auto",
    )
    tool_calls = response.choices[0].message.tool_calls

    if not tool_calls:
        return response.choices[0].message.content   # done — final report

    messages.append(response.choices[0].message)
    for tool_call in tool_calls:
        ticker = json.loads(tool_call.function.arguments)["ticker"]
        messages.append({"role": "tool", "tool_call_id": tool_call.id,
                          "name": "buscar_noticias_web",
                          "content": buscar_noticias_web(ticker)})
    # loop again — the model sees the results and decides what's next`}</pre>
          <p>
            {es
              ? <>Eso es todo. Ese <code>while True</code> de veinte líneas <strong className="text-white">es</strong> el agente: un modelo, una herramienta y un bucle que da vueltas hasta que el propio modelo decide que ya no necesita nada más. Sin frameworks, sin orquestadores.</>
              : <>That's it. That twenty-line <code>while True</code> loop <strong className="text-white">is</strong> the agent: one model, one tool, and a loop that keeps going until the model itself decides it needs nothing more. No frameworks, no orchestrators.</>}
          </p>
          <p className="text-sm text-blue-300 bg-blue-600/5 border border-blue-600/20 rounded-xl px-4 py-3">
            {es
              ? "Lo que más me sorprendió al ejecutarlo por primera vez: el modelo no sigue un guion. Decide ticker a ticker cuándo buscar, y encadena varias llamadas antes de escribir. Fue la primera vez que un script mío se sintió menos como código y más como delegar una tarea."
              : "What surprised me most the first time I ran it: the model doesn't follow a script. It decides ticker by ticker when to search, chaining several calls before it writes. It was the first time a script of mine felt less like code and more like delegating a task."}
          </p>
          <p>
            {es
              ? <>Todo el pipeline vive en GitHub Actions: un cron semanal (<code>0 6 * * 1</code>, lunes 06:00 UTC) que ejecuta el screener y commitea el JSON de vuelta al repositorio. No hay servidor ni base de datos que mantener.</>
              : <>The whole pipeline lives in GitHub Actions: a weekly cron (<code>0 6 * * 1</code>, Mondays at 06:00 UTC) that runs the screener and commits the JSON back to the repo. There's no server and no database to maintain.</>}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "El segundo agente: qué significa «calidad» en cada mercado" : "The second agent: what \"quality\" means in each market"}
          </h2>
          <p>
            {es
              ? "Para el IBEX 35 la tentación era copiar el archivo entero. En vez de eso, extraje todo lo que no depende del índice — indicadores, filtro, herramienta y bucle del agente — a un módulo común. Cada screener se quedó en unas 40 líneas: cómo obtener sus tickers y una llamada al runner genérico."
              : "For the IBEX 35 the temptation was to copy the whole file. Instead, I pulled everything that doesn't depend on the index — indicators, filter, tool and agent loop — into a shared module. Each screener came down to around 40 lines: how to fetch its tickers, plus one call into the generic runner."}
          </p>
          <pre className="bg-[#050810] border border-gray-800 rounded-2xl p-5 overflow-x-auto text-sm text-gray-300 font-mono leading-relaxed">{`run_pipeline(obtener_tickers_fn=obtener_tickers_sp500,  ..., roa_minimo=0.12)  # hard filter
run_pipeline(obtener_tickers_fn=obtener_tickers_ibex35, ..., roa_minimo=None)  # not a filter`}</pre>
          <p>
            {es
              ? <>La diferencia más interesante no es técnica, es de criterio financiero. El IBEX 35 está lleno de bancos y utilities, sectores donde un ROA bajo es <em>estructural</em> del negocio, no una señal de mala calidad. Aplicar el umbral del S&P 500 habría descartado sectores enteros por razones que no dicen nada sobre esas empresas. El código solo necesitaba un parámetro; el trabajo real fue decidir cuál era el criterio correcto.</>
              : <>The most interesting difference isn't technical, it's financial judgment. The IBEX 35 is full of banks and utilities, sectors where a low ROA is <em>structural</em> to the business, not a signal of poor quality. Applying the S&P 500 threshold would have screened out entire sectors for reasons that say nothing about those companies. The code only needed one parameter; the real work was deciding what the right criterion was.</>}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Los agentes no son solo para gente de IT" : "Agents aren't just for IT people"}
          </h2>
          <p>
            {es
              ? <>Nunca me he considerado ingeniero. Construyo cosas por necesidad, y por eso creo que este patrón importa fuera del software: <strong className="text-white">un agente no es más que un modelo, unas herramientas bien definidas y un bucle</strong>. Un analista de marketing puede montar el mismo patrón para decidir cuándo consultar analíticas antes de redactar un informe; alguien en soporte, para buscar en la base de conocimiento antes de responder un ticket. Cambia la herramienta, no el bucle.</>
              : <>I've never considered myself an engineer. I build things out of necessity, and that's why I think this pattern matters outside software: <strong className="text-white">an agent is nothing more than a model, a few well-defined tools, and a loop</strong>. A marketing analyst can build the same pattern to decide when to pull analytics before drafting a report; someone in support, to search the knowledge base before answering a ticket. The tool changes, the loop doesn't.</>}
          </p>
          <p>
            {es
              ? "Y lo que más me ha quedado de estos dos proyectos pequeños: la parte difícil nunca fue la IA. Fue tener criterio claro sobre mi propio dominio — qué hace que una empresa sea de calidad, y por qué esa definición cambia entre Wall Street y el Ibex. Eso no lo automatiza nadie por ti, y es justo lo que ya hace a diario cualquier profesional de finanzas, marketing u operaciones. Construir el agente es, comparado con eso, la parte fácil."
              : "And what stayed with me most from these two small projects: the hard part was never the AI. It was having clear judgment about my own domain — what makes a company high quality, and why that definition changes between Wall Street and the Ibex. Nobody automates that for you, and it's exactly what any finance, marketing or operations professional already does every day. Building the agent is, by comparison, the easy part."}
          </p>

          <div className="bg-[#0d1426] border border-blue-600/20 rounded-2xl p-6 mt-4">
            <p className="text-blue-300 font-semibold mb-2">
              {es ? "Ver los agentes en producción →" : "See the agents in production →"}
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tools/quality-screener" className="text-blue-400 hover:text-blue-300 transition">
                  {es ? "→ Quality Screener del S&P 500" : "→ S&P 500 Quality Screener"}
                </Link>
              </li>
              <li>
                <Link href="/tools/quality-screener-ibex35" className="text-blue-400 hover:text-blue-300 transition">
                  {es ? "→ Quality Screener del IBEX 35" : "→ IBEX 35 Quality Screener"}
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <ShareButtons
          url="https://www.financeplots.com/blog/building-my-first-ai-agents"
          title={es
            ? "Construyendo mis primeros agentes de IA: los screeners del S&P 500 y el IBEX 35"
            : "Building My First AI Agents: The S&P 500 and IBEX 35 Quality Screeners"}
        />

      </BlogArticleShell>
    </main>
  );
}
