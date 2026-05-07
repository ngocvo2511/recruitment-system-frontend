"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { Mail, Lock, Check, Eye, EyeOff, Loader2 } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialRole = searchParams.get("role") || "candidate";
  
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('http://localhost:8080/api/auth/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.code === 1000) {
        const token = data.result.token;
        localStorage.setItem('token', token);
        
        if (role === 'employer') {
          router.push("/recruiter/dashboard");
        } else {
          router.push("/candidate/jobs");
        }
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred while connecting to the server.');
    } finally {
      setLoading(false);
    }
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
            Welcome Back
          </h1>
          <p className="text-on-surface-variant leading-relaxed">
            Continue your journey into curated excellence.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleLogin}>
          {/* Role Switcher */}
          <div className="flex p-1 bg-surface-container-low rounded-full mb-8">
            <button 
              onClick={() => setRole('candidate')}
              className={`flex-1 py-2 px-4 text-xs font-bold tracking-widest uppercase rounded-full transition-all ${role === 'candidate' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`} 
              type="button"
            >
              Candidate
            </button>
            <button 
              onClick={() => setRole('employer')}
              className={`flex-1 py-2 px-4 text-xs font-bold tracking-widest uppercase rounded-full transition-all ${role === 'employer' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`} 
              type="button"
            >
              Employer
            </button>
          </div>

          {/* Input Groups */}
          <div className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-100/10 border border-red-500/20 rounded-xl">
                {error}
              </div>
            )}
            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-2 px-4">
                Email Address
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
                  placeholder="name@company.com" 
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-surface-container-high/50 border-none rounded-xl focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all outline-none placeholder:text-outline-variant" 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"}
                />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-4 flex items-center text-outline-variant hover:text-on-surface" type="button">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
              <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">Remember me</span>
            </label>
            <Link className="text-sm font-semibold text-primary hover:underline underline-offset-4 decoration-2" href="#">Forgot password?</Link>
          </div>

          {/* CTA */}
          <div className="pt-4">
            <button disabled={loading} type="submit" className="w-full signature-gradient text-white font-bold py-4 rounded-full shadow-[0_12px_24px_-8px_rgba(0,80,212,0.4)] hover:scale-[1.02] hover:shadow-[0_20px_32px_-8px_rgba(0,80,212,0.5)] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Login
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <p className="text-on-surface-variant text-sm">
            Don't have an account? 
            <Link className="text-secondary font-bold hover:text-secondary-dim transition-colors ml-1" href={role === 'employer' ? "/company/select-action" : "/register"}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-6 pt-24 w-full">
      <Suspense fallback={<div className="animate-pulse w-full max-w-[480px] h-[500px] glass-card rounded-[2rem]"></div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
