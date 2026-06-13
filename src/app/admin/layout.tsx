"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Briefcase,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Search,
  ScrollText,
  Settings,
  ShieldCheck,
  UserCircle,
  Users,
} from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";
import { clearAuthSession, getStoredAccountType, getStoredToken, isTokenExpired } from "@/lib/authSession";

const navItems = [
  { href: "/admin/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/users", label: "Người dùng", icon: Users },
  { href: "/admin/jobs", label: "Tin tuyển dụng", icon: Briefcase },
  { href: "/admin/company-moderation", label: "Kiểm duyệt công ty", icon: ShieldCheck },
  { href: "/admin/audit-logs", label: "Nhật ký admin", icon: ScrollText },
  { href: "/admin/settings", label: "Cài đặt hệ thống", icon: Settings },
];

function isAdminAccount(accountType: string | null): boolean {
  return accountType === "admin";
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const validateSession = () => {
      const token = getStoredToken();
      const accountType = getStoredAccountType();

      if (!token || !accountType) {
        router.replace("/admin/login");
        return;
      }

      if (isTokenExpired(token)) {
        clearAuthSession();
        router.replace("/admin/login?reason=session-expired");
        return;
      }

      if (!isAdminAccount(accountType)) {
        router.replace("/admin/login");
        return;
      }

      setIsAuthorized(true);
    };

    validateSession();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        validateSession();
      }
    };
    window.addEventListener("focus", validateSession);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("focus", validateSession);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);

  if (!isAuthorized) {
    return null;
  }

  const logout = () => {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("accountType");
    window.localStorage.removeItem("userId");
    router.push("/admin/login");
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex text-sm">
      <aside className="h-screen w-72 fixed left-0 top-0 z-40 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-2xl p-6 gap-4 border-r border-slate-200/10 shadow-2xl shadow-slate-900/5 hidden md:flex flex-col">
        <div className="mt-8 mb-8 px-4">
          <h2 className="text-lg font-bold text-slate-900">{BRAND_NAME}</h2>
          <p className="text-xs font-medium tracking-wide text-slate-500">Quản trị hệ thống</p>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-4 py-3 shadow-lg shadow-blue-500/30 font-inter text-sm font-medium tracking-wide hover:translate-x-1 duration-200 group"
                    : "flex items-center gap-3 text-slate-500 px-4 py-3 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 font-inter text-sm font-medium tracking-wide hover:translate-x-1"
                }
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2">
          <button className="w-full bg-primary-container text-on-primary-container font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-sm" type="button">
            <FileText className="w-5 h-5" />
            Xuất báo cáo
          </button>
          <button
            className="w-full text-slate-500 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            onClick={logout}
            type="button"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex-1 md:ml-72 flex flex-col relative w-full">
        <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-50 flex justify-between items-center px-8 h-20 w-full shadow-[0_20px_50px_rgba(0,80,212,0.05)] border-b border-outline-variant/10">
          <div className="flex items-center gap-4">
            <span className="text-xl font-extrabold tracking-tighter bg-gradient-to-br from-blue-700 to-purple-600 bg-clip-text text-transparent">
              {BRAND_NAME} Admin
            </span>
          </div>

          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                className="w-full bg-slate-100/50 border-none rounded-full py-2.5 pl-10 focus:ring-2 focus:ring-primary/20 text-sm outline-none transition-all placeholder:text-slate-400 font-medium"
                placeholder="Tìm kiếm..."
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-slate-500 hover:text-blue-600 transition-colors duration-200" type="button" aria-label="Thông báo">
              <Bell className="w-5 h-5" />
            </button>
            <button className="text-slate-500 hover:text-blue-600 transition-colors duration-200" type="button" aria-label="Trợ giúp">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-lg flex items-center justify-center text-white">
              <UserCircle className="h-7 w-7" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
