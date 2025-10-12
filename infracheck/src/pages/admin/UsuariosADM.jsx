import React, { useMemo, useState, useEffect, useRef } from "react";
import AdminLayout from "../../layout/AdminLayout";

/* ---------------- Icons ---------------- */
const I = {
  user: (c="") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4.5" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M3 21a9 9 0 0 1 18 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  edit: (c="") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 17.25V21h3.75L19.81 7.94l-3.75-3.75L3 17.25Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="m14.75 4.19 3.75 3.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  trash: (c="") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  search: (c="") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6"/>
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  check: (c="") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m4.5 12 5 5 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  close: (c="") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  chevr: (c="") => (
    <svg className={c} viewBox="0 0 24 24" fill="none"><path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
  ),
};

/* ---------------- Constantes de dominio ---------------- */
const ROLES = ["Ciudadano", "Autoridad"];
const ESTADOS = ["Activo", "Inactivo", "Suspendido"];

/* ---------------- Datos demo ---------------- */
const SEED = [
  { id:1,  nombre:"Juan Pérez",        rol:"Autoridad", estado:"Activo",     bio:"Administra sectores y valida reportes", last:"hace 2 h" },
  { id:2,  nombre:"María García",      rol:"Ciudadano", estado:"Activo",     bio:"Reporta incidencias frecuentemente",   last:"hace 15 min" },
  { id:3,  nombre:"Carlos López",      rol:"Autoridad", estado:"Activo",     bio:"Supervisor zona norte",                last:"ayer" },
  { id:4,  nombre:"Ana Martínez",      rol:"Autoridad", estado:"Inactivo",   bio:"Técnico vial municipal",               last:"hace 5 d" },
  { id:5,  nombre:"Pedro Rodríguez",   rol:"Ciudadano", estado:"Activo",     bio:"Reporta baches y señalización",        last:"hoy" },
  { id:6,  nombre:"Laura Sánchez",     rol:"Autoridad", estado:"Suspendido", bio:"Coordina prioridades",                 last:"hace 10 d" },
  { id:7,  nombre:"Esteban Muñoz",     rol:"Ciudadano", estado:"Activo",     bio:"Participa en consultas",               last:"hace 1 h" },
  { id:8,  nombre:"Sofía Rojas",       rol:"Ciudadano", estado:"Activo",     bio:"Seguimiento de casos en app",          last:"hace 3 h" },
];

