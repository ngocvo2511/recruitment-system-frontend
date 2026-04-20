import Link from "next/link";
import { User, FileText, Settings, Lightbulb, CloudUpload, File, CheckCircle, Trash2, Eye } from "lucide-react";

export default function CandidateCVPage() {
  const cvs = [
    {
      id: 1,
      filename: "Senior_UX_Designer_2024.pdf",
      uploadedAt: "Oct 12, 2023",
      size: "1.2 MB",
      type: "PDF",
      isDefault: true,
      matchScore: 94,
      skills: ["User Research", "Figma", "Design Ops"],
      aiSuggestion: "Consider adding more metrics to your case studies to increase match score."
    },
    {
      id: 2,
      filename: "Product_Manager_Draft.docx",
      uploadedAt: "Sep 28, 2023",
      size: "840 KB",
      type: "DOCX",
      isDefault: false,
      matchScore: 72,
      skills: ["Agile", "Roadmapping"],
      aiSuggestion: "Extracted skills are light on technical proficiencies. Suggested: Python, SQL."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 w-full animate-fade-in-up">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 flex flex-col gap-2 shrink-0">
          <nav className="flex flex-col gap-1">
            <Link href="/candidate/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors">
              <User className="w-5 h-5" />
              <span className="font-medium">Personal Info</span>
            </Link>
            <Link href="/candidate/cv" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-container/20 text-primary font-bold">
              <FileText className="w-5 h-5 fill-primary/20" />
              <span>CV Management</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors">
              <Lightbulb className="w-5 h-5" />
              <span className="font-medium">AI Insights</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </Link>
          </nav>
          
          {/* Status Card */}
          <div className="mt-8 glass-card p-6 rounded-3xl border-none shadow-sm">
            <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Profile Strength</p>
            <div className="w-full bg-surface-container-highest h-2 rounded-full mb-4 overflow-hidden">
              <div className="signature-gradient h-full w-[85%] rounded-full"></div>
            </div>
            <p className="text-xs text-on-surface-variant">Your profile is looking great! Uploading a new CV might boost it to 90%.</p>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 space-y-8 min-w-0">
          
          {/* Header */}
          <header className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">CV Management</h1>
            <p className="text-on-surface-variant text-lg bg-transparent">Manage your resumes and leverage AI to stand out from the crowd.</p>
          </header>

          {/* Upload Area */}
          <section className="relative group">
            <div className="absolute -inset-1 signature-gradient rounded-[2rem] blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative glass-card border-dashed border-2 border-primary/30 p-12 rounded-[2rem] flex flex-col items-center text-center gap-4 cursor-pointer hover:border-primary transition-all bg-white/40">
              <div className="h-16 w-16 signature-gradient text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                <CloudUpload className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface">Upload your new Resume</h3>
                <p className="text-on-surface-variant">Drag and drop your PDF or DOCX file here, or click to browse.</p>
              </div>
              <button className="mt-2 signature-gradient text-white px-8 py-3 rounded-full font-bold shadow-md hover:scale-105 active:scale-95 transition-transform z-10">
                Select File
              </button>
            </div>
          </section>

          {/* CV List */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-on-surface px-1">My CVs</h2>
            
            {cvs.map((cv) => (
              <div key={cv.id} className="glass-card rounded-[2rem] overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
                <div className="p-8 flex flex-col xl:flex-row gap-8">
                  
                  {/* Left: File Info */}
                  <div className="flex-1 flex flex-col sm:flex-row gap-6">
                    <div className="h-20 w-16 shrink-0 bg-surface-container-high rounded-xl flex items-center justify-center text-primary-dim relative overflow-hidden">
                      <File className="w-8 h-8" />
                      <div className="absolute bottom-0 left-0 w-full bg-primary/10 py-1 text-[8px] font-black text-center uppercase tracking-tighter">{cv.type}</div>
                    </div>
                    <div className="flex flex-col justify-between py-1">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-bold text-on-surface break-all">{cv.filename}</h3>
                          {cv.isDefault && (
                            <span className="bg-secondary/10 text-secondary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shrink-0">Default</span>
                          )}
                        </div>
                        <p className="text-on-surface-variant text-sm mt-1">Uploaded on {cv.uploadedAt} • {cv.size}</p>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-4">
                        <button className="flex items-center gap-1 text-primary font-bold text-sm hover:underline">
                          <Eye className="w-4 h-4"/> View
                        </button>
                        {!cv.isDefault && (
                          <button className="flex items-center gap-1 text-on-surface-variant font-bold text-sm hover:text-primary transition-colors">
                            <CheckCircle className="w-4 h-4" /> Set as Default
                          </button>
                        )}
                        <button className="flex items-center gap-1 text-error/70 font-bold text-sm hover:text-error transition-colors">
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: AI Analysis Section */}
                  <div className="xl:w-80 shrink-0 bg-surface-container-low/50 rounded-2xl p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant">AI Analysis</span>
                      <div className="flex items-center gap-1">
                        <span className={`text-xl font-black ${cv.matchScore > 80 ? 'text-secondary' : 'text-primary'}`}>{cv.matchScore}%</span>
                        <span className="text-[10px] text-on-surface-variant font-bold">MATCH</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cv.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-surface-container-highest rounded-full text-[10px] font-bold text-on-surface-variant">{skill}</span>
                      ))}
                    </div>
                    <div className="bg-white/50 p-3 rounded-xl border border-secondary/10">
                      <p className="text-[11px] font-medium text-on-surface-variant italic">"{cv.aiSuggestion}"</p>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </section>

        </div>
      </div>
    </div>
  );
}
