"use client";

import { Building, Search, ChevronRight, CheckCircle2, Send, Hourglass, Users, BarChart3, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function JoinCompanyPage() {
  const [isPending, setIsPending] = useState(false);

  return (
    <main className="relative min-h-screen flex flex-col items-center p-6 pt-24 pb-20 w-full animate-fade-in-up">
      {/* Abstract Background Decorative Elements */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[100px] -z-10 pointer-events-none"></div>

      {/* Registration Step Header */}
      <div className="w-full max-w-2xl mb-12 text-center relative z-10">
        <span className="text-[10px] font-bold tracking-[0.1em] text-primary uppercase mb-4 block">Step 2B: Company Verification</span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-4">Join Your Team</h1>
        <p className="text-on-surface-variant text-lg max-w-lg mx-auto">Connect with your organization to start managing talent and posting opportunities.</p>
      </div>

      {/* Main Glass Card Container */}
      <div className="w-full max-w-xl glass-card p-8 md:p-12 rounded-[2rem] shadow-[0_40px_60px_-15px_rgba(44,47,49,0.06)] relative border border-white/40 z-10">
        
        {/* Search Data state vs Pending state */}
        {!isPending ? (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <label className="text-sm font-bold tracking-wider text-on-surface-variant uppercase flex items-center gap-2">
                <Building className="w-4 h-4" />
                Company Name or Domain
              </label>
              <div className="relative group">
                <input 
                  className="w-full bg-surface-container-high/50 border-none rounded-xl py-4 px-6 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all duration-300 outline-none" 
                  placeholder="e.g. Acme Corp or acme.com" 
                  type="text" 
                  defaultValue="Nexus"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Search className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>

            {/* Interactive Search Suggestions */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold tracking-widest text-on-surface-variant/70 px-2 uppercase">Suggested Companies</p>
              
              <div className="space-y-2">
                {/* Suggestion Item 1 */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-lowest/80 border border-transparent hover:border-primary/20 hover:bg-white transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-outline-variant/10 p-2">
                      <img alt="Company Logo" className="w-full h-full object-contain" src="https://i.pravatar.cc/150?img=4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface text-sm">Nexus Systems</h4>
                      <p className="text-[11px] font-medium text-on-surface-variant mt-0.5">nexus-systems.tech • 1,200 Employees</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Suggestion Item 2 - Selected/Active Feel */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20 transition-all duration-200 cursor-pointer relative overflow-hidden group hover:bg-primary/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center overflow-hidden border border-primary/10 p-2">
                      <img alt="Company Logo" className="w-full h-full object-contain" src="https://i.pravatar.cc/150?img=5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface text-sm">Nexus Creative Agency</h4>
                      <p className="text-[11px] font-medium text-on-surface-variant mt-0.5">nexus.creative • 45 Employees</p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>

                {/* Suggestion Item 3 */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-lowest/80 border border-transparent hover:border-primary/20 hover:bg-white transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-outline-variant/10 p-2">
                      <img alt="Company Logo" className="w-full h-full object-contain" src="https://i.pravatar.cc/150?img=6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface text-sm">Global Nexus Logistics</h4>
                      <p className="text-[11px] font-medium text-on-surface-variant mt-0.5">gn-logistics.com • 5,000+ Employees</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <button onClick={() => setIsPending(true)} className="w-full signature-gradient text-white py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] hover:shadow-xl active:scale-95 transition-all duration-300 flex items-center justify-center gap-2">
                Request to Join
                <Send className="w-4 h-4 ml-1" />
              </button>
              <p className="text-center text-xs text-on-surface-variant mt-4">
                Can't find your company? <Link className="text-primary font-bold hover:underline underline-offset-2 ml-1" href="/company/create">Register a new organization</Link>
              </p>
            </div>
          </div>
        ) : (
          /* Pending Status View */
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-secondary-container/50 border border-secondary/20 flex items-center justify-center mb-2">
              <Hourglass className="text-secondary w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-on-surface mb-2">Request Submitted</h3>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary/10 text-secondary font-bold text-[11px] uppercase tracking-wider mb-4 border border-secondary/20">
                Pending Approval from Admin
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed max-w-sm">
                An email has been sent to the administrators of <strong className="text-on-surface">Nexus Creative Agency</strong>. You'll receive a notification once they've confirmed your membership.
              </p>
            </div>
            <button onClick={() => setIsPending(false)} className="text-on-surface-variant text-sm font-bold hover:text-primary transition-colors mt-4">
              Cancel Request
            </button>
          </div>
        )}
      </div>

      {/* Secondary Information Section - Asymmetric Bento Style */}
      <div className="w-full max-w-4xl mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="md:col-span-2 glass-card p-8 rounded-3xl flex flex-col justify-between border border-outline-variant/10">
          <div>
            <h3 className="text-2xl font-extrabold tracking-tight mb-3">Why join your company?</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-8 max-w-lg">Gain access to existing job pipelines, collaborative hiring features, and shared talent pools that are already active within your organization.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-on-surface">Team Access</p>
                <p className="text-xs text-on-surface-variant mt-0.5">View your colleagues' activity</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-secondary/10 rounded-xl text-secondary shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-on-surface">Shared Data</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Unified analytics & reporting</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary to-secondary text-white p-8 rounded-3xl flex flex-col justify-center relative overflow-hidden shadow-xl shadow-primary/10 group">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <ShieldCheck className="w-10 h-10 mb-4" />
            <h3 className="text-xl font-bold mb-2">Secure Verification</h3>
            <p className="text-white/80 text-sm leading-relaxed">We use enterprise-grade security to ensure only verified employees gain access to company workspaces.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
