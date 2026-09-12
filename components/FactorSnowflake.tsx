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
    clave: "quality",
    corta: "Quality",
    etiqueta: "Quality",
    ayuda: "Returns on capital, margins, how much profit becomes cash, and how much debt sits underneath it.",
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
    etiqueta: "Momentum",
    ayuda: "Whether the price agrees — 6- and 12-month returns and where the price sits against its long-term average.",
  },
  {
    clave: "expectativas",
    corta: "Priced In",
    etiqueta: "Priced In",
    ayuda: "How much growth today's price already demands, against what the business has actually delivered. A high score means the price is asking for less than the company has managed.",
  },
];

/** A pentagon radar, one point per factor. This is the whole point of the card:
 *  five numbers are a table, a shape is something you recognise across a grid of
 *  forty companies without reading anything. */
export default function FactorSnowflake({
  factores,
  size = 120,
}: {
  factores: FactorScores;
  size?: number;
}) {
  const centro = size / 2;
  const radio = size / 2 - 14;

  // Empieza arriba y gira en el sentido de las agujas del reloj.
  const angulo = (i: number) => (Math.PI * 2 * i) / EJES.length - Math.PI / 2;
  const punto = (i: number, escala: number) => {
    const a = angulo(i);
    return [centro + Math.cos(a) * radio * escala, centro + Math.sin(a) * radio * escala];
  };

  const anillos = [0.25, 0.5, 0.75, 1];
  const rejilla = anillos.map((r) =>
    EJES.map((_, i) => punto(i, r).map((n) => n.toFixed(1)).join(",")).join(" "),
  );

  // Un factor ausente vale 0 para dibujar — el hueco en la forma es exactamente
  // lo que hay que ver — pero no se colorea como si fuera un mal resultado.
  const valores = EJES.map((e) => factores[e.clave] ?? 0);
  const poligono = valores
    .map((v, i) => punto(i, Math.max(v, 0) / 100).map((n) => n.toFixed(1)).join(","))
    .join(" ");

  const media = valores.reduce((a, b) => a + b, 0) / valores.length;
  const tono = media >= 60 ? "#34d399" : media >= 40 ? "#fbbf24" : "#f87171";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {rejilla.map((puntos, i) => (
        <polygon
          key={i}
          points={puntos}
          fill="none"
          stroke="#1f2937"
          strokeWidth={i === anillos.length - 1 ? 1 : 0.5}
        />
      ))}
      {EJES.map((_, i) => {
        const [x, y] = punto(i, 1);
        return <line key={i} x1={centro} y1={centro} x2={x} y2={y} stroke="#1f2937" strokeWidth={0.5} />;
      })}
      <polygon points={poligono} fill={tono} fillOpacity={0.25} stroke={tono} strokeWidth={1.5} />
      {valores.map((v, i) => {
        const [x, y] = punto(i, Math.max(v, 0) / 100);
        return <circle key={i} cx={x} cy={y} r={2} fill={tono} />;
      })}
    </svg>
  );
}