/* ---------------- UI helpers ---------------- */
const Badge = ({ tone="info", children }) => {
  const map = {
    success: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20",
    warn:    "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/20",
    danger:  "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/20",
    info:    "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/20",
    neutral: "bg-slate-700/50 text-slate-300 ring-1 ring-white/10",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${map[tone]}`}>{children}</span>;
};
const toneEstado = (e) => e==="Activo" ? "success" : e==="Inactivo" ? "neutral" : "danger";

/* ---------------- Toasts simples ---------------- */
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const add = (msg, tone="info") => {
    const id = crypto.randomUUID();
    setToasts(t => [...t, { id, msg, tone }]);
    setTimeout(()=> setToasts(t => t.filter(x=>x.id!==id)), 2400);
  };
  const View = () => (
    <div className="fixed bottom-4 right-4 space-y-2 z-[60]">
      {toasts.map(t=>(
        <div key={t.id} className={`px-3 py-2 rounded-lg text-sm shadow-lg ring-1 ring-white/10
          ${t.tone==="success"?"bg-emerald-600/20 text-emerald-200":
            t.tone==="danger"?"bg-rose-600/20 text-rose-200":
            "bg-slate-800/80 text-slate-200"}`}>
          {t.msg}
        </div>
      ))}
    </div>
  );
  return { add, View };
}

/* ---------------- Modal genérico ---------------- */
function Modal({ open, onClose, title, children, footer }) {
  const ref = useRef(null);
  useEffect(()=>{
    if (!open) return;
    const first = ref.current?.querySelector("input,select,textarea,button");
    first?.focus();
    const onKey = (e)=> e.key==="Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return ()=> window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="absolute inset-0 grid place-items-center p-4">
        <div ref={ref} className="w-full max-w-xl rounded-2xl bg-[#0c1424] border border-slate-800 shadow-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-100 font-semibold">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-lg bg-slate-800/60 text-slate-300 hover:bg-slate-700/60">
              {I.close("w-4 h-4")}
            </button>
          </div>
          <div className="text-slate-200">{children}</div>
          <div className="mt-4 flex items-center justify-end gap-2">{footer}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Tarjeta de usuario ---------------- */
function UserCard({ u, onEdit, onDelete }) {
  return (
    <div className="relative bg-[#0c1424] border border-slate-800 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-full bg-slate-800 grid place-content-center text-slate-300 ring-1 ring-white/10">
          {I.user("w-6 h-6")}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-slate-100 font-semibold">{u.nombre}</p>
            <Badge tone={u.rol==="Autoridad"?"info":"neutral"}>{u.rol}</Badge>
            <Badge tone={toneEstado(u.estado)}>{u.estado}</Badge>
            <span className="text-[11px] text-slate-400 ml-auto">Últ. act.: {u.last}</span>
          </div>
          <p className="text-sm text-slate-300/90 mt-1 line-clamp-2">{u.bio}</p>
        </div>

        <div className="flex flex-col items-center gap-2 ml-2">
          <button onClick={onEdit} className="p-2 rounded-lg bg-slate-800/60 text-emerald-300 hover:bg-slate-700/60" title="Editar">
            {I.edit("w-4 h-4")}
          </button>
          <button onClick={onDelete} className="p-2 rounded-lg bg-slate-800/60 text-rose-300 hover:bg-slate-700/60" title="Eliminar">
            {I.trash("w-4 h-4")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Toolbar ---------------- */
function Toolbar({ q, setQ, rol, setRol, estado, setEstado, order, setOrder }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0c1424] p-3 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
      <div className="grid lg:grid-cols-3 gap-3">
        <label className="relative block">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{I.search("w-5 h-5")}</span>
          <input
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            placeholder="Buscar usuarios…"
            className="w-full pl-11 pr-3 py-3 rounded-xl bg-slate-900/60 text-slate-200 ring-1 ring-white/10 outline-none focus:ring-indigo-500/40"
          />
        </label>

        <div className="flex items-center gap-3">
          <select value={rol} onChange={(e)=>setRol(e.target.value)} className="flex-1 rounded-xl bg-slate-900/60 text-slate-200 px-3 py-3 ring-1 ring-white/10 focus:ring-indigo-500/40">
            <option value="Todos">Todos los roles</option>
            {ROLES.map(r=> <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={estado} onChange={(e)=>setEstado(e.target.value)} className="flex-1 rounded-xl bg-slate-900/60 text-slate-200 px-3 py-3 ring-1 ring-white/10 focus:ring-indigo-500/40">
            <option value="Todos">Todos los estados</option>
            {ESTADOS.map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select value={order} onChange={(e)=>setOrder(e.target.value)} className="flex-1 rounded-xl bg-slate-900/60 text-slate-200 px-3 py-3 ring-1 ring-white/10 focus:ring-indigo-500/40">
            <option value="nombre-asc">Nombre (A–Z)</option>
            <option value="nombre-desc">Nombre (Z–A)</option>
            <option value="estado">Estado</option>
            <option value="rol">Rol</option>
          </select>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Modales específicos ---------------- */
function EditUserModal({ open, onClose, initial, onSave }) {
  const [form, setForm] = useState(initial);
  const [err, setErr] = useState(null);

  useEffect(()=>{ setForm(initial); setErr(null); }, [initial, open]);

  const change = (k,v)=> setForm(f=>({...f,[k]:v}));
  const submit = ()=>{
    if (!form.nombre.trim()) return setErr("El nombre es obligatorio.");
    if (!ROLES.includes(form.rol)) return setErr("Rol inválido.");
    if (!ESTADOS.includes(form.estado)) return setErr("Estado inválido.");
    onSave(form);
  };

  return (
    <Modal open={open} onClose={onClose} title="Editar usuario"
      footer={
        <>
          <button onClick={onClose} className="px-3 py-2 rounded-lg bg-slate-800/60 text-slate-200 ring-1 ring-white/10 hover:bg-slate-700/60">Cancelar</button>
          <button onClick={submit} className="px-3 py-2 rounded-lg bg-emerald-600/30 text-emerald-200 ring-1 ring-emerald-400/20 hover:bg-emerald-600/40">Guardar</button>
        </>
      }
    >
      {/* Nombre */}
      <div className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-slate-300">Nombre</span>
          <input
            value={form.nombre}
            onChange={e=>change("nombre", e.target.value)}
            disabled
            className="rounded-xl bg-slate-900/60 text-slate-200 px-3 py-2.5 ring-1 ring-white/10 outline-none focus:ring-indigo-500/40"
          />
        </label>

        {/* Rol */}
        <label className="grid gap-1">
          <span className="text-sm text-slate-300">Rol</span>
          <select
            value={form.rol}
            onChange={e=>change("rol", e.target.value)}
            className="rounded-xl bg-slate-900/60 text-slate-200 px-3 py-2.5 ring-1 ring-white/10 focus:ring-indigo-500/40"
          >
            {ROLES.map(r=> <option key={r} value={r}>{r}</option>)}
          </select>
        </label>

        {/* Estado */}
        <label className="grid gap-1">
          <span className="text-sm text-slate-300">Estado</span>
          <select
            value={form.estado}
            onChange={e=>change("estado", e.target.value)}
            disabled
            className="rounded-xl bg-slate-900/60 text-slate-200 px-3 py-2.5 ring-1 ring-white/10 focus:ring-indigo-500/40"
          >
            {ESTADOS.map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        {/* Descripción (bio) */}
        <label className="grid gap-1">
          <span className="text-sm text-slate-300">Descripción</span>
          <textarea
            value={form.bio}
            onChange={e=>change("bio", e.target.value)}
            rows={3}
            className="rounded-xl bg-slate-900/60 text-slate-200 px-3 py-2.5 ring-1 ring-white/10 focus:ring-indigo-500/40"
          />
        </label>

        {err && <p className="text-rose-300 text-sm">{err}</p>}
      </div>
    </Modal>
  );
}

function DeleteUserModal({ open, onClose, user, onConfirm }) {
  const [reason, setReason] = useState(""); // Guardar la razón

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Desactivar cuenta de usuario"
      footer={
        <>
          <button onClick={onClose} className="px-3 py-2 rounded-lg bg-slate-800/60 text-slate-200 ring-1 ring-white/10 hover:bg-slate-700/60">Cancelar</button>
          <button
            onClick={() => onConfirm(user, reason)} // Enviar la razón
            className="px-3 py-2 rounded-lg bg-rose-600/30 text-rose-200 ring-1 ring-rose-400/20 hover:bg-rose-600/40"
          >
            Desactivar cuenta
          </button>
        </>
      }
    >
      <p>¿Seguro que deseas desactivar la cuenta de <span className="font-semibold">{user?.nombre}</span>? Esta acción no se puede deshacer.</p>
      <div className="mt-3 text-sm text-slate-400">
        <p><strong>Rol:</strong> {user?.rol}</p>
        <p><strong>Estado:</strong> {user?.estado}</p>
        <p><strong>Últ. actividad:</strong> {user?.last}</p>
      </div>

      {/* Cuadro de texto para la razón */}
      <label className="grid gap-1 mt-3">
        <span className="text-sm text-slate-300">Razón para desactivar cuenta</span>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={3}
          className="rounded-xl bg-slate-900/60 text-slate-200 px-3 py-2.5 ring-1 ring-white/10 focus:ring-indigo-500/40"
        />
      </label>
    </Modal>
  );
}


/* ---------------- Página principal ---------------- */
export default function UsuariosADM() {
  const [users, setUsers] = useState(SEED);
  const [q, setQ] = useState("");
  const [rol, setRol] = useState("Todos");
  const [estado, setEstado] = useState("Todos");
  const [order, setOrder] = useState("nombre-asc");
  const [page, setPage] = useState(1);
  const perPage = 6;

  // Modales
  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  const toasts = useToasts();

  useEffect(()=>setPage(1), [q, rol, estado, order]);

  // Filtro + orden
  const filtered = useMemo(()=>{
    let arr = [...users];
    if (q.trim()) {
      const term = q.toLowerCase();
      arr = arr.filter(u =>
        u.nombre.toLowerCase().includes(term) ||
        u.rol.toLowerCase().includes(term) ||
        u.bio.toLowerCase().includes(term)
      );
    }
    if (rol!=="Todos")   arr = arr.filter(u=>u.rol===rol);
    if (estado!=="Todos")arr = arr.filter(u=>u.estado===estado);

    switch (order) {
      case "nombre-desc": arr.sort((a,b)=>b.nombre.localeCompare(a.nombre)); break;
      case "estado":      arr.sort((a,b)=>a.estado.localeCompare(b.estado) || a.nombre.localeCompare(b.nombre)); break;
      case "rol":         arr.sort((a,b)=>a.rol.localeCompare(b.rol) || a.nombre.localeCompare(b.nombre)); break;
      default:            arr.sort((a,b)=>a.nombre.localeCompare(b.nombre));
    }
    return arr;
  }, [users, q, rol, estado, order]);

  // Paginación
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page-1)*perPage, page*perPage);

  // Abrir edición
  const openEdit = (u)=>{
    setCurrent(u);
    setEditOpen(true);
  };
  // Guardar edición
  const saveEdit = (data)=>{
    setUsers(prev => prev.map(u => u.id===data.id ? {...u, ...data} : u));
    setEditOpen(false);
    toasts.add("Usuario actualizado correctamente", "success");
  };

  // Eliminar
  const openDelete = (u)=>{
    setCurrent(u);
    setDelOpen(true);
  };
  
  const confirmDelete = (u, reason) => {
  // Aquí cambiamos el estado del usuario a "Inactivo" y guardamos la razón de la desactivación
  setUsers(prev => prev.map(user =>
    user.id === u.id ? { ...user, estado: "Inactivo", bio: reason } : user
  ));
  setDelOpen(false);
  toasts.add("Cuenta desactivada correctamente", "success");
};


  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-4">Gestión de Usuarios</h1>

        <Toolbar
          q={q} setQ={setQ}
          rol={rol} setRol={setRol}
          estado={estado} setEstado={setEstado}
          order={order} setOrder={setOrder}
        />

        {pageItems.length === 0 ? (
          <div className="mt-8 grid place-items-center text-center">
            <div className="h-14 w-14 rounded-2xl bg-slate-800/70 grid place-content-center text-slate-300 ring-1 ring-white/10 mb-3">
              {I.user("w-7 h-7")}
            </div>
            <p className="text-slate-200 font-semibold">No se encontraron usuarios</p>
            <p className="text-slate-400 text-sm">Prueba cambiar los filtros o la búsqueda.</p>
          </div>
        ) : (
          <>
            <div className="mt-5 grid md:grid-cols-2 gap-4">
              {pageItems.map(u=>(
                <UserCard
                  key={u.id}
                  u={u}
                  onEdit={()=>openEdit(u)}
                  onDelete={()=>openDelete(u)}
                />
              ))}
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                disabled={page<=1}
                onClick={()=>setPage(p=>Math.max(1,p-1))}
                className={`px-3 py-2 rounded-lg ring-1 ring-white/10 ${page>1? "bg-slate-800/70 text-slate-200 hover:bg-slate-700/70":"bg-slate-900/40 text-slate-500 cursor-not-allowed"}`}>
                {I.chevr("w-4 h-4 rotate-180")}
              </button>
              <span className="text-sm text-slate-300">Página {page} de {pages}</span>
              <button
                disabled={page>=pages}
                onClick={()=>setPage(p=>Math.min(pages,p+1))}
                className={`px-3 py-2 rounded-lg ring-1 ring-white/10 ${page<pages? "bg-slate-800/70 text-slate-200 hover:bg-slate-700/70":"bg-slate-900/40 text-slate-500 cursor-not-allowed"}`}>
                {I.chevr("w-4 h-4")}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modales */}
      <EditUserModal
        open={editOpen}
        onClose={()=>setEditOpen(false)}
        initial={current ?? { id:null, nombre:"", rol:ROLES[0], estado:ESTADOS[0], bio:"" }}
        onSave={saveEdit}
      />
      <DeleteUserModal
        open={delOpen}
        onClose={()=>setDelOpen(false)}
        user={current}
        onConfirm={confirmDelete}
      />

      {/* Toasts */}
      <toasts.View />
    </AdminLayout>
  );
}
