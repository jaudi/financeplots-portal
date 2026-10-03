// The names people know companies by, where the pipeline's name (Yahoo's
// listing name) reads badly: legal suffixes in capitals ("ACCIONES IBERDROLA",
// "TELEFONICA,S.A."), or no name at all (Inditex came through as "ITX.MC").
// Applied when the universe is loaded (lib/universe.ts), so the company pages,
// the search, the screener and the MCP all show the same name, whatever week's
// data is live. The full legal names stay findable through `also` in
// lib/symbol-search.ts.
//
// A name only, never a description: nothing here may hint at a view on the company.

export const DISPLAY_NAMES: Record<string, string> = {
  // IBEX 35
  "ACS.MC": "ACS",
  "ACX.MC": "Acerinox",
  "AENA.MC": "Aena",
  "AMS.MC": "Amadeus",
  "ANA.MC": "Acciona",
  "ANE.MC": "Acciona Energía",
  "BBVA.MC": "BBVA",
  "BKT.MC": "Bankinter",
  "CABK.MC": "CaixaBank",
  "CLNX.MC": "Cellnex",
  "COL.MC": "Colonial",
  "ELE.MC": "Endesa",
  "ENG.MC": "Enagás",
  "FDR.MC": "Fluidra",
  "FER.MC": "Ferrovial",
  "GRF.MC": "Grifols",
  "IAG.MC": "IAG (International Airlines Group)",
  "IBE.MC": "Iberdrola",
  "IDR.MC": "Indra",
  "ITX.MC": "Inditex",
  "LOG.MC": "Logista",
  "MAP.MC": "Mapfre",
  "MRL.MC": "Merlin Properties",
  "MTS.MC": "ArcelorMittal",
  "NTGY.MC": "Naturgy",
  "PUIG.MC": "Puig",
  "RED.MC": "Redeia",
  "REP.MC": "Repsol",
  "ROVI.MC": "Rovi",
  "SAB.MC": "Banco Sabadell",
  "SAN.MC": "Banco Santander",
  "SCYR.MC": "Sacyr",
  "SLR.MC": "Solaria",
  "TEF.MC": "Telefónica",
  "UNI.MC": "Unicaja",
  // S&P 500
  CRH: "CRH plc",
};

/** The name to show for a ticker: ours where the source's reads badly, else the source's. */
export function displayName(ticker: string, sourceName: string | null | undefined): string {
  return DISPLAY_NAMES[ticker] ?? (sourceName && sourceName !== ticker ? sourceName : ticker);
}
