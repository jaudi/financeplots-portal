import Link from "next/link";
import type { Metadata } from "next";
import ShareButtons from "@/components/ShareButtons";
import BlogArticleShell from "@/components/BlogArticleShell";

export const metadata: Metadata = {
  title: "The Most Important IFRS and IAS Standards Every Finance Professional Should Know | FinancePlots",
  description: "A plain-English guide to the IFRS and IAS standards that drive the numbers in real financial statements — IFRS 9, 15, 16, IAS 1, 36, 37 and the rest of the standards that matter in practice.",
  openGraph: {
    title: "The Most Important IFRS and IAS Standards Every Finance Professional Should Know",
    description: "A plain-English guide to the IFRS and IAS standards that drive the numbers in real financial statements — IFRS 9, 15, 16, IAS 1, 36, 37 and the rest of the standards that matter in practice.",
    url: "https://www.financeplots.com/blog/ifrs-ias-standards-guide",
    siteName: "FinancePlots",
    type: "article",
    images: [{ url: "https://www.financeplots.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Most Important IFRS and IAS Standards Every Finance Professional Should Know",
    description: "A plain-English guide to the IFRS and IAS standards that drive the numbers in real financial statements.",
    images: ["https://www.financeplots.com/og-image.png"],
  },
  alternates: {
    canonical: "https://www.financeplots.com/blog/ifrs-ias-standards-guide",
  },
};

type Props = { params: Promise<{ locale: string }> };

export default async function ArticleIfrsIasStandards({ params }: Props) {
  const { locale } = await params;
  const es = locale === "es";

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: "{\"@context\":\"https://schema.org\",\"@type\":\"Article\",\"headline\":\"The Most Important IFRS and IAS Standards Every Finance Professional Should Know\",\"description\":\"A plain-English guide to the IFRS and IAS standards that drive the numbers in real financial statements — IFRS 9, 15, 16, IAS 1, 36, 37 and the rest of the standards that matter in practice.\",\"url\":\"https://www.financeplots.com/blog/ifrs-ias-standards-guide\",\"image\":\"https://www.financeplots.com/og-image.png\",\"author\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\"},\"publisher\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\",\"logo\":{\"@type\":\"ImageObject\",\"url\":\"https://www.financeplots.com/logo-sm.png\"}},\"mainEntityOfPage\":{\"@type\":\"WebPage\",\"@id\":\"https://www.financeplots.com/blog/ifrs-ias-standards-guide\"}}" }} />
      <BlogArticleShell>

        <Link href="/blog" className="text-blue-400 text-sm hover:text-blue-300 transition mb-8 inline-block">
          {es ? "← Volver al Blog" : "← Back to Blog"}
        </Link>

        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
          {es ? "Finanzas Corporativas" : "Corporate Finance"}
        </span>
        <h1 className="text-4xl font-bold mt-2 mb-3 leading-tight">
          {es
            ? "Las Normas IFRS e IAS Más Importantes que Todo Profesional de Finanzas Debe Conocer"
            : "The Most Important IFRS and IAS Standards Every Finance Professional Should Know"}
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          {es ? "Mayo 2026 · 10 min de lectura" : "May 2026 · 10 min read"}
        </p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">

          <p>
            {es
              ? "Si trabajas en finanzas, contabilidad, auditoría o análisis de inversiones, las normas IFRS e IAS son las reglas del juego. Definen cuándo se reconocen los ingresos, cómo se mide un activo, qué pasivos se registran y qué se revela en la memoria. No son trivia académica: son lo que está detrás de cada número en una cuenta auditada."
              : "If you work in finance, accounting, audit or investment analysis, IFRS and IAS are the rules of the game. They define when revenue is recognised, how an asset is measured, which liabilities are recorded, and what gets disclosed in the notes. They are not academic trivia — they are what sits behind every number in a set of audited accounts."}
          </p>
          <p>
            {es
              ? "Esta guía cubre las normas que, en la práctica, mueven los estados financieros de la mayoría de las empresas no financieras. Está pensada para refrescar conceptos o para construir un mapa mental si vienes de un entorno diferente."
              : "This guide covers the standards that, in practice, move the financial statements of most non-financial businesses. It is meant as a refresher, or a mental map if you are coming in from a different background."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "IFRS vs IAS: ¿Cuál Es la Diferencia?" : "IFRS vs IAS: What Is the Difference?"}
          </h2>
          <p>
            {es
              ? "Las IAS (International Accounting Standards) son las normas emitidas por el antiguo IASC entre 1973 y 2001. Las IFRS (International Financial Reporting Standards) son las normas emitidas por el IASB desde 2001 en adelante. Ambas son obligatorias bajo el marco IFRS: cuando una IFRS sustituye a una IAS, esta última se deroga; las IAS que siguen vigentes (como IAS 1, IAS 16, IAS 36) son tan obligatorias como cualquier IFRS."
              : "IAS (International Accounting Standards) are the standards issued by the old IASC between 1973 and 2001. IFRS (International Financial Reporting Standards) are the standards issued by the IASB from 2001 onwards. Both are mandatory under the IFRS framework: when an IFRS replaces an IAS, the older one is withdrawn; the IAS standards still in force (such as IAS 1, IAS 16, IAS 36) are just as binding as any IFRS."}
          </p>
          <p>
            {es
              ? "Más de 140 jurisdicciones exigen o permiten IFRS. Estados Unidos sigue utilizando US GAAP, pero los conceptos se solapan en gran medida."
              : "Over 140 jurisdictions either require or permit IFRS. The United States still uses US GAAP, but the underlying concepts overlap heavily."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "IAS 1 — Presentación de Estados Financieros" : "IAS 1 — Presentation of Financial Statements"}
          </h2>
          <p>
            {es
              ? "El punto de partida. IAS 1 define qué es un conjunto completo de estados financieros: balance, cuenta de resultados, estado de cambios en el patrimonio neto, estado de flujos de efectivo y notas. Establece los principios fundamentales: empresa en funcionamiento (going concern), devengo, materialidad, compensación, frecuencia, comparabilidad."
              : "The starting point. IAS 1 defines what a complete set of financial statements looks like: balance sheet, income statement, statement of changes in equity, statement of cash flows and notes. It sets the fundamental principles: going concern, accrual basis, materiality, offsetting, frequency, comparability."}
          </p>
          <p>
            {es
              ? "Si alguna vez te has preguntado por qué los pasivos corrientes y no corrientes se separan, o por qué las partidas excepcionales se presentan donde se presentan, la respuesta está aquí."
              : "If you have ever wondered why current and non-current liabilities are split, or why exceptional items are presented where they are, the answer is here."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "IAS 7 — Estado de Flujos de Efectivo" : "IAS 7 — Statement of Cash Flows"}
          </h2>
          <p>
            {es
              ? "Define la estructura del estado de flujos en tres bloques: actividades de explotación, de inversión y de financiación. Permite el método directo o indirecto (en la práctica casi todo el mundo usa el indirecto). Es la norma que conecta el beneficio contable con la caja real."
              : "Defines the structure of the cash flow statement in three blocks: operating, investing and financing activities. Permits direct or indirect method (in practice almost everyone uses indirect). It is the standard that links accounting profit to actual cash."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "IAS 2 — Existencias" : "IAS 2 — Inventories"}
          </h2>
          <p>
            {es
              ? "Las existencias se valoran al menor entre coste y valor neto realizable. El coste incluye compra, transformación y otros costes necesarios para llevar las existencias a su ubicación y condición actual. Se permiten FIFO y coste medio ponderado; LIFO está prohibido bajo IFRS (una diferencia clásica con US GAAP)."
              : "Inventories are measured at the lower of cost and net realisable value. Cost includes purchase, conversion and other costs incurred in bringing the inventories to their present location and condition. FIFO and weighted average are permitted; LIFO is prohibited under IFRS (a classic difference vs US GAAP)."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "IAS 16 — Inmovilizado Material" : "IAS 16 — Property, Plant and Equipment"}
          </h2>
          <p>
            {es
              ? "Cubre el reconocimiento, medición inicial y posterior, depreciación y baja de activos fijos tangibles. Dos modelos posteriores al reconocimiento inicial: coste o revalorización. La depreciación debe reflejar el patrón de consumo del beneficio económico — vida útil, valor residual y método se revisan anualmente."
              : "Covers the recognition, initial and subsequent measurement, depreciation and derecognition of tangible fixed assets. Two post-recognition models: cost or revaluation. Depreciation should reflect the pattern in which the asset's economic benefits are consumed — useful life, residual value and method are reviewed annually."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "IAS 38 — Activos Intangibles" : "IAS 38 — Intangible Assets"}
          </h2>
          <p>
            {es
              ? "Para reconocer un intangible se necesitan tres cosas: identificabilidad, control y beneficios económicos futuros probables. El gasto en I+D se trata de forma asimétrica: la investigación se gasta; el desarrollo se capitaliza si se cumplen seis criterios. El fondo de comercio interno nunca se capitaliza."
              : "To recognise an intangible you need three things: identifiability, control and probable future economic benefits. R&D spend is treated asymmetrically: research is expensed; development is capitalised if six criteria are met. Internally generated goodwill is never capitalised."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "IAS 36 — Deterioro de Activos" : "IAS 36 — Impairment of Assets"}
          </h2>
          <p>
            {es
              ? "Una de las normas más relevantes a nivel macro porque condiciona cuándo aparecen los grandes deterioros (write-downs) que arruinan trimestres. Un activo está deteriorado cuando su valor en libros excede su importe recuperable (el mayor entre valor razonable menos costes de venta y valor en uso). El fondo de comercio y los intangibles con vida indefinida se testean anualmente; el resto solo si hay indicios."
              : "One of the most consequential standards at a macro level because it determines when big impairments hit and ruin a quarter. An asset is impaired when its carrying amount exceeds its recoverable amount (the higher of fair value less costs of disposal and value in use). Goodwill and indefinite-life intangibles are tested annually; everything else only when there are indicators."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "IAS 37 — Provisiones, Pasivos y Activos Contingentes" : "IAS 37 — Provisions, Contingent Liabilities and Contingent Assets"}
          </h2>
          <p>
            {es
              ? "Una provisión solo se reconoce cuando existe una obligación presente (legal o implícita) por un suceso pasado, es probable una salida de recursos y el importe puede estimarse de forma fiable. Los pasivos contingentes solo se revelan en notas. Es la norma que rige garantías, litigios, restructuraciones y desmantelamientos."
              : "A provision is only recognised when there is a present obligation (legal or constructive) as a result of a past event, an outflow is probable, and the amount can be reliably estimated. Contingent liabilities are only disclosed in the notes. This is the standard governing warranties, litigation, restructurings and decommissioning."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "IAS 12 — Impuesto sobre las Ganancias" : "IAS 12 — Income Taxes"}
          </h2>
          <p>
            {es
              ? "Cubre tanto el impuesto corriente como el diferido. El impuesto diferido surge de diferencias temporales entre el valor contable y la base fiscal de activos y pasivos. Las pérdidas fiscales acumuladas pueden generar activos por impuesto diferido — pero solo si es probable que existan beneficios futuros contra los que aplicarlas. Esta última condición es donde se concentra el juicio profesional."
              : "Covers both current and deferred tax. Deferred tax arises from temporary differences between the carrying amount and the tax base of assets and liabilities. Carried-forward tax losses can generate deferred tax assets — but only if it is probable that future profits will exist against which they can be utilised. That last condition is where most of the judgement lives."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "IAS 19 — Retribuciones a los Empleados" : "IAS 19 — Employee Benefits"}
          </h2>
          <p>
            {es
              ? "La norma de pensiones. Distingue entre planes de aportación definida (riesgo del empleado) y planes de prestación definida (riesgo del empleador, que pueden generar pasivos enormes en el balance). En empresas británicas y europeas con esquemas DB heredados, esta norma puede mover cientos de millones de libras por cambios en los tipos de descuento."
              : "The pensions standard. Distinguishes between defined contribution plans (employee bears the risk) and defined benefit plans (employer bears the risk, which can create enormous balance sheet liabilities). At UK and European companies with legacy DB schemes, this standard can move hundreds of millions of pounds on changes in the discount rate alone."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "IAS 21 — Efectos de las Variaciones en los Tipos de Cambio" : "IAS 21 — The Effects of Changes in Foreign Exchange Rates"}
          </h2>
          <p>
            {es
              ? "Define la moneda funcional, la moneda de presentación y cómo se traducen las transacciones y los estados financieros de filiales extranjeras. Las diferencias de cambio de partidas monetarias van a P&L; las diferencias por consolidación de filiales extranjeras van a otro resultado integral (OCI)."
              : "Defines functional currency, presentation currency, and how transactions and the financial statements of foreign subsidiaries are translated. Exchange differences on monetary items go to P&L; differences from translating foreign subsidiaries go to OCI (other comprehensive income)."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "IFRS 15 — Ingresos de Contratos con Clientes" : "IFRS 15 — Revenue from Contracts with Customers"}
          </h2>
          <p>
            {es
              ? "El cambio más importante de la última década en reconocimiento de ingresos. Introdujo un modelo de cinco pasos:"
              : "The single biggest revenue recognition change of the past decade. It introduced a five-step model:"}
          </p>
          <ul className="space-y-2 list-none pl-0">
            {es
              ? [
                  "Identificar el contrato con el cliente",
                  "Identificar las obligaciones de desempeño separadas",
                  "Determinar el precio de la transacción",
                  "Asignar el precio a cada obligación de desempeño",
                  "Reconocer el ingreso cuando (o a medida que) se satisface cada obligación",
                ].map((item, i) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">{i + 1}.</span>{item}</li>
                ))
              : [
                  "Identify the contract with the customer",
                  "Identify the separate performance obligations",
                  "Determine the transaction price",
                  "Allocate the transaction price to each performance obligation",
                  "Recognise revenue when (or as) each obligation is satisfied",
                ].map((item, i) => (
                  <li key={item} className="flex gap-2"><span className="text-blue-400">{i + 1}.</span>{item}</li>
                ))}
          </ul>
          <p>
            {es
              ? "Afecta especialmente a software, telecomunicaciones, construcción, ingeniería y cualquier modelo con suscripciones o contratos plurianuales."
              : "It particularly affects software, telecoms, construction, engineering and any business with subscription or multi-year contract models."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "IFRS 16 — Arrendamientos" : "IFRS 16 — Leases"}
          </h2>
          <p>
            {es
              ? "El otro gran cambio reciente. Acabó con la distinción entre arrendamiento operativo y financiero para el arrendatario: hoy casi todos los contratos de alquiler se reconocen en el balance como un derecho de uso (activo) y un pasivo por arrendamiento. Esto infló los balances de retailers, aerolíneas y cualquier empresa con muchas tiendas u oficinas alquiladas."
              : "The other big recent change. It killed the operating vs finance lease distinction for the lessee: today almost all rental contracts are recognised on the balance sheet as a right-of-use asset and a lease liability. This inflated the balance sheets of retailers, airlines and anyone with a lot of rented shops or offices."}
          </p>
          <p>
            {es
              ? "También distorsionó comparativas: el EBITDA suele crecer (los gastos por alquiler ya no están dentro), mientras que la deuda neta y los activos suben. Hay que tenerlo en cuenta al comparar empresas a través del cambio (pre-2019 vs post-2019)."
              : "It also distorted comparatives: EBITDA tends to rise (rent expense moves out), while net debt and assets go up. Worth bearing in mind when comparing companies across the transition (pre-2019 vs post-2019)."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "IFRS 9 — Instrumentos Financieros" : "IFRS 9 — Financial Instruments"}
          </h2>
          <p>
            {es
              ? "Sustituyó a IAS 39. Tres bloques principales: clasificación y medición de activos financieros (coste amortizado, FVOCI, FVTPL), deterioro mediante un modelo de pérdida crediticia esperada (ECL) y contabilidad de coberturas. Para bancos, IFRS 9 es la norma que más mueve el resultado anual: el modelo ECL obliga a provisionar pérdidas esperadas antes de que se produzcan."
              : "Replaced IAS 39. Three main blocks: classification and measurement of financial assets (amortised cost, FVOCI, FVTPL), impairment via an expected credit loss (ECL) model, and hedge accounting. For banks, IFRS 9 is the standard that moves the bottom line most: the ECL model forces provisioning for expected losses before they happen."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "IFRS 3 — Combinaciones de Negocios e IFRS 10 — Estados Financieros Consolidados" : "IFRS 3 — Business Combinations and IFRS 10 — Consolidated Financial Statements"}
          </h2>
          <p>
            {es
              ? "Las dos normas que rigen las adquisiciones y la consolidación. IFRS 3 obliga a aplicar el método de adquisición: los activos y pasivos adquiridos se reconocen a valor razonable, y el exceso del precio pagado sobre el valor razonable de los activos netos es fondo de comercio (goodwill). IFRS 10 define el control: poder, exposición a rendimientos variables y capacidad de afectar esos rendimientos."
              : "The two standards governing acquisitions and consolidation. IFRS 3 mandates the acquisition method: acquired assets and liabilities are recognised at fair value, and the excess of consideration paid over the fair value of net assets is goodwill. IFRS 10 defines control: power, exposure to variable returns and the ability to affect those returns."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "IFRS 13 — Medición del Valor Razonable" : "IFRS 13 — Fair Value Measurement"}
          </h2>
          <p>
            {es
              ? "Define cómo medir el valor razonable cuando otra norma lo exige. Introduce la jerarquía de tres niveles: Nivel 1 (precios cotizados en mercados activos), Nivel 2 (inputs observables distintos al Nivel 1), Nivel 3 (inputs no observables, valoración por modelo). El reparto Nivel 1/2/3 en la memoria es una de las primeras cosas que un analista de crédito mira en un banco."
              : "Defines how to measure fair value when another standard requires it. Introduces the three-level hierarchy: Level 1 (quoted prices in active markets), Level 2 (observable inputs other than Level 1), Level 3 (unobservable inputs, model-based valuation). The Level 1/2/3 split in the notes is one of the first things a credit analyst looks at on a bank."}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Resumen Visual" : "Quick Reference Table"}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 pr-6 text-gray-400 font-medium">
                    {es ? "Norma" : "Standard"}
                  </th>
                  <th className="text-left py-3 text-gray-400 font-medium">
                    {es ? "Qué Cubre" : "What It Covers"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {es
                  ? [
                      ["IAS 1", "Presentación y estructura de los estados financieros"],
                      ["IAS 2", "Existencias — menor entre coste y VNR"],
                      ["IAS 7", "Estado de flujos de efectivo"],
                      ["IAS 12", "Impuestos corrientes y diferidos"],
                      ["IAS 16", "Inmovilizado material"],
                      ["IAS 19", "Pensiones y otras retribuciones a empleados"],
                      ["IAS 21", "Tipos de cambio y consolidación de filiales extranjeras"],
                      ["IAS 36", "Deterioro de activos"],
                      ["IAS 37", "Provisiones y contingencias"],
                      ["IAS 38", "Activos intangibles e I+D"],
                      ["IFRS 3", "Combinaciones de negocios — fondo de comercio"],
                      ["IFRS 9", "Instrumentos financieros y pérdida crediticia esperada"],
                      ["IFRS 10", "Estados financieros consolidados — control"],
                      ["IFRS 13", "Medición del valor razonable"],
                      ["IFRS 15", "Ingresos — modelo de 5 pasos"],
                      ["IFRS 16", "Arrendamientos — derecho de uso en balance"],
                    ].map(([s, d]) => (
                      <tr key={s}>
                        <td className="py-3 pr-6 text-blue-300 font-medium">{s}</td>
                        <td className="py-3 text-gray-300">{d}</td>
                      </tr>
                    ))
                  : [
                      ["IAS 1", "Presentation and structure of financial statements"],
                      ["IAS 2", "Inventories — lower of cost and NRV"],
                      ["IAS 7", "Statement of cash flows"],
                      ["IAS 12", "Current and deferred income taxes"],
                      ["IAS 16", "Property, plant and equipment"],
                      ["IAS 19", "Pensions and other employee benefits"],
                      ["IAS 21", "FX rates and translation of foreign subsidiaries"],
                      ["IAS 36", "Impairment of assets"],
                      ["IAS 37", "Provisions and contingencies"],
                      ["IAS 38", "Intangible assets and R&D"],
                      ["IFRS 3", "Business combinations — goodwill"],
                      ["IFRS 9", "Financial instruments and expected credit loss"],
                      ["IFRS 10", "Consolidated financial statements — control"],
                      ["IFRS 13", "Fair value measurement"],
                      ["IFRS 15", "Revenue — 5-step model"],
                      ["IFRS 16", "Leases — right-of-use on balance sheet"],
                    ].map(([s, d]) => (
                      <tr key={s}>
                        <td className="py-3 pr-6 text-blue-300 font-medium">{s}</td>
                        <td className="py-3 text-gray-300">{d}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "Cómo Usar Esta Lista en la Práctica" : "How to Use This List in Practice"}
          </h2>
          <p>
            {es
              ? "Ningún analista financiero o director financiero memoriza las IFRS palabra por palabra: lo que sí hace es saber qué norma aplica a cada problema y dónde buscar el detalle. Cuando leas una memoria, identifica primero las políticas contables relevantes (suelen estar en la nota 2 o 3) y las áreas de juicio (deterioro, impuestos diferidos, provisiones, ingresos). Ahí es donde se concentra el riesgo y donde aparecen las sorpresas."
              : "No analyst or finance director memorises IFRS word for word — what they do is know which standard applies to which problem, and where to find the detail. When you read a set of accounts, identify the relevant accounting policies first (usually in note 2 or 3) and the areas of judgement (impairment, deferred tax, provisions, revenue). That is where the risk sits and where the surprises come from."}
          </p>
          <p>
            {es
              ? "Tres reglas prácticas: lee siempre la nota de políticas contables, no asumas comparabilidad sin verificar (sobre todo con IFRS 15 e IFRS 16) y nunca te fíes del EBITDA antes de revisar qué hay debajo."
              : "Three rules of thumb: always read the accounting policies note, never assume comparability without checking (especially across IFRS 15 and IFRS 16), and never trust EBITDA before checking what sits beneath it."}
          </p>

        </div>

        <ShareButtons
          url="https://www.financeplots.com/blog/ifrs-ias-standards-guide"
          title={es
            ? "Las Normas IFRS e IAS Más Importantes que Todo Profesional de Finanzas Debe Conocer"
            : "The Most Important IFRS and IAS Standards Every Finance Professional Should Know"}
        />

        <div className="mt-14 bg-[#0d1426] border border-blue-700/40 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">
            {es ? "Construye Tus Estados Financieros" : "Build Your Financial Statements"}
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            {es
              ? "Modelo Financiero a 5 Años, Presupuesto Anual y Previsión de Caja a 13 Semanas — en directo en tu navegador, sin registro."
              : "Free 5-Year Financial Model, Annual Budget and 13-Week Cash Flow Forecast — live in your browser, no signup required."}
          </p>
          <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition inline-block">
            {es ? "Abrir Herramientas Financieras" : "Open Finance Tools"}
          </Link>
        </div>

        <p className="text-gray-600 text-xs mt-8 text-center">
          {es
            ? "Este artículo es solo para fines informativos y no constituye asesoramiento contable, fiscal ni financiero. Consulte siempre el texto oficial de las normas IFRS publicado por la IFRS Foundation."
            : "This article is for informational purposes only and does not constitute accounting, tax or financial advice. Always refer to the official IFRS standards as published by the IFRS Foundation."}
        </p>
      </BlogArticleShell>
    </main>
  );
}
