import Link from "next/link";
import { Sparkles, ChevronDown, MapPin, Bold, Italic, List, Link as LinkIcon, Save, Send } from "lucide-react";

export default function CreateJobPage() {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up relative z-10 w-full flex justify-center pb-20">
      <div className="w-full">
        {/* Header Section */}
        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-on-surface mb-2">Create New Opening</h1>
            <p className="text-on-surface-variant text-lg max-w-xl">Define your candidate's future role with clarity and editorial elegance.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-bold uppercase tracking-widest self-start shadow-sm border border-secondary/20">
            <Sparkles className="w-4 h-4 fill-secondary/20" />
            AI Optimizer Active
          </div>
        </div>

        {/* Focused Glassmorphic Form */}
        <div className="glass-card rounded-[2rem] shadow-xl p-8 md:p-12 relative overflow-hidden border border-white/40">
          {/* Visual Soul Gradient Accent */}
          <div className="absolute top-0 left-0 w-2 h-full signature-gradient"></div>
          
          <form className="space-y-10">
            {/* Section: Role Essentials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2 group">
                <label className="block text-xs font-bold uppercase tracking-[0.1em] text-primary mb-3 group-focus-within:text-secondary transition-colors">Job Title</label>
                <input className="w-full bg-surface-container-high/50 border-none rounded-xl px-5 py-4 text-lg font-medium focus:ring-2 focus:ring-primary/40 placeholder:text-on-surface-variant/40 transition-all outline-none" placeholder="e.g. Senior Principal Product Designer" type="text" />
              </div>
              
              <div className="group">
                <label className="block text-xs font-bold uppercase tracking-[0.1em] text-primary mb-3 group-focus-within:text-secondary transition-colors">Job Type</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-surface-container-high/50 border-none rounded-xl px-5 py-4 font-medium focus:ring-2 focus:ring-primary/40 transition-all outline-none cursor-pointer">
                    <option>Full-time</option>
                    <option>Contract</option>
                    <option>Part-time</option>
                    <option>Freelance</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5 pointer-events-none" />
                </div>
              </div>
              
              <div className="group">
                <label className="block text-xs font-bold uppercase tracking-[0.1em] text-primary mb-3 group-focus-within:text-secondary transition-colors">Location</label>
                <div className="relative">
                  <input className="w-full bg-surface-container-high/50 border-none rounded-xl px-5 py-4 font-medium focus:ring-2 focus:ring-primary/40 placeholder:text-on-surface-variant/40 transition-all outline-none" placeholder="London, UK or Remote" type="text" />
                  <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Section: Compensation */}
            <div className="group">
              <label className="block text-xs font-bold uppercase tracking-[0.1em] text-primary mb-3 group-focus-within:text-secondary transition-colors">Salary Range (Annual)</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">$</span>
                  <input className="w-full bg-surface-container-high/50 border-none rounded-xl pl-8 pr-5 py-4 font-medium focus:ring-2 focus:ring-primary/40 transition-all outline-none" placeholder="Min" type="number" />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">$</span>
                  <input className="w-full bg-surface-container-high/50 border-none rounded-xl pl-8 pr-5 py-4 font-medium focus:ring-2 focus:ring-primary/40 transition-all outline-none" placeholder="Max" type="number" />
                </div>
              </div>
            </div>

            {/* Section: Description (Rich Text Simulation) */}
            <div className="group">
              <div className="flex justify-between items-end mb-3">
                <label className="block text-xs font-bold uppercase tracking-[0.1em] text-primary group-focus-within:text-secondary transition-colors">Job Description</label>
                <div className="flex gap-2">
                  <button className="p-1.5 rounded-lg hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all" type="button"><Bold className="w-4 h-4" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all" type="button"><Italic className="w-4 h-4" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all" type="button"><List className="w-4 h-4" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all" type="button"><LinkIcon className="w-4 h-4" /></button>
                </div>
              </div>
              <textarea className="w-full bg-surface-container-high/50 border-none rounded-xl px-6 py-6 font-body leading-relaxed focus:ring-2 focus:ring-primary/40 placeholder:text-on-surface-variant/40 transition-all outline-none custom-scrollbar" placeholder="Tell a story about this role..." rows={10}></textarea>
            </div>

            {/* Form Actions */}
            <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-200/40">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-semibold transition-all" type="button">
                  <Save className="w-5 h-5" />
                  Save Draft
                </button>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <button className="text-red-500 font-semibold hover:text-red-600 transition-colors" type="button">Discard</button>
              </div>
              <button className="signature-gradient text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3" type="button">
                Publish Job
                <Send className="w-5 h-5 fill-white/20" />
              </button>
            </div>
          </form>
        </div>

        {/* Footer Decorative Element */}
        <div className="mt-16 text-center text-on-surface-variant/40 text-sm font-medium tracking-widest uppercase mb-10 border-t border-outline-variant/10 pt-8">
            © 2024 Ethereal Talent — Curation at Scale
        </div>
      </div>
      
      {/* Decorative Floating Elements local to this page */}
      <div className="fixed top-1/4 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-1/4 -left-24 w-64 h-64 bg-secondary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
    </div>
  );
}
