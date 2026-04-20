"use client";

import { MOCK_APPLICATIONS } from "@/lib/mockData";
import { Filter, Share, MoreHorizontal, Clock, Paperclip, MessageCircle, UserPlus } from "lucide-react";
import { useState } from "react";

const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];

export default function PipelineKanban() {
  const [pipelineState, setPipelineState] = useState(MOCK_APPLICATIONS);

  return (
    <div className="max-w-[1400px] mx-auto min-h-[calc(100vh-80px)]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pt-4">
        <div>
          <span className="text-xs font-bold text-primary tracking-[0.2em] uppercase mb-2 block">Current Pipeline</span>
          <h2 className="text-4xl font-bold tracking-tight text-on-surface">Senior UX Designer Roles</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3 overflow-hidden mr-4">
            <img alt="team member" className="inline-block h-8 w-8 rounded-full ring-2 ring-background" src="https://i.pravatar.cc/150?img=33" />
            <img alt="team member" className="inline-block h-8 w-8 rounded-full ring-2 ring-background" src="https://i.pravatar.cc/150?img=12" />
            <div className="h-8 w-8 rounded-full ring-2 ring-background bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-on-surface-variant">+4</div>
          </div>
          <button className="bg-surface-container-lowest border border-outline-variant/20 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-surface-container-low transition-all">
            <Filter className="w-4 h-4"/> Filters
          </button>
          <button className="bg-surface-container-lowest border border-outline-variant/20 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-surface-container-low transition-all">
            <Share className="w-4 h-4" /> Share Board
          </button>
        </div>
      </div>

      {/* Kanban Container */}
      <div className="overflow-x-auto flex gap-6 pb-6 items-start h-full">
        {STAGES.map(stage => {
          // Hardcoded for demo if mock data is sparse, else use mock data mapped
          const items = pipelineState.filter(a => 
            (stage === 'Applied' && a.status === 'New') ||
            (stage === 'Screening' && a.status === 'Screening') ||
            (stage === 'Interview' && a.status === 'Interview') ||
            (stage === 'Offer' && a.status === 'Offered') ||
            (stage === 'Hired' && a.status === 'Hired')
          );

          // Give a default color based on column index
          const colors = [
            'border-l-primary/30',
            'border-l-secondary/50',
            'border-l-secondary/80 text-secondary',
            'border-l-emerald-400 text-emerald-500', 
            'border-l-blue-400 opacity-70 border-outline-variant/5 border-l-[4px]'
          ];
          const bColor = colors[STAGES.indexOf(stage)];

          return (
            <div key={stage} className="flex-shrink-0 w-80">
              <div className="flex items-center justify-between px-2 mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-on-surface">{stage}</h3>
                  <span className="bg-surface-container-high text-on-surface-variant text-xs px-2 py-0.5 rounded-full font-bold">{items.length}</span>
                </div>
                <button className="text-on-surface-variant hover:text-primary"><MoreHorizontal className="w-5 h-5"/></button>
              </div>

              <div className="space-y-4 min-h-[100px] pb-10">
                {items.length === 0 ? (
                  <div className="border-2 border-dashed border-outline-variant/30 rounded-xl h-24 flex items-center justify-center text-on-surface-variant/40 hover:bg-surface-container-low/50 transition-all cursor-pointer">
                    <span className="text-xs uppercase tracking-widest font-bold">Drop Here</span>
                  </div>
                ) : items.map((app) => (
                  <div key={app.id} className={`group bg-surface-container-lowest/70 backdrop-blur-md p-4 rounded-xl shadow-sm border border-outline-variant/10 hover:shadow-md transition-all cursor-grab active:cursor-grabbing border-l-4 ${bColor}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <img alt="Candidate" className="w-10 h-10 rounded-xl object-cover" src={`https://i.pravatar.cc/150?u=${app.candidateId}`} />
                        <div>
                          <h4 className="text-sm font-bold text-on-surface">Candidate {app.candidateId}</h4>
                          <p className="text-[11px] text-on-surface-variant">Applied Job {app.jobId}</p>
                        </div>
                      </div>
                      <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2 py-1 rounded-lg">{app.aiScore}% MATCH</span>
                    </div>

                    <div className="flex items-center gap-4 mt-4 text-on-surface-variant">
                      <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/><span className="text-[10px] font-medium">{app.appliedDate}</span></div>
                      <div className="flex items-center gap-1"><Paperclip className="w-3.5 h-3.5"/><span className="text-[10px] font-medium">CV attached</span></div>
                    </div>
                  </div>
                ))}

              </div>
            </div>
          );
        })}
      </div>

      <button className="fixed bottom-14 right-8 w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-surface rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group">
        <UserPlus className="w-6 h-6" />
      </button>

      {/* Footer Status Bar for Recruiter */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 h-12 bg-surface-container-lowest/80 backdrop-blur-md border-t border-outline-variant/10 flex items-center px-6 justify-between text-[11px] font-bold text-on-surface-variant tracking-wider z-30">
        <div className="flex gap-6 items-center">
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> 3 SYNCED REQUISITIONS</span>
          <span className="flex items-center gap-2 uppercase tracking-[0.1em]">AI INSIGHTS ACTIVE</span>
        </div>
        <div className="flex gap-4 hidden sm:flex">
          <span className="hover:text-primary cursor-pointer transition-colors">EXPORT DATA</span>
          <span className="hover:text-primary cursor-pointer transition-colors">API STATUS: 100%</span>
        </div>
      </div>
    </div>
  );
}
