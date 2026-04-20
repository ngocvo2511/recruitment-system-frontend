import { Building2, ShieldAlert, CheckCircle, Clock, Filter, ExternalLink, FileText, Ban, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function CompanyModerationPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">Company Moderation</h1>
        <p className="text-on-surface-variant max-w-2xl">Review and manage corporate registrations. Maintain the integrity of the ecosystem by verifying business entities.</p>
      </div>

      {/* Stats/Bento Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl shadow-sm border border-outline-variant/10">
          <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-2">Pending</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold">24</span>
            <span className="text-primary bg-primary/10 px-2.5 py-1 rounded-full text-xs font-bold">+12%</span>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl shadow-sm border border-outline-variant/10 border-l-4 border-l-secondary">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-2">Verified Today</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold">156</span>
            <span className="text-secondary bg-secondary/10 px-2.5 py-1 rounded-full text-xs font-bold">Good pace</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl shadow-sm border border-outline-variant/10">
          <span className="text-xs font-bold text-error uppercase tracking-widest block mb-2">Flagged</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold">08</span>
            <span className="text-error bg-error/10 px-2.5 py-1 rounded-full text-xs font-bold">Needs Action</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl shadow-sm border border-outline-variant/10">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Total Partners</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold">1,204</span>
            <span className="text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full text-xs font-bold">Lifetime</span>
          </div>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Pending Approval Queue</h2>
          <div className="flex gap-2">
            <button className="bg-surface-container-high px-4 py-2 rounded-full text-sm font-medium hover:bg-surface-variant transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="bg-surface-container-high px-4 py-2 rounded-full text-sm font-medium hover:bg-surface-variant transition-colors">Latest First</button>
          </div>
        </div>

        {/* Company Cards Layout */}
        <div className="grid grid-cols-1 gap-4">
          
          {/* Company Card 1 */}
          <div className="glass-panel group p-6 rounded-[1.5rem] border border-outline-variant/10 flex flex-col lg:flex-row items-start lg:items-center gap-6 transition-all hover:shadow-xl hover:shadow-blue-500/5 hover:border-primary/20">
            <div className="w-16 h-16 rounded-2xl bg-white p-2 flex items-center justify-center overflow-hidden shrink-0 border border-outline-variant/10">
              <img className="w-full h-full object-contain" src="https://i.pravatar.cc/150?img=1" alt="Nexus AI Solutions" />
            </div>
            
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              <div>
                <h4 className="text-on-surface font-bold text-lg leading-tight">Nexus AI Solutions</h4>
                <Link className="text-primary text-sm font-medium flex items-center gap-1 hover:underline" href="#">
                  nexus-ai.io
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Industry</p>
                <p className="text-on-surface font-medium text-sm">Artificial Intelligence</p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Status</p>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                  Unverified
                </span>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Documentation</p>
                <Link className="text-secondary text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform" href="#">
                  <FileText className="w-4 h-4" />
                  license_2024.pdf
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-outline-variant/10">
              <button className="flex-1 lg:flex-none px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-br from-primary to-primary-container hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-sm">
                <CheckCircle className="w-4 h-4" />
                Verify
              </button>
              <button className="flex-1 lg:flex-none px-4 py-2 rounded-full text-sm font-bold text-primary-container bg-surface-container-high hover:bg-surface-variant transition-colors active:scale-95">
                Info
              </button>
              <button className="p-2 rounded-full text-error hover:bg-error/10 transition-colors">
                <Ban className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Company Card 2 */}
          <div className="glass-panel group p-6 rounded-[1.5rem] border border-outline-variant/10 flex flex-col lg:flex-row items-start lg:items-center gap-6 transition-all hover:shadow-xl hover:shadow-blue-500/5 hover:border-primary/20">
            <div className="w-16 h-16 rounded-2xl bg-white p-2 flex items-center justify-center overflow-hidden shrink-0 border border-outline-variant/10">
              <img className="w-full h-full object-contain" src="https://i.pravatar.cc/150?img=2" alt="GreenLeaf Logistics" />
            </div>
            
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              <div>
                <h4 className="text-on-surface font-bold text-lg leading-tight">GreenLeaf Logistics</h4>
                <Link className="text-primary text-sm font-medium flex items-center gap-1 hover:underline" href="#">
                  greenleaf.com
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Industry</p>
                <p className="text-on-surface font-medium text-sm">Supply Chain</p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Status</p>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-error-container/20 text-red-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5"></span>
                  Suspended
                </span>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Documentation</p>
                <Link className="text-secondary text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform" href="#">
                  <FileText className="w-4 h-4" />
                  compliance_audit.pdf
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-outline-variant/10">
              <button className="flex-1 lg:flex-none px-4 py-2 rounded-full text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors active:scale-95">
                Re-evaluate
              </button>
              <button className="flex-1 lg:flex-none px-4 py-2 rounded-full text-sm font-bold text-on-surface bg-surface-container-high hover:bg-surface-variant transition-colors active:scale-95">
                View History
              </button>
            </div>
          </div>

          {/* Company Card 3 */}
          <div className="glass-panel group p-6 rounded-[1.5rem] border border-outline-variant/10 flex flex-col lg:flex-row items-start lg:items-center gap-6 transition-all hover:shadow-xl hover:shadow-blue-500/5 hover:border-primary/20">
            <div className="w-16 h-16 rounded-2xl bg-white p-2 flex items-center justify-center overflow-hidden shrink-0 border border-outline-variant/10">
              <img className="w-full h-full object-contain" src="https://i.pravatar.cc/150?img=3" alt="Apex Design Studio" />
            </div>
            
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              <div>
                <h4 className="text-on-surface font-bold text-lg leading-tight">Apex Design Studio</h4>
                <Link className="text-primary text-sm font-medium flex items-center gap-1 hover:underline" href="#">
                  apexdesign.studio
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Industry</p>
                <p className="text-on-surface font-medium text-sm">Creative Arts</p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Status</p>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                  Unverified
                </span>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Documentation</p>
                <span className="text-on-surface-variant text-sm flex items-center gap-1 italic">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  Missing files
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-outline-variant/10">
              <button disabled className="flex-1 lg:flex-none px-4 py-2 rounded-full text-sm font-bold text-white bg-slate-300 cursor-not-allowed flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Verify
              </button>
              <button className="flex-1 lg:flex-none px-4 py-2 rounded-full text-sm font-bold text-secondary bg-secondary/10 hover:bg-secondary/20 transition-colors active:scale-95 flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                Request Info
              </button>
              <button className="p-2 rounded-full text-error hover:bg-error/10 transition-colors">
                <Ban className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Asymmetric Grid for Moderation Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-10">
        <div className="lg:col-span-2 glass-panel p-8 rounded-[2rem] bg-gradient-to-br from-white/80 to-slate-100/40 border border-outline-variant/10 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Registration Trends</h3>
            <p className="text-on-surface-variant text-sm mb-6 max-w-lg">Activity has increased by 18% over the last 30 days. Most registrations are coming from the FinTech sector.</p>
            <div className="h-48 w-full border border-outline-variant/10 bg-white/50 rounded-xl flex items-end justify-between p-4 gap-2 backdrop-blur-md">
              {[40, 60, 35, 85, 55, 70, 95].map((height, i) => (
                <div key={i} className={`w-full rounded-t-lg transition-all ${i === 6 ? 'signature-gradient' : 'bg-primary/20 hover:bg-primary/40'}`} style={{ height: `${height}%` }}></div>
              ))}
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/10 blur-3xl rounded-full pointer-events-none"></div>
        </div>

        <div className="glass-panel p-8 rounded-[2rem] bg-secondary/5 border border-secondary/10 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6">
              <ShieldCheck className="text-secondary w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Automated Checks</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">System scan suggests 4 of the pending companies are likely shell corporations. Extra verification is required for high-risk flags.</p>
          </div>
          <button className="mt-8 w-full py-3 rounded-full bg-secondary text-white font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-secondary/20 active:scale-95">
            Run Global Check
          </button>
        </div>
      </div>
    </div>
  );
}
