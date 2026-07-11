import Link from "next/link";
import type { Metadata } from "next";
import BlogArticleShell from "@/components/BlogArticleShell";

export const metadata: Metadata = {
  title: "Control Is the Whole Game: What Real Madrid, Spain and Football Taught Me About Finance | FinancePlots",
  description:
    "From the 2017 Champions League final in Cardiff to Spain's control-first run through this World Cup, including their last match against Belgium — why the unglamorous discipline of building systems, controls and the right reports is what actually makes a finance professional valuable.",
  alternates: { canonical: "https://www.financeplots.com/blog/control-is-the-whole-game" },
  openGraph: {
    title: "Control Is the Whole Game: What Real Madrid, Spain and Football Taught Me About Finance",
    description:
      "From Cardiff 2017 to Spain's last match against Belgium — why control, not speed or spectacle, is what makes a finance professional valuable.",
    url: "https://www.financeplots.com/blog/control-is-the-whole-game",
    siteName: "FinancePlots",
    type: "article",
    images: [{ url: "https://www.financeplots.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Control Is the Whole Game: What Real Madrid, Spain and Football Taught Me About Finance",
    description:
      "From Cardiff 2017 to Spain's last match against Belgium — why control, not speed or spectacle, is what makes a finance professional valuable.",
    images: ["https://www.financeplots.com/og-image.png"],
  },
};

type Props = { params: Promise<{ locale: string }> };

export default async function ControlIsTheWholeGame({ params }: Props) {
  const { locale } = await params;
  const es = locale === "es";

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: "{\"@context\":\"https://schema.org\",\"@type\":\"Article\",\"headline\":\"Control Is the Whole Game: What Real Madrid, Spain and Football Taught Me About Finance\",\"description\":\"From the 2017 Champions League final in Cardiff to Spain's control-first run through this World Cup, including their last match against Belgium — why the unglamorous discipline of building systems, controls and the right reports is what actually makes a finance professional valuable.\",\"url\":\"https://www.financeplots.com/blog/control-is-the-whole-game\",\"image\":\"https://www.financeplots.com/og-image.png\",\"author\":{\"@type\":\"Person\",\"name\":\"Javier Audibert\"},\"publisher\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\",\"logo\":{\"@type\":\"ImageObject\",\"url\":\"https://www.financeplots.com/logo-sm.png\"}},\"mainEntityOfPage\":{\"@type\":\"WebPage\",\"@id\":\"https://www.financeplots.com/blog/control-is-the-whole-game\"}}" }} />
      <BlogArticleShell>

        <Link href="/blog" className="text-blue-400 text-sm hover:text-blue-300 transition mb-8 inline-block">
          {es ? "← Volver al Blog" : "← Back to Blog"}
        </Link>

        <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
          {es ? "Opinión" : "Opinion"}
        </span>
        <h1 className="text-4xl font-bold mt-2 mb-3 leading-tight">
          {es
            ? "Control es todo el partido: lo que Real Madrid, España y el fútbol me enseñaron sobre finanzas"
            : "Control Is the Whole Game: What Real Madrid, Spain and Football Taught Me About Finance"}
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          {es ? "Julio 2026 · 8 min de lectura · Por Javier Audibert" : "July 2026 · 8 min read · By Javier Audibert"}
        </p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">

          <p>
            {es
              ? "En 2017, dos de mis hermanos y yo condujimos desde Oxford hasta Cardiff para la final de la Champions League: Real Madrid contra la Juventus. Somos cuatro hermanos, así que uno se quedó sin ir aquel día. Antes del partido nos comimos uno de los mejores curries que he probado en mi vida — de esos que acaban formando parte del recuerdo tanto como el propio partido. Luego llegó el partido, y es de esas noches que repites en la cabeza años después."
              : "In 2017, two of my brothers and I drove down from Oxford to Cardiff for the Champions League final: Real Madrid against Juventus. There are four of us, so one brother missed out that day. Before the match, we had one of the best curries I've ever eaten — the kind of meal that becomes as much a part of the memory as the game itself. Then came the match, and it's one of those nights you replay in your head years later."}
          </p>

          <p>
            {es
              ? "El Madrid empezó bien, pero fue la segunda parte la que se me quedó grabada. No solo estaban ganando — estaban controlando. Cada pase tenía un propósito, cada movimiento defensivo cerraba una línea de pase antes de que la Juventus siquiera la pensara, cada cambio de ritmo llegaba exactamente cuando el Madrid quería que llegara. Se sentía desde la grada. No era caos bien gestionado. Era calma, porque no se dejaba nada al azar. El Madrid ganó 4-1 esa noche, y el resultado final ni siquiera reflejaba lo controlado que fue el partido."
              : "Madrid started well, but it was the second half that stayed with me. They weren't just winning — they were controlling. Every pass had a purpose, every defensive shift closed off a passing lane before Juventus even thought of it, every change of tempo happened exactly when Madrid wanted it to. You could feel it from the stands. It wasn't chaos being managed well. It was calm, because nothing was left to chance. Madrid won 4-1 that night, and the scoreline barely captured how controlled the match actually was."}
          </p>

          <p>
            {es
              ? "Siento lo mismo viendo jugar a España. Sé que a mucha gente le parece aburrida — la posesión interminable, la construcción paciente, la negativa a precipitar un momento antes de que esté maduro. Pero esa es exactamente la cuestión. No va de velocidad ni de espectáculo. Va de control: cuándo presionar arriba y cuándo replegarse, cuándo acelerar y cuándo bajar el ritmo y quitarle veneno al partido, cómo defender simplemente no dejando que el balón llegue al rival. Luis Enrique construyó equipos así. Viendo a España ganar 1-0 y con sufrimiento a Portugal en este Mundial — invicta, sin encajar un gol de camino a cuartos — es el mismo patrón otra vez. Nada vistoso. Solo control, implacable y silencioso."
              : "I get the same feeling watching Spain play. I know some people find it boring — the endless possession, the patient build-up, the refusal to rush a moment before it's ready. But that's exactly the point. It's not about speed or spectacle. It's about control: when to press high and when to sit deeper, when to accelerate and when to slow the game down and take the sting out of it, how to defend by simply not letting the ball go to the other team. Luis Enrique built teams like that. Watching Spain grind out a 1-0 win over Portugal in this year's World Cup — unbeaten, yet to concede a goal heading into the quarter-finals — it's the same pattern again. Nothing flashy. Just relentless, quiet control."}
          </p>

          <p>
            {es
              ? "Y ese patrón se repitió, quizás más claro que nunca, en el último partido de España, el de cuartos de final contra Bélgica: 2-1. Bélgica se metió atrás en bloque bajo y desafió a España a desatascarla, y hasta consiguió meterla en un aprieto con un gol. España no se puso nerviosa. Siguió moviendo el balón de lado a lado, esperando el medio metro exacto de espacio, y encontró los dos goles que necesitaba sin dejar nunca de controlar el partido. Ahora esperan a Francia en semifinales — otro examen de control frente a un rival igual de peligroso."
              : "That pattern showed up again, maybe more clearly than ever, in Spain's last match, the quarter-final against Belgium: 2-1. Belgium sat deep in a low block and dared Spain to break them down, and even managed to put them under pressure with a goal of their own. Spain didn't panic. They kept moving the ball side to side, waiting for the exact half-yard of space, and found the two goals they needed without ever losing control of the match. Now they wait for France in the semi-finals — another test of control against an equally dangerous opponent."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "¿Y esto qué tiene que ver con las finanzas?" : "So what does this have to do with finance?"}
          </h2>

          <p>
            {es ? "Todo, en realidad." : "Everything, actually."}
          </p>

          <p>
            {es
              ? "He trabajado como la única persona de finanzas en un par de startups — sin equipo, sin respaldo, solo yo entre los ejecutivos y los números. En esa posición aprendes muy rápido que el «control» no es una palabra de manual de auditoría. Es supervivencia. Si no construyes tú mismo los sistemas — las conciliaciones, los flujos de aprobación, el calendario de reporting, las verificaciones que detectan un error antes de que se convierta en un titular — nadie los va a construir por ti. No hay banquillo del que tirar."
              : "I worked as the only person in finance at a couple of startups — no team, no backup, just me between the executives and the numbers. In that position, you learn very quickly that \"control\" isn't a buzzword from an audit textbook. It's survival. If you don't build the systems yourself — the reconciliations, the approval workflows, the reporting cadence, the checks that catch a mistake before it becomes a headline — nobody will build them for you. There's no one else on the bench."}
          </p>

          <p>
            {es
              ? "Así que construí. No porque un manual de políticas me lo dijera, sino porque el control era la única forma real de entender lo que estaba pasando en el negocio:"
              : "So I built things. Not because a policy manual told me to, but because control was the only way to actually understand what was happening in the business:"}
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li>
              {es
                ? "Sistemas, para que los datos no vivieran en la cabeza de una persona ni en una hoja de cálculo que solo entendía una persona."
                : "Systems, so that data didn't live in someone's head or a single spreadsheet that only one person understood."}
            </li>
            <li>
              {es
                ? "Controles, para que los errores se detectaran en el punto de entrada, no tres meses después en el cierre anual."
                : "Controls, so that errors got caught at the point of entry, not three months later at year-end."}
            </li>
            <li>
              {es
                ? "Los informes correctos — no los que quedaban bien, sino los que le decían a los ejecutivos y al consejo exactamente dónde estaba el negocio, antes de que tuvieran que preguntarlo. Un informe mensual de desviaciones que explicaba por qué el real se había alejado del presupuesto, no solo que se había alejado. Un flujo de caja móvil a 13 semanas que hacía que nadie se sorprendiera nunca por un agujero de financiación tres meses después — lo veías venir en la semana uno y tenías tiempo para actuar."
                : "The right reports — not the reports that looked impressive, but the ones that told the executives and the board exactly where the business stood, before they had to ask. A monthly variance report that explained why actuals had moved away from budget, not just that they had. A rolling 13-week cash flow that meant nobody was ever surprised by a funding gap three months down the line — you saw it coming in week one and had time to act."}
            </li>
          </ul>

          <p>
            {es
              ? "Eso es lo que la gente no capta sobre «ser bueno con los números». La competencia técnica es la entrada mínima. Lo que realmente hace valioso a un profesional de finanzas es lo mismo que hace valioso al mediocampo del Madrid o a la defensa de España: un compromiso obsesivo y nada glamuroso con el control. Saber adónde va cada pase antes de darlo. Cerrar el hueco antes de que llegue el rival — o el riesgo."
              : "That's the part people miss about being \"good with numbers.\" Technical competence is table stakes. What actually makes a finance professional valuable is the same thing that makes Madrid's midfield or Spain's back line valuable: an obsessive, unglamorous commitment to control. Knowing where every pass is going before you make it. Closing the gap before the opponent — or the risk — even gets there."}
          </p>

          <div className="bg-blue-600/10 border border-blue-700/30 rounded-xl p-6 my-8">
            <p className="text-blue-300 text-sm font-semibold mb-2">
              {es ? "El control no es la opción aburrida — es la disciplina que gana" : "Control isn't the boring option — it's the discipline that wins"}
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              {es
                ? "Los equipos y los profesionales que persiguen la emoción por sí misma tienden a quemarse. Los que perduran — los que llegan lejos en los torneos, los que sobreviven a las recesiones, los que ascienden — suelen ser los que dominaron el control en silencio mucho antes de que alguien mirara. El Real Madrid de aquella segunda parte en Cardiff no estaba improvisando genialidad. Estaba ejecutando un plan que había controlado durante 90 minutos. La racha invicta de España en este Mundial no es suerte. Es un sistema."
                : "The teams and the professionals who chase excitement for its own sake tend to flame out. The ones who last — who go deep into tournaments, who survive downturns, who get promoted — are usually the ones who've quietly mastered control long before anyone was watching. Real Madrid in that second half in Cardiff weren't improvising brilliance. They were executing a plan they'd controlled for 90 minutes. Spain's clean sheet run into this World Cup's quarter-finals isn't luck. It's a system."}
            </p>
          </div>

          <p>
            {es
              ? "Los mejores profesionales de FP&A que conozco operan igual. No son los que corren a explicar una cifra después de que ha pasado — son los que construyeron el sistema para que esa cifra nunca fuera una sorpresa en primer lugar. Un buen informe de desviaciones y un flujo de caja a 13 semanas en vivo hacen por un negocio lo mismo que la defensa de España hace por su portería: cierran los huecos antes de que nadie note siquiera que estaban abiertos."
              : "The best FP&A professionals I know operate the same way. They're not the ones scrambling to explain a number after the fact — they're the ones who built the system so the number was never a surprise in the first place. A well-built variance report and a live 13-week cash flow do for a business what Spain's back line does for their defence: they close off the gaps before anyone even notices they were open."}
          </p>

          <p>
            {es
              ? "El control no es aburrido. Es todo el partido."
              : "Control isn't boring. It's the whole game."}
          </p>
        </div>

        <div className="mt-14 bg-[#0d1426] border border-blue-700/40 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">
            {es ? "Construye el sistema, no solo el informe" : "Build the system, not just the report"}
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            {es
              ? "Nuestro flujo de caja a 13 semanas y nuestro informe de presupuesto anual están pensados para que veas los huecos antes de que se conviertan en un problema, no después."
              : "Our 13-week cash flow forecast and annual budget tools are built so you see the gaps before they become a problem, not after."}
          </p>
          <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition inline-block">
            {es ? "Abrir las herramientas" : "Open the tools"}
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
