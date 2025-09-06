import React, { useCallback } from "react";
import { Link, useForm, router } from "@inertiajs/react";

/** Logo: el tamaño se controla por el contenedor (por defecto 112px).
 *  Cambia w-28 h-28 por w-24 h-24 (96px) o w-20 h-20 (80px) si lo quieres más chico.
 */
function Logo({ src = "/logo.png", alt = "InfraCheck logo" }) {
  return (
    <div className="w-25 h-25">
      <img src={src} alt={alt} className="w-25 h-25 object-contain" />
    </div>
  );
}

const Field = React.memo(function Field({ id, label, error, ...props }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-xs uppercase tracking-wider text-gray-400"
      >
        {label}
      </label>
      <input
        id={id}
        className="w-full rounded-lg border border-white/10 bg-[#0f1420] px-3 py-2 text-sm text-white placeholder-gray-500 outline-none ring-0 focus:border-[#3A5ACF]"
        {...props}
      />
      {error ? <p className="mt-1 text-xs text-red-400">{error}</p> : null}
    </div>
  );
});

function LoginForm() {
  const form = useForm({ username: "", password: "", remember: false });

  const onSubmit = (e) => {
    e.preventDefault();
    router.post("/login", form.data(), {
      preserveScroll: true,
      replace: true,
      onFinish: () => form.setData("password", ""),
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field
        id="username"
        name="username"
        label="usuario"
        type="text"
        autoComplete="username"
        value={form.data.username}
        onChange={(e) => form.setData("username", e.target.value)}
        error={form.errors?.username}
      />

      <Field
        id="password"
        name="password"
        label="contraseña"
        type="password"
        autoComplete="current-password"
        value={form.data.password}
        onChange={(e) => form.setData("password", e.target.value)}
        error={form.errors?.password}
      />

      <div className="flex justify-center text-sm mt-2">
        <Link href="/password/forgot" className="text-gray-400 hover:text-gray-200">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <button
        type="submit"
        className="mt-2 w-full rounded-xl bg-[#3A5ACF] px-4 py-2 font-medium text-white shadow hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[#3A5ACF]/60 disabled:opacity-60"
        disabled={form.processing}
      >
        Ingresar
      </button>

      {form.errors && Object.keys(form.errors).length > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-red-400">
          {Object.entries(form.errors).map(([k, v]) => (
            <li key={k}>{v}</li>
          ))}
        </ul>
      )}
    </form>
  );
}

function RegisterForm() {
  const form = useForm({
    name: "",
    email: "",
    username: "",
    password: "",
    password_confirmation: "",
  });

  const onSubmit = (e) => {
    e.preventDefault();
    router.post("/register", form.data(), {
      preserveScroll: true,
      replace: true,
      onFinish: () => {
        form.setData("password", "");
        form.setData("password_confirmation", "");
      },
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field
        id="username"
        name="username"
        label="usuario"
        type="text"
        value={form.data.username}
        onChange={(e) => form.setData("username", e.target.value)}
        error={form.errors?.username}
      />

      <Field
        id="email"
        name="email"
        label="email"
        type="email"
        autoComplete="email"
        value={form.data.email}
        onChange={(e) => form.setData("email", e.target.value)}
        error={form.errors?.email}
      />

      <Field
        id="password"
        name="password"
        label="contraseña"
        type="password"
        autoComplete="new-password"
        value={form.data.password}
        onChange={(e) => form.setData("password", e.target.value)}
        error={form.errors?.password}
      />

      <Field
        id="password_confirmation"
        name="password_confirmation"
        label="confirmar contraseña"
        type="password"
        autoComplete="new-password"
        value={form.data.password_confirmation}
        onChange={(e) => form.setData("password_confirmation", e.target.value)}
        error={form.errors?.password_confirmation}
      />

      <button
        type="submit"
        className="mt-2 w-full rounded-xl bg-[#3A5ACF] px-4 py-2 font-medium text-white shadow hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[#3A5ACF]/60 disabled:opacity-60"
        disabled={form.processing}
      >
        Crear cuenta
      </button>

      {form.errors && Object.keys(form.errors).length > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-red-400">
          {Object.entries(form.errors).map(([k, v]) => (
            <li key={k}>{v}</li>
          ))}
        </ul>
      )}
    </form>
  );
}

export default function AuthPage() {
  const [mode, setMode] = React.useState("login");
  const toggle = useCallback(
    () => setMode((m) => (m === "login" ? "register" : "login")),
    []
  );

  return (
    <div className="min-h-screen bg-[#0b1020] px-6 py-8 text-white md:px-10">
      {/* NAV */}
      <header className="flex items-center justify-between">
        <nav className="flex gap-8 text-sm tracking-wide">
          <span className="hover:text-white cursor-default select-none">INICIO</span>
          <span className="hover:text-white cursor-default select-none">LA WEB</span>
          <span className="hover:text-white cursor-default select-none">FUNCIONES</span>
          <span className="hover:text-white cursor-default select-none">RESEÑAS</span>
        </nav>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setMode("login")}
            className={`text-sm transition ${
              mode === "login" ? "text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            INICIAR SESIÓN
          </button>
          <button
            onClick={() => setMode("register")}
            className={`text-sm transition ${
              mode === "register" ? "text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            REGÍSTRATE
          </button>

          <button
            type="button"
            role="switch"
            aria-checked={mode === "register"}
            aria-label="Cambiar entre iniciar sesión y registrarse"
            onClick={toggle}
            className="relative h-6 w-12 cursor-pointer rounded-full bg-gray-600/60 ring-1 ring-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-[#3A5ACF] shadow transition-all ${
                mode === "register" ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>
      </header>

{/* MAIN */}
<main className="mt-10 grid grid-cols-1 items-start gap-10 md:grid-cols-[1.2fr_1fr]">
  {/* Logo */}
  <div className="flex items-start gap-6 md:pl-8">
    <Logo />
  </div>

      {/* Formulario */}
        <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl bg-[#141927] p-6 shadow-2xl ring-1 ring-white/10">
        <h2 className="mb-6 text-center text-sm tracking-widest text-gray-300">
          {mode === "login" ? "INICIA SESIÓN" : "CREA TU CUENTA"}
        </h2>
        {mode === "login" ? <LoginForm /> : <RegisterForm />}
        </div>
        </div>
      </main>


      {/* FOOTER */}
      <footer className="mt-10 flex items-center justify-between text-xs text-gray-500">
      </footer>
    </div>
  );
}
