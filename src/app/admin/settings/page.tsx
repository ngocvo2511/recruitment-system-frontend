"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Bell, BrainCircuit, BriefcaseBusiness, Building2, CheckCircle2, Save, ShieldCheck } from "lucide-react";
import {
  ApiError,
  getAdminSettings,
  updateAdminSettings,
  type AdminSettingsResponse,
} from "@/lib/api/admin";

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-xl border border-outline-variant/10 bg-surface-container-low/50 p-4">
      <div>
        <p className="text-sm font-bold text-on-surface">{title}</p>
        <p className="mt-1 text-xs text-on-surface-variant">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`h-7 w-12 rounded-full p-1 transition-colors ${checked ? "bg-primary" : "bg-outline-variant"}`}
        aria-pressed={checked}
      >
        <span className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettingsResponse | null>(null);
  const [initialSettings, setInitialSettings] = useState<AdminSettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const result = await getAdminSettings();
        if (!active) return;
        setSettings(result);
        setInitialSettings(result);
      } catch (error) {
        if (!active) return;
        setErrorMessage(error instanceof ApiError ? error.message : "Không thể tải cấu hình hệ thống.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const updateLocal = <K extends keyof AdminSettingsResponse>(key: K, value: AdminSettingsResponse[K]) => {
    setSettings((current) => (current ? { ...current, [key]: value } : current));
    setSavedMessage(null);
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    setErrorMessage(null);
    setSavedMessage(null);
    try {
      const updated = await updateAdminSettings(settings);
      setSettings(updated);
      setInitialSettings(updated);
      setSavedMessage("Đã lưu cấu hình hệ thống.");
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Không thể lưu cấu hình hệ thống.");
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    setSettings(initialSettings);
    setSavedMessage(null);
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="glass-card rounded-2xl p-8 text-on-surface-variant">Đang tải cấu hình hệ thống...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm font-medium text-error">
          <AlertCircle className="w-4 h-4" />
          {errorMessage ?? "Chưa có dữ liệu cấu hình."}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">Cài đặt hệ thống</h1>
          <p className="text-on-surface-variant max-w-2xl">
            Quản lý chính sách duyệt công ty, duyệt tin tuyển dụng, AI matching và notification admin.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={resetSettings}
            disabled={!hasChanges || saving}
            className="rounded-xl bg-surface-container px-5 py-3 text-sm font-bold text-on-surface-variant transition hover:bg-surface-variant disabled:opacity-50"
          >
            Hoàn tác
          </button>
          <button
            type="button"
            onClick={() => void saveSettings()}
            disabled={!hasChanges || saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary transition hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            <Save className="h-4 w-4" />
            {saving ? "Đang lưu..." : "Lưu cấu hình"}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm font-medium text-error">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </div>
      )}
      {savedMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="w-4 h-4" />
          {savedMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="glass-card rounded-2xl border border-outline-variant/10 p-6">
          <div className="mb-5 flex items-center gap-3">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-on-surface">Xác minh công ty</h2>
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-bold text-on-surface">
              Chế độ xác minh
              <select
                value={settings.companyVerificationMode}
                onChange={(event) => updateLocal("companyVerificationMode", event.target.value as "MANUAL" | "AUTO_APPROVE")}
                className="mt-2 w-full rounded-xl border border-outline-variant/10 bg-surface-container-lowest px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="MANUAL">Admin duyệt thủ công</option>
                <option value="AUTO_APPROVE">Tự động xác minh công ty mới</option>
              </select>
            </label>
            <ToggleRow
              title="Thông báo admin khi có công ty cần xác minh"
              description="Gửi notification cho admin khi recruiter tạo công ty ở trạng thái chờ duyệt."
              checked={settings.notifyAdminsForCompanyReview}
              onChange={(checked) => updateLocal("notifyAdminsForCompanyReview", checked)}
            />
            <ToggleRow
              title="Thông báo chủ công ty khi admin kiểm duyệt"
              description="Gửi kết quả xác minh, từ chối hoặc yêu cầu bổ sung thông tin cho owner."
              checked={settings.notifyCompanyOwnersForModeration}
              onChange={(checked) => updateLocal("notifyCompanyOwnersForModeration", checked)}
            />
          </div>
        </section>

        <section className="glass-card rounded-2xl border border-outline-variant/10 p-6">
          <div className="mb-5 flex items-center gap-3">
            <BriefcaseBusiness className="h-5 w-5 text-secondary" />
            <h2 className="text-lg font-bold text-on-surface">Tin tuyển dụng</h2>
          </div>
          <div className="space-y-4">
            <ToggleRow
              title="Tự động duyệt tin từ công ty đã xác minh"
              description="Nếu bật, tin mới của công ty ACTIVE có thể được publish ngay."
              checked={settings.autoApproveJobsFromVerifiedCompanies}
              onChange={(checked) => updateLocal("autoApproveJobsFromVerifiedCompanies", checked)}
            />
            <ToggleRow
              title="Bắt buộc admin duyệt mọi tin"
              description="Nếu bật, mọi tin tuyển dụng mới đều vào hàng chờ dù công ty đã xác minh."
              checked={settings.requireAdminApprovalForAllJobs}
              onChange={(checked) => updateLocal("requireAdminApprovalForAllJobs", checked)}
            />
            <ToggleRow
              title="Thông báo admin khi có tin cần duyệt"
              description="Gửi notification cho admin khi tin mới rơi vào trạng thái chờ duyệt."
              checked={settings.notifyAdminsForJobReview}
              onChange={(checked) => updateLocal("notifyAdminsForJobReview", checked)}
            />
            <ToggleRow
              title="Thông báo recruiter khi admin kiểm duyệt"
              description="Gửi kết quả duyệt, từ chối, gắn cờ hoặc đóng tin cho recruiter."
              checked={settings.notifyRecruitersForModeration}
              onChange={(checked) => updateLocal("notifyRecruitersForModeration", checked)}
            />
          </div>
        </section>

        <section className="glass-card rounded-2xl border border-outline-variant/10 p-6 lg:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-on-surface">AI matching</h2>
          </div>
          <ToggleRow
            title="Bật AI matching"
            description="Cấu hình này sẵn sàng cho các luồng matching/search dùng embedding kiểm tra trước khi chạy."
            checked={settings.aiMatchingEnabled}
            onChange={(checked) => updateLocal("aiMatchingEnabled", checked)}
          />
        </section>
      </div>

      <div className="rounded-2xl bg-slate-900 p-6 text-white">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-300" />
          <h2 className="text-lg font-bold">Audit</h2>
        </div>
        <p className="mt-2 text-sm text-slate-300">
          Mỗi lần lưu cấu hình sẽ ghi một bản ghi `SETTINGS_UPDATED` trong nhật ký admin.
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
          <Bell className="h-4 w-4" />
          Các toggle notification được áp dụng cho các luồng tạo công ty, tạo tin và moderation.
        </div>
      </div>
    </div>
  );
}
