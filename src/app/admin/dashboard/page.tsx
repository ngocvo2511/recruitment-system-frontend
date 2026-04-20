import { Users, Briefcase, Zap, Clock, MoreVertical, ShieldAlert, UserPlus, Cloud, Flag } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      {/* Welcome Section */}
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2">System Overview</h1>
        <p className="text-on-surface-variant font-medium">Real-time performance metrics and career ecosystem health.</p>
      </header>

      {/* Bento Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Total Users Card */}
        <div className="glass-card p-6 rounded-2xl border border-white/60 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Users className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">+12.5%</span>
          </div>
          <div className="mt-5">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Total Users</p>
            <h3 className="text-3xl font-black text-on-surface tracking-tight">42,891</h3>
            <p className="text-xs text-on-surface-variant mt-2 font-medium">28.4k Candidates • 14.4k Recruiters</p>
          </div>
        </div>

        {/* Active Jobs Card */}
        <div className="glass-card p-6 rounded-2xl border border-white/60 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-secondary/10 rounded-xl text-secondary">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">+4.2%</span>
          </div>
          <div className="mt-5">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Active Jobs</p>
            <h3 className="text-3xl font-black text-on-surface tracking-tight">1,204</h3>
            <p className="text-xs text-on-surface-variant mt-2 font-medium">892 Pending Approval</p>
          </div>
        </div>

        {/* Apps/Day Card */}
        <div className="glass-card p-6 rounded-2xl border border-white/60 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600">
              <Zap className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">-2.1%</span>
          </div>
          <div className="mt-5">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Daily Applications</p>
            <h3 className="text-3xl font-black text-on-surface tracking-tight">3,490</h3>
            <p className="text-xs text-on-surface-variant mt-2 font-medium">Peak hour: 10:00 AM</p>
          </div>
        </div>

        {/* Avg Processing Time */}
        <div className="glass-card p-6 rounded-2xl border border-white/40 shadow-sm flex flex-col justify-between signature-gradient text-white shadow-lg shadow-primary/20 relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="p-2.5 bg-white/20 rounded-xl text-white backdrop-blur-sm">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-5 relative z-10">
            <p className="text-[10px] uppercase tracking-widest text-white/80 font-bold mb-1">Match Accuracy</p>
            <h3 className="text-3xl font-black tracking-tight text-white mb-2">94.2%</h3>
            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden mt-3 mb-1">
              <div className="h-full bg-white w-[94%]"></div>
            </div>
            <p className="text-[10px] text-white/80 font-medium">AI Recommendation Confidence</p>
          </div>
        </div>
      </section>

      {/* Charts and Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Chart (Visual Representation) */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-8 border border-white shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-bold text-on-surface mb-1">User Acquisition Trend</h3>
              <p className="text-sm text-on-surface-variant font-medium">System growth over the last 12 months</p>
            </div>
            <div className="flex gap-1.5 bg-surface-container-low p-1 rounded-full">
              <button className="px-4 py-1.5 text-xs font-bold bg-transparent text-on-surface-variant rounded-full hover:bg-white hover:text-primary hover:shadow-sm transition-all focus:outline-none">Daily</button>
              <button className="px-4 py-1.5 text-xs font-bold bg-white text-primary shadow-sm rounded-full">Monthly</button>
            </div>
          </div>
          
          {/* Pseudo-Chart */}
          <div className="h-64 flex items-end justify-between gap-1.5 px-4 relative overflow-hidden flex-1 mt-4">
            {/* Background Grid */}
            <div className="absolute inset-0 flex flex-col justify-between opacity-[0.03] pointer-events-none">
              <div className="border-t border-on-surface w-full"></div>
              <div className="border-t border-on-surface w-full"></div>
              <div className="border-t border-on-surface w-full"></div>
              <div className="border-t border-on-surface w-full"></div>
            </div>
            
            {/* Bars */}
            {[40, 45, 60, 55, 70, 65, 85, 75, 95, 80, 90, 100].map((height, i) => (
              <div key={i} className={`flex-1 rounded-t-xl transition-all duration-500 hover:opacity-80 relative group ${i === 8 ? 'signature-gradient' : 'bg-primary/20 hover:bg-primary/40'}`} style={{ height: `${height}%` }}>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-xl">
                  {height * 142} Users
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between mt-4 px-4 text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
          </div>
        </div>

        {/* Alerts & Activity */}
        <div className="lg:col-span-1 flex flex-col">
          <div className="glass-card rounded-3xl p-6 border border-white shadow-sm flex-1 flex flex-col h-[400px]">
             <div className="flex items-center justify-between mb-6 shrink-0">
              <h3 className="text-xl font-bold text-on-surface">Recent Alerts</h3>
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
              
              <div className="flex gap-4">
                <div className="mt-1 h-9 w-9 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Security Alert</p>
                  <p className="text-[13px] text-on-surface-variant leading-relaxed mt-0.5">Multiple failed login attempts detected for account <strong>admin_04</strong>.</p>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 block">2 mins ago</span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-1 h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">New Company Partner</p>
                  <p className="text-[13px] text-on-surface-variant leading-relaxed mt-0.5"><strong>Vortex Solutions</strong> has requested enterprise verification.</p>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 block">45 mins ago</span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-1 h-9 w-9 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">System Backup Success</p>
                  <p className="text-[13px] text-on-surface-variant leading-relaxed mt-0.5">Automated full-system snapshot successfully completed.</p>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 block">3 hours ago</span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-1 h-9 w-9 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                  <Flag className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Content Flagged</p>
                  <p className="text-[13px] text-on-surface-variant leading-relaxed mt-0.5">Job posting #JK-291 flagged for inconsistent salary reporting.</p>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 block">5 hours ago</span>
                </div>
              </div>

            </div>
            
            <button className="w-full mt-4 py-3 text-xs font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors shrink-0">View All Notifications</button>
          </div>
        </div>
      </div>

      {/* Bottom Feature Section: Top Companies */}
      <section className="mt-10 mb-10">
        <div className="glass-card rounded-3xl p-8 border border-white shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-on-surface mb-1">Leading Hiring Partners</h3>
              <p className="text-sm text-on-surface-variant font-medium">Top organizations by application volume this month</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low/50 hover:bg-white transition-all cursor-pointer border border-transparent hover:border-outline-variant/10 hover:shadow-md group">
              <img alt="Tech Corp" className="h-12 w-12 rounded-xl object-cover bg-white p-1 border border-outline-variant/10 group-hover:scale-105 transition-transform" src="https://i.pravatar.cc/150?img=1" />
              <div>
                <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">TechFlow Inc.</h4>
                <p className="text-xs text-on-surface-variant mt-0.5 font-medium">42 Active Posts</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low/50 hover:bg-white transition-all cursor-pointer border border-transparent hover:border-outline-variant/10 hover:shadow-md group">
              <img alt="Creative Media" className="h-12 w-12 rounded-xl object-cover bg-white p-1 border border-outline-variant/10 group-hover:scale-105 transition-transform" src="https://i.pravatar.cc/150?img=2" />
              <div>
                <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">Nova Studios</h4>
                <p className="text-xs text-on-surface-variant mt-0.5 font-medium">28 Active Posts</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low/50 hover:bg-white transition-all cursor-pointer border border-transparent hover:border-outline-variant/10 hover:shadow-md group">
              <img alt="Banking" className="h-12 w-12 rounded-xl object-cover bg-white p-1 border border-outline-variant/10 group-hover:scale-105 transition-transform" src="https://i.pravatar.cc/150?img=3" />
              <div>
                <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">Meridian Bank</h4>
                <p className="text-xs text-on-surface-variant mt-0.5 font-medium">15 Active Posts</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low/50 hover:bg-white transition-all cursor-pointer border border-transparent hover:border-outline-variant/10 hover:shadow-md group">
              <img alt="Retail" className="h-12 w-12 rounded-xl object-cover bg-white p-1 border border-outline-variant/10 group-hover:scale-105 transition-transform" src="https://i.pravatar.cc/150?img=4" />
              <div>
                <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">Urban Goods</h4>
                <p className="text-xs text-on-surface-variant mt-0.5 font-medium">61 Active Posts</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
