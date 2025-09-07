import React from 'react';
import { Home, FileText, Users, User, Settings } from 'lucide-react';

const NavItem = ({ icon, label, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition ${
      isActive ? 'bg-indigo-600/30 text-white' : 'hover:bg-white/5 text-white/80'
    }`}
  >
    {icon}
    <span className="text-sm md:text-base">{label}</span>
  </button>
);

const Sidebar = ({ activeTab, setActiveTab }) => (
  <aside className="w-64 shrink-0">
    <div className="flex flex-col items-center gap-2 py-6">
      <div className="h-16 w-16 rounded-full bg-indigo-500/20 grid place-items-center">
        <span className="text-3xl">🚗</span>
      </div>
      <h1 className="text-2xl font-semibold text-white">InfraCheck</h1>
    </div>

    <div className="bg-[#161925] rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,.35)] overflow-hidden">
      <div className="py-4">
        <nav className="flex flex-col gap-1 px-2">
          <NavItem 
            icon={<Home className="w-5 h-5" />} 
            label="Home" 
            isActive={activeTab === 'home'}
            onClick={() => setActiveTab('home')}
          />
          <NavItem 
            icon={<FileText className="w-5 h-5" />} 
            label="Reportes" 
            isActive={activeTab === 'reportes'}
            onClick={() => setActiveTab('reportes')}
          />
          <NavItem 
            icon={<Users className="w-5 h-5" />} 
            label="Usuarios" 
            isActive={activeTab === 'usuarios'}
            onClick={() => setActiveTab('usuarios')}
          />
          <NavItem 
            icon={<User className="w-5 h-5" />} 
            label="Perfil" 
            isActive={activeTab === 'perfil'}
            onClick={() => setActiveTab('perfil')}
          />
          <NavItem 
            icon={<Settings className="w-5 h-5" />} 
            label="Ajustes" 
            isActive={activeTab === 'ajustes'}
            onClick={() => setActiveTab('ajustes')}
          />
        </nav>
      </div>

      <div className="mt-10 p-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-300/50" />
          <div className="text-lg text-white">Persona</div>
        </div>
      </div>
    </div>
  </aside>
);

export default Sidebar;