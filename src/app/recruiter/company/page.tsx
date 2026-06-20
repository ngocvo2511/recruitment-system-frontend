"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Building2, Check, ClipboardList, ImageUp, Loader2, MailPlus, Pencil, Save, Trash2, UserCheck, Users, X } from "lucide-react";
import {
  approveCompanyMember,
  cancelCompanyInvite,
  getCompanyInvites,
  getCompanyMembers,
  getMyCompany,
  getPendingCompanyMembers,
  inviteRecruiter,
  rejectCompanyMember,
  removeCompanyMember,
  updateCompany,
  uploadCompanyLogo,
  type CompanyRequest,
  type CompanyDashboardResponse,
  type CompanyInviteResponse,
  type CompanyMemberResponse,
  type CompanyStatus,
} from "@/lib/api/company";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";

const statusLabel: Record<CompanyStatus, string> = {
  PENDING: "Đang chờ duyệt",
  ACTIVE: "Đang hoạt động",
  REJECTED: "Bị từ chối",
  BLOCKED: "Bị khóa",
};

const statusClass: Record<CompanyStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  ACTIVE: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  BLOCKED: "bg-slate-100 text-slate-700 border-slate-200",
};

const inviteStatusLabel = {
  PENDING: "Đang chờ",
  ACCEPTED: "Đã chấp nhận",
  CANCELLED: "Đã hủy",
};

const emptyCompanyForm: CompanyRequest = {
  name: "",
  website: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  description: "",
  industry: "",
  companySize: 0,
  taxCode: "",
  businessLicense: "",
};

function toCompanyForm(company: CompanyDashboardResponse): CompanyRequest {
  return {
    name: company.name ?? "",
    website: company.website ?? "",
    email: company.email ?? "",
    phone: company.phone ?? "",
    address: company.address ?? "",
    city: company.city ?? "",
    country: company.country ?? "",
    description: company.description ?? "",
    industry: company.industry ?? "",
    companySize: company.companySize ?? 0,
    taxCode: company.taxCode ?? "",
    businessLicense: company.businessLicense ?? "",
    logoUrl: company.logoUrl ?? "",
  };
}

