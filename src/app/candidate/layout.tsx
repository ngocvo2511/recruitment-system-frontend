"use client";

import Link from "next/link";
import { Bell, Bookmark, BriefcaseBusiness, FileText, UserRound, Video } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BRAND_NAME } from "@/lib/brand";
import { clearAuthSession, getHomePathForAccount, getStoredAccountType, getStoredToken, isTokenExpired, logoutAuthSession } from "@/lib/authSession";
import UserMenu from "@/components/layout/UserMenu";
import { getCandidateProfile } from "@/lib/api/profile";
import type { CandidateProfileResponse } from "@/lib/api/profile";


const navItems = [
  { href: "/candidate/dashboard", label: "Tổng quan" },
  { href: "/candidate/jobs", label: "Việc làm" },
];

const accountMenuItems = [
  { href: "/candidate/mock-interviews", label: "Luyện phỏng vấn AI", icon: Video },
  { href: "/candidate/applications", label: "Đơn ứng tuyển", icon: BriefcaseBusiness },
  { href: "/candidate/saved-jobs", label: "Việc làm đã lưu", icon: Bookmark },
  { href: "/candidate/cv", label: "Quản lý CV", icon: FileText },
  { href: "/candidate/profile", label: "Hồ sơ cá nhân", icon: UserRound },
];

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const validateSession = () => {
      const token = getStoredToken();
      const accountType = getStoredAccountType();

      if (!token || !accountType) {
        const currentUrl = pathname + window.location.search;
        router.replace(`/login?role=candidate&callbackUrl=${encodeURIComponent(currentUrl)}`);
        return;
      }

      if (isTokenExpired(token)) {
        clearAuthSession();
        const currentUrl = pathname + window.location.search;
        router.replace(`/login?reason=session-expired&callbackUrl=${encodeURIComponent(currentUrl)}`);
        return;
      }

      if (accountType !== "candidate") {
        router.replace(getHomePathForAccount(accountType));
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
  }, [pathname, router]);

  useEffect(() => {
    if (!isAuthorized) {
      return;
    }

    let active = true;
    getCandidateProfile()
      .then((profile) => {
        if (active) {
          setAvatarUrl(profile.profilePictureUrl ?? null);
          setDisplayName(profile.fullName ?? profile.email ?? null);
        }
      })
      .catch(() => {
        // The account menu remains usable when the optional profile is unavailable.
      });

    return () => {
      active = false;
    };
  }, [isAuthorized]);

  useEffect(() => {
    const updateAccountMenu = (event: Event) => {
      const profile = (event as CustomEvent<CandidateProfileResponse>).detail;
      setAvatarUrl(profile.profilePictureUrl ?? null);
      setDisplayName(profile.fullName ?? profile.email ?? null);
    };

    window.addEventListener("candidate-profile-updated", updateAccountMenu);
    return () => window.removeEventListener("candidate-profile-updated", updateAccountMenu);
  }, []);

  if (!isAuthorized) {
    return null;
  }

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
            <Link href="/candidate/dashboard" className="text-2xl font-black tracking-tighter bg-gradient-to-br from-blue-600 to-blue-400 bg-clip-text text-transparent">
              {BRAND_NAME}
            </Link>
            <div className="hidden md:flex gap-8 items-center">
              {navItems.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={active ? "text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 pb-1" : "text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors"}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-on-surface-variant hover:bg-white/20 p-2 rounded-full transition-all duration-300">
              <Bell className="w-5 h-5"/>
            </button>
            <UserMenu
              displayName={displayName}
              roleLabel="Ứng viên"
              items={accountMenuItems}
              avatarUrl={avatarUrl}
              onLogout={async () => {
                await logoutAuthSession();
                router.replace("/login?role=candidate");
              }}
            />
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
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{BRAND_NAME}</div>
          <div className="flex flex-wrap justify-center gap-8 text-sm tracking-wide uppercase">
            <Link className="text-slate-500 dark:text-slate-400 hover:text-blue-500 underline-offset-4 hover:underline transition-opacity" href="#">Chính sách bảo mật</Link>
            <Link className="text-slate-500 dark:text-slate-400 hover:text-blue-500 underline-offset-4 hover:underline transition-opacity" href="#">Điều khoản dịch vụ</Link>
            <Link className="text-slate-500 dark:text-slate-400 hover:text-blue-500 underline-offset-4 hover:underline transition-opacity" href="#">Hỗ trợ</Link>
            <Link className="text-slate-500 dark:text-slate-400 hover:text-blue-500 underline-offset-4 hover:underline transition-opacity" href="#">Tư vấn nghề nghiệp</Link>
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-sm">© 2026 {BRAND_NAME}. Bảo lưu mọi quyền.</div>
        </div>
      </footer>
    </div>
  );
}
