"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Ban, CheckCircle, Eye, Flag, Lock, Search, X, XCircle } from "lucide-react";
import {
  ApiError,
  approveAdminJob,
  closeAdminJob,
  flagAdminJob,
  getAdminAuditLogs,
  getAdminJobs,
  rejectAdminJob,
  unflagAdminJob,
  type AdminAuditLogResponse,
  type AdminJobResponse,
  type AdminPageResponse,
  type JobStatus,
} from "@/lib/api/admin";

const STATUS_LABELS: Record<JobStatus, string> = {
  DRAFT: "Bản nháp",
  PENDING: "Chờ duyệt",
  PUBLISHED: "Đã đăng",
  REJECTED: "Từ chối",
  FLAGGED: "Bị gắn cờ",
  CLOSED: "Đã đóng",
};

function statusClass(status: JobStatus): string {
  if (status === "PUBLISHED") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (status === "PENDING") return "bg-secondary/10 text-secondary border-secondary/20";
  if (status === "FLAGGED") return "bg-orange-100 text-orange-700 border-orange-200";
  if (status === "REJECTED") return "bg-error/10 text-error border-error/20";
  return "bg-surface-container text-on-surface-variant border-outline-variant/10";
}

function formatDate(value?: string | null): string {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("vi-VN");
}

function formatSalary(job: AdminJobResponse): string {
  if (job.salaryNegotiable) return "Thỏa thuận";
  const currency = job.currency ? ` ${job.currency}` : "";
  if (job.minSalary != null && job.maxSalary != null) return `${job.minSalary} - ${job.maxSalary}${currency}`;
  if (job.minSalary != null) return `Từ ${job.minSalary}${currency}`;
  if (job.maxSalary != null) return `Đến ${job.maxSalary}${currency}`;
  return "--";
}