function formatDate(value?: string | null) {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

export default function RecruiterCompanyPage() {
  const [company, setCompany] = useState<CompanyDashboardResponse | null>(null);
  const [members, setMembers] = useState<CompanyMemberResponse[]>([]);
  const [pendingMembers, setPendingMembers] = useState<CompanyMemberResponse[]>([]);
  const [invites, setInvites] = useState<CompanyInviteResponse[]>([]);
  const [activeTab, setActiveTab] = useState("info");
  const [form, setForm] = useState<CompanyRequest>(emptyCompanyForm);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const isOwner = company?.currentUserCompanyRole === "OWNER";

  const stats = useMemo(() => [
    { label: "Nhà tuyển dụng", value: company?.memberCount ?? 0, icon: Users },
    { label: "Job đang mở", value: company?.openJobCount ?? 0, icon: ClipboardList },
    { label: "Ứng viên pipeline", value: company?.pipelineCandidateCount ?? 0, icon: UserCheck },
    { label: "Yêu cầu chờ duyệt", value: company?.pendingRequestCount ?? 0, icon: MailPlus },
  ], [company]);

  const loadCompanyData = async () => {
    setLoading(true);
    setError("");
    try {
      const currentCompany = await getMyCompany();
      const [memberList, pendingList, inviteList] = await Promise.all([
        getCompanyMembers(currentCompany.companyId),
        currentCompany.currentUserCompanyRole === "OWNER" ? getPendingCompanyMembers(currentCompany.companyId) : Promise.resolve([]),
        currentCompany.currentUserCompanyRole === "OWNER" ? getCompanyInvites(currentCompany.companyId) : Promise.resolve([]),
      ]);
      setCompany(currentCompany);
      setForm(toCompanyForm(currentCompany));
      setMembers(memberList);
      setPendingMembers(pendingList);
      setInvites(inviteList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải thông tin công ty.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCompanyData();
  }, []);

  const saveCompany = async (event: FormEvent) => {
    event.preventDefault();
    if (!company) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const updated = await updateCompany(company.companyId, form);
      setCompany(updated);
      setForm(toCompanyForm(updated));
      setEditing(false);
      setNotice("Đã cập nhật thông tin công ty.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật thông tin công ty.");
    } finally {
      setSaving(false);
    }
  };

  const changeCompanyLogo = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!company || !file) return;
    setLogoUploading(true);
    setError("");
    setNotice("");
    try {
      const updated = await uploadCompanyLogo(company.companyId, file);
      setCompany(updated);
      setForm(toCompanyForm(updated));
      setNotice("Đã cập nhật logo công ty.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật logo công ty.");
    } finally {
      setLogoUploading(false);
    }
  };

  const processMember = async (userId: string, action: "approve" | "reject") => {
    if (!company) return;
    setActionId(userId);
    setError("");
    setNotice("");
    try {
      if (action === "approve") {
        await approveCompanyMember(company.companyId, userId);
        setNotice("Đã phê duyệt yêu cầu tham gia.");
      } else {
        await rejectCompanyMember(company.companyId, userId);
        setNotice("Đã từ chối yêu cầu tham gia.");
      }
      await loadCompanyData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xử lý yêu cầu.");
    } finally {
      setActionId(null);
    }
  };

  const removeMember = async (userId: string) => {
    if (!company) return;
    setActionId(userId);
    setError("");
    setNotice("");
    try {
      await removeCompanyMember(company.companyId, userId);
      setMembers((current) => current.filter((member) => member.userId !== userId));
      setCompany({ ...company, memberCount: Math.max(0, company.memberCount - 1) });
      setNotice("Đã xóa thành viên khỏi công ty.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa thành viên.");
    } finally {
      setActionId(null);
    }
  };

  const submitInvite = async (event: FormEvent) => {
    event.preventDefault();
    if (!company) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const invite = await inviteRecruiter(company.companyId, inviteEmail);
      setInvites((current) => [invite, ...current]);
      setInviteEmail("");
      setNotice("Đã tạo lời mời nhà tuyển dụng.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi lời mời.");
    } finally {
      setSaving(false);
    }
  };

  const cancelInvite = async (inviteId: string) => {
    if (!company) return;
    setActionId(inviteId);
    setError("");
    setNotice("");
    try {
      const updated = await cancelCompanyInvite(company.companyId, inviteId);
      setInvites((current) => current.map((invite) => invite.id === inviteId ? updated : invite));
      setNotice("Đã hủy lời mời.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể hủy lời mời.");
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-72 flex items-center justify-center text-on-surface-variant">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Đang tải thông tin công ty...
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-4xl mx-auto text-center bg-white/70 rounded-lg border border-outline-variant/20 p-10">
        <Building2 className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-on-surface mb-2">Chưa có công ty</h1>
        <p className="text-on-surface-variant">Hãy tạo công ty hoặc gửi yêu cầu tham gia công ty hiện có để bắt đầu tuyển dụng.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up space-y-8">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 shrink-0 rounded-3xl">
            <div className="h-full w-full overflow-hidden rounded-3xl border border-outline-variant/20 bg-white shadow-sm">
            {company.logoUrl ? (
              // Company logos are user-managed external images from Cloudinary.
              // eslint-disable-next-line @next/next/no-img-element
              <img className="h-full w-full object-cover" src={company.logoUrl} alt={`Logo ${company.name}`} />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                <Building2 className="h-10 w-10" />
              </div>
            )}
            </div>
            {isOwner && (
              <label className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-lg transition-colors hover:bg-primary/90" title="Cập nhật logo công ty" aria-label="Cập nhật logo công ty">
                {logoUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageUp className="h-4 w-4" />}
                <input accept="image/jpeg,image/png,image/webp" className="hidden" disabled={logoUploading} onChange={changeCompanyLogo} type="file" />
              </label>
            )}
          </div>
          <div>
            <p className="text-primary font-bold text-xs tracking-[0.18em] uppercase mb-3">Quản lý công ty</p>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h1 className="text-4xl font-extrabold text-on-surface">{company.name}</h1>
              <span className={`px-3 py-1 rounded-full border text-xs font-bold ${statusClass[company.status]}`}>{statusLabel[company.status]}</span>
            </div>
            <p className="text-on-surface-variant">
              Vai trò hiện tại: <span className="font-semibold text-on-surface">{isOwner ? "Chủ sở hữu công ty" : "Nhà tuyển dụng"}</span>
            </p>
          </div>
        </div>
        {isOwner && (
          <button
            className="px-5 py-3 rounded-lg bg-primary text-white text-sm font-bold flex items-center gap-2 self-start"
            onClick={() => {
              setActiveTab("info");
              setEditing(true);
            }}
            type="button"
          >
            <Pencil className="w-4 h-4" />
            Chỉnh sửa thông tin
          </button>
        )}
      </header>

      {(error || notice) && (
        <div className={error ? "p-4 rounded-lg bg-red-50 text-red-600 border border-red-100 text-sm font-medium" : "p-4 rounded-lg bg-green-50 text-green-700 border border-green-100 text-sm font-medium"}>
          {error || notice}
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white/75 border border-outline-variant/15 rounded-lg p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{stat.label}</p>
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-extrabold text-on-surface">{stat.value}</p>
            </div>
          );
        })}
      </section>

      <nav className="flex flex-wrap gap-2 border-b border-outline-variant/20">
        {[
          ["info", "Thông tin công ty"],
          ["members", "Thành viên"],
          ["pending", "Yêu cầu chờ duyệt"],
          ["invites", "Lời mời"],
          ["settings", "Cài đặt"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={activeTab === key ? "px-4 py-3 text-sm font-bold text-primary border-b-2 border-primary" : "px-4 py-3 text-sm font-semibold text-on-surface-variant hover:text-on-surface"}
            onClick={() => setActiveTab(key)}
            type="button"
          >
            {label}
          </button>
        ))}
      </nav>

      {activeTab === "info" && (
        <section className="bg-white/75 rounded-lg border border-outline-variant/15 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-on-surface">Thông tin công ty</h2>
            {!editing && isOwner && (
              <button className="text-sm font-bold text-primary flex items-center gap-2" onClick={() => setEditing(true)} type="button">
                <Pencil className="w-4 h-4" />
                Chỉnh sửa
              </button>
            )}
          </div>

          {editing ? (
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={saveCompany}>
              {[
                ["name", "Tên công ty"],
                ["website", "Website"],
                ["email", "Email"],
                ["phone", "Số điện thoại"],
                ["address", "Địa chỉ"],
                ["city", "Thành phố"],
                ["country", "Quốc gia"],
                ["industry", "Ngành nghề"],
                ["taxCode", "Mã số thuế"],
                ["businessLicense", "Giấy phép kinh doanh"],
              ].map(([key, label]) => (
                <label key={key} className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</span>
                  <input
                    className="w-full rounded-lg bg-surface-container-lowest border border-outline-variant/25 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                    onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                    value={String(form[key as keyof CompanyRequest] ?? "")}
                  />
                </label>
              ))}
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Quy mô</span>
                <input
                  className="w-full rounded-lg bg-surface-container-lowest border border-outline-variant/25 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                  min={0}
                  onChange={(event) => setForm((current) => ({ ...current, companySize: Number(event.target.value) }))}
                  type="number"
                  value={form.companySize}
                />
              </label>
              <label className="md:col-span-2 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Mô tả</span>
                <textarea
                  className="w-full rounded-lg bg-surface-container-lowest border border-outline-variant/25 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  rows={4}
                  value={form.description}
                />
              </label>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button className="px-4 py-2 rounded-lg border border-outline-variant/30 text-sm font-bold" onClick={() => { setEditing(false); setForm(toCompanyForm(company)); }} type="button">
                  Hủy
                </button>
                <button className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-bold flex items-center gap-2 disabled:opacity-60" disabled={saving} type="submit">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              {[
                ["Tên công ty", company.name],
                ["Website", company.website],
                ["Email", company.email],
                ["Số điện thoại", company.phone],
                ["Địa chỉ", [company.address, company.city, company.country].filter(Boolean).join(", ")],
                ["Ngành nghề", company.industry],
                ["Quy mô", `${company.companySize} nhân sự`],
                ["Mã số thuế", company.taxCode],
                ["Giấy phép kinh doanh", company.businessLicense],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">{label}</p>
                  <p className="font-semibold text-on-surface break-words">{value || "Chưa cập nhật"}</p>
                </div>
              ))}
              <div className="md:col-span-2">
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Mô tả</p>
                <p className="text-on-surface leading-relaxed">{company.description || "Chưa có mô tả công ty."}</p>
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === "members" && (
        <section className="bg-white/75 rounded-lg border border-outline-variant/15 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/15 flex items-center justify-between">
            <h2 className="text-xl font-bold text-on-surface">Thành viên công ty</h2>
            {isOwner && <button className="text-sm font-bold text-primary" onClick={() => setActiveTab("invites")} type="button">Mời nhà tuyển dụng mới</button>}
          </div>
          {members.length === 0 ? (
            <div className="p-10 text-center text-on-surface-variant">Mời nhà tuyển dụng đầu tiên để bắt đầu xây dựng đội ngũ.</div>
          ) : (
            <div className="divide-y divide-outline-variant/15">
              {members.map((member) => (
                <div key={member.userId} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-on-surface">{member.fullName || "Chưa cập nhật tên"}</p>
                    <p className="text-sm text-on-surface-variant">{member.email || "Chưa có email"}</p>
                    <p className="text-xs text-on-surface-variant mt-1">Vai trò: {member.role === "OWNER" ? "Chủ sở hữu công ty" : "Nhà tuyển dụng"}</p>
                  </div>
                  {isOwner && member.role !== "OWNER" && (
                    <button className="px-3 py-2 rounded-lg border border-red-100 text-red-600 text-sm font-bold flex items-center gap-2 disabled:opacity-60" disabled={actionId === member.userId} onClick={() => removeMember(member.userId)} type="button">
                      <Trash2 className="w-4 h-4" />
                      Xóa thành viên
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "pending" && (
        <section className="bg-white/75 rounded-lg border border-outline-variant/15 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/15">
            <h2 className="text-xl font-bold text-on-surface">Yêu cầu chờ duyệt</h2>
          </div>
          {!isOwner ? (
            <div className="p-10 text-center text-on-surface-variant">Chỉ chủ sở hữu công ty có thể duyệt yêu cầu tham gia.</div>
          ) : pendingMembers.length === 0 ? (
            <div className="p-10 text-center text-on-surface-variant">Chưa có yêu cầu tham gia. Bạn có thể mời nhà tuyển dụng trong tab Lời mời.</div>
          ) : (
            <div className="divide-y divide-outline-variant/15">
              {pendingMembers.map((member) => (
                <div key={member.userId} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-on-surface">{member.fullName || "Chưa cập nhật tên"}</p>
                    <p className="text-sm text-on-surface-variant">{member.email || "Chưa có email"}</p>
                    <p className="text-xs text-on-surface-variant mt-1">Ngày gửi: {formatDate(member.requestedAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-bold flex items-center gap-2 disabled:opacity-60" disabled={actionId === member.userId} onClick={() => processMember(member.userId, "approve")} type="button">
                      <Check className="w-4 h-4" />
                      Phê duyệt
                    </button>
                    <button className="px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-bold border border-red-100 flex items-center gap-2 disabled:opacity-60" disabled={actionId === member.userId} onClick={() => processMember(member.userId, "reject")} type="button">
                      <X className="w-4 h-4" />
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "invites" && (
        <section className="bg-white/75 rounded-lg border border-outline-variant/15 p-6">
          <h2 className="text-xl font-bold text-on-surface mb-5">Lời mời nhà tuyển dụng</h2>
          {!isOwner ? (
            <p className="text-on-surface-variant">Chỉ chủ sở hữu công ty có thể gửi lời mời.</p>
          ) : (
            <form className="flex flex-col md:flex-row gap-3 mb-6" onSubmit={submitInvite}>
              <input className="flex-1 rounded-lg bg-surface-container-lowest border border-outline-variant/25 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30" onChange={(event) => setInviteEmail(event.target.value)} placeholder="email@congty.com" required type="email" value={inviteEmail} />
              <button className="px-5 py-3 rounded-lg bg-primary text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60" disabled={saving} type="submit">
                <MailPlus className="w-4 h-4" />
                Gửi lời mời
              </button>
            </form>
          )}
          {invites.length === 0 ? (
            <div className="py-8 text-center text-on-surface-variant">Chưa có lời mời nào được gửi.</div>
          ) : (
            <div className="divide-y divide-outline-variant/15">
              {invites.map((invite) => (
                <div key={invite.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-on-surface">{invite.email}</p>
                    <p className="text-xs text-on-surface-variant">Ngày gửi: {formatDate(invite.sentAt)} · Trạng thái: {inviteStatusLabel[invite.status]}</p>
                  </div>
                  {isOwner && invite.status === "PENDING" && (
                    <button className="px-3 py-2 rounded-lg border border-outline-variant/20 text-sm font-bold text-on-surface-variant disabled:opacity-60" disabled={actionId === invite.id} onClick={() => cancelInvite(invite.id)} type="button">
                      Hủy lời mời
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "settings" && (
        <section className="bg-white/75 rounded-lg border border-outline-variant/15 p-6 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-on-surface mb-3">Cài đặt công ty</h2>
            <p className="text-on-surface-variant">Chưa cần chuyển quyền chủ sở hữu trong giai đoạn này. Bạn có thể cập nhật thông tin công ty và quản lý thành viên ở các tab tương ứng.</p>
          </div>
          <div>
            <ChangePasswordForm />
          </div>
        </section>
      )}
    </div>
  );
}
