import DashboardLayout from "../../layout/DashboardLayout";

export default function ProfileAU() {
  const user = {
    nombre: "Ricardo Peña",
    email: "ricardo@example.com",
    rut: "11.111.111-1",
    direccion: "Av. Siempre Viva 123, Temuco",
  };

  return (
    <DashboardLayout>
      <div className="min-h-[70vh] grid place-items-center">
        <div className="w-full max-w-xl bg-slate-800/60 border border-slate-700/60 rounded-2xl p-8 shadow-xl">
          <h1 className="text-center text-lg text-slate-200 mb-6">Perfil de Usuario</h1>

          <div className="flex flex-col items-center">
            <div className="h-28 w-28 rounded-full bg-indigo-600/20 border border-indigo-500/30 grid place-content-center text-indigo-300 text-4xl">
              👤
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-100">{user.nombre}</h2>

            <div className="mt-6 w-full space-y-3">
              <button className="w-full px-4 py-3 rounded-xl bg-indigo-600/30 text-indigo-200 hover:bg-indigo-600/40 transition">
                Correo: {user.email}
              </button>
              <button className="w-full px-4 py-3 rounded-xl bg-indigo-600/30 text-indigo-200 hover:bg-indigo-600/40 transition">
                RUT: {user.rut}
              </button>
              <button className="w-full px-4 py-3 rounded-xl bg-indigo-600/30 text-indigo-200 hover:bg-indigo-600/40 transition">
                Dirección: {user.direccion}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
