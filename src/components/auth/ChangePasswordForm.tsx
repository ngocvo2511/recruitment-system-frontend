"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { changePassword } from "@/lib/api/auth";

export function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    setLoading(true);

    try {
      await changePassword({ oldPassword, newPassword });
      setSuccess("Đổi mật khẩu thành công.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      setError(e.message || "Đã xảy ra lỗi khi đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu cũ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8 mt-6">
      <h2 className="text-2xl font-bold text-on-surface mb-6">Đổi mật khẩu</h2>
      
      {error && (
        <div className="p-4 mb-6 text-sm text-red-500 bg-red-100/10 border border-red-500/20 rounded-xl">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 mb-6 text-sm text-emerald-500 bg-emerald-100/10 border border-emerald-500/20 rounded-xl">
          {success}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="group">
          <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-2 px-4">
            Mật khẩu hiện tại
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline-variant group-focus-within:text-primary transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <input
              required
              disabled={loading}
              value={oldPassword}
              onChange={(event) => setOldPassword(event.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-surface-container-high/50 border-none rounded-xl focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all outline-none placeholder:text-outline-variant disabled:opacity-70"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-2 px-4">
            Mật khẩu mới
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline-variant group-focus-within:text-primary transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <input
              required
              disabled={loading}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-surface-container-high/50 border-none rounded-xl focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all outline-none placeholder:text-outline-variant disabled:opacity-70"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-2 px-4">
            Xác nhận mật khẩu mới
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline-variant group-focus-within:text-primary transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <input
              required
              disabled={loading}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-surface-container-high/50 border-none rounded-xl focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all outline-none placeholder:text-outline-variant disabled:opacity-70"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
            />
            <button
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute inset-y-0 right-4 flex items-center text-outline-variant hover:text-on-surface"
              type="button"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            disabled={loading}
            type="submit"
            className="w-full sm:w-auto px-8 signature-gradient text-white font-bold py-4 rounded-full shadow-[0_12px_24px_-8px_rgba(0,80,212,0.4)] hover:scale-[1.02] hover:shadow-[0_20px_32px_-8px_rgba(0,80,212,0.5)] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Cập nhật mật khẩu"}
          </button>
        </div>
      </form>
    </div>
  );
}
