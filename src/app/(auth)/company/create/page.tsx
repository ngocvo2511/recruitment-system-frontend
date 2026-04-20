"use client";

import Link from "next/link";
import { Building2, AtSign, ChevronDown } from "lucide-react";

export default function CreateCompanyPage() {
  return (
    <main className="relative z-10 w-full max-w-lg mx-auto px-6 py-32 flex-grow min-h-screen flex flex-col justify-center animate-fade-in-up">
      {/* Abstract Background Elements (Local to this view) */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] signature-gradient opacity-10 blur-[120px] rounded-full rotate-12 -z-10 pointer-events-none"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[50%] bg-secondary opacity-5 blur-[100px] rounded-full -rotate-12 -z-10 pointer-events-none"></div>
      
      {/* Title */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
          The Curator
        </h1>
        <p className="text-on-surface-variant mt-2 font-medium tracking-tight">Recruiter Registration — Step 2A</p>
      </div>

      {/* Main Glass Card */}
      <div className="glass-card border border-outline-variant/10 rounded-3xl p-8 md:p-12 shadow-xl bg-white/70">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-on-surface tracking-tight mb-2">Create Company Profile</h2>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Establish your corporate presence on the platform to begin managing your talent pipelines.
          </p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          
          {/* Company Name Field */}
          <div className="space-y-2 group">
            <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1 group-focus-within:text-primary transition-colors">Company Name</label>
            <div className="relative">
              <input className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none" placeholder="e.g. Acme Corporation" type="text" />
              <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant w-5 h-5 pointer-events-none" />
            </div>
          </div>

          {/* Company Email Domain */}
          <div className="space-y-2 group">
            <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1 group-focus-within:text-primary transition-colors">Company Email Domain</label>
            <div className="relative">
              <input className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none" placeholder="acme.com" type="text" />
              <AtSign className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant w-5 h-5 pointer-events-none" />
            </div>
            <p className="text-[10px] text-outline ml-1">Used for employee verification and auto-joining.</p>
          </div>

          {/* Company Size Dropdown */}
          <div className="space-y-2 group">
            <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1 group-focus-within:text-primary transition-colors">Company Size</label>
            <div className="relative">
              <select defaultValue="" className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface appearance-none focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none cursor-pointer">
                <option disabled value="">Select size range</option>
                <option value="1-10">1-10 Employees</option>
                <option value="11-50">11-50 Employees</option>
                <option value="51-200">51-200 Employees</option>
                <option value="201-500">201-500 Employees</option>
                <option value="501-1000">501-1,000 Employees</option>
                <option value="1001+">1,001+ Employees</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant w-5 h-5 pointer-events-none" />
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="py-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 flex-1 signature-gradient rounded-full"></div>
              <div className="h-1 flex-1 bg-surface-container-highest rounded-full"></div>
            </div>
            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest text-center">Step 2 of 3: Identity & Structure</p>
          </div>

          {/* CTA */}
          <div className="pt-2">
            <Link href="/recruiter/dashboard" className="w-full signature-gradient text-white py-4 rounded-full font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center">
              Register Company & Create Account
            </Link>
            <p className="text-center text-xs text-on-surface-variant mt-4 font-medium italic mb-2">
              You will be set as the Company Owner
            </p>
          </div>

        </form>
      </div>

      {/* Visual Context Anchor */}
      <div className="mt-12 flex items-center justify-between opacity-40">
        <div className="flex -space-x-3 overflow-hidden ml-4">
          <img alt="User" className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://i.pravatar.cc/150?img=47" />
          <img alt="User" className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://i.pravatar.cc/150?img=11" />
          <img alt="User" className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://i.pravatar.cc/150?img=33" />
        </div>
        <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter mr-4">
          Join 500+ Curated Organizations
        </div>
      </div>
    </main>
  );
}
