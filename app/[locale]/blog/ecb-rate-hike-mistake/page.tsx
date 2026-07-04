import Link from "next/link";
import type { Metadata } from "next";
import BlogArticleShell from "@/components/BlogArticleShell";

export const metadata: Metadata = {
  title: "Why an ECB Rate Hike on June 11 Would Be the Wrong Response to the Iran Oil Shock | FinancePlots",
  description:
    "Eurozone inflation is rising, but not because the economy is hot. It's a structural supply shock from the Iran war pushing energy back up. Monetary policy can't make oil cheaper — and an ECB hike on June 11 would be the wrong tool for the wrong problem.",
  alternates: { canonical: "https://www.financeplots.com/blog/ecb-rate-hike-mistake" },
  openGraph: {
    title: "Why an ECB Rate Hike on June 11 Would Be the Wrong Response to the Iran Oil Shock",
    description:
      "Eurozone inflation is rising, but not because the economy is hot. It's a structural supply shock from the Iran war pushing energy back up. Monetary policy can't make oil cheaper — and an ECB hike on June 11 would be the wrong tool for the wrong problem.",
    url: "https://www.financeplots.com/blog/ecb-rate-hike-mistake",
    siteName: "FinancePlots",
    type: "article",
    images: [{ url: "https://www.financeplots.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Why an ECB Rate Hike on June 11 Would Be the Wrong Response to the Iran Oil Shock",
    description:
      "Eurozone inflation is rising, but not because the economy is hot. It's a structural supply shock from the Iran war. Monetary policy can't make oil cheaper.",
    images: ["https://www.financeplots.com/og-image.png"],
  },
};

type Props = { params: Promise<{ locale: string }> };

export default async function ECBRateHikeMistake({ params }: Props) {
  const { locale } = await params;
  const es = locale === "es";

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: "{\"@context\":\"https://schema.org\",\"@type\":\"Article\",\"headline\":\"Why an ECB Rate Hike on June 11 Would Be the Wrong Response to the Iran Oil Shock\",\"description\":\"Eurozone inflation is rising, but not because the economy is hot. It's a structural supply shock from the Iran war pushing energy back up. Monetary policy can't make oil cheaper — and an ECB hike on June 11 would be the wrong tool for the wrong problem.\",\"url\":\"https://www.financeplots.com/blog/ecb-rate-hike-mistake\",\"image\":\"https://www.financeplots.com/og-image.png\",\"author\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\"},\"publisher\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\",\"logo\":{\"@type\":\"ImageObject\",\"url\":\"https://www.financeplots.com/logo-sm.png\"}},\"mainEntityOfPage\":{\"@type\":\"WebPage\",\"@id\":\"https://www.financeplots.com/blog/ecb-rate-hike-mistake\"}}" }} />
      <BlogArticleShell>

        <Link href="/blog" className="text-blue-400 text-sm hover:text-blue-300 transition mb-8 inline-block">
          {es ? "← Volver al Blog" : "← Back to Blog"}
        </Link>

        <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
          {es ? "Opinión" : "Opinion"}
        </span>
        <h1 className="text-4xl font-bold mt-2 mb-3 leading-tight">
          {es
            ? "Por qué subir tipos el 11 de junio sería la respuesta equivocada al shock del petróleo iraní"
            : "Why an ECB Rate Hike on June 11 Would Be the Wrong Response to the Iran Oil Shock"}
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          {es ? "Junio 2026 · 10 min de lectura · Por Javier Audibert" : "June 2026 · 10 min read · By Javier Audibert"}
        </p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">

          <p>
            {es
              ? "El BCE se reúne este jueves 11 de junio y, salvo sorpresa monumental, va a subir tipos. No es ya una posibilidad teórica: los futuros del Euribor descuentan una probabilidad del 99% de una subida de 25 puntos básicos, llevando la tasa de depósito del 2.00% actual al 2.25%. Sería la primera subida desde 2023, y rompería la pausa que el consejo había mantenido desde la reunión del 30 de abril. La parte incómoda es esta: la inflación está volviendo de verdad. El IPC armonizado del área euro pasó del 2.2% de febrero al 3.0% en abril. La core lleva tres meses subiendo. Y los halcones del consejo — Schnabel, Holzmann, Nagel — llevan semanas preparando el terreno con discursos cada vez más duros."
              : "The ECB meets this Thursday, June 11, and barring a monumental surprise, it is going to hike. This is no longer a theoretical possibility: Euribor futures are pricing a 99% probability of a 25 basis-point increase, lifting the deposit rate from the current 2.00% to 2.25%. It would be the first hike since 2023, breaking the pause the council has held since the April 30 meeting. And here’s the uncomfortable part: inflation really is coming back. Eurozone harmonised CPI moved from 2.2% in February to 3.0% in April. Core has been rising for three months. And the council’s hawks — Schnabel, Holzmann, Nagel — have spent weeks preparing the ground with increasingly hawkish speeches."}
          </p>

          <p>
            {es
              ? "Mi opinión, sin matices: hacerlo sería el peor error de política monetaria del BCE en una década. No porque la inflación no exista — está ahí, los datos no mienten — sino porque esta inflación no se parece en nada a la de 2022. No es un sobrecalentamiento de la demanda. No es un mercado laboral apretado. No es un consumidor con exceso de ahorro post-COVID. Es un shock de oferta estructural, exógeno y geopolítico que se llama guerra de Irán. Y subir tipos para combatir un shock de oferta es como tomarse un paracetamol para una pierna rota: hace ruido y no soluciona nada."
              : "My opinion, unvarnished: doing it would be the ECB’s worst monetary policy mistake in a decade. Not because inflation doesn’t exist — it does, the data doesn’t lie — but because this inflation doesn’t look anything like 2022’s. It isn’t demand overheating. It isn’t a tight labour market. It isn’t a consumer with post-COVID excess savings. It’s a structural, exogenous, geopolitical supply shock called the Iran war. And hiking rates to fight a supply shock is like taking paracetamol for a broken leg: noisy, useless."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Lo primero: el origen del rebrote inflacionario" : "First: where the inflation rebound is coming from"}
          </h2>

          <p>
            {es
              ? "Desde que el conflicto Irán-Israel escaló a una guerra abierta a finales del primer trimestre, el Brent ha pasado de 72 dólares a estabilizarse alrededor de 105-115. Es decir, un encarecimiento del 50-55% en menos de cuatro meses. El gas natural europeo TTF, que se había normalizado en torno a 28-32 EUR/MWh tras el ajuste post-2022, está de nuevo por encima de 55. El diesel mayorista ha subido un 28% en lo que va de año. Los seguros marítimos a través del Estrecho de Ormuz se han multiplicado por seis, y un tercio del petróleo del mundo pasa por ahí."
              : "Since the Iran-Israel conflict escalated into open war at the end of the first quarter, Brent has moved from $72 to settle around $105-115. That’s a 50-55% jump in less than four months. European TTF natural gas, which had normalised around 28-32 EUR/MWh after the 2022 adjustment, is back above 55. Wholesale diesel is up 28% year-to-date. Maritime insurance through the Strait of Hormuz has multiplied by six, and a third of the world’s oil passes through there."}
          </p>

          <p>
            {es
              ? "Descompon el IPC europeo de abril y verás exactamente esto: el 70% del incremento de la inflación viene de la energía y de los efectos de segundo orden en transporte, logística y alimentos básicos. El componente subyacente que no incluye energía, alimentos no procesados y servicios regulados está prácticamente plano. Los servicios siguen donde estaban — sin disparar — porque los salarios pactados en convenio no se han renegociado al alza desde el shock."
              : "Decompose April’s European CPI and you see exactly that: 70% of the increase in inflation comes from energy and second-round effects in transport, logistics and basic food. The narrow core component — excluding energy, unprocessed food and regulated services — is essentially flat. Services are where they were before — not firing up — because collectively-bargained wages haven’t renegotiated higher since the shock."}
          </p>

          <p>
            {es
              ? "Traducido: no estamos viendo una inflación que se autoalimenta a través de una espiral salarios-precios. Estamos viendo el reflejo directo y mecánico de un input energético más caro pasando por la cadena de valor. Es contabilidad, no es comportamiento."
              : "Translation: we’re not seeing inflation feeding itself through a wage-price spiral. We’re seeing the direct, mechanical pass-through of a more expensive energy input moving down the value chain. It’s accounting, not behaviour."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Por qué la distinción demanda vs oferta lo cambia todo" : "Why the demand-vs-supply distinction changes everything"}
          </h2>

          <p>
            {es
              ? "Esta es la lección que cuesta tanto que cale en los bancos centrales: la política monetaria funciona sobre el lado de la demanda. Subir tipos enfría el consumo, frena la inversión, enfría el crédito, reduce las presiones salariales que vienen de una economía que va a más velocidad de la que sus factores pueden sostener. Funciona contra la inflación de demanda. Estupendo. Para eso se inventó."
              : "This is the lesson that just won’t stick at central banks: monetary policy works on the demand side. Hiking rates cools consumption, slows investment, cools credit, reduces wage pressures coming from an economy running faster than its factors can sustain. It works against demand inflation. Great. That’s what it was invented for."}
          </p>

          <p>
            {es
              ? "Lo que no funciona — porque matemáticamente no puede funcionar — es contra la inflación de oferta. Si el petróleo sube porque Irán bloquea Ormuz, ¿qué exactamente vas a hacer subiendo el Euribor 25 puntos básicos? ¿Convencer al régimen de Teherán de que abra el estrecho? ¿Hacer que la refinería de Ras Tanura procese más barriles? ¿Fabricar GNL adicional en Qatar? No. Lo que vas a conseguir es destruir suficiente demanda de petróleo en Europa — vía recesión inducida — como para que el barril baje. Es decir, vas a empobrecer al continente hasta que pueda permitirse menos energía."
              : "What doesn’t work — because mathematically it cannot work — is supply inflation. If oil rises because Iran blocks the Strait of Hormuz, what exactly are you going to do by hiking Euribor 25 basis points? Convince the regime in Tehran to reopen the strait? Make Ras Tanura refine more barrels? Manufacture additional LNG in Qatar? No. What you will manage to do is destroy enough oil demand in Europe — through an induced recession — that the barrel comes down. In other words, you’re going to impoverish the continent until it can afford less energy."}
          </p>

          <p>
            {es
              ? "Funciona, sí. Es el mecanismo. Pero es un coste enorme para un problema que el banco central no puede arreglar de raíz. La inflación de oferta termina sola cuando la oferta se restablece — sea porque el conflicto se desescala, porque se abren nuevas rutas, porque la sustitución energética acelera, o porque sencillamente pasan los meses y los efectos base hacen su trabajo. La inflación de oferta no necesita un asesinato monetario. Necesita tiempo y respuesta del lado correcto."
              : "It works, yes. That’s the mechanism. But it’s an enormous cost to fix a problem the central bank cannot solve at the root. Supply inflation ends on its own when supply gets restored — whether the conflict de-escalates, new routes open, energy substitution accelerates, or simply months pass and base effects do the job. Supply inflation doesn’t need a monetary assassination. It needs time and a response from the right side."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "La economía europea, recordatorio: no aguanta más restricción" : "The European economy, reminder: it can’t take more restraint"}
          </h2>

          <p>
            {es
              ? "Esta es la parte que se vuelve trágica si la juntas con lo anterior. La economía a la que el BCE estaría apretando ya está, sin más adjetivos, en mal estado. PIB del primer trimestre del área euro: +0.2%. Alemania: -0.1%, técnicamente en recesión otra vez. Francia: +0.1%. Italia: +0.2%. España: +0.5% — el único que se mueve, en parte por turismo. La producción industrial alemana lleva treinta y tantos meses por debajo de niveles pre-COVID. Los PMIs manufactureros llevan dos años en contracción."
              : "This is the part that turns tragic when you stitch it together with the above. The economy the ECB would be tightening into is, plainly, in bad shape. Q1 eurozone GDP: +0.2%. Germany: -0.1%, technically in recession again. France: +0.1%. Italy: +0.2%. Spain: +0.5% — the only one moving, partly on tourism. German industrial production has been thirty-something months below pre-COVID levels. Manufacturing PMIs have been in contraction for two years."}
          </p>

          <p>
            {es
              ? "Y aquí viene el detalle que muchos olvidan: la economía europea ya está sufriendo el shock del petróleo del lado real. Las gasolineras italianas y españolas están un 22% más caras que en febrero. Las eléctricas francesas y alemanas han subido tarifas a la industria un 18-25%. Los hogares europeos están reduciendo gasto discrecional otra vez, igual que en 2022. La encuesta de confianza del consumidor ha caído ocho puntos en cuatro meses. Es decir, el shock energético ya está haciendo su propio trabajo recesivo sin que el BCE mueva un dedo."
              : "And here’s the detail many people forget: the European economy is already absorbing the oil shock on the real side. Italian and Spanish petrol stations are 22% more expensive than in February. French and German utilities have raised industrial tariffs 18-25%. European households are cutting discretionary spending again, the same way they did in 2022. Consumer confidence has fallen eight points in four months. Which is to say, the energy shock is already doing its own recessionary work without the ECB lifting a finger."}
          </p>

          <p>
            {es
              ? "Subir tipos encima de esto es apilar una recesión inducida por política monetaria sobre una contracción ya provocada por el shock externo. Dos golpes seguidos. Uno exógeno e inevitable; el otro perfectamente evitable y autoinfligido."
              : "Hiking rates on top of this is stacking a policy-induced recession on top of a contraction already caused by the external shock. Two punches in a row. One exogenous and unavoidable; the other perfectly avoidable and self-inflicted."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "El precedente exacto: julio de 2008" : "The exact precedent: July 2008"}
          </h2>

          <p>
            {es
              ? "En julio de 2008, el Brent rozaba los 145 dólares. La inflación europea estaba al 4%, casi todo por energía. La economía mostraba ya signos serios de desaceleración. ¿Qué hizo Trichet? Subió tipos 25 puntos básicos para \"anclar expectativas\". Tres meses después, Lehman Brothers cayó, el petróleo se desplomó a 35, y el BCE tuvo que recortar 325 puntos básicos en seis meses. La historia recordó esa subida como uno de los peores errores de política monetaria de la era moderna."
              : "In July 2008, Brent was brushing $145. European inflation stood at 4%, almost entirely energy-driven. The economy was already showing serious signs of slowing. What did Trichet do? He hiked 25 basis points to “anchor expectations.” Three months later, Lehman Brothers collapsed, oil crashed to $35, and the ECB had to cut 325 basis points in six months. History remembers that hike as one of the worst monetary policy mistakes of the modern era."}
          </p>

          <p>
            {es
              ? "El paralelismo con junio de 2026 es incómodamente directo. Misma estructura: shock de oferta energético, inflación headline disparada, economía debilitándose por el shock, halcones del consejo presionando por una respuesta visible. Y, otra vez, el riesgo de actuar contra lo que parece la inflación cuando lo que tienes delante es un problema de oferta que tu herramienta no puede resolver."
              : "The parallel with June 2026 is uncomfortably direct. Same structure: energy supply shock, headline inflation jumping, an economy weakening from the shock itself, council hawks pushing for a visible response. And, once again, the risk of acting against what looks like inflation when what you have in front of you is a supply problem your tool cannot fix."}
          </p>

          <div className="bg-blue-600/10 border border-blue-700/30 rounded-xl p-6 my-8">
            <p className="text-blue-300 text-sm font-semibold mb-2">
              {es ? "La regla que el BCE olvida cada quince años" : "The rule the ECB forgets every fifteen years"}
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              {es
                ? "Política monetaria contra inflación de demanda: funciona. Política monetaria contra inflación de oferta: destruye demanda hasta que la economía pueda permitirse menos del input escaso. No es la misma herramienta, ni el mismo coste. 2008 y 2022 deberían haber sido suficientes."
                : "Monetary policy against demand inflation: works. Monetary policy against supply inflation: destroys demand until the economy can afford less of the scarce input. Not the same tool, not the same cost. 2008 and 2022 should have been enough."}
            </p>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "La transmisión europea, otra vez, es brutal" : "European transmission, once again, is brutal"}
          </h2>

          <p>
            {es
              ? "Detalle que se olvida: el sistema financiero europeo no se parece al americano. En Estados Unidos, las empresas se financian sobre todo en bonos, con cierta amortiguación. En Europa, el 75-80% del crédito corporativo pasa por bancos, y los bancos europeos prestan a tipo variable indexado a Euribor. Una subida de 25 puntos básicos del BCE se traduce en pocas semanas en pagarés, líneas y revolving más caros para cientos de miles de pymes — que ya están pagando una factura energética un 25% más alta."
              : "An often-forgotten detail: the European financial system doesn’t look like the American one. In the US, companies finance themselves mostly through bonds, with some buffering. In Europe, 75-80% of corporate credit runs through banks, and European banks lend at variable rates indexed to Euribor. A 25 basis-point ECB hike turns within weeks into more expensive commercial paper, credit lines and revolvers for hundreds of thousands of SMEs — the same SMEs already paying an energy bill 25% higher."}
          </p>

          <p>
            {es
              ? "Las hipotecas son el mismo cuento. En España, Italia, Irlanda y Portugal una parte significativa del stock hipotecario es variable o mixta, revisada anualmente con el Euribor a 12 meses. Cada 25 puntos básicos cuesta a una familia media española entre 30 y 50 euros al mes adicionales, indefinidamente. Encima de una factura del coche, del gas y de la luz que ya ha subido por el shock. La capacidad de gasto que se retira a la economía real, vía hipoteca y vía energía a la vez, es enorme."
              : "Mortgages are the same story. In Spain, Italy, Ireland and Portugal, a significant share of the outstanding mortgage stock is variable or mixed-rate, repricing annually against 12-month Euribor. Each 25 basis points costs an average Spanish family 30 to 50 euros more per month, indefinitely. On top of a fuel, gas and electricity bill already inflated by the shock. The spending power withdrawn from the real economy — through mortgage and energy at the same time — is huge."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Los soberanos y el riesgo de fragmentación" : "The sovereigns and the fragmentation risk"}
          </h2>

          <p>
            {es
              ? "La deuda pública europea es la más alta desde la Segunda Guerra Mundial. Italia ronda el 140% del PIB, Francia el 115%, España el 105%, Bélgica el 105%. El servicio de la deuda en Italia ya supera el gasto en sanidad. En Francia es top-3 del presupuesto. Cada nueva emisión, con tipos más altos, eleva el coste medio del stock durante años — efecto que se nota poco a poco, pero que es irreversible una vez aplicado."
              : "European public debt is the highest since the Second World War. Italy is around 140% of GDP, France 115%, Spain 105%, Belgium 105%. Italian debt service already exceeds health spending. In France it’s a top-3 budget item. Each new issuance at higher rates raises the average cost of the stock over years — an effect that creeps in, but is irreversible once applied."}
          </p>

          <p>
            {es
              ? "Y luego está el riesgo específicamente europeo: la fragmentación. El spread BTP-Bund — la diferencia entre lo que paga Italia y Alemania por la deuda a 10 años — se mueve cada vez que los inversores creen que el euro vuelve a estar bajo tensión. Hoy ronda los 175 puntos básicos. En 2011, con Trichet subiendo en plena crisis, llegó a más de 500 y casi nos cuesta el euro. Una guerra en Oriente Medio, una recesión por shock energético y un BCE subiendo tipos al mismo tiempo es exactamente el cóctel para que ese spread se descontrole."
              : "And then there’s the specifically European risk: fragmentation. The BTP-Bund spread — the gap between what Italy pays and what Germany pays on 10-year debt — moves every time investors think the euro is under stress. Today it sits around 175 basis points. In 2011, with Trichet hiking into a sovereign crisis, it blew past 500 and almost cost us the euro. A Middle East war, an energy-shock recession and an ECB hiking at the same time is exactly the cocktail to send that spread spiralling."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Qué deberían hacer en su lugar" : "What they should do instead"}
          </h2>

          <p>
            {es
              ? "Distinguir, primero, en su comunicación entre inflación de oferta e inflación de demanda. Decirlo claramente. Reconocer en rueda de prensa, sin ambigüedad, que la inflación de mayo está dominada por el componente energético y que la política monetaria no es la herramienta adecuada para combatir un shock externo."
              : "First, distinguish clearly in their communications between supply inflation and demand inflation. Say it plainly. Acknowledge in the press conference, without ambiguity, that May’s inflation is dominated by the energy component and that monetary policy is not the right tool to combat an external shock."}
          </p>

          <p>
            {es
              ? "Segundo, mantener tipos. El BCE ya está en política neutral-restrictiva — tasa de depósito al 2.00%, refi al 2.15%, balance reduciéndose ordenadamente. Eso es suficiente para combatir cualquier inflación de demanda que no exista. Anclar expectativas a través de credibilidad y mensaje, no a través de un trigger pull innecesario el jueves 11."
              : "Second, hold rates. The ECB is already in neutral-restrictive territory — deposit rate at 2.00%, refi at 2.15%, balance sheet shrinking in orderly fashion. That’s enough to fight any demand inflation that doesn’t exist. Anchor expectations through credibility and message, not through an unnecessary trigger pull on Thursday the 11th."}
          </p>

          <p>
            {es
              ? "Tercero, presionar — dentro de su mandato y a través del diálogo con la Comisión y el Eurogrupo — para que la respuesta venga del lado correcto: paquetes de ayuda energética temporales y dirigidos a hogares vulnerables y a industrias intensivas en energía, aceleración de la inversión en renovables y nucleares, uso coordinado de reservas estratégicas, contratos a largo plazo con productores no-OPEP. La política fiscal tiene las herramientas que la política monetaria no tiene. Hay que usarlas."
              : "Third, push — within their mandate and through dialogue with the Commission and the Eurogroup — for the response to come from the right side: temporary, targeted energy support packages for vulnerable households and energy-intensive industries, accelerated investment in renewables and nuclear, coordinated use of strategic reserves, long-term contracts with non-OPEC producers. Fiscal policy has the tools monetary policy doesn’t. Use them."}
          </p>

          <p>
            {es
              ? "Y cuarto, ser pacientes. Los shocks de oferta tienen una característica preciosa: terminan. O bien porque el conflicto se resuelve, o porque los efectos base hacen el trabajo (recordemos que dentro de doce meses la base de comparación incluirá ya este shock), o porque la sustitución acelera. El error de 2008 fue no esperar. El error de 2026 sería repetirlo a sabiendas."
              : "And fourth, be patient. Supply shocks have a beautiful feature: they end. Either because the conflict resolves, or because base effects do the work (remember that twelve months from now the comparison base will already include this shock), or because substitution accelerates. The mistake in 2008 was not waiting. The mistake in 2026 would be repeating it knowingly."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Qué significa para tu cartera" : "What this means for your portfolio"}
          </h2>

          <p>
            {es
              ? "Aunque el artículo es macro, hay implicaciones prácticas. Si crees, como yo, que el BCE no debería subir pero podría hacerlo bajo presión interna, hay que posicionarse para los dos escenarios."
              : "Although this is a macro piece, there are practical implications. If you think, as I do, that the ECB shouldn’t hike but might do so under internal pressure, you need to position for both scenarios."}
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li>
              {es
                ? "Energía y commodities: el shock es estructural, no transitorio. Petroleras europeas integradas (Shell, BP, Repsol, Eni, TotalEnergies) cotizan a 6-8 veces beneficios con dividendos del 6-8%. Si el Brent se queda en 100-110, esa generación de caja es ridícula."
                : "Energy and commodities: this shock is structural, not transitory. Integrated European oil majors (Shell, BP, Repsol, Eni, TotalEnergies) trade at 6-8x earnings with 6-8% dividend yields. If Brent stays at $100-110, that cash generation is absurd."}
            </li>
            <li>
              {es
                ? "Oro: seguro clásico contra error de política monetaria y contra escalada geopolítica. Lleva cinco años subiendo y la tesis no ha cambiado."
                : "Gold: the classic insurance against monetary policy error and against geopolitical escalation. Up five years running, thesis intact."}
            </li>
            <li>
              {es
                ? "Bonos largos en euros — Bund y OAT a 10 años — son atractivos si el BCE se queda quieto o, mejor aún, si recorta cuando reconozca el error. Cupón decente con posible ganancia de capital."
                : "Long-duration euro bonds — 10-year Bund and OAT — are attractive if the ECB stays put or, better, cuts when it acknowledges the error. Decent coupon with potential capital gain."}
            </li>
            <li>
              {es
                ? "Bancos europeos: cuidado. Beneficio en el corto plazo si suben tipos, pero el deterioro del crédito a pymes y hogares — apretados por energía y por hipoteca — les puede comer el margen en seis trimestres. Selectivo."
                : "European banks: be careful. Short-term benefit if rates rise, but deteriorating credit to SMEs and households — squeezed both by energy and by mortgages — can eat the margin in six quarters. Selective."}
            </li>
            <li>
              {es
                ? "Exportadoras grandes (LVMH, ASML, SAP, Novo Nordisk, Roche): un euro al alza por divergencia con la Fed les pega. Elegir por calidad y poder de fijación de precios, no la cesta entera."
                : "Large exporters (LVMH, ASML, SAP, Novo Nordisk, Roche): a rising euro on Fed-ECB divergence hits them. Pick on quality and pricing power, not the whole basket."}
            </li>
            <li>
              {es
                ? "Periferia (BTP italiano, deuda corporativa española e italiana): atractiva mientras la fragmentación no vuelva. Si vuelve, los compras más baratos. Posición pequeña con paciencia."
                : "Periphery (Italian BTP, Spanish and Italian corporate debt): attractive while fragmentation stays away. If it returns, you buy cheaper. Small position, patience."}
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Cierre, sin adornos" : "Closing, no fluff"}
          </h2>

          <p>
            {es
              ? "Lo que tenemos delante en junio de 2026 no es la inflación de demanda de 2022. No es un consumidor desbocado. No es un mercado laboral tensionado. Es la sombra de Ormuz proyectada sobre cada gasolinera y cada factura eléctrica del continente. La política monetaria no tiene capacidad para hacer que el petróleo sea más barato. Solo tiene capacidad para hacer que Europa pueda permitirse menos petróleo. Esa diferencia, en el medio plazo, es la diferencia entre una recuperación frágil y una recesión seria."
              : "What we have in front of us in June 2026 is not 2022’s demand inflation. It’s not an out-of-control consumer. It’s not a tight labour market. It’s the shadow of Hormuz cast over every petrol station and every electricity bill on the continent. Monetary policy has no power to make oil cheaper. It only has the power to make Europe afford less oil. That difference, over the medium term, is the difference between a fragile recovery and a serious recession."}
          </p>

          <p>
            {es
              ? "El BCE tiene la oportunidad de demostrar que aprendió de Trichet en 2008. Lo fácil es subir 25 puntos básicos y vestirlo de \"credibilidad\". Lo difícil — y lo correcto — es decir en público lo que en privado todos saben: esto no es nuestro problema, esta no es nuestra herramienta, y vamos a esperar. La prudencia, esta vez, no se llama subir. Se llama saber distinguir."
              : "The ECB has a chance to show it learned from Trichet in 2008. The easy thing is to hike 25 basis points and dress it up as “credibility.” The hard thing — and the right thing — is to say in public what they all know in private: this isn’t our problem, this isn’t our tool, and we’re going to wait. Prudence, this time, isn’t called hiking. It’s called knowing the difference."}
          </p>

          <p>
            {es
              ? "Y si al final lo hacen — ojalá que no — al menos que el inversor europeo tenga la cartera preparada para absorber el error. Porque el error monetario, cuando llega encima de un shock geopolítico, no perdona."
              : "And if in the end they do it — let’s hope not — at least let the European investor have a portfolio ready to absorb the error. Because monetary error, when it lands on top of a geopolitical shock, doesn’t forgive."}
          </p>
        </div>

        <div className="mt-14 bg-[#0d1426] border border-blue-700/40 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">
            {es ? "Mide el impacto real de los tipos en tu negocio o cartera" : "Measure the real impact of rates on your business or portfolio"}
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            {es
              ? "Nuestras calculadoras de modelo financiero a 5 años y de valoración te dejan ajustar la tasa de descuento y ver, al instante, cómo cambia el resultado ante distintos escenarios de tipos del BCE."
              : "Our 5-year financial model and valuation calculators let you adjust the discount rate and instantly see how the result changes under different ECB rate scenarios."}
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
