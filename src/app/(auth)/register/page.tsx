"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Briefcase, KeyRound, Loader2, Lock, Mail, Phone, User } from "lucide-react";
import {
  createRecruiterProfile,
  requestRegisterOtp,
  resendRegisterOtp,
  registerCandidate,
  registerRecruiter,
  saveAccessToken,
} from "@/lib/api/auth";
import { createCandidateProfile } from "@/lib/api/profile";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "recruiter" ? "recruiter" : "candidate";

  const [role, setRole] = useState<"candidate" | "recruiter">(initialRole);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpRemainingSeconds, setOtpRemainingSeconds] = useState<number | null>(null);
  const [resendRemainingSeconds, setResendRemainingSeconds] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (otpRemainingSeconds === null || otpRemainingSeconds <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setOtpRemainingSeconds((prev) => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [otpRemainingSeconds]);

  useEffect(() => {
    if (resendRemainingSeconds === null || resendRemainingSeconds <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setResendRemainingSeconds((prev) => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendRemainingSeconds]);

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setError("Vui lòng nhập email để nhận OTP.");
      return;
    }

    setIsSendingOtp(true);
    setError("");

    try {
      const requestOtp = otpSent ? resendRegisterOtp : requestRegisterOtp;
      const result = await requestOtp(email.trim());
      setOtpSent(true);
      setOtpRemainingSeconds(result.ttlSeconds);
      setResendRemainingSeconds(result.resendCooldownSeconds);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi OTP. Vui lòng thử lại.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (role === "recruiter") {
        const auth = await registerRecruiter(email, password, otpCode);
        saveAccessToken(auth.token);
        localStorage.setItem("accountType", "recruiter");
        if (auth.userId) localStorage.setItem("userId", auth.userId);
        await createRecruiterProfile({
          fullName,
          gender,
          phone,
          position,
        });
        router.push("/company/select-action");
        return;
      }

      const auth = await registerCandidate(email, password, otpCode);
      saveAccessToken(auth.token);
      localStorage.setItem("accountType", "candidate");
      if (auth.userId) localStorage.setItem("userId", auth.userId);
      await createCandidateProfile({ fullName });
      router.push("/candidate/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đăng ký. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const otpSection = (
    <div className="space-y-2">
      <label className="block text-sm font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">
        OTP
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative group flex-1">
          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline-variant group-focus-within:text-primary transition-colors" />
          <input
            required
            value={otpCode}
            onChange={(event) => setOtpCode(event.target.value)}
            className="block w-full pl-11 pr-4 py-4 bg-surface-container-high/50 rounded-xl border-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all text-on-surface placeholder:text-outline-variant outline-none"
            placeholder="Nhập OTP"
            type="text"
            inputMode="numeric"
          />
        </div>
        <button
          type="button"
          onClick={handleSendOtp}
          disabled={isSendingOtp || !email.trim() || (resendRemainingSeconds !== null && resendRemainingSeconds > 0)}
          className="px-5 py-4 rounded-xl border border-outline-variant/30 text-sm font-bold uppercase tracking-[0.08em] text-primary bg-white/70 hover:bg-white transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSendingOtp ? <Loader2 className="w-5 h-5 animate-spin" /> : (otpSent ? "Gửi lại" : "Gửi OTP")}
        </button>
      </div>
      {otpSent && (
        <p className="text-xs text-on-surface-variant">OTP đã được gửi tới email của bạn.</p>
      )}
      {otpRemainingSeconds !== null && (
        <p className="text-xs text-on-surface-variant">
          Thời gian sử dụng OTP: {formatCountdown(Math.max(otpRemainingSeconds, 0))}
        </p>
      )}
      {resendRemainingSeconds !== null && (
        <p className="text-xs text-on-surface-variant">
          Thời gian gửi lại: {formatCountdown(Math.max(resendRemainingSeconds, 0))}
        </p>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-lg z-10">
      <div className="glass-card rounded-[1.5rem] p-8 md:p-12 shadow-[0_40px_60px_rgba(0,0,0,0.04)] border border-white/40">
        <div className="text-center mb-10">
          <h1 className="text-xl sm:text-2xl md:text-3xl whitespace-nowrap font-extrabold tracking-[-0.02em] text-on-surface mb-3">
            {role === "recruiter" ? "Tạo tài khoản nhà tuyển dụng" : "Tạo tài khoản ứng viên"}
          </h1>
          <p className="text-on-surface-variant">
            {role === "recruiter"
              ? "Tạo hồ sơ tuyển dụng trước khi kết nối công ty."
              : "Bắt đầu hành trình tìm việc phù hợp với bạn."}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleRegister}>
          <div className="flex p-1 bg-surface-container-low rounded-full">
            <button
              onClick={() => setRole("candidate")}
              className={`flex-1 py-2 px-4 text-xs font-bold tracking-widest uppercase rounded-full transition-all ${role === "candidate" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
              type="button"
            >
              Ứng viên
            </button>
            <button
              onClick={() => setRole("recruiter")}
              className={`flex-1 py-2 px-4 text-xs font-bold tracking-widest uppercase rounded-full transition-all ${role === "recruiter" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
              type="button"
            >
              Nhà tuyển dụng
            </button>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-100/10 border border-red-500/20 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">
              Họ và tên
            </label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline-variant group-focus-within:text-primary transition-colors" />
              <input
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="block w-full pl-11 pr-4 py-4 bg-surface-container-high/50 rounded-xl border-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all text-on-surface placeholder:text-outline-variant outline-none"
                placeholder="Nguyễn Văn A"
                type="text"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">
              Email
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline-variant group-focus-within:text-primary transition-colors" />
              <input
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setOtpSent(false);
                  setOtpCode("");
                  setOtpRemainingSeconds(null);
                  setResendRemainingSeconds(null);
                }}
                className="block w-full pl-11 pr-4 py-4 bg-surface-container-high/50 rounded-xl border-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all text-on-surface placeholder:text-outline-variant outline-none"
                placeholder={role === "recruiter" ? "ten@congty.com" : "ban@example.com"}
                type="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">
              Mật khẩu
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline-variant group-focus-within:text-primary transition-colors" />
              <input
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="block w-full pl-11 pr-4 py-4 bg-surface-container-high/50 rounded-xl border-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all text-on-surface placeholder:text-outline-variant outline-none"
                placeholder="Mật khẩu"
                type="password"
              />
            </div>
          </div>

          {role === "candidate" && otpSection}

          {role === "recruiter" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">
                  Giới tính
                </label>
                <select
                  required
                  value={gender}
                  onChange={(event) => setGender(event.target.value)}
                  className="block w-full px-4 py-4 bg-surface-container-high/50 rounded-xl border-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all text-on-surface outline-none"
                >
                  <option value="" disabled>
                    Chọn
                  </option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">
                  Số điện thoại
                </label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline-variant group-focus-within:text-primary transition-colors" />
                  <input
                    required
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="block w-full pl-11 pr-4 py-4 bg-surface-container-high/50 rounded-xl border-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all text-on-surface placeholder:text-outline-variant outline-none"
                    placeholder="+84..."
                    type="tel"
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">
                  Chức danh
                </label>
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline-variant group-focus-within:text-primary transition-colors" />
                  <input
                    value={position}
                    onChange={(event) => setPosition(event.target.value)}
                    className="block w-full pl-11 pr-4 py-4 bg-surface-container-high/50 rounded-xl border-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all text-on-surface placeholder:text-outline-variant outline-none"
                    placeholder="Chuyên viên tuyển dụng"
                    type="text"
                  />
                </div>
              </div>
            </div>
          )}

          {role === "recruiter" && otpSection}

          <button
            disabled={isSubmitting}
            className="w-full signature-gradient text-white font-bold py-4 rounded-full shadow-[0_10px_30px_rgba(0,80,212,0.2)] hover:scale-[1.02] active:scale-95 transition-all duration-300 mt-4 group flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            type="submit"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {role === "recruiter" ? "Tạo hồ sơ nhà tuyển dụng" : "Tạo tài khoản ứng viên"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-on-surface-variant">
            Đã có tài khoản?
            <Link className="text-primary font-bold hover:underline ml-1" href="/login">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 pt-24 pb-12 relative overflow-hidden w-full">
      <Suspense fallback={<div className="animate-pulse w-full max-w-lg h-[500px] glass-card rounded-[1.5rem]"></div>}>
        <RegisterForm />
      </Suspense>
    </main>
  );
}
