import Link from "next/link";
import type { Metadata } from "next";
import BlogArticleShell from "@/components/BlogArticleShell";
import RevisionCards from "@/components/RevisionCards";

const BASE = "https://www.financeplots.com";
const PATH = "/blog/strategy-models-balanced-scorecard";
const IMAGE = `${BASE}/og-image.png`;

// Everything on this page exists in English and Spanish, metadata included.
const COPY = {
  en: {
    url: `${BASE}${PATH}`,
    title: "Eight Strategy Models, Pros and Cons: Why the Balanced Scorecard Wins on Simplicity",
    description:
      "PESTEL, Five Forces, SWOT, Porter, Ansoff, BCG, Fitzgerald & Moon and the balanced scorecard — what each is good for, where each falls short, and why a small business that can only run one should pick the scorecard. With revision cards to download.",
  },
  es: {
    url: `${BASE}/es${PATH}`,
    title: "Ocho modelos de estrategia, pros y contras: por qué el cuadro de mando integral gana por sencillez",
    description:
      "PESTEL, cinco fuerzas, DAFO, Porter, Ansoff, BCG, Fitzgerald y Moon y el cuadro de mando integral: para qué sirve cada uno, dónde se queda corto y por qué una pyme que solo pueda usar uno debería elegir el cuadro de mando. Con fichas de repaso para descargar.",
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

// The coffee roaster is an invented business used to illustrate the scorecard;
// its measures are examples, not data. The models follow the author's own
// revision cards (the "Finance Revision Cards" deck).

type Model = {
  name: string;
  question: string;
  pros: string[];
  cons: string[];
  /** 1 = an afternoon, 3 = weeks of work and data */
  effort: 1 | 2 | 3;
  measures: boolean;
};

export default async function StrategyModelsBalancedScorecard({ params }: Props) {
  const { locale } = await params;
  const es = locale === "es";
  const tr = (en: string, sp: string) => (es ? sp : en);
  const copy = es ? COPY.es : COPY.en;
  const h2 = "text-2xl font-bold text-white mt-10";
  const h3 = "text-lg font-semibold text-white mt-8";

  const groups: { title: string; intro: string; models: Model[] }[] = [
    {
      title: tr("Models that look outside", "Modelos que miran fuera"),
      intro: tr(
        "These two scan the world around the business. They're where most strategy work starts, and where a lot of it stops.",
        "Estos dos miran el mundo alrededor del negocio. Es donde empieza casi todo trabajo de estrategia, y donde se queda mucho de él."
      ),
      models: [
        {
          name: "PESTEL",
          question: tr("What's changing in the wider world?", "¿Qué está cambiando en el entorno general?"),
          pros: [
            tr("Broad and quick: political, economic, social, technological, ecological and legal, in an afternoon", "Amplio y rápido: político, económico, social, tecnológico, ecológico y legal, en una tarde"),
            tr("Catches the shifts that hit finance first — interest rates, exchange rates, new rules", "Detecta los cambios que le llegan antes a finanzas: tipos de interés, divisas, normas nuevas"),
          ],
          cons: [
            tr("Easily becomes a long list with no priorities", "Se convierte con facilidad en una lista larga sin prioridades"),
            tr("Says nothing about your own business, and goes stale quickly", "No dice nada de tu propio negocio, y se queda viejo enseguida"),
          ],
          effort: 1,
          measures: false,
        },
        {
          name: tr("Porter's Five Forces", "Las cinco fuerzas de Porter"),
          question: tr("How much profit does this industry leave on the table?", "¿Cuánto beneficio deja este sector?"),
          pros: [
            tr("Explains why some industries earn more than others: buyers, suppliers, new entrants, substitutes, rivalry", "Explica por qué unos sectores ganan más que otros: clientes, proveedores, nuevos competidores, sustitutos, rivalidad"),
            tr("Each force turns into something you can track — switching costs, market share", "Cada fuerza se convierte en algo que se puede seguir: coste de cambiar de proveedor, cuota de mercado"),
          ],
          cons: [
            tr("Looks at the industry, not at you", "Mira el sector, no a ti"),
            tr("A snapshot: awkward when you sell into several industries or the market moves fast", "Es una foto fija: se queda corta si vendes a varios sectores o el mercado se mueve rápido"),
          ],
          effort: 2,
          measures: false,
        },
      ],
    },
    {
      title: tr("Models that help you choose", "Modelos que ayudan a elegir"),
      intro: tr(
        "These four turn analysis into options: how to compete, where to grow, what to keep.",
        "Estos cuatro convierten el análisis en opciones: cómo competir, dónde crecer, qué conservar."
      ),
      models: [
        {
          name: tr("SWOT → TOWS", "DAFO → TOWS"),
          question: tr("What are our options, given where we stand?", "¿Qué opciones tenemos, dado dónde estamos?"),
          pros: [
            tr("Everyone understands it, and it fits on one page", "Lo entiende todo el mundo y cabe en una página"),
            tr("Puts inside and outside together; crossing the boxes (TOWS) turns it into choices", "Junta lo de dentro y lo de fuera; cruzar las casillas (TOWS) lo convierte en decisiones"),
          ],
          cons: [
            tr("Subjective: four lists with no weights", "Subjetivo: cuatro listas sin pesos"),
            tr("Often stops at the list, and mixes up internal and external (weak IT is a weakness, not a threat)", "Muchas veces se queda en la lista, y confunde lo interno con lo externo (una informática mala es una debilidad, no una amenaza)"),
          ],
          effort: 1,
          measures: false,
        },
        {
          name: tr("Porter's generic strategies", "Estrategias genéricas de Porter"),
          question: tr("How do we compete?", "¿Cómo competimos?"),
          pros: [
            tr("Forces one clear choice: lowest cost, something customers pay extra for, or either in a narrow niche", "Obliga a una elección clara: el coste más bajo, algo por lo que el cliente paga más, o cualquiera de las dos en un nicho"),
            tr("Warns about being “stuck in the middle”", "Avisa del peligro de quedarse “atascado en medio”"),
          ],
          cons: [
            tr("Some winners do both — Apple pairs a luxury margin with fast turnover", "Algunos ganadores hacen las dos cosas: Apple combina margen de lujo y rotación alta"),
            tr("A positioning statement, not a way to run the business month to month", "Es una declaración de posicionamiento, no una forma de llevar el negocio mes a mes"),
          ],
          effort: 1,
          measures: false,
        },
        {
          name: tr("Ansoff matrix", "Matriz de Ansoff"),
          question: tr("Where do we grow, and how risky is it?", "¿Dónde crecemos y con cuánto riesgo?"),
          pros: [
            tr("A simple 2×2 that ranks growth options by risk, from selling more of the same to diversifying", "Un 2×2 sencillo que ordena las vías de crecimiento por riesgo, de vender más de lo mismo a diversificar"),
            tr("Useful for forecasts: riskier boxes deserve wider ranges", "Útil para las previsiones: las casillas más arriesgadas merecen rangos más amplios"),
          ],
          cons: [
            tr("Doesn't say whether an option makes money", "No dice si una opción gana dinero"),
            tr("Silent on how — building it yourself or buying a company", "No dice cómo: hacerlo uno mismo o comprar una empresa"),
          ],
          effort: 1,
          measures: false,
        },
        {
          name: tr("BCG matrix", "Matriz BCG"),
          question: tr("Which products fund the others?", "¿Qué productos financian a los demás?"),
          pros: [
            tr("Clear cash logic: cash cows fund stars and question marks; dogs are candidates to drop", "Lógica de caja clara: las vacas lecheras financian a las estrellas y a los interrogantes; los perros son candidatos a salir"),
            tr("Good for a board discussion about a portfolio", "Bueno para una discusión de consejo sobre una cartera de productos"),
          ],
          cons: [
            tr("Needs several product lines and market-share data most small firms don't have", "Necesita varias líneas de producto y datos de cuota de mercado que casi ninguna pyme tiene"),
            tr("Market share isn't profit, and a one-product business gets little from it", "Cuota de mercado no es beneficio, y a un negocio de un solo producto le aporta poco"),
          ],
          effort: 2,
          measures: false,
        },
      ],
    },
    {
      title: tr("Models that measure performance", "Modelos que miden el desempeño"),
      intro: tr(
        "Only these two answer the question finance gets asked every month: is the strategy working?",
        "Solo estos dos responden a la pregunta que le hacen a finanzas cada mes: ¿está funcionando la estrategia?"
      ),
      models: [
        {
          name: tr("Fitzgerald & Moon", "Fitzgerald y Moon"),
          question: tr("Are we performing — and are the targets and rewards fair?", "¿Lo estamos haciendo bien, y son justos los objetivos y los incentivos?"),
          pros: [
            tr("Complete: two results (financial, competitiveness) and four drivers (quality, flexibility, use of resources, innovation)", "Completo: dos resultados (financiero, competitividad) y cuatro motores (calidad, flexibilidad, uso de recursos, innovación)"),
            tr("Also covers targets (owned, achievable, fair) and rewards (clear, motivating, controllable)", "Cubre también los objetivos (asumidos, alcanzables, justos) y los incentivos (claros, motivadores, controlables)"),
          ],
          cons: [
            tr("Six dimensions plus targets plus rewards is a lot to set up for a team of two", "Seis dimensiones más objetivos más incentivos es mucho que montar para un equipo de dos"),
            tr("Built for service businesses; less natural elsewhere", "Pensado para empresas de servicios; encaja peor en otras"),
          ],
          effort: 3,
          measures: true,
        },
        {
          name: tr("Balanced scorecard", "Cuadro de mando integral"),
          question: tr("Are we on track, from four angles?", "¿Vamos bien, visto desde cuatro ángulos?"),
          pros: [
            tr("Four questions on one page: financial, customer, internal process, learning", "Cuatro preguntas en una página: financiera, cliente, procesos internos, aprendizaje"),
            tr("Balances short and long term, financial and non-financial, and links the strategy to the budget", "Equilibra corto y largo plazo, lo financiero y lo que no lo es, y une la estrategia con el presupuesto"),
          ],
          cons: [
            tr("Picking the right few measures is the hard part", "Lo difícil es elegir las pocas medidas correctas"),
            tr("Doesn't create the strategy, can sprawl to 40 KPIs, and can be misused to blame departments", "No crea la estrategia, puede acabar con 40 KPI y se puede usar mal para culpar a departamentos"),
          ],
          effort: 2,
          measures: true,
        },
      ],
    },
  ];

  const all = groups.flatMap((g) => g.models);
  const effortLabel = (e: 1 | 2 | 3) => [tr("An afternoon", "Una tarde"), tr("A few days", "Unos días"), tr("Weeks", "Semanas")][e - 1];

  const scorecard: [string, string, string][] = [
    [tr("Financial", "Financiera"), tr("How do the owners see us?", "¿Cómo nos ven los dueños?"), tr("Gross margin per kg · cash at month end", "Margen bruto por kg · caja a fin de mes")],
    [tr("Customer", "Cliente"), tr("What do cafés value?", "¿Qué valoran los cafés?"), tr("% delivered within 48 h of roasting · cafés lost per quarter", "% entregado en 48 h desde el tueste · cafés perdidos por trimestre")],
    [tr("Internal process", "Procesos internos"), tr("What must we excel at?", "¿En qué tenemos que ser excelentes?"), tr("Days from roast to doorstep · batches out of spec", "Días del tueste a la puerta · lotes fuera de especificación")],
    [tr("Learning & growth", "Aprendizaje y crecimiento"), tr("Can we keep improving?", "¿Podemos seguir mejorando?"), tr("Baristas trained · new blends launched", "Baristas formados · nuevos cafés lanzados")],
  ];

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: copy.title,
            description: copy.description,
            inLanguage: es ? "es" : "en",
            url: copy.url,
            datePublished: "2026-11-15",
            image: IMAGE,
            author: { "@type": "Person", name: "Javier Audibert" },
            publisher: { "@type": "Organization", name: "FinancePlots", logo: { "@type": "ImageObject", url: "https://www.financeplots.com/logo-sm.png" } },
            mainEntityOfPage: { "@type": "WebPage", "@id": copy.url },
          }),
        }}
      />
      <BlogArticleShell>
        <Link href="/blog" className="text-blue-400 text-sm hover:text-blue-300 transition mb-8 inline-block">
          {tr("← Back to Blog", "← Volver al Blog")}
        </Link>

        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{tr("Small Business Finance", "Finanzas para Pymes")}</span>
        <h1 className="text-4xl font-bold mt-2 mb-3 leading-tight">
          {copy.title}
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          {tr("November 2026 · 7 min read · By Javier Audibert", "Noviembre 2026 · 7 min de lectura · Por Javier Audibert")}
        </p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">
          <p>
            {tr(
              "Strategy textbooks hold dozens of models, and most finance people meet them once, for an exam. I keep eight of them on handwritten revision cards, and every time I go through the deck the same question comes up: if a small business with a finance team of one or two could run only one of these, which should it be?",
              "Los manuales de estrategia traen decenas de modelos, y casi todo el que trabaja en finanzas se los encuentra una vez, para un examen. Yo tengo ocho en fichas de repaso escritas a mano, y cada vez que paso el mazo me sale la misma pregunta: si una pyme con un equipo financiero de una o dos personas solo pudiera usar uno, ¿cuál debería ser?"
            )}
          </p>
          <p>
            {tr(
              "My answer is the balanced scorecard — not because it's the cleverest, but because it's the simplest one that does the job that matters every month: telling you whether the strategy is working. Here's each model, what it's good for and where it falls short, and then the case for the scorecard. The cards themselves are at the end, to flip through or print.",
              "Mi respuesta es el cuadro de mando integral. No porque sea el más ingenioso, sino porque es el más sencillo de los que hacen el trabajo que importa cada mes: decirte si la estrategia funciona. Aquí va cada modelo, para qué sirve y dónde se queda corto, y después los argumentos a favor del cuadro de mando. Las fichas están al final, para repasarlas o imprimirlas."
            )}
          </p>
        </div>

        <div className="not-prose overflow-x-auto my-10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-xs text-gray-400 uppercase tracking-wider">
                <th className="text-left py-2 pr-4">{tr("Model", "Modelo")}</th>
                <th className="text-left py-2 pr-4 hidden sm:table-cell">{tr("The question it answers", "La pregunta que responde")}</th>
                <th className="text-left py-2 pr-4">{tr("Effort", "Esfuerzo")}</th>
                <th className="text-left py-2">{tr("Tracks performance?", "¿Mide el desempeño?")}</th>
              </tr>
            </thead>
            <tbody>
              {all.map((m) => (
                <tr key={m.name} className="border-b border-gray-800 text-gray-300">
                  <td className="py-2 pr-4 text-white font-medium">{m.name}</td>
                  <td className="py-2 pr-4 hidden sm:table-cell">{m.question}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    <span className="text-blue-400 tracking-widest" aria-hidden>{"●".repeat(m.effort) + "○".repeat(3 - m.effort)}</span>{" "}
                    <span className="text-gray-400 text-xs">{effortLabel(m.effort)}</span>
                  </td>
                  <td className="py-2">{m.measures ? tr("Yes", "Sí") : tr("No", "No")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {groups.map((g) => (
          <section key={g.title}>
            <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">
              <h2 className={h2}>{g.title}</h2>
              <p>{g.intro}</p>
            </div>
            {g.models.map((m) => (
              <div key={m.name}>
                <h3 className={h3}>{m.name}</h3>
                <p className="text-gray-400 text-sm italic mt-1">{m.question}</p>
                <div className="grid gap-3 sm:grid-cols-2 mt-3">
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{tr("Good for", "Para qué sirve")}</p>
                    <ul className="space-y-2 text-sm text-gray-300">
                      {m.pros.map((p) => (
                        <li key={p} className="flex gap-2"><span className="text-blue-400 font-bold" aria-hidden>+</span><span>{p}</span></li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{tr("Falls short", "Dónde se queda corto")}</p>
                    <ul className="space-y-2 text-sm text-gray-300">
                      {m.cons.map((c) => (
                        <li key={c} className="flex gap-2"><span className="text-gray-500 font-bold" aria-hidden>−</span><span>{c}</span></li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </section>
        ))}

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">
          <h2 className={h2}>{tr("Why the balanced scorecard wins", "Por qué gana el cuadro de mando integral")}</h2>
          <p>
            {tr(
              "Six of the eight models help you think. Only two help you check, month after month, that the thinking was right — and of those two, the scorecard is the one a small team can actually keep running. Four reasons:",
              "Seis de los ocho modelos ayudan a pensar. Solo dos ayudan a comprobar, mes a mes, que lo pensado era correcto, y de esos dos el cuadro de mando es el que un equipo pequeño puede mantener de verdad. Cuatro razones:"
            )}
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              <strong>{tr("Four questions, one page.", "Cuatro preguntas, una página.")}</strong>{" "}
              {tr(
                "How do the owners see us? What do customers value? What must we excel at? Can we keep improving? A board can read it in two minutes.",
                "¿Cómo nos ven los dueños? ¿Qué valoran los clientes? ¿En qué tenemos que ser excelentes? ¿Podemos seguir mejorando? Un consejo lo lee en dos minutos."
              )}
            </li>
            <li>
              <strong>{tr("It balances.", "Equilibra.")}</strong>{" "}
              {tr(
                "Short term and long term, inside and outside, financial and non-financial. Profit alone rewards cutting training; the scorecard shows the cost.",
                "Corto y largo plazo, dentro y fuera, lo financiero y lo que no lo es. Mirar solo el beneficio premia recortar la formación; el cuadro de mando enseña lo que cuesta."
              )}
            </li>
            <li>
              <strong>{tr("It tells a cause-and-effect story.", "Cuenta una historia de causa y efecto.")}</strong>{" "}
              {tr(
                "Learning improves processes, processes please customers, customers drive the financial results. The financial number is the last to move, not the first.",
                "El aprendizaje mejora los procesos, los procesos contentan al cliente, y el cliente mueve los resultados financieros. La cifra financiera es la última en moverse, no la primera."
              )}
            </li>
            <li>
              <strong>{tr("It uses the other models instead of replacing them.", "Aprovecha los otros modelos en vez de sustituirlos.")}</strong>{" "}
              {tr(
                "PESTEL and the Five Forces tell you what to watch; SWOT, Porter and Ansoff tell you what you chose. The scorecard is where those choices become measures.",
                "El PESTEL y las cinco fuerzas te dicen qué vigilar; el DAFO, Porter y Ansoff, qué has elegido. El cuadro de mando es donde esas elecciones se convierten en medidas."
              )}
            </li>
          </ol>
          <p>
            {tr(
              "Fitzgerald & Moon is the more complete model — it also asks whether targets are fair and rewards controllable, which is worth borrowing. But for a business of 30 people, complete loses to simple: a model nobody updates measures nothing.",
              "Fitzgerald y Moon es el modelo más completo — además pregunta si los objetivos son justos y los incentivos controlables, y eso merece la pena copiarlo. Pero en una empresa de 30 personas, lo completo pierde contra lo sencillo: un modelo que nadie actualiza no mide nada."
            )}
          </p>

          <h2 className={h2}>{tr("What it looks like in a small business", "Cómo queda en una pyme")}</h2>
          <p>
            {tr(
              "Take an invented coffee roaster with 30 staff, selling to about 120 independent cafés, whose strategy is freshness and service: coffee delivered within 48 hours of roasting, and baristas trained for free. Two measures per box is enough:",
              "Piensa en un tostador de café inventado, con 30 empleados, que vende a unas 120 cafeterías independientes y cuya estrategia es frescura y servicio: café entregado en las 48 horas siguientes al tueste y formación gratuita a los baristas. Con dos medidas por casilla basta:"
            )}
          </p>
        </div>

        <div className="not-prose grid gap-3 sm:grid-cols-2 my-6">
          {scorecard.map(([view, question, kpis]) => (
            <div key={view} className="bg-[#0d1426] border border-gray-800 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{view}</p>
              <p className="text-gray-400 text-sm mt-1">{question}</p>
              <p className="text-white text-sm font-medium mt-2">{kpis}</p>
            </div>
          ))}
        </div>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">
          <p>
            {tr(
              "Read it bottom to top and it tells the strategy: trained baristas and good blends mean fewer bad batches and faster deliveries, which keep cafés, which protects the margin and the cash.",
              "Leído de abajo arriba cuenta la estrategia: baristas formados y buenos cafés significan menos lotes defectuosos y entregas más rápidas, lo que retiene cafeterías, lo que protege el margen y la caja."
            )}
          </p>

          <h2 className={h2}>{tr("Keeping it simple", "Cómo mantenerlo sencillo")}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {tr(
                "Two or three measures per perspective. If the scorecard needs scrolling, it has stopped being one.",
                "Dos o tres medidas por perspectiva. Si el cuadro de mando necesita scroll, ya no lo es."
              )}
            </li>
            <li>
              {tr(
                "Every measure should trace back to the strategy. If one traces back to nothing, ask why it's reported.",
                "Cada medida debería llevar de vuelta a la estrategia. Si una no lleva a ninguna parte, pregunta por qué se reporta."
              )}
            </li>
            <li>
              {tr(
                "Use it to steer, not to blame. Don't reward people for things they can't control — that idea is Fitzgerald & Moon's, and it's the part worth taking.",
                "Úsalo para dirigir, no para culpar. No premies a nadie por lo que no controla — la idea es de Fitzgerald y Moon, y es lo que merece la pena llevarse."
              )}
            </li>
            <li>
              {tr(
                "Review it each quarter alongside a rolling forecast, so the plan meets reality before the year is over.",
                "Revísalo cada trimestre junto a una previsión rodante, para que el plan se encuentre con la realidad antes de que acabe el año."
              )}
            </li>
          </ul>
          <p>
            {tr(
              "Strategy models are like tools in a toolbox: you'll use PESTEL or SWOT a couple of times a year. The scorecard is the one you open every month. That's why, if you can only run one, it should be this.",
              "Los modelos de estrategia son como herramientas en una caja: el PESTEL o el DAFO los sacarás un par de veces al año. El cuadro de mando es el que abres cada mes. Por eso, si solo puedes usar uno, debería ser este."
            )}
          </p>
        </div>

        <RevisionCards es={es} url={copy.url.replace("https://www.", "")} />

        <div className="mt-14 bg-[#0d1426] border border-blue-700/40 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">{tr("Put the financial box into numbers", "Pasa la casilla financiera a números")}</h3>
          <p className="text-gray-400 text-sm mb-6">
            {tr(
              "The annual budget sets next year's financial targets; the 5-year financial model shows what each growth option does to profit and cash. Free, no signup.",
              "El presupuesto anual fija los objetivos financieros del año que viene; el modelo financiero a 5 años enseña qué hace cada opción de crecimiento al beneficio y a la caja. Gratis, sin registro."
            )}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/tools/annual-budget" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition inline-block">
              {tr("Annual budget", "Presupuesto anual")}
            </Link>
            <Link href="/tools/financial-model" className="border border-gray-600 hover:border-blue-500 text-gray-200 font-semibold px-6 py-3 rounded-lg transition inline-block">
              {tr("5-year financial model", "Modelo financiero a 5 años")}
            </Link>
          </div>
        </div>

        <p className="text-gray-600 text-xs mt-8 text-center">
          {tr(
            "The coffee roaster is an invented business used to illustrate the scorecard; its measures are examples, not data. This article is educational and is not financial advice.",
            "El tostador de café es un negocio inventado para ilustrar el cuadro de mando; sus medidas son ejemplos, no datos. Este artículo es educativo y no es asesoramiento financiero."
          )}
        </p>
      </BlogArticleShell>
    </main>
  );
}
