import Sidebar from "../components/nav/SidebarUSER";
import { useTheme } from "../themes/ThemeContext";

export default function UserLayout({ children }) { 
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen w-full overflow-x-hidden ${theme === 'dark' ? 'bg-[#0A0F1A] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="flex min-h-screen w-full">
        <div className="w-[270px] shrink-0">
          <Sidebar />
        </div>
        <main className={`flex-1 min-w-0 ${theme === 'dark' ? 'bg-[#0A0F1A]' : 'bg-slate-50'}`}>
          <div className="min-h-full px-4 sm:px-5 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}