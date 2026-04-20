import { MOCK_STATS, MOCK_APPLICATIONS } from "@/lib/mockData";
import { Plus, Eye, Briefcase, Users, Zap, ArrowRight, Calendar, Download } from "lucide-react";
import Link from "next/link";

export default function RecruiterDashboard() {
  return (
    <div className="w-full">
      {/* Hero Section Asymmetry */}
      <header className="relative mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-primary font-bold uppercase tracking-widest text-sm mb-2">Welcome back, Sarah</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface leading-tight tracking-tight">
            Your talent pipeline is <span className="text-secondary italic">surging</span> today.
          </h1>
        </div>
        <div className="flex gap-4">
          <button className="signature-gradient text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
            <Plus className="w-5 h-5"/> Post a Job
          </button>
          <Link href="/recruiter/pipeline" className="bg-surface-container-highest text-on-surface px-8 py-4 rounded-full font-bold hover:bg-surface-variant transition-all flex items-center gap-2">
            <Eye className="w-5 h-5"/> View Candidates
          </Link>
        </div>
        {/* Decorative Element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
      </header>

      {/* Bento Grid Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
        <div className="glass-card p-8 rounded-[2rem] border border-outline-variant/15 flex flex-col justify-between h-48 group hover:border-primary/30 transition-all">
          <div className="flex justify-between items-start">
            <Briefcase className="text-primary w-12 h-12 p-3 bg-primary/10 rounded-2xl" />
            <span className="text-primary font-bold text-xs uppercase tracking-widest">+12%</span>
          </div>
          <div>
            <h3 className="text-on-surface-variant text-sm font-medium mb-1 uppercase tracking-wider">Active Jobs</h3>
            <p className="text-4xl font-black">{MOCK_STATS.totalJobs}</p>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2rem] border border-outline-variant/15 flex flex-col justify-between h-48 hover:border-secondary/30 transition-all">
          <div className="flex justify-between items-start">
            <Users className="text-secondary w-12 h-12 p-3 bg-secondary/10 rounded-2xl" />
            <span className="text-secondary font-bold text-xs uppercase tracking-widest">Live</span>
          </div>
          <div>
            <h3 className="text-on-surface-variant text-sm font-medium mb-1 uppercase tracking-wider">Total Candidates</h3>
            <p className="text-4xl font-black">{MOCK_STATS.activeCandidates}</p>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2rem] border border-outline-variant/15 flex flex-col justify-between h-48 hover:border-primary/30 transition-all md:col-span-1 lg:col-span-1">
          <div className="flex justify-between items-start">
            <Zap className="text-primary-dim w-12 h-12 p-3 bg-primary-dim/10 rounded-2xl" />
            <span className="text-error font-bold text-xs uppercase tracking-widest">-2%</span>
          </div>
          <div>
            <h3 className="text-on-surface-variant text-sm font-medium mb-1 uppercase tracking-wider">Conversion Rate</h3>
            <p className="text-4xl font-black">18.5%</p>
          </div>
        </div>

        <div className="signature-gradient p-8 rounded-[2rem] text-white flex flex-col justify-center h-48 md:col-span-3 lg:col-span-1 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-primary-fixed text-xs font-bold uppercase mb-2 tracking-widest">AI Suggestion</p>
            <p className="text-lg font-medium leading-snug">Optimization: 5 Candidates match your recent 'Frontend' role.</p>
            <Link href="/recruiter/pipeline" className="mt-4 text-xs font-bold flex items-center gap-1 hover:underline">
              Review Profiles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>
      </section>

      {/* Activity & Interviews Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Activity Feed */}
        <div className="lg:col-span-8 bg-surface-container-low/50 rounded-[2.5rem] p-8 border border-white/40 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Recent Activity</h2>
            <button className="text-primary font-bold text-sm hover:underline">View All Logs</button>
          </div>
          <div className="space-y-6">
            {MOCK_APPLICATIONS.map((app, idx) => (
              <div key={app.id} className="flex gap-6 items-start">
                <div className="h-12 w-12 rounded-full border-2 border-white shadow-md overflow-hidden flex-shrink-0">
                  <img alt="User Profile" src={`https://i.pravatar.cc/150?u=${app.candidateId}`} />
                </div>
                <div className="flex-1 pb-6 border-b border-outline-variant/10">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-on-surface font-semibold">
                      Candidate {app.candidateId} applied for <span className="text-primary">Job {app.jobId}</span>
                    </p>
                    <span className="text-on-surface-variant text-xs">{app.appliedDate}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="px-3 py-1 bg-surface-container-high rounded-full text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Status: {app.status}</span>
                    {app.aiScore > 80 && <span className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-bold uppercase text-primary tracking-wider">Top Match ({app.aiScore}%)</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-card rounded-[2.5rem] p-8 border border-white/60 shadow-lg shadow-black/5">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="text-secondary w-5 h-5"/>
              Upcoming Interviews
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-white/50 rounded-2xl border border-white hover:bg-white transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-secondary-container text-on-secondary-container px-2 py-1 rounded-md text-[10px] font-black uppercase">Today • 2:00 PM</div>
                </div>
                <h4 className="font-bold text-on-surface">Alex Nguyen</h4>
                <p className="text-xs text-on-surface-variant mb-4">Frontend Engineer • Technical</p>
                <button className="w-full py-2 bg-secondary/5 text-secondary rounded-xl text-xs font-bold group-hover:bg-secondary group-hover:text-white transition-all">Join Zoom Call</button>
              </div>
            </div>
          </div>

          {/* Ad/Resource Card */}
          <div className="relative rounded-[2rem] overflow-hidden aspect-[4/3] group bg-slate-900 border border-slate-800">
            <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/40 to-transparent p-8 flex flex-col justify-end">
              <p className="text-primary-fixed font-bold text-xs uppercase tracking-widest mb-2">New Report</p>
              <h3 className="text-white text-xl font-bold leading-tight mb-4">Q3 Tech Market Salaries: The Essential Recruiter Guide.</h3>
              <button className="flex items-center justify-center gap-2 text-white font-bold text-sm bg-white/10 backdrop-blur-md px-6 py-3 rounded-full hover:bg-white/20 transition-all">
                Download PDF <Download className="w-4 h-4"/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
