// Revision cards shown (and downloadable as a PDF) at the end of the blog post
// /blog/strategy-models-balanced-scorecard. Written from the author's own
// handwritten revision cards. Keep the text to characters the PDF's built-in
// Helvetica can draw (Latin-1 plus en/em dashes and curly quotes): no arrows.

export interface RevisionCard {
  topic: string;
  question: string;
  points: string[];
  tip?: string;
}

export function strategyCards(es: boolean): RevisionCard[] {
  const t = (en: string, sp: string) => (es ? sp : en);
  return [
    {
      topic: t("Outside", "Fuera"),
      question: t("PESTEL: what does it scan?", "PESTEL: ¿qué analiza?"),
      points: [
        t("Political: government, tax, trade", "Político: gobierno, impuestos, comercio"),
        t("Economic: growth, interest and exchange rates, inflation", "Económico: crecimiento, tipos de interés y de cambio, inflación"),
        t("Social: population, tastes, working patterns", "Social: población, gustos, formas de trabajar"),
        t("Technological: new products and processes, data, AI", "Tecnológico: productos y procesos nuevos, datos, IA"),
        t("Ecological: emissions, net zero", "Ecológico: emisiones, cero neto"),
        t("Legal: employment, safety, data law", "Legal: laboral, seguridad, protección de datos"),
      ],
      tip: t("Turn each finding into a KPI, or it will be forgotten.", "Convierte cada hallazgo en un KPI, o se olvidará."),
    },
    {
      topic: t("Outside", "Fuera"),
      question: t("Porter's Five Forces", "Las cinco fuerzas de Porter"),
      points: [
        t("Threat of new entrants", "Amenaza de nuevos competidores"),
        t("Bargaining power of suppliers", "Poder de negociación de los proveedores"),
        t("Bargaining power of buyers", "Poder de negociación de los clientes"),
        t("Threat of substitutes", "Amenaza de productos sustitutos"),
        t("Rivalry between competitors, at the centre", "Rivalidad entre competidores, en el centro"),
      ],
      tip: t("Strong forces mean low returns for the whole industry.", "Fuerzas intensas significan rentabilidad baja para todo el sector."),
    },
    {
      topic: t("Choose", "Elegir"),
      question: t("SWOT: what's internal, what's external? And TOWS?", "DAFO: ¿qué es interno y qué externo? ¿Y la matriz TOWS?"),
      points: [
        t("Strengths and weaknesses: internal (often from the value chain)", "Fortalezas y debilidades: internas (suelen salir de la cadena de valor)"),
        t("Opportunities and threats: external (from PESTEL and Five Forces)", "Oportunidades y amenazas: externas (del PESTEL y las cinco fuerzas)"),
        t("TOWS crosses them: SO use strengths, WO fix weaknesses, ST defend with strengths, WT avoid and limit", "TOWS las cruza: FO usar fortalezas, DO corregir debilidades, FA defenderse con fortalezas, DA evitar y limitar"),
      ],
      tip: t("Weak IT is a weakness, not a threat.", "Una informática mala es una debilidad, no una amenaza."),
    },
    {
      topic: t("Choose", "Elegir"),
      question: t("Porter's generic strategies", "Estrategias genéricas de Porter"),
      points: [
        t("Cost leadership: the lowest cost in the industry", "Liderazgo en costes: el coste más bajo del sector"),
        t("Differentiation: something customers pay extra for", "Diferenciación: algo por lo que el cliente paga más"),
        t("Focus: either of those, in a narrow segment", "Enfoque: cualquiera de las dos, en un segmento estrecho"),
      ],
      tip: t("Doing neither well = “stuck in the middle”.", "No hacer bien ninguna = “atascado en medio”."),
    },
    {
      topic: t("Choose", "Elegir"),
      question: t("Ansoff matrix: four ways to grow", "Matriz de Ansoff: cuatro formas de crecer"),
      points: [
        t("Market penetration: same products, same markets (lowest risk)", "Penetración de mercado: mismos productos, mismos mercados (menor riesgo)"),
        t("Product development: new products, same markets", "Desarrollo de producto: productos nuevos, mismos mercados"),
        t("Market development: same products, new markets", "Desarrollo de mercado: mismos productos, mercados nuevos"),
        t("Diversification: new products, new markets (highest risk)", "Diversificación: productos nuevos, mercados nuevos (mayor riesgo)"),
      ],
      tip: t("Riskier boxes deserve wider forecast ranges.", "Las casillas más arriesgadas merecen previsiones con rangos más amplios."),
    },
    {
      topic: t("Choose", "Elegir"),
      question: t("BCG matrix: the four boxes", "Matriz BCG: las cuatro casillas"),
      points: [
        t("Star: high growth, high share. Invest to keep up", "Estrella: crecimiento alto, cuota alta. Invertir para mantenerse"),
        t("Cash cow: low growth, high share. Harvest the cash", "Vaca lechera: crecimiento bajo, cuota alta. Recoger la caja"),
        t("Question mark: high growth, low share. Invest selectively or exit", "Interrogante: crecimiento alto, cuota baja. Invertir con criterio o salir"),
        t("Dog: low growth, low share. Divest unless strategic", "Perro: crecimiento bajo, cuota baja. Desinvertir salvo que sea estratégico"),
      ],
      tip: t("Cash cows fund stars and question marks.", "Las vacas lecheras financian a las estrellas y a los interrogantes."),
    },
    {
      topic: t("Measure", "Medir"),
      question: t("Fitzgerald & Moon: the three building blocks", "Fitzgerald y Moon: los tres bloques"),
      points: [
        t("Dimensions: what to measure. Results (financial, competitiveness) and their drivers (quality, flexibility, resource use, innovation)", "Dimensiones: qué medir. Resultados (financiero, competitividad) y sus motores (calidad, flexibilidad, uso de recursos, innovación)"),
        t("Standards: targets that are owned, achievable and fair", "Estándares: objetivos asumidos, alcanzables y justos"),
        t("Rewards: clear, motivating and controllable", "Incentivos: claros, motivadores y controlables"),
      ],
      tip: t("Don't reward people for things they can't control.", "No premies a nadie por lo que no controla."),
    },
    {
      topic: t("Measure", "Medir"),
      question: t("Balanced scorecard: the four perspectives", "Cuadro de mando integral: las cuatro perspectivas"),
      points: [
        t("Financial: how do the owners see us?", "Financiera: ¿cómo nos ven los dueños?"),
        t("Customer: what do customers value?", "Cliente: ¿qué valoran los clientes?"),
        t("Internal process: what must we excel at?", "Procesos internos: ¿en qué tenemos que ser excelentes?"),
        t("Learning and growth: can we keep improving?", "Aprendizaje y crecimiento: ¿podemos seguir mejorando?"),
      ],
      tip: t("Two or three measures per perspective is enough.", "Con dos o tres medidas por perspectiva basta."),
    },
    {
      topic: t("Measure", "Medir"),
      question: t("Why use a balanced scorecard?", "¿Por qué usar un cuadro de mando integral?"),
      points: [
        t("Balances short and long term, inside and outside, financial and non-financial", "Equilibra corto y largo plazo, dentro y fuera, lo financiero y lo que no lo es"),
        t("Links the strategy to the budget", "Une la estrategia con el presupuesto"),
        t("Cause and effect: learning improves processes, processes please customers, customers drive the financial results", "Causa y efecto: el aprendizaje mejora los procesos, los procesos contentan al cliente, el cliente mueve los resultados"),
      ],
      tip: t("A tool to steer the strategy, not to blame departments.", "Una herramienta para dirigir la estrategia, no para culpar a departamentos."),
    },
    {
      topic: t("Measure", "Medir"),
      question: t("CSFs and KPIs: what's the difference?", "Factores clave de éxito y KPI: ¿en qué se diferencian?"),
      points: [
        t("CSF: what the business must excel at to beat its rivals, as customers see it", "Factor clave: aquello en lo que el negocio tiene que ser excelente para ganar a sus rivales, visto por el cliente"),
        t("KPI: the number that measures it", "KPI: la cifra que lo mide"),
        t("The chain: mission, objectives, plans, KPIs", "La cadena: misión, objetivos, planes, KPI"),
      ],
      tip: t("If a KPI traces back to nothing, ask why it's reported.", "Si un KPI no lleva a ninguna parte, pregunta por qué se reporta."),
    },
  ];
}
