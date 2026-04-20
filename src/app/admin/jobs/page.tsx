import { Filter, CalendarDays, CheckCircle, XCircle, Trash2, Edit2, Ban, Eye, RotateCcw } from "lucide-react";

export default function AdminJobManagementPage() {
  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      {/* Hero / Header Section */}
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">Job Management</h2>
          <p className="text-on-surface-variant max-w-xl">Curation at scale. Review, approve, and moderate professional opportunities across the global ecosystem.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-surface-container-low p-1 rounded-full border border-outline-variant/10">
            <button className="px-6 py-2 rounded-full text-sm font-semibold bg-white shadow-sm text-primary">All Jobs</button>
            <button className="px-6 py-2 rounded-full text-sm font-medium text-on-surface-variant hover:text-on-surface">Queue</button>
          </div>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 rounded-2xl shadow-sm border border-outline-variant/10">
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1">Total Active</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold tracking-tighter">1,284</span>
            <span className="text-blue-600 text-xs font-bold bg-blue-50 px-2 py-0.5 rounded-full">+12%</span>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl shadow-sm border border-outline-variant/10">
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1">Pending Approval</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold tracking-tighter text-secondary">42</span>
            <span className="text-secondary text-xs font-bold">Needs Review</span>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl shadow-sm border border-outline-variant/10">
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1">Closed Today</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold tracking-tighter">18</span>
            <span className="text-on-surface-variant text-xs font-bold">Processed</span>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl shadow-sm border border-outline-variant/10">
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1">Avg. Review Time</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold tracking-tighter">2.4h</span>
            <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full">Optimized</span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap gap-4 mb-8 items-center bg-surface-container-low/50 p-4 rounded-2xl backdrop-blur-sm border border-outline-variant/10">
        <div className="flex items-center gap-2">
          <Filter className="text-outline w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Filters</span>
        </div>
        <div className="hidden md:block h-6 w-px bg-outline-variant/30 mx-2"></div>
        <select className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl text-sm font-medium px-4 py-2 focus:ring-primary/20 shadow-sm cursor-pointer outline-none">
          <option>All Statuses</option>
          <option>Pending</option>
          <option>Active</option>
          <option>Closed</option>
        </select>
        <select className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl text-sm font-medium px-4 py-2 focus:ring-primary/20 shadow-sm cursor-pointer outline-none">
          <option>All Companies</option>
          <option>TechVision Corp</option>
          <option>GreenSphere</option>
          <option>Quantum Dynamics</option>
          <option>Nova Media</option>
        </select>
        <button className="ml-auto flex items-center gap-2 px-4 py-2 bg-surface-container-lowest text-on-surface border border-outline-variant/10 rounded-xl text-sm font-semibold shadow-sm hover:bg-surface-container transition-colors">
          <CalendarDays className="w-4 h-4" />
          Date Range
        </button>
      </div>

      {/* Jobs Table */}
      <div className="glass-card rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.03)] overflow-hidden border border-outline-variant/10">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-surface-container-low/50 border-b border-outline-variant/10">
              <th className="px-8 py-5 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">Job Title</th>
              <th className="px-6 py-5 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">Company</th>
              <th className="px-6 py-5 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">Posted Date</th>
              <th className="px-6 py-5 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant text-center">Status</th>
              <th className="px-8 py-5 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {/* Row 1: Pending */}
            <tr className="group hover:bg-primary/5 transition-colors">
              <td className="px-8 py-6">
                <div className="flex flex-col">
                  <span className="font-bold text-on-surface text-base group-hover:text-primary transition-colors">Senior Product Designer</span>
                  <span className="text-xs text-on-surface-variant">Full-time • Remote • $140k-180k</span>
                </div>
              </td>
              <td className="px-6 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs ring-1 ring-blue-200">TV</div>
                  <span className="text-sm font-semibold">TechVision Corp</span>
                </div>
              </td>
              <td className="px-6 py-6">
                <span className="text-sm font-medium text-on-surface-variant">Oct 24, 2023</span>
              </td>
              <td className="px-6 py-6 text-center">
                <span className="px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-bold uppercase rounded-full border border-secondary/20">Pending</span>
              </td>
              <td className="px-8 py-6 text-right">
                <div className="flex justify-end items-center gap-2">
                  <button className="px-4 py-1.5 bg-primary text-on-primary rounded-full text-xs font-bold signature-gradient hover:scale-105 active:scale-95 transition-all shadow-sm">Approve</button>
                  <button className="px-4 py-1.5 bg-surface-container text-on-surface rounded-full text-xs font-bold hover:bg-error-container/20 hover:text-error transition-all">Reject</button>
                  <button className="p-1.5 text-outline hover:text-error transition-colors ml-2">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>

            {/* Row 2: Active */}
            <tr className="group hover:bg-primary/5 transition-colors">
              <td className="px-8 py-6">
                <div className="flex flex-col">
                  <span className="font-bold text-on-surface text-base group-hover:text-primary transition-colors">Lead Fullstack Engineer</span>
                  <span className="text-xs text-on-surface-variant">Contract • London • £500-700/day</span>
                </div>
              </td>
              <td className="px-6 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs ring-1 ring-green-200">GS</div>
                  <span className="text-sm font-semibold">GreenSphere</span>
                </div>
              </td>
              <td className="px-6 py-6">
                <span className="text-sm font-medium text-on-surface-variant">Oct 22, 2023</span>
              </td>
              <td className="px-6 py-6 text-center">
                <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full border border-green-200">Active</span>
              </td>
              <td className="px-8 py-6 text-right">
                <div className="flex justify-end items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-outline hover:text-primary transition-colors">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-outline hover:text-error transition-colors">
                    <Ban className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-outline hover:text-error transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>

            {/* Row 3: Closed */}
            <tr className="group hover:bg-primary/5 transition-colors">
              <td className="px-8 py-6">
                <div className="flex flex-col opacity-60">
                  <span className="font-bold text-on-surface text-base group-hover:text-primary transition-colors">Marketing Director</span>
                  <span className="text-xs text-on-surface-variant">Permanent • New York • $220k+</span>
                </div>
              </td>
              <td className="px-6 py-6">
                <div className="flex items-center gap-3 opacity-60">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs ring-1 ring-purple-200">NM</div>
                  <span className="text-sm font-semibold">Nova Media</span>
                </div>
              </td>
              <td className="px-6 py-6">
                <span className="text-sm font-medium text-on-surface-variant opacity-60">Oct 15, 2023</span>
              </td>
              <td className="px-6 py-6 text-center">
                <span className="px-3 py-1 bg-surface-container text-on-surface-variant text-[10px] font-bold uppercase rounded-full border border-outline-variant/10">Closed</span>
              </td>
              <td className="px-8 py-6 text-right">
                <div className="flex justify-end items-center gap-2">
                  <button className="px-4 py-1.5 bg-surface-container text-on-surface rounded-full text-xs font-bold hover:bg-surface-variant transition-all border border-outline-variant/10">Reactivate</button>
                  <button className="p-1.5 text-outline hover:text-error transition-colors ml-2">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>

            {/* Row 4: Pending */}
            <tr className="group hover:bg-primary/5 transition-colors">
              <td className="px-8 py-6">
                <div className="flex flex-col">
                  <span className="font-bold text-on-surface text-base group-hover:text-primary transition-colors">AI Research Scientist</span>
                  <span className="text-xs text-on-surface-variant">Permanent • Zurich • CHF 160k</span>
                </div>
              </td>
              <td className="px-6 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs ring-1 ring-orange-200">QD</div>
                  <span className="text-sm font-semibold">Quantum Dynamics</span>
                </div>
              </td>
              <td className="px-6 py-6">
                <span className="text-sm font-medium text-on-surface-variant">Oct 24, 2023</span>
              </td>
              <td className="px-6 py-6 text-center">
                <span className="px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-bold uppercase rounded-full border border-secondary/20">Pending</span>
              </td>
              <td className="px-8 py-6 text-right">
                <div className="flex justify-end items-center gap-2">
                  <button className="px-4 py-1.5 bg-primary text-on-primary rounded-full text-xs font-bold signature-gradient hover:scale-105 active:scale-95 transition-all shadow-sm">Approve</button>
                  <button className="px-4 py-1.5 bg-surface-container text-on-surface rounded-full text-xs font-bold hover:bg-error-container/20 hover:text-error transition-all">Reject</button>
                  <button className="p-1.5 text-outline hover:text-error transition-colors ml-2">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="px-8 py-5 flex items-center justify-between bg-surface-container-low/30 border-t border-outline-variant/10">
          <p className="text-xs font-medium text-on-surface-variant">Showing 1 to 4 of 1,284 jobs</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-xs text-on-surface-variant hover:text-primary transition-colors font-medium">Prev</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white font-bold text-xs shadow-md">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-white hover:text-primary transition-colors font-bold text-xs">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-white hover:text-primary transition-colors font-bold text-xs">3</button>
            <button className="px-3 py-1 text-xs text-on-surface-variant hover:text-primary transition-colors font-medium">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
