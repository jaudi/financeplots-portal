import Link from "next/link";
import type { Metadata } from "next";
import ShareButtons from "@/components/ShareButtons";
import BlogArticleShell from "@/components/BlogArticleShell";

export const metadata: Metadata = {
  title: "Python Basics for Streamlit: What You Actually Need to Know | FinancePlots",
  description:
    "You don't need to be a Python expert to build Streamlit finance apps. Here are the 10 concepts that cover 90% of real-world Streamlit development.",
  openGraph: {
    title: "Python Basics for Streamlit: What You Actually Need to Know",
    description:
      "You don't need to be a Python expert to build Streamlit finance apps. Here are the 10 concepts that cover 90% of real-world Streamlit development.",
    url: "https://www.financeplots.com/blog/python-for-streamlit",
    siteName: "FinancePlots",
    type: "article",
    images: [{ url: "https://www.financeplots.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Python Basics for Streamlit: What You Actually Need to Know",
    description:
      "You don't need to be a Python expert to build Streamlit finance apps. Here are the 10 concepts that cover 90% of real-world Streamlit development.",
    images: ["https://www.financeplots.com/og-image.png"],
  },
  alternates: { canonical: "https://www.financeplots.com/blog/python-for-streamlit" },
};

type Props = { params: Promise<{ locale: string }> };

export default async function ArticlePythonForStreamlit({ params }: Props) {
  const { locale } = await params;
  const es = locale === "es";

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: "{\"@context\":\"https://schema.org\",\"@type\":\"Article\",\"headline\":\"Python Basics for Streamlit: What You Actually Need to Know\",\"description\":\"You don't need to be a Python expert to build Streamlit finance apps. Here are the 10 concepts that cover 90% of real-world Streamlit development.\",\"url\":\"https://www.financeplots.com/blog/python-for-streamlit\",\"image\":\"https://www.financeplots.com/og-image.png\",\"author\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\"},\"publisher\":{\"@type\":\"Organization\",\"name\":\"FinancePlots\",\"logo\":{\"@type\":\"ImageObject\",\"url\":\"https://www.financeplots.com/logo-sm.png\"}},\"mainEntityOfPage\":{\"@type\":\"WebPage\",\"@id\":\"https://www.financeplots.com/blog/python-for-streamlit\"}}" }} />
      <BlogArticleShell>

        <Link href="/blog" className="text-blue-400 text-sm hover:text-blue-300 transition mb-8 inline-block">
          {es ? "← Volver al Blog" : "← Back to Blog"}
        </Link>

        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
          {es ? "Tutorial" : "Tutorial"}
        </span>
        <h1 className="text-4xl font-bold mt-2 mb-3 leading-tight">
          {es
            ? "Python Básico para Streamlit: Lo Que Realmente Necesitas Saber"
            : "Python Basics for Streamlit: What You Actually Need to Know"}
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          {es ? "Abril 2026 · 8 min de lectura" : "April 2026 · 8 min read"}
        </p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">

          <p>
            {es
              ? <>Streamlit es la forma más rápida de crear herramientas financieras interactivas con Python. Pero mucha gente se frena en el paso previo: <em>¿cuánto Python necesito saber?</em> La respuesta es menos de lo que crees. Estos 10 conceptos cubren el 90% de lo que necesitarás en aplicaciones Streamlit reales.</>
              : <>Streamlit is the fastest way to build interactive finance tools with Python. But many people stall at the step before: <em>how much Python do I actually need to know?</em> The answer is less than you think. These 10 concepts cover 90% of what you'll use in real Streamlit apps.</>}
          </p>

          {/* ── 1. Variables ── */}
          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "1. Variables y Tipos de Datos" : "1. Variables and Data Types"}
          </h2>
          <p>
            {es
              ? "Python no requiere declarar el tipo de una variable — simplemente asigna un valor y Python infiere el tipo. Los tipos que más usarás en Streamlit son: enteros (int), decimales (float), texto (str) y booleanos (bool)."
              : "Python doesn't require declaring a variable's type — just assign a value and Python infers it. The types you'll use most in Streamlit are: integers (int), decimals (float), text (str) and booleans (bool)."}
          </p>
          <pre className="bg-[#050810] border border-gray-800 rounded-2xl p-5 overflow-x-auto text-sm text-gray-300 font-mono leading-relaxed">{`# Integers and floats
revenue     = 480_000        # int — underscores for readability
growth_rate = 0.12           # float — 12%
margin      = 42.5           # float — percentage

# Strings
company     = "Acme Ltd"
region      = "UK"

# Booleans
is_profitable = True
has_debt      = False

# f-strings — format values into text
label = f"{company}: £{revenue:,} revenue, {margin}% margin"
print(label)
# → Acme Ltd: £480,000 revenue, 42.5% margin`}</pre>
          <p className="text-sm text-blue-300 bg-blue-600/5 border border-blue-600/20 rounded-xl px-4 py-3">
            {es
              ? "En Streamlit, las variables se recalculan en cada rerun del script. No son permanentes — usa st.session_state para persistir valores entre interacciones."
              : "In Streamlit, variables are recalculated on every script rerun. They're not persistent — use st.session_state to keep values alive between widget interactions."}
          </p>

          {/* ── 2. Lists and Dicts ── */}
          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "2. Listas y Diccionarios" : "2. Lists and Dictionaries"}
          </h2>
          <p>
            {es
              ? "Las listas almacenan colecciones ordenadas de valores. Los diccionarios almacenan pares clave-valor. Ambas estructuras aparecen constantemente en Streamlit: para opciones de selectbox, para agrupar datos de configuración y para pasar parámetros a funciones de gráficos."
              : "Lists store ordered collections of values. Dictionaries store key-value pairs. Both appear constantly in Streamlit: for selectbox options, for grouping configuration data, and for passing parameters to chart functions."}
          </p>
          <pre className="bg-[#050810] border border-gray-800 rounded-2xl p-5 overflow-x-auto text-sm text-gray-300 font-mono leading-relaxed">{`# Lists — ordered, indexed from 0
regions   = ["UK", "US", "EU", "APAC"]
years     = [2022, 2023, 2024, 2025]
revenues  = [420_000, 480_000, 530_000, 610_000]

# Access by index
first  = regions[0]     # "UK"
last   = regions[-1]    # "APAC"
subset = regions[1:3]   # ["US", "EU"]

# Dictionaries — key:value pairs
company = {
    "name":    "Acme Ltd",
    "revenue": 480_000,
    "margin":  42.5,
    "region":  "UK",
}
print(company["name"])           # "Acme Ltd"
print(company.get("ceo", "N/A")) # "N/A" — safe access with default

# In Streamlit: lists power dropdowns
import streamlit as st
region = st.selectbox("Region", regions)          # list as options
year   = st.selectbox("Year",   years, index=2)   # default = 2024`}</pre>

          {/* ── 3. If/Else ── */}
          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "3. Condicionales (if / elif / else)" : "3. Conditionals (if / elif / else)"}
          </h2>
          <p>
            {es
              ? "La lógica condicional controla qué se muestra y qué se calcula en función de los valores de los widgets. Es el mecanismo principal para crear apps Streamlit dinámicas que reaccionan a las entradas del usuario."
              : "Conditional logic controls what gets displayed and calculated based on widget values. It's the primary mechanism for building dynamic Streamlit apps that react to user input."}
          </p>
          <pre className="bg-[#050810] border border-gray-800 rounded-2xl p-5 overflow-x-auto text-sm text-gray-300 font-mono leading-relaxed">{`import streamlit as st

revenue = st.number_input("Annual Revenue £", value=500_000)
costs   = st.number_input("Total Costs £",    value=380_000)
profit  = revenue - costs
margin  = profit / revenue * 100 if revenue > 0 else 0

# Conditional display
if margin >= 30:
    st.success(f"Strong margin: {margin:.1f}%")
elif margin >= 15:
    st.warning(f"Acceptable margin: {margin:.1f}%")
elif margin > 0:
    st.warning(f"Thin margin: {margin:.1f}% — review cost structure")
else:
    st.error(f"Loss-making: {margin:.1f}%")

# Conditional sections
show_breakdown = st.checkbox("Show cost breakdown")
if show_breakdown:
    st.write(f"Revenue: £{revenue:,}")
    st.write(f"Costs:   £{costs:,}")
    st.write(f"Profit:  £{profit:,}")`}</pre>

          {/* ── 4. Functions ── */}
          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "4. Funciones" : "4. Functions"}
          </h2>
          <p>
            {es
              ? "Las funciones encapsulan lógica reutilizable. En Streamlit, las usarás principalmente de dos formas: envolver cargas de datos en funciones decoradas con @st.cache_data, y encapsular cálculos financieros en funciones puras (sin efectos secundarios) que son fáciles de probar."
              : "Functions encapsulate reusable logic. In Streamlit you'll use them primarily two ways: wrapping data loads in @st.cache_data decorated functions, and encapsulating financial calculations in pure functions (no side effects) that are easy to test."}
          </p>
          <pre className="bg-[#050810] border border-gray-800 rounded-2xl p-5 overflow-x-auto text-sm text-gray-300 font-mono leading-relaxed">{`import streamlit as st
import pandas as pd

# Pure function — takes inputs, returns output, no side effects
def gross_margin(revenue: float, cogs: float) -> float:
    if revenue == 0:
        return 0.0
    return (revenue - cogs) / revenue * 100

def loan_payment(principal: float, annual_rate: float, years: int) -> float:
    r = annual_rate / 12
    n = years * 12
    if r == 0:
        return principal / n
    return principal * r * (1 + r) ** n / ((1 + r) ** n - 1)

# Cached function — runs once, then returns from cache
@st.cache_data(ttl=3600)
def load_data(path: str) -> pd.DataFrame:
    return pd.read_csv(path, parse_dates=["Date"])

# Usage in the app
revenue = st.number_input("Revenue £", value=500_000)
cogs    = st.number_input("COGS £",    value=300_000)
st.metric("Gross Margin", f"{gross_margin(revenue, cogs):.1f}%")`}</pre>
          <p className="text-sm text-blue-300 bg-blue-600/5 border border-blue-600/20 rounded-xl px-4 py-3">
            {es
              ? "Las anotaciones de tipo (revenue: float) son opcionales pero altamente recomendables — hacen el código más legible y ayudan a los IDEs a detectar errores antes de ejecutar."
              : "Type annotations (revenue: float) are optional but highly recommended — they make code more readable and help IDEs catch errors before you run anything."}
          </p>

          {/* ── 5. Loops ── */}
          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "5. Bucles y List Comprehensions" : "5. Loops and List Comprehensions"}
          </h2>
          <p>
            {es
              ? "Los bucles for recorren colecciones. Las list comprehensions son su versión compacta — muy comunes en Python real. En Streamlit los usarás para generar columnas, tarjetas de métricas y opciones de selectbox dinámicamente."
              : "For loops iterate over collections. List comprehensions are their compact version — very common in real Python. In Streamlit you'll use them to generate columns, metric cards and selectbox options dynamically."}
          </p>
          <pre className="bg-[#050810] border border-gray-800 rounded-2xl p-5 overflow-x-auto text-sm text-gray-300 font-mono leading-relaxed">{`import streamlit as st

kpis = [
    ("Revenue",      "£480k", "+12%"),
    ("Gross Margin", "42%",   "+2pp"),
    ("EBITDA",       "£96k",  "+18%"),
    ("Cash",         "£210k", "+5%"),
]

# Loop to generate metric cards
cols = st.columns(len(kpis))
for col, (label, value, delta) in zip(cols, kpis):
    col.metric(label, value, delta)

# List comprehension — build a list in one line
years   = [2020, 2021, 2022, 2023, 2024]
revenue = [320_000, 380_000, 440_000, 490_000, 560_000]

# Calculate YoY growth for each year (skip first)
growth = [
    (revenue[i] - revenue[i-1]) / revenue[i-1] * 100
    for i in range(1, len(revenue))
]
# → [18.75, 15.79, 11.36, 14.29]`}</pre>

          {/* ── 6. Pandas ── */}
          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "6. Pandas — La Librería Más Importante" : "6. Pandas — The Most Important Library"}
          </h2>
          <p>
            {es
              ? <>Pandas es el corazón de casi cualquier app Streamlit de finanzas. Un <strong className="text-white">DataFrame</strong> es una tabla con filas y columnas — piensa en él como un Excel con superpoderes programables. Las operaciones más importantes que necesitas dominar son: cargar, filtrar, agrupar y exportar.</>
              : <>Pandas is the heart of almost every Streamlit finance app. A <strong className="text-white">DataFrame</strong> is a table with rows and columns — think of it as an Excel spreadsheet with programmable superpowers. The most important operations to master: load, filter, group and export.</>}
          </p>
          <pre className="bg-[#050810] border border-gray-800 rounded-2xl p-5 overflow-x-auto text-sm text-gray-300 font-mono leading-relaxed">{`import pandas as pd

# Create a DataFrame
df = pd.DataFrame({
    "Date":     ["2024-01", "2024-02", "2024-03", "2024-04"],
    "Region":   ["UK", "UK", "US", "US"],
    "Revenue":  [120_000, 135_000, 200_000, 190_000],
    "Costs":    [ 80_000,  88_000, 130_000, 125_000],
})
df["Date"]   = pd.to_datetime(df["Date"])
df["Profit"] = df["Revenue"] - df["Costs"]
df["Margin"] = df["Profit"] / df["Revenue"] * 100

# Filter rows
uk_only = df[df["Region"] == "UK"]

# Group and aggregate
by_region = (
    df.groupby("Region")
    .agg(Total_Revenue=("Revenue","sum"), Avg_Margin=("Margin","mean"))
    .reset_index()
)

# In Streamlit
import streamlit as st
st.dataframe(df, use_container_width=True, hide_index=True)
st.dataframe(by_region.style.format({"Total_Revenue": "£{:,.0f}", "Avg_Margin": "{:.1f}%"}))`}</pre>

          {/* ── 7. Import ── */}
          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "7. Imports y Librerías" : "7. Imports and Libraries"}
          </h2>
          <p>
            {es
              ? "Python tiene un ecosistema enorme de librerías. En apps Streamlit de finanzas, usarás las mismas 6-8 librerías una y otra vez. No necesitas memorizar toda su API — solo las funciones que aparecen en el 80% de los proyectos."
              : "Python has a huge ecosystem of libraries. In Streamlit finance apps, you'll use the same 6–8 libraries repeatedly. You don't need to memorise their entire API — just the functions that appear in 80% of projects."}
          </p>
          <pre className="bg-[#050810] border border-gray-800 rounded-2xl p-5 overflow-x-auto text-sm text-gray-300 font-mono leading-relaxed">{`# The core finance app stack
import streamlit as st          # UI and layout
import pandas as pd             # DataFrames and data manipulation
import numpy as np              # Numerical calculations
import plotly.express as px     # Interactive charts
import plotly.graph_objects as go  # Fine-grained chart control
from io import BytesIO          # In-memory file buffer for exports
import requests                 # API calls
import yfinance as yf           # Stock and financial data

# Import only what you need from a module
from datetime import date, timedelta
from pathlib import Path

# Alias long names for convenience
import matplotlib.pyplot as plt  # Matplotlib — static charts`}</pre>
          <p className="text-sm">
            {es
              ? "Añade todas estas al fichero requirements.txt de tu proyecto para que Streamlit Cloud o Railway las instalen automáticamente al desplegar."
              : "Add all of these to your project's requirements.txt so Streamlit Cloud or Railway install them automatically on deploy."}
          </p>

          {/* ── 8. Error Handling ── */}
          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "8. Manejo de Errores" : "8. Error Handling"}
          </h2>
          <p>
            {es
              ? "Las apps de finanzas reciben entradas de usuario y datos externos — ambas fuentes pueden fallar. El bloque try/except evita que un error crache toda la app. En Streamlit, combínalo con st.error() para mostrar mensajes útiles en lugar de stack traces."
              : "Finance apps receive user input and external data — both sources can fail. The try/except block prevents a single error from crashing the entire app. In Streamlit, combine it with st.error() to show helpful messages instead of stack traces."}
          </p>
          <pre className="bg-[#050810] border border-gray-800 rounded-2xl p-5 overflow-x-auto text-sm text-gray-300 font-mono leading-relaxed">{`import streamlit as st
import pandas as pd
import requests

# Handle file upload errors
uploaded = st.file_uploader("Upload CSV", type=["csv"])
if uploaded:
    try:
        df = pd.read_csv(uploaded)
        required = {"Date", "Revenue", "Region"}
        missing  = required - set(df.columns)
        if missing:
            st.error(f"Missing columns: {', '.join(missing)}")
            st.stop()
        st.success(f"Loaded {len(df):,} rows")
    except Exception as e:
        st.error(f"Could not read file: {e}")
        st.stop()

# Handle API errors
@st.cache_data(ttl=300)
def get_rates(base: str) -> dict:
    try:
        r = requests.get(f"https://api.example.com/rates?base={base}", timeout=10)
        r.raise_for_status()
        return r.json()
    except requests.Timeout:
        st.warning("API timed out — showing cached data")
        return {}
    except requests.HTTPError as e:
        st.error(f"API error: {e}")
        return {}`}</pre>

          {/* ── 9. Classes ── */}
          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "9. Lo que NO Necesitas (Todavía)" : "9. What You Don't Need (Yet)"}
          </h2>
          <p>
            {es
              ? "Mucha gente pospone aprender Streamlit porque asume que necesita dominar toda la orientación a objetos (clases, herencia, métodos mágicos), decoradores avanzados, programación asíncrona o algoritmos de machine learning. No lo necesitas para construir apps de finanzas útiles y profesionales."
              : "Many people delay learning Streamlit because they assume they need to master full object-oriented programming (classes, inheritance, magic methods), advanced decorators, async programming or machine learning algorithms. You don't need any of that to build useful, professional finance apps."}
          </p>
          <ul className="space-y-2 list-none pl-0">
            {(es ? [
              ["✗", "red", "Clases y orientación a objetos — útiles, pero no necesarias para Streamlit"],
              ["✗", "red", "Programación asíncrona (async/await) — Streamlit maneja la concurrencia por ti"],
              ["✗", "red", "Algoritmos ML — a menos que tu app los necesite específicamente"],
              ["✗", "red", "Decoradores personalizados — @st.cache_data es el único que usarás habitualmente"],
              ["✓", "green", "Variables, listas, diccionarios, funciones, if/else, loops — todo lo anterior es suficiente"],
            ] : [
              ["✗", "red", "Classes and OOP — useful, but not required for Streamlit"],
              ["✗", "red", "Async programming (async/await) — Streamlit handles concurrency for you"],
              ["✗", "red", "ML algorithms — unless your app specifically needs them"],
              ["✗", "red", "Custom decorators — @st.cache_data is the only one you'll use routinely"],
              ["✓", "green", "Variables, lists, dicts, functions, if/else, loops — everything above is enough to start"],
            ]).map(([icon, color, text]) => (
              <li key={String(text)} className="flex gap-2">
                <span className={color === "red" ? "text-red-400" : "text-green-400"}>{icon}</span>
                {String(text)}
              </li>
            ))}
          </ul>

          {/* ── 10. Putting it Together ── */}
          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "10. Juntando Todo — Una App Completa" : "10. Putting It Together — A Complete App"}
          </h2>
          <p>
            {es
              ? "Esta app de ejemplo usa todos los conceptos anteriores: variables, listas, funciones, pandas, condicionales y manejo de errores. Es una calculadora de margen bruto con exportación CSV — 40 líneas, completamente funcional."
              : "This example app uses every concept above: variables, lists, functions, pandas, conditionals and error handling. It's a gross margin calculator with CSV export — 40 lines, fully functional."}
          </p>
          <pre className="bg-[#050810] border border-gray-800 rounded-2xl p-5 overflow-x-auto text-sm text-gray-300 font-mono leading-relaxed">{`import streamlit as st
import pandas as pd
import plotly.express as px

st.title("Gross Margin Analyser")

# ── Input ──────────────────────────────────────────
months  = ["Jan","Feb","Mar","Apr","May","Jun",
           "Jul","Aug","Sep","Oct","Nov","Dec"]
revenue = [st.number_input(f"{m} Revenue £", value=40_000 + i*2_000, key=f"rev_{i}")
           for i, m in enumerate(months)]
cogs    = [r * 0.6 for r in revenue]          # assume 60% COGS

# ── Calculate ──────────────────────────────────────
df = pd.DataFrame({
    "Month":   months,
    "Revenue": revenue,
    "COGS":    cogs,
    "Profit":  [r - c for r, c in zip(revenue, cogs)],
    "Margin":  [(r - c) / r * 100 if r > 0 else 0 for r, c in zip(revenue, cogs)],
})

# ── KPIs ───────────────────────────────────────────
col1, col2, col3 = st.columns(3)
col1.metric("Total Revenue", f"£{df['Revenue'].sum():,.0f}")
col2.metric("Total Profit",  f"£{df['Profit'].sum():,.0f}")
col3.metric("Avg Margin",    f"{df['Margin'].mean():.1f}%")

# ── Chart ──────────────────────────────────────────
fig = px.bar(df, x="Month", y="Profit", color="Margin",
             color_continuous_scale="RdYlGn", title="Monthly Profit & Margin")
st.plotly_chart(fig, use_container_width=True)

# ── Export ─────────────────────────────────────────
st.download_button("⬇ Download CSV", df.to_csv(index=False), "margin.csv", "text/csv")`}</pre>

          {/* ── Where to go next ── */}
          <h2 className="text-2xl font-bold text-white mt-10">
            {es ? "¿Por Dónde Seguir?" : "Where to Go Next"}
          </h2>
          <p>
            {es
              ? "Con estos conceptos puedes construir herramientas de finanzas reales. El siguiente paso es aprender a estructurar apps multi-página, conectar a fuentes de datos externas (APIs, bases de datos) y desplegar en producción. Todo eso está cubierto en las lecciones interactivas de Streamlit en FinancePlots."
              : "With these concepts you can build real finance tools. The next step is learning how to structure multi-page apps, connect to external data sources (APIs, databases) and deploy to production. All of that is covered in the interactive Streamlit lessons on FinancePlots."}
          </p>

          <div className="bg-[#0d1426] border border-blue-600/20 rounded-2xl p-6 mt-4">
            <p className="text-blue-300 font-semibold mb-2">
              {es ? "Próximos pasos →" : "Continue learning →"}
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/learn/streamlit" className="text-blue-400 hover:text-blue-300 transition">
                  {es ? "→ 40 lecciones interactivas de Streamlit — gratis en FinancePlots" : "→ 40 interactive Streamlit lessons — free on FinancePlots"}
                </a>
              </li>
              <li>
                <a href="/tools" className="text-blue-400 hover:text-blue-300 transition">
                  {es ? "→ Ver las herramientas financieras en producción (todas construidas con Streamlit)" : "→ See the finance tools in production (all built with Streamlit)"}
                </a>
              </li>
            </ul>
          </div>

        </div>

        <ShareButtons
          url="https://www.financeplots.com/blog/python-for-streamlit"
          title={es
            ? "Python Básico para Streamlit: Lo Que Realmente Necesitas Saber"
            : "Python Basics for Streamlit: What You Actually Need to Know"}
        />

      </BlogArticleShell>
    </main>
  );
}
