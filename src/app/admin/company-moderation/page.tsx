"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Ban, Building2, CheckCircle, ExternalLink, Eye, FileText, Mail, Search, ShieldAlert, ShieldCheck, X } from "lucide-react";
import {
  ApiError,
  getAdminAuditLogs,
  getAdminCompanies,
  rejectAdminCompany,
  requestMoreInfoAdminCompany,
  verifyAdminCompany,
  type AdminAuditLogResponse,
  type AdminCompanyResponse,
  type AdminPageResponse,
  type CompanyStatus,
} from "@/lib/api/admin";

const STATUS_LABELS: Record<CompanyStatus, string> = {
  PENDING: "Chờ xác minh",
  ACTIVE: "Đã xác minh",
  REJECTED: "Từ chối",
  BLOCKED: "Bị chặn",
};

function statusClass(status: CompanyStatus): string {
  if (status === "ACTIVE") return "bg-emerald-100 text-emerald-700";
  if (status === "PENDING") return "bg-amber-100 text-amber-700";
  if (status === "REJECTED") return "bg-error/10 text-error";
  return "bg-slate-100 text-slate-700";
}

function formatDate(value?: string | null): string {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("vi-VN");
}

export default function CompanyModerationPage() {
  const [data, setData] = useState<AdminPageResponse<AdminCompanyResponse> | null>(null);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<CompanyStatus | "ALL">("PENDING");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<AdminCompanyResponse | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogResponse[]>([]);
  const [pendingAction, setPendingAction] = useState<{ company: AdminCompanyResponse; action: "verify" | "reject" | "info" } | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const result = await getAdminCompanies({ keyword: keyword.trim() || undefined, status });
        if (active) setData(result);
      } catch (error) {
        if (!active) return;
        setErrorMessage(error instanceof ApiError ? error.message : "Không thể tải danh sách công ty.");
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
    if (!selectedCompany) {
      return;
    }
    let active = true;
    const loadAuditLogs = async () => {
      try {
        const result = await getAdminAuditLogs({ targetType: "COMPANY", targetId: selectedCompany.id, size: 10 });
        if (active) setAuditLogs(result.items);
      } catch {
        if (active) setAuditLogs([]);
      }
    };
    void loadAuditLogs();
    return () => {
      active = false;
    };
  }, [selectedCompany]);

  const companies = useMemo(() => data?.items ?? [], [data?.items]);
  const stats = useMemo(() => ({
    pending: companies.filter((company) => company.status === "PENDING").length,
    active: companies.filter((company) => company.status === "ACTIVE").length,
    rejected: companies.filter((company) => company.status === "REJECTED").length,
    total: data?.totalItems ?? 0,
  }), [companies, data?.totalItems]);

  const updateCompanyInList = (updated: AdminCompanyResponse) => {
    setData((current) => current ? { ...current, items: current.items.map((item) => (item.id === updated.id ? updated : item)) } : current);
    setSelectedCompany((current) => (current?.id === updated.id ? updated : current));
  };

  const submitAction = async () => {
    if (!pendingAction) return;
    const isReasonRequired = pendingAction.action !== "verify";
    if (isReasonRequired && !reason.trim()) {
      setErrorMessage("Vui lòng nhập lý do kiểm duyệt.");
      return;
    }
    const { company, action } = pendingAction;
    setUpdatingId(company.id);
    setErrorMessage(null);
    try {
      const updated =
        action === "verify"
          ? await verifyAdminCompany(company.id, reason.trim())
          : action === "reject"
            ? await rejectAdminCompany(company.id, reason.trim())
            : await requestMoreInfoAdminCompany(company.id, reason.trim());
      updateCompanyInList(updated);
      setPendingAction(null);
      setReason("");
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Không thể cập nhật trạng thái công ty.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">Kiểm duyệt công ty</h1>
        <p className="text-on-surface-variant max-w-2xl">Xác minh hồ sơ doanh nghiệp, kiểm soát quyền đăng tin và theo dõi lịch sử admin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-outline-variant/10"><span className="text-xs font-bold text-primary uppercase tracking-widest block mb-2">Đang chờ</span><div className="flex items-end justify-between"><span className="text-3xl font-extrabold">{stats.pending}</span><ShieldAlert className="h-6 w-6 text-primary" /></div></div>
        <div className="glass-panel p-6 rounded-2xl border border-outline-variant/10"><span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-2">Đã xác minh</span><div className="flex items-end justify-between"><span className="text-3xl font-extrabold">{stats.active}</span><ShieldCheck className="h-6 w-6 text-secondary" /></div></div>
        <div className="glass-panel p-6 rounded-2xl border border-outline-variant/10"><span className="text-xs font-bold text-error uppercase tracking-widest block mb-2">Từ chối</span><div className="flex items-end justify-between"><span className="text-3xl font-extrabold">{stats.rejected}</span><Ban className="h-6 w-6 text-error" /></div></div>
        <div className="glass-panel p-6 rounded-2xl border border-outline-variant/10"><span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Tổng kết quả</span><div className="flex items-end justify-between"><span className="text-3xl font-extrabold">{stats.total}</span><Building2 className="h-6 w-6 text-on-surface-variant" /></div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 rounded-2xl bg-surface-container-low/50 p-4 border border-outline-variant/10">
        <div className="lg:col-span-3 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} className="w-full rounded-xl bg-surface-container-lowest border border-outline-variant/10 py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Tìm theo tên công ty, email, mã số thuế, ngành nghề..." />
        </div>
        <select value={status} onChange={(event) => setStatus(event.target.value as CompanyStatus | "ALL")} className="rounded-xl bg-surface-container-lowest border border-outline-variant/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20">
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xác minh</option>
          <option value="ACTIVE">Đã xác minh</option>
          <option value="REJECTED">Từ chối</option>
          <option value="BLOCKED">Bị chặn</option>
        </select>
      </div>

      {errorMessage && <div className="flex items-center gap-2 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm font-medium text-error"><AlertCircle className="w-4 h-4" />{errorMessage}</div>}

      <div className="space-y-4">
        {loading ? <div className="glass-panel rounded-2xl p-8 text-on-surface-variant">Đang tải danh sách công ty...</div> : companies.length === 0 ? <div className="glass-panel rounded-2xl p-10 text-center text-on-surface-variant">Không có công ty phù hợp với bộ lọc hiện tại.</div> : companies.map((company) => (
          <div key={company.id} className="glass-panel p-6 rounded-2xl border border-outline-variant/10 flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white p-2 flex items-center justify-center shrink-0 border border-outline-variant/10"><Building2 className="h-9 w-9 text-primary" /></div>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
              <div><h2 className="font-bold text-lg">{company.name}</h2>{company.website ? <a className="text-primary text-sm font-medium flex items-center gap-1 hover:underline" href={company.website} target="_blank" rel="noreferrer">Website<ExternalLink className="w-3 h-3" /></a> : <p className="text-xs text-on-surface-variant">Chưa có website</p>}</div>
              <div><p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Ngành nghề</p><p className="font-medium text-sm">{company.industry ?? "--"}</p></div>
              <div><p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Chủ sở hữu</p><p className="font-medium text-sm">{company.ownerName ?? company.ownerEmail ?? "--"}</p></div>
              <div><p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Trạng thái</p><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusClass(company.status)}`}>{STATUS_LABELS[company.status]}</span></div>
              <div><p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Hồ sơ</p><p className="text-sm text-on-surface-variant flex items-center gap-1"><FileText className="w-4 h-4" />MST: {company.taxCode ?? "--"}</p></div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0 w-full lg:w-auto">
              <button type="button" onClick={() => setSelectedCompany(company)} className="px-4 py-2 rounded-full text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 flex items-center gap-2"><Eye className="w-4 h-4" />Chi tiết</button>
              <button type="button" onClick={() => { setPendingAction({ company, action: "verify" }); setReason(""); }} disabled={updatingId === company.id || company.status === "ACTIVE"} className="px-4 py-2 rounded-full text-sm font-bold text-white bg-primary disabled:opacity-50 flex items-center gap-2"><CheckCircle className="w-4 h-4" />Xác minh</button>
              <button type="button" onClick={() => { setPendingAction({ company, action: "info" }); setReason(""); }} disabled={updatingId === company.id} className="px-4 py-2 rounded-full text-sm font-bold text-secondary bg-secondary/10 disabled:opacity-50 flex items-center gap-2"><Mail className="w-4 h-4" />Bổ sung</button>
              <button type="button" onClick={() => { setPendingAction({ company, action: "reject" }); setReason(""); }} disabled={updatingId === company.id || company.status === "REJECTED"} className="p-2 rounded-full text-error hover:bg-error/10 disabled:opacity-50" aria-label={`Từ chối ${company.name}`}><Ban className="w-5 h-5" /></button>
            </div>
          </div>
        ))}
      </div>

      {selectedCompany && (
        <div className="fixed inset-y-0 right-0 z-[80] w-full max-w-lg bg-white shadow-2xl border-l border-outline-variant/10 p-6 overflow-y-auto">
          <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-extrabold">Chi tiết công ty</h2><p className="text-sm text-on-surface-variant">{selectedCompany.name}</p></div><button type="button" onClick={() => setSelectedCompany(null)} className="rounded-full p-2 hover:bg-surface-container"><X className="h-5 w-5" /></button></div>
          <div className="mt-6 grid grid-cols-1 gap-4">
            {[
              ["Email", selectedCompany.email],
              ["Điện thoại", selectedCompany.phone],
              ["Địa chỉ", [selectedCompany.address, selectedCompany.city, selectedCompany.country].filter(Boolean).join(", ")],
              ["Ngành nghề", selectedCompany.industry],
              ["Quy mô", selectedCompany.companySize?.toString()],
              ["Mã số thuế", selectedCompany.taxCode],
              ["Giấy phép", selectedCompany.businessLicense],
              ["Thành viên", `${selectedCompany.memberCount} đã duyệt, ${selectedCompany.pendingMemberCount} chờ`],
              ["Tin đang mở", selectedCompany.openJobCount.toString()],
            ].map(([label, value]) => <div key={label} className="rounded-xl bg-surface-container-low/60 p-4"><p className="text-xs font-bold uppercase text-on-surface-variant">{label}</p><p className="mt-1 text-sm font-semibold">{value || "--"}</p></div>)}
            <div className="rounded-xl bg-surface-container-low/60 p-4"><p className="text-xs font-bold uppercase text-on-surface-variant">Mô tả</p><p className="mt-1 text-sm text-on-surface-variant">{selectedCompany.description || "--"}</p></div>
            <div><h3 className="mb-3 text-sm font-bold">Lịch sử admin</h3><div className="space-y-2">{auditLogs.length === 0 ? <p className="text-sm text-on-surface-variant">Chưa có lịch sử kiểm duyệt.</p> : auditLogs.map((log) => <div key={log.id} className="rounded-xl border border-outline-variant/10 p-3"><p className="text-xs font-bold text-primary">{log.action}</p><p className="text-sm text-on-surface-variant">{log.reason || "--"}</p><p className="text-[11px] text-on-surface-variant">{formatDate(log.createdAt)}</p></div>)}</div></div>
          </div>
        </div>
      )}

      {pendingAction && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-extrabold">{pendingAction.action === "verify" ? "Xác minh công ty" : pendingAction.action === "reject" ? "Từ chối công ty" : "Yêu cầu bổ sung"}</h2>
            <p className="mt-1 text-sm text-on-surface-variant">{pendingAction.company.name}</p>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-4 min-h-28 w-full rounded-xl border border-outline-variant/10 p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              placeholder={pendingAction.action === "verify" ? "Ghi chú xác minh, có thể để trống..." : "Nhập lý do hoặc ghi chú gửi cho recruiter..."}
            />
            {pendingAction.action === "verify" ? (
              <p className="mt-2 text-xs text-on-surface-variant">Xác minh công ty không bắt buộc nhập lý do. Ghi chú chỉ dùng cho audit log nếu cần.</p>
            ) : (
              <p className="mt-2 text-xs text-error">Từ chối hoặc yêu cầu bổ sung cần có lý do rõ ràng.</p>
            )}
            <div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setPendingAction(null)} className="rounded-xl px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container">Hủy</button><button type="button" onClick={() => void submitAction()} className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-on-primary">Xác nhận</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
