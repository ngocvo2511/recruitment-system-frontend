"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Briefcase, Building2, HelpCircle, LayoutDashboard, LogOut, MessageSquare, Plus, Search, Settings, Sparkles, Users } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";
import { getHomePathForAccount, getStoredAccountType, getStoredToken } from "@/lib/authSession";

const navItems = [
  { href: "/recruiter/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/recruiter/jobs", label: "Tin tuyển dụng", icon: Briefcase },
  { href: "/recruiter/company", label: "Công ty", icon: Building2 },
  { href: "/recruiter/pipeline", label: "Pipeline", icon: LayoutDashboard },
  { href: "/recruiter/candidates", label: "Ứng viên", icon: Users },
  { href: "/recruiter/ai-suggest", label: "Gợi ý AI", icon: Sparkles },
];

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    const accountType = getStoredAccountType();

    if (!token || !accountType) {
      router.replace("/login?role=recruiter");
      return;
    }

    if (accountType !== "recruiter") {
      router.replace(getHomePathForAccount(accountType));
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthorized(true);
  }, [router]);

  if (!isAuthorized) {
    return null;
  }

  const logout = () => {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("accountType");
    window.localStorage.removeItem("userId");
    router.push("/login?role=recruiter");
  };

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-primary-container selection:text-on-primary-container flex">
      <nav className="fixed top-0 z-50 w-full bg-slate-50/70 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] border-b border-outline-variant/10 flex justify-between items-center px-8 py-4 h-16 tracking-tight">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold text-primary">{BRAND_NAME}</span>
          <div className="hidden md:flex gap-6 items-center">
            {navItems.slice(0, 5).map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  className={active ? "text-blue-700 font-semibold border-b-2 border-blue-600 h-16 flex items-center" : "text-slate-500 hover:text-slate-900 transition-colors"}
                  href={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center bg-surface-container-high rounded-full px-4 py-1.5 gap-2 border border-outline-variant/15">
            <Search className="text-on-surface-variant w-4 h-4" />
            <input className="bg-transparent border-none focus:ring-0 text-sm md:w-48 text-on-surface outline-none" placeholder="Tìm nhanh..." type="text" />
          </div>
          <button className="p-2 text-slate-500 hover:bg-blue-50/50 rounded-full transition-all duration-300" title="Thông báo">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-500 hover:bg-blue-50/50 rounded-full transition-all duration-300" title="Tin nhắn">
            <MessageSquare className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-500 hover:bg-blue-50/50 rounded-full transition-all duration-300" title="Cài đặt">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-slate-50/55 backdrop-blur-2xl border-r border-slate-200/20 pt-20 pb-8 flex-col gap-2 z-40">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl signature-gradient flex items-center justify-center text-white">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-900 font-black text-lg leading-tight">{BRAND_NAME}</p>
              <p className="text-xs text-on-surface-variant uppercase tracking-widest font-medium">Nhà tuyển dụng</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1 pr-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                className={active ? "flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-transparent text-blue-600 rounded-r-full font-bold transition-all duration-200" : "flex items-center gap-3 px-6 py-3 text-slate-500 hover:text-slate-900 transition-all duration-200 hover:translate-x-1"}
                href={item.href}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-6 mt-auto flex flex-col gap-1">
          <Link className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 transition-all duration-200" href="#">
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Trợ giúp</span>
          </Link>
          <button
            className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 transition-all duration-200 text-left"
            onClick={logout}
            type="button"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 pt-24 px-8 pb-12 overflow-y-auto">
        {children}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 w-full glass-card border-t border-outline-variant/10 px-6 py-3 flex justify-between items-center z-50">
        <Link href="/recruiter/dashboard" className="flex flex-col items-center gap-1 text-primary">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Tổng quan</span>
        </Link>
        <Link href="/recruiter/jobs" className="flex flex-col items-center gap-1 text-on-surface-variant">
          <Briefcase className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Việc làm</span>
        </Link>
        <Link className="h-12 w-12 signature-gradient rounded-full shadow-lg flex items-center justify-center text-white -mt-8 border-4 border-background" href="/recruiter/jobs/create">
          <Plus className="w-6 h-6" />
        </Link>
        <Link href="/recruiter/candidates" className="flex flex-col items-center gap-1 text-on-surface-variant">
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Ứng viên</span>
        </Link>
        <Link href="/recruiter/company" className="flex flex-col items-center gap-1 text-on-surface-variant">
          <Building2 className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Công ty</span>
        </Link>
      </nav>
    </div>
  );
}