export default function AdminJobManagementPage() {
  const [data, setData] = useState<AdminPageResponse<AdminJobResponse> | null>(null);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<JobStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<AdminJobResponse | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogResponse[]>([]);
  const [pendingAction, setPendingAction] = useState<{ job: AdminJobResponse; action: "approve" | "reject" | "flag" | "unflag" | "close" } | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const result = await getAdminJobs({ keyword: keyword.trim() || undefined, status });
        if (active) setData(result);
      } catch (error) {
        if (!active) return;
        setErrorMessage(error instanceof ApiError ? error.message : "Không thể tải danh sách tin tuyển dụng.");
      } finally {
        if (active) setLoading(false);
      }
    };
    const timeout = window.setTimeout(() => void load(), 250);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [keyword, status]);

  useEffect(() => {
    if (!selectedJob) {
      return;
    }
    let active = true;
    const loadAuditLogs = async () => {
      try {
        const result = await getAdminAuditLogs({ targetType: "JOB", targetId: selectedJob.id, size: 10 });
        if (active) setAuditLogs(result.items);
      } catch {
        if (active) setAuditLogs([]);
      }
    };
    void loadAuditLogs();
    return () => {
      active = false;
    };
  }, [selectedJob]);

  const jobs = useMemo(() => data?.items ?? [], [data?.items]);
  const stats = useMemo(() => ({
    total: data?.totalItems ?? 0,
    pending: jobs.filter((job) => job.status === "PENDING").length,
    published: jobs.filter((job) => job.status === "PUBLISHED").length,
    flagged: jobs.filter((job) => job.status === "FLAGGED").length,
  }), [data?.totalItems, jobs]);

  const updateJobInList = (updated: AdminJobResponse) => {
    setData((current) => current ? { ...current, items: current.items.map((item) => (item.id === updated.id ? updated : item)) } : current);
    setSelectedJob((current) => (current?.id === updated.id ? updated : current));
  };

  const submitAction = async () => {
    if (!pendingAction) return;
    if (!reason.trim()) {
      setErrorMessage("Vui lòng nhập lý do kiểm duyệt.");
      return;
    }
    const { job, action } = pendingAction;
    setUpdatingId(job.id);
    setErrorMessage(null);
    try {
      const updated =
        action === "approve"
          ? await approveAdminJob(job.id, reason.trim())
          : action === "reject"
            ? await rejectAdminJob(job.id, reason.trim())
            : action === "flag"
              ? await flagAdminJob(job.id, reason.trim())
              : action === "unflag"
                ? await unflagAdminJob(job.id, reason.trim())
                : await closeAdminJob(job.id, reason.trim());
      updateJobInList(updated);
      setPendingAction(null);
      setReason("");
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Không thể cập nhật trạng thái tin tuyển dụng.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      <div className="mb-10 flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">Kiểm duyệt tin tuyển dụng</h1>
        <p className="text-on-surface-variant max-w-xl">Duyệt, từ chối, gắn cờ và đóng các tin tuyển dụng trên toàn nền tảng.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 rounded-2xl border border-outline-variant/10"><p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1">Tổng kết quả</p><span className="text-3xl font-extrabold">{stats.total}</span></div>
        <div className="glass-card p-6 rounded-2xl border border-outline-variant/10"><p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1">Chờ duyệt</p><span className="text-3xl font-extrabold text-secondary">{stats.pending}</span></div>
        <div className="glass-card p-6 rounded-2xl border border-outline-variant/10"><p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1">Đã đăng</p><span className="text-3xl font-extrabold text-emerald-600">{stats.published}</span></div>
        <div className="glass-card p-6 rounded-2xl border border-outline-variant/10"><p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1">Bị gắn cờ</p><span className="text-3xl font-extrabold text-orange-600">{stats.flagged}</span></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8 bg-surface-container-low/50 p-4 rounded-2xl border border-outline-variant/10">
        <div className="lg:col-span-3 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} className="w-full rounded-xl bg-surface-container-lowest border border-outline-variant/10 py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Tìm theo tiêu đề hoặc công ty..." />
        </div>
        <select value={status} onChange={(event) => setStatus(event.target.value as JobStatus | "ALL")} className="rounded-xl bg-surface-container-lowest border border-outline-variant/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20">
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="PUBLISHED">Đã đăng</option>
          <option value="FLAGGED">Bị gắn cờ</option>
          <option value="REJECTED">Từ chối</option>
          <option value="CLOSED">Đã đóng</option>
          <option value="DRAFT">Bản nháp</option>
        </select>
      </div>

      {errorMessage && <div className="mb-6 flex items-center gap-2 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm font-medium text-error"><AlertCircle className="w-4 h-4" />{errorMessage}</div>}

      <div className="glass-card rounded-2xl overflow-hidden border border-outline-variant/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[980px]">
            <thead><tr className="bg-surface-container-low/50 border-b border-outline-variant/10"><th className="px-8 py-5 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">Tin tuyển dụng</th><th className="px-6 py-5 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">Công ty</th><th className="px-6 py-5 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">Ngày tạo</th><th className="px-6 py-5 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant text-center">Trạng thái</th><th className="px-8 py-5 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant text-right">Thao tác</th></tr></thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? <tr><td className="px-8 py-8 text-on-surface-variant" colSpan={5}>Đang tải tin tuyển dụng...</td></tr> : jobs.length === 0 ? <tr><td className="px-8 py-8 text-center text-on-surface-variant" colSpan={5}>Không có tin tuyển dụng phù hợp.</td></tr> : jobs.map((job) => (
                <tr key={job.id} className="group hover:bg-primary/5 transition-colors">
                  <td className="px-8 py-6"><div className="flex flex-col"><span className="font-bold text-on-surface text-base">{job.title}</span><span className="text-xs text-on-surface-variant">{job.location ?? "--"} - {formatSalary(job)} - {job.applicationCount} đơn</span></div></td>
                  <td className="px-6 py-6"><div className="flex flex-col"><span className="text-sm font-semibold">{job.companyName ?? "--"}</span><span className="text-xs text-on-surface-variant">{job.recruiterEmail ?? "--"}</span></div></td>
                  <td className="px-6 py-6"><span className="text-sm font-medium text-on-surface-variant">{formatDate(job.createdAt)}</span></td>
                  <td className="px-6 py-6 text-center"><span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border ${statusClass(job.status)}`}>{STATUS_LABELS[job.status]}</span></td>
                  <td className="px-8 py-6 text-right"><div className="flex justify-end items-center gap-2">
                    <button type="button" onClick={() => setSelectedJob(job)} className="p-2 text-primary hover:bg-primary/10 rounded-full" title="Chi tiết"><Eye className="w-5 h-5" /></button>
                    {job.status !== "PUBLISHED" && <button type="button" onClick={() => { setPendingAction({ job, action: "approve" }); setReason(""); }} disabled={updatingId === job.id} className="px-4 py-1.5 bg-primary text-on-primary rounded-full text-xs font-bold disabled:opacity-50">Duyệt</button>}
                    {job.status !== "REJECTED" && <button type="button" onClick={() => { setPendingAction({ job, action: "reject" }); setReason(""); }} disabled={updatingId === job.id} className="p-2 text-outline hover:text-error disabled:opacity-50" title="Từ chối"><XCircle className="w-5 h-5" /></button>}
                    {job.status === "FLAGGED" ? <button type="button" onClick={() => { setPendingAction({ job, action: "unflag" }); setReason(""); }} disabled={updatingId === job.id} className="p-2 text-outline hover:text-primary disabled:opacity-50" title="Gỡ gắn cờ"><CheckCircle className="w-5 h-5" /></button> : <button type="button" onClick={() => { setPendingAction({ job, action: "flag" }); setReason(""); }} disabled={updatingId === job.id} className="p-2 text-outline hover:text-orange-600 disabled:opacity-50" title="Gắn cờ"><Flag className="w-5 h-5" /></button>}
                    {job.status !== "CLOSED" && <button type="button" onClick={() => { setPendingAction({ job, action: "close" }); setReason(""); }} disabled={updatingId === job.id} className="p-2 text-outline hover:text-error disabled:opacity-50" title="Đóng tin"><Lock className="w-5 h-5" /></button>}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-5 flex items-center justify-between bg-surface-container-low/30 border-t border-outline-variant/10"><p className="text-xs font-medium text-on-surface-variant">Trang {(data?.page ?? 0) + 1} / {Math.max(data?.totalPages ?? 1, 1)} - {data?.totalItems ?? 0} tin</p><Ban className="w-4 h-4 text-on-surface-variant" /></div>
      </div>

      {selectedJob && (
        <div className="fixed inset-y-0 right-0 z-[80] w-full max-w-xl bg-white shadow-2xl border-l border-outline-variant/10 p-6 overflow-y-auto">
          <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-extrabold">{selectedJob.title}</h2><p className="text-sm text-on-surface-variant">{selectedJob.companyName ?? "--"} - {selectedJob.recruiterEmail ?? "--"}</p></div><button type="button" onClick={() => setSelectedJob(null)} className="rounded-full p-2 hover:bg-surface-container"><X className="h-5 w-5" /></button></div>
          <div className="mt-6 space-y-4">
            <div className="rounded-xl bg-surface-container-low/60 p-4"><p className="text-xs font-bold uppercase text-on-surface-variant">Thông tin</p><p className="mt-1 text-sm">Địa điểm: {selectedJob.location ?? "--"}</p><p className="text-sm">Lương: {formatSalary(selectedJob)}</p><p className="text-sm">Thời gian làm việc: {selectedJob.workingTime ?? "--"}</p><p className="text-sm">Loại hình: {selectedJob.employmentType ?? "--"} - {selectedJob.workMode ?? "--"} - {selectedJob.level ?? "--"}</p><p className="text-sm">Hạn nộp: {formatDate(selectedJob.deadline)}</p></div>
            <div className="rounded-xl bg-surface-container-low/60 p-4"><p className="text-xs font-bold uppercase text-on-surface-variant">Mô tả công việc</p><p className="mt-2 whitespace-pre-wrap text-sm text-on-surface-variant">{selectedJob.description || "--"}</p></div>
            <div className="rounded-xl bg-surface-container-low/60 p-4"><p className="text-xs font-bold uppercase text-on-surface-variant">Yêu cầu ứng viên</p>{selectedJob.requirementSections?.length ? selectedJob.requirementSections.map((section) => <div key={section.id ?? section.title} className="mt-3"><p className="font-bold text-sm">{section.title}</p><ul className="mt-1 list-disc pl-5 text-sm text-on-surface-variant">{section.items?.map((item) => <li key={item.id ?? item.content}>{item.content}</li>)}</ul></div>) : <p className="mt-2 text-sm text-on-surface-variant">--</p>}</div>
            <div><h3 className="mb-3 text-sm font-bold">Lịch sử admin</h3><div className="space-y-2">{auditLogs.length === 0 ? <p className="text-sm text-on-surface-variant">Chưa có lịch sử kiểm duyệt.</p> : auditLogs.map((log) => <div key={log.id} className="rounded-xl border border-outline-variant/10 p-3"><p className="text-xs font-bold text-primary">{log.action}</p><p className="text-sm text-on-surface-variant">{log.reason || "--"}</p><p className="text-[11px] text-on-surface-variant">{formatDate(log.createdAt)}</p></div>)}</div></div>
          </div>
        </div>
      )}

      {pendingAction && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-extrabold">{pendingAction.action === "approve" ? "Duyệt tin" : pendingAction.action === "reject" ? "Từ chối tin" : pendingAction.action === "flag" ? "Gắn cờ tin" : pendingAction.action === "unflag" ? "Bỏ gắn cờ" : "Đóng tin"}</h2>
            <p className="mt-1 text-sm text-on-surface-variant">{pendingAction.job.title}</p>
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} className="mt-4 min-h-28 w-full rounded-xl border border-outline-variant/10 p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Nhập lý do hoặc ghi chú gửi cho recruiter..." />
            <div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setPendingAction(null)} className="rounded-xl px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container">Hủy</button><button type="button" onClick={() => void submitAction()} className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-on-primary">Xác nhận</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
