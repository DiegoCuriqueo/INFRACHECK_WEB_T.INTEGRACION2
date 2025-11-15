// services/getUserService.js

export async function getUsers() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}api/users/`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (!res.ok) {
      console.error("❌ API Error:", res.status, res.statusText);
      const text = await res.text();
      console.error("❌ Respuesta de la API:", text);
      throw new Error("Error al obtener usuarios");
    }

    const data = await res.json();
    console.log("🔍 Respuesta completa de API:", data);

    // 🔥 LA API ENTREGA LOS USUARIOS AQUÍ:
    // { success: true, data: [ ... ] }
    return data.data; // array real de 16 usuarios
  } catch (err) {
    console.error(err);
    throw new Error("Error al obtener usuarios");
  }
}
