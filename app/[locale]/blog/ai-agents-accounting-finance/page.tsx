import Link from "next/link";
import type { Metadata } from "next";
import BlogArticleShell from "@/components/BlogArticleShell";

const BASE = "https://www.financeplots.com";
const PATH = "/blog/ai-agents-accounting-finance";
const IMAGE = `${BASE}/og-image.png`;

// Everything on this page exists in English and Spanish, metadata included.
// Product names and status checked in November 2026: Projects, Skills
// (SKILL.md), Artifacts, routines in Claude Code, Claude Code GitHub Actions,
// the Claude Agent SDK and Claude Managed Agents (beta: Anthropic hosts the
// loop and a per-session sandbox; billed on tokens plus session runtime).
// These change fast — re-check names and status before quoting them again.
const COPY = {
  en: {
    url: `${BASE}${PATH}`,
    title: "AI Agents for Accounting and Finance: Six Levels, From a Good Prompt to an Agent That Runs Itself",
    description:
      "What an AI agent actually is, its parts, and six levels of using one in accounting and finance — prompting, projects, skills (SKILL.md), artifacts, routines on your computer, and autonomous agents on the Claude API hosted in GitHub Actions or Claude Managed Agents. With the guardrails finance needs.",
  },
  es: {
    url: `${BASE}/es${PATH}`,
    title: "Agentes de IA para contabilidad y finanzas: seis niveles, de un buen prompt a un agente que trabaja solo",
    description:
      "Qué es de verdad un agente de IA, sus partes y seis niveles para usarlo en contabilidad y finanzas — prompts, proyectos, skills (SKILL.md), artifacts, rutinas en tu ordenador y agentes autónomos con la API de Claude alojados en GitHub Actions o en Claude Managed Agents. Con los controles que necesita finanzas.",
  },
};

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const es = locale === "es";
  const c = es ? COPY.es : COPY.en;
  return {
    title: c.title, // the layout's template adds " | FinancePlots"
    description: c.description,
    alternates: { canonical: c.url, languages: { en: COPY.en.url, es: COPY.es.url } },
    openGraph: { title: c.title, description: c.description, url: c.url, siteName: "FinancePlots", type: "article", locale: es ? "es_ES" : "en_GB", images: [{ url: IMAGE, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: c.title, description: c.description, images: [IMAGE] },
  };
}

type L = { en: string; es: string };

const LEVELS: { id: string; name: L; who: L; effort: L }[] = [
  { id: "prompting", name: { en: "Prompting", es: "Prompts" }, who: { en: "You ask, it answers", es: "Tú preguntas, responde" }, effort: { en: "Minutes", es: "Minutos" } },
  { id: "projects", name: { en: "Projects", es: "Proyectos" }, who: { en: "It remembers your context", es: "Recuerda tu contexto" }, effort: { en: "An hour", es: "Una hora" } },
  { id: "skills", name: { en: "Skills (SKILL.md)", es: "Skills (SKILL.md)" }, who: { en: "It follows your procedure", es: "Sigue tu procedimiento" }, effort: { en: "An afternoon", es: "Una tarde" } },
  { id: "artifacts", name: { en: "Artifacts", es: "Artifacts" }, who: { en: "It builds the tool", es: "Construye la herramienta" }, effort: { en: "An afternoon", es: "Una tarde" } },
  { id: "computer", name: { en: "Your computer + routines", es: "Tu ordenador + rutinas" }, who: { en: "It works your files, on a timer", es: "Trabaja tus archivos, con horario" }, effort: { en: "A day", es: "Un día" } },
  { id: "autonomous", name: { en: "Autonomous agents", es: "Agentes autónomos" }, who: { en: "It runs without you", es: "Trabaja sin ti" }, effort: { en: "A project", es: "Un proyecto" } },
];

function Ladder({ es }: { es: boolean }) {
  return (
    <nav aria-label={es ? "Los seis niveles" : "The six levels"} className="not-prose my-8 grid grid-cols-2 sm:grid-cols-3 gap-2">
      {LEVELS.map((s, i) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="group bg-[#0d1426] border border-gray-800 hover:border-blue-500 rounded-lg px-3 py-3 transition"
          style={{ borderLeftWidth: 4, borderLeftColor: `rgba(59,130,246,${0.25 + i * 0.15})` }}
        >
          <span className="block text-blue-400 text-xs font-bold">{es ? `Nivel ${i + 1}` : `Level ${i + 1}`}</span>
          <span className="block text-gray-100 text-sm font-semibold leading-snug group-hover:text-white">{es ? s.name.es : s.name.en}</span>
          <span className="block text-gray-500 text-xs mt-1 leading-snug">{es ? s.who.es : s.who.en}</span>
          <span className="block text-gray-600 text-[11px] mt-1">{es ? `Esfuerzo: ${s.effort.es}` : `Effort: ${s.effort.en}`}</span>
        </a>
      ))}
    </nav>
  );
}

