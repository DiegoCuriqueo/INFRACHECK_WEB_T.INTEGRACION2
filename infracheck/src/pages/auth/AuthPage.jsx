import React, { useCallback, useState } from "react";
import { Lock, Mail, User, Phone, CreditCard, Eye, EyeOff } from "lucide-react";

// ---------- Componente de fondo animado ----------
function AnimatedBackground() {
  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-[300px] h-[300px] -top-24 -left-24 rounded-full bg-indigo-500/10 animate-float" />
        <div className="absolute w-[200px] h-[200px] -bottom-12 -right-12 rounded-full bg-purple-500/10 animate-float-delayed" />
        <div className="absolute w-[150px] h-[150px] top-1/2 right-[10%] rounded-full bg-blue-500/10 animate-float-slow" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 30px) scale(0.9); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30px, 40px) scale(1.05); }
          66% { transform: translate(20px, -30px) scale(0.95); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15px, 25px) scale(1.08); }
        }
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        .animate-float { animation: float 20s infinite ease-in-out; }
        .animate-float-delayed { animation: float-delayed 25s infinite ease-in-out; }
        .animate-float-slow { animation: float-slow 30s infinite ease-in-out; }
        .animate-pulse-subtle { animation: pulse-subtle 4s ease-in-out infinite; }
        .rotate-y-0 { transform: rotateY(0deg); }
        .rotate-y-180 { transform: rotateY(180deg); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.7); }
      `}</style>
    </>
  );
}

function Logo({ src = "/logo2.png", alt = "InfraCheck" }) {
  return (
    <div className="w-80 h-80 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px] select-none mx-auto drop-shadow-2xl animate-pulse-subtle">
      <img src={src} alt={alt} className="w-full h-full object-contain" />
    </div>
  );
}

const Field = React.memo(function Field({ id, label, error, type = "text", value, onChange, name, icon: Icon, ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
        )}
        <input
          id={id}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          className={`w-full rounded-lg border border-white/10 bg-[#0f1420]/60 backdrop-blur-sm ${Icon ? 'pl-10' : 'pl-3.5'} pr-10 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-indigo-500 focus:bg-[#0f1420]/80 focus:ring-2 focus:ring-indigo-500/30`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-indigo-400 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
});

