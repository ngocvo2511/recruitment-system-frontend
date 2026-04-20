"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock simulation
    setTimeout(() => {
      router.push("/candidate/jobs");
    }, 1500);
  };

  return (
    <div className="w-full max-w-lg z-10">
      <div className="glass-card rounded-[1.5rem] p-8 md:p-12 shadow-[0_40px_60px_rgba(0,0,0,0.04)] border border-white/40">
        {/* Branding & Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-[-0.02em] text-on-surface mb-3">
            Join the Gallery
          </h1>
          <p className="text-on-surface-variant">
            Start your journey as a curated candidate.
          </p>
        </div>

        {/* Registration Form */}
        <form className="space-y-6" onSubmit={handleRegister}>
          {/* Full Name */}
          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">
              Full Name
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline-variant group-focus-within:text-primary transition-colors">
                <User className="w-5 h-5" />
              </div>
              <input 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full pl-11 pr-4 py-4 bg-surface-container-high/50 rounded-xl border-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all text-on-surface placeholder:text-outline-variant outline-none" 
                placeholder="John Doe" 
                type="text"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline-variant group-focus-within:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-4 bg-surface-container-high/50 rounded-xl border-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all text-on-surface placeholder:text-outline-variant outline-none" 
                placeholder="john@example.com" 
                type="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline-variant group-focus-within:text-primary transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-4 py-4 bg-surface-container-high/50 rounded-xl border-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all text-on-surface placeholder:text-outline-variant outline-none" 
                placeholder="••••••••" 
                type="password"
              />
            </div>
          </div>

          {/* Primary CTA */}
          <button 
            disabled={isSubmitting}
            className="w-full signature-gradient text-white font-bold py-4 rounded-full shadow-[0_10px_30px_rgba(0,80,212,0.2)] hover:scale-[1.02] active:scale-95 transition-all duration-300 mt-4 group flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed" 
            type="submit"
          >
            Create Candidate Account
            {!isSubmitting && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>

          {/* Feedback Placeholder (Visible on pseudo-success) */}
          {isSubmitting && (
            <div className="flex items-center justify-center gap-3 py-4 px-6 bg-secondary-container/30 rounded-xl border border-secondary/10 animate-fade-in-up">
              <div className="relative flex items-center justify-center">
                <div className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-secondary opacity-75"></div>
                <div className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></div>
              </div>
              <p className="text-sm font-medium text-on-secondary-container">Redirecting to job discovery...</p>
            </div>
          )}
        </form>

        {/* Secondary Action */}
        <div className="mt-8 text-center">
          <p className="text-on-surface-variant">
            Already have an account? 
            <Link className="text-primary font-bold hover:underline ml-1" href="/login">Log in</Link>
          </p>
        </div>
      </div>
      
      {/* Social Proof / Footer Context */}
      <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
        <div className="flex -space-x-3">
          <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-surface-container-high">
            <img className="w-full h-full object-cover" src="https://i.pravatar.cc/150?img=1" />
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-surface-container-high">
            <img className="w-full h-full object-cover" src="https://i.pravatar.cc/150?img=2" />
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-surface-container-high">
            <img className="w-full h-full object-cover" src="https://i.pravatar.cc/150?img=3" />
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-white bg-secondary flex items-center justify-center text-[10px] text-white font-bold">
            +2k
          </div>
        </div>
        <div className="text-center md:text-right">
          <p className="text-xs uppercase tracking-widest text-outline-variant">Trusted by the world's most</p>
          <p className="text-sm font-bold text-on-surface">Ambitious Creative Professionals</p>
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
