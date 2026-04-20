import Link from "next/link";
import { Sparkles, MapPin, ArrowRight, Bookmark, RefreshCw, Star } from "lucide-react";

export default function AISuggestionsPage() {
  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      {/* Page Header */}
      <div className="mb-12 relative">
        <div className="absolute -top-12 -right-8 w-64 h-64 signature-gradient opacity-5 rounded-full blur-[100px]"></div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <span className="text-primary font-bold text-xs tracking-[0.2em] uppercase mb-3 block">Job Intelligence</span>
            <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter mb-4">Top Matches for Senior Product Designer</h1>
            <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">AI curated analysis based on technical proficiency, cultural synergy, and project portfolio alignment.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 rounded-full border border-outline-variant text-on-surface-variant font-medium hover:bg-surface-container-low transition-all">Refine Job Specs</button>
            <button className="px-6 py-3 rounded-full bg-secondary text-white font-bold shadow-xl shadow-secondary/20 flex items-center gap-2 hover:scale-105 transition-all">
              <RefreshCw className="w-4 h-4" />
              Re-sync AI
            </button>
          </div>
        </div>
      </div>

      {/* Bento Grid of Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Rank 1 - Featured Match */}
        <div className="lg:col-span-8 group">
          <div className="glass-card rounded-[2rem] p-8 border border-white/40 shadow-sm relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10">
            <div className="absolute top-0 right-0 p-6">
              <div className="flex flex-col items-end">
                <div className="text-6xl font-black text-primary opacity-20 tracking-tighter">01</div>
                <div className="mt-2 flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                  <Star className="w-4 h-4 fill-secondary" />
                  <span className="text-sm font-bold">Top Pick</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="relative shrink-0 mt-4">
                <img alt="Julian Valles" className="w-32 h-32 md:w-48 md:h-48 rounded-[2rem] object-cover shadow-xl" src="https://i.pravatar.cc/150?img=11" />
                <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full signature-gradient border-4 border-surface-container-lowest flex flex-col items-center justify-center text-white">
                  <span className="text-[10px] uppercase font-bold leading-none">Score</span>
                  <span className="text-xl font-black">98%</span>
                </div>
              </div>
              
              <div className="flex-1 mt-4 md:mt-0">
                <h3 className="text-3xl font-black text-on-surface mb-2">Julian Valles</h3>
                <p className="text-primary font-bold text-sm mb-6 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  San Francisco, CA • 8+ Years Exp
                </p>
                
                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="text-primary w-4 h-4 fill-primary/20" />
                    <span className="font-bold text-on-surface text-sm uppercase tracking-wider">Why this candidate?</span>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed text-sm">
                    Julian excels in complex SaaS ecosystems with a proven record at Airbnb and Figma. His portfolio demonstrates exceptional mastery of <strong>design tokens</strong> and <strong>system architecture</strong>, matching 100% of your technical requirements. Cultural fit is high due to his background in rapid-growth fintech startups.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3 mb-8">
                  <span className="px-4 py-2 rounded-full bg-surface-container-high text-on-surface text-xs font-bold uppercase tracking-widest">Design Systems</span>
                  <span className="px-4 py-2 rounded-full bg-surface-container-high text-on-surface text-xs font-bold uppercase tracking-widest">Figma Architect</span>
                  <span className="px-4 py-2 rounded-full bg-surface-container-high text-on-surface text-xs font-bold uppercase tracking-widest">Team Lead</span>
                </div>
                
                <div className="flex gap-4">
                  <Link href="/recruiter/candidates/julian-valles" className="flex-1 py-4 rounded-2xl signature-gradient text-white font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                    View Profile
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <button className="w-14 h-14 rounded-2xl border border-outline-variant flex items-center justify-center hover:bg-surface-container-low transition-all">
                    <Bookmark className="w-6 h-6 text-on-surface-variant" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Match Stats Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-secondary p-8 rounded-[2rem] text-white shadow-xl shadow-secondary/30 relative overflow-hidden">
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <h4 className="text-xl font-bold mb-6 relative z-10">Match Analytics</h4>
            
            <div className="space-y-6 relative z-10">
              <div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Skill Overlap</div>
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[92%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Experience Depth</div>
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[88%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Salary Alignment</div>
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[100%]"></div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/10 relative z-10">
              <p className="text-sm italic opacity-80">"Julian's background in design-system-first companies makes him a unique high-value asset for this specific role."</p>
            </div>
          </div>

          {/* Secondary Candidate */}
          <div className="glass-card rounded-[2rem] p-6 border border-white/40 shadow-sm hover:translate-y-[-4px] transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <img alt="Elena Moretti" className="w-16 h-16 rounded-2xl object-cover" src="https://i.pravatar.cc/150?img=5" />
                <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm">92%</div>
              </div>
              <div>
                <h5 className="text-lg font-black text-on-surface leading-none mb-1">Elena Moretti</h5>
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">UX Director • Milan</p>
              </div>
            </div>
            <p className="text-sm text-on-surface-variant mb-6 line-clamp-3">Strategic thinker with 12+ years experience. Expert at scaling international design teams and implementing accessibility-first processes.</p>
            <Link href="/recruiter/candidates/elena-moretti" className="w-full py-3 rounded-xl bg-surface-container-high text-on-surface font-bold text-sm hover:bg-primary hover:text-white transition-all block text-center">View Details</Link>
          </div>
        </div>

        {/* Bottom Row Candidates */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 3 */}
          <div className="glass-card rounded-[2rem] p-6 border border-white/40 shadow-sm group hover:border-primary/20 transition-all">
            <div className="flex justify-between items-start mb-6">
              <img alt="Marcus Thorne" className="w-14 h-14 rounded-xl object-cover" src="https://i.pravatar.cc/150?img=12" />
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black">89% Match</div>
            </div>
            <h5 className="text-xl font-black text-on-surface mb-1">Marcus Thorne</h5>
            <p className="text-xs text-secondary font-bold uppercase tracking-widest mb-4">Lead Product Designer</p>
            <div className="p-4 bg-surface-container-low rounded-xl mb-6 min-h-[100px]">
              <p className="text-sm text-on-surface-variant leading-relaxed">Top 1% in Motion Design and Interaction prototyping. Significant experience in high-traffic consumer apps.</p>
            </div>
            <button className="w-full py-3 rounded-xl border-2 border-primary/10 text-primary font-bold text-sm group-hover:bg-primary group-hover:text-white transition-all text-center">Explore Portfolio</button>
          </div>

          {/* Card 4 */}
          <div className="glass-card rounded-[2rem] p-6 border border-white/40 shadow-sm group hover:border-primary/20 transition-all">
            <div className="flex justify-between items-start mb-6">
              <img alt="Sarah Jenkins" className="w-14 h-14 rounded-xl object-cover" src="https://i.pravatar.cc/150?img=43" />
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black">85% Match</div>
            </div>
            <h5 className="text-xl font-black text-on-surface mb-1">Sarah Jenkins</h5>
            <p className="text-xs text-secondary font-bold uppercase tracking-widest mb-4">Senior UX Researcher</p>
            <div className="p-4 bg-surface-container-low rounded-xl mb-6 min-h-[100px]">
              <p className="text-sm text-on-surface-variant leading-relaxed">Specialist in user behavioral analysis and data-driven design iterations. Masters in Human-Computer Interaction.</p>
            </div>
            <button className="w-full py-3 rounded-xl border-2 border-primary/10 text-primary font-bold text-sm group-hover:bg-primary group-hover:text-white transition-all text-center">Explore Portfolio</button>
          </div>

          {/* Card 5 */}
          <div className="glass-card rounded-[2rem] p-6 border border-white/40 shadow-sm group hover:border-primary/20 transition-all">
            <div className="flex justify-between items-start mb-6">
              <img alt="Liam Peterson" className="w-14 h-14 rounded-xl object-cover" src="https://i.pravatar.cc/150?img=52" />
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black">82% Match</div>
            </div>
            <h5 className="text-xl font-black text-on-surface mb-1">Liam Peterson</h5>
            <p className="text-xs text-secondary font-bold uppercase tracking-widest mb-4">Interface Specialist</p>
            <div className="p-4 bg-surface-container-low rounded-xl mb-6 min-h-[100px]">
              <p className="text-sm text-on-surface-variant leading-relaxed">Exceptional visual design skills with a focus on dark mode interfaces and high-density dashboards.</p>
            </div>
            <button className="w-full py-3 rounded-xl border-2 border-primary/10 text-primary font-bold text-sm group-hover:bg-primary group-hover:text-white transition-all text-center">Explore Portfolio</button>
          </div>

        </div>
      </div>

      {/* Contextual FAB */}
      <button className="fixed bottom-8 right-8 w-16 h-16 rounded-full signature-gradient text-white shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group">
        <Sparkles className="w-8 h-8 fill-white/20" />
        <span className="absolute right-full mr-4 px-4 py-2 bg-inverse-surface text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">AI Analysis Engine</span>
      </button>
    </div>
  );
}
