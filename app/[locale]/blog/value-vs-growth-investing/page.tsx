import Link from "next/link";
import type { Metadata } from "next";
import BlogArticleShell from "@/components/BlogArticleShell";

export const metadata: Metadata = {
  title: "Value vs Growth: A Century of Cycles, the Fed, Bitcoin and Gold | FinancePlots",
  description:
    "A century of value vs growth cycles — from 1920 to today. Why the next Fed meeting matters, where Bitcoin fits, and why gold never really leaves the room.",
  alternates: { canonical: "https://www.financeplots.com/blog/value-vs-growth-investing" },
  openGraph: {
    title: "Value vs Growth: A Century of Cycles, the Fed, Bitcoin and Gold",
    description:
      "A century of value vs growth cycles — from 1920 to today. Why the next Fed meeting matters, where Bitcoin fits, and why gold never really leaves the room.",
    url: "https://www.financeplots.com/blog/value-vs-growth-investing",
    siteName: "FinancePlots",
    type: "article",
    images: [{ url: "https://www.financeplots.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Value vs Growth: A Century of Cycles, the Fed, Bitcoin and Gold",
    description:
      "A century of value vs growth cycles — from 1920 to today. Why the next Fed meeting matters, where Bitcoin fits, and why gold never really leaves the room.",
    images: ["https://www.financeplots.com/og-image.png"],
  },
};

type Props = { params: Promise<{ locale: string }> };

export default async function ValueVsGrowthInvesting({ params }: Props) {
  const { locale } = await params;
  const es = locale === "es";

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: "{\"@context\":\"https://schema.org\",\"@type\":\"Article\",\"headline\":\"Value vs Growth: A Century of Cycles, the Fed, Bitcoin and Gold\",\"description\":\"A century of value vs growth cycles — from 1920 to today. Why the next Fed meeting matters, where Bitcoin fits, and why gold never really leaves the room.\",\"url\":\"https://www.financeplots.com/blog/value-vs-growth-investing\",\"image\":\"https://www.financeplots.com/og-image.png\",\"author\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\"},\"publisher\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\",\"logo\":{\"@type\":\"ImageObject\",\"url\":\"https://www.financeplots.com/logo-sm.png\"}},\"mainEntityOfPage\":{\"@type\":\"WebPage\",\"@id\":\"https://www.financeplots.com/blog/value-vs-growth-investing\"}}" }} />
      <BlogArticleShell>

        <Link href="/blog" className="text-blue-400 text-sm hover:text-blue-300 transition mb-8 inline-block">
          {es ? "← Volver al Blog" : "← Back to Blog"}
        </Link>

        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
          {es ? "Opinión" : "Opinion"}
        </span>
        <h1 className="text-4xl font-bold mt-2 mb-3 leading-tight">
          {es
            ? "Value vs Growth: Un Siglo de Ciclos, la Fed, Bitcoin y el Oro"
            : "Value vs Growth: A Century of Cycles, the Fed, Bitcoin and Gold"}
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          {es ? "Abril 2026 · 10 min de lectura · Por Javier Audibert" : "April 2026 · 10 min read · By Javier Audibert"}
        </p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">

          <p>
            {es
              ? "Una confesión antes de empezar: la inversión no es más que un juego de modas con decorado serio. Ponle traje, corbata y una pantalla de Bloomberg, pero por debajo sigue siendo lo mismo que en el colegio — lo que estaba de moda el año pasado, no lo está este. Lo que funcionaba durante veinte años, de repente deja de funcionar. Y entonces vuelve. Eso es, en una frase, la historia del value investing y el growth investing en los últimos cien años."
              : "A confession before we start: investing is mostly a fashion game in a serious costume. You can put it in a suit, give it a Bloomberg screen and call it \u201Cmarkets\u201D, but underneath it behaves exactly like school — what was cool last year isn\u2019t cool this year. What worked for twenty years suddenly stops working. Then it comes back. That, in one sentence, is the last hundred years of value vs growth investing."}
          </p>

          <p>
            {es
              ? "Este artículo no pretende darte una respuesta definitiva sobre qué estilo es mejor. La respuesta depende del momento, de los tipos de interés, y en gran parte, de lo que haga la Reserva Federal en su próxima reunión. Pero sí voy a contarte cómo han ido los últimos cien años, por qué la Fed lo cambia todo, y dónde encajan cosas raras como Bitcoin y el oro. Cinturón puesto."
              : "This isn\u2019t going to give you a final answer on which style is \u201Cbetter\u201D. The answer depends on the decade, on interest rates, and largely on what the Federal Reserve does at its next meeting. But I\u2019ll walk you through the last hundred years, explain why the Fed changes everything, and show where oddities like Bitcoin and gold fit in. Seatbelt on."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Primero, en castellano: qué significa cada cosa" : "First, in plain English: what each thing means"}
          </h2>
          <p>
            {es
              ? "Value investing — comprar empresas que cotizan por debajo de lo que valen sus activos o sus beneficios. Empresas aburridas, maduras, que generan caja. Bancos, petroleras, utilities, industriales. Las cosas que tus padres compraban."
              : "Value investing — buying companies that trade below what their assets or earnings are worth. Boring, mature, cash-generating businesses. Banks, oil majors, utilities, industrials. The stuff your parents bought."}
          </p>
          <p>
            {es
              ? "Growth investing — comprar empresas que crecen rápido, incluso si hoy no ganan mucho dinero (o no ganan nada). Tecnología, biotech, software. La promesa de ganancias futuras enormes. Las cosas que están en los anuncios de TikTok."
              : "Growth investing — buying companies that grow fast, even if they don\u2019t make much money today (or any at all). Tech, biotech, software. The promise of huge future earnings. The stuff that ends up in TikTok ads."}
          </p>
          <p>
            {es
              ? "Las dos son estrategias legítimas. Las dos funcionan. Simplemente no funcionan a la vez, y ahí está la gracia."
              : "Both are legitimate strategies. Both work. They just don\u2019t work at the same time — and that\u2019s where it gets interesting."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "1920–2000: la era dorada del value" : "1920–2000: the golden age of value"}
          </h2>
          <p>
            {es
              ? "Si hubieras puesto dinero en acciones tipo value entre 1926 y el año 2000, habrías batido al growth por un margen enorme. Hay estudios de Fama y French, de Ibbotson, de cada académico que ha tocado el tema — todos llegan a la misma conclusión: comprar barato, a múltiplos bajos, funcionaba. Punto."
              : "If you had bought value stocks between 1926 and 2000, you\u2019d have beaten growth by a wide margin. Fama and French, Ibbotson, every academic who has touched the subject reaches the same conclusion: buying cheap, at low multiples, worked. Full stop."}
          </p>
          <p>
            {es
              ? "Piénsalo. En ese periodo el mundo vivió la Gran Depresión, la Segunda Guerra Mundial, los años 50 americanos, la inflación de los 70, el boom de los 80 y 90. Ocho décadas con guerras, inflación, estanflación, recesiones, burbujas inmobiliarias, el fin de Bretton Woods, la caída de la Unión Soviética. Y en casi todas las ventanas temporales de ese siglo, comprar empresas infravaloradas superaba a comprar historias brillantes."
              : "Think about that. That period includes the Great Depression, the Second World War, the American fifties, the stagflation of the seventies, the boom of the eighties and nineties. Eight decades covering wars, inflation, stagflation, recessions, property bubbles, the end of Bretton Woods, the fall of the Soviet Union. And in almost every rolling window of that century, buying undervalued companies beat buying exciting stories."}
          </p>
          <p>
            {es
              ? "¿Por qué? Porque los tipos de interés eran, de media, razonables. Cuando el dinero cuesta algo — digamos un 5%, 6%, 8% — los inversores exigen a las empresas que ganen dinero pronto. Los beneficios de dentro de veinte años descontados al 8% valen muy poco hoy. Así que el mercado premia a las compañías que sacan caja ya, no las que prometen sacarla en 2045."
              : "Because interest rates, on average, were reasonable. When money costs something — 5%, 6%, 8% — investors demand companies earn money soon. Profits twenty years out, discounted at 8%, are worth very little today. So the market rewards companies that produce cash now, not the ones promising to do so in 2045."}
          </p>
          <p>
            {es
              ? "Warren Buffett hizo su carrera así. Benjamin Graham escribió el manual. Sus libros son casi todos de este periodo, y por eso nos los enseñan en las escuelas de negocio: porque durante ochenta años, eso fue lo que funcionaba."
              : "Warren Buffett built his career this way. Benjamin Graham wrote the manual. Their books are almost all from this period, which is why business schools still teach them: because for eighty years, that was what worked."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "2000–2021: el mundo se da la vuelta — la era del growth" : "2000–2021: the world flips upside down — the age of growth"}
          </h2>
          <p>
            {es
              ? "Y entonces llegó el siglo XXI, y todo lo que funcionaba antes dejó de funcionar. De hecho, pasó algo más raro: dejó de funcionar durante veinte años seguidos."
              : "Then the 21st century arrived, and everything that used to work stopped working. Worse — it stopped working for twenty years straight."}
          </p>
          <p>
            {es
              ? "Si compraste un fondo de value en el año 2000 y lo comparaste con un fondo growth en 2021, perdiste por paliza. El Nasdaq multiplicó por 10. Amazon subió miles de puntos porcentuales. Google, Apple, Microsoft, Netflix, Meta — los FAANG — crearon más valor bursátil que ningún grupo de empresas en la historia humana. Y mientras tanto, los bancos europeos, las petroleras, las utilities — el núcleo del value — estuvieron planas durante dos décadas."
              : "If you bought a value fund in 2000 and held it against a growth fund until 2021, you got crushed. The Nasdaq 10x\u2019d. Amazon went up thousands of percent. Google, Apple, Microsoft, Netflix, Meta — the FAANGs — created more market cap than any group of companies in human history. Meanwhile European banks, oil majors, utilities — the core of value — went sideways for two decades."}
          </p>
          <p>
            {es
              ? "¿La razón? Los tipos de interés. En 2008, la Fed bajó los tipos al 0%. Durante los siguientes trece años, el dinero fue prácticamente gratis. Y cuando el dinero es gratis, los beneficios futuros descontados valen casi lo mismo que los de hoy. Entonces tiene sentido pagar 100 veces beneficios por una empresa que promete que en diez años ganará mucho. Tiene sentido que Tesla cotice a valoraciones absurdas. Tiene sentido que Zoom, que no había ganado un céntimo, valga más que IBM. Porque el descuento era cero."
              : "The reason? Interest rates. In 2008 the Fed cut rates to 0%. For the next thirteen years, money was essentially free. And when money is free, future earnings discounted back are worth almost as much as today\u2019s earnings. Suddenly it makes sense to pay 100 times earnings for a company promising to make money in ten years. It makes sense that Tesla trades at absurd multiples. It makes sense that Zoom — which hadn\u2019t earned a penny — is worth more than IBM. Because the discount rate was zero."}
          </p>
          <p>
            {es
              ? "Esa fue la era ZIRP (Zero Interest Rate Policy). Y fue brutalmente buena para el growth. También creó monstruos: empresas que nunca habían ganado dinero valiendo miles de millones, startups unicornio cada semana, criptomonedas de nombres ridículos pasando de cero a miles de millones en meses. La fiesta duró hasta finales de 2021."
              : "That was the ZIRP era — Zero Interest Rate Policy — and it was brutally good for growth. It also created monsters: companies that had never made money valued in the billions, a new unicorn startup every week, coins with ridiculous names going from zero to billions in months. The party lasted until late 2021."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "2022 en adelante: el péndulo vuelve" : "2022 onwards: the pendulum swings back"}
          </h2>
          <p>
            {es
              ? "En 2022, la inflación llegó. La Fed, muy a su pesar, tuvo que subir tipos. Los subió más rápido que en ninguna otra ocasión en cuarenta años — del 0% al 5% en año y medio. Y de repente, el juego cambió."
              : "In 2022, inflation showed up. The Fed, reluctantly, had to hike. They hiked faster than in any cycle of the past forty years — from 0% to 5% in about eighteen months. And suddenly the game changed."}
          </p>
          <p>
            {es
              ? "Las empresas growth cayeron un 30%, 50%, 70%. Las que no ganaban dinero se hundieron. Los bonos cayeron — algo que casi nunca pasa a la vez que las acciones. Y mientras, el value empezó a resurgir, despacio, como una tortuga saliendo del cascarón después de veinte años."
              : "Growth companies dropped 30%, 50%, 70%. The ones that weren\u2019t making money collapsed. Bonds also fell — something that almost never happens at the same time as equities. And value quietly started to work again, slowly, like a tortoise crawling out after twenty years in its shell."}
          </p>
          <p>
            {es
              ? "2022, 2023 y 2024 han sido años donde las petroleras, los bancos, las eléctricas, las industriales lo han hecho sorprendentemente bien. No porque de repente sean negocios espectaculares, sino porque a tipos del 5%, la gente quiere beneficios ahora, no en 2040. Es el mismo razonamiento de 1970, solo que aplicado cincuenta años después."
              : "2022, 2023 and 2024 have been surprisingly good to oil majors, banks, utilities, industrials. Not because those businesses suddenly became exciting, but because at 5% rates, people want earnings now, not in 2040. It\u2019s the exact same logic as 1970, just applied fifty years later."}
          </p>
          <p>
            {es
              ? "¿Se ha acabado la era growth? Probablemente no del todo — la IA ha puesto a Nvidia y a Microsoft en esteroides. Pero la era en la que cualquier empresa con un .com o un powerpoint valía miles de millones, esa sí se ha acabado. De momento."
              : "Is the growth era over? Probably not entirely — AI has put Nvidia and Microsoft on steroids. But the era when any company with a .com or a slick pitch deck was worth billions? That one is gone. For now."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Por qué la próxima reunión de la Fed importa tanto" : "Why the next Fed meeting matters so much"}
          </h2>
          <p>
            {es
              ? "Todo lo que acabamos de contar se puede resumir en una frase: los tipos de interés mandan. Punto. Cuando están altos, gana el value. Cuando están bajos, gana el growth. Es casi una ley física de los mercados."
              : "Everything above reduces to one sentence: interest rates rule. Full stop. When rates are high, value wins. When rates are low, growth wins. It\u2019s almost a law of markets."}
          </p>
          <p>
            {es
              ? "Y por eso cada reunión del FOMC — el comité de la Fed que decide los tipos cada seis semanas — es el evento económico más importante del planeta. No es una exageración. Lo que decida Jerome Powell (o quien esté en ese sillón cuando leas esto) afecta al precio de todas las acciones, todos los bonos, todas las viviendas y todas las divisas del mundo."
              : "Which is why every FOMC meeting — the Fed committee that sets rates every six weeks — is the single most important economic event on the planet. That\u2019s not hyperbole. Whatever Jerome Powell (or whoever\u2019s in the chair when you read this) decides moves the price of every stock, every bond, every house and every currency in the world."}
          </p>
          <p>
            {es
              ? "Lo que importa no es tanto qué hacen, sino qué señal mandan. Si bajan tipos, están diciendo: \"la economía se está enfriando, vamos a poner gasolina\". Los mercados lo celebran, el growth sube, las small caps se disparan. Si suben tipos, dicen: \"la inflación sigue aquí, hay que apretar\". El value aguanta, el growth sufre, el oro a veces se dispara."
              : "What matters isn\u2019t so much what they do — it\u2019s the signal they send. A rate cut says: \u201Cthe economy is cooling, let\u2019s pour some fuel in.\u201D Markets celebrate, growth rallies, small caps explode. A rate hike says: \u201Cinflation is still here, we need to tighten.\u201D Value holds up, growth suffers, gold often catches a bid."}
          </p>
          <p>
            {es
              ? "Si quieres tener una estrategia defensiva, fundamental — más de calidad, más enfocada en generar caja — la próxima reunión te dará pistas de si el mercado se va a mover en tu favor. Si quieres ser más agresivo en growth, estarás buscando la señal de pivote hacia bajadas. El calendario de FOMC debería estar en tu agenda. En serio."
              : "If you want a defensive, fundamentals-led strategy — quality, cash-generative businesses — the next meeting will tell you whether the market is about to move in your favour. If you\u2019re leaning into growth, you\u2019re watching for a pivot to cuts. The FOMC calendar should live in your diary. I mean it."}
          </p>

          <div className="bg-blue-600/10 border border-blue-700/30 rounded-xl p-6 my-8">
            <p className="text-blue-300 text-sm font-semibold mb-2">
              {es ? "Regla rápida de bolsillo" : "Quick pocket rule"}
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              {es
                ? "Tipos subiendo → tira al value, a la calidad, a la caja. Tipos bajando → deja respirar al growth. Tipos parados arriba → paciencia, el value gana por aburrimiento. Tipos parados abajo mucho tiempo → el growth se vuelve loco. No es más complicado que eso."
                : "Rates going up → tilt value, quality, cash-generating. Rates going down → give growth room to breathe. Rates stuck at the top → patience — value wins by boredom. Rates stuck at the bottom too long → growth goes wild. It\u2019s not more complicated than that."}
            </p>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Bitcoin: el activo especulativo" : "Bitcoin: the speculative asset"}
          </h2>
          <p>
            {es
              ? "Tenemos que hablar de Bitcoin, porque ignorarlo ya no es una opción. Pero vamos a ser honestos: Bitcoin no es value. Bitcoin no es growth. Bitcoin es, hoy por hoy, especulación pura. Y eso no lo digo como insulto — digo exactamente lo que significa."
              : "We have to talk about Bitcoin, because ignoring it isn\u2019t really an option anymore. But let\u2019s be honest: Bitcoin is not value. Bitcoin is not growth. Bitcoin is, right now, pure speculation. I don\u2019t say that as an insult — I mean exactly what the word means."}
          </p>
          <p>
            {es
              ? "Bitcoin no genera caja. No paga dividendos. No tiene beneficios que descontar. No hay un CEO haciendo cálculos de capex. Su valor depende, entera y exclusivamente, de que haya más gente mañana queriendo comprarlo que hoy. Eso es la definición literal de especulación, no es una opinión."
              : "Bitcoin produces no cash. It pays no dividend. It has no earnings to discount. There is no CEO running capex models. Its value depends, wholly and exclusively, on there being more people who want to buy it tomorrow than today. That is the literal definition of speculation — it\u2019s not an opinion."}
          </p>
          <p>
            {es
              ? "Ahora bien, eso no significa que no tenga sitio en una cartera. Lo especulativo también tiene su papel: en pequeñas dosis, puede dar retornos asimétricos brutales. Pero el tamaño importa. Nunca — y quiero que esto quede grabado — nunca pongas en Bitcoin lo que no puedas permitirte ver caer un 70% en tres meses. Porque ha pasado. Y volverá a pasar."
              : "That doesn\u2019t mean it has no place in a portfolio. Speculative assets have a role: in small doses, they can deliver brutally asymmetric returns. But size matters. Never — and I want this tattooed somewhere — never put anything into Bitcoin that you can\u2019t stomach watching drop 70% in three months. Because it has happened. And it will happen again."}
          </p>
          <p>
            {es
              ? "Curiosamente, Bitcoin se comporta como growth con esteroides: cuando los tipos suben, cae mucho más que el Nasdaq. Cuando los tipos bajan, sube mucho más. No es un valor refugio, es lo contrario: es apalancamiento emocional sobre la política monetaria."
              : "Interestingly, Bitcoin behaves like growth on steroids: when rates rise, it falls further than the Nasdaq. When rates fall, it rallies harder. It\u2019s not a safe haven. It\u2019s the opposite — it\u2019s emotional leverage on monetary policy."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Oro: el activo permanente" : "Gold: the permanent asset"}
          </h2>
          <p>
            {es
              ? "El oro es lo contrario de Bitcoin en casi todo. Lleva cinco mil años siendo dinero. Ha sobrevivido a imperios, guerras mundiales, colapsos de divisas, revoluciones. Y sigue ahí, en la misma caja fuerte, pesando lo mismo, brillando lo mismo."
              : "Gold is the opposite of Bitcoin in almost every way. It has been money for five thousand years. It has survived empires, world wars, currency collapses, revolutions. And it\u2019s still there, in the same vault, weighing the same, shining the same."}
          </p>
          <p>
            {es
              ? "El oro tampoco genera caja. Tampoco paga dividendos. Pero no es especulación — es otra cosa. Es un seguro. Un seguro contra la locura de los gobiernos, contra la inflación, contra el colapso de la confianza en las monedas fiduciarias. No se compra oro esperando ganar dinero — se compra oro esperando no perderlo cuando todo lo demás se vaya al garete."
              : "Gold doesn\u2019t produce cash either. It doesn\u2019t pay a dividend. But it\u2019s not speculation — it\u2019s something else. It\u2019s insurance. Insurance against government lunacy, against inflation, against a collapse of trust in fiat money. You don\u2019t buy gold hoping to get rich — you buy it hoping to not get poor when everything else goes sideways."}
          </p>
          <p>
            {es
              ? "Una asignación clásica a oro está entre el 5% y el 10% de la cartera. No mucho más, porque en entornos normales rinde poco. No menos, porque cuando toca, toca fuerte: en los años 70 el oro multiplicó por 20 mientras las bolsas se estancaban. En 2008, en 2020, en 2024 — cada vez que la gente ha dudado del sistema, el oro ha subido."
              : "A classic allocation to gold is between 5% and 10% of a portfolio. Not much more, because in normal environments it underperforms equities. Not much less, because when it does its job, it really does it: in the 1970s gold 20x\u2019d while equities went nowhere. In 2008, in 2020, in 2024 — every time people have doubted the system, gold has rallied."}
          </p>
          <p>
            {es
              ? "Y algo importante: cuando la Fed baja tipos mucho y rápido, el oro suele subir. Porque tipos bajos = dólares más débiles = más caros los activos reales. No falla casi nunca. Por eso, otro ojo en la próxima reunión del FOMC si tienes oro en cartera."
              : "And one important detail: when the Fed cuts hard and fast, gold tends to rally. Because low rates mean a weaker dollar, and a weaker dollar means real assets re-price higher. It barely ever fails. Another reason to watch the next FOMC if you\u2019re holding gold."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Factor investing: no elijas un bando, elige varios" : "Factor investing: don\u2019t pick a side, pick several"}
          </h2>
          <p>
            {es
              ? "Si después de leer todo esto te da pereza tener que adivinar si toca value o growth, tranquilo — hay una tercera vía, y es probablemente la más sensata de todas. Se llama factor investing, y básicamente es lo que llevan haciendo los académicos y los fondos cuantitativos desde los años noventa."
              : "If after reading all that you\u2019re tired of having to guess whether it\u2019s value\u2019s turn or growth\u2019s turn, there\u2019s a third path — and it\u2019s probably the most sensible of the lot. It\u2019s called factor investing, and it\u2019s what academics and quant funds have been doing since the nineties."}
          </p>
          <p>
            {es
              ? "La idea es simple: en lugar de apostar \"todo al value\" o \"todo al growth\", reconoces que las rentabilidades del mercado se pueden descomponer en varios factores que, históricamente, dan dinero a largo plazo. Los más conocidos son cinco:"
              : "The idea is simple: instead of betting \u201Call-in on value\u201D or \u201Call-in on growth,\u201D you accept that market returns can be decomposed into several factors that, historically, pay over the long run. The five best-known are:"}
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Value</strong> — {es
                ? "empresas baratas en múltiplos (PER bajo, P/B bajo). El factor clásico de Graham y Buffett."
                : "cheap multiples (low P/E, low P/B). The classic Graham-and-Buffett factor."}
            </li>
            <li>
              <strong>{es ? "Tamaño (Size)" : "Size"}</strong> — {es
                ? "empresas pequeñas. Históricamente baten a las grandes, aunque con más volatilidad."
                : "small companies. Historically beat large caps, though with more volatility."}
            </li>
            <li>
              <strong>Momentum</strong> — {es
                ? "lo que ha subido los últimos 12 meses tiende a seguir subiendo un poco más. Suena absurdo pero lleva funcionando desde hace cien años."
                : "whatever has gone up over the last 12 months tends to keep going up a bit longer. Sounds absurd but it\u2019s worked for a century."}
            </li>
            <li>
              <strong>{es ? "Calidad (Quality)" : "Quality"}</strong> — {es
                ? "empresas con alto ROE, poca deuda y beneficios estables. El \"aburrido pero fiable\"."
                : "high ROE, low debt, stable earnings. The \u201Cboring but reliable\u201D factor."}
            </li>
            <li>
              <strong>{es ? "Baja volatilidad" : "Low volatility"}</strong> — {es
                ? "las acciones menos movidas rinden casi igual con la mitad del susto. La anomalía más rara del mundo académico."
                : "the least jittery stocks deliver similar returns with half the drama. The weirdest anomaly in the academic literature."}
            </li>
          </ul>
          <p>
            {es
              ? "Lo interesante es que estos factores no suelen estar correlacionados entre sí. Cuando el value sufre, el momentum suele ir bien. Cuando el growth revienta, la calidad aguanta. Combinando cuatro o cinco factores con pesos equilibrados consigues una cartera que no depende tanto de qué decida la Fed la semana que viene."
              : "What\u2019s interesting is that these factors are mostly uncorrelated with each other. When value struggles, momentum tends to work. When growth blows up, quality holds up. Combining four or five factors with balanced weights gets you a portfolio that doesn\u2019t live or die by the next Fed meeting."}
          </p>
          <p>
            {es
              ? "Hoy en día puedes hacer esto con ETFs. iShares, Vanguard, WisdomTree y otros ofrecen ETFs de factor único (MTUM para momentum, QUAL para calidad, USMV para baja volatilidad, etc.) o multifactoriales (GSLC, LRGF, etc.) que te montan el cóctel por ti. Ni siquiera tienes que elegir acciones individuales."
              : "Today you can do this with ETFs. iShares, Vanguard, WisdomTree and others offer single-factor ETFs (MTUM for momentum, QUAL for quality, USMV for low-vol, etc.) or multifactor ETFs (GSLC, LRGF, etc.) that build the cocktail for you. You don\u2019t even have to pick individual stocks."}
          </p>
          <p>
            {es
              ? "¿Es perfecto? No. Los factores también pasan rachas malas — el value estuvo plano de 2000 a 2020, el size ha decepcionado durante años. Pero el conjunto, a largo plazo, tiende a rendir más que el índice y con una volatilidad similar o menor. Si existe algo parecido a \"comer gratis\" en los mercados, es esto."
              : "Is it perfect? No. Factors also go through rough patches — value was flat from 2000 to 2020, size disappointed for years. But the bundle, over the long run, tends to outperform the index at similar or lower volatility. If there\u2019s anything close to a free lunch in markets, this is it."}
          </p>
          <p>
            {es
              ? "Y lo mejor: te quita la carga de tener que adivinar. El factor investing no te pide que sepas si toca value o growth. Te pide que diversifiques los motores de rentabilidad y dejes que la estadística haga el resto."
              : "And the best part: it takes the guessing off your shoulders. Factor investing doesn\u2019t ask you to know whether it\u2019s value\u2019s turn or growth\u2019s turn. It asks you to diversify your return engines and let the statistics do the rest."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Entonces, ¿qué hago con mi dinero?" : "So what do I do with my money?"}
          </h2>
          <p>
            {es
              ? "Mira, no puedo decirte qué hacer — no sé tu situación, no soy tu asesor y este no es un artículo de asesoramiento. Pero sí puedo resumirte la lección de un siglo en cuatro puntos:"
              : "Look, I can\u2019t tell you what to do — I don\u2019t know your situation, I\u2019m not your adviser and this isn\u2019t advice. But I can compress a century\u2019s lesson into four points:"}
          </p>

          <ol className="list-decimal pl-6 space-y-3">
            <li>
              <strong>{es ? "Diversifica en estilos y factores, no solo en valores." : "Diversify across styles and factors, not just across stocks."}</strong>
              {es
                ? " Ten value, growth, calidad, momentum, baja volatilidad. Si no quieres adivinar el ciclo de tipos, monta una cartera multifactorial con ETFs y deja que el equilibrio haga su trabajo."
                : " Own value, growth, quality, momentum, low-vol. If you don\u2019t want to guess the rate cycle, build a multifactor portfolio with ETFs and let the balance do its work."}
            </li>
            <li>
              <strong>{es ? "Mira a la Fed, no a los titulares." : "Watch the Fed, not the headlines."}</strong>
              {es
                ? " El FOMC te da más información sobre el futuro de tu cartera que cualquier analista de televisión."
                : " The FOMC tells you more about the future of your portfolio than any TV pundit ever will."}
            </li>
            <li>
              <strong>{es ? "Trata a Bitcoin como lo que es: especulación." : "Treat Bitcoin as what it is: speculation."}</strong>
              {es
                ? " Pequeño peso, nunca esencial, siempre dinero que puedes perder entero."
                : " Small size, never essential, always money you can afford to lose entirely."}
            </li>
            <li>
              <strong>{es ? "Ten algo de oro. Siempre." : "Own some gold. Always."}</strong>
              {es
                ? " Es el único activo que ha sobrevivido a todo. Un 5-10% duerme mejor."
                : " It\u2019s the one asset that has survived everything. A 5–10% sleeve lets you sleep better."}
            </li>
          </ol>

          <p>
            {es
              ? "Los ciclos duran décadas. Value reinó ochenta años, growth veinte, y ahora el péndulo está volviendo. Lo que no cambia nunca es que los tipos de interés, la disciplina de los bancos centrales y la naturaleza humana rigen el juego. Lo demás son fotos instantáneas de una película mucho más larga."
              : "Cycles last decades. Value ruled for eighty years, growth for twenty, and the pendulum is swinging back. What never changes is that interest rates, central-bank discipline and human nature run the whole show. Everything else is a still photo from a much longer film."}
          </p>

          <p>
            {es
              ? "Ah, y no te olvides del próximo FOMC. Te juego lo que quieras a que ese día mueve más tu cartera que cualquier cosa que hagas tú."
              : "Oh — and don\u2019t forget the next FOMC. I\u2019ll bet anything that day moves your portfolio more than any decision you make yourself."}
          </p>
        </div>

        <div className="mt-14 bg-[#0d1426] border border-blue-700/40 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">
            {es ? "Analiza tu cartera gratis — sin registro" : "Analyse your portfolio free — no signup"}
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            {es
              ? "Introduce tus posiciones y mira la rentabilidad, volatilidad, Sharpe y asignación al instante. Value, growth, oro, Bitcoin — todo junto."
              : "Drop in your holdings and see return, volatility, Sharpe and allocation instantly. Value, growth, gold, Bitcoin — all in one view."}
          </p>
          <Link href="/tools/portfolio-analysis" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition inline-block">
            {es ? "Abrir análisis de cartera" : "Open portfolio analysis"}
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
