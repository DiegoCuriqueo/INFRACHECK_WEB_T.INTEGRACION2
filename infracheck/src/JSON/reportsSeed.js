// Ejemplos compartidos de reportes para las secciones Usuario y Autoridad
export const SEED = [
  {
    id: "r1",
    user: "Usuario",
    title: "Bache profundo en Av. Alemania",
    summary:
      "Hueco de ~50 cm que provoca desvíos bruscos. Alto flujo horario punta.",
    category: "Vialidad",
    urgency: "alta",
    image:
      "https://images.unsplash.com/photo-1617727553256-84de7c1240e8?q=80&w=1200&auto=format&fit=crop",
    votes: 254,
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    lat: -38.7411,
    lng: -72.598,
    address: "Av. Alemania 1450, Temuco",
  },
  {
    id: "r2",
    user: "Usuario",
    title: "Baldosas sueltas en Plaza Aníbal Pinto",
    summary:
      "Tramo resbaladizo y con desniveles. Riesgo de caídas de adultos mayores.",
    category: "Espacio público",
    urgency: "media",
    image:
      "https://images.unsplash.com/photo-1603706581421-89f8b7a38f9b?q=80&w=1200&auto=format&fit=crop",
    votes: 254,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    lat: -38.7388,
    lng: -72.604,
    address: "Plaza Aníbal Pinto, Temuco",
  },
  {
    id: "r3",
    user: "Usuario",
    title: "Luminaria apagada en pasaje Los Robles",
    summary:
      "Sector oscuro durante la noche. Solicita recambio de ampolleta y revisión de poste.",
    category: "Iluminación",
    urgency: "baja",
    image:
      "https://images.unsplash.com/photo-1519683021815-c9f8a8b0f1b0?q=80&w=1200&auto=format&fit=crop",
    votes: 73,
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    lat: -38.7482,
    lng: -72.59,
    address: "Psje. Los Robles 220, Temuco",
  },
];