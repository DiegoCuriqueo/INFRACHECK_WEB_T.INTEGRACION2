// Conjunto simple de regiones y comunas para flujo región→comuna.
// Se puede extender o reemplazar por datos remotos más adelante.

export const REGIONS = [
  "Araucanía",
  "Metropolitana",
  "Valparaíso",
  "Biobío",
  "Los Lagos",
  "Antofagasta",
];

export const COMMUNES_BY_REGION = {
  Araucanía: ["Temuco", "Padre Las Casas", "Villarrica", "Pucón"],
  Metropolitana: ["Santiago", "Puente Alto", "Maipú", "Las Condes"],
  Valparaíso: ["Valparaíso", "Viña del Mar", "Quilpué"],
  Biobío: ["Concepción", "Talcahuano", "San Pedro de la Paz"],
  "Los Lagos": ["Puerto Montt", "Osorno", "Castro"],
  Antofagasta: ["Antofagasta", "Calama", "Mejillones"],
};

export const getRegions = () => REGIONS;
export const getCommunes = (region) => (COMMUNES_BY_REGION[region] ?? []).slice();