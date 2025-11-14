import Sidebar from "../components/nav/SidebarUSER";

export default function UserLayout({ children }) { 
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#0A0F1A] text-slate-100">
      <div className="flex min-h-screen w-full">
        <div className="w-[270px] shrink-0">
          <Sidebar />
        </div>

        <main className="flex-1 min-w-0 bg-[#0A0F1A]">
          <div className="min-h-full px-4 sm:px-5 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

