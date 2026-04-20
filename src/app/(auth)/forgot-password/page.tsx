"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, MailCheck } from "lucide-react";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-4xl flex justify-center animate-fade-in-up">
        <div className="w-full max-w-md glass-card rounded-[1.5rem] p-10 border border-white/40 shadow-[0_30px_80px_rgba(106,55,212,0.12)] relative overflow-hidden">
          {/* Subtle Interior Glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-secondary/10 rounded-full blur-[40px]"></div>
          
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center mb-8 shadow-[0_10px_30px_rgba(106,55,212,0.2)]">
              <MailCheck className="text-on-secondary-container w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-on-surface mb-4">Check your email</h2>
            <p className="text-on-surface-variant text-md leading-relaxed mb-8 px-4">
              We've sent a recovery link to your inbox. Please click the link to reset your account credentials.
            </p>
            
            <div className="flex flex-col gap-4 w-full">
              <button 
                className="w-full bg-surface-container-high text-on-surface py-3 rounded-full font-bold hover:bg-surface-container-highest transition-all duration-300"
                onClick={() => window.open('mailto:', '_blank')}
              >
                Open Mail App
              </button>
              <button 
                className="text-sm font-semibold text-secondary hover:text-secondary-dim transition-colors"
                onClick={() => setIsSuccess(false)}
              >
                Didn't receive the email? Resend
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md glass-card rounded-[1.5rem] p-10 shadow-[0_40px_100px_rgba(0,80,212,0.08)] mb-12 relative overflow-hidden animate-fade-in-up">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center mb-6">
          <KeyRound className="text-primary w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-[-0.02em] text-on-surface mb-3">Forgot Password</h1>
        <p className="text-on-surface-variant text-md leading-relaxed">
          Enter your email and we'll send you instructions to reset your password.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="group">
          <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant mb-2 ml-1">
            Email Address
          </label>
          <div className="relative">
            <input 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-high/50 border-none rounded-xl px-5 py-4 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all duration-300 outline-none" 
              placeholder="curator@professional.com" 
              type="email"
            />
          </div>
        </div>
        
        <button 
          className="w-full signature-gradient text-white py-4 rounded-full font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300" 
          type="submit"
        >
          Send Reset Link
        </button>

        <div className="text-center mt-6">
          <Link href="/login" className="text-primary font-semibold hover:underline flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <main className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 pt-24 pb-12 overflow-hidden w-full">
      <Suspense fallback={<div className="animate-pulse w-full max-w-md h-[400px] glass-card rounded-[1.5rem]"></div>}>
        <ForgotPasswordForm />
      </Suspense>
    </main>
  );
}
