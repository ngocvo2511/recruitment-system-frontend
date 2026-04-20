import Link from "next/link";
import { Plus, Filter, CalendarDays, MoreVertical, Edit2, Ban, Trash2, Eye } from "lucide-react";

export default function RecruiterJobManagementPage() {
  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      {/* Hero / Header Section */}
      <div className="mb-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">Job Management</h2>
          <p className="text-on-surface-variant max-w-xl">Curate your organization's opportunities. Create, edit, and monitor open roles.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/recruiter/jobs/create" className="px-6 py-2.5 rounded-full text-sm font-bold bg-primary text-white signature-gradient shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Job
          </Link>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 rounded-xl shadow-sm border border-white/40">
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1">Total Active</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold tracking-tighter">12</span>
            <span className="text-blue-600 text-xs font-bold">+2</span>
          </div>
        </div>
        <div className="glass-card p-6 rounded-xl shadow-sm border border-white/40">
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1">Total Candidates</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold tracking-tighter text-secondary">284</span>
          </div>
        </div>
        <div className="glass-card p-6 rounded-xl shadow-sm border border-white/40">
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1">Interviews Scheduled</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold tracking-tighter">18</span>
          </div>
        </div>
        <div className="glass-card p-6 rounded-xl shadow-sm border border-white/40">
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1">Avg. Time to Fill</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold tracking-tighter">24d</span>
            <span className="text-green-600 text-xs font-bold">Optimized</span>
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
        <select className="bg-surface-container-lowest border-none rounded-xl text-sm font-medium px-4 py-2 focus:ring-primary/20 shadow-sm cursor-pointer outline-none">
          <option>All Statuses</option>
          <option>Active</option>
          <option>Draft</option>
          <option>Closed</option>
        </select>
        <button className="md:ml-auto flex items-center gap-2 px-4 py-2 bg-surface-container-lowest text-on-surface rounded-xl text-sm font-semibold shadow-sm hover:bg-surface-container transition-colors border border-outline-variant/10">
          <CalendarDays className="w-4 h-4" />
          Date Range
        </button>
      </div>

      {/* Jobs Table */}
      <div className="glass-card rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden border border-white/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-container-low/30 border-b border-outline-variant/10">
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">Job Title</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">Candidates</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">Posted Date</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant text-center">Status</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              
              <tr className="group hover:bg-primary/5 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-on-surface text-base group-hover:text-primary transition-colors">Senior Product Designer</span>
                    <span className="text-xs text-on-surface-variant">Full-time • Remote • $140k-180k</span>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary">42</span>
                    <span className="text-xs text-on-surface-variant">total</span>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <span className="text-sm font-medium text-on-surface-variant">Oct 24, 2023</span>
                </td>
                <td className="px-6 py-6 text-center">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full">Active</span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Link href="/recruiter/pipeline" className="p-2 text-outline hover:text-primary transition-colors">
                      <Eye className="w-5 h-5" />
                    </Link>
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

              <tr className="group hover:bg-primary/5 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-on-surface text-base group-hover:text-primary transition-colors">Lead Fullstack Engineer</span>
                    <span className="text-xs text-on-surface-variant">Contract • London • £500-700/day</span>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary">18</span>
                    <span className="text-xs text-on-surface-variant">total</span>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <span className="text-sm font-medium text-on-surface-variant">Oct 22, 2023</span>
                </td>
                <td className="px-6 py-6 text-center">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full">Active</span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Link href="/recruiter/pipeline" className="p-2 text-outline hover:text-primary transition-colors">
                      <Eye className="w-5 h-5" />
                    </Link>
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

              <tr className="group hover:bg-primary/5 transition-colors opacity-70">
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-on-surface text-base group-hover:text-primary transition-colors">Marketing Director</span>
                    <span className="text-xs text-on-surface-variant">Permanent • New York • $220k+</span>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-on-surface-variant">154</span>
                    <span className="text-xs text-on-surface-variant">total</span>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <span className="text-sm font-medium text-on-surface-variant">Oct 15, 2023</span>
                </td>
                <td className="px-6 py-6 text-center">
                  <span className="px-3 py-1 bg-surface-container text-on-surface-variant text-[10px] font-bold uppercase rounded-full">Closed</span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end items-center gap-2">
                    <button className="px-4 py-1.5 bg-surface-container text-on-surface rounded-full text-xs font-bold hover:bg-surface-variant transition-all">Reactivate</button>
                    <button className="p-1.5 text-outline hover:text-error transition-colors ml-2">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
              
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