function LoginForm() {
  const [data, setData] = useState({ rut: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const onChange = (e) => setData((d) => ({ ...d, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      alert("Login simulado - Conecta con tu authService");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <Field
        id="rut"
        name="rut"
        label="Rodera"
        type="text"
        placeholder="12345678-9"
        autoComplete="username"
        value={data.rut}
        onChange={onChange}
        error={errors.rut}
        icon={CreditCard}
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
        icon={Lock}
      />

      <div className="flex justify-center text-sm pt-1">
        <a href="/password/forgot" className="text-gray-400 hover:text-indigo-400 transition-colors">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      <button
        onClick={onSubmit}
        className="mt-4 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-100 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/60 disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>

      {errors.form && <p className="text-xs text-red-400 text-center mt-2">{errors.form}</p>}
    </div>
  );
}

function RegisterForm() {
  const [data, setData] = useState({
    rut: "", username: "", email: "", phone: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setData((d) => ({ ...d, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      alert("Registro simulado - Conecta con tu registerService");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field id="rut" name="rut" label="RUT" type="text" placeholder="12345678-9" value={data.rut} onChange={onChange} error={errors.rut} icon={CreditCard} />
        <Field id="username" name="username" label="Usuario" type="text" placeholder="Nombre" value={data.username} onChange={onChange} error={errors.username} icon={User} />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Field id="email" name="email" label="Email" type="email" placeholder="@gmail.com" value={data.email} onChange={onChange} error={errors.email} icon={Mail} />
        <Field id="phone" name="phone" label="Teléfono" type="text" placeholder="+56 9 1234 5678" value={data.phone} onChange={onChange} error={errors.phone} icon={Phone} />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Field id="password" name="password" label="Contraseña" type="password" placeholder="" value={data.password} onChange={onChange} error={errors.password} icon={Lock} />
        <Field id="confirmPassword" name="confirmPassword" label="Confirmar" type="password" placeholder="" value={data.confirmPassword} onChange={onChange} error={errors.confirmPassword} icon={Lock} />
      </div>

      <button
        onClick={onSubmit}
        className="mt-4 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </button>

      {errors.form && <p className="text-xs text-red-400 text-center mt-2">{errors.form}</p>}
    </div>
  );
}

function useSmoothScroll() {
  return useCallback((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
}

export default function AuthLanding() {
  const [mode, setMode] = useState("login");
  const toggle = useCallback(() => setMode((m) => (m === "login" ? "register" : "login")), []);
  const onNavClick = useSmoothScroll();
  const flipClass = mode === "register" ? "rotate-y-180" : "rotate-y-0";

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0b1020] via-[#0f1420] to-[#1a1f35] text-white overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-20">
          <div className="w-full px-6 md:px-14 py-6">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <nav className="hidden md:flex gap-8 text-sm tracking-wide">
                <button onClick={() => onNavClick("inicio")} className="hover:text-white text-gray-300 transition-colors relative group">
                  INICIO
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 group-hover:w-full transition-all" />
                </button>
                <button onClick={() => onNavClick("laweb")} className="hover:text-white text-gray-300 transition-colors relative group">
                  LA WEB
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 group-hover:w-full transition-all" />
                </button>
                <button onClick={() => onNavClick("funciones")} className="hover:text-white text-gray-300 transition-colors relative group">
                  FUNCIONES
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 group-hover:w-full transition-all" />
                </button>
                <button onClick={() => onNavClick("resenas")} className="hover:text-white text-gray-300 transition-colors relative group">
                  RESEÑAS
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 group-hover:w-full transition-all" />
                </button>
              </nav>

              <div className="flex items-center gap-6 ml-auto">
                <button 
                  onClick={() => setMode("login")} 
                  className={`text-sm transition-all ${mode === "login" ? "text-white font-semibold" : "text-gray-400 hover:text-gray-200"}`}
                >
                  INICIAR SESIÓN
                </button>
                <button 
                  onClick={() => setMode("register")} 
                  className={`text-sm transition-all ${mode === "register" ? "text-white font-semibold" : "text-gray-400 hover:text-gray-200"}`}
                >
                  REGISTRARSE
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 md:px-14 py-12">
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Logo Section */}
            <div className="flex items-center justify-center order-2 lg:order-1">
              <Logo />
            </div>

            {/* Auth Card Section */}
            <div className="flex items-center justify-end order-1 lg:order-2">
              <div className="w-full max-w-md" style={{ perspective: '1200px' }}>
                <div 
                  className={`relative w-full transition-all duration-700 ${flipClass}`} 
                  style={{ 
                    transformStyle: 'preserve-3d',
                    height: mode === "register" ? '480px' : '420px'
                  }}
                >
                  {/* Login Card */}
                  <div 
                    className="absolute inset-0 rounded-2xl bg-[#141927]/70 backdrop-blur-xl p-8 shadow-2xl ring-1 ring-white/10" 
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <h2 className="mb-8 text-center text-sm tracking-[0.3em] text-gray-300 font-semibold">
                      INICIA SESIÓN
                    </h2>
                    <LoginForm />
                  </div>

                  {/* Register Card */}
                  <div 
                    className="absolute inset-0 rounded-2xl bg-[#141927]/70 backdrop-blur-xl p-8 shadow-2xl ring-1 ring-white/10" 
                    style={{ 
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}
                  >
                    <h2 className="mb-6 text-center text-sm tracking-[0.3em] text-gray-300 font-semibold">
                      CREA TU CUENTA
                    </h2>
                    <RegisterForm />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}