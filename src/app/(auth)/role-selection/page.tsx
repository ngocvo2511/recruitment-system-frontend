import Link from 'next/link';
import { ArrowRight, User, Briefcase } from 'lucide-react';

export default function RoleSelection() {
  return (
    <main className="flex-grow flex flex-col items-center justify-center px-6 pt-24 pb-12 w-full">
      <div className="w-full max-w-4xl space-y-12 text-center">
        
        {/* Step Indicator & Header */}
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-center gap-2">
            <div className="w-12 h-1.5 rounded-full signature-gradient shadow-sm shadow-primary/20"></div>
            <div className="w-12 h-1.5 rounded-full bg-surface-container-highest"></div>
            <div className="w-12 h-1.5 rounded-full bg-surface-container-highest"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-[-0.02em] text-on-surface">Choose Your Journey</h1>
          <p className="text-lg text-on-surface-variant max-w-xl mx-auto">
            Select how you want to use The Curator. You can always change this later in your account settings.
          </p>
        </div>

        {/* Role Selection Grid */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          
          {/* Candidate Card */}
          <Link href="/login?role=candidate" className="glass-card group relative p-10 rounded-xl border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-left flex flex-col justify-between">
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl signature-gradient flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                <User className="text-on-primary w-8 h-8" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-on-surface">Candidate</h2>
                <p className="text-on-surface-variant leading-relaxed">
                  Find your dream job and get AI-matched opportunities tailored to your skills.
                </p>
              </div>
              <div className="pt-4 border-t border-outline-variant/10">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                    Curated portfolio builder
                  </li>
                  <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                    AI-powered job discovery
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 flex items-center text-primary font-bold group-hover:translate-x-2 transition-transform duration-300">
              Continue as Candidate
              <ArrowRight className="ml-2 w-5 h-5" />
            </div>
          </Link>

          {/* Recruiter Card */}
          <Link href="/login?role=recruiter" className="glass-card group relative p-10 rounded-xl border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-left flex flex-col justify-between overflow-hidden">
            {/* Subtle Gradient Overlap */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-secondary/5 rounded-full blur-3xl"></div>
            <div className="space-y-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Briefcase className="text-on-secondary w-8 h-8" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-on-surface">Recruiter</h2>
                <p className="text-on-surface-variant leading-relaxed">
                  Hire top talent and manage your team efficiently with professional tools.
                </p>
              </div>
              <div className="pt-4 border-t border-outline-variant/10">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
                    Advanced talent search
                  </li>
                  <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
                    Team collaboration suite
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 flex items-center text-secondary font-bold group-hover:translate-x-2 transition-transform duration-300 relative z-10">
              Continue as Recruiter
              <ArrowRight className="ml-2 w-5 h-5" />
            </div>
          </Link>

        </div>

        {/* Additional Help */}
        <p className="text-sm text-slate-500 font-medium tracking-wider uppercase">
          Already have an account? <Link className="text-primary hover:underline underline-offset-4" href="/login">Log in here</Link>
        </p>

      </div>
    </main>
  );
}
