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
import {
  ApiError,
  getAdminAnalyticsOverview,
  getAdminDashboard,
  type AdminActivityItem,
  type AdminAnalyticsOverviewResponse,
  type AdminDashboardResponse,
} from "@/lib/api/admin";

function formatNumber(value?: number | null): string {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

function formatDate(value?: string | null): string {
  if (!value) return "Chưa có ngày";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có ngày";
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
  const [analytics, setAnalytics] = useState<AdminAnalyticsOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const [dashboardData, analyticsData] = await Promise.all([
          getAdminDashboard(),
          getAdminAnalyticsOverview(),
        ]);
        if (active) {
          setDashboard(dashboardData);
          setAnalytics(analyticsData);
        }
      } catch (error) {
        if (!active) return;
        setErrorMessage(error instanceof ApiError ? error.message : "Không thể tải dashboard admin.");
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
  const applicationSeriesMax = Math.max(...(analytics?.applicationsByDay.map((point) => point.count) ?? [0]), 1);
  const jobSeriesMax = Math.max(...(analytics?.jobsByDay.map((point) => point.count) ?? [0]), 1);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="glass-card rounded-2xl p-8 text-on-surface-variant">Đang tải dashboard admin...</div>
      </div>
    );
  }

  if (errorMessage || !dashboard || !metrics) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm font-medium text-error">
          <AlertCircle className="w-4 h-4" />
          {errorMessage ?? "Chưa có dữ liệu dashboard."}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2">Tổng quan hệ thống</h1>
        <p className="text-on-surface-variant font-medium">Theo dõi sức khỏe nền tảng, hàng đợi kiểm duyệt và hoạt động mới nhất.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="glass-card p-6 rounded-2xl border border-white/60 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Users className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              {formatNumber(metrics.totalAdmins)} admin
            </span>
          </div>
          <div className="mt-5">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Tổng người dùng</p>
            <h2 className="text-3xl font-black text-on-surface tracking-tight">{formatNumber(metrics.totalUsers)}</h2>
            <p className="text-xs text-on-surface-variant mt-2 font-medium">
              {formatNumber(metrics.totalCandidates)} ứng viên - {formatNumber(metrics.totalRecruiters)} nhà tuyển dụng
            </p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/60 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-secondary/10 rounded-xl text-secondary">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
              {formatNumber(metrics.pendingJobs)} chờ duyệt
            </span>
          </div>
          <div className="mt-5">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Tin tuyển dụng</p>
            <h2 className="text-3xl font-black text-on-surface tracking-tight">{formatNumber(metrics.totalJobs)}</h2>
            <p className="text-xs text-on-surface-variant mt-2 font-medium">
              {formatNumber(metrics.publishedJobs)} đã đăng - {formatNumber(metrics.flaggedJobs)} bị gắn cờ
            </p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/60 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
              {formatNumber(metrics.pendingCompanies)} chờ xác minh
            </span>
          </div>
          <div className="mt-5">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Công ty</p>
            <h2 className="text-3xl font-black text-on-surface tracking-tight">{formatNumber(metrics.totalCompanies)}</h2>
            <p className="text-xs text-on-surface-variant mt-2 font-medium">
              {formatNumber(metrics.activeCompanies)} đã xác minh
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
            <p className="text-[10px] uppercase tracking-widest text-white/80 font-bold mb-1">Đơn ứng tuyển</p>
            <h2 className="text-3xl font-black tracking-tight text-white mb-2">{formatNumber(metrics.totalApplications)}</h2>
            <p className="text-[10px] text-white/80 font-medium">
              {formatNumber(metrics.applicationsLast7Days)} trong 7 ngày - {formatNumber(metrics.applicationsLast30Days)} trong 30 ngày
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card rounded-3xl p-8 border border-white shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-xl font-bold text-on-surface mb-1">Cơ cấu nền tảng</h2>
              <p className="text-sm text-on-surface-variant font-medium">Số liệu hiện tại từ dữ liệu thật.</p>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-4 px-4 relative overflow-hidden flex-1 mt-4">
            {[
              { label: "Ứng viên", value: metrics.totalCandidates },
              { label: "Recruiter", value: metrics.totalRecruiters },
              { label: "Công ty", value: metrics.totalCompanies },
              { label: "Đơn ứng tuyển", value: metrics.totalApplications },
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
              <h2 className="text-xl font-bold text-on-surface">Hoạt động gần đây</h2>
              <button className="text-slate-400 hover:text-slate-600 transition-colors" type="button" aria-label="Activity options">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {dashboard.recentActivity.length === 0 ? (
                <p className="text-sm text-on-surface-variant">Chưa có hoạt động nào.</p>
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
              <h2 className="text-xl font-bold text-on-surface mb-1">Hàng đợi xác minh công ty</h2>
              <p className="text-sm text-on-surface-variant font-medium">Các công ty đang chờ admin kiểm duyệt.</p>
            </div>
            <Link href="/admin/company-moderation" className="text-xs font-bold text-primary hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3">
            {dashboard.pendingCompanies.length === 0 ? (
              <div className="rounded-2xl bg-surface-container-low/50 p-5 text-sm text-on-surface-variant">Không có công ty chờ duyệt.</div>
            ) : (
              dashboard.pendingCompanies.map((company) => (
                <div key={company.id} className="flex items-center justify-between gap-4 rounded-2xl bg-surface-container-low/50 p-4">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-on-surface truncate">{company.name}</h3>
                    <p className="text-xs text-on-surface-variant truncate">{company.ownerEmail ?? company.email ?? "Chưa có email chủ sở hữu"}</p>
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
              <h2 className="text-xl font-bold text-on-surface mb-1">Hàng đợi duyệt tin tuyển dụng</h2>
              <p className="text-sm text-on-surface-variant font-medium">Các tin đang chờ admin phê duyệt.</p>
            </div>
            <Link href="/admin/jobs" className="text-xs font-bold text-primary hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3">
            {dashboard.pendingJobs.length === 0 ? (
              <div className="rounded-2xl bg-surface-container-low/50 p-5 text-sm text-on-surface-variant">Không có tin chờ duyệt.</div>
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

      {analytics && (
        <section className="mb-10">
          <div className="glass-card rounded-3xl p-8 border border-white shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-bold text-on-surface mb-1">Phân tích 30 ngày gần đây</h2>
                <p className="text-sm text-on-surface-variant font-medium">
                  Số liệu thật từ đơn ứng tuyển, tin tuyển dụng và trạng thái pipeline.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-2xl bg-surface-container-low/60 px-4 py-3">
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant">Tin mới</p>
                  <p className="text-xl font-black text-on-surface">{formatNumber(analytics.overview.jobsLast30Days)}</p>
                </div>
                <div className="rounded-2xl bg-surface-container-low/60 px-4 py-3">
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant">Đơn mới</p>
                  <p className="text-xl font-black text-on-surface">{formatNumber(analytics.overview.applicationsLast30Days)}</p>
                </div>
                <div className="rounded-2xl bg-surface-container-low/60 px-4 py-3">
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant">Đã tuyển</p>
                  <p className="text-xl font-black text-on-surface">{formatNumber(analytics.funnel.hires)}</p>
                </div>
                <div className="rounded-2xl bg-surface-container-low/60 px-4 py-3">
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant">AI score TB</p>
                  <p className="text-xl font-black text-on-surface">
                    {analytics.aiMetrics.averageApplicationAiScore == null
                      ? "--"
                      : `${Math.round(analytics.aiMetrics.averageApplicationAiScore)}%`}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-2xl bg-surface-container-low/40 p-5 border border-outline-variant/10">
                <h3 className="text-sm font-bold text-on-surface mb-4">Đơn ứng tuyển theo ngày</h3>
                <div className="h-44 flex items-end gap-1">
                  {analytics.applicationsByDay.map((point) => (
                    <div
                      key={point.date}
                      className="flex-1 rounded-t-md bg-primary/30 hover:bg-primary/50 transition-colors"
                      style={{ height: `${Math.max((point.count / applicationSeriesMax) * 100, 4)}%` }}
                      title={`${point.date}: ${point.count} đơn`}
                    />
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-surface-container-low/40 p-5 border border-outline-variant/10">
                <h3 className="text-sm font-bold text-on-surface mb-4">Funnel ứng tuyển</h3>
                <div className="space-y-3">
                  {[
                    ["Tổng đơn", analytics.funnel.applications],
                    ["Sàng lọc", analytics.funnel.screening],
                    ["Phỏng vấn", analytics.funnel.interviews],
                    ["Offer", analytics.funnel.offers],
                    ["Đã tuyển", analytics.funnel.hires],
                    ["Từ chối", analytics.funnel.rejected],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="text-on-surface-variant">{label}</span>
                      <span className="font-black text-on-surface">{formatNumber(Number(value))}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-surface-container-low/40 p-5 border border-outline-variant/10">
              <h3 className="text-sm font-bold text-on-surface mb-4">Tin tuyển dụng mới theo ngày</h3>
              <div className="h-28 flex items-end gap-1">
                {analytics.jobsByDay.map((point) => (
                  <div
                    key={point.date}
                    className="flex-1 rounded-t-md bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    style={{ height: `${Math.max((point.count / jobSeriesMax) * 100, 4)}%` }}
                    title={`${point.date}: ${point.count} tin`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mb-10">
        <div className="glass-card rounded-3xl p-8 border border-white shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-on-surface mb-1">Đơn ứng tuyển mới nhất</h2>
              <p className="text-sm text-on-surface-variant font-medium">Các hồ sơ ứng tuyển gần đây trên toàn nền tảng.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboard.recentApplications.length === 0 ? (
              <div className="rounded-2xl bg-surface-container-low/50 p-5 text-sm text-on-surface-variant">Chưa có đơn ứng tuyển.</div>
            ) : (
              dashboard.recentApplications.map((application) => (
                <div key={application.id} className="rounded-2xl bg-surface-container-low/50 p-5 border border-outline-variant/10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-on-surface truncate">{application.candidateName ?? "Ứng viên"}</h3>
                      <p className="text-xs text-on-surface-variant truncate">{application.jobTitle ?? "Tin tuyển dụng"} - {application.companyName ?? "Công ty"}</p>
                    </div>
                    {application.aiScore != null && (
                      <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-[10px] font-black text-secondary">
                        {Math.round(application.aiScore)}%
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Nộp ngày {formatDate(application.appliedAt)}
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
