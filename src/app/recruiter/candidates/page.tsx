import Link from "next/link";
import { Download, UserPlus, Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { MOCK_CANDIDATES } from "@/lib/mockData";

export default function CandidateDatabasePage() {
  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">Talent Pool</h1>
          <p className="text-on-surface-variant max-w-xl">Browse and filter top-tier candidates curated for your organization's unique requirements.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-surface-container-high rounded-full font-semibold text-sm hover:bg-surface-container-highest transition-colors">
            <Download className="w-5 h-5" /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 signature-gradient text-white rounded-full font-semibold text-sm shadow-md active:scale-95 transition-transform">
            <UserPlus className="w-5 h-5" /> Add Candidate
          </button>
        </div>
      </div>

      {/* Filters Area */}
      <div className="glass-card rounded-xl p-6 mb-8 border border-outline-variant/10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 relative">
            <label className="block text-[10px] font-bold uppercase tracking-[0.05em] text-on-surface-variant mb-2 ml-1">Keyword Search</label>
            <Search className="absolute left-4 bottom-3 w-5 h-5 text-outline" />
            <input className="w-full bg-surface-container-high border-none rounded-xl pl-11 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 outline-none" placeholder="Design, React, Manager..." type="text"/>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.05em] text-on-surface-variant mb-2 ml-1">Expertise</label>
            <select className="w-full bg-surface-container-high border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 appearance-none outline-none">
              <option>All Skill Levels</option>
              <option>Junior (0-2 yrs)</option>
              <option>Mid-Level (3-5 yrs)</option>
              <option>Senior (6-10 yrs)</option>
              <option>Expert (10+ yrs)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.05em] text-on-surface-variant mb-2 ml-1">Location</label>
            <select className="w-full bg-surface-container-high border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 outline-none">
              <option>Worldwide</option>
              <option>Remote Only</option>
              <option>On-site: San Francisco</option>
              <option>On-site: New York</option>
              <option>On-site: London</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-secondary/10 text-secondary border border-secondary/20 rounded-xl py-2.5 font-bold text-sm hover:bg-secondary/20 transition-all flex items-center justify-center gap-2">
              <SlidersHorizontal className="w-5 h-5" /> Advanced Filters
            </button>
          </div>
        </div>
      </div>

      {/* Candidate List/Table */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/50 text-[10px] font-bold uppercase tracking-[0.05em] text-on-surface-variant">
                <th className="px-6 py-4">Candidate</th>
                <th className="px-6 py-4">Top Skills</th>
                <th className="px-6 py-4">Experience</th>
                <th className="px-6 py-4">AI Match</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              
              {MOCK_CANDIDATES.map((candidate) => (
                <tr key={candidate.id} className="bg-surface-container-lowest hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img className="w-12 h-12 rounded-xl object-cover ring-2 ring-transparent group-hover:ring-primary/20 transition-all" src={candidate.avatar} alt={candidate.name} />
                        {candidate.matchScore > 90 && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{candidate.name}</p>
                        <p className="text-xs text-on-surface-variant">{candidate.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-primary/5 text-primary text-[10px] font-bold rounded-full border border-primary/10 uppercase">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-medium text-on-surface">{candidate.experience}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="h-full signature-gradient" style={{ width: `${candidate.matchScore}%` }}></div>
                      </div>
                      <span className="text-sm font-extrabold text-secondary">{candidate.matchScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Link href={`/recruiter/candidates/${candidate.id}`} className="inline-block px-5 py-2 bg-surface-variant/30 text-on-surface hover:bg-primary hover:text-white rounded-full text-xs font-bold transition-all shadow-sm">
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
              
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 bg-surface-container-high/30 flex items-center justify-between">
          <p className="text-xs font-medium text-on-surface-variant">Showing <span className="text-on-surface">1-{MOCK_CANDIDATES.length}</span> of <span className="text-on-surface">12</span> candidates</p>
          <div className="flex gap-2">
            <button className="p-2 bg-surface-container-lowest rounded-lg border border-outline-variant/10 text-on-surface-variant hover:text-primary transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3.5 py-2 bg-primary text-white rounded-lg text-xs font-bold">1</button>
            <button className="px-3.5 py-2 bg-surface-container-lowest text-on-surface-variant rounded-lg text-xs font-bold hover:bg-surface-container transition-colors">2</button>
            <button className="px-3.5 py-2 bg-surface-container-lowest text-on-surface-variant rounded-lg text-xs font-bold hover:bg-surface-container transition-colors">3</button>
            <button className="p-2 bg-surface-container-lowest rounded-lg border border-outline-variant/10 text-on-surface-variant hover:text-primary transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bento Stats Grid (Additional Value) */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-outline-variant/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">Database Health</p>
          <h3 className="text-3xl font-black text-on-surface">2.4k+</h3>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">Vetted profiles available</p>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-outline-variant/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-all"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">AI Processing</p>
          <h3 className="text-3xl font-black text-on-surface">142</h3>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">Matched since last login</p>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-outline-variant/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-all"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">Profile Freshness</p>
          <h3 className="text-3xl font-black text-on-surface">94%</h3>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">Updated within 30 days</p>
        </div>
      </div>
    </div>
  );
}
