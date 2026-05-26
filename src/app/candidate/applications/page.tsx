"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, BriefcaseBusiness, CheckCircle2, Clock, FileText, XCircle } from "lucide-react";
import {
  ApiError,
  getMyApplications,
  withdrawApplication,
  type ApplicationResponse,
  type ApplicationStatus,
} from "@/lib/api/applications";

const STATUS_META: Record<ApplicationStatus, { label: string; className: string; step: number }> = {
  APPLIED: { label: "Đã ứng tuyển", className: "bg-primary-container text-on-primary-container", step: 1 },
  SCREENING: { label: "Đang sàng lọc", className: "bg-primary-container text-on-primary-container", step: 2 },
  INTERVIEW: { label: "Phỏng vấn", className: "bg-secondary-container text-on-secondary-container", step: 3 },
  OFFERED: { label: "Đã gửi đề nghị", className: "bg-emerald-100 text-emerald-700", step: 4 },
  HIRED: { label: "Đã tuyển", className: "bg-emerald-100 text-emerald-700", step: 5 },
  REJECTED: { label: "Từ chối", className: "bg-error/10 text-error", step: 0 },
  WITHDRAWN: { label: "Đã rút", className: "bg-surface-container-highest text-on-surface-variant", step: 0 },
};

function formatDate(value?: string | null): string {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("vi-VN");
}

function canWithdraw(status: ApplicationStatus): boolean {
  return status === "APPLIED" || status === "SCREENING";
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const data = await getMyApplications();
        if (active) setApplications(data);
      } catch (error) {
        if (!active) return;
        setErrorMessage(error instanceof ApiError ? error.message : "Không thể tải danh sách đơn ứng tuyển.");
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
    const active = applications.filter((item) => !["REJECTED", "WITHDRAWN"].includes(item.status)).length;
    const interviews = applications.filter((item) => item.status === "INTERVIEW").length;
    const offers = applications.filter((item) => item.status === "OFFERED" || item.status === "HIRED").length;
    return { active, interviews, offers };
  }, [applications]);

  const handleWithdraw = async (applicationId: string) => {
    setWithdrawingId(applicationId);
    setErrorMessage(null);
    try {
      const updated = await withdrawApplication(applicationId);
      setApplications((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Không thể rút đơn ứng tuyển.");
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 w-full animate-fade-in-up">
      <section className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-on-surface mb-2">Đơn ứng tuyển</h1>
        <p className="text-on-surface-variant text-lg">Theo dõi trạng thái các công việc bạn đã nộp hồ sơ.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass-card p-6 rounded-xl shadow-sm border border-outline-variant/10">
          <span className="text-xs font-bold tracking-widest uppercase text-primary mb-2 block">Đang xử lý</span>
          <h2 className="text-4xl font-extrabold text-on-surface">{stats.active}</h2>
        </div>
        <div className="glass-card p-6 rounded-xl shadow-sm border border-outline-variant/10">
          <span className="text-xs font-bold tracking-widest uppercase text-secondary mb-2 block">Phỏng vấn</span>
          <h2 className="text-4xl font-extrabold text-on-surface">{stats.interviews}</h2>
        </div>
        <div className="glass-card p-6 rounded-xl shadow-sm border border-outline-variant/10">
          <span className="text-xs font-bold tracking-widest uppercase text-emerald-600 mb-2 block">Offer / Hired</span>
          <h2 className="text-4xl font-extrabold text-on-surface">{stats.offers}</h2>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm font-medium text-error">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </div>
      )}

      {loading ? (
        <div className="glass-card rounded-xl p-8 text-on-surface-variant">Đang tải đơn ứng tuyển...</div>
      ) : applications.length === 0 ? (
        <div className="glass-card rounded-xl p-10 text-center">
          <BriefcaseBusiness className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h2 className="text-xl font-bold text-on-surface mb-2">Bạn chưa nộp công việc nào</h2>
          <p className="text-on-surface-variant mb-6">Tìm công việc phù hợp và ứng tuyển bằng CV đã tạo.</p>
          <Link href="/candidate/jobs" className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-white">
            Tìm việc ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {applications.map((application) => {
            const meta = STATUS_META[application.status];
            const inactive = application.status === "REJECTED" || application.status === "WITHDRAWN";

            return (
              <div
                key={application.id}
                className={`glass-card p-6 md:p-8 rounded-xl border border-outline-variant/10 shadow-sm ${inactive ? "opacity-80" : ""}`}
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-5">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <BriefcaseBusiness className="w-7 h-7" />
                    </div>
                    <div>
                      <Link href={`/candidate/jobs/${application.jobId}`} className="text-xl font-bold text-on-surface hover:text-primary">
                        {application.jobTitle}
                      </Link>
                      <p className="text-on-surface-variant">{application.companyName ?? "Công ty"}</p>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium text-on-surface-variant">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Nộp ngày {formatDate(application.appliedAt)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" />
                          {application.cvName ?? "CV đã nộp"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 md:items-end">
                    <span className={`px-4 py-1.5 text-xs font-bold rounded-full uppercase ${meta.className}`}>{meta.label}</span>
                    {application.aiScore != null && (
                      <span className="text-sm font-bold text-secondary">{Math.round(application.aiScore)}% AI match</span>
                    )}
                  </div>
                </div>

                {application.coverLetter && (
                  <p className="mt-5 rounded-xl bg-surface-container-high/50 p-4 text-sm leading-relaxed text-on-surface-variant">
                    {application.coverLetter}
                  </p>
                )}

                {!inactive && (
                  <div className="mt-8 grid grid-cols-4 gap-2">
                    {["Đã nộp", "Sàng lọc", "Phỏng vấn", "Offer"].map((step, index) => {
                      const done = meta.step >= index + 1;
                      return (
                        <div key={step} className="flex items-center gap-2">
                          <span className={`h-7 w-7 rounded-full flex items-center justify-center ${done ? "bg-primary text-white" : "bg-surface-container-highest text-on-surface-variant"}`}>
                            {done ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                          </span>
                          <span className="hidden text-xs font-bold text-on-surface-variant md:inline">{step}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {canWithdraw(application.status) && (
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => void handleWithdraw(application.id)}
                      disabled={withdrawingId === application.id}
                      className="inline-flex items-center gap-2 rounded-full bg-error/10 px-5 py-2 text-sm font-bold text-error transition hover:bg-error/20 disabled:opacity-60"
                    >
                      <XCircle className="h-4 w-4" />
                      {withdrawingId === application.id ? "Đang rút..." : "Rút đơn"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
