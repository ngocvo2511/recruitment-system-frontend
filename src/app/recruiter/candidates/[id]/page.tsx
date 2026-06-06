"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Ban, StickyNote, ChevronRight, FileText, Briefcase, History, Mail, Eye, MessageSquare, ShieldCheck, Activity, Loader2 } from "lucide-react";
import { getPublicCandidateProfile, CandidateProfileResponse } from "@/lib/api/profile";
import { getPresignedUrl } from "@/lib/api/cv";

export default function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const searchParams = useSearchParams();
  const cvId = searchParams.get("cvId");
  
  const [profile, setProfile] = useState<CandidateProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpeningCv, setIsOpeningCv] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoading(true);
        const data = await getPublicCandidateProfile(unwrappedParams.id);
        setProfile(data);
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message || "Failed to load candidate profile.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [unwrappedParams.id]);

  const handleViewCv = async () => {
    if (!cvId) {
      alert("No CV ID provided.");
      return;
    }
    try {
      setIsOpeningCv(true);
      const { downloadUrl } = await getPresignedUrl(cvId);
      window.open(downloadUrl, "_blank");
    } catch (err) {
      alert("Failed to open CV document.");
    } finally {
      setIsOpeningCv(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-on-surface-variant font-medium">Loading candidate profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)]">
        <div className="glass-card rounded-[2rem] p-12 text-center border border-white/40 shadow-sm">
          <Ban className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-on-surface mb-2">Profile Unavailable</h2>
          <p className="text-on-surface-variant max-w-md">{error}</p>
          <Link href="/recruiter/ai-suggest" className="mt-6 inline-block px-6 py-3 rounded-full bg-primary text-white font-bold">
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-fade-in-up -mx-8 -my-6">
      {/* Action Header */}
      <div className="px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-low/30 backdrop-blur-sm border-b border-outline-variant/10">
        <div className="flex items-center gap-4">
          <Link href="/recruiter/ai-suggest" className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">{profile.fullName || "Unknown"}</h1>
            <p className="text-sm text-on-surface-variant font-medium">{profile.headline || "Candidate"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-6 py-2.5 rounded-full text-sm font-bold border border-outline-variant hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-on-surface flex items-center justify-center gap-2">
            <Ban className="w-4 h-4" /> Reject
          </button>
          <button className="flex-1 md:flex-none px-6 py-2.5 rounded-full text-sm font-bold bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2">
            <StickyNote className="w-4 h-4" /> Add Note
          </button>
          <button className="flex-[2] md:flex-none px-8 py-2.5 rounded-full text-sm font-bold text-white signature-gradient shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group">
            Move to Next Stage
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Split View Content */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left Side: Profile Information Preview */}
        <section className="flex-1 bg-surface-container overflow-y-auto p-4 md:p-8 flex justify-center custom-scrollbar">
          <div className="max-w-3xl w-full bg-white shadow-xl shadow-black/5 rounded-xl min-h-[1000px] p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <FileText className="w-32 h-32" />
            </div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start border-b pb-8 mb-8 border-surface-container-high">
                <div className="flex items-center gap-6">
                  {profile.profilePictureUrl && (
                    <img 
                      src={profile.profilePictureUrl} 
                      alt={profile.fullName || ""} 
                      className="w-24 h-24 rounded-full object-cover border-4 border-surface-container shadow-sm"
                    />
                  )}
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">{profile.fullName || "Candidate Profile"}</h2>
                    <p className="text-primary font-bold tracking-widest text-xs mt-1 uppercase">{profile.headline}</p>
                    {profile.openToWork && (
                       <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full border border-green-200">
                         Open to work
                       </span>
                    )}
                  </div>
                </div>
                <div className="text-right text-xs text-on-surface-variant space-y-1">
                  <p>{profile.email}</p>
                  <p>{profile.phoneNumber}</p>
                </div>
              </div>

              <div className="space-y-8">
                <section>
                  <h3 className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-3">About</h3>
                  <p className="text-sm text-on-surface leading-relaxed">
                      Candidate has not provided a detailed summary. Please refer to their CV for full work history, experience, and educational background.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-4">Confirmed Skills</h3>
                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-surface-container text-on-surface-variant">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-on-surface-variant italic">No skills listed</p>
                  )}
                </section>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Analytics & Action Sidebar */}
        <section className="w-full lg:w-[450px] bg-surface-container-low overflow-y-auto border-l border-outline-variant/10 p-6 md:p-8 space-y-10 custom-scrollbar shrink-0">
          
          {/* Quick Insight Bento Box */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <p className="text-[10px] font-bold text-primary uppercase">Profile Status</p>
              <p className="text-xl font-black text-on-surface">{profile.openToWork ? "Active" : "Passive"}</p>
            </div>
            <div className="p-4 bg-secondary/5 rounded-2xl border border-secondary/10">
              <p className="text-[10px] font-bold text-secondary uppercase">Contact</p>
              <p className="text-sm font-black text-on-surface mt-1 overflow-hidden text-ellipsis whitespace-nowrap" title={profile.email || "N/A"}>{profile.email || "N/A"}</p>
            </div>
          </div>

          {/* Application Tracker Component */}
          <div className="p-6 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10">
            <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-6 text-center">Recruitment Status</h3>
            <div className="flex items-center justify-between relative px-2">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-container-high -translate-y-1/2 z-0"></div>
              <div className="absolute top-1/2 left-0 w-1/3 h-1 bg-secondary -translate-y-1/2 z-0"></div>
              
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-white">
                  <ShieldCheck className="w-4 h-4"/>
                </div>
                <span className="text-[10px] font-bold text-on-surface">Suggested</span>
              </div>
              
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-secondary-container flex items-center justify-center text-secondary ring-4 ring-white shadow-sm">
                  <Eye className="w-4 h-4"/>
                </div>
                <span className="text-[10px] font-bold text-secondary">Review</span>
              </div>
              
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant ring-4 ring-white">
                  <MessageSquare className="w-3 h-3"/>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant">Interview</span>
              </div>
              
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant ring-4 ring-white">
                  <ShieldCheck className="w-3 h-3"/>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant">Offer</span>
              </div>
            </div>
          </div>

          {/* Action Shortcut Sidebar */}
          <div className="pt-6 border-t border-outline-variant/10">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-4 tracking-tighter">Quick Navigation</p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleViewCv}
                disabled={!cvId || isOpeningCv}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-primary shadow-md hover:bg-primary/90 w-full text-left transition-all disabled:opacity-50"
              >
                {isOpeningCv ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4"/>} 
                {isOpeningCv ? "Opening CV..." : "View Candidate CV"}
              </button>
              <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-low w-full text-left transition-colors">
                <Briefcase className="w-4 h-4"/> Portfolio Links
              </button>
              <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-low w-full text-left transition-colors">
                <History className="w-4 h-4"/> Activity Log
              </button>
              <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-low w-full text-left transition-colors">
                <Mail className="w-4 h-4"/> Contact Candidate
              </button>
            </div>
          </div>

        </section>
      </div>
    </div>
  );
}
