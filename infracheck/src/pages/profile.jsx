import "../styles/profile.css";

export default function Profile() {
  const user = {
    nombre: "Ricardo Peña",
    email: "ricardo@example.com",
    rut: "11.111.111-1",
    direccion: "Av. Siempre Viva 123, Temuco",
  };

  return (
    <div className="profile-container">
      <h1>Perfil de Usuario</h1>
      <div className="profile-card">
        <img alt="avatar" />
        <h2>{user.nombre}</h2>
        <button>Correo: {user.email}</button>
        <button>RUT: {user.rut}</button>
        <button>Dirección: {user.direccion}</button>
      </div>
    </div>
  );
}
