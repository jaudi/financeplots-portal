import Link from "next/link";
import type { Metadata } from "next";
import BlogArticleShell from "@/components/BlogArticleShell";

export const metadata: Metadata = {
  title: "The 10-Year, the Equity Risk Premium and a World Drowning in Debt | FinancePlots",
  description:
    "The US 10-year Treasury anchors every asset price on the planet. With developed-world debt at post-war highs and the equity risk premium near zero, the foundation of finance is moving — and most portfolios haven't noticed.",
  alternates: { canonical: "https://www.financeplots.com/blog/us-10y-yield-equity-risk-premium" },
  openGraph: {
    title: "The 10-Year, the Equity Risk Premium and a World Drowning in Debt",
    description:
      "The US 10-year Treasury anchors every asset price on the planet. With developed-world debt at post-war highs and the equity risk premium near zero, the foundation of finance is moving — and most portfolios haven't noticed.",
    url: "https://www.financeplots.com/blog/us-10y-yield-equity-risk-premium",
    siteName: "FinancePlots",
    type: "article",
    images: [{ url: "https://www.financeplots.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The 10-Year, the Equity Risk Premium and a World Drowning in Debt",
    description:
      "The US 10-year Treasury anchors every asset price on the planet. With developed-world debt at post-war highs and the equity risk premium near zero, the foundation of finance is moving — and most portfolios haven't noticed.",
    images: ["https://www.financeplots.com/og-image.png"],
  },
};

type Props = { params: Promise<{ locale: string }> };

export default async function USTenYearEquityRiskPremium({ params }: Props) {
  const { locale } = await params;
  const es = locale === "es";

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: "{\"@context\":\"https://schema.org\",\"@type\":\"Article\",\"headline\":\"The 10-Year, the Equity Risk Premium and a World Drowning in Debt\",\"description\":\"The US 10-year Treasury anchors every asset price on the planet. With developed-world debt at post-war highs and the equity risk premium near zero, the foundation of finance is moving — and most portfolios haven't noticed.\",\"url\":\"https://www.financeplots.com/blog/us-10y-yield-equity-risk-premium\",\"image\":\"https://www.financeplots.com/og-image.png\",\"author\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\"},\"publisher\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\",\"logo\":{\"@type\":\"ImageObject\",\"url\":\"https://www.financeplots.com/logo-sm.png\"}},\"mainEntityOfPage\":{\"@type\":\"WebPage\",\"@id\":\"https://www.financeplots.com/blog/us-10y-yield-equity-risk-premium\"}}" }} />
      <BlogArticleShell>

        <Link href="/blog" className="text-blue-400 text-sm hover:text-blue-300 transition mb-8 inline-block">
          {es ? "← Volver al Blog" : "← Back to Blog"}
        </Link>

        <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
          {es ? "Opinión" : "Opinion"}
        </span>
        <h1 className="text-4xl font-bold mt-2 mb-3 leading-tight">
          {es
            ? "El 10 años americano, la prima de riesgo y un mundo ahogado en deuda"
            : "The 10-Year, the Equity Risk Premium and a World Drowning in Debt"}
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          {es ? "Mayo 2026 · 11 min de lectura · Por Javier Audibert" : "May 2026 · 11 min read · By Javier Audibert"}
        </p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">

          <p>
            {es
              ? "Toda la teoría financiera moderna se sostiene sobre una sola idea: que existe un activo sin riesgo. Una rentabilidad mínima, segura, garantizada, que sirve de cimiento sobre el que se calculan todas las demás. El bono del Tesoro americano a 10 años. El famoso 10Y. El \"risk-free rate\". El número que aparece, abierta o disimuladamente, en cada DCF, cada modelo CAPM, cada hoja de Excel de banca de inversión del planeta."
              : "All of modern finance rests on a single idea: that there exists a riskless asset. A minimum, certain, guaranteed return that serves as the floor upon which everything else is priced. The 10-year US Treasury. The famous 10Y. The “risk-free rate.” The number that shows up, openly or quietly, in every DCF, every CAPM model, every investment-banking spreadsheet on the planet."}
          </p>

          <p>
            {es
              ? "Y aquí está el problema de 2026: ese cimiento se está moviendo. No porque la gente haya dejado de creer en el dólar, ni porque Estados Unidos vaya a quebrar mañana — nada tan dramático. Se está moviendo porque las matemáticas de la deuda en los países desarrollados se han puesto, por primera vez desde los años 40, francamente incómodas. Y eso lo cambia todo: lo que vale el S&P, lo que vale tu casa, lo que vale el oro, y muy especialmente, lo que cuesta financiar absolutamente cualquier cosa."
              : "And here’s the 2026 problem: that floor is moving. Not because people have stopped trusting the dollar, nor because the United States is about to default tomorrow — nothing that dramatic. It’s moving because the debt arithmetic in the developed world has, for the first time since the 1940s, become genuinely uncomfortable. And that changes everything: what the S&P is worth, what your house is worth, what gold is worth, and most of all, what it costs to finance literally anything."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Primero, lo aburrido: qué es la tasa libre de riesgo" : "First, the boring bit: what the risk-free rate actually is"}
          </h2>
          <p>
            {es
              ? "El concepto es sencillo. Si te puedo prestar dinero al gobierno de Estados Unidos y recibirlo de vuelta con seguridad — porque el gobierno de Estados Unidos imprime su propia moneda y nunca, nunca ha dejado de pagar — la rentabilidad que me ofrece ese bono es lo mínimo que cualquier otra inversión debería compensarme. Si una empresa quiere mi dinero, tiene que ofrecerme más que el 10Y. Si una vivienda quiere mi capital, tiene que rentar más, neto, que el 10Y. Si una acción quiere mi confianza, tiene que prometer rendimientos por encima del 10Y, en exceso suficiente para compensar el riesgo de que se caiga un 40%."
              : "The concept is simple. If I can lend money to the US government and get it back with certainty — because the US government prints its own currency and has never, ever defaulted — then the yield on that bond is the minimum that any other investment must beat. If a company wants my money, it has to offer more than the 10Y. If a house wants my capital, it has to net out above the 10Y. If a stock wants my conviction, it has to promise returns above the 10Y, with enough excess to compensate for the risk of dropping 40%."}
          </p>
          <p>
            {es
              ? "El 10Y es, literalmente, la línea base. El cero al que se le suman los riesgos. Y por eso cuando sube, el suelo de todo lo demás también sube — y cuando sube mucho, los activos de riesgo tienen que reajustarse hacia abajo para seguir siendo competitivos. Esto no es una opinión. Es aritmética."
              : "The 10Y is, literally, the baseline. The zero on top of which every risk premium is added. Which is why, when it rises, the floor under everything else rises too — and when it rises sharply, risk assets have to re-price downward to stay competitive. This isn’t opinion. It’s arithmetic."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Dónde está hoy: la nueva normalidad del 4-5%" : "Where it sits today: the new 4–5% normal"}
          </h2>
          <p>
            {es
              ? "Durante trece años — desde 2009 hasta 2022 — el 10Y vivió en un coma inducido entre el 1.5% y el 3%. La Fed lo mantenía bajo a la fuerza con QE, comprando bonos a saco. Era el mundo del dinero gratis. Cualquier cosa rendía más que el bono, así que cualquier cosa subía. Inmuebles, acciones, criptomonedas, NFTs de monos pixelados — todo. La marea estaba alta y todos los barcos flotaban."
              : "For thirteen years — from 2009 to 2022 — the 10Y lived in an induced coma between roughly 1.5% and 3%. The Fed pinned it down with QE, hoovering up bonds by the truckload. That was the era of free money. Anything yielded more than the bond, so anything went up. Property, equities, crypto, pixelated-monkey NFTs — everything. The tide was high, and every boat floated."}
          </p>
          <p>
            {es
              ? "Desde 2023, el 10Y se ha estabilizado en una banda muy distinta: entre el 4% y el 5%. Mayo de 2026 nos encuentra cerca de 4.3-4.5% — bajado un poco desde los picos de 2024, pero bastante por encima de la \"normalidad\" que la generación de inversores millennials y zoomers ha conocido toda su vida adulta. Para alguien que empezó a invertir en 2010, este 10Y se siente alto. Para alguien que empezó en 1985, se siente normal — incluso bajo. Es un recordatorio de que la \"normalidad\" depende mucho de cuándo abriste los ojos."
              : "Since 2023, the 10Y has settled into a very different band: between 4% and 5%. May 2026 finds us near 4.3–4.5% — down a touch from the 2024 highs, but well above the “normal” that the entire millennial-and-Gen-Z investor generation has known their adult lives. To someone who started investing in 2010, this 10Y feels high. To someone who started in 1985, it feels normal — even low. It’s a reminder that “normal” depends a lot on when you opened your eyes."}
          </p>
          <p>
            {es
              ? "Y aquí viene lo interesante: este nivel del 4-5% probablemente no es transitorio. No es \"la Fed bajará y todo volverá al 1.5%\". Hay una razón estructural por la que el 10Y se está quedando arriba, y se llama deuda."
              : "And here’s the interesting bit: this 4–5% level is probably not transitory. It’s not “the Fed will cut and we’ll all go back to 1.5%.” There’s a structural reason the 10Y is staying high, and it’s called debt."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "El elefante en la habitación: la montaña de deuda" : "The elephant in the room: the debt mountain"}
          </h2>
          <p>
            {es
              ? "Algunos números, sin adornos, para que veas lo que tenemos enfrente. Deuda pública / PIB en las grandes economías desarrolladas, 2026 (aproximado):"
              : "Some numbers, plain, so you can see what we’re actually looking at. Public debt-to-GDP across the major developed economies, 2026 (approximate):"}
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{es ? "Japón: ~250%" : "Japan: ~250%"}</li>
            <li>{es ? "Italia: ~140%" : "Italy: ~140%"}</li>
            <li>{es ? "Estados Unidos: ~125% (y subiendo)" : "United States: ~125% (and rising)"}</li>
            <li>{es ? "Francia: ~115%" : "France: ~115%"}</li>
            <li>{es ? "Reino Unido: ~100%" : "United Kingdom: ~100%"}</li>
            <li>{es ? "España: ~105%" : "Spain: ~105%"}</li>
            <li>{es ? "Alemania: ~65% (la disciplinada de la clase, hasta hace poco)" : "Germany: ~65% (the disciplined one in class, until recently)"}</li>
          </ul>
          <p>
            {es
              ? "Para que te hagas una idea, en el año 2000 Estados Unidos tenía una deuda / PIB del 55%. Reino Unido del 35%. Es decir, en veinticinco años hemos doblado, triplicado, o más, el peso de la deuda en relación con la economía. Y lo hemos hecho mientras los tipos estaban bajísimos — lo que disimulaba el coste."
              : "For perspective, in the year 2000 the United States was at 55% debt-to-GDP. The UK was at 35%. So in twenty-five years we’ve doubled, tripled, or more, the size of public debt relative to GDP. And we did it while rates were rock-bottom — which masked the cost."}
          </p>
          <p>
            {es
              ? "Pero ahora los tipos no están bajísimos. Y la factura ha empezado a llegar. En 2026, el gasto en intereses del Tesoro americano supera el presupuesto de defensa. Léelo otra vez. Estados Unidos paga más por refinanciar su deuda que por mantener el ejército más grande del planeta. En Reino Unido, los intereses de la deuda son la tercera mayor partida del presupuesto, por delante de educación. En Italia, son una de las mayores partidas, comparable al gasto en sanidad. Esto no es un detalle técnico — es la realidad fiscal del mundo desarrollado, ahora mismo."
              : "But now rates aren’t rock-bottom. And the bill has started to arrive. In 2026, US Treasury interest expense exceeds the defence budget. Read that again. The United States pays more to refinance its debt than to run the largest military on Earth. In the UK, debt interest is the third largest budget line, ahead of education. In Italy, it’s one of the largest line items, on a par with healthcare. This isn’t a technical detail — it’s the fiscal reality of the developed world, right now."}
          </p>
          <p>
            {es
              ? "¿Y cómo afecta esto al 10Y? Muy directo: el Tesoro americano tiene que emitir billones de dólares cada año para refinanciar deuda vieja y financiar déficits nuevos (~6% del PIB). Esa oferta gigantesca de bonos presiona el precio hacia abajo, y por tanto los rendimientos hacia arriba. Cuando hay mucho papel y poco apetito, hay que pagar más para colocarlo. Es el mercado más antiguo del mundo y funciona como cualquier otro."
              : "How does this feed into the 10Y? Very directly: the US Treasury has to issue trillions of dollars every year to roll old debt and fund new deficits (around 6% of GDP). That gigantic bond supply pushes prices down and yields up. When there’s plenty of paper and limited appetite, you pay up to place it. It’s the oldest market on Earth and it works like any other."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "El \"sin riesgo\" ya no es del todo sin riesgo" : "“Risk-free” isn’t quite risk-free anymore"}
          </h2>
          <p>
            {es
              ? "Aquí viene la herejía intelectual del momento: el bono del Tesoro a 10 años nominalmente sigue siendo \"libre de riesgo\" — el gobierno te devolverá tus dólares al vencimiento, eso no se discute. Pero hay tres riesgos que el modelo CAPM original simplemente ignora, y que en 2026 ya no se pueden ignorar."
              : "Here’s the intellectual heresy of the moment: the 10-year Treasury is still nominally “risk-free” — the government will give you your dollars back at maturity, no debate there. But there are three risks the original CAPM model simply ignored, and that in 2026 you really can’t ignore anymore."}
          </p>
          <p>
            {es
              ? "Primero, riesgo de duración. Si compras un 10Y al 4.3% y los tipos suben al 5.5%, ese bono cae un 8-10%. Tu dinero \"seguro\" perdió un 10% en mark-to-market. Lo recuperas si lo aguantas a vencimiento, sí, pero pierdes oportunidad y poder adquisitivo durante diez años. Eso pasó en 2022 — el peor año para los bonos en cuarenta. \"Sin riesgo\" en el cupón no es \"sin riesgo\" en el precio."
              : "First, duration risk. Buy a 10Y at 4.3% and watch yields rise to 5.5% — that bond drops 8-10%. Your “safe” money lost 10% in mark-to-market. You get it back if you hold to maturity, fine, but you lose opportunity and purchasing power for a decade. That happened in 2022 — the worst year for bonds in forty. “Risk-free” on the coupon is not “risk-free” on the price."}
          </p>
          <p>
            {es
              ? "Segundo, riesgo de inflación. Los bonos pagan en dólares nominales. Si la inflación se come ese 4.3% — y entre 2021 y 2023 hubo años con CPI al 7-9% — tu rentabilidad real fue negativa. Mucho. \"Te devuelvo tu dinero\" es muy distinto de \"te devuelvo tu poder adquisitivo\"."
              : "Second, inflation risk. Bonds pay in nominal dollars. If inflation eats that 4.3% — and between 2021 and 2023 we had years with CPI running 7-9% — your real return was deeply negative. “You’ll get your dollars back” and “you’ll get your purchasing power back” are two very different statements."}
          </p>
          <p>
            {es
              ? "Y tercero, el más nuevo y más incómodo: riesgo de represión financiera. Cuando un gobierno tiene tanta deuda que no puede permitirse pagar tipos altos durante demasiado tiempo, empieza a buscar formas creativas de mantener los rendimientos artificialmente bajos. Limita la salida de capital, obliga a fondos de pensiones a comprar deuda nacional, hace QE \"sólo cuando es necesario\" (que casualmente es todo el rato). El bono sigue pagando, pero pagas tú la diferencia con menor rentabilidad real. Japón lleva treinta años haciendo esto. Europa lo lleva haciendo quince. Estados Unidos lo está empezando a coquetear."
              : "And third, the newest and most uncomfortable: financial repression risk. When a government has so much debt it can’t afford to pay high rates for too long, it starts finding creative ways to keep yields artificially low. Capital controls. Forcing pension funds and banks to hold domestic bonds. Doing QE “only when needed” (which conveniently turns out to be most of the time). The bond still pays, but you cover the difference with lower real returns. Japan has been doing this for thirty years. Europe for fifteen. The US is starting to flirt with it."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "La prima de riesgo: el oxígeno de la bolsa" : "The equity risk premium: the oxygen of the stock market"}
          </h2>
          <p>
            {es
              ? "Aquí entra la otra protagonista del artículo: la Equity Risk Premium (ERP). En castellano, prima de riesgo de la renta variable. Y conceptualmente es el corazón de por qué la gente compra acciones."
              : "Enter the other star of this piece: the Equity Risk Premium (ERP). In Spanish, prima de riesgo de la renta variable. Conceptually, it’s the heart of why anyone buys stocks at all."}
          </p>
          <p>
            {es
              ? "La ERP es, sencillamente, lo que esperas ganar invirtiendo en bolsa por encima del activo libre de riesgo. La fórmula básica: ERP = rentabilidad esperada de las acciones − tasa libre de riesgo. Si el 10Y está al 4.3% y crees que el S&P te dará un 8% nominal a largo plazo, tu ERP es 3.7%. Esa es la \"propina\" que el mercado te paga por aguantar volatilidad, recesiones, y la posibilidad de pasar diez años en negativo si entras en mal momento."
              : "The ERP is, plainly, the extra return you expect for owning stocks instead of the risk-free asset. The basic formula: ERP = expected stock return − risk-free rate. If the 10Y is at 4.3% and you think the S&P will deliver 8% nominal long-term, your ERP is 3.7%. That’s the “tip” the market pays you for stomaching volatility, recessions, and the possibility of spending ten years underwater if you enter at the wrong time."}
          </p>
          <p>
            {es
              ? "Históricamente, la ERP de Estados Unidos ha sido entre 4% y 6% según el periodo y el método de cálculo (Damodaran lleva publicándola desde hace décadas). En los años 70, con tipos altísimos, la ERP llegó a ser negativa puntualmente — los bonos rendían tanto que las acciones no compensaban. En 2000, en el pico tecnológico, la ERP también se quedó muy bajita. Y en 2009, en el suelo de la crisis, fue altísima — el mercado pagaba enormemente por aguantar el riesgo. La ERP no es una constante de la naturaleza. Sube y baja con el ciclo."
              : "Historically, the US ERP has run between 4% and 6%, depending on the period and the methodology (Damodaran has been publishing it for decades). In the 1970s, with sky-high rates, the ERP briefly went negative — bonds yielded so much that stocks didn’t compensate. In 2000, at the dot-com peak, the ERP also dropped to very low levels. And in 2009, at the bottom of the crisis, it was huge — the market was paying enormously for anyone willing to take risk. The ERP isn’t a constant of nature. It rises and falls with the cycle."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Donde está la ERP en mayo de 2026: francamente preocupante" : "Where the ERP sits in May 2026: frankly worrying"}
          </h2>
          <p>
            {es
              ? "Hagamos los números a mano, que es la mejor manera. El S&P 500 cotiza, en mayo de 2026, a un PER forward de aproximadamente 22-23x. La inversa de eso es el earnings yield: 1/22.5 ≈ 4.4%. Es decir, las acciones del S&P están \"rindiendo\" un 4.4% en términos de beneficios sobre precio."
              : "Let’s do the maths by hand, the way I prefer. The S&P 500, in May 2026, trades at a forward P/E of roughly 22–23x. The inverse of that is the earnings yield: 1 / 22.5 ≈ 4.4%. So S&P stocks are “yielding” about 4.4% in earnings-on-price terms."}
          </p>
          <p>
            {es
              ? "El 10Y está en 4.3%. La ERP \"de servilleta\" — earnings yield menos 10Y — es de 0.1%. Diez puntos básicos. Eso es decir: literalmente nada. El S&P, según esta medida grosera pero útil, no te paga prácticamente nada extra por aguantar el riesgo de la bolsa."
              : "The 10Y sits at 4.3%. The “napkin” ERP — earnings yield minus 10Y — is 0.1%. Ten basis points. That means: literally nothing. The S&P, by this rough but useful measure, is paying you essentially zero extra to take equity risk."}
          </p>
          <p>
            {es
              ? "Hay que matizar: esta es la versión más simple de la ERP. Si en lugar de earnings yield usas un modelo más sofisticado con crecimiento esperado, recompras de acciones, etc., te puede salir una ERP entre 1% y 2.5%. Damodaran lleva publicando estimaciones de \"implied ERP\" desde hace años; en 2026 anda alrededor del 2-2.5%, dependiendo del mes. En cualquiera de las dos métricas — la simple o la sofisticada — la ERP de hoy está muy por debajo del promedio histórico de 4-5%."
              : "Caveat: that’s the crudest version of the ERP. If you use a more sophisticated model with expected growth, buybacks and so on, you can get a number between 1% and 2.5%. Damodaran has been publishing implied-ERP estimates for years; in 2026 it sits around 2–2.5%, depending on the month. Either way — simple or sophisticated — today’s ERP is well below the long-run average of 4–5%."}
          </p>
          <p>
            {es
              ? "Traduzcamos: el mercado te está pidiendo que asumas el riesgo de la bolsa por una propina. No por una propina pequeña — por una propina ridícula comparada con la historia. Y ese hecho, por sí solo, es la pieza más importante para entender el resto de los próximos años."
              : "Translation: the market is asking you to take equity risk for a tip. Not a small tip — a historically miserable tip. That fact alone is the single most important thing for understanding the next few years."}
          </p>

          <div className="bg-blue-600/10 border border-blue-700/30 rounded-xl p-6 my-8">
            <p className="text-blue-300 text-sm font-semibold mb-2">
              {es ? "La fórmula que cabe en una servilleta" : "The formula that fits on a napkin"}
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              {es
                ? "ERP ≈ Earnings Yield del S&P − 10Y americano. Mayo 2026: 4.4% − 4.3% ≈ 0.1%. Promedio histórico: 4-5%. Si quieres saber si la bolsa está cara o barata, esta resta vale más que cualquier titular de CNBC."
                : "ERP ≈ S&P Earnings Yield − US 10-Year. May 2026: 4.4% − 4.3% ≈ 0.1%. Long-run average: 4–5%. If you want to know whether stocks are cheap or expensive, this subtraction beats any headline on CNBC."}
            </p>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "¿Y por qué la gente sigue comprando acciones?" : "So why is anyone still buying stocks?"}
          </h2>
          <p>
            {es
              ? "Buena pregunta. Hay tres respuestas, ninguna de ellas tranquilizadora del todo."
              : "Good question. Three answers, none of them entirely reassuring."}
          </p>
          <p>
            {es
              ? "La primera: hábito. Toda una generación de gestores y particulares creció en la era ZIRP. Comprar acciones siempre, en cualquier dip, fue la lección de catorce años. Ese hábito no se rompe en una semana. Mucho dinero entra en el S&P por inercia, no por análisis."
              : "First: habit. An entire generation of managers and retail investors grew up in the ZIRP era. “Buy stocks, always, on any dip” was the lesson of fourteen years. That habit doesn’t break overnight. A lot of money still flows into the S&P out of inertia, not analysis."}
          </p>
          <p>
            {es
              ? "La segunda: la concentración del índice. El S&P 500 hoy es, en realidad, el S&P 7 — Apple, Microsoft, Nvidia, Alphabet, Amazon, Meta y unas pocas más representan más del 35% del índice. Estas empresas tienen márgenes brutales, balances con caja neta, y crecimiento real. Si las miras por separado, su \"calidad\" justifica múltiplos altos. El problema es que el resto del índice — las otras 493 — está pagando el precio de la fiesta de las primeras."
              : "Second: index concentration. Today’s S&P 500 is really the S&P 7 — Apple, Microsoft, Nvidia, Alphabet, Amazon, Meta and a couple of others now make up more than 35% of the index. These companies have brutal margins, net-cash balance sheets, and real growth. Looked at individually, their “quality” justifies high multiples. The problem is that the other 493 names are paying for the party that those few are throwing."}
          </p>
          <p>
            {es
              ? "La tercera: nadie tiene una alternativa cómoda. Los bonos rinden lo mismo que el earnings yield del S&P, pero sin crecimiento — solo cupón. El inmobiliario está caro y caro de financiar. El oro lleva cinco años subiendo (esa parte ya la cogiste, espero). El cash al 4-5% es atractivo pero pierde frente a la inflación. Cuando todo está caro, la gente se queda en lo que conoce. Y lo que conoce es \"S&P al alza\"."
              : "Third: no one has a comfortable alternative. Bonds yield the same as the S&P’s earnings yield, but without growth — just the coupon. Real estate is expensive and expensive to finance. Gold has been climbing for five years (you caught that one, I hope). Cash at 4–5% is attractive but still loses to inflation. When everything is expensive, people stay with what they know. And what they know is “S&P going up.”"}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Qué significa para los próximos años" : "What this means for the next few years"}
          </h2>
          <p>
            {es
              ? "Si aceptamos que (a) el 10Y se queda estructuralmente entre el 4% y el 5% por la deuda, (b) la ERP está cerca de cero, y (c) los gobiernos desarrollados no pueden — políticamente — recortar gasto ni subir mucho impuestos, entonces hay un puñado de consecuencias matemáticas, no opiniones."
              : "If we accept that (a) the 10Y stays structurally between 4% and 5% because of debt, (b) the ERP is near zero, and (c) developed-world governments cannot — politically — cut spending or raise taxes meaningfully, then there are a handful of mathematical consequences, not opinions."}
          </p>
          <p>
            {es
              ? "Uno: las rentabilidades futuras del S&P serán más bajas que las de los últimos quince años. No porque las empresas sean peores, sino porque entras a múltiplos altos con tipos altos. Goldman, JP Morgan, Vanguard y casi cualquier modelo de proyección serio tiene al S&P en 3-6% nominal anual durante la próxima década. Lejos del 13% al que estamos acostumbrados desde 2009."
              : "One: future S&P returns will be lower than the last fifteen years. Not because companies are worse, but because you’re entering at high multiples with high rates. Goldman, JP Morgan, Vanguard and almost every serious projection model now have the S&P at 3–6% nominal annual returns over the next decade. A long way from the 13% we’ve grown used to since 2009."}
          </p>
          <p>
            {es
              ? "Dos: los bonos largos, por primera vez en una década, son atractivos. Si compras un 10Y al 4.3% y los tipos bajan al 3.5% (escenario plausible si hay recesión), te llevas el cupón más una ganancia de capital cercana al 6-7%. Si suben al 5%, pierdes algo, pero te quedas con el cupón. Asimetría razonable. Por primera vez desde 2009, los bonos vuelven a ser una clase de activo seria, no \"el lugar donde aparcas el dinero esperando que lleguen oportunidades\"."
              : "Two: long bonds, for the first time in a decade, are attractive. Buy a 10Y at 4.3%, see yields drop to 3.5% (plausible in a recession), and you take the coupon plus a 6–7% capital gain. If yields rise to 5%, you take a knock but keep the coupon. Reasonable asymmetry. For the first time since 2009, bonds are a serious asset class again, not just “the place you park money while waiting for opportunities.”"}
          </p>
          <p>
            {es
              ? "Tres: el oro y los activos reales son seguros contra la represión financiera. Si los gobiernos terminan optando por la salida más fácil — inflación moderada y persistente para erosionar la deuda — el oro, los inmuebles bien financiados, y las commodities baratas se aprecian en términos reales. Esta es la jugada que llevan haciendo bancos centrales del mundo emergente desde 2022, comprando oro a un ritmo récord. Ellos saben algo que tu cartera tradicional 60/40 todavía no quiere oír."
              : "Three: gold and real assets are insurance against financial repression. If governments end up taking the easiest path — moderate persistent inflation to erode the debt — then gold, well-financed real estate, and cheap commodities appreciate in real terms. This is the move emerging-market central banks have been making since 2022, buying gold at record pace. They know something the traditional 60/40 portfolio still doesn’t want to hear."}
          </p>
          <p>
            {es
              ? "Cuatro: la calidad importa más que nunca. En un entorno con ERP cero, el promedio del mercado está caro y mal pagado. Pero hay empresas que generan retornos sobre capital del 25-30%, con balances limpios, con poca deuda, con flujo de caja real, y a múltiplos razonables. Esas siguen funcionando. La era del beta gratis se acabó; vuelve la era del stock-picking."
              : "Four: quality matters more than ever. In a zero-ERP environment, the market average is expensive and poorly paid. But there are companies generating 25–30% returns on capital, with clean balance sheets, low debt, real free cash flow, at reasonable multiples. Those still work. The era of free beta is over; the era of stock-picking is back."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Por qué el value contrarian es el único juego que queda" : "Why contrarian value is the only game left in town"}
          </h2>
          <p>
            {es
              ? "Llegados a este punto, todo lo anterior apunta a una sola conclusión incómoda: cuando el mercado medio no paga prima por el riesgo, la única forma racional de esperar una rentabilidad real es no estar donde está el mercado medio. Punto. Eso es, sin adornos, contrarian value investing."
              : "Everything above points to a single uncomfortable conclusion: when the market average pays no premium for risk, the only rational way to expect a real return is to not be where the market average is. Full stop. That, without dressing it up, is contrarian value investing."}
          </p>
          <p>
            {es
              ? "Y no me refiero a \"value\" en versión escaparate — comprar un ETF de value tipo IWD o VTV y dormir tranquilo. Eso es value diluido, value para la masa, value que ya está descontado en el precio. El value contrarian de verdad es otro animal: pagar 60 céntimos por un dólar de beneficios que la manada ha decidido que no vale un dólar. Es comprar bancos europeos a 6 veces beneficios mientras todos hablan de IA. Es coger una petrolera a 7 veces flujo de caja porque \"el petróleo se acaba\". Es comprar small caps japonesas que cotizan por debajo de su caja neta. Cosas que dan vergüenza enseñar en una cena."
              : "And I don’t mean “value” in its showroom version — buying an IWD or VTV ETF and sleeping easy. That’s diluted value, value for the masses, value that’s already priced in. Real contrarian value is another animal: paying 60 cents for a dollar of earnings the herd has decided isn’t worth a dollar. It’s owning European banks at 6x earnings while everyone talks about AI. It’s picking up an oil major at 7x cash flow because “oil is finished.” It’s buying Japanese small caps trading below net cash. Stocks you’re embarrassed to mention at dinner."}
          </p>
          <p>
            {es
              ? "Las matemáticas obligan a esto, no es una postura ideológica. Indexar en un mundo de ERP cero te da 4-5% nominal con 16% de volatilidad. Es decir: rentabilidad de bono con riesgo de bolsa. Eso no es invertir, eso es alquilar ansiedad. Y desde 2009 hasta 2021, la masa hizo bien indexando porque la valoración de partida era razonable y los tipos colaboraban. Desde 2026, esa misma estrategia parte del peor punto de entrada en cuarenta años. La aritmética no perdona."
              : "The maths forces this, it’s not an ideological stance. Indexing in a zero-ERP world gives you 4-5% nominal at 16% volatility. Which is: bond returns with equity risk. That’s not investing — that’s renting anxiety. From 2009 to 2021, the masses did well indexing because the starting valuation was reasonable and rates cooperated. From 2026, that same strategy starts from the worst entry point in forty years. The arithmetic doesn’t forgive."}
          </p>
          <p>
            {es
              ? "El otro dato lo dimos antes: 7 acciones son el 35% del S&P. Eso significa que las otras 493, por pura matemática, están infra-asignadas. Hay capital que ha huido de ellas hacia los Magnificent Seven, y donde el capital escasea, los precios bajan más de lo que justifican los fundamentales. Ahí — en esos rincones aburridos, olvidados, sin influencer hablando de ellos — es donde el contrarian encuentra su trabajo. No en buscar la próxima Nvidia, sino en comprar la siguiente Coca-Cola cuando nadie la quiere."
              : "We said it earlier: 7 stocks are 35% of the S&P. Which means the other 493, by pure maths, are under-allocated. Capital fled them and piled into the Magnificent Seven, and where capital is scarce, prices drop further than fundamentals justify. There — in those boring, forgotten corners with no influencer pumping them — is where the contrarian finds work. Not by hunting for the next Nvidia, but by buying the next Coca-Cola when no one wants it."}
          </p>
          <p>
            {es
              ? "Howard Marks lo resume mejor que nadie: \"no puedes hacer lo mismo que todos los demás y esperar resultados distintos\". En un mercado barato, todos pueden ganar. En un mercado caro, por definición, alguien tiene que perder — y suele ser el que entró el último, comprando lo que ya estaba caro. El contrarian acepta sentirse incómodo durante años a cambio de no ser ese último. Buffett se negó a tocar la tecnología en 1999 y le llamaron senil, fuera de juego, terminado. Tres años después, tras el estallido del Nasdaq, le llamaron genio. Esa es toda la película."
              : "Howard Marks puts it best: “you can’t do the same thing as everyone else and expect different results.” In a cheap market, everyone can win. In an expensive one, by definition, someone has to lose — and it’s usually whoever entered last, buying what was already expensive. The contrarian accepts feeling uncomfortable for years in exchange for not being that last buyer. Buffett refused to touch tech in 1999 and people called him senile, washed up, past it. Three years later, after the Nasdaq imploded, they called him a genius. That’s the entire movie."}
          </p>
          <p>
            {es
              ? "La parte fea: vas a parecer tonto durante mucho tiempo. Tus amigos te enseñarán las plusvalías de Nvidia, te dirán que el value está muerto, que la IA lo cambia todo, que esta vez es diferente. Apretarás los dientes y aguantarás. Y un día — normalmente un martes cualquiera, sin aviso — la rotación llegará. Diez años de paciencia recuperarán quince años de rentabilidad en seis meses. Eso ha pasado en 1973, en 2000, y volverá a pasar. La pregunta no es si — la pregunta es cuándo, y si tendrás el estómago de seguir comprando lo barato mientras todos a tu alrededor compran lo caro."
              : "The ugly part: you’re going to look stupid for a long time. Friends will show you their Nvidia gains, tell you value is dead, that AI changes everything, that this time it’s different. You’ll grit your teeth and hold. And one day — usually a random Tuesday, no warning — the rotation arrives. Ten years of patience recover fifteen years of returns in six months. It happened in 1973, in 2000, and it will happen again. The question isn’t if — it’s when, and whether you’ll have the stomach to keep buying the cheap stuff while everyone around you buys the expensive stuff."}
          </p>
          <p>
            {es
              ? "Por eso, en este régimen, el contrarian value no es una de varias estrategias válidas. Es, matemáticamente, la única donde el cálculo te da una ventaja esperada real. El indexador puro está rezando para que la próxima década se parezca a la anterior. El de growth puro está pagando precios que ya descontaron diez años de éxito. El contrarian value paga por debajo del valor presente de los flujos y deja que el tiempo y la reversión a la media hagan el resto. Es aburrido. Es lento. Es solitario. Y es el único enfoque que las matemáticas validan en mayo de 2026."
              : "Which is why, in this regime, contrarian value isn’t one of several valid strategies. It is, mathematically, the only one where the calculation gives you a real expected edge. The pure indexer is praying the next decade looks like the last one. The pure growth investor is paying prices that already discount ten years of success. The contrarian value buyer pays below the present value of the cash flows and lets time and mean reversion do the rest. It’s boring. It’s slow. It’s lonely. And it’s the only approach the arithmetic validates in May 2026."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Una nota incómoda sobre Europa" : "An uncomfortable note on Europe"}
          </h2>
          <p>
            {es
              ? "Si crees que el problema es solo americano, mira Europa con ojos honestos. Italia, Francia, España, Reino Unido — todas con deuda alta, crecimiento bajo y tipos que ya no pueden bajar a cero. El BCE no tiene la herramienta favorita de Estados Unidos: una moneda de reserva mundial que el resto del planeta sigue queriendo. Cuando la próxima crisis llegue, Europa tendrá menos margen, no más. Y los bonos italianos a 10 años, hoy alrededor del 4.5%, podrían parecer baratos en cinco años."
              : "If you think this is only an American problem, look at Europe honestly. Italy, France, Spain, the UK — all with high debt, low growth, and rates that can’t drop back to zero. The ECB doesn’t have the United States’ favourite tool: a global reserve currency the rest of the world still wants to hold. When the next crisis arrives, Europe will have less room, not more. The Italian 10-year, today around 4.5%, may look cheap in five years."}
          </p>
          <p>
            {es
              ? "Y Japón es el caso de estudio más raro de todos: el país que llegó primero a este punto y que, a pesar de tener una deuda del 250% del PIB, ha conseguido aguantar treinta años con tipos negativos o cercanos a cero. ¿Cómo? Porque el 90% de la deuda está en manos japonesas. La represión financiera funciona si tu país compra su propia deuda y nadie protesta. Es una opción, no una solución."
              : "And Japan is the strangest case study of all: the country that reached this point first and, despite carrying 250% debt-to-GDP, has somehow held it together for thirty years with negative or near-zero rates. How? Because 90% of that debt is held by Japanese savers. Financial repression works if your own country buys its own debt and nobody complains. It’s an option, not a solution."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Resumen práctico, sin adornos" : "Practical summary, no fluff"}
          </h2>

          <ol className="list-decimal pl-6 space-y-3">
            <li>
              <strong>{es ? "El 10Y americano es la base de todo. Vigílalo." : "The US 10Y is the foundation of everything. Watch it."}</strong>
              {es
                ? " Si está al 4.3%, todo lo demás se valora desde ahí. Su nivel marca el techo de tus rentabilidades futuras."
                : " If it sits at 4.3%, everything else gets priced off that. Its level caps your future returns."}
            </li>
            <li>
              <strong>{es ? "La ERP de hoy es la más comprimida en una generación." : "Today’s ERP is the most compressed in a generation."}</strong>
              {es
                ? " La bolsa cara y los bonos pagando casi lo mismo significan retornos mediocres por delante. Acepta menos, o aumenta el riesgo conscientemente."
                : " Expensive equities and bonds paying almost the same yield means mediocre returns ahead. Accept less, or take more risk consciously."}
            </li>
            <li>
              <strong>{es ? "La deuda no se va a ningún sitio." : "The debt isn’t going anywhere."}</strong>
              {es
                ? " Los desarrollados gastarán más en intereses que en defensa, educación o sanidad. La política responderá con inflación moderada o represión financiera. Ningún gobierno recortará gasto en serio."
                : " Developed economies will spend more on interest than on defence, education or health. The political response will be moderate inflation or financial repression. No government is going to make serious cuts."}
            </li>
            <li>
              <strong>{es ? "Diversifica de verdad, no en versión escaparate." : "Diversify properly, not for show."}</strong>
              {es
                ? " Bolsa de calidad, bonos largos cuando los tipos suben, oro como seguro, algo de cash al 4-5%. Y, sobre todo, expectativas realistas: no vamos a repetir el 2010-2021."
                : " Quality stocks, long bonds when yields spike, gold as insurance, some cash at 4–5%. And above all, realistic expectations: we are not going to replay 2010–2021."}
            </li>
          </ol>

          <p>
            {es
              ? "El mundo ha entrado en un régimen monetario nuevo y la mayoría de carteras todavía están construidas para el régimen anterior. Eso, a la larga, suele ser un problema. La buena noticia es que los conceptos básicos — risk-free rate, ERP, descuento de flujos — siguen funcionando. Solo hay que volver a aplicarlos sabiendo que el cimiento, ese 10Y que dabas por hecho, ya no es gratis."
              : "The world has entered a new monetary regime, and most portfolios are still built for the old one. That, over time, tends to be a problem. The good news is that the basic concepts — risk-free rate, ERP, discounted cash flows — still work. You just have to apply them again, knowing that the foundation — that 10Y you took for granted — is no longer free."}
          </p>

          <p>
            {es
              ? "Y como siempre, el calendario del FOMC en una mano, el yield del 10Y en la otra, y un poco de paciencia. La ERP cero no dura para siempre. Pero cuando se descomprima, lo hará rápido — y normalmente con poco aviso."
              : "As always: the FOMC calendar in one hand, the 10Y yield in the other, and a little patience. A zero ERP doesn’t last forever. But when it decompresses, it does it fast — and usually with very little warning."}
          </p>
        </div>

        <div className="mt-14 bg-[#0d1426] border border-blue-700/40 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">
            {es ? "Calcula la valoración intrínseca de cualquier acción" : "Calculate the intrinsic value of any stock"}
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            {es
              ? "Nuestra calculadora DCF usa el 10Y americano como tasa libre de riesgo y te deja ajustar la prima de riesgo. Compara tu estimación con el precio de mercado al instante."
              : "Our DCF calculator uses the US 10Y as the risk-free rate and lets you adjust the equity risk premium. Compare your estimate against the market price instantly."}
          </p>
          <Link href="/tools/valuation" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition inline-block">
            {es ? "Abrir calculadora de valoración" : "Open valuation calculator"}
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
