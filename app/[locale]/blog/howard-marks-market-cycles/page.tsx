import Link from "next/link";
import type { Metadata } from "next";
import BlogArticleShell from "@/components/BlogArticleShell";

const BASE = "https://www.financeplots.com";
const PATH = "/blog/howard-marks-market-cycles";
const IMAGE = `${BASE}/og-image.png`;

// Everything on this page exists in English and Spanish, metadata included.
const COPY = {
  en: {
    url: `${BASE}${PATH}`,
    title: "Mastering the Market Cycle on a Seven-Mile Commute: What Howard Marks Taught Me",
    description:
      "Listening to Howard Marks in traffic: market cycles, the pendulum of fear and greed, second-level thinking, being a contrarian — the Rolls-Royce of 2020 as a case — and why timing is the hardest part to get right.",
  },
  es: {
    url: `${BASE}/es${PATH}`,
    title: "Dominar el ciclo de mercado en un trayecto de siete millas: lo que me enseñó Howard Marks",
    description:
      "Escuchando a Howard Marks en un atasco: los ciclos de mercado, el péndulo entre miedo y codicia, el pensamiento de segundo nivel, ser contrarian — con Rolls-Royce en 2020 como caso — y por qué acertar con el momento es lo más difícil.",
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

// Rolls-Royce figures are weekly closing prices from Yahoo Finance (RR.L),
// adjusted for the October 2020 rights issue, read on 18 November 2026. They
// illustrate an idea from the book with a past episode; the article says
// nothing about the shares today.

/** The pendulum drawn as a wave: illustrative, no data. */
function PendulumChart({ es }: { es: boolean }) {
  const tr = (en: string, sp: string) => (es ? sp : en);
  // One and a half swings across 640 px; mid line at y = 130.
  const wave = Array.from({ length: 161 }, (_, i) => {
    const x = 20 + i * 4;
    const y = 130 - 80 * Math.sin((i / 160) * Math.PI * 3 + 0.35);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <figure className="not-prose my-8 bg-[#0d1426] border border-gray-800 rounded-xl p-4 sm:p-6">
      <svg viewBox="0 0 680 296" className="w-full h-auto" role="img" aria-label={tr(
        "An illustrative wave: market mood swings between euphoria and depression and spends little time at fair value in the middle. Near the top, lean defensive; near the bottom, lean aggressive.",
        "Una onda ilustrativa: el ánimo del mercado oscila entre la euforia y la depresión y pasa poco tiempo en el valor razonable del medio. Cerca del techo, más defensivo; cerca del suelo, más agresivo."
      )}>
        <line x1="20" y1="130" x2="660" y2="130" stroke="#4b5563" strokeDasharray="4 5" />
        <text x="24" y="148" fill="#9ca3af" fontSize="12">{tr("Fair value — rarely visited", "Valor razonable — poco visitado")}</text>
        <path d={wave} fill="none" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
        {/* Peaks at x ≈ 103 and 530; trough at x ≈ 316 */}
        <circle cx="103" cy="50" r="6" fill="#0a0f1e" stroke="#60a5fa" strokeWidth="2" />
        <circle cx="530" cy="50" r="6" fill="#0a0f1e" stroke="#60a5fa" strokeWidth="2" />
        <circle cx="316" cy="210" r="6" fill="#0a0f1e" stroke="#60a5fa" strokeWidth="2" />
        <text x="103" y="16" textAnchor="middle" fill="#e5e7eb" fontSize="13" fontWeight="600">{tr("Euphoria", "Euforia")}</text>
        <text x="530" y="16" textAnchor="middle" fill="#e5e7eb" fontSize="13" fontWeight="600">{tr("Euphoria", "Euforia")}</text>
        <text x="316" y="238" textAnchor="middle" fill="#e5e7eb" fontSize="13" fontWeight="600">{tr("Depression", "Depresión")}</text>
        <text x="316" y="256" textAnchor="middle" fill="#9ca3af" fontSize="11">{tr("“Nothing will ever go right”", "«Nada volverá a salir bien»")}</text>
        <text x="103" y="34" textAnchor="middle" fill="#9ca3af" fontSize="11">{tr("“Nothing can go wrong”", "«Nada puede salir mal»")}</text>
        <text x="530" y="34" textAnchor="middle" fill="#9ca3af" fontSize="11">{tr("“This time is different”", "«Esta vez es distinto»")}</text>
        {/* Posture strip */}
        <rect x="20" y="272" width="640" height="18" rx="4" fill="#111a33" />
        <text x="103" y="285" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="600">{tr("Lean defensive", "Más defensivo")}</text>
        <text x="316" y="285" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="600">{tr("Lean aggressive", "Más agresivo")}</text>
        <text x="530" y="285" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="600">{tr("Lean defensive", "Más defensivo")}</text>
      </svg>
      <figcaption className="text-xs text-gray-500 mt-3">
        {tr(
          "Illustrative, not data. Marks's point is that the pendulum spends very little time in the middle — and nobody can say how long each swing will last.",
          "Ilustrativo, no son datos. La idea de Marks es que el péndulo pasa muy poco tiempo en el medio, y nadie sabe cuánto durará cada oscilación."
        )}
      </figcaption>
    </figure>
  );
}

export default async function HowardMarksMarketCycles({ params }: Props) {
  const { locale } = await params;
  const es = locale === "es";
  const tr = (en: string, sp: string) => (es ? sp : en);
  const copy = es ? COPY.es : COPY.en;
  const h2 = "text-2xl font-bold text-white mt-10";

  const temperature: { side: string; signs: string[] }[] = [
    {
      side: tr("Signs the market is running hot", "Señales de un mercado caliente"),
      signs: [
        tr("Lenders compete to lend, and loan terms get looser", "Los bancos compiten por prestar y las condiciones se relajan"),
        tr("New issues and IPOs sell out on the first day", "Las emisiones y salidas a bolsa se colocan el primer día"),
        tr("Risk is talked about as something that has gone away", "Se habla del riesgo como de algo que ha desaparecido"),
        tr("People who never invest ask you what to buy", "Gente que nunca invierte te pregunta qué comprar"),
      ],
    },
    {
      side: tr("Signs the market is running cold", "Señales de un mercado frío"),
      signs: [
        tr("Even sound companies struggle to raise money", "Hasta las empresas sanas tienen problemas para financiarse"),
        tr("Headlines assume the bad news is permanent", "Los titulares dan las malas noticias por permanentes"),
        tr("Selling is driven by fear or forced, not by price", "Se vende por miedo o por obligación, no por precio"),
        tr("Nobody wants to talk about shares at dinner", "Nadie quiere hablar de bolsa en la cena"),
      ],
    },
  ];

  const rolls: [string, string, string][] = [
    [tr("Feb 2020", "Feb 2020"), "≈222p", tr("Before the pandemic", "Antes de la pandemia")],
    [tr("Sep 2020", "Sep 2020"), tr("below 40p", "menos de 40p"), tr("Planes grounded; rights issue at 32p", "Aviones en tierra; ampliación a 32p")],
    [tr("Dec 2020", "Dic 2020"), "≈116p", tr("Vaccine news; first rebound", "Llegan las vacunas; primer rebote")],
    [tr("Sep 2022", "Sep 2022"), "≈70p", tr("Down again — two years in", "Otra vez abajo, dos años después")],
    [tr("Late 2023", "Finales 2023"), "≈240p", tr("Back above pre-pandemic", "Por encima de antes de la pandemia")],
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
            datePublished: "2026-11-18",
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

        <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">{tr("Opinion", "Opinión")}</span>
        <h1 className="text-4xl font-bold mt-2 mb-3 leading-tight">{copy.title}</h1>
        <p className="text-gray-400 text-sm mb-10">
          {tr("November 2026 · 6 min read · By Javier Audibert", "Noviembre 2026 · 6 min de lectura · Por Javier Audibert")}
        </p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">
          <p>
            {tr(
              "My commute is seven miles across southern England. On a good day that is fifteen minutes; on most days, with the traffic we have, it is a lot more. I do it in an old but reliable Toyota — nothing exciting, it simply starts every morning — and the one piece of technology in it that changed my driving is Bluetooth. Together with Google Maps, it turned dead time in a queue into time to listen to books.",
              "Mi trayecto al trabajo son siete millas por el sur de Inglaterra. En un buen día son quince minutos; casi todos los días, con el tráfico que hay, son bastantes más. Lo hago en un Toyota viejo pero fiable — nada emocionante, simplemente arranca todas las mañanas — y la única tecnología que tiene y que me cambió la forma de conducir es el Bluetooth. Junto con Google Maps, convirtió el tiempo muerto en un atasco en tiempo para escuchar libros."
            )}
          </p>
          <p>
            {tr(
              "The last one was Howard Marks's Mastering the Market Cycle. It fits a traffic jam surprisingly well. Google Maps cannot tell you what the road will look like in an hour, but it tells you exactly where you are and how bad it is right now — and that alone changes your decisions. Marks makes the same argument about markets: we will never know where we're going, but we had better know where we are.",
              "El último ha sido Mastering the Market Cycle, de Howard Marks. Encaja sorprendentemente bien con un atasco. Google Maps no te puede decir cómo estará la carretera dentro de una hora, pero sí exactamente dónde estás y lo mal que está ahora mismo, y solo eso ya cambia tus decisiones. Marks defiende lo mismo para los mercados: nunca sabremos adónde vamos, pero más nos vale saber dónde estamos."
            )}
          </p>
          <p>{tr("These are the ideas that stayed with me after the last chapter.", "Estas son las ideas que se me quedaron después del último capítulo.")}</p>

          <h2 className={h2}>{tr("1. Everything moves in cycles", "1. Todo se mueve en ciclos")}</h2>
          <p>
            {tr(
              "The economy, company profits, credit, property and — above all — investor psychology all go up and down, and they feed each other. Good news makes people optimistic, optimism makes lenders generous, easy money pushes prices up, high prices make people more optimistic still. Then the same chain runs in reverse. Marks's point is not that cycles are regular — they aren't — but that they always come back, and that the excesses of one phase cause the next.",
              "La economía, los beneficios empresariales, el crédito, el inmobiliario y, sobre todo, la psicología del inversor suben y bajan, y se alimentan entre sí. Las buenas noticias vuelven optimista a la gente, el optimismo vuelve generosos a los bancos, el dinero fácil sube los precios y los precios altos vuelven a la gente todavía más optimista. Luego la misma cadena va hacia atrás. Lo que dice Marks no es que los ciclos sean regulares — no lo son — sino que siempre vuelven, y que los excesos de una fase provocan la siguiente."
            )}
          </p>
          <p>
            {tr(
              "He pictures it as a pendulum. Market mood swings between euphoria and depression, between greed and fear, and it spends remarkably little time at the sensible point in the middle.",
              "Él lo dibuja como un péndulo. El ánimo del mercado oscila entre la euforia y la depresión, entre la codicia y el miedo, y pasa muy poco tiempo en el punto sensato del medio."
            )}
          </p>
        </div>

        <PendulumChart es={es} />

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">
          <h2 className={h2}>{tr("2. Calibrate: more defensive or more aggressive", "2. Calibrar: más defensivo o más agresivo")}</h2>
          <p>
            {tr(
              "This is the practical heart of the book. You don't need to forecast the next recession to act on the cycle. You only need to take the market's temperature and adjust your posture: a little more defensive when prices assume nothing can go wrong, a little more aggressive when they assume nothing will ever go right. It isn't all in or all out — it's leaning one way or the other, the way you'd drive differently in fog without knowing exactly when it will lift.",
              "Este es el corazón práctico del libro. No hace falta predecir la próxima recesión para actuar según el ciclo. Basta con tomarle la temperatura al mercado y ajustar la postura: un poco más defensivo cuando los precios dan por hecho que nada puede salir mal, un poco más agresivo cuando dan por hecho que nada volverá a salir bien. No es todo dentro o todo fuera, es inclinarse hacia un lado o hacia otro, igual que conduces distinto con niebla sin saber exactamente cuándo va a levantar."
            )}
          </p>
        </div>

        <div className="not-prose grid gap-3 sm:grid-cols-2 my-6">
          {temperature.map((t) => (
            <div key={t.side} className="bg-[#0d1426] border border-gray-800 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">{t.side}</p>
              <ul className="space-y-2 text-sm text-gray-300">
                {t.signs.map((s) => (
                  <li key={s} className="flex gap-2"><span className="text-gray-500" aria-hidden>•</span><span>{s}</span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">
          <h2 className={h2}>{tr("3. It's about human behaviour", "3. Va de comportamiento humano")}</h2>
          <p>
            {tr(
              "If markets were driven only by numbers, cycles would be gentle. They aren't, because the people setting prices are the same people who feel clever after a good year and frightened after a bad one. Marks keeps coming back to this: the fundamentals change slowly, but the way people feel about them swings wildly — and the price follows the feeling, not the fundamentals, for longer than seems reasonable.",
              "Si los mercados se movieran solo por números, los ciclos serían suaves. No lo son, porque quienes fijan los precios son las mismas personas que se sienten listas tras un buen año y asustadas tras uno malo. Marks vuelve a esto una y otra vez: los fundamentales cambian despacio, pero lo que la gente siente sobre ellos oscila muchísimo, y el precio sigue al sentimiento, no a los fundamentales, durante más tiempo del que parece razonable."
            )}
          </p>

          <h2 className={h2}>{tr("4. Second-level thinking", "4. El pensamiento de segundo nivel")}</h2>
          <p>
            {tr(
              "The idea comes from his earlier book, The Most Important Thing, and it runs through this one too. First-level thinking says: “It's a great company, buy it.” Second-level thinking asks: “It's a great company — but everybody knows that, so what is already in the price? What does the market expect, and what has to happen for it to be wrong?”",
              "La idea viene de su libro anterior, The Most Important Thing, y recorre también este. El pensamiento de primer nivel dice: «Es una gran empresa, cómprala». El de segundo nivel pregunta: «Es una gran empresa, pero eso lo sabe todo el mundo, así que ¿qué está ya en el precio? ¿Qué espera el mercado y qué tiene que pasar para que se equivoque?»"
            )}
          </p>
          <p>
            {tr(
              "It is close to the idea of intrinsic value: a business is worth something on its own, and the market's price can sit far above or below it. A good company at too high a price can be a poor investment; a troubled one at a low enough price can be a good one. The question is never only “is it good?” but “is it better or worse than the price says?”",
              "Se parece mucho a la idea de valor intrínseco: un negocio vale algo por sí mismo, y el precio del mercado puede estar muy por encima o muy por debajo. Una buena empresa a un precio demasiado alto puede ser una mala inversión; una con problemas a un precio lo bastante bajo puede ser una buena. La pregunta nunca es solo «¿es buena?», sino «¿es mejor o peor de lo que dice el precio?»"
            )}
          </p>

          <h2 className={h2}>{tr("5. The contrarian mindset", "5. La mentalidad contrarian")}</h2>
          <p>
            {tr(
              "Put the pendulum and second-level thinking together and you get the contrarian. Not someone who disagrees with everybody for the sake of it — the crowd is right most of the time in the middle of a cycle — but someone willing to stand apart at the extremes, when fear or greed has pushed prices to a place the facts don't justify.",
              "Si juntas el péndulo y el pensamiento de segundo nivel sale el contrarian. No alguien que lleva la contraria a todo el mundo por gusto — en mitad de un ciclo la mayoría acierta casi siempre — sino alguien dispuesto a apartarse en los extremos, cuando el miedo o la codicia han llevado los precios a un sitio que los hechos no justifican."
            )}
          </p>

          <h2 className={h2}>{tr("A case: Rolls-Royce in 2020", "Un caso: Rolls-Royce en 2020")}</h2>
          <p>
            {tr(
              "The example I kept thinking about on the road is Rolls-Royce during the pandemic. Much of what it earns from aircraft engines comes from servicing them: airlines pay according to the hours the engines fly. In 2020 planes stopped flying, and that income fell off a cliff. The market priced the shares as if planes would never fly again — the company needed a rescue rights issue in October 2020 to strengthen its balance sheet.",
              "El ejemplo en el que no dejaba de pensar en la carretera es Rolls-Royce durante la pandemia. Gran parte de lo que gana con los motores de avión viene de su mantenimiento: las aerolíneas pagan según las horas que vuelan los motores. En 2020 los aviones dejaron de volar y ese ingreso se desplomó. El mercado puso precio a las acciones como si los aviones no fueran a volver a volar nunca — la compañía necesitó una ampliación de capital de rescate en octubre de 2020 para reforzar su balance."
            )}
          </p>
          <p>
            {tr(
              "The second-level question was simple to ask and very hard to act on: will people stop flying for ever, or is this the bottom of the pendulum? Here is what the price did (weekly closes, adjusted for the rights issue):",
              "La pregunta de segundo nivel era fácil de hacer y muy difícil de llevar a la práctica: ¿la gente dejará de volar para siempre, o esto es el punto más bajo del péndulo? Esto es lo que hizo el precio (cierres semanales, ajustados por la ampliación):"
            )}
          </p>
        </div>

        <div className="not-prose grid gap-3 grid-cols-2 sm:grid-cols-5 my-6">
          {rolls.map(([when, price, what]) => (
            <div key={when} className="bg-[#0d1426] border border-gray-800 rounded-xl p-3">
              <p className="text-xs text-gray-400">{when}</p>
              <p className="text-lg font-bold text-white mt-1">{price}</p>
              <p className="text-xs text-gray-400 mt-1 leading-snug">{what}</p>
            </div>
          ))}
        </div>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">
          <p>
            {tr(
              "In hindsight, the contrarian view was right: people did fly again, and by the end of 2023 the shares were back above where they started. But look at the years in between. Someone who bought after the first halving, at around 110p in mid-2020, was still down by about a third two years later. Being right about the idea did not protect anyone from being early.",
              "Visto ahora, la postura contrarian acertó: la gente volvió a volar y a finales de 2023 la acción estaba por encima de donde empezó. Pero mira los años de en medio. Quien compró tras la primera caída a la mitad, a unos 110p a mediados de 2020, seguía perdiendo alrededor de un tercio dos años después. Acertar con la idea no protegió a nadie de llegar demasiado pronto."
            )}
          </p>

          <h2 className={h2}>{tr("6. Timing: the hardest part", "6. El momento: lo más difícil")}</h2>
          <p>
            {tr(
              "This is where Marks is most honest, and where I found the book most useful. Knowing where we are in the cycle tells you which way the odds lean; it doesn't tell you when the turn will come. Marks's own line is that being too far ahead of your time is indistinguishable from being wrong. A market can be expensive and stay expensive — or get much more expensive — for longer than your patience, your job or your borrowing can last. The old saying usually credited to Keynes makes the same point: markets can stay irrational longer than you can stay solvent.",
              "Aquí es donde Marks es más honesto, y donde el libro me resultó más útil. Saber en qué punto del ciclo estamos te dice hacia dónde se inclinan las probabilidades; no te dice cuándo llegará el giro. Su propia frase es que adelantarse demasiado a tu tiempo no se distingue de equivocarse. Un mercado puede estar caro y seguir caro — o ponerse mucho más caro — durante más tiempo del que aguantan tu paciencia, tu trabajo o tu deuda. El viejo dicho que se suele atribuir a Keynes dice lo mismo: los mercados pueden seguir siendo irracionales más tiempo del que tú puedes seguir siendo solvente."
            )}
          </p>
          <p>
            {tr(
              "So the lesson is not “spot the top and the bottom”. It is to calibrate, not to bet: lean a bit, keep enough of a buffer that being early doesn't force you to sell at the worst moment, and accept that the stress of waiting is part of the price of being right.",
              "Así que la lección no es «adivina el techo y el suelo». Es calibrar, no apostar: inclinarse un poco, guardar colchón suficiente para que llegar pronto no te obligue a vender en el peor momento, y aceptar que la tensión de esperar es parte del precio de acertar."
            )}
          </p>
        </div>

        <div className="bg-blue-600/10 border border-blue-700/30 rounded-xl p-6 my-8">
          <p className="text-blue-300 text-sm font-semibold mb-2">{tr("What I took from the book", "Lo que me llevo del libro")}</p>
          <ul className="text-gray-300 text-sm leading-relaxed space-y-1 list-disc pl-5">
            <li>{tr("You can't predict, but you can know where you are.", "No puedes predecir, pero sí saber dónde estás.")}</li>
            <li>{tr("Adjust your posture to the cycle; don't swing from all in to all out.", "Ajusta la postura al ciclo; no pases de todo dentro a todo fuera.")}</li>
            <li>{tr("Ask what is already in the price, not only whether a business is good.", "Pregunta qué está ya en el precio, no solo si el negocio es bueno.")}</li>
            <li>{tr("Being early can feel exactly like being wrong — plan to survive it.", "Llegar pronto puede sentirse igual que equivocarse — prepárate para aguantarlo.")}</li>
          </ul>
        </div>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">
          <p>
            {tr(
              "The old Toyota, it turns out, is a decent metaphor for the whole book. It isn't fast and it doesn't impress anyone, but it gets me there every day, through every traffic jam. Investing through cycles is a lot like that: the aim is not to win every stretch of road, but to still be driving when the traffic clears.",
              "Al final, el Toyota viejo es una buena metáfora de todo el libro. No es rápido y no impresiona a nadie, pero me lleva cada día, atasco tras atasco. Invertir a través de los ciclos se parece mucho a eso: el objetivo no es ganar cada tramo de carretera, sino seguir conduciendo cuando el tráfico se despeje."
            )}
          </p>
          <p>
            {tr("If you liked this, ", "Si te ha gustado, ")}
            <Link href="/blog/famous-investor-playbooks" className="text-blue-400 hover:text-blue-300">
              {tr("Ten Famous Investors, Ten Ways to Hold a Share", "Diez inversores famosos, diez formas de tener una acción")}
            </Link>
            {tr(" puts Marks next to Buffett, Graham, Lynch and others.", " pone a Marks junto a Buffett, Graham, Lynch y otros.")}
          </p>
        </div>

        <div className="mt-14 bg-[#0d1426] border border-blue-700/40 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">{tr("Take the temperature yourself", "Tómale la temperatura tú mismo")}</h3>
          <p className="text-gray-400 text-sm mb-6">
            {tr(
              "The macro dashboard shows where the US economy stands today — rates, inflation, jobs — from FRED. The stock tools let you look up any share's own price history and ratios. Free, no signup.",
              "El panel macro enseña dónde está hoy la economía de EE. UU. — tipos, inflación, empleo — con datos de la FRED. Las herramientas de acciones te dejan consultar el histórico de precios y los ratios de la acción que tú elijas. Gratis, sin registro."
            )}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/tools/macro-dashboard" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition inline-block">
              {tr("Macro dashboard", "Panel macro")}
            </Link>
            <Link href="/tools/stocks" className="border border-gray-600 hover:border-blue-500 text-gray-200 font-semibold px-6 py-3 rounded-lg transition inline-block">
              {tr("Stock tools", "Herramientas de acciones")}
            </Link>
          </div>
        </div>

        <p className="text-gray-600 text-xs mt-8 text-center">
          {tr(
            "Rolls-Royce prices are weekly closes from Yahoo Finance, adjusted for the 2020 rights issue, used to illustrate an idea with a past episode. Nothing here is a view on any share today, a recommendation or financial advice; past prices say nothing about future returns.",
            "Los precios de Rolls-Royce son cierres semanales de Yahoo Finance, ajustados por la ampliación de 2020, y sirven para ilustrar una idea con un episodio pasado. Nada de esto es una opinión sobre ninguna acción hoy, una recomendación ni asesoramiento financiero; los precios pasados no dicen nada sobre la rentabilidad futura."
          )}
        </p>
      </BlogArticleShell>
    </main>
  );
}
