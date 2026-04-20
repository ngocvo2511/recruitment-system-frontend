import Link from "next/link";
import { Bell, Search } from "lucide-react";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary/20 min-h-screen">
      {/* Ambient Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute w-[40vw] h-[40vw] rounded-full blur-[80px] bg-primary top-[-10%] left-[-5%] opacity-15"></div>
        <div className="absolute w-[40vw] h-[40vw] rounded-full blur-[80px] bg-secondary bottom-[-10%] right-[-5%] opacity-15"></div>
      </div>

      {/* Navigation Shell */}
      <nav className="fixed top-0 w-full z-50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-white/10 dark:border-slate-800/50 shadow-[0_8px_32px_0_rgba(0,80,212,0.08)]">
        <div className="flex justify-between items-center w-full px-8 h-20 max-w-7xl mx-auto tracking-tight">
          <div className="flex items-center gap-12">
            <Link href="/candidate/jobs" className="text-2xl font-black tracking-tighter bg-gradient-to-br from-blue-600 to-blue-400 bg-clip-text text-transparent">
              EtherealCareers
            </Link>
            <div className="hidden md:flex gap-8 items-center">
              <Link href="/candidate/jobs" className="text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 pb-1">Jobs</Link>
              <Link href="/candidate/applications" className="text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors">Applications</Link>
              <Link href="/candidate/cv" className="text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors">CV Management</Link>
              <Link href="/candidate/profile" className="text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors">Profile</Link>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-on-surface-variant hover:bg-white/20 p-2 rounded-full transition-all duration-300">
              <Bell className="w-5 h-5"/>
            </button>
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-primary/20 hover:scale-105 transition-transform">
              <img alt="User profile avatar" className="w-full h-full object-cover" src="https://i.pravatar.cc/150?img=1" />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-20">
        {children}
      </div>

      {/* Footer */}
      <footer className="w-full py-12 mt-auto bg-slate-50 dark:bg-slate-950 tonal-transition bg-gradient-to-t from-slate-100 to-transparent dark:from-slate-900">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-6">
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">EtherealCareers</div>
          <div className="flex flex-wrap justify-center gap-8 text-sm tracking-wide uppercase">
            <Link className="text-slate-500 dark:text-slate-400 hover:text-blue-500 underline-offset-4 hover:underline transition-opacity" href="#">Privacy Policy</Link>
            <Link className="text-slate-500 dark:text-slate-400 hover:text-blue-500 underline-offset-4 hover:underline transition-opacity" href="#">Terms of Service</Link>
            <Link className="text-slate-500 dark:text-slate-400 hover:text-blue-500 underline-offset-4 hover:underline transition-opacity" href="#">Contact Support</Link>
            <Link className="text-slate-500 dark:text-slate-400 hover:text-blue-500 underline-offset-4 hover:underline transition-opacity" href="#">Career Advice</Link>
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-sm">© 2026 Ethereal Professional. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
