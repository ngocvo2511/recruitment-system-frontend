"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Ban, CheckCircle2, Eye, Search, ShieldCheck, UserCheck, Users, X } from "lucide-react";
import {
  ApiError,
  disableAdminUser,
  enableAdminUser,
  getAdminAuditLogs,
  getAdminUsers,
  type AdminAuditLogResponse,
  type AdminPageResponse,
  type AdminUserResponse,
} from "@/lib/api/admin";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  RECRUITER: "Nhà tuyển dụng",
  CANDIDATE: "Ứng viên",
};

function formatDate(value?: string | null): string {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("vi-VN");
}

export default function AdminUsersPage() {
  const [data, setData] = useState<AdminPageResponse<AdminUserResponse> | null>(null);
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState("ALL");
  const [enabled, setEnabled] = useState<"ALL" | "true" | "false">("ALL");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogResponse[]>([]);
  const [pendingUser, setPendingUser] = useState<AdminUserResponse | null>(null);
  const [reason, setReason] = useState("");

  const enabledFilter = useMemo(() => {
    if (enabled === "ALL") return null;
    return enabled === "true";
  }, [enabled]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const result = await getAdminUsers({
          keyword: keyword.trim() || undefined,
          role,
          enabled: enabledFilter,
        });
        if (active) setData(result);
      } catch (error) {
        if (!active) return;
        setErrorMessage(error instanceof ApiError ? error.message : "Không thể tải danh sách người dùng.");
      } finally {
        if (active) setLoading(false);
      }
    };

    const timeout = window.setTimeout(() => void load(), 250);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [enabledFilter, keyword, role]);

  useEffect(() => {
    if (!selectedUser) {
      return;
    }
    let active = true;
    const loadAuditLogs = async () => {
      try {
        const result = await getAdminAuditLogs({ targetType: "USER", targetId: selectedUser.id, size: 10 });
        if (active) setAuditLogs(result.items);
      } catch {
        if (active) setAuditLogs([]);
      }
    };
    void loadAuditLogs();
    return () => {
      active = false;
    };
  }, [selectedUser]);

  const users = useMemo(() => data?.items ?? [], [data?.items]);

  const updateUserInList = (updated: AdminUserResponse) => {
    setData((current) => {
      if (!current) return current;
      return {
        ...current,
        items: current.items.map((item) => (item.id === updated.id ? updated : item)),
      };
    });
    setSelectedUser((current) => (current?.id === updated.id ? updated : current));
  };

  const submitToggle = async () => {
    if (!pendingUser) return;
    if (!reason.trim()) {
      setErrorMessage("Vui lòng nhập lý do kiểm duyệt.");
      return;
    }

    setUpdatingId(pendingUser.id);
    setErrorMessage(null);
    try {
      const updated = pendingUser.enabled
        ? await disableAdminUser(pendingUser.id, reason.trim())
        : await enableAdminUser(pendingUser.id, reason.trim());
      updateUserInList(updated);
      setPendingUser(null);
      setReason("");
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Không thể cập nhật trạng thái người dùng.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      <div className="mb-10 flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">Quản lý người dùng</h1>
        <p className="text-on-surface-variant max-w-2xl">
          Theo dõi tài khoản ứng viên, nhà tuyển dụng và admin trên toàn hệ thống.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 rounded-2xl border border-outline-variant/10">
          <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-2">Tổng kết quả</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold">{data?.totalItems ?? 0}</span>
            <Users className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-outline-variant/10">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-2">Đang hoạt động</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold">{users.filter((user) => user.enabled).length}</span>
            <UserCheck className="h-6 w-6 text-secondary" />
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-outline-variant/10">
          <span className="text-xs font-bold text-error uppercase tracking-widest block mb-2">Bị khóa</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold">{users.filter((user) => !user.enabled).length}</span>
            <Ban className="h-6 w-6 text-error" />
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 lg:grid-cols-4 gap-4 rounded-2xl bg-surface-container-low/50 p-4 border border-outline-variant/10">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="w-full rounded-xl bg-surface-container-lowest border border-outline-variant/10 py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Tìm theo email..."
          />
        </div>
        <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-xl bg-surface-container-lowest border border-outline-variant/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20">
          <option value="ALL">Tất cả vai trò</option>
          <option value="CANDIDATE">Ứng viên</option>
          <option value="RECRUITER">Nhà tuyển dụng</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select value={enabled} onChange={(event) => setEnabled(event.target.value as "ALL" | "true" | "false")} className="rounded-xl bg-surface-container-lowest border border-outline-variant/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20">
          <option value="ALL">Tất cả trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Bị khóa</option>
        </select>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm font-medium text-error">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </div>
      )}

      <div className="glass-card rounded-2xl overflow-hidden border border-outline-variant/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[860px]">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant/10">
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">Email</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">Vai trò</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">Trạng thái</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">Ngày tạo</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr><td className="px-6 py-8 text-on-surface-variant" colSpan={5}>Đang tải người dùng...</td></tr>
              ) : users.length === 0 ? (
                <tr><td className="px-6 py-8 text-center text-on-surface-variant" colSpan={5}>Không có người dùng phù hợp.</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-primary/5 transition-colors">
                  <td className="px-6 py-5 font-semibold text-on-surface">{user.email}</td>
                  <td className="px-6 py-5 text-sm text-on-surface-variant">{ROLE_LABELS[user.role ?? ""] ?? user.role ?? "--"}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${user.enabled ? "bg-emerald-100 text-emerald-700" : "bg-error/10 text-error"}`}>
                      {user.enabled ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                      {user.enabled ? "Đang hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-on-surface-variant">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-5 text-right">
                    <button type="button" onClick={() => setSelectedUser(user)} className="mr-2 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 transition">
                      <Eye className="h-4 w-4" />
                      Chi tiết
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPendingUser(user);
                        setReason("");
                      }}
                      disabled={updatingId === user.id}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition disabled:opacity-60 ${user.enabled ? "bg-error/10 text-error hover:bg-error/20" : "bg-primary/10 text-primary hover:bg-primary/20"}`}
                    >
                      {user.enabled ? <Ban className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      {updatingId === user.id ? "Đang xử lý..." : user.enabled ? "Khóa" : "Mở khóa"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-y-0 right-0 z-[80] w-full max-w-md bg-white shadow-2xl border-l border-outline-variant/10 p-6 overflow-y-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-on-surface">Chi tiết người dùng</h2>
              <p className="text-sm text-on-surface-variant break-all">{selectedUser.email}</p>
            </div>
            <button type="button" onClick={() => setSelectedUser(null)} className="rounded-full p-2 hover:bg-surface-container"><X className="h-5 w-5" /></button>
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-xl bg-surface-container-low/60 p-4"><p className="text-xs font-bold uppercase text-on-surface-variant">Vai trò</p><p className="mt-1 font-semibold">{ROLE_LABELS[selectedUser.role ?? ""] ?? selectedUser.role ?? "--"}</p></div>
            <div className="rounded-xl bg-surface-container-low/60 p-4"><p className="text-xs font-bold uppercase text-on-surface-variant">Trạng thái</p><p className="mt-1 font-semibold">{selectedUser.enabled ? "Đang hoạt động" : "Bị khóa"}</p></div>
            <div className="rounded-xl bg-surface-container-low/60 p-4"><p className="text-xs font-bold uppercase text-on-surface-variant">Ngày tạo</p><p className="mt-1 font-semibold">{formatDate(selectedUser.createdAt)}</p></div>
            <div>
              <h3 className="mb-3 text-sm font-bold text-on-surface">Lịch sử admin</h3>
              <div className="space-y-2">
                {auditLogs.length === 0 ? <p className="text-sm text-on-surface-variant">Chưa có lịch sử kiểm duyệt.</p> : auditLogs.map((log) => (
                  <div key={log.id} className="rounded-xl border border-outline-variant/10 p-3">
                    <p className="text-xs font-bold text-primary">{log.action}</p>
                    <p className="text-sm text-on-surface-variant">{log.reason || "--"}</p>
                    <p className="text-[11px] text-on-surface-variant">{formatDate(log.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {pendingUser && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-extrabold text-on-surface">{pendingUser.enabled ? "Khóa tài khoản" : "Mở khóa tài khoản"}</h2>
            <p className="mt-1 text-sm text-on-surface-variant break-all">{pendingUser.email}</p>
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} className="mt-4 min-h-28 w-full rounded-xl border border-outline-variant/10 p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Nhập lý do kiểm duyệt..." />
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setPendingUser(null)} className="rounded-xl px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container">Hủy</button>
              <button type="button" onClick={() => void submitToggle()} className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-on-primary">Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
