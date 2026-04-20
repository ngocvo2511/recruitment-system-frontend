"use client";

import { Suspense, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const strength = useMemo(() => {
    if (password.length === 0) return 0;
    if (password.length > 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return 3; // Strong
    if (password.length > 5) return 2; // Medium
    return 1; // Weak
  }, [password]);

  const strengthLabel = strength === 3 ? "Strong" : strength === 2 ? "Medium" : strength === 1 ? "Weak" : "";
  const strengthWidth = strength === 3 ? "w-[100%]" : strength === 2 ? "w-[50%]" : strength === 1 ? "w-[20%]" : "w-0";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    // Mock success -> redirect
    router.push("/login?success=reset");
  };

  return (
    <div className="glass-card w-full max-w-[480px] p-10 md:p-12 rounded-[1.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.04)] border border-white/20 animate-fade-in-up">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-[-0.02em] text-on-surface mb-3">Reset Password</h1>
        <p className="text-on-surface-variant text-lg">Create a secure new password for your professional profile.</p>
      </header>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* New Password Field */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1" htmlFor="new_password">
            New Password
          </label>
          <div className="relative">
            <input 
              required
              id="new_password" 
              name="new_password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-surface-container-high/50 border-none rounded-xl focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all text-on-surface placeholder:text-outline-variant outline-none" 
              placeholder="••••••••••••" 
              type={showPassword ? "text" : "password"}
            />
            <div 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant cursor-pointer hover:text-primary transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5" />}
            </div>
          </div>
          
          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <div className="pt-3 animate-fade-in-up">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Security Strength</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${strength === 3 ? 'text-secondary' : strength === 2 ? 'text-blue-500' : 'text-error'}`}>
                  {strengthLabel}
                </span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className={`h-full ${strengthWidth} ${strength === 3 ? 'signature-gradient' : strength === 2 ? 'bg-blue-400' : 'bg-error'} rounded-full transition-all duration-300`}></div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1" htmlFor="confirm_password">
            Confirm Password
          </label>
          <div className="relative">
            <input 
              required
              id="confirm_password" 
              name="confirm_password" 
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-5 py-4 bg-surface-container-high/50 border-none rounded-xl focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all text-on-surface placeholder:text-outline-variant outline-none" 
              placeholder="••••••••••••" 
              type={showPassword ? "text" : "password"}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <button 
            className="w-full signature-gradient text-white py-5 rounded-full font-bold text-lg tracking-tight shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed" 
            type="submit"
            disabled={password.length === 0 || password !== confirmPassword}
          >
            Reset Password
          </button>
        </div>
      </form>

      <footer className="mt-10 text-center">
        <Link href="/login" className="text-sm font-semibold text-primary hover:text-secondary transition-colors inline-flex items-center gap-2">
          <ArrowLeft className="w-5 h-5"/>
          Back to Sign In
        </Link>
      </footer>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex-grow flex items-center justify-center px-6 pt-24 pb-12 relative overflow-hidden min-h-[85vh] w-full">
      <Suspense fallback={<div className="animate-pulse w-full max-w-[480px] h-[400px] glass-card rounded-[1.5rem]"></div>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
