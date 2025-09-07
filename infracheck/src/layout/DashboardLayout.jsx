import Sidebar from "../components/nav/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1400px] p-4">
        <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl shadow-black/30">
          <div className="grid grid-cols-[16rem_1fr]">
            <Sidebar />
            <main className="bg-slate-900 p-6">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
