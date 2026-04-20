import { MOCK_APPLICATIONS, MOCK_JOBS } from "@/lib/mockData";
import { Check, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ApplicationsPage() {
  // Let's augment mock data to simulate statuses for UI demo
  const apps = [
    {
      id: 1,
      title: "Senior Product Designer",
      company: "Spotify • Stockholm, Sweden",
      status: "Interviewing",
      statusLabel: "Phỏng vấn",
      statusColor: "bg-secondary-container text-on-secondary-container",
      logo: "https://i.pravatar.cc/150?img=11",
      step: 2
    },
    {
      id: 2,
      title: "Creative Lead",
      company: "Airbnb • Remote",
      status: "Applied",
      statusLabel: "Đã ứng tuyển",
      statusColor: "bg-primary-container text-on-primary-container",
      logo: "https://i.pravatar.cc/150?img=12",
      step: 1
    },
    {
      id: 3,
      title: "Frontend Engineer",
      company: "Stripe • San Francisco, CA",
      status: "Rejected",
      statusLabel: "Đã từ chối",
      statusColor: "bg-surface-container-highest text-on-surface-variant",
      logo: "https://i.pravatar.cc/150?img=13",
      step: 0
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 w-full animate-fade-in-up">
      {/* Hero Section */}
      <section className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-on-surface mb-2">Track Your Journey</h1>
        <p className="text-on-surface-variant text-lg">Curating your next professional milestone with precision.</p>
      </section>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="md:col-span-2 glass-card p-8 rounded-xl shadow-sm border border-outline-variant/10 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-primary mb-2 block">Total Active</span>
            <h2 className="text-5xl font-extrabold text-on-surface">12</h2>
          </div>
          <div className="mt-4 flex -space-x-3">
            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300"></div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-400"></div>
            <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-primary text-[10px] text-white font-bold">+9</div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-xl shadow-sm border border-outline-variant/10">
          <span className="text-xs font-bold tracking-widest uppercase text-secondary mb-2 block">Interviews</span>
          <h2 className="text-5xl font-extrabold text-on-surface">3</h2>
          <p className="text-on-surface-variant text-sm mt-2">Next one: Tomorrow, 10 AM</p>
        </div>

        <div className="glass-card p-8 rounded-xl shadow-sm border border-outline-variant/10 signature-gradient group">
          <span className="text-xs font-bold tracking-widest uppercase text-white mb-2 block">Offers</span>
          <h2 className="text-5xl font-extrabold text-white">1</h2>
          <button className="mt-4 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white uppercase tracking-wider hover:bg-white/30 transition-all">
            View Details
          </button>
        </div>
      </div>

      {/* Application List */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-on-surface mb-6">Recent Applications</h3>

        {/* Dynamic Mapping from Mock array */}
        {apps.map((app, idx) => (
          <div key={app.id} className={`glass-card p-6 md:p-8 rounded-xl border border-outline-variant/10 transition-transform hover:scale-[1.01] duration-300 shadow-sm ${app.status === 'Rejected' ? 'opacity-80' : ''}`}>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center overflow-hidden shrink-0">
                  <img alt={`${app.company} Logo`} className="w-10 h-10 object-cover" src={app.logo}/>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-on-surface">{app.title}</h4>
                  <p className="text-on-surface-variant">{app.company}</p>
                </div>
              </div>
              <div className="flex flex-col md:items-end">
                <span className="text-xs font-bold tracking-widest uppercase text-on-surface-variant mb-1">Status</span>
                <span className={`px-4 py-1 text-xs font-bold rounded-full uppercase ${app.statusColor}`}>
                  {app.statusLabel}
                </span>
              </div>
            </div>

            {/* Custom Progress Timeline if active */}
            {app.status !== 'Rejected' ? (
              <div className="mt-10 relative">
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-surface-container-highest -translate-y-1/2"></div>
                <div 
                  className={`absolute top-1/2 left-0 h-[2px] ${app.status === 'Interviewing' ? 'bg-secondary w-1/2' : 'signature-gradient w-[5%]'} -translate-y-1/2`}
                ></div>
                
                <div className="relative flex justify-between">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center gap-3">
                    {app.step >= 1 ? (
                      <div className={`w-6 h-6 rounded-full ${app.step > 1 ? 'bg-secondary' : 'signature-gradient'} border-4 border-white shadow-sm z-10 flex items-center justify-center`}>
                        <Check className="text-white w-3 h-3" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full signature-gradient border-4 border-white shadow-[0_0_15px_rgba(0,80,212,0.4)] z-10"></div>
                    )}
                    <span className={`text-xs font-bold uppercase tracking-tighter ${app.step >= 1 ? 'text-on-surface-variant' : 'text-on-surface'}`}>Đã ứng tuyển</span>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center gap-3">
                    {app.step >= 2 ? (
                      <div className="w-8 h-8 rounded-full bg-secondary border-4 border-white shadow-[0_0_15px_rgba(106,55,212,0.4)] z-10"></div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-surface-container-highest border-4 border-white z-10"></div>
                    )}
                    <span className={`text-xs font-bold uppercase tracking-tighter ${app.step >= 2 ? 'text-on-surface' : 'text-on-surface-variant'}`}>Phỏng vấn</span>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-surface-container-highest border-4 border-white z-10"></div>
                    <span className="text-xs font-bold uppercase tracking-tighter text-on-surface-variant">Nhận lời mời</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-2 text-error text-sm font-medium">
                <AlertCircle className="w-4 h-4"/>
                Vị trí này đã đóng. Theo dõi để nhận cập nhật mới nhất.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
