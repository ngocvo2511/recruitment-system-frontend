"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Ban,
  Building2,
  CheckCircle,
  ExternalLink,
  FileText,
  Mail,
  Search,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import {
  ApiError,
  getAdminCompanies,
  rejectAdminCompany,
  requestMoreInfoAdminCompany,
  verifyAdminCompany,
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

export default function CompanyModerationPage() {
  const [data, setData] = useState<AdminPageResponse<AdminCompanyResponse> | null>(null);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<CompanyStatus | "ALL">("PENDING");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const result = await getAdminCompanies({
          keyword: keyword.trim() || undefined,
          status,
        });
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

  const companies = useMemo(() => data?.items ?? [], [data?.items]);
  const stats = useMemo(() => {
    return {
      pending: companies.filter((company) => company.status === "PENDING").length,
      active: companies.filter((company) => company.status === "ACTIVE").length,
      rejected: companies.filter((company) => company.status === "REJECTED").length,
      total: data?.totalItems ?? 0,
    };
  }, [companies, data?.totalItems]);

  const updateCompanyInList = (updated: AdminCompanyResponse) => {
    setData((current) => {
      if (!current) return current;
      return {
        ...current,
        items: current.items.map((item) => (item.id === updated.id ? updated : item)),
      };
    });
  };

  const handleAction = async (
    company: AdminCompanyResponse,
    action: "verify" | "reject" | "info",
  ) => {
    setUpdatingId(company.id);
    setErrorMessage(null);
    try {
      const updated =
        action === "verify"
          ? await verifyAdminCompany(company.id, "Admin xác minh hồ sơ công ty.")
          : action === "reject"
            ? await rejectAdminCompany(company.id, "Admin từ chối hồ sơ công ty.")
            : await requestMoreInfoAdminCompany(company.id, "Admin yêu cầu bổ sung thông tin xác minh công ty.");
      updateCompanyInList(updated);
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
        <p className="text-on-surface-variant max-w-2xl">
          Xác minh công ty tuyển dụng, duyệt hồ sơ doanh nghiệp và kiểm soát quyền đăng tin trên nền tảng.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl shadow-sm border border-outline-variant/10">
          <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-2">Đang chờ</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold">{stats.pending}</span>
            <ShieldAlert className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl shadow-sm border border-outline-variant/10 border-l-4 border-l-secondary">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-2">Đã xác minh</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold">{stats.active}</span>
            <ShieldCheck className="h-6 w-6 text-secondary" />
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl shadow-sm border border-outline-variant/10">
          <span className="text-xs font-bold text-error uppercase tracking-widest block mb-2">Từ chối</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold">{stats.rejected}</span>
            <Ban className="h-6 w-6 text-error" />
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl shadow-sm border border-outline-variant/10">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Tổng kết quả</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold">{stats.total}</span>
            <Building2 className="h-6 w-6 text-on-surface-variant" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 rounded-2xl bg-surface-container-low/50 p-4 border border-outline-variant/10">
        <div className="lg:col-span-3 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="w-full rounded-xl bg-surface-container-lowest border border-outline-variant/10 py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Tìm theo tên công ty, email, mã số thuế, ngành nghề..."
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as CompanyStatus | "ALL")}
          className="rounded-xl bg-surface-container-lowest border border-outline-variant/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xác minh</option>
          <option value="ACTIVE">Đã xác minh</option>
          <option value="REJECTED">Từ chối</option>
          <option value="BLOCKED">Bị chặn</option>
        </select>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm font-medium text-error">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="glass-panel rounded-2xl p-8 text-on-surface-variant">Đang tải danh sách công ty...</div>
        ) : companies.length === 0 ? (
          <div className="glass-panel rounded-2xl p-10 text-center text-on-surface-variant">
            Không có công ty phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          companies.map((company) => (
            <div
              key={company.id}
              className="glass-panel group p-6 rounded-[1.5rem] border border-outline-variant/10 flex flex-col lg:flex-row items-start lg:items-center gap-6 transition-all hover:shadow-xl hover:shadow-blue-500/5 hover:border-primary/20"
            >
              <div className="w-16 h-16 rounded-2xl bg-white p-2 flex items-center justify-center overflow-hidden shrink-0 border border-outline-variant/10">
                <Building2 className="h-9 w-9 text-primary" />
              </div>

              <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
                <div>
                  <h2 className="text-on-surface font-bold text-lg leading-tight">{company.name}</h2>
                  {company.website ? (
                    <a className="text-primary text-sm font-medium flex items-center gap-1 hover:underline" href={company.website} target="_blank" rel="noreferrer">
                      Website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <p className="text-xs text-on-surface-variant">Chưa có website</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Ngành nghề</p>
                  <p className="text-on-surface font-medium text-sm">{company.industry ?? "--"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Chủ sở hữu</p>
                  <p className="text-on-surface font-medium text-sm">{company.ownerName ?? company.ownerEmail ?? "--"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Trạng thái</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusClass(company.status)}`}>
                    {STATUS_LABELS[company.status]}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Hồ sơ</p>
                  <p className="text-sm text-on-surface-variant flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    MST: {company.taxCode ?? "--"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0 w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-outline-variant/10">
                <button
                  type="button"
                  onClick={() => void handleAction(company, "verify")}
                  disabled={updatingId === company.id || company.status === "ACTIVE"}
                  className="flex-1 lg:flex-none px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-br from-primary to-primary-container hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:hover:scale-100"
                >
                  <CheckCircle className="w-4 h-4" />
                  Xác minh
                </button>
                <button
                  type="button"
                  onClick={() => void handleAction(company, "info")}
                  disabled={updatingId === company.id}
                  className="flex-1 lg:flex-none px-4 py-2 rounded-full text-sm font-bold text-secondary bg-secondary/10 hover:bg-secondary/20 transition-colors active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Mail className="w-4 h-4" />
                  Yêu cầu bổ sung
                </button>
                <button
                  type="button"
                  onClick={() => void handleAction(company, "reject")}
                  disabled={updatingId === company.id || company.status === "REJECTED"}
                  className="p-2 rounded-full text-error hover:bg-error/10 transition-colors disabled:opacity-50"
                  aria-label={`Từ chối ${company.name}`}
                >
                  <Ban className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
