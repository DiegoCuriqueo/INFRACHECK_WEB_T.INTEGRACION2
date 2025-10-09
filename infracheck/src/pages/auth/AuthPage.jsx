import React, { useCallback } from "react";
import { loginUser, getUserData } from "../../services/authService";
import { registerUser, validateRutFormat, cleanPhoneNumber, validateEmail } from "../../services/registerService";
import { useAuth } from "../../contexts/AuthContext";

// ---------- helpers ----------
function redirectByRole(user) {
  const role =
    (user?.rol_nombre || user?.rol?.rol_nombre || "").toLowerCase();

  if (role === "admin") return "/admin/home";
  if (role === "autoridad" || role === "authority") return "/autority/home";
  return "/user/home"; // por defecto Usuario
}

// ---------- UI base ----------
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
      <label htmlFor={id} className="block text-xs uppercase tracking-wider text-gray-300/80">
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

// ---------- LOGIN ----------
function LoginForm() {
  const { login } = useAuth(); // usa el contexto
  const [data, setData] = React.useState({ rut: "", password: "" });
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  const onChange = (e) => setData((d) => ({ ...d, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      // hace POST /v1/login/ y guarda token + user_data en localStorage
      await login({ rut: data.rut.trim(), password: data.password });

      // leemos usuario y redirigimos según rol
      const user = getUserData();
      const dest = redirectByRole(user);
      window.location.href = dest;
    } catch (err) {
      setErrors({ form: err.message || "No se pudo iniciar sesión" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field
        id="rut"
        name="rut"
        label="RUT"
        type="text"
        placeholder="12345678-9"
        autoComplete="username"
        value={data.rut}
        onChange={onChange}
        error={errors.rut}
      />

      <Field
        id="password"
        name="password"
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        value={data.password}
        onChange={onChange}
        error={errors.password}
      />

      <div className="flex justify-center text-sm mt-2">
        <a href="/password/forgot" className="text-gray-400 hover:text-gray-200">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      <button
        type="submit"
        className="mt-2 w-full rounded-xl bg-[#3A5ACF] px-4 py-2 font-medium text-white shadow hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[#3A5ACF]/60 disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>

      {errors.form && <p className="text-xs text-red-400">{errors.form}</p>}
    </form>
  );
}

// ---------- REGISTRO ----------
function RegisterForm() {
  const { login } = useAuth(); // por si quieres auto-login
  const [data, setData] = React.useState({
    rut: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const onChange = (e) => setData((d) => ({ ...d, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!validateRutFormat(data.rut.trim())) e.rut = "RUT no tiene formato válido (12345678-9).";
    if (!validateEmail(data.email.trim())) e.email = "Email no válido.";
    if (!data.username.trim()) e.username = "Usuario requerido.";
    if (data.password.length < 6) e.password = "Mínimo 6 caracteres.";
    if (data.password !== data.confirmPassword) e.confirmPassword = "Las contraseñas no coinciden.";
    return e;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const eClient = validate();
    if (Object.keys(eClient).length) {
      setErrors(eClient);
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const payload = {
        ...data,
        phone: cleanPhoneNumber(data.phone || ""),
        rut: data.rut.trim(),
        email: data.email.trim().toLowerCase(),
        username: data.username.trim(),
      };

      await registerUser(payload);

      // opción A: pedir login manual
      alert("Cuenta creada. Ahora inicia sesión.");
      window.scrollTo({ top: 0, behavior: "smooth" });

      // opción B: auto-login inmediato (descomenta si lo quieres)
      // await login({ rut: payload.rut, password: payload.password });
      // const user = getUserData();
      // window.location.href = redirectByRole(user);

      setData({
        rut: "",
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setErrors({ form: err.message || "No se pudo registrar el usuario" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field id="rut" name="rut" label="RUT" type="text" placeholder="12345678-9" value={data.rut} onChange={onChange} error={errors.rut} />
      <Field id="username" name="username" label="Usuario" type="text" value={data.username} onChange={onChange} error={errors.username} />
      <Field id="email" name="email" label="Email" type="email" autoComplete="email" value={data.email} onChange={onChange} error={errors.email} />
      <Field id="phone" name="phone" label="Teléfono (opcional)" type="text" placeholder="+56 9 1234 5678" value={data.phone} onChange={onChange} error={errors.phone} />
      <Field id="password" name="password" label="Contraseña" type="password" autoComplete="new-password" value={data.password} onChange={onChange} error={errors.password} />
      <Field id="confirmPassword" name="confirmPassword" label="Confirmar contraseña" type="password" autoComplete="new-password" value={data.confirmPassword} onChange={onChange} error={errors.confirmPassword} />

      <button
        type="submit"
        className="mt-2 w-full rounded-xl bg-[#3A5ACF] px-4 py-2 font-medium text-white shadow hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[#3A5ACF]/60 disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </button>

      {errors.form && <p className="text-xs text-red-400">{errors.form}</p>}
    </form>
  );
}

// ---------- Contenedor/landing con flip ----------
function useSmoothScroll() {
  const onNavClick = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  return onNavClick;
}

export default function AuthLanding() {
  const [mode, setMode] = React.useState("login");
  const toggle = useCallback(() => setMode((m) => (m === "login" ? "register" : "login")), []);
  const onNavClick = useSmoothScroll();
  const flipClass = mode === "register" ? "rotate-y-180" : "rotate-y-0";

  return (
    <div className="min-h-screen bg-[#0b1020] px-6 py-12 text-white md:px-14 space-y-20">
      {/* NAV */}
      <header className="flex items-center justify-between">
        <nav className="flex gap-10 text-sm tracking-wide">
          <button onClick={() => onNavClick("inicio")} className="hover:text-white text-gray-300">INICIO</button>
          <button onClick={() => onNavClick("laweb")} className="hover:text-white text-gray-300">LA WEB</button>
          <button onClick={() => onNavClick("funciones")} className="hover:text-white text-gray-300">FUNCIONES</button>
          <button onClick={() => onNavClick("resenas")} className="hover:text-white text-gray-300">RESEÑAS</button>
        </nav>

        <div className="flex items-center gap-6">
          <button onClick={() => setMode("login")} className={`text-sm transition ${mode === "login" ? "text-white" : "text-gray-400 hover:text-gray-200"}`}>INICIAR SESIÓN</button>
          <button onClick={() => setMode("register")} className={`text-sm transition ${mode === "register" ? "text-white" : "text-gray-400 hover:text-gray-200"}`}>REGÍSTRATE</button>

          <button
            type="button"
            role="switch"
            aria-checked={mode === "register"}
            aria-label="Cambiar entre iniciar sesión y registrarse"
            onClick={toggle}
            className="relative h-6 w-12 cursor-pointer rounded-full bg-gray-600/60 ring-1 ring-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-[#3A5ACF] shadow transition-all ${mode === "register" ? "left-6" : "left-1"}`} />
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
          <div className={`relative h-[520px] w-full transition-transform duration-700 [transform-style:preserve-3d] ${flipClass}`}>
            {/* Login */}
            <section className="absolute inset-0 [backface-visibility:hidden] rounded-2xl bg-[#141927] p-8 shadow-2xl ring-1 ring-white/10">
              <h2 className="mb-6 text-center text-base tracking-widest text-gray-300">INICIA SESIÓN</h2>
              <LoginForm />
            </section>
            {/* Registro */}
            <section className="absolute inset-0 rotate-y-180 [backface-visibility:hidden] rounded-2xl bg-[#141927] p-8 shadow-2xl ring-1 ring-white/10">
              <h2 className="mb-6 text-center text-base tracking-widest text-gray-300">CREA TU CUENTA</h2>
              <RegisterForm />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
