import Link from "next/link";
import type { Metadata } from "next";
import BlogArticleShell from "@/components/BlogArticleShell";
import RoceExplorer, { type RocePoint } from "@/components/RoceExplorer";

const URL = "https://www.financeplots.com/blog/roce-margin-turnover";
const TITLE = "Ferrari or Costco? The One Ratio That Shows How a Business Makes Money";
const DESCRIPTION =
  "ROCE is margin times turnover: either you earn a lot on each sale, or you sell a lot on each pound you tie up. Costco, Ferrari, McDonald's, Starbucks and Apple — and where your own business sits.";

export const metadata: Metadata = {
  title: TITLE, // the layout's template adds " | FinancePlots"
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, siteName: "FinancePlots", type: "article", images: [{ url: "https://www.financeplots.com/og-image.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["https://www.financeplots.com/og-image.png"] },
};

type Props = { params: Promise<{ locale: string }> };

// Latest annual reports filed with the SEC (10-K; Ferrari's 20-F), read from
// its XBRL API on 12 Nov 2026. ROCE = operating profit ÷ (total assets −
// current liabilities), year-end balances. Ferrari's IFRS balance sheet has no
// current-liabilities total, so it is measured on total assets (a lower bound
// for its ROCE). The café is an illustration, not a company.
const COMPANIES = [
  { name: "Costco", period: "FY to Aug 2026", sales: "$303.2bn", margin: 3.9, turnover: 6.72, roce: 25.9 },
  { name: "McDonald's", period: "FY 2025", sales: "$26.9bn", margin: 46.1, turnover: 0.49, roce: 22.5 },
  { name: "Ferrari*", period: "FY 2025", sales: "€7.1bn", margin: 29.5, turnover: 0.74, roce: 21.9 },
  { name: "Starbucks", period: "FY to Sep 2025", sales: "$37.2bn", margin: 7.9, turnover: 1.7, roce: 13.5 },
  { name: "Apple", period: "FY to Sep 2026", sales: "$478.8bn", margin: 33.0, turnover: 2.04, roce: 67.4 },
];

export default async function RoceMarginTurnover({ params }: Props) {
  const { locale } = await params;
  const es = locale === "es";
  const num = (v: number, d = 1) => v.toLocaleString(es ? "es-ES" : "en-GB", { minimumFractionDigits: d, maximumFractionDigits: d });

  const points: RocePoint[] = [
    { name: "Costco", turnover: 6.72, marginPct: 3.9, dx: 0, dy: -12, anchor: "middle" },
    { name: "McDonald's", turnover: 0.49, marginPct: 46.1 },
    { name: es ? "Ferrari (sobre activo total)" : "Ferrari (on total assets)", short: "Ferrari", turnover: 0.74, marginPct: 29.5, hollow: true, dy: 16 },
    { name: "Apple", turnover: 2.04, marginPct: 33.0 },
    { name: "Starbucks 2025", short: "SBUX '25", turnover: 1.7, marginPct: 7.9, dx: -10, anchor: "end" },
    { name: "Starbucks 2024", short: "SBUX '24", turnover: 1.62, marginPct: 15.0, hollow: true, dx: -10, anchor: "end" },
    { name: es ? "Cafetería de barrio (ejemplo)" : "Corner café (illustration)", short: es ? "Cafetería" : "Café", turnover: 2.86, marginPct: 7, hollow: true, dy: 18 },
  ];

  const h2 = "text-2xl font-bold text-white mt-10";

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: TITLE,
            description: DESCRIPTION,
            url: URL,
            datePublished: "2026-11-12",
            image: "https://www.financeplots.com/og-image.png",
            author: { "@type": "Person", name: "Javier Audibert" },
            publisher: { "@type": "Organization", name: "FinancePlots", logo: { "@type": "ImageObject", url: "https://www.financeplots.com/logo-sm.png" } },
            mainEntityOfPage: { "@type": "WebPage", "@id": URL },
          }),
        }}
      />
      <BlogArticleShell>
        <Link href="/blog" className="text-blue-400 text-sm hover:text-blue-300 transition mb-8 inline-block">
          {es ? "← Volver al Blog" : "← Back to Blog"}
        </Link>

        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{es ? "Finanzas Corporativas" : "Corporate Finance"}</span>
        <h1 className="text-4xl font-bold mt-2 mb-3 leading-tight">
          {es ? "¿Ferrari o Costco? El ratio que cuenta cómo gana dinero un negocio" : TITLE}
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          {es ? "Noviembre 2026 · 7 min de lectura · Por Javier Audibert" : "November 2026 · 7 min read · By Javier Audibert"}
        </p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">
          <p>
            {es
              ? "Dos empresas sacan casi lo mismo de cada euro que tienen metido en el negocio: unos 22–26 céntimos de beneficio operativo al año. Una vende 300.000 millones de dólares al año y se queda con menos de 4 céntimos por cada dólar vendido. La otra vende once veces menos y se queda con 46 céntimos. Son Costco y McDonald's, y llegan al mismo sitio por caminos opuestos."
              : "Two companies earn almost the same on every dollar tied up in the business: around 22–26 cents of operating profit a year. One sells $300 billion of goods a year and keeps less than 4 cents of each dollar it sells. The other sells eleven times less and keeps 46 cents. They are Costco and McDonald's, and they get to the same place by opposite roads."}
          </p>
          <p>
            {es
              ? "El ratio que lo explica se llama ROCE, y es probablemente el que mejor resume un negocio en una sola cifra. Lo bonito no es la cifra: es que se parte en dos, y esas dos mitades te dicen qué tipo de empresa tienes delante. O tienes margen, o vendes mucho. O eres Ferrari, o eres Costco."
              : "The ratio that explains it is ROCE, and it is probably the best single-number summary of a business. The beauty isn't the number itself: it splits in two, and the two halves tell you what kind of company you're looking at. Either you have margin, or you sell a lot. Either you're Ferrari, or you're Costco."}
          </p>

          <h2 className={h2}>{es ? "El ROCE en una línea" : "ROCE in one line"}</h2>
          <p>
            {es
              ? "ROCE (return on capital employed) es el beneficio operativo dividido entre el capital empleado: lo que el negocio necesita tener invertido para funcionar — locales, maquinaria, stock, lo que te deben los clientes — menos lo que financian otros a corto plazo, como los proveedores. En la práctica: activo total menos pasivo corriente."
              : "ROCE (return on capital employed) is operating profit divided by capital employed: what the business needs tied up to run — premises, machines, stock, money customers owe you — minus what others fund for you in the short term, such as suppliers. In practice: total assets minus current liabilities."}
          </p>
          <div className="bg-blue-600/10 border border-blue-700/30 rounded-xl p-6 not-prose">
            <p className="text-blue-300 text-sm font-semibold mb-3">{es ? "La descomposición" : "The split"}</p>
            <p className="text-white font-mono text-sm leading-relaxed">
              ROCE = {es ? "beneficio operativo ÷ capital empleado" : "operating profit ÷ capital employed"}
              <br />= ({es ? "beneficio ÷ ventas" : "profit ÷ sales"}) × ({es ? "ventas ÷ capital empleado" : "sales ÷ capital employed"})
              <br />= <span className="text-blue-300">{es ? "margen" : "margin"}</span> × <span className="text-blue-300">{es ? "rotación" : "turnover"}</span>
            </p>
          </div>
          <p>
            {es
              ? "El margen dice cuánto te quedas de cada venta. La rotación dice cuántas veces al año \"das la vuelta\" al dinero que tienes invertido. Un 20% de ROCE puede ser un 20% de margen con una rotación de 1, o un 2% de margen con una rotación de 10. Mismo resultado, negocios que no se parecen en nada."
              : "Margin says how much you keep from each sale. Turnover says how many times a year you “turn over” the money you have tied up. A 20% ROCE can be a 20% margin turned once, or a 2% margin turned ten times. Same result, businesses that look nothing alike."}
          </p>

          <h2 className={h2}>{es ? "La cafetería de barrio y Starbucks" : "The corner café and Starbucks"}</h2>
          <p>
            {es
              ? "Piensa en una cafetería de barrio, de las baratas. Café a 1,50, cola en la puerta a las ocho de la mañana, una cafetera que no para. Imagina 400.000 de ventas al año, 28.000 de beneficio operativo (un 7%) y unos 140.000 invertidos entre la obra, la máquina y el stock, descontado lo que debe a proveedores. Gira su capital casi tres veces al año: ROCE del 20%. Margen fino, mucho volumen. Es un ejemplo inventado, pero cualquiera que haya llevado un bar lo reconoce."
              : "Picture a cheap corner café. Coffee at £1.50, a queue at eight in the morning, a machine that never stops. Say £400,000 of sales a year, £28,000 of operating profit (7%) and about £140,000 tied up in the fit-out, the machine and the stock, net of what it owes suppliers. It turns its capital almost three times a year: a 20% ROCE. Thin margin, lots of volume. The numbers are made up, but anyone who has run a café will recognise them."}
          </p>
          <p>
            {es
              ? "Starbucks parece lo contrario: café a cinco dólares, marca, ambiente. Uno esperaría márgenes de lujo. Pero las cuentas dicen otra cosa. En su ejercicio 2023 el margen operativo fue del 16% y el ROCE del 29%. En 2025, del 7,9% y el 13,5%, mientras metía más personal en las tiendas y pagaba una reestructuración. La rotación apenas se movió (de 1,8 a 1,7 veces): toda la caída vino del margen. Precio premium no significa margen premium cuando el alquiler en la mejor esquina y la plantilla se comen el precio."
              : "Starbucks looks like the opposite: five-dollar coffee, a brand, an atmosphere. You'd expect luxury margins. The accounts say otherwise. In fiscal 2023 its operating margin was 16% and its ROCE 29%. In fiscal 2025, 7.9% and 13.5%, as it put more staff in its stores and paid for a restructuring. Turnover barely moved (1.8 to 1.7 times): the whole drop came from margin. A premium price is not a premium margin when the rent on the best corner and the payroll eat the price."}
          </p>

          <h2 className={h2}>{es ? "Ferrari y Costco: los dos extremos" : "Ferrari and Costco: the two extremes"}</h2>
          <p>
            {es
              ? "Ferrari vende menos de 14.000 coches al año y se queda con casi 30 céntimos de beneficio operativo por cada euro vendido (29,5% en 2025). A cambio, necesita mucho capital por cada coche: fábrica, desarrollo, Fórmula 1. Sus ventas son solo 0,74 veces su activo total. Ferrari no publica un total de pasivo corriente, así que lo mido sobre activo total, lo que da un 22% — su ROCE real es algo mayor."
              : "Ferrari sells fewer than 14,000 cars a year and keeps almost 30 cents of operating profit on each euro of sales (29.5% in 2025). In exchange it needs a lot of capital per car: the factory, development, Formula 1. Its sales are only 0.74 times its total assets. Ferrari doesn't report a total for current liabilities, so I measure it on total assets, which gives 22% — its actual ROCE is somewhat higher."}
          </p>
          <p>
            {es
              ? "Costco está en la otra punta: 3,9% de margen, y ventas de 6,7 veces su capital empleado. Gira el stock tan rápido que a menudo vende la mercancía antes de pagársela al proveedor. Y tiene un truco: las cuotas de socio, que aportan aproximadamente la mitad de su beneficio operativo. Los productos casi al coste son el gancho; la cuota es el negocio."
              : "Costco sits at the other end: a 3.9% margin, and sales of 6.7 times its capital employed. It turns its stock so fast that it often sells the goods before it has paid the supplier for them. And it has a trick: membership fees, which bring in roughly half of its operating profit. Goods at close to cost are the hook; the fee is the business."}
          </p>

          <h2 className={h2}>{es ? "La sorpresa: McDonald's no es Costco" : "The surprise: McDonald's isn't Costco"}</h2>
          <p>
            {es
              ? "Si te pidiera clasificar McDonald's, dirías volumen: hamburguesas baratas, millones de clientes al día. Pero McDonald's la empresa no vende hamburguesas — eso lo hacen los franquiciados, que operan en torno al 95% de sus restaurantes. McDonald's cobra alquileres y royalties. Por eso su margen operativo es del 46%, más que el de Ferrari, y su rotación de 0,49: es dueña de mucho suelo y muchos edificios."
              : "If I asked you to classify McDonald's, you'd say volume: cheap burgers, millions of customers a day. But McDonald's the company doesn't sell burgers — franchisees do, and they run about 95% of its restaurants. McDonald's collects rent and royalties. That's why its operating margin is 46%, higher than Ferrari's, and its turnover 0.49: it owns a lot of land and buildings."}
          </p>
          <p>
            {es
              ? "El franquiciado que fríe las patatas es la cafetería de barrio: margen fino, mucho volumen. El dueño de la marca es un casero con margen de Ferrari. Mismo logo, dos negocios distintos. Por eso conviene mirar las cuentas y no la tienda."
              : "The franchisee frying the chips is the corner café: thin margin, lots of volume. The brand owner is a landlord with Ferrari margins. Same logo, two different businesses. Which is why you look at the accounts, not the shop."}
          </p>

          <h2 className={h2}>{es ? "Y luego está Apple: las dos palancas a la vez" : "And then there's Apple: both levers at once"}</h2>
          <p>
            {es
              ? "Lo normal es elegir carril. Apple no eligió. En su ejercicio a septiembre de 2026 tuvo un margen operativo del 33% — de fabricante de lujo — y unas ventas de 2 veces su capital empleado — de distribuidor. Resultado: un ROCE del 67%, casi el triple que Costco o McDonald's."
              : "Most businesses pick a lane. Apple didn't. In its year to September 2026 it had a 33% operating margin — luxury-maker territory — and sales of 2 times its capital employed — distributor territory. The result: a 67% ROCE, nearly three times Costco's or McDonald's."}
          </p>
          <p>
            {es
              ? "Parte de esa rotación tiene truco, y es un truco que cualquier director financiero entiende: Apple tiene 170.000 millones de dólares de pasivo corriente, buena parte dinero que debe a proveedores. Fabrica fuera, cobra rápido y paga más tarde, así que sus proveedores le financian el circulante. Margen por marca, rotación por capital circulante. Eso no se copia fácil."
              : "Part of that turnover has a trick, and it's one any finance director understands: Apple has $170 billion of current liabilities, much of it money owed to suppliers. It outsources manufacturing, collects quickly and pays later, so its suppliers fund its working capital. Margin from the brand, turnover from working capital. That is hard to copy."}
          </p>

          <h2 className={h2}>{es ? "El mapa" : "The map"}</h2>
          <p>
            {es
              ? "Si pones el margen en un eje y la rotación en el otro, cada línea discontinua une todos los negocios con el mismo ROCE. Ferrari y McDonald's arriba a la izquierda, Costco abajo a la derecha, Apple solo arriba del todo. Debajo puedes meter las cifras de tu empresa y ver dónde cae."
              : "Put margin on one axis and turnover on the other, and each dashed line joins every business with the same ROCE. Ferrari and McDonald's top left, Costco bottom right, Apple on its own at the top. Underneath, you can type your own company's figures and see where it lands."}
          </p>
        </div>

        <RoceExplorer points={points} es={es} />

        <div className="not-prose overflow-x-auto mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-xs text-gray-400 uppercase tracking-wider">
                <th className="text-left py-2 pr-4">{es ? "Empresa" : "Company"}</th>
                <th className="text-left py-2 pr-4 hidden sm:table-cell">{es ? "Ejercicio" : "Year"}</th>
                <th className="text-right py-2 pr-4 hidden sm:table-cell">{es ? "Ventas" : "Sales"}</th>
                <th className="text-right py-2 pr-4">{es ? "Margen" : "Margin"}</th>
                <th className="text-right py-2 pr-4">{es ? "Rotación" : "Turnover"}</th>
                <th className="text-right py-2">ROCE</th>
              </tr>
            </thead>
            <tbody>
              {COMPANIES.map((c) => (
                <tr key={c.name} className="border-b border-gray-800 text-gray-300">
                  <td className="py-2 pr-4 text-white font-medium">{c.name}</td>
                  <td className="py-2 pr-4 hidden sm:table-cell">{es ? c.period.replace("FY to", "Ej. a").replace("FY", "Ej.").replace("Aug", "ago").replace("Sep", "sep") : c.period}</td>
                  <td className="py-2 pr-4 text-right hidden sm:table-cell">{c.sales}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{num(c.margin)}%</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{num(c.turnover, 2)}×</td>
                  <td className="py-2 text-right tabular-nums font-semibold text-white">{num(c.roce)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            {es
              ? "Fuente: informes anuales presentados ante la SEC (10-K; 20-F de Ferrari). ROCE = beneficio operativo ÷ (activo total − pasivo corriente) al cierre del ejercicio. * Ferrari, sobre activo total: su balance NIIF no da un total de pasivo corriente."
              : "Source: annual reports filed with the SEC (10-K; Ferrari's 20-F). ROCE = operating profit ÷ (total assets − current liabilities) at the year end. * Ferrari on total assets: its IFRS balance sheet gives no current-liabilities total."}
          </p>
        </div>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">
          <h2 className={h2}>{es ? "Qué significa para tu empresa" : "What it means for your business"}</h2>
          <p>
            {es
              ? "Si diriges las finanzas de una pyme, el ROCE te obliga a hacerte una pregunta incómoda: ¿cuál es mi carril? Las dos palancas existen, pero se mueven con herramientas distintas:"
              : "If you run the finances of a small or mid-sized company, ROCE forces an uncomfortable question: which lane am I in? Both levers exist, but they move with different tools:"}
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>{es ? "Margen" : "Margin"}</strong> —{" "}
              {es
                ? "precio, mezcla de productos y costes. Subir un 3% el precio sin perder clientes suele hacer más por el ROCE que cualquier recorte."
                : "price, product mix and costs. A 3% price rise that keeps your customers usually does more for ROCE than any cost cut."}
            </li>
            <li>
              <strong>{es ? "Rotación" : "Turnover"}</strong> —{" "}
              {es
                ? "menos stock parado, cobrar antes, activos que no producen fuera del balance, y condiciones de pago a proveedores razonables. Cada euro que liberas del circulante sube la rotación sin vender un euro más."
                : "less stock sitting idle, collecting sooner, idle assets off the balance sheet, and sensible supplier terms. Every pound you free from working capital lifts turnover without selling a penny more."}
            </li>
          </ul>
          <p>
            {es
              ? "El peligro es quedarse en medio: precio de Starbucks con costes de Starbucks, o volumen de Costco con el stock de una tienda de lujo. Michael Porter lo llamaba \"stuck in the middle\". El ROCE te lo enseña antes que la cuenta de resultados, porque el beneficio puede seguir subiendo mientras el capital que necesitas para conseguirlo sube más rápido."
              : "The danger is getting stuck in the middle: a Starbucks price with Starbucks costs, or Costco volumes with a luxury shop's stock. Michael Porter called it “stuck in the middle”. ROCE shows it before the profit and loss account does, because profit can keep rising while the capital you need to earn it rises faster."}
          </p>

          <h2 className={h2}>{es ? "Tres advertencias" : "Three caveats"}</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              {es
                ? "Compara dentro del mismo sector. Un supermercado con 4% de margen no lo hace peor que una farmacéutica con 30%: juegan juegos distintos. El mapa sirve para ver el juego, no para puntuarlo."
                : "Compare within an industry. A supermarket with a 4% margin isn't doing worse than a drug-maker with 30%: they play different games. The map shows the game; it doesn't score it."}
            </li>
            <li>
              {es
                ? "El balance de cierre es una foto. Una empresa con mucha estacionalidad puede salir muy distinta según el día del cierre; lo ideal es usar la media del capital empleado del año."
                : "A year-end balance sheet is a snapshot. A seasonal business can look very different depending on the closing date; ideally use the year's average capital employed."}
            </li>
            <li>
              {es
                ? "Los arrendamientos, el fondo de comercio y las recompras de acciones mueven el denominador. McDonald's, por ejemplo, tiene fondos propios negativos por las recompras: por eso aquí uso capital empleado y no ROE."
                : "Leases, goodwill and share buybacks move the denominator. McDonald's, for example, has negative equity because of buybacks: which is why I use capital employed here rather than ROE."}
            </li>
          </ol>
          <p>
            {es
              ? "Lo demás es mirar tus cuatro cifras, ponerte en el mapa y decidir hacia dónde quieres moverte. Hacia arriba es más margen. Hacia la derecha, más rotación. Hacia las dos a la vez es Apple, y por algo hay pocas Apple."
              : "The rest is taking your four figures, putting yourself on the map and deciding which way to move. Up is more margin. Right is more turnover. Both at once is Apple — and there's a reason there are so few Apples."}
          </p>
        </div>

        <div className="mt-14 bg-[#0d1426] border border-blue-700/40 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">{es ? "Mueve las dos palancas con números" : "Work both levers with numbers"}</h3>
          <p className="text-gray-400 text-sm mb-6">
            {es
              ? "El análisis de punto muerto te enseña qué hace el precio a tu margen; la previsión de tesorería a 13 semanas, cuánto capital tienes atado en cobros y stock. Gratis, sin registro."
              : "Break-even analysis shows what price does to your margin; the 13-week cash flow forecast shows how much capital is tied up in receivables and stock. Free, no signup."}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/tools/break-even" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition inline-block">
              {es ? "Punto muerto" : "Break-even analysis"}
            </Link>
            <Link href="/tools/cash-flow" className="border border-gray-600 hover:border-blue-500 text-gray-200 font-semibold px-6 py-3 rounded-lg transition inline-block">
              {es ? "Tesorería a 13 semanas" : "13-week cash flow"}
            </Link>
          </div>
        </div>

        <p className="text-gray-600 text-xs mt-8 text-center">
          {es
            ? "Este artículo es educativo. Las empresas se citan para explicar modelos de negocio con sus cifras publicadas; no es una recomendación de compra o venta de ningún valor ni asesoramiento financiero."
            : "This article is educational. Companies are named to explain business models with their published figures; it is not a recommendation to buy or sell any security, nor financial advice."}
        </p>
      </BlogArticleShell>
    </main>
  );
}
