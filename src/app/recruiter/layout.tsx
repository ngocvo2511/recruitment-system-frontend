import Link from "next/link";
import { LayoutDashboard, Briefcase, Users, Sparkles, HelpCircle, LogOut, Search, Bell, MessageSquare, Settings, Plus, Eye } from "lucide-react";

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-primary-container selection:text-on-primary-container flex">
      {/* Top Navigation Shell */}
      <nav className="fixed top-0 z-50 w-full bg-slate-50/60 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] border-b border-outline-variant/10 flex justify-between items-center px-8 py-4 h-16 tracking-tight">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">Ethereal Talent</span>
          <div className="hidden md:flex gap-6 items-center">
            <Link className="text-blue-700 font-semibold border-b-2 border-blue-600 h-16 flex items-center" href="/recruiter/dashboard">Dashboard</Link>
            <Link className="text-slate-500 hover:text-slate-900 transition-colors" href="/recruiter/jobs">Job Management</Link>
            <Link className="text-slate-500 hover:text-slate-900 transition-colors" href="/recruiter/candidates">Candidate Database</Link>
            <Link className="text-slate-500 hover:text-slate-900 transition-colors" href="/recruiter/ai-suggest">AI Suggestions</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center bg-surface-container-high rounded-full px-4 py-1.5 gap-2 border border-outline-variant/15">
            <Search className="text-on-surface-variant w-4 h-4" />
            <input className="bg-transparent border-none focus:ring-0 text-sm md:w-48 text-on-surface outline-none" placeholder="Quick search..." type="text"/>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-500 hover:bg-blue-50/50 rounded-full transition-all duration-300"><Bell className="w-5 h-5"/></button>
            <button className="p-2 text-slate-500 hover:bg-blue-50/50 rounded-full transition-all duration-300"><MessageSquare className="w-5 h-5"/></button>
            <button className="p-2 text-slate-500 hover:bg-blue-50/50 rounded-full transition-all duration-300"><Settings className="w-5 h-5" /></button>
            <div className="ml-2 h-8 w-8 rounded-full overflow-hidden border-2 border-primary-container">
              <img alt="Recruiter Profile" src="https://i.pravatar.cc/150?img=5" />
            </div>
          </div>
        </div>
      </nav>

      {/* Side Navigation Shell */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-slate-50/40 backdrop-blur-2xl border-r border-slate-200/20 pt-20 pb-8 flex-col gap-2 z-40">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl signature-gradient flex items-center justify-center text-white">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-900 font-black tracking-tighter text-lg leading-tight">Enterprise Portal</p>
              <p className="text-xs text-on-surface-variant uppercase tracking-widest font-medium">Recruiter Admin</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 flex flex-col gap-1 pr-4">
          <Link className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-transparent text-blue-600 rounded-r-full font-bold transition-all duration-200 hover:translate-x-1" href="/recruiter/dashboard">
            <LayoutDashboard className="w-5 h-5" /><span>Dashboard</span>
          </Link>
          <Link className="flex items-center gap-3 px-6 py-3 text-slate-500 hover:text-slate-900 transition-all duration-200 hover:translate-x-1" href="/recruiter/jobs">
            <Briefcase className="w-5 h-5" /><span>Job Management</span>
          </Link>
          <Link className="flex items-center gap-3 px-6 py-3 text-slate-500 hover:text-slate-900 transition-all duration-200 hover:translate-x-1" href="/recruiter/pipeline">
            <LayoutDashboard className="w-5 h-5" /><span>Pipeline</span>
          </Link>
          <Link className="flex items-center gap-3 px-6 py-3 text-slate-500 hover:text-slate-900 transition-all duration-200 hover:translate-x-1" href="/recruiter/candidates">
            <Users className="w-5 h-5" /><span>Candidate Database</span>
          </Link>
          <Link className="flex items-center gap-3 px-6 py-3 text-slate-500 hover:text-slate-900 transition-all duration-200 hover:translate-x-1" href="/recruiter/ai-suggest">
            <Sparkles className="w-5 h-5" /><span>AI Suggestions</span>
          </Link>
        </nav>
        
        <div className="px-6 mt-auto flex flex-col gap-1">
          <Link className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 transition-all duration-200" href="#">
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Help Center</span>
          </Link>
          <Link className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 transition-all duration-200" href="/">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pt-24 px-8 pb-12 overflow-y-auto">
        {children}
      </main>

      {/* Mobile NavBar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full glass-card border-t border-outline-variant/10 px-6 py-3 flex justify-between items-center z-50">
        <Link href="/recruiter/dashboard" className="flex flex-col items-center gap-1 text-primary">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
        </Link>
        <Link href="#" className="flex flex-col items-center gap-1 text-on-surface-variant">
          <Briefcase className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Jobs</span>
        </Link>
        <button className="h-12 w-12 signature-gradient rounded-full shadow-lg flex items-center justify-center text-white -mt-8 border-4 border-background">
          <Plus className="w-6 h-6" />
        </button>
        <Link href="/recruiter/pipeline" className="flex flex-col items-center gap-1 text-on-surface-variant">
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Candidates</span>
        </Link>
        <Link href="#" className="flex flex-col items-center gap-1 text-on-surface-variant">
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Settings</span>
        </Link>
      </nav>
    </div>
  );
}
