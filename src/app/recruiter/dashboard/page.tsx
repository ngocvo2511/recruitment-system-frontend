"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, Calendar, Download, Eye, Loader2, Plus, RefreshCw, Users, Zap } from "lucide-react";
import {
  getRecruiterDashboard,
  type RecruiterDashboardApplication,
  type RecruiterDashboardResponse,
} from "@/lib/api/recruiterDashboard";
import type { ApplicationStatus } from "@/lib/api/applications";

const statusLabels: Record<ApplicationStatus, string> = {
  APPLIED: "Mới ứng tuyển",
  SCREENING: "Đang sàng lọc",
  INTERVIEW: "Phỏng vấn",
  OFFERED: "Đã gửi offer",
  HIRED: "Đã tuyển",
  REJECTED: "Từ chối",
  WITHDRAWN: "Đã rút",
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "Chưa có ngày";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getInitials(application: RecruiterDashboardApplication): string {
  const source = application.candidateName || application.candidateEmail || "UV";
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "UV";
}

export default function RecruiterDashboard() {
  const [dashboard, setDashboard] = useState<RecruiterDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      const data = await getRecruiterDashboard();
      setDashboard(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu tổng quan.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard();
  }, [loadDashboard]);

  const stats = dashboard?.stats;
  const recentApplications = useMemo(
    () => dashboard?.recentApplications ?? [],
    [dashboard?.recentApplications],
  );
  const averageAiScore = stats?.averageAiScore ?? 0;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="font-semibold text-on-surface">Đang tải dữ liệu tổng quan...</p>
        <p className="text-sm text-on-surface-variant mt-1">Hệ thống đang lấy số liệu mới nhất từ cơ sở dữ liệu.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <header className="relative mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-primary font-bold uppercase tracking-widest text-sm mb-2">Tổng quan nhà tuyển dụng</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface leading-tight tracking-tight">
            Theo dõi pipeline tuyển dụng từ dữ liệu thật.
          </h1>
          {error && (
            <p className="mt-4 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/recruiter/jobs/create" className="signature-gradient text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" /> Đăng tin mới
          </Link>
          <Link href="/recruiter/pipeline" className="bg-surface-container-highest text-on-surface px-8 py-4 rounded-full font-bold hover:bg-surface-variant transition-all flex items-center gap-2">
            <Eye className="w-5 h-5" /> Xem ứng viên
          </Link>
          <button
            className="bg-white text-on-surface px-5 py-4 rounded-full font-bold border border-outline-variant/20 hover:bg-surface-container-low transition-all flex items-center gap-2"
            onClick={loadDashboard}
            type="button"
          >
            <RefreshCw className="w-5 h-5" /> Làm mới
          </button>
        </div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
        <div className="glass-card p-8 rounded-[2rem] border border-outline-variant/15 flex flex-col justify-between h-48 group hover:border-primary/30 transition-all">
          <div className="flex justify-between items-start">
            <Briefcase className="text-primary w-12 h-12 p-3 bg-primary/10 rounded-2xl" />
            <span className="text-primary font-bold text-xs uppercase tracking-widest">Đang mở</span>
          </div>
          <div>
            <h3 className="text-on-surface-variant text-sm font-medium mb-1 uppercase tracking-wider">Tin tuyển dụng</h3>
            <p className="text-4xl font-black">{formatNumber(stats?.activeJobs ?? 0)}</p>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2rem] border border-outline-variant/15 flex flex-col justify-between h-48 hover:border-secondary/30 transition-all">
          <div className="flex justify-between items-start">
            <Users className="text-secondary w-12 h-12 p-3 bg-secondary/10 rounded-2xl" />
            <span className="text-secondary font-bold text-xs uppercase tracking-widest">
              +{formatNumber(stats?.applicationsLast7Days ?? 0)} / 7 ngày
            </span>
          </div>
          <div>
            <h3 className="text-on-surface-variant text-sm font-medium mb-1 uppercase tracking-wider">Ứng viên đã nộp</h3>
            <p className="text-4xl font-black">{formatNumber(stats?.uniqueCandidates ?? 0)}</p>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2rem] border border-outline-variant/15 flex flex-col justify-between h-48 hover:border-primary/30 transition-all md:col-span-1 lg:col-span-1">
          <div className="flex justify-between items-start">
            <Zap className="text-primary-dim w-12 h-12 p-3 bg-primary-dim/10 rounded-2xl" />
            <span className="text-primary-dim font-bold text-xs uppercase tracking-widest">
              {formatNumber(stats?.interviewStageApplications ?? 0)} hồ sơ
            </span>
          </div>
          <div>
            <h3 className="text-on-surface-variant text-sm font-medium mb-1 uppercase tracking-wider">Tỉ lệ vào vòng sâu</h3>
            <p className="text-4xl font-black">{stats?.conversionRate ?? 0}%</p>
          </div>
        </div>

        <div className="signature-gradient p-8 rounded-[2rem] text-white flex flex-col justify-center h-48 md:col-span-3 lg:col-span-1 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-primary-fixed text-xs font-bold uppercase mb-2 tracking-widest">Gợi ý AI</p>
            <p className="text-lg font-medium leading-snug">
              Điểm AI trung bình của các hồ sơ đã nộp là {averageAiScore > 0 ? `${averageAiScore}%` : "chưa có dữ liệu"}.
            </p>
            <Link href="/recruiter/ai-suggest" className="mt-4 text-xs font-bold flex items-center gap-1 hover:underline">
              Xem gợi ý ứng viên <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 bg-surface-container-low/50 rounded-[2.5rem] p-8 border border-white/40 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Hoạt động gần đây</h2>
            <Link href="/recruiter/candidates" className="text-primary font-bold text-sm hover:underline">
              Xem tất cả
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-outline-variant/40 p-10 text-center">
              <p className="text-lg font-bold text-on-surface">Chưa có ứng viên nộp hồ sơ</p>
              <p className="text-sm text-on-surface-variant mt-2">Khi có ứng viên ứng tuyển, hoạt động mới nhất sẽ hiển thị tại đây.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {recentApplications.map((application) => (
                <div key={application.id} className="flex gap-6 items-start">
                  <div className="h-12 w-12 rounded-full border-2 border-white shadow-md overflow-hidden flex-shrink-0 signature-gradient text-white flex items-center justify-center font-black">
                    {getInitials(application)}
                  </div>
                  <div className="flex-1 pb-6 border-b border-outline-variant/10">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-1">
                      <p className="text-on-surface font-semibold">
                        {application.candidateName || application.candidateEmail || "Ứng viên"} đã nộp vào{" "}
                        <span className="text-primary">{application.jobTitle || "tin tuyển dụng"}</span>
                      </p>
                      <span className="text-on-surface-variant text-xs whitespace-nowrap">{formatDate(application.appliedAt)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-3 py-1 bg-surface-container-high rounded-full text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">
                        {statusLabels[application.status] ?? application.status}
                      </span>
                      {application.aiScore != null && (
                        <span className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-bold uppercase text-primary tracking-wider">
                          AI: {application.aiScore}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="glass-card rounded-[2.5rem] p-8 border border-white/60 shadow-lg shadow-black/5">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="text-secondary w-5 h-5" />
              Lịch phỏng vấn
            </h2>
            <div className="p-5 bg-white/50 rounded-2xl border border-white">
              <p className="text-sm font-bold text-on-surface">Chưa có lịch phỏng vấn tự động</p>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                Khi bạn cập nhật ứng viên sang vòng phỏng vấn, lịch hẹn có thể được bổ sung ở bước tích hợp tiếp theo.
              </p>
            </div>
          </div>

          <div className="relative rounded-[2rem] overflow-hidden aspect-[4/3] group bg-slate-900 border border-slate-800">
            <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/40 to-transparent p-8 flex flex-col justify-end">
              <p className="text-primary-fixed font-bold text-xs uppercase tracking-widest mb-2">Báo cáo tuyển dụng</p>
              <h3 className="text-white text-xl font-bold leading-tight mb-4">Theo dõi hiệu quả tuyển dụng theo dữ liệu ứng tuyển thực tế.</h3>
              <Link href="/recruiter/pipeline" className="flex items-center justify-center gap-2 text-white font-bold text-sm bg-white/10 backdrop-blur-md px-6 py-3 rounded-full hover:bg-white/20 transition-all">
                Mở quy trình <Download className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
