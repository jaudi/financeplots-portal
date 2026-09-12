import type { FactorScores } from "@/lib/screener";

/** The five axes, in the order they are drawn. Labels are plain English on
 *  purpose — "expectativas" is what the pipeline calls it, "Priced In" is what
 *  it means to someone who did not write the pipeline. */
export const EJES: {
  clave: keyof FactorScores;
  etiqueta: string;
  /** Versión corta para la rejilla de cinco columnas de la tarjeta, donde
   *  "Momentum" se corta a la mitad y deja "MOMENT…", que no es una palabra. */
  corta: string;
  ayuda: string;
}[] = [
  {
    clave: "value",
    corta: "Value",
    etiqueta: "Value",
    ayuda: "What you pay for what the business earns and owns, on a multi-year average of earnings rather than the last twelve months.",
  },
  {
    clave: "growth",
    corta: "Growth",
    etiqueta: "Growth",
    ayuda: "Revenue and earnings growth measured against a multi-year base, so one weak prior year cannot manufacture a growth rate.",
  },
  {
    clave: "momentum",
    corta: "Trend",
    etiqueta: "Trend",
    ayuda: "Whether the price agrees — 6- and 12-month returns and where the price sits against its long-term average.",
  },
  {
    clave: "quality",
    corta: "Quality",
    etiqueta: "Quality",
    ayuda: "Returns on capital, margins, how much profit becomes cash, and how much debt sits underneath it.",
  },
  {
    clave: "expectativas",
    corta: "Priced In",
    etiqueta: "Priced In",
    ayuda: "How much growth today's price already demands, against what the business has actually delivered. A high score means the price is asking for less than the company has managed.",
  },
];

/** Curva cerrada y suave que pasa por los cinco puntos (Catmull-Rom convertida a
 *  béziers cúbicas).
 *
 *  Es la diferencia entre esto y un polígono: con aristas rectas, un factor bajo
 *  produce un pico afilado que se lee como un error de dibujo. Con la curva, la
 *  forma se abolla hacia dentro, y una abolladura es algo que el ojo reconoce
 *  como información. `tension` controla cuánto se hincha entre ejes.
 */
function curvaCerrada(puntos: [number, number][], tension = 1): string {
  const n = puntos.length;
  if (n === 0) return "";

  let d = `M ${puntos[0][0].toFixed(2)} ${puntos[0][1].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = puntos[(i - 1 + n) % n];
    const p1 = puntos[i];
    const p2 = puntos[(i + 1) % n];
    const p3 = puntos[(i + 2) % n];

    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension;
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension;
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension;
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension;

    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d + " Z";
}

/** The five factor scores as one organic shape. This is the whole point of the
 *  card: five numbers are a table, a shape is something you recognise across a
 *  grid of forty companies without reading any of them. */
export default function FactorSnowflake({
  factores,
  size = 120,
  conEtiquetas = false,
}: {
  factores: FactorScores;
  size?: number;
  /** Los rótulos de los ejes alrededor del círculo. Ilegibles por debajo de
   *  ~160px, así que la rejilla de tarjetas los apaga y usa su propia leyenda. */
  conEtiquetas?: boolean;
}) {
  const centro = size / 2;
  const radio = centro * (conEtiquetas ? 0.56 : 0.88);

  const angulo = (i: number) => (Math.PI * 2 * i) / EJES.length - Math.PI / 2;
  const punto = (i: number, escala: number): [number, number] => {
    const a = angulo(i);
    return [centro + Math.cos(a) * radio * escala, centro + Math.sin(a) * radio * escala];
  };

  // Un factor ausente se dibuja en el centro. El hueco en la forma es
  // exactamente lo que hay que ver — pero no se colorea como un mal resultado,
  // que es otra cosa.
  const valores = EJES.map((e) => factores[e.clave]);
  const presentes = valores.filter((v): v is number => v !== undefined);
  const media = presentes.length ? presentes.reduce((a, b) => a + b, 0) / presentes.length : 0;

  const tono = media >= 60 ? "#34d399" : media >= 40 ? "#f59e0b" : "#f87171";
  const idGrad = `sf-${EJES.map((e) => Math.round(factores[e.clave] ?? -1)).join("-")}-${size}`;

  // Un mínimo del 6% para que una empresa sin datos no dibuje un punto invisible
  // en el centro: quedaría igual que un fallo de render.
  const forma = curvaCerrada(valores.map((v, i) => punto(i, Math.max((v ?? 0) / 100, 0.06))));

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <defs>
        <radialGradient id={idGrad}>
          <stop offset="0%" stopColor={tono} stopOpacity={0.55} />
          <stop offset="100%" stopColor={tono} stopOpacity={0.2} />
        </radialGradient>
      </defs>

      {/* Anillos circulares, como el original: los pentágonos concéntricos
          compiten visualmente con la forma que se quiere leer. */}
      {[0.25, 0.5, 0.75, 1].map((r, i) => (
        <circle
          key={r}
          cx={centro}
          cy={centro}
          r={radio * r}
          fill="none"
          stroke={i === 3 ? "#273246" : "#1a2233"}
          strokeWidth={1}
        />
      ))}
      {EJES.map((_, i) => {
        const [x, y] = punto(i, 1);
        return <line key={i} x1={centro} y1={centro} x2={x} y2={y} stroke="#1a2233" strokeWidth={1} />;
      })}

      <path d={forma} fill={`url(#${idGrad})`} stroke={tono} strokeWidth={1.75} strokeLinejoin="round" />

      {conEtiquetas &&
        EJES.map((e, i) => {
          const [x, y] = punto(i, 1.3);
          const grados = (angulo(i) * 180) / Math.PI;
          // Los rótulos siguen el círculo, pero se voltean en la mitad inferior:
          // si no, tres de los cinco se leen boca abajo.
          const giro = grados > 90 || grados < -90 ? grados + 180 : grados;
          return (
            <text
              key={e.clave}
              x={x}
              y={y}
              transform={`rotate(${giro.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})`}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-gray-500"
              style={{ fontSize: size * 0.05, letterSpacing: "0.07em", fontWeight: 600 }}
            >
              {e.etiqueta.toUpperCase()}
            </text>
          );
        })}
    </svg>
  );
}
