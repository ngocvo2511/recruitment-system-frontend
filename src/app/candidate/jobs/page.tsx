"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, MapPin, Clock, Building2, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import {
  ApiError,
  getJobRecommendations,
  type JobRecommendationResponse,
  type JobResponse,
} from "@/lib/api/jobs";

function formatDate(value?: string | null): string {
  if (!value) {
    return "--";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }
  return date.toLocaleDateString();
}

function formatSalary(job: JobResponse): string {
  if (job.salaryNegotiable) {
    return "Thoả thuận";
  }
  const min = job.minSalary ?? null;
  const max = job.maxSalary ?? null;
  const currency = job.currency ? ` ${job.currency}` : "";
  if (min != null && max != null) {
    return `${min} - ${max}${currency}`;
  }
  if (min != null) {
    return `From ${min}${currency}`;
  }
  if (max != null) {
    return `Up to ${max}${currency}`;
  }
  return "--";
}

export default function CandidateJobsPage() {
  const [jobs, setJobs] = useState<JobRecommendationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getJobRecommendations(12)
      .then((data) => {
        if (!active) return;
        setJobs(data);
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        if (!active) return;
        const message = error instanceof ApiError ? error.message : "Could not load jobs.";
        setErrorMessage(message);
        setJobs([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const totalJobs = jobs.length;
  const jobList = useMemo(() => jobs, [jobs]);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 pt-16 pb-24 text-center relative overflow-hidden">
        <div className="relative z-10">
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-[0.1em] uppercase bg-secondary-container text-on-secondary-container rounded-full">
            Kỷ nguyên tuyển dụng mới
          </span>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-6 text-on-surface">
            Tìm công việc <span className="bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">phù hợp</span> với bạn
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
            Đề xuất việc làm dựa trên AI. Chúng tôi phân tích kỹ năng và định hướng của bạn để tìm ra những cơ hội thực sự xứng tầm.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="signature-gradient text-white px-10 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/25">
              Khám phá việc làm
            </button>
            <button className="glass-card border border-white/40 px-10 py-4 rounded-full font-semibold text-lg hover:bg-white/40 active:scale-95 transition-all">
              Xem hướng dẫn AI
            </button>
          </div>
        </div>
      </section>

      {/* Main Job Search Body */}
      <section className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 mb-32">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-3 space-y-10">
          <div>
            <h4 className="text-sm font-bold tracking-widest uppercase text-on-surface-variant mb-6">Lọc kết quả</h4>
            <div className="space-y-6">
              
              {/* Search Input */}
              <div className="relative">
                <input 
                  className="w-full bg-surface-container-high border-none rounded-xl py-3 pl-11 focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-outline-variant outline-none" 
                  placeholder="Vị trí, kỹ năng..." 
                  type="text"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
              </div>
              
              {/* Location Filter */}
              <div>
                <p className="font-bold mb-4 text-on-surface">Địa điểm</p>
                <div className="space-y-3">
                  {['Ho Chi Minh City', 'Ha Noi', 'Remote'].map((loc) => (
                    <label key={loc} className="flex items-center gap-3 cursor-pointer group">
                      <input className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" defaultChecked={loc === 'Ho Chi Minh City'}/>
                      <span className="text-on-surface-variant group-hover:text-on-surface transition-colors">{loc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Job Type */}
              <div>
                <p className="font-bold mb-4 text-on-surface">Loại hình</p>
                <div className="flex flex-wrap gap-2 text-on-surface">
                  <button className="px-4 py-2 bg-primary/10 text-primary text-xs font-bold rounded-full">Full-time</button>
                  <button className="px-4 py-2 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-full hover:bg-surface-container-highest">Contract</button>
                  <button className="px-4 py-2 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-full hover:bg-surface-container-highest">Part-time</button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-3xl border border-secondary/20 bg-secondary/5 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/10 blur-2xl rounded-full"></div>
            <Sparkles className="text-secondary mb-3 w-6 h-6" />
            <h5 className="font-bold mb-2 text-on-surface">Thông báo việc làm AI</h5>
            <p className="text-sm text-on-surface-variant mb-4 flex-grow relative z-10">Nhận thông báo ngay khi có việc làm phù hợp với 90% match.</p>
            <button className="w-full py-2 bg-secondary text-white font-bold rounded-xl text-sm hover:bg-secondary-dim transition-colors relative z-10">Bật thông báo</button>
          </div>
        </aside>

        {/* Job List */}
        <div className="lg:col-span-9">
          <div className="flex items-center justify-between mb-8">
            <span className="font-bold text-on-surface-variant">Hiển thị {totalJobs} kết quả</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-on-surface-variant">Sắp xếp:</span>
              <button className="flex items-center gap-1 font-bold text-on-surface">Mới nhất <ChevronRight className="rotate-90 w-4 h-4"/></button>
            </div>
          </div>
          
          <div className="space-y-4">
            {loading && (
              <div className="text-on-surface-variant">Đang tải việc làm...</div>
            )}
            {!loading && errorMessage && (
              <div className="text-error">{errorMessage}</div>
            )}
            {!loading && !errorMessage && jobList.length === 0 && (
              <div className="text-on-surface-variant">Chưa có việc làm phù hợp.</div>
            )}
            {!loading && !errorMessage && jobList.map(({ job, matchScore }, idx) => (
              <div key={job.id} className="group bg-surface-container-lowest p-6 rounded-3xl border border-transparent hover:border-primary/10 hover:shadow-[0_8px_32px_0_rgba(0,80,212,0.05)] transition-all flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center p-3 flex-shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg"></div>
                </div>
                <div className="flex-grow">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors text-on-surface">{job.title}</h3>
                    {idx === 0 && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded">Urgent</span>}
                    {matchScore != null && (
                      <span className="flex items-center gap-1 px-3 py-1 signature-gradient text-white text-[11px] font-black uppercase rounded-full shadow-md shadow-primary/20">
                        <Sparkles className="w-3 h-3" />
                        {matchScore}% Phù hợp AI
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-on-surface-variant font-medium mt-2">
                    <span className="flex items-center gap-1"><Building2 className="w-4 h-4"/> {job.companyName ?? "Company"}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {job.location ?? "--"}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {formatDate(job.publishedAt ?? job.createdAt)}</span>
                  </div>
                </div>
                <div className="flex md:flex-col items-end gap-2 shrink-0 w-full md:w-auto">
                  <span className="text-lg font-black text-on-surface text-primary">{formatSalary(job)}</span>
                  <Link href={`/candidate/jobs/${job.id}`} className="px-6 py-2 bg-surface text-on-surface-variant font-bold rounded-xl hover:bg-primary hover:text-white transition-all w-full md:w-auto text-center">
                    Ứng tuyển
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <button className="px-8 py-3 bg-white/50 border border-outline-variant/30 rounded-full font-bold hover:bg-white transition-colors text-on-surface">Tải thêm việc làm</button>
          </div>
        </div>
      </section>
    </div>
  );
}
