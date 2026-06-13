"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import {
  clearAuthSession,
  getAccountTypeFromToken,
  getHomePathForAccount,
  getStoredAccountType,
  getStoredToken,
  isTokenExpired,
  normalizeAccountType,
  saveAuthSession,
} from "@/lib/authSession";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
const LOGIN_ERROR_MESSAGE = "Thông tin đăng nhập admin không hợp lệ.";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get("reason") === "session-expired";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(sessionExpired ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." : "");

  useEffect(() => {
    const token = getStoredToken();
    const accountType = getStoredAccountType();
    if (token && accountType === "admin") {
      if (isTokenExpired(token)) {
        clearAuthSession();
        router.replace("/admin/login?reason=session-expired");
        return;
      }
      router.replace("/admin/dashboard");
    }
  }, [router]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/authenticate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok && data.code === 1000) {
        const token = data.result.token as string;
        const accountType = normalizeAccountType(data.result.accountType) ?? getAccountTypeFromToken(token);

        if (accountType === "admin") {
          saveAuthSession(token, accountType, data.result.userId);
          router.replace(getHomePathForAccount(accountType));
          return;
        }

        clearAuthSession();
        setErrorMessage(LOGIN_ERROR_MESSAGE);
        return;
      }

      clearAuthSession();
      setErrorMessage(LOGIN_ERROR_MESSAGE);
    } catch {
      clearAuthSession();
      setErrorMessage(LOGIN_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] perspective-1000 z-10">
      <div className="absolute -top-12 -right-8 w-24 h-24 signature-gradient rounded-full opacity-20 blur-xl" />

      <div className="glass-card rounded-[2rem] p-10 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,80,212,0.08)] border border-white/40 relative z-10">
        <div className="mb-10 text-center md:text-left animate-fade-in-up">
          <h1 className="text-4xl font-extrabold tracking-[-0.03em] text-on-surface mb-3">Đăng nhập admin</h1>
          <p className="text-on-surface-variant leading-relaxed">Xác thực để quản lý và kiểm duyệt hệ thống tuyển dụng.</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            {errorMessage && (
              <div className="p-3 text-sm text-red-500 bg-red-100/10 border border-red-500/20 rounded-xl">
                {errorMessage}
              </div>
            )}

            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-2 px-4">
                Email admin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline-variant group-focus-within:text-primary transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  required
                  disabled={loading}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-high/50 border-none rounded-xl focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all outline-none placeholder:text-outline-variant disabled:opacity-70"
                  placeholder="admin@example.com"
                  type="email"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-2 px-4">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline-variant group-focus-within:text-primary transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  required
                  disabled={loading}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-surface-container-high/50 border-none rounded-xl focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all outline-none placeholder:text-outline-variant disabled:opacity-70"
                  placeholder="Mật khẩu"
                  type={showPassword ? "text" : "password"}
                />
                <button
                  className="absolute inset-y-0 right-4 flex items-center text-outline-variant hover:text-on-surface"
                  onClick={() => setShowPassword((visible) => !visible)}
                  type="button"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input className="peer appearance-none w-5 h-5 rounded-md border-2 border-outline-variant checked:bg-primary checked:border-primary transition-all cursor-pointer" type="checkbox" />
                <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
              </div>
              <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">Ghi nhớ phiên đăng nhập</span>
            </label>
            <Link className="text-sm font-semibold text-primary hover:underline underline-offset-4 decoration-2" href="/login">
              Đăng nhập user
            </Link>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full signature-gradient text-white font-bold py-4 rounded-full shadow-[0_12px_24px_-8px_rgba(0,80,212,0.4)] hover:scale-[1.02] hover:shadow-[0_20px_32px_-8px_rgba(0,80,212,0.5)] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Đăng nhập
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center border-t border-outline-variant/10 pt-6">
          <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.2em] font-medium">
            Mọi truy cập trái phép đều được ghi nhận
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="relative min-h-[85vh] flex flex-col items-center justify-center p-6 pt-24 pb-12 w-full">
      <Suspense fallback={<div className="animate-pulse w-full max-w-[480px] h-[500px] glass-card rounded-[2rem]" />}>
        <AdminLoginForm />
      </Suspense>
    </main>
  );
}
