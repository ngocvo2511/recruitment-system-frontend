"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Clock, FileText, Loader2, Sparkles, UserRound } from "lucide-react";
import { ApiError, getMyApplications, type ApplicationResponse } from "@/lib/api/applications";
import { getJobRecommendations, type JobRecommendationResponse } from "@/lib/api/jobs";

function formatDate(value?: string | null): string {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("vi-VN");
}

export default function CandidateDashboardPage() {
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [recommendations, setRecommendations] = useState<JobRecommendationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [applicationResult, recommendationResult] = await Promise.allSettled([
          getMyApplications(),
          getJobRecommendations(4),
        ]);

        if (!active) return;

        if (applicationResult.status === "fulfilled") {
          setApplications(applicationResult.value);
          setErrorMessage(null);
        } else {
          setApplications([]);
          setErrorMessage(applicationResult.reason instanceof ApiError ? applicationResult.reason.message : "Không thể tải dữ liệu dashboard.");
        }

        setRecommendations(recommendationResult.status === "fulfilled" ? recommendationResult.value : []);
      } catch (error) {
        if (!active) return;
        setErrorMessage(error instanceof ApiError ? error.message : "Không thể tải dữ liệu dashboard.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const active = applications.filter((item) => !["REJECTED", "WITHDRAWN", "HIRED"].includes(item.status)).length;
    const interviews = applications.filter((item) => item.status === "INTERVIEW").length;
    const offers = applications.filter((item) => item.status === "OFFERED" || item.status === "HIRED").length;
    return { active, interviews, offers, total: applications.length };
  }, [applications]);

  const recentApplications = applications.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="font-semibold text-on-surface">Đang tải dashboard ứng viên...</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 w-full animate-fade-in-up">
      <section className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="text-xs font-bold text-primary tracking-[0.2em] uppercase mb-3 block">Dashboard ứng viên</span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-on-surface mb-3">Tổng quan hành trình tìm việc</h1>
          <p className="text-on-surface-variant text-lg max-w-2xl">
            Theo dõi đơn ứng tuyển, xem gợi ý việc làm phù hợp và tiếp tục hoàn thiện CV của bạn.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/candidate/jobs" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20">
            Tìm việc mới
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/candidate/cv" className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-6 py-3 text-sm font-bold text-on-surface">
            Quản lý CV
          </Link>
        </div>
      </section>

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm font-medium text-error">
          {errorMessage}
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
        <div className="glass-card p-6 rounded-xl border border-outline-variant/10">
          <BriefcaseBusiness className="h-6 w-6 text-primary mb-4" />
          <p className="text-3xl font-black text-on-surface">{stats.total}</p>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Tổng đơn</p>
        </div>
        <div className="glass-card p-6 rounded-xl border border-outline-variant/10">
          <Clock className="h-6 w-6 text-primary mb-4" />
          <p className="text-3xl font-black text-on-surface">{stats.active}</p>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Đang xử lý</p>
        </div>
        <div className="glass-card p-6 rounded-xl border border-outline-variant/10">
          <UserRound className="h-6 w-6 text-secondary mb-4" />
          <p className="text-3xl font-black text-on-surface">{stats.interviews}</p>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Phỏng vấn</p>
        </div>
        <div className="glass-card p-6 rounded-xl border border-outline-variant/10">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 mb-4" />
          <p className="text-3xl font-black text-on-surface">{stats.offers}</p>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Offer / Đã tuyển</p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 glass-card rounded-xl border border-outline-variant/10 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-on-surface">Đơn ứng tuyển gần đây</h2>
            <Link href="/candidate/applications" className="text-sm font-bold text-primary hover:underline">
              Xem tất cả
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-outline-variant/30 p-8 text-center">
              <BriefcaseBusiness className="mx-auto mb-4 h-10 w-10 text-primary" />
              <p className="font-bold text-on-surface">Bạn chưa nộp công việc nào</p>
              <p className="text-sm text-on-surface-variant mt-2">Hãy khám phá việc làm phù hợp và ứng tuyển bằng CV của bạn.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentApplications.map((application) => (
                <Link
                  key={application.id}
                  href={`/candidate/jobs/${application.jobId}`}
                  className="flex items-center gap-4 rounded-xl bg-surface-container-lowest p-4 hover:bg-surface-container-low transition-colors"
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-on-surface truncate">{application.jobTitle}</p>
                    <p className="text-sm text-on-surface-variant truncate">{application.companyName ?? "Công ty"}</p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-bold text-on-surface-variant">Nộp ngày</p>
                    <p className="text-sm font-semibold text-on-surface">{formatDate(application.appliedAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 glass-card rounded-xl border border-outline-variant/10 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-secondary" />
            <h2 className="text-2xl font-black text-on-surface">Gợi ý phù hợp</h2>
          </div>

          {recommendations.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Chưa có gợi ý việc làm phù hợp.</p>
          ) : (
            <div className="space-y-4">
              {recommendations.map(({ job, matchScore }) => (
                <Link
                  key={job.id}
                  href={`/candidate/jobs/${job.id}`}
                  className="block rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-4 hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-on-surface truncate">{job.title}</p>
                      <p className="text-sm text-on-surface-variant truncate">{job.companyName ?? "Công ty"}</p>
                    </div>
                    {matchScore != null && (
                      <span className="shrink-0 rounded-full bg-secondary/10 px-3 py-1 text-xs font-black text-secondary">
                        {Math.round(matchScore)}%
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
