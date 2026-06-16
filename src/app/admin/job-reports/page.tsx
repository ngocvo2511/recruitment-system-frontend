"use client";

import Link from "next/link";
import { CheckCircle2, ExternalLink, Siren, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  closeAdminJob,
  flagAdminJob,
  getAdminJobReports,
  reviewAdminJobReport,
  type AdminPageResponse,
  type JobReportReason,
  type JobReportResponse,
  type JobReportStatus,
} from "@/lib/api/admin";

const REASON_LABELS: Record<JobReportReason, string> = {
  MISLEADING_INFORMATION: "Thông tin sai lệch",
  SCAM_OR_FRAUD: "Có dấu hiệu lừa đảo",
  DISCRIMINATION: "Phân biệt đối xử",
  INAPPROPRIATE_CONTENT: "Nội dung không phù hợp",
  DUPLICATE_OR_EXPIRED: "Tin trùng hoặc hết hạn",
  OTHER: "Lý do khác",
};

const STATUS_LABELS: Record<JobReportStatus, string> = {
  PENDING: "Chờ xử lý",
  RESOLVED: "Đã xử lý",
  DISMISSED: "Đã bỏ qua",
};

export default function AdminJobReportsPage() {
  const [data, setData] = useState<AdminPageResponse<JobReportResponse> | null>(null);
  const [status, setStatus] = useState<JobReportStatus | "ALL">("PENDING");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selected, setSelected] = useState<JobReportResponse | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"RESOLVED" | "DISMISSED">("RESOLVED");
  const [adminNote, setAdminNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [jobAction, setJobAction] = useState<"NONE" | "FLAG" | "CLOSE">("NONE");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await getAdminJobReports({ status }));
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Không thể tải danh sách báo cáo.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const submitReview = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const moderationReason = adminNote.trim() || "Xử lý từ báo cáo của ứng viên.";
      if (reviewStatus === "RESOLVED" && jobAction === "FLAG") {
        await flagAdminJob(selected.jobId, moderationReason);
      }
      if (reviewStatus === "RESOLVED" && jobAction === "CLOSE") {
        await closeAdminJob(selected.jobId, moderationReason);
      }
      await reviewAdminJobReport(selected.id, reviewStatus, adminNote.trim() || undefined);
      setSelected(null);
      setAdminNote("");
      await load();
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Không thể xử lý báo cáo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-on-surface">Báo cáo tin tuyển dụng</h1>
        <p className="mt-2 text-on-surface-variant">Kiểm tra phản ánh từ ứng viên và ghi nhận kết quả xử lý.</p>
      </header>

      <div className="mb-6 flex items-center justify-between gap-4">
        <select value={status} onChange={(e) => setStatus(e.target.value as JobReportStatus | "ALL")} className="rounded-lg border border-outline-variant/20 bg-white px-4 py-3">
          <option value="PENDING">Chờ xử lý</option>
          <option value="RESOLVED">Đã xử lý</option>
          <option value="DISMISSED">Đã bỏ qua</option>
          <option value="ALL">Tất cả</option>
        </select>
        <span className="text-sm font-semibold text-on-surface-variant">{data?.totalItems ?? 0} báo cáo</span>
      </div>

      {errorMessage && <div className="mb-5 rounded-lg bg-error/10 px-4 py-3 text-error">{errorMessage}</div>}

      <div className="overflow-x-auto border border-outline-variant/20 bg-white">
        <table className="w-full min-w-[900px] text-left">
          <thead className="border-b border-outline-variant/20 bg-surface-container-low">
            <tr>{["Tin tuyển dụng", "Người báo cáo", "Lý do", "Trạng thái", "Thao tác"].map((label) => <th key={label} className="px-5 py-4 text-xs font-bold uppercase text-on-surface-variant">{label}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-8 text-on-surface-variant">Đang tải báo cáo...</td></tr>
            ) : !data?.items.length ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-on-surface-variant">Không có báo cáo phù hợp.</td></tr>
            ) : data.items.map((report) => (
              <tr key={report.id}>
                <td className="px-5 py-5"><p className="font-bold">{report.jobTitle}</p><p className="text-xs text-on-surface-variant">{report.companyName ?? "--"} · {report.jobStatus}</p></td>
                <td className="px-5 py-5 text-sm">{report.reporterEmail}</td>
                <td className="px-5 py-5"><p className="text-sm font-semibold">{REASON_LABELS[report.reason]}</p><p className="mt-1 max-w-xs truncate text-xs text-on-surface-variant">{report.details || "--"}</p></td>
                <td className="px-5 py-5 text-sm font-semibold">{STATUS_LABELS[report.status]}</td>
                <td className="px-5 py-5"><div className="flex gap-2">
                  <Link href="/admin/jobs" title="Mở quản lý tin tuyển dụng" className="p-2 text-primary"><ExternalLink className="h-4 w-4" /></Link>
                  <button type="button" onClick={() => { setSelected(report); setReviewStatus("RESOLVED"); setJobAction("NONE"); setAdminNote(report.adminNote ?? ""); }} className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white">Xem và xử lý</button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl">
            <div className="flex gap-3"><Siren className="h-6 w-6 text-error" /><div><h2 className="text-xl font-bold">{selected.jobTitle}</h2><p className="text-sm text-on-surface-variant">{REASON_LABELS[selected.reason]}</p></div></div>
            <div className="mt-5 rounded-lg bg-surface-container-low p-4 text-sm whitespace-pre-wrap">{selected.details || "Không có mô tả bổ sung."}</div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setReviewStatus("RESOLVED")} className={`flex items-center justify-center gap-2 rounded-lg border p-3 font-bold ${reviewStatus === "RESOLVED" ? "border-primary bg-primary/10 text-primary" : "border-outline-variant/20"}`}><CheckCircle2 className="h-4 w-4" />Đã xử lý</button>
              <button type="button" onClick={() => setReviewStatus("DISMISSED")} className={`flex items-center justify-center gap-2 rounded-lg border p-3 font-bold ${reviewStatus === "DISMISSED" ? "border-error bg-error/10 text-error" : "border-outline-variant/20"}`}><XCircle className="h-4 w-4" />Bỏ qua</button>
            </div>
            {reviewStatus === "RESOLVED" && (
              <div className="mt-5">
                <p className="mb-2 text-sm font-bold">Xử lý tin tuyển dụng</p>
                <select value={jobAction} onChange={(e) => setJobAction(e.target.value as "NONE" | "FLAG" | "CLOSE")} className="w-full rounded-lg border border-outline-variant/20 bg-white px-3 py-3">
                  <option value="NONE">Chỉ ghi nhận báo cáo, giữ nguyên tin</option>
                  {selected.jobStatus === "PUBLISHED" && <option value="FLAG">Gắn cờ tin tuyển dụng</option>}
                  {(selected.jobStatus === "PUBLISHED" || selected.jobStatus === "FLAGGED") && <option value="CLOSE">Đóng tin tuyển dụng</option>}
                </select>
                <p className="mt-2 text-xs text-on-surface-variant">
                  Gắn cờ sẽ ẩn tin khỏi candidate; đóng tin sẽ kết thúc tuyển dụng. Bỏ qua báo cáo luôn giữ nguyên trạng thái tin.
                </p>
              </div>
            )}
            <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} className="mt-4 min-h-28 w-full rounded-lg border border-outline-variant/20 p-3" placeholder="Ghi chú kết quả kiểm tra..." />
            <div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setSelected(null)} className="px-4 py-2 font-bold text-on-surface-variant">Hủy</button><button type="button" disabled={saving} onClick={() => void submitReview()} className="rounded-lg bg-primary px-5 py-2 font-bold text-white disabled:opacity-50">Xác nhận</button></div>
          </div>
        </div>
      )}
    </main>
  );
}
