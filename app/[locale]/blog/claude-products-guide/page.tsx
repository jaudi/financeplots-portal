import Link from "next/link";
import type { Metadata } from "next";
import ShareButtons from "@/components/ShareButtons";
import BlogArticleShell from "@/components/BlogArticleShell";

export const metadata: Metadata = {
  title: "Claude.ai vs Claude Code vs Claude API: Which One Do You Need? | FinancePlots",
  description:
    "Claude comes in several forms — the chat interface, Claude Code, the API, Claude Desktop, and more. Here is a plain-English guide for finance professionals on which to use and when.",
  openGraph: {
    title: "Claude.ai vs Claude Code vs Claude API: Which One Do You Need?",
    description:
      "Claude comes in several forms — the chat interface, Claude Code, the API, Claude Desktop, and more. Here is a plain-English guide for finance professionals on which to use and when.",
    url: "https://www.financeplots.com/blog/claude-products-guide",
    siteName: "FinancePlots",
    type: "article",
    images: [{ url: "https://www.financeplots.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Claude.ai vs Claude Code vs Claude API: Which One Do You Need?",
    description:
      "Claude comes in several forms — the chat interface, Claude Code, the API, Claude Desktop, and more. Here is a plain-English guide for finance professionals on which to use and when.",
    images: ["https://www.financeplots.com/og-image.png"],
  },
  alternates: { canonical: "https://www.financeplots.com/blog/claude-products-guide" },
};

type Props = { params: Promise<{ locale: string }> };

export default async function ArticleClaudeProductsGuide({ params }: Props) {
  const { locale } = await params;
  const es = locale === "es";

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: "{\"@context\":\"https://schema.org\",\"@type\":\"Article\",\"headline\":\"Claude.ai vs Claude Code vs Claude API: Which One Do You Need?\",\"description\":\"Claude comes in several forms — the chat interface, Claude Code, the API, Claude Desktop, and more. Here is a plain-English guide for finance professionals on which to use and when.\",\"url\":\"https://www.financeplots.com/blog/claude-products-guide\",\"image\":\"https://www.financeplots.com/og-image.png\",\"author\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\"},\"publisher\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\",\"logo\":{\"@type\":\"ImageObject\",\"url\":\"https://www.financeplots.com/logo-sm.png\"}},\"mainEntityOfPage\":{\"@type\":\"WebPage\",\"@id\":\"https://www.financeplots.com/blog/claude-products-guide\"}}" }} />
      <BlogArticleShell>

        <Link href="/blog" className="text-blue-400 text-sm hover:text-blue-300 transition mb-8 inline-block">
          {es ? "← Volver al Blog" : "← Back to Blog"}
        </Link>

        <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
          {es ? "Guía" : "Guide"}
        </span>
        <h1 className="text-4xl font-bold mt-2 mb-3 leading-tight">
          {es
            ? "Claude.ai vs Claude Code vs API: ¿Cuál Necesitas?"
            : "Claude.ai vs Claude Code vs Claude API: Which One Do You Need?"}
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          {es ? "Abril 2026 · 7 min de lectura" : "April 2026 · 7 min read"}
        </p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">

          <p>
            {es
              ? "Claude no es un solo producto. Hay la interfaz web, una aplicación de escritorio, una herramienta de línea de comandos, una API para desarrolladores, e integraciones en aplicaciones de terceros. Si eres profesional de finanzas preguntándote qué versión usar, esta guía lo aclara todo."
              : "Claude is not a single product. There is the web interface, a desktop app, a command-line tool, a developer API, and integrations inside third-party applications. If you are a finance professional wondering which version to use, this guide cuts through the confusion."}
          </p>

          {/* Quick reference table */}
          <div className="bg-[#0d1426] border border-gray-800 rounded-2xl p-6 not-prose">
            <p className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-4">
              {es ? "Referencia rápida" : "Quick reference"}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-gray-400 font-semibold pb-3 pr-6">{es ? "Producto" : "Product"}</th>
                    <th className="text-gray-400 font-semibold pb-3 pr-6">{es ? "Para quién" : "Best for"}</th>
                    <th className="text-gray-400 font-semibold pb-3">{es ? "Costo" : "Cost"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {[
                    ["Claude.ai",         es ? "Todo el mundo — análisis, preguntas, escritura" : "Everyone — analysis, questions, writing",              es ? "Gratis / $20/mes Pro" : "Free / $20/mo Pro"],
                    ["Claude Desktop",    es ? "Conectar Claude a tus archivos y datos locales" : "Connecting Claude to your local files and data",      es ? "Gratis" : "Free"],
                    ["Claude Code",       es ? "Desarrolladores y usuarios técnicos — código, terminal" : "Technical users — coding, terminal, file automation", es ? "Gratis (uso API)" : "Free (uses API)"],
                    ["Claude API",        es ? "Construir aplicaciones y automatizaciones propias" : "Building your own apps and automations",             es ? "Pago por uso" : "Pay-per-token"],
                    ["Claude en apps",    es ? "Usar Claude dentro de herramientas existentes" : "Using Claude inside existing tools (Notion, VS Code)", es ? "Varía" : "Varies"],
                  ].map(([product, use, cost]) => (
                    <tr key={product}>
                      <td className="py-3 pr-6 text-white font-semibold">{product}</td>
                      <td className="py-3 pr-6 text-gray-400">{use}</td>
                      <td className="py-3 text-gray-400">{cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 1. Claude.ai */}
          <h2 className="text-2xl font-bold text-white mt-10 mb-3">
            {es ? "1. Claude.ai — La Interfaz de Chat" : "1. Claude.ai — The Chat Interface"}
          </h2>
          <p>
            {es
              ? "Claude.ai es el punto de partida para la mayoría de los profesionales de finanzas. Abres el navegador, escribes una pregunta o pegas un P&L, y Claude responde. No hay configuración, no hay código, no hay API."
              : "Claude.ai is the starting point for most finance professionals. You open a browser, type a question or paste a P&L, and Claude responds. No setup, no code, no API."}
          </p>
          <p>
            {es
              ? "La versión gratuita es capaz. El plan Pro ($20/mes) da acceso prioritario, ventanas de contexto más largas — importante cuando pegas documentos financieros grandes — y acceso a los modelos más potentes."
              : "The free tier is capable. The Pro plan ($20/month) gives priority access, longer context windows — important when pasting large financial documents — and access to the most powerful models."}
          </p>

          <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5 not-prose">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">
              {es ? "Úsalo para:" : "Use it for:"}
            </p>
            <ul className="space-y-1.5 text-sm text-gray-300">
              {(es ? [
                "Analizar un P&L pegando los datos directamente",
                "Escribir comentarios de gestión o actualizaciones para inversores",
                "Generar fórmulas de Excel a partir de una descripción",
                "Resumir informes anuales o memorandos de información",
                "Preparar preguntas y respuestas para reuniones de directorio",
              ] : [
                "Analysing a P&L by pasting the data directly",
                "Writing management commentary or investor updates",
                "Generating Excel formulas from a plain English description",
                "Summarising annual reports or information memoranda",
                "Preparing Q&A for board meetings",
              ]).map(item => (
                <li key={item} className="flex gap-2 items-start">
                  <span className="text-purple-400 shrink-0">✓</span>{item}
                </li>
              ))}
            </ul>
          </div>

          <p>
            {es
              ? "La función de carga de archivos en Claude.ai Pro merece mención especial. Puedes subir un archivo Excel, PDF o CSV y hacer preguntas directamente sobre él — sin copiar y pegar. Para un FD que quiere un análisis rápido de un documento enviado por correo, esto es muy práctico."
              : "The file upload feature in Claude.ai Pro deserves special mention. You can upload an Excel file, PDF, or CSV and ask questions directly about it — no copy-pasting. For an FD who wants a quick analysis of a document received by email, this is highly practical."}
          </p>

          {/* 2. Claude Desktop */}
          <h2 className="text-2xl font-bold text-white mt-10 mb-3">
            {es ? "2. Claude Desktop — Claude en tu Ordenador" : "2. Claude Desktop — Claude on Your Computer"}
          </h2>
          <p>
            {es
              ? "Claude Desktop es una aplicación descargable (Mac y Windows) que parece la misma interfaz de chat, pero añade algo importante: soporte para MCP (Model Context Protocol). Esto significa que puedes conectar Claude directamente a tus archivos locales, bases de datos, o cualquier herramienta que tenga un servidor MCP."
              : "Claude Desktop is a downloadable app (Mac and Windows) that looks like the same chat interface but adds one important thing: MCP (Model Context Protocol) support. This means you can connect Claude directly to your local files, databases, or any tool that has an MCP server."}
          </p>
          <p>
            {es
              ? "En la práctica para finanzas: configuras Claude Desktop para leer tu carpeta de finanzas, y luego le preguntas cosas como 'lee el archivo de presupuesto de Q1 y compara los ingresos reales con el presupuesto'. Claude accede al archivo, hace el cálculo y te da la respuesta — sin que tengas que abrir Excel."
              : "In practice for finance: you configure Claude Desktop to read your finance folder, then ask it things like 'read the Q1 budget file and compare actual revenue to budget'. Claude accesses the file, does the calculation, and gives you the answer — without you opening Excel."}
          </p>

          <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5 not-prose">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">
              {es ? "Úsalo para:" : "Use it for:"}
            </p>
            <ul className="space-y-1.5 text-sm text-gray-300">
              {(es ? [
                "Preguntar sobre archivos locales sin copiar y pegar",
                "Conectar Claude a una base de datos SQLite o Postgres local",
                "Leer múltiples archivos de una carpeta y sintetizarlos",
                "Automatizar tareas con acceso al sistema de archivos",
              ] : [
                "Asking questions about local files without copy-pasting",
                "Connecting Claude to a local SQLite or Postgres database",
                "Reading multiple files from a folder and synthesising them",
                "Automating tasks with file system access",
              ]).map(item => (
                <li key={item} className="flex gap-2 items-start">
                  <span className="text-purple-400 shrink-0">✓</span>{item}
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Claude with Excel */}
          <h2 className="text-2xl font-bold text-white mt-10 mb-3">
            {es ? "3. Claude con Excel — Dos Formas de Hacerlo" : "3. Claude with Excel — Two Ways to Do It"}
          </h2>
          <p>
            {es
              ? "Muchos profesionales de finanzas preguntan: '¿puede Claude leer mi archivo de Excel?' La respuesta es sí, pero el método depende de qué versión uses."
              : "Many finance professionals ask: 'can Claude read my Excel file?' The answer is yes, but the method depends on which version you use."}
          </p>

          <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5 not-prose space-y-4">
            <div>
              <p className="text-white font-semibold text-sm mb-1">
                {es ? "Método 1: Subir el archivo en Claude.ai Pro" : "Method 1: Upload the file in Claude.ai Pro"}
              </p>
              <p className="text-gray-400 text-sm">
                {es
                  ? "Arrastra el Excel a la ventana de chat. Claude lee el contenido y puede responder preguntas sobre él. Mejor para análisis de una sola vez."
                  : "Drag the Excel file into the chat window. Claude reads the content and can answer questions about it. Best for one-off analysis."}
              </p>
            </div>
            <div className="border-t border-gray-800 pt-4">
              <p className="text-white font-semibold text-sm mb-1">
                {es ? "Método 2: Claude Desktop con servidor MCP de archivos" : "Method 2: Claude Desktop with filesystem MCP server"}
              </p>
              <p className="text-gray-400 text-sm">
                {es
                  ? "Configuras Claude Desktop para acceder a una carpeta. Claude puede leer cualquier Excel en esa carpeta cuando se lo pides, sin subirlo manualmente. Mejor para uso repetido con múltiples archivos."
                  : "Configure Claude Desktop to access a folder. Claude can read any Excel in that folder when asked, without manual uploading. Best for repeated use across multiple files."}
              </p>
            </div>
          </div>

          <p>
            {es
              ? "Para tareas de Excel puras — escribir fórmulas, depurar errores, construir estructura de modelo — no necesitas subir nada. Simplemente describe el problema en Claude.ai y obtendrás la fórmula o solución correcta."
              : "For pure Excel tasks — writing formulas, debugging errors, building model structure — you don't need to upload anything. Simply describe the problem in Claude.ai and you will get the correct formula or solution."}
          </p>

          {/* 4. Claude Code */}
          <h2 className="text-2xl font-bold text-white mt-10 mb-3">
            {es ? "4. Claude Code — Para Usuarios Técnicos" : "4. Claude Code — For Technical Users"}
          </h2>
          <p>
            {es
              ? "Claude Code es una herramienta de línea de comandos que ejecutas en tu terminal. A diferencia de la interfaz de chat, Claude Code puede leer y escribir archivos en tu máquina, ejecutar comandos, instalar paquetes, y construir proyectos completos de software — todo en una conversación continua."
              : "Claude Code is a command-line tool you run in your terminal. Unlike the chat interface, Claude Code can read and write files on your machine, run commands, install packages, and build complete software projects — all in a continuous conversation."}
          </p>
          <p>
            {es
              ? "Para finanzas, Claude Code es más relevante si estás construyendo automatizaciones en Python, herramientas Streamlit, o scripts que procesan archivos financieros. Lo describes en lenguaje natural y Claude Code escribe el código, lo prueba, soluciona los errores y entrega algo que funciona."
              : "For finance, Claude Code is most relevant if you are building Python automations, Streamlit tools, or scripts that process financial files. You describe what you want in plain language and Claude Code writes the code, runs it, fixes errors, and delivers something that works."}
          </p>

          <pre className="bg-[#070d1a] border border-gray-800 rounded-xl p-4 text-xs text-gray-300 font-mono overflow-x-auto">
{`# Installing Claude Code
npm install -g @anthropic-ai/claude-code

# Running it in your finance project folder
cd /my-finance-scripts
claude

# Example conversation:
You: Build a Python script that reads our monthly CSV export,
     calculates gross margin by product line, and outputs a
     formatted Excel report with charts.

Claude Code: [reads your existing files, writes the script,
             installs required packages, runs it, fixes any
             errors, delivers a working script]`}
          </pre>

          <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5 not-prose">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">
              {es ? "Úsalo para:" : "Use it for:"}
            </p>
            <ul className="space-y-1.5 text-sm text-gray-300">
              {(es ? [
                "Construir scripts de Python que procesan datos financieros",
                "Crear herramientas Streamlit de cero",
                "Automatizar flujos de trabajo de informes mensuales",
                "Construir y depurar servidores MCP",
                "Gestionar archivos y carpetas de proyectos",
              ] : [
                "Building Python scripts that process financial data",
                "Creating Streamlit tools from scratch",
                "Automating monthly reporting workflows",
                "Building and debugging MCP servers",
                "Managing project files and folders",
              ]).map(item => (
                <li key={item} className="flex gap-2 items-start">
                  <span className="text-purple-400 shrink-0">✓</span>{item}
                </li>
              ))}
            </ul>
          </div>

          <p>
            {es
              ? "Claude Code no es para todos. Si nunca has abierto una terminal, empieza con Claude.ai. Si estás cómodo con Python y la terminal, Claude Code multiplica tu productividad — los scripts que antes tardaban horas ahora se hacen en minutos."
              : "Claude Code is not for everyone. If you have never opened a terminal, start with Claude.ai. If you are comfortable with Python and the terminal, Claude Code multiplies your productivity — scripts that used to take hours now take minutes."}
          </p>

          {/* 5. Claude API */}
          <h2 className="text-2xl font-bold text-white mt-10 mb-3">
            {es ? "5. La API de Claude — Para Construir Productos" : "5. The Claude API — For Building Products"}
          </h2>
          <p>
            {es
              ? "La API de Claude permite enviar mensajes a Claude programáticamente desde Python, JavaScript o cualquier otro lenguaje. Esto es lo que usas cuando quieres integrar Claude en tu propio producto, automatización o flujo de trabajo interno — no para uso personal, sino para construir algo que otros usarán."
              : "The Claude API lets you send messages to Claude programmatically from Python, JavaScript, or any language. This is what you use when you want to embed Claude into your own product, automation, or internal workflow — not for personal use, but for building something others will use."}
          </p>

          <pre className="bg-[#070d1a] border border-gray-800 rounded-xl p-4 text-xs text-gray-300 font-mono overflow-x-auto">
{`import anthropic

client = anthropic.Anthropic(api_key="your-key")

# Call Claude from your own code
message = client.messages.create(
    model="claude-haiku-4-5-20251001",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": "Summarise this P&L: Revenue £1.2M, EBITDA £180K"
    }]
)
print(message.content[0].text)`}
          </pre>

          <p>
            {es
              ? "El coste es por token (aproximadamente £0.0002 por cada 1.000 palabras procesadas). Para una automatización de informes mensuales que ejecuta 20 análisis de P&L al mes, el coste es menos de £1."
              : "The cost is per token (roughly £0.0002 per 1,000 words processed). For a monthly report automation that runs 20 P&L analyses per month, the cost is under £1."}
          </p>

          <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5 not-prose">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">
              {es ? "Úsalo para:" : "Use it for:"}
            </p>
            <ul className="space-y-1.5 text-sm text-gray-300">
              {(es ? [
                "Automatizaciones que se ejecutan en un horario (generadores de informes mensuales)",
                "Construir un chatbot financiero interno para tu equipo",
                "Procesar lotes de documentos financieros automáticamente",
                "Integrar inteligencia de Claude en tus herramientas existentes",
                "Cualquier cosa que necesite ejecutarse sin intervención humana",
              ] : [
                "Automations that run on a schedule (monthly report generators)",
                "Building an internal finance chatbot for your team",
                "Processing batches of financial documents automatically",
                "Embedding Claude intelligence into your existing tools",
                "Anything that needs to run without human involvement",
              ]).map(item => (
                <li key={item} className="flex gap-2 items-start">
                  <span className="text-purple-400 shrink-0">✓</span>{item}
                </li>
              ))}
            </ul>
          </div>

          {/* 6. Claude in Apps */}
          <h2 className="text-2xl font-bold text-white mt-10 mb-3">
            {es ? "6. Claude Dentro de Otras Aplicaciones" : "6. Claude Inside Other Applications"}
          </h2>
          <p>
            {es
              ? "Claude está integrado en un número creciente de herramientas de terceros. No necesitas saber nada de APIs ni de MCP para usarlos — simplemente aparecen como una función dentro de la herramienta que ya usas."
              : "Claude is embedded in a growing number of third-party tools. You do not need to know anything about APIs or MCP to use them — they simply appear as a feature inside the tool you already use."}
          </p>

          <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5 not-prose space-y-3">
            {(es ? [
              { tool: "Notion AI",     desc: "Escribe, resume y analiza dentro de Notion — útil para notas de reuniones del directorio y documentación de modelos financieros" },
              { tool: "VS Code",       desc: "Claude Code se integra directamente en VS Code para asistencia de codificación mientras construyes scripts de Python o herramientas Streamlit" },
              { tool: "Cursor",        desc: "Editor de código potenciado por IA popular entre desarrolladores que construyen herramientas financieras" },
              { tool: "Zapier / Make", desc: "Conecta Claude a tu stack sin código — envía datos del ERP a Claude, devuelve el análisis por correo electrónico automáticamente" },
            ] : [
              { tool: "Notion AI",     desc: "Write, summarise and analyse inside Notion — useful for board meeting notes and financial model documentation" },
              { tool: "VS Code",       desc: "Claude Code integrates directly into VS Code for coding assistance while building Python scripts or Streamlit tools" },
              { tool: "Cursor",        desc: "AI-powered code editor popular with developers building financial tools" },
              { tool: "Zapier / Make", desc: "Connect Claude to your stack without code — send ERP data to Claude, return the analysis by email automatically" },
            ]).map(({ tool, desc }) => (
              <div key={tool} className="flex gap-3">
                <span className="text-purple-400 font-bold text-sm w-28 shrink-0">{tool}</span>
                <span className="text-gray-400 text-sm">{desc}</span>
              </div>
            ))}
          </div>

          {/* Decision guide */}
          <h2 className="text-2xl font-bold text-white mt-10 mb-3">
            {es ? "¿Cuál Deberías Usar?" : "Which One Should You Use?"}
          </h2>

          <div className="bg-[#0d1426] border border-gray-800 rounded-2xl p-6 not-prose space-y-4">
            {(es ? [
              { q: "Quiero analizar un P&L ahora mismo",                   a: "Claude.ai (gratis)" },
              { q: "Quiero subir mi Excel y hacer preguntas sobre él",      a: "Claude.ai Pro ($20/mes)" },
              { q: "Quiero que Claude acceda a mis archivos locales",       a: "Claude Desktop (gratis)" },
              { q: "Quiero construir un script de Python para finanzas",    a: "Claude Code o Claude API" },
              { q: "Quiero un chatbot de finanzas para mi equipo",          a: "Claude API + Streamlit" },
              { q: "Quiero automatizar informes mensuales",                 a: "Claude API + Python" },
              { q: "Solo quiero usar Claude donde ya trabajo",              a: "Claude en apps (Notion, VS Code, Zapier)" },
            ] : [
              { q: "I want to analyse a P&L right now",                    a: "Claude.ai (free)" },
              { q: "I want to upload my Excel and ask questions about it",  a: "Claude.ai Pro ($20/mo)" },
              { q: "I want Claude to access my local files",                a: "Claude Desktop (free)" },
              { q: "I want to build a Python script for finance",           a: "Claude Code or Claude API" },
              { q: "I want a finance chatbot for my team",                  a: "Claude API + Streamlit" },
              { q: "I want to automate monthly reports",                    a: "Claude API + Python" },
              { q: "I just want to use Claude where I already work",        a: "Claude in apps (Notion, VS Code, Zapier)" },
            ]).map(({ q, a }) => (
              <div key={q} className="flex gap-4 items-start border-b border-gray-800 pb-4 last:border-0 last:pb-0">
                <span className="text-gray-300 text-sm flex-1">{q}</span>
                <span className="text-purple-300 text-sm font-semibold shrink-0 text-right">{a}</span>
              </div>
            ))}
          </div>

          {/* Pricing clarity */}
          <h2 className="text-2xl font-bold text-white mt-10 mb-3">
            {es ? "Una Cosa Importante Sobre el Precio" : "One Important Thing About Pricing"}
          </h2>
          <p>
            {es
              ? "Esta es la confusión más común entre profesionales de finanzas que empiezan con Claude:"
              : "This is the most common confusion among finance professionals starting with Claude:"}
          </p>

          <div className="bg-[#0d1426] border border-gray-800 rounded-2xl p-6 not-prose space-y-4">
            <div className="flex gap-4 items-start border-b border-gray-800 pb-4">
              <span className="text-2xl shrink-0">❌</span>
              <div>
                <p className="text-white font-semibold text-sm mb-1">
                  {es ? "Claude Pro no incluye acceso a la API" : "Claude Pro does not include API access"}
                </p>
                <p className="text-gray-400 text-sm">
                  {es
                    ? "Claude Pro ($20/mes) es una suscripción para la interfaz de chat. No puedes usar tu suscripción Pro para ejecutar scripts de Python, automatizaciones o llamadas API. Son dos productos de facturación completamente separados."
                    : "Claude Pro ($20/month) is a subscription to the chat interface. You cannot use your Pro subscription to run Python scripts, automations, or API calls. They are two completely separate billing products."}
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start border-b border-gray-800 pb-4">
              <span className="text-2xl shrink-0">✅</span>
              <div>
                <p className="text-white font-semibold text-sm mb-1">
                  {es ? "La API siempre es de pago por uso" : "The API is always pay-per-token"}
                </p>
                <p className="text-gray-400 text-sm">
                  {es
                    ? "No existe suscripción plana para el acceso a la API — ni para empresas ni para equipos. Pagas por lo que consumes. Para un informe mensual de P&L el coste es céntimos. Para miles de documentos al mes, puede ser decenas de libras. Configuras la facturación en console.anthropic.com."
                    : "There is no flat subscription for API access — not for companies, not for teams. You pay for what you use. For a monthly P&L report the cost is pennies. For thousands of documents per month, it may be tens of pounds. You set up billing at console.anthropic.com."}
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span className="text-2xl shrink-0">ℹ️</span>
              <div>
                <p className="text-white font-semibold text-sm mb-1">
                  {es ? "Claude para Equipos / Enterprise es solo para el chat" : "Claude for Teams / Enterprise is still just the chat interface"}
                </p>
                <p className="text-gray-400 text-sm">
                  {es
                    ? "Claude for Teams ($25–30/mes por usuario) añade espacios de trabajo compartidos, controles de administración y límites de uso más altos — pero sigue siendo la interfaz de chat, no acceso a la API. Si tu empresa quiere automatizaciones, necesita configurar facturación de API por separado."
                    : "Claude for Teams ($25–30/month per user) adds shared workspaces, admin controls, and higher usage limits — but it is still the chat interface, not API access. If your company wants automations, it needs to set up API billing separately."}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5 not-prose">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">
              {es ? "Regla práctica" : "Practical rule"}
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              {(es ? [
                "Análisis, comentarios, fórmulas de Excel → Claude Pro es suficiente",
                "Automatizaciones, scripts, informes mensuales sin intervención → necesitas la API",
                "Ambas cosas → necesitas Claude Pro ($20/mes) Y créditos de API por separado",
              ] : [
                "Analysis, commentary, Excel formulas → Claude Pro is enough",
                "Automations, scripts, unattended monthly reports → you need the API",
                "Both → you need Claude Pro ($20/mo) AND separate API credits",
              ]).map(item => (
                <li key={item} className="flex gap-2 items-start">
                  <span className="text-purple-400 shrink-0">→</span>{item}
                </li>
              ))}
            </ul>
          </div>

          {/* Closing */}
          <h2 className="text-2xl font-bold text-white mt-10 mb-3">
            {es ? "Empieza Simple, Escala Después" : "Start Simple, Scale Later"}
          </h2>
          <p>
            {es
              ? "La mayoría de los profesionales de finanzas que obtienen el mayor valor de Claude siguen el mismo camino: empiezan con Claude.ai para tareas cotidianas, luego descubren Claude Desktop cuando quieren acceso a archivos, y eventualmente exploran la API cuando quieren automatizar algo repetitivo."
              : "Most finance professionals who get the most value from Claude follow the same path: they start with Claude.ai for day-to-day tasks, then discover Claude Desktop when they want file access, and eventually explore the API when they want to automate something repetitive."}
          </p>
          <p>
            {es
              ? "No necesitas dominar todos los productos. Claude.ai con un buen prompt vale más que Claude Code usado a medias. Domina uno bien antes de pasar al siguiente."
              : "You do not need to master every product. Claude.ai with a good prompt is worth more than Claude Code used half-heartedly. Master one well before moving to the next."}
          </p>

          <div className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-6 not-prose">
            <p className="text-purple-300 font-bold text-sm mb-3">
              {es ? "¿Quieres aprender a usar Claude para finanzas paso a paso?" : "Want to learn how to use Claude for finance step by step?"}
            </p>
            <p className="text-gray-400 text-sm mb-4">
              {es
                ? "El track Claude & Finance de FinancePlots cubre prompting, análisis de P&L, fórmulas de Excel, la API y MCP — 50 lecciones interactivas gratuitas."
                : "FinancePlots' Claude & Finance track covers prompting, P&L analysis, Excel formulas, the API and MCP — 50 free interactive lessons."}
            </p>
            <Link
              href="/learn/claude-finance"
              className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition"
            >
              {es ? "Empezar a aprender →" : "Start learning →"}
            </Link>
          </div>

        </div>

        <ShareButtons
          url="https://www.financeplots.com/blog/claude-products-guide"
          title={es
            ? "Claude.ai vs Claude Code vs API: ¿Cuál Necesitas?"
            : "Claude.ai vs Claude Code vs Claude API: Which One Do You Need?"}
        />

      </BlogArticleShell>
    </main>
  );
}
