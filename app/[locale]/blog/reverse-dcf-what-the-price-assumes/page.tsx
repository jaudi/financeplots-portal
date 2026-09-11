import Link from "next/link";
import type { Metadata } from "next";
import ShareButtons from "@/components/ShareButtons";
import BlogArticleShell from "@/components/BlogArticleShell";

const TITLE_EN = "What the Price Already Assumes: Building a Reverse DCF That Refuses to Guess";
const TITLE_ES = "Lo que el precio ya está asumiendo: un DCF inverso que sabe cuándo callarse";
const DESC_EN =
  "Instead of asking whether a company is good, a reverse DCF asks what today's price needs to be true. Building one taught me that the most valuable thing a model does is decline to answer.";
const DESC_ES =
  "En vez de preguntar si una empresa es buena, un DCF inverso pregunta qué tiene que cumplirse para que el precio de hoy tenga sentido. Construirlo me enseñó que lo más valioso que hace un modelo es negarse a responder.";
const URL = "https://www.financeplots.com/blog/reverse-dcf-what-the-price-assumes";

export const metadata: Metadata = {
  title: TITLE_EN,
  description: DESC_EN,
  openGraph: {
    title: TITLE_EN,
    description: DESC_EN,
    url: URL,
    siteName: "FinancePlots",
    type: "article",
    images: [{ url: "https://www.financeplots.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE_EN,
    description: DESC_EN,
    images: ["https://www.financeplots.com/og-image.png"],
  },
  alternates: { canonical: URL },
};

type Props = { params: Promise<{ locale: string }> };

export default async function ArticleReverseDcf({ params }: Props) {
  const { locale } = await params;
  const es = locale === "es";

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: TITLE_EN,
            description: DESC_EN,
            url: URL,
            image: "https://www.financeplots.com/og-image.png",
            author: { "@type": "Person", name: "Javier Audibert" },
            publisher: {
              "@type": "Organization",
              name: "FinancePlots",
              logo: { "@type": "ImageObject", url: "https://www.financeplots.com/logo-sm.png" },
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": URL },
          }),
        }}
      />
      <BlogArticleShell>

        <Link href="/blog" className="text-blue-400 text-sm hover:text-blue-300 transition mb-8 inline-block">
          {es ? "← Volver al Blog" : "← Back to Blog"}
        </Link>

        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
          {es ? "Valoración" : "Valuation"}
        </span>
        <h1 className="text-4xl font-bold mt-2 mb-3 leading-tight">{es ? TITLE_ES : TITLE_EN}</h1>
        <p className="text-gray-400 text-sm mb-10">
          {es
            ? "Septiembre 2026 · 7 min de lectura · Por Javier Audibert"
            : "September 2026 · 7 min read · By Javier Audibert"}
        </p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">

          <p>
            {es
              ? <>Un DCF normal te pide que predigas el futuro. Eliges un crecimiento, un coste de capital y un valor terminal, y el modelo escupe un precio objetivo que, casualmente, casi siempre confirma lo que ya pensabas. Un <strong>DCF inverso</strong> le da la vuelta: toma el precio de hoy como dato y despeja la incógnita al revés. No pregunta cuánto vale la empresa, sino <em>qué tiene que pasar para que el precio actual tenga sentido</em>.</>
              : <>A normal DCF asks you to predict the future. You pick a growth rate, a cost of capital and a terminal value, and the model produces a target price that — conveniently — almost always confirms what you already thought. A <strong>reverse DCF</strong> turns it around: it takes today&apos;s price as given and solves backwards. It doesn&apos;t ask what the company is worth. It asks <em>what has to be true for the current price to make sense</em>.</>}
          </p>

          <p>
            {es
              ? <>Es una pregunta mucho más honesta, porque no puedes hacer trampas con ella. El resultado no depende de tu optimismo: es aritmética sobre el flujo de caja que la empresa genera hoy y sobre lo que el mercado está pagando por él. Y es muy de <strong>Howard Marks</strong>: el pensamiento de segundo nivel no consiste en decidir si un negocio es bueno, sino en preguntarse si eso <em>ya está en el precio</em>.</>
              : <>It is a far more honest question, because you cannot cheat at it. The answer doesn&apos;t depend on your optimism — it is arithmetic on the cash the business generates today and what the market is paying for it. And it is very much <strong>Howard Marks</strong>: second-level thinking isn&apos;t deciding whether a business is good, it is asking whether that is <em>already in the price</em>.</>}
          </p>

          <p className="text-sm text-gray-400 bg-white/5 border border-gray-700 rounded-xl px-4 py-3">
            {es
              ? "Este artículo describe cómo funciona un modelo, no es asesoramiento de inversión. Los números que aparecen son salidas de un modelo automático sobre datos públicos, con todas las limitaciones que se explican más abajo."
              : "This article describes how a model works; it is not investment advice. The figures below are outputs of an automated model over public data, with all the limitations set out further down."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-3">
            {es ? "La primera versión estaba rota" : "The first version was broken"}
          </h2>

          <p>
            {es
              ? <>Añadí el DCF inverso a mis screeners y pareció funcionar a la primera. Cogía las empresas que superaban el cribado, despejaba el crecimiento implícito, lo comparaba con el crecimiento histórico y escribía un comentario. Limpio.</>
              : <>I added the reverse DCF to my screeners and it seemed to work first time. It took the companies that passed the screen, solved for the implied growth, compared it with historical growth and wrote a commentary. Clean.</>}
          </p>

          <p>
            {es
              ? <>Entonces miré a Newmont, una minera de oro. El modelo decía que valía <strong>8.335 $ por acción</strong>. Cotizaba a 128 $. Un potencial del <strong>+6.407%</strong>.</>
              : <>Then I looked at Newmont, a gold miner. The model said it was worth <strong>$8,335 a share</strong>. It traded at $128. An upside of <strong>+6,407%</strong>.</>}
          </p>

          <p>
            {es
              ? <>El error no estaba en el DCF. Estaba en el crecimiento que le había dado de comer. El flujo de caja libre de Newmont en los cuatro años que tenía era <code>1.089M → 97M → 2.961M → 7.299M</code>. El CAGR punta a punta sale <strong>88,5% anual</strong> — y es matemáticamente correcto. Lo que describe no es el negocio: describe que el año de partida fue un suelo de 97 millones. Proyectar una recuperación cíclica diez años hacia adelante no es una valoración, es un artefacto.</>
              : <>The bug wasn&apos;t in the DCF. It was in the growth rate I had fed it. Newmont&apos;s free cash flow over the four years I had was <code>$1,089M → $97M → $2,961M → $7,299M</code>. The endpoint-to-endpoint CAGR is <strong>88.5% a year</strong> — and it is arithmetically correct. What it describes is not the business: it describes the fact that the starting year was a $97M trough. Projecting a cyclical recovery ten years forward isn&apos;t a valuation, it is an artefact.</>}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-3">
            {es ? "El CAGR siempre te da un número" : "CAGR always gives you a number"}
          </h2>

          <p>
            {es
              ? <>Ese es el problema de fondo. El CAGR solo mira el primer y el último año. Todo lo que pasa en medio — desplomes, picos, recuperaciones — es invisible para él. Y nunca te avisa: siempre devuelve un porcentaje de aspecto respetable, tanto si la serie es una tendencia como si es ruido.</>
              : <>That is the underlying problem. CAGR only looks at the first and last year. Everything in between — collapses, spikes, recoveries — is invisible to it. And it never warns you: it always returns a respectable-looking percentage, whether the series is a trend or noise.</>}
          </p>

          <p>
            {es
              ? <>El ejemplo que más me convenció fue Incyte, una biotecnológica. Su CAGR de flujo de caja libre era <strong>+14,2%</strong>. Suena a compounder. La serie real era <code>892M → 449M → 235M → 1.330M</code>: cayó a la cuarta parte y luego se multiplicó por cinco. El 14,2% existe solo porque el primer y el último punto casualmente caen donde caen.</>
              : <>The example that convinced me was Incyte, a biotech. Its free cash flow CAGR was <strong>+14.2%</strong>. That sounds like a compounder. The actual series was <code>$892M → $449M → $235M → $1,330M</code>: it fell to a quarter and then quintupled. The 14.2% exists only because the first and last points happen to sit where they do.</>}
          </p>

          <p>
            {es
              ? <>La solución fue dejar de preguntar solo <em>cuál es el crecimiento</em> y empezar a preguntar <em>si esta empresa tiene siquiera un crecimiento</em>. En vez de unir los extremos, ajusto una recta por mínimos cuadrados sobre el logaritmo del flujo de caja, usando todos los puntos, y me quedo con el <strong>R²</strong>: cuánta parte del movimiento explica realmente esa recta.</>
              : <>The fix was to stop asking only <em>what is the growth rate</em> and start asking <em>whether this company has a growth rate at all</em>. Instead of joining the endpoints, I fit a least-squares line through log cash flow using every point, and keep the <strong>R²</strong>: how much of the movement that line actually explains.</>}
          </p>

          <div className="bg-white/5 border border-gray-700 rounded-xl px-5 py-4 text-sm">
            <p className="text-blue-300 font-semibold mb-2">{es ? "Los mismos datos, dos lecturas" : "Same data, two readings"}</p>
            <ul className="space-y-1.5">
              <li>{es ? "Incyte — CAGR +14,2%, R² 0,01. La recta explica el 1% del movimiento." : "Incyte — CAGR +14.2%, R² 0.01. The line explains 1% of the movement."}</li>
              <li>{es ? "Newmont — CAGR +88,5%, R² 0,05 sobre 17 años. No hay tendencia." : "Newmont — CAGR +88.5%, R² 0.05 over 17 years. There is no trend."}</li>
              <li>{es ? "Adobe — CAGR +10,0%, R² 0,93 sobre 17 años. Esto sí es una tendencia." : "Adobe — CAGR +10.0%, R² 0.93 over 17 years. This is a trend."}</li>
            </ul>
          </div>

          <p>
            {es
              ? <>Por debajo de un R² de 0,50, el modelo <strong>no proyecta nada</strong>. No recorta el número, no lo publica con una nota al pie: se niega, y dice por qué. En una semana típica, eso significa que cuatro de las cinco empresas que superan el cribado no reciben valoración.</>
              : <>Below an R² of 0.50 the model <strong>projects nothing</strong>. It doesn&apos;t trim the number or publish it with a footnote: it declines, and says why. In a typical week that means four of the five companies that pass the screen get no valuation at all.</>}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-3">
            {es ? "Cuatro años no son suficientes" : "Four years is not enough"}
          </h2>

          <p>
            {es
              ? <>La segunda debilidad era más incómoda: la fuente de datos gratuita que usaba daba cuatro ejercicios anuales. Cuatro puntos son <strong>tres observaciones de crecimiento</strong>. Cualquier probabilidad calculada sobre tres observaciones es una moneda al aire con adornos estadísticos, y una ventana de cuatro años sobre una empresa cíclica puede caer entera dentro de un suelo o de un pico.</>
              : <>The second weakness was more uncomfortable: the free data source I was using gave four annual statements. Four points is <strong>three growth observations</strong>. Any probability built on three observations is a coin toss with statistical decoration, and a four-year window on a cyclical company can land entirely inside a trough or a peak.</>}
          </p>

          <p>
            {es
              ? <>La solución resultó ser gratis y estar a la vista: la <strong>API XBRL de la SEC</strong>. Es pública, no necesita clave, y devuelve todo lo que una empresa ha declarado alguna vez para una partida contable. Para Adobe son <strong>17 ejercicios</strong> en lugar de 4. Tres observaciones pasan a ser dieciséis.</>
              : <>The fix turned out to be free and in plain sight: the <strong>SEC&apos;s XBRL API</strong>. It is public, needs no key, and returns everything a company has ever filed for a given line item. For Adobe that is <strong>17 years</strong> instead of 4. Three observations become sixteen.</>}
          </p>

          <p>
            {es
              ? <>El cambio no solo dio más datos, cambió las respuestas. Ulta ajustaba a un R² de 0,32 con cuatro años — sin tendencia — y a <strong>0,84 con catorce</strong>. La ventana corta no es que fuera imprecisa: es que decía otra cosa.</>
              : <>The change didn&apos;t just add data, it changed the answers. Ulta fitted an R² of 0.32 on four years — no trend — and <strong>0.84 on fourteen</strong>. The short window wasn&apos;t merely imprecise: it said something different.</>}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-3">
            {es ? "Y entonces el problema contrario" : "And then the opposite problem"}
          </h2>

          <p>
            {es
              ? <>Con catorce años aparece un riesgo que con cuatro no existía: un ajuste excelente que describe a <em>otra</em> empresa. Ulta compone al <strong>28% anual durante catorce años</strong>, con un R² de 0,84. Impecable. Pero en los <strong>últimos cinco años crece al 1,8%</strong>.</>
              : <>With fourteen years comes a risk that four never had: an excellent fit describing a <em>different</em> company. Ulta compounds at <strong>28% a year over fourteen years</strong>, with an R² of 0.84. Impeccable. But over the <strong>last five years it grows at 1.8%</strong>.</>}
          </p>

          <p>
            {es
              ? <>Las dos cifras son correctas y describen periodos distintos. Proyectar el 28% sería leer la década equivocada. Ahora el modelo ajusta las dos ventanas y proyecta <strong>la más prudente</strong>: Ulta se valora al 1,8%, y Adobe al 8,1% de su ventana reciente en lugar del 18% de su tendencia larga. El potencial de Adobe cayó de <strong>+80% a +28%</strong> con ese único cambio.</>
              : <>Both figures are correct and describe different periods. Projecting 28% would be reading the wrong decade. The model now fits both windows and projects <strong>whichever is lower</strong>: Ulta is valued on 1.8%, and Adobe on the 8.1% of its recent window rather than the 18% of its long-run trend. Adobe&apos;s upside fell from <strong>+80% to +28%</strong> on that one change.</>}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-3">
            {es ? "Lo que queda: un modelo que se calla" : "What is left: a model that stays quiet"}
          </h2>

          <p>
            {es
              ? <>La versión actual retiene más de lo que publica. Si el flujo de caja no tiene forma de tendencia, no hay valoración. Si la volatilidad del crecimiento es demasiado alta, la probabilidad no se muestra — porque un &quot;52,3%&quot; con una advertencia al lado se sigue leyendo como 52,3%: en una tabla, el número siempre gana a la nota. Y cuando sí publica una probabilidad, la da como <strong>rango</strong>, nunca como cifra única, porque descansa sobre pocas observaciones.</>
              : <>The current version withholds more than it publishes. If cash flow has no trend shape, there is no valuation. If growth volatility is too high, the probability is not shown — because a &quot;52.3%&quot; with a warning beside it still reads as 52.3%: in a table, the number always beats the caveat. And when it does publish a probability, it gives a <strong>range</strong>, never a single figure, because it rests on few observations.</>}
          </p>

          <p>
            {es
              ? <>Hay una cosa que sí sobrevive siempre: <strong>el crecimiento implícito</strong>. No necesita histórico, ni tendencia, ni proyección — solo el flujo de caja actual y la capitalización. Da igual lo caótica que sea la empresa: el precio siempre está asumiendo algo, y eso siempre se puede despejar. Esa es, al final, la única cifra que de verdad importaba.</>
              : <>One thing always survives: <strong>the implied growth rate</strong>. It needs no history, no trend and no projection — only current cash flow and market cap. However chaotic the company, the price is always assuming something, and that can always be solved for. Which is, in the end, the only figure that really mattered.</>}
          </p>

          <p>
            {es
              ? <>Sigue habiendo límites, y están publicados junto a la tabla: el crecimiento terminal es un 2,5% único aplicado a una minera, una biotecnológica y una cadena de cosmética por igual; el modelo ve flujo de caja pero nunca el motivo, así que un cobro extraordinario y un cambio real de tendencia le parecen lo mismo; y el histórico largo solo existe para quien presenta ante la SEC, o sea que el screener del IBEX 35 trabaja con menos datos que el del S&amp;P 500.</>
              : <>Limits remain, and they are published next to the table: terminal growth is a single 2.5% applied to a gold miner, a biotech and a cosmetics retailer alike; the model sees cash flow but never the reason behind it, so a one-off settlement and a genuine change in trend look identical to it; and the long history only exists for SEC filers, meaning the IBEX 35 screener works with less data than the S&amp;P 500 one.</>}
          </p>

          <p>
            {es
              ? <>Si me llevo algo de haberlo construido es esto: pasé la mayor parte del tiempo no haciendo el modelo más listo, sino enseñándole a reconocer cuándo no sabe. Un modelo que siempre responde no es más útil — solo es más difícil de contradecir.</>
              : <>If I take one thing from building it, it is this: most of the time went not into making the model smarter, but into teaching it to recognise when it doesn&apos;t know. A model that always answers isn&apos;t more useful — it is just harder to argue with.</>}
          </p>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl px-5 py-4 mt-10">
            <p className="text-blue-300 font-semibold mb-2">
              {es ? "Ver el modelo en producción →" : "See the model in production →"}
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tools/quality-screener" className="text-blue-400 hover:text-blue-300 transition">
                  {es ? "→ Quality Screener del S&P 500 — con la sección de DCF inverso" : "→ S&P 500 Quality Screener — with the Reverse DCF section"}
                </Link>
              </li>
              <li>
                <Link href="/tools/quality-screener-ibex35" className="text-blue-400 hover:text-blue-300 transition">
                  {es ? "→ Quality Screener del IBEX 35" : "→ IBEX 35 Quality Screener"}
                </Link>
              </li>
              <li>
                <Link href="/blog/dcf-valuation-guide" className="text-blue-400 hover:text-blue-300 transition">
                  {es ? "→ Guía: cómo funciona un DCF tradicional" : "→ Guide: how a traditional DCF works"}
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <ShareButtons url={URL} title={es ? TITLE_ES : TITLE_EN} />

      </BlogArticleShell>
    </main>
  );
}
