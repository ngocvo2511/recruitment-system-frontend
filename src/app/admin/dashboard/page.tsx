"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Flag,
  MoreVertical,
  ShieldAlert,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { ApiError, getAdminDashboard, type AdminActivityItem, type AdminDashboardResponse } from "@/lib/api/admin";

function formatNumber(value?: number | null): string {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

function formatDate(value?: string | null): string {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleDateString("vi-VN");
}

function renderActivityIcon(type: string) {
  if (type === "COMPANY_VERIFICATION") return <UserPlus className="w-4 h-4" />;
  if (type === "JOB_APPROVAL") return <Flag className="w-4 h-4" />;
  if (type === "APPLICATION_SUBMITTED") return <Zap className="w-4 h-4" />;
  return <ShieldAlert className="w-4 h-4" />;
}

function activityTone(type: string): string {
  if (type === "COMPANY_VERIFICATION") return "bg-primary/10 text-primary";
  if (type === "JOB_APPROVAL") return "bg-orange-500/10 text-orange-600";
  if (type === "APPLICATION_SUBMITTED") return "bg-secondary/10 text-secondary";
  return "bg-error/10 text-error";
}

function RecentActivityRow({ item }: { item: AdminActivityItem }) {
  return (
    <div className="flex gap-4">
      <div className={`mt-1 h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${activityTone(item.type)}`}>
        {renderActivityIcon(item.type)}
      </div>
      <div>
        <p className="text-sm font-bold text-on-surface">{item.title}</p>
        <p className="text-[13px] text-on-surface-variant leading-relaxed mt-0.5">{item.description}</p>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 block">
          {formatDate(item.occurredAt)}
        </span>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const data = await getAdminDashboard();
        if (active) setDashboard(data);
      } catch (error) {
        if (!active) return;
        setErrorMessage(error instanceof ApiError ? error.message : "Unable to load admin dashboard.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const metrics = dashboard?.metrics;
  const chartValues = useMemo(() => {
    if (!metrics) return [0, 0, 0, 0];
    return [
      metrics.totalCandidates,
      metrics.totalRecruiters,
      metrics.totalCompanies,
      metrics.totalApplications,
    ];
  }, [metrics]);
  const chartMax = Math.max(...chartValues, 1);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="glass-card rounded-2xl p-8 text-on-surface-variant">Loading admin dashboard...</div>
      </div>
    );
  }

  if (errorMessage || !dashboard || !metrics) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm font-medium text-error">
          <AlertCircle className="w-4 h-4" />
          {errorMessage ?? "Dashboard data is unavailable."}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2">System Overview</h1>
        <p className="text-on-surface-variant font-medium">Live platform health, moderation queues, and activity.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="glass-card p-6 rounded-2xl border border-white/60 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Users className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              {formatNumber(metrics.totalAdmins)} admins
            </span>
          </div>
          <div className="mt-5">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Total Users</p>
            <h2 className="text-3xl font-black text-on-surface tracking-tight">{formatNumber(metrics.totalUsers)}</h2>
            <p className="text-xs text-on-surface-variant mt-2 font-medium">
              {formatNumber(metrics.totalCandidates)} candidates - {formatNumber(metrics.totalRecruiters)} recruiters
            </p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/60 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-secondary/10 rounded-xl text-secondary">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
              {formatNumber(metrics.pendingJobs)} pending
            </span>
          </div>
          <div className="mt-5">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Jobs</p>
            <h2 className="text-3xl font-black text-on-surface tracking-tight">{formatNumber(metrics.totalJobs)}</h2>
            <p className="text-xs text-on-surface-variant mt-2 font-medium">
              {formatNumber(metrics.publishedJobs)} published - {formatNumber(metrics.flaggedJobs)} flagged
            </p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/60 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
              {formatNumber(metrics.pendingCompanies)} pending
            </span>
          </div>
          <div className="mt-5">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Companies</p>
            <h2 className="text-3xl font-black text-on-surface tracking-tight">{formatNumber(metrics.totalCompanies)}</h2>
            <p className="text-xs text-on-surface-variant mt-2 font-medium">
              {formatNumber(metrics.activeCompanies)} verified/active
            </p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/40 shadow-sm flex flex-col justify-between signature-gradient text-white shadow-lg shadow-primary/20 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="flex justify-between items-start relative z-10">
            <div className="p-2.5 bg-white/20 rounded-xl text-white backdrop-blur-sm">
              <Zap className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-5 relative z-10">
            <p className="text-[10px] uppercase tracking-widest text-white/80 font-bold mb-1">Applications</p>
            <h2 className="text-3xl font-black tracking-tight text-white mb-2">{formatNumber(metrics.totalApplications)}</h2>
            <p className="text-[10px] text-white/80 font-medium">
              {formatNumber(metrics.applicationsLast7Days)} last 7 days - {formatNumber(metrics.applicationsLast30Days)} last 30 days
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card rounded-3xl p-8 border border-white shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-xl font-bold text-on-surface mb-1">Platform Composition</h2>
              <p className="text-sm text-on-surface-variant font-medium">Current counts from production data.</p>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-4 px-4 relative overflow-hidden flex-1 mt-4">
            {[
              { label: "Candidates", value: metrics.totalCandidates },
              { label: "Recruiters", value: metrics.totalRecruiters },
              { label: "Companies", value: metrics.totalCompanies },
              { label: "Applications", value: metrics.totalApplications },
            ].map((item, index) => (
              <div key={item.label} className="flex-1 flex flex-col items-center gap-3 h-full justify-end">
                <div
                  className={`w-full rounded-t-xl transition-all ${index === 3 ? "signature-gradient" : "bg-primary/20"}`}
                  style={{ height: `${Math.max((item.value / chartMax) * 100, 5)}%` }}
                />
                <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col">
          <div className="glass-card rounded-3xl p-6 border border-white shadow-sm flex-1 flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h2 className="text-xl font-bold text-on-surface">Recent Activity</h2>
              <button className="text-slate-400 hover:text-slate-600 transition-colors" type="button" aria-label="Activity options">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {dashboard.recentActivity.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No platform activity yet.</p>
              ) : (
                dashboard.recentActivity.map((item, index) => <RecentActivityRow key={`${item.type}-${index}`} item={item} />)
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="glass-card rounded-3xl p-8 border border-white shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-on-surface mb-1">Company Verification Queue</h2>
              <p className="text-sm text-on-surface-variant font-medium">Companies waiting for platform review.</p>
            </div>
            <Link href="/admin/company-moderation" className="text-xs font-bold text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {dashboard.pendingCompanies.length === 0 ? (
              <div className="rounded-2xl bg-surface-container-low/50 p-5 text-sm text-on-surface-variant">No pending companies.</div>
            ) : (
              dashboard.pendingCompanies.map((company) => (
                <div key={company.id} className="flex items-center justify-between gap-4 rounded-2xl bg-surface-container-low/50 p-4">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-on-surface truncate">{company.name}</h3>
                    <p className="text-xs text-on-surface-variant truncate">{company.ownerEmail ?? company.email ?? "No owner email"}</p>
                  </div>
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black uppercase text-orange-600">{company.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-8 border border-white shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-on-surface mb-1">Job Moderation Queue</h2>
              <p className="text-sm text-on-surface-variant font-medium">Jobs waiting for admin approval.</p>
            </div>
            <Link href="/admin/jobs" className="text-xs font-bold text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {dashboard.pendingJobs.length === 0 ? (
              <div className="rounded-2xl bg-surface-container-low/50 p-5 text-sm text-on-surface-variant">No pending jobs.</div>
            ) : (
              dashboard.pendingJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between gap-4 rounded-2xl bg-surface-container-low/50 p-4">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-on-surface truncate">{job.title}</h3>
                    <p className="text-xs text-on-surface-variant truncate">{job.companyName ?? "Unknown company"} - {formatDate(job.createdAt)}</p>
                  </div>
                  <Clock className="h-5 w-5 shrink-0 text-orange-600" />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="mb-10">
        <div className="glass-card rounded-3xl p-8 border border-white shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-on-surface mb-1">Latest Applications</h2>
              <p className="text-sm text-on-surface-variant font-medium">Recent candidate submissions across the platform.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboard.recentApplications.length === 0 ? (
              <div className="rounded-2xl bg-surface-container-low/50 p-5 text-sm text-on-surface-variant">No applications yet.</div>
            ) : (
              dashboard.recentApplications.map((application) => (
                <div key={application.id} className="rounded-2xl bg-surface-container-low/50 p-5 border border-outline-variant/10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-on-surface truncate">{application.candidateName ?? "Candidate"}</h3>
                      <p className="text-xs text-on-surface-variant truncate">{application.jobTitle ?? "Job"} - {application.companyName ?? "Company"}</p>
                    </div>
                    {application.aiScore != null && (
                      <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-[10px] font-black text-secondary">
                        {Math.round(application.aiScore)}%
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Applied {formatDate(application.appliedAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
