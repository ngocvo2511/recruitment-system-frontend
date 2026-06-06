"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Filter, History, Search, ShieldCheck } from "lucide-react";
import {
  ApiError,
  getAdminAuditLogs,
  type AdminAuditLogResponse,
  type AdminPageResponse,
} from "@/lib/api/admin";

const ACTION_LABELS: Record<string, string> = {
  USER_DISABLED: "Khóa tài khoản",
  USER_ENABLED: "Mở khóa tài khoản",
  COMPANY_VERIFIED: "Xác minh công ty",
  COMPANY_REJECTED: "Từ chối công ty",
  COMPANY_MORE_INFO_REQUESTED: "Yêu cầu bổ sung",
  JOB_APPROVED: "Duyệt tin",
  JOB_REJECTED: "Từ chối tin",
  JOB_FLAGGED: "Gắn cờ tin",
  JOB_UNFLAGGED: "Bỏ gắn cờ",
  JOB_CLOSED: "Đóng tin",
};

function formatDateTime(value?: string | null): string {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function targetLabel(log: AdminAuditLogResponse): string {
  const label = log.targetType === "COMPANY" ? "Công ty" : log.targetType === "JOB" ? "Tin tuyển dụng" : "Người dùng";
  return `${label} ${log.targetId.slice(0, 8)}`;
}

export default function AdminAuditLogsPage() {
  const [data, setData] = useState<AdminPageResponse<AdminAuditLogResponse> | null>(null);
  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");
  const [targetId, setTargetId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const result = await getAdminAuditLogs({
          action: action || undefined,
          targetType: targetType || undefined,
          targetId: targetId.trim() || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        });
        if (active) setData(result);
      } catch (error) {
        if (!active) return;
        setErrorMessage(error instanceof ApiError ? error.message : "Không thể tải nhật ký admin.");
      } finally {
        if (active) setLoading(false);
      }
    };

    const timeout = window.setTimeout(() => void load(), 250);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [action, fromDate, targetId, targetType, toDate]);

  const logs = useMemo(() => data?.items ?? [], [data?.items]);
  const stats = useMemo(() => {
    return {
      total: data?.totalItems ?? 0,
      company: logs.filter((log) => log.targetType === "COMPANY").length,
      job: logs.filter((log) => log.targetType === "JOB").length,
      user: logs.filter((log) => log.targetType === "USER").length,
    };
  }, [data?.totalItems, logs]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">Nhật ký admin</h1>
        <p className="text-on-surface-variant max-w-2xl">
          Theo dõi các hành động kiểm duyệt tài khoản, công ty và tin tuyển dụng trên hệ thống.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-outline-variant/10">
          <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-2">Tổng log</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold">{stats.total}</span>
            <History className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-outline-variant/10">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-2">Công ty</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold">{stats.company}</span>
            <ShieldCheck className="h-6 w-6 text-secondary" />
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-outline-variant/10">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-2">Tin tuyển dụng</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold">{stats.job}</span>
            <Filter className="h-6 w-6 text-amber-600" />
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-outline-variant/10">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Người dùng</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold">{stats.user}</span>
            <Search className="h-6 w-6 text-on-surface-variant" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 rounded-2xl bg-surface-container-low/50 p-4 border border-outline-variant/10">
        <select value={action} onChange={(event) => setAction(event.target.value)} className="rounded-xl bg-surface-container-lowest border border-outline-variant/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20">
          <option value="">Tất cả hành động</option>
          {Object.entries(ACTION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select value={targetType} onChange={(event) => setTargetType(event.target.value)} className="rounded-xl bg-surface-container-lowest border border-outline-variant/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20">
          <option value="">Tất cả đối tượng</option>
          <option value="USER">Người dùng</option>
          <option value="COMPANY">Công ty</option>
          <option value="JOB">Tin tuyển dụng</option>
        </select>
        <input value={targetId} onChange={(event) => setTargetId(event.target.value)} className="rounded-xl bg-surface-container-lowest border border-outline-variant/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="ID đối tượng" />
        <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="rounded-xl bg-surface-container-lowest border border-outline-variant/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
        <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="rounded-xl bg-surface-container-lowest border border-outline-variant/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm font-medium text-error">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </div>
      )}

      <div className="glass-card rounded-2xl overflow-hidden border border-outline-variant/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[920px]">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant/10">
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">Thời gian</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">Admin</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">Hành động</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">Đối tượng</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">Lý do</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr>
                  <td className="px-6 py-8 text-on-surface-variant" colSpan={5}>Đang tải nhật ký...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-on-surface-variant" colSpan={5}>Chưa có nhật ký phù hợp.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-5 text-sm text-on-surface-variant">{formatDateTime(log.createdAt)}</td>
                    <td className="px-6 py-5 font-semibold text-on-surface">{log.adminEmail ?? "--"}</td>
                    <td className="px-6 py-5">
                      <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-on-surface-variant">{targetLabel(log)}</td>
                    <td className="px-6 py-5 text-sm text-on-surface-variant">{log.reason || "--"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
