import { BrainCircuit, Activity, Moon, Sun, ToggleRight, ToggleLeft, ServerCrash, ShieldCheck } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">System Configuration</h2>
          <p className="text-on-surface-variant text-lg">Manage AI matching algorithms and core platform behavior.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2.5 rounded-full font-bold text-on-surface-variant bg-surface-container hover:bg-surface-variant transition-all">Discard</button>
          <button className="px-8 py-2.5 rounded-full font-bold text-white signature-gradient shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">Save Settings</button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* AI Matching Control (Large Bento Card) */}
        <div className="lg:col-span-8 glass-card rounded-[2rem] p-8 shadow-sm border border-outline-variant/10 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">AI Matching Sensitivity</h3>
                <p className="text-on-surface-variant text-sm">Tune the semantic engine for job-candidate pairing.</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-secondary-container text-secondary-dim rounded-full text-[10px] font-bold tracking-wider uppercase hidden sm:block">Active Engine v4.2</span>
          </div>
          
          <div className="space-y-10 py-4">
            <div className="relative pt-1">
              <div className="flex mb-4 items-center justify-between">
                <span className="text-[10px] font-bold py-1 px-3 uppercase rounded-full text-secondary bg-secondary/10">Lax Match</span>
                <span className="text-[10px] font-bold py-1 px-3 uppercase rounded-full text-secondary bg-secondary/10">Precision Core</span>
              </div>
              <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-surface-container-highest">
                <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-secondary to-primary w-[75%]"></div>
              </div>
              <input className="absolute top-5 left-0 w-full h-3 opacity-0 cursor-pointer appearance-none" type="range" defaultValue={75} />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10">
                <p className="text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Similarity TH</p>
                <p className="text-2xl font-black text-primary">85%</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10">
                <p className="text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Latency</p>
                <p className="text-2xl font-black text-secondary">42ms</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10">
                <p className="text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Neural Load</p>
                <p className="text-2xl font-black text-blue-800">12%</p>
              </div>
            </div>
          </div>
        </div>

        {/* API Status Monitors (Small Bento Card) */}
        <div className="lg:col-span-4 glass-card rounded-[2rem] p-8 shadow-sm border border-outline-variant/10">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-on-surface" />
            <h3 className="text-lg font-bold">API Health Status</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                <span className="font-semibold text-sm">Auth-Service</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700">OK</span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                <span className="font-semibold text-sm">Search-Gateway</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700">OK</span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                <span className="font-semibold text-sm">NLP-Analysis</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-amber-700">Traffic Load</span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                <span className="font-semibold text-sm">Email-Relay</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700">OK</span>
            </div>
          </div>
        </div>

        {/* Global Appearance (Medium Bento Card) */}
        <div className="lg:col-span-4 glass-card rounded-[2rem] p-8 shadow-sm border border-outline-variant/10">
          <h3 className="text-lg font-bold mb-6">Default Appearance</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="py-6 px-2 rounded-[1.5rem] bg-white border-2 border-primary flex flex-col items-center gap-3 shadow-sm hover:bg-slate-50 transition-colors">
              <Sun className="w-8 h-8 text-primary" />
              <span className="font-bold text-sm">Light Mode</span>
            </button>
            <button className="py-6 px-2 rounded-[1.5rem] bg-slate-900 border-2 border-transparent flex flex-col items-center gap-3 transition-colors hover:bg-slate-800">
              <Moon className="w-8 h-8 text-slate-400" />
              <span className="font-bold text-white text-sm">Dark Mode</span>
            </button>
          </div>
          <div className="mt-6 p-4 bg-surface-container-low rounded-2xl flex items-center justify-between border border-outline-variant/10">
            <span className="text-xs font-semibold">Auto Sync (System)</span>
            <ToggleRight className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Notification Toggles (Large/Wide Bento Card) */}
        <div className="lg:col-span-8 glass-card rounded-[2rem] p-8 shadow-sm border border-outline-variant/10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Automated Notifications</h3>
            <span className="text-primary font-bold text-xs uppercase tracking-wider cursor-pointer hover:underline">Reset to Default</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div className="flex items-center justify-between border-b border-surface-container pb-4">
              <div>
                <p className="font-bold text-sm text-on-surface">Daily System Digest</p>
                <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">Admin performance summaries</p>
              </div>
              <ToggleRight className="w-8 h-8 text-primary cursor-pointer" />
            </div>
            <div className="flex items-center justify-between border-b border-surface-container pb-4">
              <div>
                <p className="font-bold text-sm text-on-surface">New User Validation</p>
                <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">Alert for pending company approvals</p>
              </div>
              <ToggleRight className="w-8 h-8 text-primary cursor-pointer" />
            </div>
            <div className="flex items-center justify-between border-b border-surface-container pb-4">
              <div>
                <p className="font-bold text-sm text-on-surface">Security Breach Alerts</p>
                <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">Instant push for high-risk activity</p>
              </div>
              <ToggleRight className="w-8 h-8 text-primary cursor-pointer" />
            </div>
            <div className="flex items-center justify-between border-b border-surface-container pb-4">
              <div>
                <p className="font-bold text-sm text-on-surface">AI Training Completed</p>
                <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">Notify when nightly fine-tuning ends</p>
              </div>
              <ToggleLeft className="w-8 h-8 text-outline-variant cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Meta Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2rem] p-10 text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-xl shadow-slate-900/10">
        <div className="relative z-10 md:mr-8 mb-6 md:mb-0">
          <div className="flex items-center gap-3 mb-3">
             <ShieldCheck className="w-6 h-6 text-emerald-400" />
             <h4 className="text-2xl font-bold">Platform Integrity</h4>
          </div>
          <p className="text-slate-400 max-w-xl text-sm leading-relaxed">Last security sweep completed 14 minutes ago. All global nodes reporting optimal performance indices. No critical anomalies detected in the last 24-hour cycle.</p>
        </div>
        <div className="flex items-center gap-6 md:gap-8 relative z-10 w-full md:w-auto justify-between md:justify-end">
          <div className="text-center">
            <p className="text-3xl font-black text-primary-fixed">99.98%</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1">Uptime</p>
          </div>
          <div className="text-center md:mr-4">
            <p className="text-3xl font-black text-secondary-fixed">0.02%</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1">Error Rate</p>
          </div>
          <button className="hidden md:block bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl font-bold transition-all text-sm whitespace-nowrap">View Logs</button>
        </div>
        
        {/* Abstract Texture Decor */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/20 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-secondary/10 blur-[80px] rounded-full pointer-events-none"></div>
      </div>
    </div>
  );
}
