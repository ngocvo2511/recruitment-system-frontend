import Link from "next/link";
import { LayoutDashboard, Users, Briefcase, ShieldCheck, Settings, FileText, Search, Bell, HelpCircle, UserCircle } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex text-sm">
      {/* SideNavBar Shell */}
      <aside className="h-screen w-72 fixed left-0 top-0 z-40 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-2xl flex flex-col p-6 gap-4 border-r border-slate-200/10 shadow-2xl shadow-slate-900/5 hidden flex-col md:flex">
        <div className="mt-8 mb-8 px-4">
          <h2 className="text-lg font-bold text-slate-900">Admin Portal</h2>
          <p className="text-xs font-medium tracking-wide text-slate-500">System Controller</p>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          <Link href="/admin/dashboard" className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-4 py-3 shadow-lg shadow-blue-500/30 font-inter text-sm font-medium tracking-wide hover:translate-x-1 duration-200 group">
            <LayoutDashboard className="w-5 h-5 fill-white/20" />
            Dashboard
          </Link>
          <Link href="#" className="flex items-center gap-3 text-slate-500 px-4 py-3 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 font-inter text-sm font-medium tracking-wide hover:translate-x-1">
            <Users className="w-5 h-5" />
            User Management
          </Link>
          <Link href="/admin/jobs" className="flex items-center gap-3 text-slate-500 px-4 py-3 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 font-inter text-sm font-medium tracking-wide hover:translate-x-1">
            <Briefcase className="w-5 h-5" />
            Job Management
          </Link>
          <Link href="/admin/company-moderation" className="flex items-center gap-3 text-slate-500 px-4 py-3 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 font-inter text-sm font-medium tracking-wide hover:translate-x-1">
            <ShieldCheck className="w-5 h-5" />
            Company Moderation
          </Link>
          <Link href="#" className="flex items-center gap-3 text-slate-500 px-4 py-3 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 font-inter text-sm font-medium tracking-wide hover:translate-x-1">
            <Settings className="w-5 h-5" />
            System Settings
          </Link>
        </nav>
        
        <div className="mt-auto">
          <button className="w-full bg-primary-container text-on-primary-container font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-sm">
            <FileText className="w-5 h-5" />
            Generate Report
          </button>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <div className="flex-1 md:ml-72 flex flex-col relative w-full">
        {/* TopAppBar Shell */}
        <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-50 flex justify-between items-center px-8 h-20 w-full shadow-[0_20px_50px_rgba(0,80,212,0.05)] border-b border-outline-variant/10">
          <div className="flex items-center gap-4">
            <span className="text-xl font-extrabold tracking-tighter bg-gradient-to-br from-blue-700 to-purple-600 bg-clip-text text-transparent">CareerCurator Admin</span>
          </div>
          
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-slate-400 w-4 h-4 pointer-events-none" />
              <input className="w-full bg-slate-100/50 border-none rounded-full py-2.5 pl-10 focus:ring-2 focus:ring-primary/20 text-sm outline-none transition-all placeholder:text-slate-400 font-medium" placeholder="Search analytics or users..." type="text" />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="text-slate-500 hover:text-blue-600 transition-colors duration-200">
              <Bell className="w-5 h-5" />
            </button>
            <button className="text-slate-500 hover:text-blue-600 transition-colors duration-200">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-lg group cursor-pointer hover:scale-105 transition-all">
              <img alt="Admin Portrait" className="h-full w-full rounded-full object-cover border-2 border-white" src="https://i.pravatar.cc/150?img=50" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
