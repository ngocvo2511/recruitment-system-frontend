"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Ban, StickyNote, ChevronRight, FileText, Briefcase, History, Mail, PlayCircle, Eye, MessageSquare, ShieldCheck, Activity } from "lucide-react";

export default function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  
  // Minimal Mock for Demo
  const candidate = {
    id: unwrappedParams.id,
    name: "Eleanor Vance",
    title: "Senior Product Designer",
    appliedFor: "Lead Creative Strategist",
    location: "San Francisco, CA",
    email: "vance.eleanor@email.com",
    phone: "+1 (555) 012-3456",
    skills: ["Design Systems", "Figma Expert", "Team Leadership", "React.js", "User Research", "Prototyping"],
    matchScore: 94,
    noticePeriod: "30 Days"
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-fade-in-up -mx-8 -my-6">
      {/* Action Header */}
      <div className="px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-low/30 backdrop-blur-sm border-b border-outline-variant/10">
        <div className="flex items-center gap-4">
          <Link href="/recruiter/candidates" className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">{candidate.name}</h1>
            <p className="text-sm text-on-surface-variant font-medium">{candidate.title} • applied for {candidate.appliedFor}</p>
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
        
        {/* Left Side: CV Preview */}
        <section className="flex-1 bg-surface-container overflow-y-auto p-4 md:p-8 flex justify-center custom-scrollbar">
          <div className="max-w-3xl w-full bg-white shadow-xl shadow-black/5 rounded-xl min-h-[1000px] p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <FileText className="w-32 h-32" />
            </div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start border-b pb-8 mb-8 border-surface-container-high">
                <div>
                  <h2 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">{candidate.name}</h2>
                  <p className="text-primary font-bold tracking-widest text-xs mt-1 uppercase">{candidate.title}</p>
                </div>
                <div className="text-right text-xs text-on-surface-variant space-y-1">
                  <p>{candidate.location}</p>
                  <p>{candidate.email}</p>
                  <p>{candidate.phone}</p>
                </div>
              </div>

              <div className="space-y-8">
                <section>
                  <h3 className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-3">Profile</h3>
                  <p className="text-sm text-on-surface leading-relaxed">
                      Strategic product designer with 8+ years of experience in building scalable design systems and high-conversion user interfaces. Specialized in bridging the gap between complex engineering requirements and elegant user experiences.
                  </p>
                </section>
                <section>
                  <h3 className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-4">Experience</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-baseline mb-2">
                        <h4 className="font-bold text-on-surface">Design Principal • Lumina Tech</h4>
                        <span className="text-xs font-medium text-on-surface-variant">2020 — Present</span>
                      </div>
                      <ul className="text-sm text-on-surface-variant space-y-2 list-disc pl-4">
                        <li>Led a team of 12 designers to overhaul the core SaaS platform, resulting in a 40% increase in user retention.</li>
                        <li>Developed an internal design system "Prism" used across 4 global product units.</li>
                      </ul>
                    </div>
                    <div>
                      <div className="flex justify-between items-baseline mb-2">
                        <h4 className="font-bold text-on-surface">Senior Designer • Flux Interactive</h4>
                        <span className="text-xs font-medium text-on-surface-variant">2017 — 2020</span>
                      </div>
                      <p className="text-sm text-on-surface-variant">Shipped award-winning mobile experiences for Fortune 500 clients including automotive and fintech sectors.</p>
                    </div>
                  </div>
                </section>
                <section>
                  <h3 className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-4">Education</h3>
                  <div>
                    <h4 className="font-bold text-on-surface">MFA in Interaction Design</h4>
                    <p className="text-sm text-on-surface-variant">Rhode Island School of Design • 2017</p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Analytics & Metadata */}
        <section className="w-full lg:w-[450px] bg-surface-container-low overflow-y-auto border-l border-outline-variant/10 p-6 md:p-8 space-y-10 custom-scrollbar shrink-0">
          
          {/* Skills Tags Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">Skill Assessment</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill, i) => (
                <span key={i} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  i < 2 ? 'bg-primary/10 text-primary border border-primary/20' :
                  i === 2 ? 'bg-secondary/10 text-secondary border border-secondary/20' :
                  'bg-surface-container-highest text-on-surface-variant'
                }`}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Application Tracker Component */}
          <div className="p-6 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10">
            <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-6 text-center">Application Status</h3>
            <div className="flex items-center justify-between relative px-2">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-container-high -translate-y-1/2 z-0"></div>
              <div className="absolute top-1/2 left-0 w-1/3 h-1 bg-secondary -translate-y-1/2 z-0"></div>
              
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-white">
                  <ShieldCheck className="w-4 h-4"/>
                </div>
                <span className="text-[10px] font-bold text-on-surface">Applied</span>
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

          {/* Quick Insight Bento Box */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <p className="text-[10px] font-bold text-primary uppercase">Culture Fit</p>
              <p className="text-xl font-black text-on-surface">{candidate.matchScore}%</p>
            </div>
            <div className="p-4 bg-secondary/5 rounded-2xl border border-secondary/10">
              <p className="text-[10px] font-bold text-secondary uppercase">Notice Period</p>
              <p className="text-xl font-black text-on-surface">{candidate.noticePeriod}</p>
            </div>
          </div>

          {/* Action Shortcut Sidebar */}
          <div className="pt-6 border-t border-outline-variant/10">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-4 tracking-tighter">Quick Navigation</p>
            <div className="flex flex-col gap-2">
              <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-primary bg-primary/5 w-full text-left">
                <FileText className="w-4 h-4"/> Resume Preview
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
