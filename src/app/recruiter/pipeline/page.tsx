"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, BriefcaseBusiness, Clock, FileText, Mail, MoreHorizontal, Phone } from "lucide-react";
import {
  ApiError,
  getRecruiterApplications,
  updateRecruiterApplicationStatus,
  type ApplicationResponse,
  type ApplicationStatus,
} from "@/lib/api/applications";

const STAGES: Array<{ status: ApplicationStatus; title: string; borderClass: string }> = [
  { status: "APPLIED", title: "Mới nộp", borderClass: "border-l-primary/40" },
  { status: "SCREENING", title: "Sàng lọc", borderClass: "border-l-primary" },
  { status: "INTERVIEW", title: "Phỏng vấn", borderClass: "border-l-secondary" },
  { status: "OFFERED", title: "Đề nghị", borderClass: "border-l-emerald-500" },
  { status: "HIRED", title: "Đã tuyển", borderClass: "border-l-blue-500" },
  { status: "REJECTED", title: "Từ chối", borderClass: "border-l-error" },
];

const STATUS_OPTIONS: ApplicationStatus[] = ["APPLIED", "SCREENING", "INTERVIEW", "OFFERED", "HIRED", "REJECTED"];

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: "Mới nộp",
  SCREENING: "Sàng lọc",
  INTERVIEW: "Phỏng vấn",
  OFFERED: "Đề nghị",
  HIRED: "Đã tuyển",
  REJECTED: "Từ chối",
  WITHDRAWN: "Đã rút",
};

function formatDate(value?: string | null): string {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("vi-VN");
}

export default function PipelineKanban() {
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const data = await getRecruiterApplications();
        if (active) setApplications(data);
      } catch (error) {
        if (!active) return;
        setErrorMessage(error instanceof ApiError ? error.message : "Không thể tải pipeline ứng viên.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const activeApplications = useMemo(
    () => applications.filter((application) => application.status !== "WITHDRAWN"),
    [applications],
  );

  const jobCount = useMemo(
    () => new Set(activeApplications.map((application) => application.jobId)).size,
    [activeApplications],
  );

  const handleStatusChange = async (applicationId: string, status: ApplicationStatus) => {
    setUpdatingId(applicationId);
    setErrorMessage(null);
    try {
      const updated = await updateRecruiterApplicationStatus(applicationId, status);
      setApplications((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Không thể cập nhật trạng thái ứng viên.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto min-h-[calc(100vh-80px)]">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pt-4">
        <div>
          <span className="text-xs font-bold text-primary tracking-[0.2em] uppercase mb-2 block">Recruiter Pipeline</span>
          <h1 className="text-4xl font-bold tracking-tight text-on-surface">Ứng viên đã nộp hồ sơ</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            {activeApplications.length} đơn ứng tuyển từ {jobCount} tin tuyển dụng.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/20 px-4 py-3">
            <p className="text-xl font-black text-on-surface">{activeApplications.length}</p>
            <p className="text-[10px] font-bold uppercase text-on-surface-variant">Tổng đơn</p>
          </div>
          <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/20 px-4 py-3">
            <p className="text-xl font-black text-on-surface">{applications.filter((item) => item.status === "INTERVIEW").length}</p>
            <p className="text-[10px] font-bold uppercase text-on-surface-variant">Phỏng vấn</p>
          </div>
          <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/20 px-4 py-3">
            <p className="text-xl font-black text-on-surface">{applications.filter((item) => item.status === "HIRED").length}</p>
            <p className="text-[10px] font-bold uppercase text-on-surface-variant">Đã tuyển</p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm font-medium text-error">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl bg-surface-container-lowest p-8 text-on-surface-variant">Đang tải pipeline...</div>
      ) : activeApplications.length === 0 ? (
        <div className="rounded-xl bg-surface-container-lowest p-10 text-center border border-outline-variant/10">
          <BriefcaseBusiness className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h2 className="text-xl font-bold text-on-surface mb-2">Chưa có ứng viên nộp hồ sơ</h2>
          <p className="text-on-surface-variant">Khi candidate ứng tuyển, hồ sơ sẽ xuất hiện ở pipeline này.</p>
        </div>
      ) : (
        <div className="overflow-x-auto flex gap-6 pb-6 items-start h-full">
          {STAGES.map((stage) => {
            const items = activeApplications.filter((application) => application.status === stage.status);

            return (
              <div key={stage.status} className="flex-shrink-0 w-80">
                <div className="flex items-center justify-between px-2 mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-on-surface">{stage.title}</h2>
                    <span className="bg-surface-container-high text-on-surface-variant text-xs px-2 py-0.5 rounded-full font-bold">
                      {items.length}
                    </span>
                  </div>
                  <button type="button" className="text-on-surface-variant hover:text-primary" aria-label={`Tùy chọn ${stage.title}`}>
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 min-h-[100px] pb-10">
                  {items.length === 0 ? (
                    <div className="border-2 border-dashed border-outline-variant/30 rounded-xl h-24 flex items-center justify-center text-on-surface-variant/50">
                      <span className="text-xs uppercase tracking-widest font-bold">Trống</span>
                    </div>
                  ) : (
                    items.map((application) => (
                      <div
                        key={application.id}
                        className={`group bg-surface-container-lowest/80 backdrop-blur-md p-4 rounded-xl shadow-sm border border-outline-variant/10 hover:shadow-md transition-all border-l-4 ${stage.borderClass}`}
                      >
                        <div className="flex justify-between items-start gap-3 mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-black">
                              {(application.candidateName ?? application.candidateEmail ?? "?").slice(0, 1).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-on-surface truncate">
                                {application.candidateName ?? "Ứng viên"}
                              </h3>
                              <p className="text-[11px] text-on-surface-variant truncate">{application.jobTitle}</p>
                            </div>
                          </div>
                          {application.aiScore != null && (
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[9px] font-black uppercase text-primary tracking-widest">AI Match</span>
                              <span className="signature-gradient text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                                {Math.round(application.aiScore)}%
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 text-[11px] text-on-surface-variant">
                          {application.candidateEmail && (
                            <div className="flex items-center gap-2 min-w-0">
                              <Mail className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{application.candidateEmail}</span>
                            </div>
                          )}
                          {application.candidatePhone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5" />
                              <span>{application.candidatePhone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Nộp ngày {formatDate(application.appliedAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5" />
                            <span className="truncate">{application.cvName ?? "CV đính kèm"}</span>
                          </div>
                        </div>

                        <select
                          value={application.status}
                          onChange={(event) => void handleStatusChange(application.id, event.target.value as ApplicationStatus)}
                          disabled={updatingId === application.id}
                          className="mt-4 w-full rounded-xl border border-outline-variant/20 bg-surface-container-high/60 px-3 py-2 text-xs font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {STATUS_LABELS[status]}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
