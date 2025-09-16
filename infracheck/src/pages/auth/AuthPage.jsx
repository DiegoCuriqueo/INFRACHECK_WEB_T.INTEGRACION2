import React, { useCallback } from "react";
import { Link, useForm, router } from "@inertiajs/react";



function Logo({ src = "/Logo.png", alt = "InfraCheck" }) {
  return (
    <div className="w-80 h-80 md:w-96 md:h-96 select-none mx-auto">
      <img src={src} alt={alt} className="w-full h-full object-contain" />
    </div>
  );
}

const Field = React.memo(function Field({ id, label, error, ...props }) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-xs uppercase tracking-wider text-gray-300/80"
      >
        {label}
      </label>
      <input
        id={id}
        className="w-full rounded-lg border border-white/10 bg-[#0f1420] px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#3A5ACF]"
        {...props}
      />
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
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
        <Link
          href="/password/forgot"
          className="text-gray-400 hover:text-gray-200"
        >
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
        onChange={(e) =>
          form.setData("password_confirmation", e.target.value)
        }
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

// Scroll suave
function useSmoothScroll() {
  const onNavClick = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  return onNavClick;
}

export default function AuthLanding() {
  const [mode, setMode] = React.useState("login");
  const toggle = useCallback(
    () => setMode((m) => (m === "login" ? "register" : "login")),
    []
  );
  const onNavClick = useSmoothScroll();
  const flipClass = mode === "register" ? "rotate-y-180" : "rotate-y-0";

  return (
    <div className="min-h-screen bg-[#0b1020] px-6 py-12 text-white md:px-14 space-y-20">
      {/* NAV */}
      <header className="flex items-center justify-between">
        <nav className="flex gap-10 text-sm tracking-wide">
          <button
            onClick={() => onNavClick("inicio")}
            className="hover:text-white text-gray-300"
          >
            INICIO
          </button>
          <button
            onClick={() => onNavClick("laweb")}
            className="hover:text-white text-gray-300"
          >
            LA WEB
          </button>
          <button
            onClick={() => onNavClick("funciones")}
            className="hover:text-white text-gray-300"
          >
            FUNCIONES
          </button>
          <button
            onClick={() => onNavClick("resenas")}
            className="hover:text-white text-gray-300"
          >
            RESEÑAS
          </button>
        </nav>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setMode("login")}
            className={`text-sm transition ${
              mode === "login"
                ? "text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            INICIAR SESIÓN
          </button>
          <button
            onClick={() => setMode("register")}
            className={`text-sm transition ${
              mode === "register"
                ? "text-white"
                : "text-gray-400 hover:text-gray-200"
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

      {/* HERO */}
      <main className="grid grid-cols-1 gap-16 md:grid-cols-[1.2fr_1fr] items-start">
        <div className="flex items-center justify-center md:pl-8">
          <Logo />
        </div>

        {/* Tarjeta giratoria */}
        <div className="mx-auto w-full max-w-md [perspective:1200px]">
          <div
            className={`relative h-[480px] w-full transition-transform duration-700 [transform-style:preserve-3d] ${flipClass}`}
          >
            {/* Login */}
            <section className="absolute inset-0 [backface-visibility:hidden] rounded-2xl bg-[#141927] p-8 shadow-2xl ring-1 ring-white/10">
              <h2 className="mb-8 text-center text-base tracking-widest text-gray-300">
                INICIA SESIÓN
              </h2>
              <LoginForm />
            </section>
            {/* Registro */}
            <section className="absolute inset-0 rotate-y-180 [backface-visibility:hidden] rounded-2xl bg-[#141927] p-8 shadow-2xl ring-1 ring-white/10">
              <h2 className="mb-8 text-center text-base tracking-widest text-gray-300">
                CREA TU CUENTA
              </h2>
              <RegisterForm />
            </section>
          </div>
        </div>
      </main>

      {/* Secciones destino (igual que antes)... */}
    </div>
  );
}
