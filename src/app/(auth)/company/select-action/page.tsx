"use client";

import { Building2, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SelectCompanyActionPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-6 pt-24 w-full">
      <div className="w-full max-w-4xl space-y-12 text-center animate-fade-in-up z-10 relative">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Step Indicator & Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-12 h-1.5 rounded-full signature-gradient shadow-sm shadow-primary/20"></div>
            <div className="w-12 h-1.5 rounded-full bg-surface-container-highest"></div>
            <div className="w-12 h-1.5 rounded-full bg-surface-container-highest"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-[-0.02em] text-on-surface">Company Setup</h1>
          <p className="text-lg text-on-surface-variant max-w-xl mx-auto">Select how you want to join the platform as a recruiter. Establish a new brand or connect to an existing one.</p>
        </div>

        {/* Selection Grid */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">



          {/* Create Company Card */}
          <button
            onClick={() => router.push("/company/create")}
            className="glass-card group relative p-10 rounded-xl border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-left flex flex-col justify-between overflow-hidden"
          >
            {/* Subtle Gradient Overlap */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Building2 className="text-on-secondary w-8 h-8" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-on-surface">Create New Company</h2>
                <p className="text-on-surface-variant leading-relaxed">Set up a new organization and begin establishing your employer branding on the platform.</p>
              </div>
              <div className="pt-4 border-t border-outline-variant/10">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <CheckCircle2 className="text-secondary w-5 h-5" />
                    Build verified profile
                  </li>
                  <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <CheckCircle2 className="text-secondary w-5 h-5" />
                    Manage team permissions
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 flex items-center text-secondary font-bold group-hover:translate-x-2 transition-transform duration-300 relative z-10">
              Register Company
              <ArrowRight className="w-5 h-5 ml-2" />
            </div>
          </button>

          {/* Join Company Card */}
          <button
            onClick={() => router.push("/company/join")}
            className="glass-card group relative p-10 rounded-xl border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-left flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl signature-gradient flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Users className="text-on-primary w-8 h-8" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-on-surface">Join Existing Company</h2>
                <p className="text-on-surface-variant leading-relaxed">Connect with your team and start recruiting together under your established brand.</p>
              </div>
              <div className="pt-4 border-t border-outline-variant/10">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <CheckCircle2 className="text-primary w-5 h-5" />
                    Access team templates
                  </li>
                  <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <CheckCircle2 className="text-primary w-5 h-5" />
                    Shared candidate pipelines
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 flex items-center text-primary font-bold group-hover:translate-x-2 transition-transform duration-300">
              Find Your Company
              <ArrowRight className="w-5 h-5 ml-2" />
            </div>
          </button>

        </div>

        {/* Additional Help */}
        <div className="pt-8">
          <p className="text-sm text-slate-500 font-medium tracking-wider uppercase">
            Already have an account? <Link className="text-primary hover:underline underline-offset-4" href="/login">Log in here</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
