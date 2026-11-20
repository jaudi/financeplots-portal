import Link from "next/link";
import type { Metadata } from "next";
import BlogArticleShell from "@/components/BlogArticleShell";

const BASE = "https://www.financeplots.com";
const PATH = "/blog/start-business-uk";
const IMAGE = `${BASE}/og-image.png`;

// Everything on this page exists in English and Spanish, metadata included.
// Figures checked in November 2026 for the 2026/27 tax year: Companies House
// fees from 1 February 2026, identity verification (mandatory since
// 18 November 2025), software-only accounts filing from 1 April 2028, HMRC
// and employer rates for 2026/27, ICO fee tiers from February 2025.
const COPY = {
  en: {
    url: `${BASE}${PATH}`,
    title: "How to Start a Business in the UK: A Step-by-Step Guide (2026)",
    description:
      "Courses teach strategy, not what to do on day one. Eight practical steps from idea to trading: sole trader or limited company, Companies House, HMRC, VAT, registering as an employer, business banks, accounting software and the legal obligations most founders miss — with the 2026/27 figures and a deadlines calendar.",
  },
  es: {
    url: `${BASE}/es${PATH}`,
    title: "Cómo montar una empresa en el Reino Unido: guía paso a paso (2026)",
    description:
      "Los cursos enseñan estrategia, no qué hacer el primer día. Ocho pasos prácticos de la idea a facturar: autónomo o sociedad limitada, Companies House, HMRC, IVA, darse de alta como empleador, bancos de empresa, software contable y las obligaciones legales que casi todos olvidan — con las cifras de 2026/27 y un calendario de plazos.",
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

const STEPS: { id: string; en: string; es: string }[] = [
  { id: "structure", en: "Pick a structure", es: "Elige la forma jurídica" },
  { id: "name", en: "Choose a name", es: "Elige el nombre" },
  { id: "register", en: "Register the business", es: "Registra el negocio" },
  { id: "tax", en: "Register for taxes", es: "Alta en impuestos" },
  { id: "bank", en: "Open a business bank", es: "Abre una cuenta de empresa" },
  { id: "software", en: "Set up your books", es: "Monta la contabilidad" },
  { id: "employer", en: "Register as an employer", es: "Alta como empleador" },
  { id: "legal", en: "Cover the legal basics", es: "Cubre lo legal" },
];

function Roadmap({ es }: { es: boolean }) {
  return (
    <nav aria-label={es ? "Los ocho pasos" : "The eight steps"} className="not-prose my-8 grid grid-cols-2 sm:grid-cols-4 gap-2">
      {STEPS.map((s, i) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="group bg-[#0d1426] border border-gray-800 hover:border-blue-500 rounded-lg px-3 py-3 transition"
        >
          <span className="block text-blue-400 text-xs font-bold">{es ? `Paso ${i + 1}` : `Step ${i + 1}`}</span>
          <span className="block text-gray-200 text-sm font-semibold leading-snug group-hover:text-white">{es ? s.es : s.en}</span>
        </a>
      ))}
    </nav>
  );
}

function StepHeading({ n, es }: { n: number; es: boolean }) {
  const s = STEPS[n - 1];
  return (
    <h2 id={s.id} className="scroll-mt-28 flex items-center gap-3 text-2xl font-bold text-white mt-12">
      <span className="shrink-0 w-9 h-9 rounded-full bg-blue-600 text-white text-base flex items-center justify-center">{n}</span>
      {es ? s.es : s.en}
    </h2>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 list-none pl-0">
      {items.map((t, i) => (
        <li key={i} className="flex gap-3 items-start">
          <span className="text-blue-400 shrink-0 mt-0.5">✓</span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function ArticleStartBusinessUK({ params }: Props) {
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
    datePublished: "2026-11-20",
    author: { "@type": "Organization", name: "FinancePlots" },
    publisher: { "@type": "Organization", name: "FinancePlots", logo: { "@type": "ImageObject", url: `${BASE}/logo-sm.png` } },
    mainEntityOfPage: { "@type": "WebPage", "@id": c.url },
  };

  const costs = [
    { v: "£100", en: "Incorporate online at Companies House", es: "Constituir online en Companies House" },
    { v: "£50", en: "Confirmation statement, every year", es: "Confirmation statement, cada año" },
    { v: "£52", en: "ICO data protection fee, most small firms", es: "Tasa de protección de datos del ICO, casi todas las pymes" },
    { v: "£0", en: "Registering with HMRC (tax, VAT, PAYE)", es: "Darse de alta en HMRC (impuestos, IVA, nóminas)" },
  ];

  const deadlines: [string, string, string, string][] = [
    ["Day one", "Incorporate; every director and PSC verifies their identity", "Día uno", "Constituir; cada administrador y PSC verifica su identidad"],
    ["Within 3 months of trading", "Register for Corporation Tax", "En los 3 meses desde que empiezas a operar", "Alta en el Impuesto de Sociedades"],
    ["Before the first payday", "Register as an employer (PAYE)", "Antes de la primera nómina", "Alta como empleador (PAYE)"],
    ["30 days after passing £90,000", "Register for VAT (rolling 12-month turnover)", "30 días después de superar 90.000 £", "Alta en el IVA (facturación de los últimos 12 meses)"],
    ["Every payday / 22nd of next month", "Send the payroll report / pay PAYE and NI", "Cada nómina / día 22 del mes siguiente", "Enviar el informe de nóminas / pagar PAYE y NI"],
    ["Every 12 months", "Confirmation statement (14 days' grace)", "Cada 12 meses", "Confirmation statement (14 días de margen)"],
    ["21 months after incorporation", "First accounts to Companies House — then 9 months after each year end", "21 meses tras la constitución", "Primeras cuentas a Companies House — después, 9 meses tras cada cierre"],
    ["9 months + 1 day after year end", "Pay Corporation Tax", "9 meses y 1 día tras el cierre", "Pagar el Impuesto de Sociedades"],
    ["12 months after year end", "File the company tax return (CT600)", "12 meses tras el cierre", "Presentar la declaración del impuesto (CT600)"],
    ["Sole traders: 5 Oct / 31 Jan", "Register for Self Assessment / file and pay", "Autónomos: 5 oct / 31 ene", "Alta en Self Assessment / presentar y pagar"],
  ];

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-4 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <BlogArticleShell>
        <Link href="/blog" className="text-blue-400 text-sm hover:text-blue-300 transition mb-8 inline-block">
          {tr("← Back to Blog", "← Volver al Blog")}
        </Link>

        <span className="block text-xs font-semibold text-blue-400 uppercase tracking-wider">
          {tr("Small Business Finance", "Finanzas para Pymes")}
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold mt-2 mb-3 leading-tight">
          {tr("How to Start a Business in the UK: A Step-by-Step Guide", "Cómo montar una empresa en el Reino Unido: guía paso a paso")}
        </h1>
        <p className="text-gray-400 text-sm mb-10">{tr("November 2026 · 7 min read", "Noviembre 2026 · 7 min de lectura")}</p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">
          <p>
            {tr(
              "Business courses are good at the big ideas. You learn Porter's five forces, the business model canvas, pricing strategy, how to read a balance sheet and how to pitch to investors. Then you finish the course, decide to start something, and realise nobody told you what to actually do on Monday morning. Which form do you fill in first? Do you need an accountant? When does HMRC want to hear from you? Which bank will open an account for a company that's two days old?",
              "Los cursos de empresa son buenos con las grandes ideas. Aprendes las cinco fuerzas de Porter, el business model canvas, estrategias de precios, a leer un balance y a presentar ante inversores. Luego acabas el curso, decides montar algo y te das cuenta de que nadie te dijo qué hacer exactamente el lunes por la mañana. ¿Qué formulario va primero? ¿Necesitas un contable? ¿Cuándo quiere HMRC saber de ti? ¿Qué banco abre una cuenta a una sociedad con dos días de vida?"
            )}
          </p>
          <p>
            {tr(
              "This guide is the missing practical part: no theory, just the steps, in the order I would do them, with the 2026/27 figures. The good news is that registering a company in the UK is quick and cheap — £100 and usually under a day. What catches people out is everything around it: HMRC, the bank, payroll, pensions, insurance and a calendar of filings that starts the moment the company exists.",
              "Esta guía es la parte práctica que falta: nada de teoría, solo los pasos, en el orden en que yo los daría, con las cifras de 2026/27. La buena noticia es que registrar una sociedad en el Reino Unido es rápido y barato — 100 £ y normalmente menos de un día. Lo que pilla a la gente es todo lo de alrededor: HMRC, el banco, las nóminas, las pensiones, los seguros y un calendario de presentaciones que empieza en cuanto la sociedad existe."
            )}
          </p>
        </div>

        <Roadmap es={es} />

        <div className="not-prose grid grid-cols-2 sm:grid-cols-4 gap-3 my-8">
          {costs.map((k) => (
            <div key={k.v + k.en} className="bg-[#0d1426] border border-blue-700/40 rounded-xl p-4">
              <p className="text-2xl font-bold text-white">{k.v}</p>
              <p className="text-gray-400 text-xs mt-1 leading-snug">{es ? k.es : k.en}</p>
            </div>
          ))}
        </div>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">
          {/* 1 */}
          <StepHeading n={1} es={es} />
          <p>
            {tr(
              "Most people choose between two options. A sole trader is you, trading under your own name: nothing to incorporate, but you are personally liable for every debt. A limited company is a separate legal person: your liability is limited to what you put in (unless you sign a personal guarantee), but there is more paperwork and its details are public.",
              "La mayoría elige entre dos opciones. El sole trader (autónomo) eres tú, operando a tu nombre: no hay que constituir nada, pero respondes personalmente de todas las deudas. La limited company (sociedad limitada) es una persona jurídica distinta: tu responsabilidad se limita a lo que aportas (salvo que firmes un aval personal), pero hay más papeleo y sus datos son públicos."
            )}
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-700 text-left">
                  <th className="py-3 pr-4 text-gray-400 font-medium"></th>
                  <th className="py-3 pr-4 text-gray-200 font-semibold">{tr("Sole trader", "Autónomo")}</th>
                  <th className="py-3 text-blue-300 font-semibold">{tr("Limited company", "Sociedad limitada")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-300">
                {[
                  [tr("Set-up", "Alta"), tr("Free, with HMRC", "Gratis, en HMRC"), tr("£100 at Companies House", "100 £ en Companies House")],
                  [tr("Liability", "Responsabilidad"), tr("Unlimited — your house is at risk", "Ilimitada — tu casa está en juego"), tr("Limited to your shares", "Limitada a tus participaciones")],
                  [tr("Tax on profit", "Impuesto sobre el beneficio"), tr("Income tax 20–45% + Class 4 NI 6%/2%", "IRPF 20–45% + NI clase 4 6%/2%"), tr("Corporation tax 19–25%, then dividend tax 10.75–39.35%", "Sociedades 19–25%, y luego dividendos 10,75–39,35%")],
                  [tr("Paperwork", "Papeleo"), tr("One tax return a year", "Una declaración al año"), tr("Accounts, confirmation statement, CT600, payroll", "Cuentas, confirmation statement, CT600, nóminas")],
                  [tr("Privacy", "Privacidad"), tr("Nothing public", "Nada público"), tr("Directors, owners and accounts on the public register", "Administradores, socios y cuentas en el registro público")],
                ].map((r) => (
                  <tr key={r[0]}>
                    <td className="py-3 pr-4 text-gray-400">{r[0]}</td>
                    <td className="py-3 pr-4">{r[1]}</td>
                    <td className="py-3">{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            {tr(
              "Rule of thumb: start as a sole trader to test an idea with low risk; incorporate once profits are steady (roughly £40–50k and up, where the tax mix starts to favour a company), when you take on real liabilities, or when clients and investors expect a Ltd. Partnerships and LLPs exist too, mainly for professional firms.",
              "Regla práctica: empieza como autónomo para probar una idea con poco riesgo; constituye la sociedad cuando el beneficio sea estable (a partir de unas 40–50 mil £, donde la fiscalidad empieza a favorecerla), cuando asumas riesgos reales o cuando clientes e inversores esperen una Ltd. También existen las partnerships y las LLP, sobre todo para despachos profesionales."
            )}
          </p>

          {/* 2 */}
          <StepHeading n={2} es={es} />
          <Checklist
            items={[
              tr("Check the name is free on the Companies House register — and not “too like” an existing one.", "Comprueba en el registro de Companies House que el nombre está libre — y que no se parece demasiado a otro."),
              tr("Search the UK trade mark register (IPO). A free company name does not mean a free brand.", "Busca en el registro de marcas del Reino Unido (IPO). Que el nombre de sociedad esté libre no significa que la marca lo esté."),
              tr("Buy the domain and social handles the same day.", "Compra el dominio y los perfiles en redes el mismo día."),
              tr("Words like “Bank”, “Royal” or “Chartered” need approval; the name must end in Limited or Ltd.", "Palabras como «Bank», «Royal» o «Chartered» necesitan autorización; el nombre debe acabar en Limited o Ltd."),
            ]}
          />

          {/* 3 */}
          <StepHeading n={3} es={es} />
          <p>
            <strong className="text-white">{tr("Limited company.", "Sociedad limitada.")}</strong>{" "}
            {tr(
              "Incorporate online at Companies House for £100 (since 1 February 2026); it usually takes under 24 hours. Since November 2025 every director and every person with significant control (PSC) must verify their identity first — through GOV.UK One Login or an authorised agent — and quote their personal code. You will need:",
              "Constituye online en Companies House por 100 £ (desde el 1 de febrero de 2026); suele tardar menos de 24 horas. Desde noviembre de 2025 todo administrador y toda persona con control significativo (PSC) debe verificar antes su identidad — con GOV.UK One Login o un agente autorizado — e indicar su código personal. Necesitarás:"
            )}
          </p>
          <Checklist
            items={[
              tr("A registered office address in the UK — a real address, not a PO box. It becomes public.", "Un domicilio social en el Reino Unido — una dirección real, no un apartado de correos. Será público."),
              tr("A registered email address (kept private) for Companies House to contact you.", "Un correo electrónico registrado (no es público) para que Companies House contacte contigo."),
              tr("At least one director aged 16+, the shareholders and share capital (one £1 share is fine).", "Al menos un administrador de 16 años o más, los socios y el capital (una participación de 1 £ basta)."),
              tr("A SIC code describing the activity, and model articles of association (the default works for most).", "Un código SIC que describa la actividad y los estatutos tipo (los de por defecto sirven para casi todos)."),
              tr("A statement that the company is being formed for a lawful purpose.", "Una declaración de que la sociedad se constituye con un fin lícito."),
            ]}
          />
          <p>
            <strong className="text-white">{tr("Sole trader.", "Autónomo.")}</strong>{" "}
            {tr(
              "Nothing to incorporate. Register for Self Assessment with HMRC by 5 October after the end of the tax year you started in (the first £1,000 of trading income is covered by the trading allowance). From April 2026, Making Tax Digital for Income Tax applies if your self-employed and property income is over £50,000, falling to £30,000 in 2027 and £20,000 in 2028: quarterly updates from software.",
              "No hay que constituir nada. Date de alta en Self Assessment en HMRC antes del 5 de octubre siguiente al final del año fiscal en que empezaste (las primeras 1.000 £ de ingresos están cubiertas por el trading allowance). Desde abril de 2026, Making Tax Digital para el IRPF se aplica si tus ingresos como autónomo y por alquileres superan 50.000 £, y baja a 30.000 £ en 2027 y 20.000 £ en 2028: informes trimestrales desde un software."
            )}
          </p>

          {/* 4 */}
          <StepHeading n={4} es={es} />
          <Checklist
            items={[
              tr("Corporation Tax: HMRC posts the company's tax reference (UTR) after incorporation. Register for Corporation Tax within 3 months of starting to trade — buying, selling, advertising or hiring all count.", "Impuesto de Sociedades: HMRC envía por correo la referencia fiscal (UTR) tras la constitución. Date de alta en el impuesto en los 3 meses desde que empieces a operar — comprar, vender, anunciarte o contratar cuentan."),
              tr("Rates for 2026/27: 19% on profits up to £50,000, 25% above £250,000, with marginal relief in between.", "Tipos 2026/27: 19% sobre beneficios de hasta 50.000 £, 25% por encima de 250.000 £, con una reducción gradual entre ambos."),
              tr("VAT: registration is compulsory once taxable turnover over the last 12 months passes £90,000 (or you expect to pass it in the next 30 days alone). You can register voluntarily below that to reclaim VAT on costs — useful if your customers are VAT-registered businesses.", "IVA: el alta es obligatoria cuando la facturación sujeta de los últimos 12 meses supera 90.000 £ (o prevés superarla solo en los próximos 30 días). Por debajo puedes darte de alta voluntariamente para recuperar el IVA soportado — útil si tus clientes son empresas con IVA."),
              tr("VAT returns are quarterly and must be filed through Making Tax Digital-compatible software.", "Las declaraciones de IVA son trimestrales y se presentan con un software compatible con Making Tax Digital."),
            ]}
          />

          {/* 5 */}
          <StepHeading n={5} es={es} />
          <p>
            {tr(
              "A company's money is not your money, so it needs its own account — mixing the two is how director's loan problems start. Sole traders aren't legally required to have one, but it makes the bookkeeping far easier. Expect to show the certificate of incorporation, ID and address for each director and PSC, and sometimes a short plan or forecast.",
              "El dinero de la sociedad no es tu dinero, así que necesita su propia cuenta — mezclar ambos es como empiezan los problemas con el préstamo del administrador. Los autónomos no están obligados, pero facilita mucho la contabilidad. Te pedirán el certificado de constitución, identificación y domicilio de cada administrador y PSC, y a veces un breve plan o previsión."
            )}
          </p>
          <p>
            {tr(
              "The choice is between high-street banks (Barclays, HSBC, Lloyds, NatWest, Santander) and app-based accounts (Starling, Tide, Monzo Business, Mettle, Revolut Business and others). Compare on what you will actually use:",
              "La elección está entre los bancos tradicionales (Barclays, HSBC, Lloyds, NatWest, Santander) y las cuentas en app (Starling, Tide, Monzo Business, Mettle, Revolut Business y otras). Compáralas por lo que de verdad vas a usar:"
            )}
          </p>
          <Checklist
            items={[
              tr("Monthly fee and per-transaction charges once any free period ends.", "Cuota mensual y comisiones por operación cuando acabe el periodo gratuito."),
              tr("Whether deposits are FSCS-protected — some app accounts are e-money accounts that aren't.", "Si los depósitos están cubiertos por el FSCS — algunas cuentas en app son de dinero electrónico y no lo están."),
              tr("Cash deposits (Post Office), card payments, foreign currency and a direct feed into your accounting software.", "Ingresos en efectivo (Post Office), cobros con tarjeta, divisas y conexión directa con tu software contable."),
            ]}
          />

          {/* 6 */}
          <StepHeading n={6} es={es} />
          <p>
            {tr(
              "Choose software on day one, not at year end. HMRC's Making Tax Digital means VAT returns — and soon most sole traders' income tax — must come from compatible software, and from 1 April 2028 every company's accounts must be filed at Companies House through software too. A typical small-business stack:",
              "Elige el software el primer día, no al cierre. Con Making Tax Digital de HMRC las declaraciones de IVA — y pronto el IRPF de casi todos los autónomos — deben salir de un software compatible, y desde el 1 de abril de 2028 todas las sociedades presentarán sus cuentas en Companies House también por software. Un equipo típico para una pyme:"
            )}
          </p>
          <div className="not-prose grid sm:grid-cols-2 gap-3">
            {[
              [tr("Bookkeeping", "Contabilidad"), tr("Xero, QuickBooks, FreeAgent, Sage, Zoho Books. FreeAgent is free with some business bank accounts.", "Xero, QuickBooks, FreeAgent, Sage, Zoho Books. FreeAgent sale gratis con algunas cuentas de empresa.")],
              [tr("Payroll", "Nóminas"), tr("HMRC's Basic PAYE Tools is free for under 10 employees; most accounting packages add payroll.", "Basic PAYE Tools de HMRC es gratis con menos de 10 empleados; casi todos los programas contables añaden nóminas.")],
              [tr("Pension", "Pensiones"), tr("NEST is the government-backed scheme and has no charge for employers.", "NEST es el plan respaldado por el Gobierno y no cobra nada al empleador.")],
              [tr("Receipts and planning", "Tickets y planificación"), tr("Receipt capture (Dext, Hubdoc) and a cash-flow forecast you update monthly.", "Captura de tickets (Dext, Hubdoc) y una previsión de tesorería que actualices cada mes.")],
            ].map(([h, t]) => (
              <div key={h} className="bg-[#0d1426] border border-gray-800 rounded-xl p-4">
                <p className="text-white font-semibold text-sm mb-1">{h}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{t}</p>
              </div>
            ))}
          </div>
          <p>
            {tr("New to debits and credits? Our ", "¿Nuevo en el debe y el haber? Nuestro ")}
            <Link href="/tools/bookkeeping" className="text-blue-400 hover:text-blue-300">{tr("Bookkeeping Playground", "Bookkeeping Playground")}</Link>
            {tr(" teaches double entry in ten minutes.", " enseña la partida doble en diez minutos.")}
          </p>

          {/* 7 */}
          <StepHeading n={7} es={es} />
          <p>
            {tr(
              "You must register as an employer with HMRC before the first payday — including when the only person paid is you, as a director, above the lower earnings limit. It can take up to 5 working days to get your PAYE reference, and you can't register more than 2 months before you start paying people. Then:",
              "Tienes que darte de alta como empleador en HMRC antes de la primera nómina — también si la única persona que cobra eres tú, como administrador, por encima del límite inferior. La referencia PAYE puede tardar hasta 5 días hábiles, y no puedes darte de alta más de 2 meses antes de empezar a pagar. Después:"
            )}
          </p>
          <Checklist
            items={[
              tr("Run payroll through Real Time Information: send a Full Payment Submission on or before each payday, and pay PAYE and NI by the 22nd of the next month.", "Lleva las nóminas por Real Time Information: envía un Full Payment Submission en o antes de cada pago, y paga PAYE y NI antes del día 22 del mes siguiente."),
              tr("Employer NI is 15% on pay above £5,000 a year. The Employment Allowance takes up to £10,500 off the bill — but not if a director is your only employee.", "La NI del empleador es del 15% sobre el salario por encima de 5.000 £ al año. El Employment Allowance descuenta hasta 10.500 £ — pero no si un administrador es tu único empleado."),
              tr("Pay at least the National Living Wage: £12.71 an hour for 21 and over from April 2026.", "Paga al menos el National Living Wage: 12,71 £ la hora para mayores de 21 desde abril de 2026."),
              tr("Check every worker's right to work in the UK before they start, and give a written statement of terms on day one.", "Comprueba el derecho a trabajar en el Reino Unido de cada persona antes de que empiece, y entrega el contrato por escrito el primer día."),
              tr("Pensions auto-enrolment: enrol staff aged 22 to State Pension age earning over £10,000 (8% minimum, at least 3% from you) and declare compliance to The Pensions Regulator within 5 months.", "Auto-enrolment de pensiones: inscribe a quien tenga entre 22 años y la edad de jubilación y gane más de 10.000 £ (8% mínimo, al menos 3% a tu cargo) y declara el cumplimiento a The Pensions Regulator en 5 meses."),
              tr("Employers' liability insurance of at least £5 million from the first employee — fines run up to £2,500 for every day without it.", "Seguro de responsabilidad del empleador de al menos 5 millones £ desde el primer empleado — las multas llegan a 2.500 £ por cada día sin él."),
            ]}
          />
          <p className="text-sm text-gray-400">
            {tr(
              "A company whose only worker is a single director with no contract of employment has no auto-enrolment duty and doesn't need employers' liability cover. The Employment Rights Act 2025 is changing employer duties in stages through 2027 — ACAS keeps the current list.",
              "Una sociedad cuyo único trabajador es un administrador sin contrato laboral no tiene obligación de auto-enrolment ni necesita el seguro del empleador. La Employment Rights Act 2025 está cambiando las obligaciones del empleador por fases hasta 2027 — ACAS mantiene la lista al día."
            )}
          </p>
          <p>
            {tr("Working out what to pay yourself? The ", "¿Calculando cuánto pagarte? La calculadora de ")}
            <Link href="/tools/take-home-pay" className="text-blue-400 hover:text-blue-300">{tr("take-home pay calculator", "salario neto")}</Link>
            {tr(" shows tax, NI and pension on any salary.", " muestra impuestos, NI y pensión para cualquier sueldo.")}
          </p>

          {/* 8 */}
          <StepHeading n={8} es={es} />
          <Checklist
            items={[
              tr("ICO data protection fee: almost every business that holds customer or staff data on a computer pays it — £52 a year for micro firms (£47 by Direct Debit).", "Tasa de protección de datos del ICO: casi todo negocio que guarda datos de clientes o empleados en un ordenador la paga — 52 £ al año para microempresas (47 £ por domiciliación)."),
              tr("Trading disclosures: show the company's registered name, number, place of registration and registered office on your website, emails, letters and invoices.", "Datos obligatorios: muestra el nombre registrado, el número, el lugar de registro y el domicilio social en la web, correos, cartas y facturas."),
              tr("Statutory registers: members, directors and PSCs, kept at the registered office or on the public register — and update Companies House within 14 days of changes.", "Libros obligatorios: socios, administradores y PSC, en el domicilio social o en el registro público — y comunica los cambios a Companies House en 14 días."),
              tr("Insurance: public liability if you meet customers, professional indemnity if you give advice; some contracts require both.", "Seguros: responsabilidad civil si tratas con clientes, responsabilidad profesional si asesoras; algunos contratos piden ambos."),
              tr("Licences and premises: food, alcohol, street trading, childcare and financial services need permission; premises bring business rates (small business rates relief can cut them to zero).", "Licencias y locales: comida, alcohol, venta en la calle, cuidado infantil y servicios financieros necesitan autorización; los locales pagan business rates (la reducción para pequeños negocios puede dejarlos en cero)."),
              tr("Directors' duties: act within the company's powers, promote its success, avoid conflicts of interest and keep proper records — personal liability follows if you trade while insolvent.", "Deberes del administrador: actuar dentro de las facultades de la sociedad, buscar su éxito, evitar conflictos de interés y llevar registros adecuados — si sigues operando en insolvencia, respondes personalmente."),
            ]}
          />
        </div>

        <h2 className="text-2xl font-bold text-white mt-14 mb-2">{tr("The calendar that starts on day one", "El calendario que empieza el primer día")}</h2>
        <p className="text-gray-400 text-sm mb-4">
          {tr("Miss these and penalties are automatic. Put them in your diary the day you incorporate.", "Si te los saltas, las multas son automáticas. Apúntalos el día que constituyas la sociedad.")}
        </p>
        <div className="overflow-x-auto bg-[#0d1426] border border-gray-800 rounded-xl">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="py-3 px-4 text-gray-400 font-medium">{tr("When", "Cuándo")}</th>
                <th className="py-3 px-4 text-gray-400 font-medium">{tr("What", "Qué")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {deadlines.map((d) => (
                <tr key={d[0]}>
                  <td className="py-3 px-4 text-blue-300 font-semibold align-top w-2/5">{es ? d[2] : d[0]}</td>
                  <td className="py-3 px-4 text-gray-300">{es ? d[3] : d[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-blue-600/10 border border-blue-700/30 rounded-xl p-6 my-10">
          <p className="text-blue-300 text-sm font-semibold mb-2">{tr("The short version", "La versión corta")}</p>
          <ul className="text-gray-300 text-sm leading-relaxed space-y-1 list-disc pl-5">
            <li>{tr("Test as a sole trader; incorporate when profits and risk justify it.", "Prueba como autónomo; constituye la sociedad cuando el beneficio y el riesgo lo justifiquen.")}</li>
            <li>{tr("Verify your identity, then incorporate for £100 — the easy part.", "Verifica tu identidad y constituye por 100 £ — lo fácil.")}</li>
            <li>{tr("Separate bank account and accounting software from day one.", "Cuenta bancaria propia y software contable desde el primer día.")}</li>
            <li>{tr("Register for PAYE before anyone is paid, including you.", "Alta en PAYE antes de pagar a nadie, tú incluido.")}</li>
            <li>{tr("Diary every deadline the day the company is born.", "Apunta cada plazo el día que nace la sociedad.")}</li>
          </ul>
        </div>

        <div className="mt-14 bg-[#0d1426] border border-blue-700/40 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">{tr("Plan the numbers before you register", "Planifica los números antes de registrarte")}</h3>
          <p className="text-gray-400 text-sm mb-6">
            {tr(
              "Find your break-even point, build a 13-week cash-flow forecast and a first-year budget — free, no signup.",
              "Calcula tu punto de equilibrio, monta una previsión de tesorería a 13 semanas y un presupuesto del primer año — gratis, sin registro."
            )}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/tools/break-even" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition inline-block">
              {tr("Break-even", "Punto de equilibrio")}
            </Link>
            <Link href="/tools/cash-flow" className="border border-gray-600 hover:border-blue-500 text-gray-200 font-semibold px-6 py-3 rounded-lg transition inline-block">
              {tr("Cash-flow forecast", "Previsión de tesorería")}
            </Link>
            <Link href="/tools/annual-budget" className="border border-gray-600 hover:border-blue-500 text-gray-200 font-semibold px-6 py-3 rounded-lg transition inline-block">
              {tr("Annual budget", "Presupuesto anual")}
            </Link>
          </div>
        </div>

        <p className="text-gray-600 text-xs mt-8 text-center">
          {tr(
            "Figures are for the 2026/27 tax year and Companies House fees in force from 1 February 2026, checked in November 2026. Banks and software are named as examples, not recommendations. This is general information, not legal, tax or financial advice — rules change, so check GOV.UK or speak to an accountant before you act.",
            "Las cifras corresponden al año fiscal 2026/27 y a las tasas de Companies House vigentes desde el 1 de febrero de 2026, revisadas en noviembre de 2026. Los bancos y programas se citan como ejemplos, no como recomendaciones. Esto es información general, no asesoramiento legal, fiscal ni financiero — las normas cambian, así que consulta GOV.UK o a un contable antes de actuar."
          )}
        </p>
      </BlogArticleShell>
    </main>
  );
}