function LevelHeading({ n, es }: { n: number; es: boolean }) {
  const s = LEVELS[n - 1];
  return (
    <h2 id={s.id} className="scroll-mt-28 flex items-center gap-3 text-2xl font-bold text-white mt-12">
      <span className="shrink-0 w-9 h-9 rounded-full bg-blue-600 text-white text-base flex items-center justify-center">{n}</span>
      {es ? s.name.es : s.name.en}
    </h2>
  );
}

/** The parts of an agent, drawn around the loop at its centre. */
function Anatomy({ es }: { es: boolean }) {
  const tr = (en: string, sp: string) => (es ? sp : en);
  const parts = [
    { icon: "🧠", h: tr("The model", "El modelo"), t: tr("Claude itself: reads, reasons, decides the next step.", "Claude: lee, razona y decide el siguiente paso.") },
    { icon: "📋", h: tr("Instructions", "Instrucciones"), t: tr("Who it is and how you work: a system prompt, project instructions, a SKILL.md.", "Quién es y cómo trabajas: system prompt, instrucciones del proyecto, un SKILL.md.") },
    { icon: "🔧", h: tr("Tools", "Herramientas"), t: tr("What it can touch: files, Excel, code, the web, your systems through MCP connectors.", "Lo que puede tocar: archivos, Excel, código, la web, tus sistemas vía conectores MCP.") },
    { icon: "🗂️", h: tr("Memory and context", "Memoria y contexto"), t: tr("What it knows before it starts: your chart of accounts, policies, last month.", "Lo que sabe antes de empezar: tu plan de cuentas, políticas, el mes pasado.") },
    { icon: "⏰", h: tr("Trigger", "Disparador"), t: tr("What starts it: you, a schedule, a new file, an email, a pull request.", "Qué lo arranca: tú, un horario, un archivo nuevo, un email, un pull request.") },
    { icon: "🛡️", h: tr("Guardrails", "Controles"), t: tr("What it may not do alone: post, pay, send. Permissions, approvals, a log.", "Lo que no puede hacer solo: contabilizar, pagar, enviar. Permisos, aprobaciones, registro.") },
  ];
  return (
    <div className="not-prose my-8">
      <div className="bg-blue-600/10 border border-blue-600/40 rounded-xl p-5 text-center mb-3">
        <p className="text-[11px] uppercase tracking-widest text-blue-300 mb-1">{tr("The loop — the heart of an agent", "El bucle — el corazón de un agente")}</p>
        <p className="text-white font-semibold text-lg">
          {tr("Plan → act with a tool → look at the result → repeat until done", "Planificar → actuar con una herramienta → mirar el resultado → repetir hasta terminar")}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {parts.map((p) => (
          <div key={p.h} className="bg-[#0d1426] border border-gray-800 rounded-xl p-4">
            <p className="text-white font-semibold text-sm"><span className="mr-2" aria-hidden>{p.icon}</span>{p.h}</p>
            <p className="text-gray-400 text-sm mt-1 leading-relaxed">{p.t}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** What an MCP connector is: one standard plug between Claude and each system. */
function McpExplainer({ es }: { es: boolean }) {
  const tr = (en: string, sp: string) => (es ? sp : en);
  const systems = [
    { name: tr("Accounting software", "Software contable"), tools: "get_trial_balance · list_invoices" },
    { name: tr("Bank feed", "Banco"), tools: "list_transactions · get_balance" },
    { name: "Google Drive / SharePoint", tools: "search_files · read_file" },
    { name: "FinancePlots", tools: "break_even · business_valuation" },
  ];
  return (
    <div className="not-prose my-8 bg-[#0d1426] border border-blue-700/40 rounded-xl p-5">
      <p className="text-[11px] uppercase tracking-widest text-blue-400 mb-1">{tr("Explainer", "Para entenderlo")}</p>
      <p className="text-white font-semibold text-lg mb-3">{tr("What is an MCP?", "¿Qué es un MCP?")}</p>
      <div className="text-gray-300 text-sm leading-relaxed space-y-3">
        <p>
          {tr(
            "MCP stands for Model Context Protocol, an open standard Anthropic published in 2024 and that other AI companies now support. Think of it as a USB-C port for AI: one standard plug between an assistant and any other system, instead of a custom integration for each.",
            "MCP son las siglas de Model Context Protocol (protocolo de contexto del modelo), un estándar abierto que Anthropic publicó en 2024 y que hoy admiten otras empresas de IA. Piensa en un puerto USB-C para la IA: un enchufe estándar entre el asistente y cualquier otro sistema, en lugar de una integración a medida para cada uno."
          )}
        </p>
        <p>
          {tr(
            "An MCP server — a connector — sits in front of a system and gives Claude a menu: a list of tools, each with a name, a plain description and the inputs it needs. Claude reads the menu, decides when a tool would help, calls it and works with what comes back. You decide which connectors to add, and many can be limited to reading data or set to ask before every action.",
            "Un servidor MCP — un conector — se coloca delante de un sistema y le da a Claude un menú: una lista de herramientas, cada una con un nombre, una descripción sencilla y los datos que necesita. Claude lee el menú, decide cuándo le sirve una herramienta, la llama y trabaja con lo que le devuelve. Tú decides qué conectores añadir, y muchos se pueden limitar a solo lectura o configurar para que pidan permiso antes de cada acción."
          )}
        </p>
      </div>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-3 items-center">
        <div className="bg-blue-600 text-white font-semibold rounded-lg px-4 py-3 text-center">Claude</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {systems.map((s) => (
            <div key={s.name} className="border border-gray-700 rounded-lg px-3 py-2">
              <p className="text-[11px] text-blue-300">⇄ MCP</p>
              <p className="text-gray-100 text-sm font-semibold">{s.name}</p>
              <p className="text-gray-500 text-xs font-mono mt-0.5">{s.tools}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="text-gray-500 text-xs mt-3">
        {tr("Tool names are illustrative; each connector publishes its own.", "Los nombres de herramientas son ilustrativos; cada conector publica los suyos.")}
      </p>
    </div>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="not-prose bg-[#060a15] border border-gray-800 rounded-xl p-4 overflow-x-auto text-[13px] leading-relaxed text-cyan-200 my-4">
      <code>{children}</code>
    </pre>
  );
}

const PROMPT_EN = `You are a management accountant reviewing a monthly P&L.
Context: UK services company, £4m revenue, budget attached.
Task: explain every line where actual vs budget moves more
than 10% AND more than £5,000.
Format: a table (line, variance £, variance %, likely driver),
then three sentences for the finance director.
Checks: say which figures you could not tie back to the
attachment. Do not guess a driver — write "ask the budget owner".`;

const PROMPT_ES = `Eres un controller revisando la cuenta de resultados del mes.
Contexto: empresa de servicios en el Reino Unido, 4 M£ de
ventas, presupuesto adjunto.
Tarea: explica cada línea cuyo real frente a presupuesto se
mueva más de un 10% Y más de 5.000 £.
Formato: una tabla (línea, desviación £, desviación %, causa
probable) y tres frases para el director financiero.
Comprobaciones: di qué cifras no has podido cuadrar con el
adjunto. No inventes causas — escribe "preguntar al responsable".`;

const SKILL_EN = `---
name: bank-reconciliation
description: Reconcile the bank statement to the cash GL account.
  Use when someone asks for a bank rec or uploads a statement.
---
1. Read the statement (CSV or PDF) and the GL cash export.
2. Match on amount and date (±3 days), then on reference.
3. List unmatched items in two groups: in bank not in books,
   in books not in bank.
4. Propose journal entries for bank charges and interest only.
   Never propose an entry for anything else.
5. Output: the rec in our template (reconciliation.xlsx in this
   folder), with the difference that must be zero.`;

const SKILL_ES = `---
name: conciliacion-bancaria
description: Concilia el extracto con la cuenta de bancos del mayor.
  Úsala cuando pidan una conciliación o suban un extracto.
---
1. Lee el extracto (CSV o PDF) y el mayor de bancos exportado.
2. Casa por importe y fecha (±3 días), luego por referencia.
3. Lista las partidas sin casar en dos grupos: en banco y no en
   libros, en libros y no en banco.
4. Propón asientos solo para comisiones e intereses bancarios.
   Nunca propongas un asiento para nada más.
5. Salida: la conciliación en nuestra plantilla
   (conciliacion.xlsx en esta carpeta), con la diferencia a cero.`;

export default async function ArticleAiAgentsAccountingFinance({ params }: Props) {
  const { locale } = await params;
  const es = locale === "es";
  const tr = (en: string, sp: string) => (es ? sp : en);
  const c = es ? COPY.es : COPY.en;

  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.title,
    description: c.description,
    url: c.url,
    image: IMAGE,
    inLanguage: es ? "es" : "en-GB",
    datePublished: "2026-11-27",
    author: { "@type": "Organization", name: "FinancePlots" },
    publisher: { "@type": "Organization", name: "FinancePlots", logo: { "@type": "ImageObject", url: `${BASE}/logo-sm.png` } },
    mainEntityOfPage: { "@type": "WebPage", "@id": c.url },
  };

  const hosting = [
    {
      h: "GitHub Actions",
      tag: tr("Cheapest to start", "Lo más barato para empezar"),
      t: tr(
        "A workflow file runs your agent script on a schedule (every Monday at 6am) or on an event. Free minutes for small jobs, a log of every run, and the repository is the database. Best when the output is a file a human reviews in a pull request before it goes anywhere.",
        "Un archivo de workflow ejecuta el script de tu agente con un horario (cada lunes a las 6) o ante un evento. Minutos gratis para trabajos pequeños, un registro de cada ejecución y el repositorio hace de base de datos. Ideal cuando el resultado es un archivo que una persona revisa en un pull request antes de que vaya a ninguna parte."
      ),
    },
    {
      h: "Claude Managed Agents",
      tag: tr("Anthropic hosts it", "Lo aloja Anthropic"),
      t: tr(
        "Anthropic's hosting for agents. You define the agent once (model, instructions, tools, skills); each run gets its own sandbox with files and code, credentials sit in a vault rather than in the sandbox, and it can fire on a schedule. No server of yours. In beta, billed on tokens plus session runtime.",
        "El alojamiento de Anthropic para agentes. Defines el agente una vez (modelo, instrucciones, herramientas, skills); cada ejecución tiene su propio entorno aislado con archivos y código, las credenciales van en una bóveda y no dentro del entorno, y puede ejecutarse con horario. Sin servidor propio. En beta, se factura por tokens más el tiempo de sesión."
      ),
    },
    {
      h: tr("Your own server (Agent SDK)", "Tu propio servidor (Agent SDK)"),
      tag: tr("Data never leaves", "Los datos no salen"),
      t: tr(
        "The Claude Agent SDK is the engine of Claude Code as a library: file reading, editing, search and sub-agents built in. You run it on your own infrastructure, next to the ERP. More work for IT, but the right answer when policy says ledger data stays in-house.",
        "El Claude Agent SDK es el motor de Claude Code como librería: lectura y edición de archivos, búsqueda y subagentes incluidos. Lo ejecutas en tu propia infraestructura, junto al ERP. Más trabajo para IT, pero la respuesta correcta cuando la política dice que los datos contables no salen de casa."
      ),
    },
  ];

  const jobs: [string, string, string, string][] = [
    ["Explain one month's variances", "1 · Prompting", "Explicar las desviaciones de un mes", "1 · Prompts"],
    ["Month-end close with your policies to hand", "2 · Projects", "Cierre de mes con tus políticas a mano", "2 · Proyectos"],
    ["Bank recs done the same way by everyone", "3 · Skills", "Conciliaciones hechas igual por todo el equipo", "3 · Skills"],
    ["A cash dashboard the board opens on a link", "4 · Artifacts", "Un cuadro de tesorería que el consejo abre con un enlace", "4 · Artifacts"],
    ["Monday AR ageing and draft chaser emails", "5 · Routines", "Antigüedad de clientes del lunes y borradores de reclamación", "5 · Rutinas"],
    ["A weekly market report nobody has to start", "6 · Autonomous", "Un informe de mercados semanal que nadie tiene que arrancar", "6 · Autónomo"],
  ];

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-4 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <BlogArticleShell>
        <Link href="/blog" className="text-blue-400 text-sm hover:text-blue-300 transition mb-8 inline-block">
          {tr("← Back to Blog", "← Volver al Blog")}
        </Link>

        <span className="block text-xs font-semibold text-blue-400 uppercase tracking-wider">{tr("AI & Agents", "IA y Agentes")}</span>
        <h1 className="text-3xl sm:text-4xl font-bold mt-2 mb-3 leading-tight">
          {tr("AI Agents for Accounting and Finance: Six Levels", "Agentes de IA para contabilidad y finanzas: seis niveles")}
        </h1>
        <p className="text-gray-400 text-sm mb-10">{tr("November 2026 · 9 min read", "Noviembre 2026 · 9 min de lectura")}</p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">
          <p>
            {tr(
              "Most finance teams use AI like a cleverer search box: paste a question, copy the answer. That is useful, but it is level one. An agent is different. You give it a goal — reconcile the bank, explain the variances, chase the overdue invoices — and it works out the steps, uses tools to do them, checks the result and carries on until the job is done.",
              "La mayoría de los equipos financieros usan la IA como un buscador más listo: pegas una pregunta, copias la respuesta. Es útil, pero es el nivel uno. Un agente es otra cosa. Le das un objetivo — concilia el banco, explica las desviaciones, reclama las facturas vencidas — y él decide los pasos, usa herramientas para darlos, comprueba el resultado y sigue hasta terminar."
            )}
          </p>
          <p>
            {tr(
              "You don't have to jump straight to a robot that runs your close. There is a ladder, and each rung is worth climbing on its own. The examples use Claude, Anthropic's AI, because that is what we use to build FinancePlots — but the ideas carry over.",
              "No hace falta saltar directamente a un robot que te haga el cierre. Hay una escalera, y cada peldaño merece la pena por sí solo. Los ejemplos usan Claude, la IA de Anthropic, porque es lo que usamos para construir FinancePlots — pero las ideas valen para otras."
            )}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">{tr("The parts of an agent", "Las partes de un agente")}</h2>
          <p>
            {tr(
              "Every agent, from a chat to a fully automated job, is the same six parts around one loop. The levels below are really about adding parts: more context, better instructions, more tools, a trigger that isn't you.",
              "Todo agente, desde un chat hasta un trabajo totalmente automático, son las mismas seis piezas alrededor de un bucle. Los niveles de abajo consisten en ir añadiendo piezas: más contexto, mejores instrucciones, más herramientas, un disparador que no seas tú."
            )}
          </p>
        </div>

        <Anatomy es={es} />
        <Ladder es={es} />

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">
          {/* 1 */}
          <LevelHeading n={1} es={es} />
          <p>
            {tr(
              "A good prompt is a good brief to a new analyst. Five parts: role, context, task, format and checks. The checks are the part finance people skip and the one that matters most — tell it what to do when a number doesn't tie, or it will fill the gap with something plausible.",
              "Un buen prompt es un buen encargo a un analista nuevo. Cinco partes: rol, contexto, tarea, formato y comprobaciones. Las comprobaciones son lo que la gente de finanzas se salta y lo que más importa — dile qué hacer cuando una cifra no cuadra, o rellenará el hueco con algo verosímil."
            )}
          </p>
          <Code>{es ? PROMPT_ES : PROMPT_EN}</Code>
          <p>
            {tr(
              "Attach the files instead of pasting numbers into the text, and ask for the answer in the shape you will use: a table you can paste into the pack, not an essay.",
              "Adjunta los archivos en lugar de pegar cifras en el texto, y pide la respuesta en el formato que vas a usar: una tabla que puedas pegar en el informe, no una redacción."
            )}
          </p>

          {/* 2 */}
          <LevelHeading n={2} es={es} />
          <p>
            {tr(
              "If you paste the same background into every chat, you want a Project. A Project in Claude is a workspace with its own files and standing instructions: your chart of accounts, the accounting policies, the close calendar, last month's board pack, and a line like \"we report in pounds, IFRS, year end 31 March\". Every conversation inside it starts already knowing all of that.",
              "Si pegas el mismo contexto en cada chat, lo que quieres es un Proyecto. Un Proyecto en Claude es un espacio de trabajo con sus propios archivos e instrucciones fijas: tu plan de cuentas, las políticas contables, el calendario de cierre, el informe al consejo del mes pasado y una línea como \"reportamos en libras, NIIF, cierre a 31 de marzo\". Cada conversación dentro empieza sabiéndolo todo."
            )}
          </p>
          <p>
            {tr(
              "One Project per process works well: Month-end close, Budget 2027, Audit. Share it with the team and everyone gets the same answers to the same questions.",
              "Funciona bien un Proyecto por proceso: Cierre mensual, Presupuesto 2027, Auditoría. Compártelo con el equipo y todos obtienen las mismas respuestas a las mismas preguntas."
            )}
          </p>

          {/* 3 */}
          <LevelHeading n={3} es={es} />
          <p>
            {tr(
              "A Project knows your context. A Skill knows your procedure. A skill is a folder with a file called SKILL.md: a name, a one-line description of when to use it, and the steps, written in plain language. It can carry templates and scripts next to it. Claude reads only the description until a task matches, then loads the whole thing — so you can have dozens without cluttering every conversation.",
              "Un Proyecto conoce tu contexto. Una Skill conoce tu procedimiento. Una skill es una carpeta con un archivo llamado SKILL.md: un nombre, una línea que dice cuándo usarla y los pasos, en lenguaje normal. Puede llevar plantillas y scripts al lado. Claude solo lee la descripción hasta que una tarea encaja, y entonces carga el resto — así puedes tener decenas sin saturar cada conversación."
            )}
          </p>
          <Code>{es ? SKILL_ES : SKILL_EN}</Code>
          <p>
            {tr(
              "This is where your procedures manual stops being a PDF nobody reads. Write the skill once, and the junior analyst, the senior and Claude all do the rec the same way. Step 4 is a guardrail written into the procedure itself.",
              "Aquí es donde tu manual de procedimientos deja de ser un PDF que nadie lee. Escribe la skill una vez, y el analista junior, el senior y Claude hacen la conciliación igual. El paso 4 es un control escrito dentro del propio procedimiento."
            )}
          </p>

          {/* 4 */}
          <LevelHeading n={4} es={es} />
          <p>
            {tr(
              "Sometimes the answer shouldn't be text but a tool. Artifacts are pages Claude builds and publishes for you: a 13-week cash dashboard, a capex approval form, an accruals checklist the team ticks off. Some can now keep data, so the checklist remembers who ticked what. You share a link; nobody needs a licence.",
              "A veces la respuesta no debería ser texto sino una herramienta. Los Artifacts son páginas que Claude construye y publica por ti: un cuadro de tesorería a 13 semanas, un formulario de aprobación de inversiones, una lista de periodificaciones que el equipo va marcando. Algunos ya guardan datos, así que la lista recuerda quién marcó qué. Compartes un enlace; nadie necesita licencia."
            )}
          </p>
          <p>
            {tr("We compared this with Power BI in ", "Lo comparamos con Power BI en ")}
            <Link href="/blog/claude-artifacts-vs-power-bi" className="text-blue-400 hover:text-blue-300">
              {tr("Claude Artifacts vs Power BI", "Claude Artifacts frente a Power BI")}
            </Link>
            {tr(
              ". Short version: for a one-off analysis or a small team, it is minutes instead of a project.",
              ". Resumen: para un análisis puntual o un equipo pequeño, son minutos en lugar de un proyecto."
            )}
          </p>

          {/* 5 */}
          <LevelHeading n={5} es={es} />
          <p>
            {tr(
              "Up to here you bring the data to Claude. At level five Claude goes to the data. Claude Code — and the Claude desktop app — can work in a folder on your computer: open last month's Excel files, read the ledger export, write the reconciliation into your template, and save it next to the others. Where a system has no export or API, computer use lets it read the screen and click, like a temp who knows the software.",
              "Hasta aquí tú llevas los datos a Claude. En el nivel cinco Claude va a los datos. Claude Code — y la app de escritorio de Claude — pueden trabajar en una carpeta de tu ordenador: abrir los Excel del mes pasado, leer el mayor exportado, escribir la conciliación en tu plantilla y guardarla junto a las demás. Donde un sistema no tiene exportación ni API, el uso del ordenador (computer use) le deja leer la pantalla y hacer clic, como un temporal que conoce el programa."
            )}
          </p>
          <p>
            {tr(
              "Add a schedule and it becomes a routine: \"every Monday at 7am, run the debtors ageing, flag anything over 60 days and draft — not send — a chaser email for each\". You arrive to a list of drafts, read them and press send yourself.",
              "Añade un horario y se convierte en una rutina: \"cada lunes a las 7, saca la antigüedad de clientes, marca lo que pase de 60 días y prepara — sin enviar — un email de reclamación para cada uno\". Llegas a una lista de borradores, los lees y los envías tú."
            )}
          </p>
          <p>
            {tr(
              "To reach systems beyond your own files — the accounting package, the bank, the shared drive — Claude uses MCP connectors.",
              "Para llegar a sistemas más allá de tus propios archivos — el programa contable, el banco, la unidad compartida — Claude usa conectores MCP."
            )}
          </p>
        </div>

        <McpExplainer es={es} />

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">
          <p>
            {tr("FinancePlots has its own connector, explained in ", "FinancePlots tiene su propio conector, explicado en ")}
            <Link href="/blog/financeplots-mcp-claude" className="text-blue-400 hover:text-blue-300">
              {tr("our MCP guide", "nuestra guía del MCP")}
            </Link>
            {tr(
              ". With prompts, projects, skills, artifacts, your own files and a few connectors, you already have an agent: one that works while you watch and that you approve step by step.",
              ". Con prompts, proyectos, skills, artifacts, tus propios archivos y unos cuantos conectores ya tienes un agente: uno que trabaja mientras miras y que apruebas paso a paso."
            )}
          </p>

          {/* 6 */}
          <LevelHeading n={6} es={es} />
          <p>
            {tr(
              "At the top of the ladder, nobody presses start. A script calls the Claude API with the instructions, the tools and the data; the agent loops until the job is done and leaves the result somewhere a person will look. The question at this level is less \"how\" than \"where does it live\" — and there are three good answers.",
              "En lo alto de la escalera, nadie le da a empezar. Un script llama a la API de Claude con las instrucciones, las herramientas y los datos; el agente itera hasta terminar y deja el resultado donde alguien lo va a mirar. La pregunta en este nivel no es tanto \"cómo\" como \"dónde vive\" — y hay tres buenas respuestas."
            )}
          </p>
          <p>
            {tr(
              "Do you need it? For most finance work, no — level five is enough. Level six pays off when a job is repeated, well defined and easy to check, and it needs the guardrails below more than any other level.",
              "¿Lo necesitas? Para la mayor parte del trabajo financiero, no — el nivel cinco es suficiente. El nivel seis compensa cuando un trabajo se repite, está bien definido y es fácil de comprobar, y necesita los controles de más abajo más que ningún otro nivel."
            )}
          </p>
        </div>

        <div className="not-prose grid md:grid-cols-3 gap-3 my-8">
          {hosting.map((h) => (
            <div key={h.h} className="bg-[#0d1426] border border-blue-700/40 rounded-xl p-5 flex flex-col">
              <p className="text-[11px] uppercase tracking-widest text-blue-400">{h.tag}</p>
              <p className="text-white font-semibold text-lg mt-1 mb-2">{h.h}</p>
              <p className="text-gray-400 text-sm leading-relaxed">{h.t}</p>
            </div>
          ))}
        </div>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">
          <p>
            {tr("A real example: ", "Un ejemplo real: ")}
            <Link href="/observer" className="text-blue-400 hover:text-blue-300">The FinancePlots Observer</Link>
            {tr(
              ", our weekly markets letter, is written by an agent in GitHub Actions. Every Sunday morning a workflow calls the Claude API, the agent gathers the week's data, drafts the edition and opens a pull request. A person reads it and merges it — and only then does it go out by email. The agent does the hours of work; the human keeps the decision.",
              ", nuestra carta semanal de mercados, la escribe un agente en GitHub Actions. Cada domingo por la mañana un workflow llama a la API de Claude, el agente reúne los datos de la semana, redacta la edición y abre un pull request. Una persona la lee y la aprueba — y solo entonces sale por email. El agente hace las horas de trabajo; la persona conserva la decisión."
            )}
          </p>

          <h2 className="text-2xl font-bold text-white mt-12">{tr("The guardrails finance needs", "Los controles que necesita finanzas")}</h2>
          <p>
            {tr(
              "An agent is a new member of the team, and the controls you already apply to people apply to it:",
              "Un agente es un miembro nuevo del equipo, y los controles que ya aplicas a las personas se le aplican también:"
            )}
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>{tr("Segregation of duties: the agent prepares, a person approves. It drafts journals; it doesn't post them.", "Segregación de funciones: el agente prepara, una persona aprueba. Prepara asientos; no los contabiliza.")}</li>
            <li>{tr("No payment authority, ever. Read-only access to the bank and the ledger is enough for nearly everything.", "Nunca autoridad para pagar. Con acceso de solo lectura al banco y al mayor basta para casi todo.")}</li>
            <li>{tr("Tie it back. Every output should reconcile to a number you trust — the trial balance, the bank statement.", "Que cuadre. Cada resultado debe conciliar con una cifra fiable — el balance de sumas y saldos, el extracto.")}</li>
            <li>{tr("Keep the trail. Save what it was given, what it did and what it produced, so an auditor can follow it.", "Guarda el rastro. Lo que recibió, lo que hizo y lo que produjo, para que un auditor pueda seguirlo.")}</li>
            <li>{tr("Mind the data. Client and employee data falls under data protection law; check what your plan's terms say before uploading it.", "Cuidado con los datos. Los de clientes y empleados están sujetos a protección de datos; revisa las condiciones de tu plan antes de subirlos.")}</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-12">{tr("Which level for which job", "Qué nivel para cada trabajo")}</h2>
        </div>

        <div className="not-prose overflow-x-auto my-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="py-3 px-4 text-gray-400 font-medium">{tr("Job", "Trabajo")}</th>
                <th className="py-3 px-4 text-gray-400 font-medium">{tr("Start at", "Empieza en")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {jobs.map((j) => (
                <tr key={j[0]}>
                  <td className="py-3 px-4 text-gray-300">{es ? j[2] : j[0]}</td>
                  <td className="py-3 px-4 text-blue-300 font-semibold whitespace-nowrap">{es ? j[3] : j[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-l-4 border-blue-500 bg-[#0d1426] rounded-r-xl p-6 my-10">
          <p className="text-blue-300 text-sm font-semibold mb-2">{tr("A personal note", "Una nota personal")}</p>
          <div className="text-gray-300 text-sm leading-relaxed space-y-3">
            <p>
              {tr(
                "I use Claude every day, with two accounts: a personal one, for FinancePlots and my own learning, and one at work.",
                "Uso Claude a diario, con dos cuentas: una personal, para FinancePlots y para aprender por mi cuenta, y otra en el trabajo."
              )}
            </p>
            <p>
              {tr(
                "Autonomous agents are what I am learning now. The Observer is my practice ground on FinancePlots, a personal project; I have not put autonomous agents into practice professionally. My view so far is the one above: for most finance work, level five is enough.",
                "Los agentes autónomos son lo que estoy aprendiendo ahora. El Observer es mi campo de prácticas en FinancePlots, un proyecto personal; no he puesto agentes autónomos en práctica a nivel profesional. Mi opinión, de momento, es la de arriba: para la mayor parte del trabajo financiero, el nivel cinco es suficiente."
              )}
            </p>
          </div>
        </div>

        <div className="bg-blue-600/10 border border-blue-700/30 rounded-xl p-6 my-10">
          <p className="text-blue-300 text-sm font-semibold mb-2">{tr("The short version", "La versión corta")}</p>
          <ul className="text-gray-300 text-sm leading-relaxed space-y-1 list-disc pl-5">
            <li>{tr("An agent is a model, instructions, tools, context, a trigger and guardrails around a loop.", "Un agente es un modelo, instrucciones, herramientas, contexto, un disparador y controles alrededor de un bucle.")}</li>
            <li>{tr("Start with better prompts: role, context, task, format, checks.", "Empieza por mejores prompts: rol, contexto, tarea, formato, comprobaciones.")}</li>
            <li>{tr("Projects hold your context; skills hold your procedures.", "Los Proyectos guardan tu contexto; las skills, tus procedimientos.")}</li>
            <li>{tr("Artifacts turn an answer into a tool the team can open.", "Los Artifacts convierten una respuesta en una herramienta que el equipo puede abrir.")}</li>
            <li>{tr("MCP connectors are the standard plug between Claude and your systems.", "Los conectores MCP son el enchufe estándar entre Claude y tus sistemas.")}</li>
            <li>{tr("Level five is enough for most finance work; autonomous agents live in GitHub Actions, Claude Managed Agents or your own server.", "El nivel cinco basta para la mayor parte del trabajo financiero; los agentes autónomos viven en GitHub Actions, Claude Managed Agents o tu propio servidor.")}</li>
            <li>{tr("Whatever the level: the agent prepares, a person approves.", "Sea cual sea el nivel: el agente prepara, una persona aprueba.")}</li>
          </ul>
        </div>

        <div className="mt-14 bg-[#0d1426] border border-blue-700/40 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">{tr("Give your agent finance tools", "Dale herramientas financieras a tu agente")}</h3>
          <p className="text-gray-400 text-sm mb-6">
            {tr(
              "Connect FinancePlots to Claude and it can run break-even, valuations, loan schedules and cash-flow maths with the same formulas as the site — free, no signup.",
              "Conecta FinancePlots a Claude y podrá calcular punto de equilibrio, valoraciones, cuadros de préstamo y tesorería con las mismas fórmulas que la web — gratis, sin registro."
            )}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/mcp" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition inline-block">
              {tr("Connect to Claude", "Conectar a Claude")}
            </Link>
            <Link href="/blog/claude-products-guide" className="border border-gray-600 hover:border-blue-500 text-gray-200 font-semibold px-6 py-3 rounded-lg transition inline-block">
              {tr("Which Claude do I need?", "¿Qué Claude necesito?")}
            </Link>
          </div>
        </div>

        <p className="text-gray-600 text-xs mt-8 text-center">
          {tr(
            "Product names and features checked in November 2026; AI products change quickly and some features mentioned (including Claude Managed Agents) are in beta or limited to certain plans. FinancePlots is not affiliated with Anthropic. General information, not professional or legal advice.",
            "Nombres y funciones de producto revisados en noviembre de 2026; los productos de IA cambian deprisa y algunas funciones citadas (incluido Claude Managed Agents) están en beta o limitadas a ciertos planes. FinancePlots no tiene relación con Anthropic. Información general, no asesoramiento profesional ni legal."
          )}
        </p>
      </BlogArticleShell>
    </main>
  );
}
