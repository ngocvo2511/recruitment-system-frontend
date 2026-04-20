"use client";

import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { Mail, Lock, Check, Eye } from "lucide-react";

function AdminLoginForm() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/admin/dashboard");
  };

  return (
    <div className="w-full max-w-[480px] perspective-1000 z-10">
      {/* Asymmetric Decorative Element */}
      <div className="absolute -top-12 -right-8 w-24 h-24 signature-gradient rounded-full opacity-20 blur-xl"></div>
      
      {/* The Glass Card */}
      <div className="glass-card rounded-[2rem] p-10 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,80,212,0.08)] border border-white/40 relative z-10">
        
        {/* Brand/Intro */}
        <div className="mb-10 text-center md:text-left animate-fade-in-up">
          <h1 className="text-4xl font-extrabold tracking-[-0.03em] text-on-surface mb-3">
            Admin Access
          </h1>
          <p className="text-on-surface-variant leading-relaxed">
            Securely authenticate to manage the CareerCurator platform.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleLogin}>

          {/* Input Groups */}
          <div className="space-y-4">
            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-2 px-4">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline-variant group-focus-within:text-primary transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-high/50 border-none rounded-xl focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all outline-none placeholder:text-outline-variant" 
                  placeholder="admin@thecurator.io" 
                  type="email"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-2 px-4">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline-variant group-focus-within:text-primary transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  required
                  className="w-full pl-12 pr-12 py-4 bg-surface-container-high/50 border-none rounded-xl focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all outline-none placeholder:text-outline-variant" 
                  placeholder="••••••••" 
                  type="password"
                />
                <button className="absolute inset-y-0 right-4 flex items-center text-outline-variant hover:text-on-surface" type="button">
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Helpers */}
          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input className="peer appearance-none w-5 h-5 rounded-md border-2 border-outline-variant checked:bg-primary checked:border-primary transition-all cursor-pointer" type="checkbox"/>
                <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
              </div>
              <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">Remember session</span>
            </label>
            <Link className="text-sm font-semibold text-primary hover:underline underline-offset-4 decoration-2" href="#">Reset credentials?</Link>
          </div>

          {/* CTA */}
          <div className="pt-4">
            <button type="submit" className="w-full signature-gradient text-white font-bold py-4 rounded-full shadow-[0_12px_24px_-8px_rgba(0,80,212,0.4)] hover:scale-[1.02] hover:shadow-[0_20px_32px_-8px_rgba(0,80,212,0.5)] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2">
              Authorize
              <i className="material-symbols-outlined text-[20px]">arrow_forward</i>
            </button>
          </div>
        </form>

        {/* Footer Info */}
        <div className="mt-8 text-center border-t border-outline-variant/10 pt-6">
          <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.2em] font-medium">
             Unauthorized access attempts are monitored
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="relative min-h-[85vh] flex flex-col items-center justify-center p-6 pt-24 pb-12 w-full">
      <Suspense fallback={<div className="animate-pulse w-full max-w-[480px] h-[500px] glass-card rounded-[2rem]"></div>}>
        <AdminLoginForm />
      </Suspense>
    </main>
  );
}
