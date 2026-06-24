"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Camera,
  KeyRound,
  LoaderCircle,
  Mail,
  Phone,
  Save,
  Sparkles,
  User,
} from "lucide-react";
import {
  ApiError,
  getRecruiterProfile,
  RecruiterProfileResponse,
  updateRecruiterAvatar,
  updateRecruiterProfile,
} from "@/lib/api/recruiterProfile";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";

type ToastItem = {
  id: number;
  type: "success" | "error";
  message: string;
};

type ActiveSection = "profile" | "security";

export default function RecruiterProfilePage() {
  const [profile, setProfile] = useState<RecruiterProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [activeSection, setActiveSection] = useState<ActiveSection>("profile");

  // Form fields
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [headline, setHeadline] = useState("");

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const addToast = (type: ToastItem["type"], message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3200);
  };

  const loadProfile = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await getRecruiterProfile();
      setProfile(data);
      setFullName(data.fullName ?? "");
      setPhoneNumber(data.phoneNumber ?? "");
      setHeadline(data.headline ?? "");
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Không thể tải thông tin cá nhân.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void loadProfile(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const hasChanges =
    profile !== null &&
    (fullName !== (profile.fullName ?? "") ||
      phoneNumber !== (profile.phoneNumber ?? "") ||
      headline !== (profile.headline ?? ""));

  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);
    setErrorMessage(null);
    try {
      const updated = await updateRecruiterProfile({ fullName, phoneNumber, headline });
      setProfile(updated);
      addToast("success", "Đã cập nhật thông tin cá nhân.");
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Không thể lưu thông tin.";
      setErrorMessage(message);
      addToast("error", message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      addToast("error", "Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast("error", "Ảnh đại diện không được vượt quá 5 MB.");
      return;
    }
    setUploadingAvatar(true);
    setErrorMessage(null);
    try {
      const updated = await updateRecruiterAvatar(file);
      setProfile(updated);
      addToast("success", "Đã cập nhật ảnh đại diện.");
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Không thể cập nhật ảnh đại diện.";
      setErrorMessage(message);
      addToast("error", message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const getInitials = () => {
    const source = fullName || profile?.email || "R";
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "R";
  };

  return (
    <div className="max-w-7xl mx-auto w-full animate-fade-in-up">
      {/* Page Header */}
      <header className="mb-8">
        <p className="text-primary font-bold uppercase tracking-widest text-xs mb-2">
          Tài khoản của tôi
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">
              Hồ sơ cá nhân
            </h1>
            <p className="text-on-surface-variant mt-1 text-sm">
              Quản lý thông tin cá nhân và bảo mật tài khoản.
            </p>
          </div>
          {/* Company badge inline */}
          {profile?.companyName && (
            <Link
              href="/recruiter/company"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-high/60 border border-outline-variant/15 hover:bg-surface-container-high transition-all shrink-0 self-start sm:self-auto"
            >
              <Building2 className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-xs font-bold text-on-surface leading-tight">{profile.companyName}</p>
                {profile.companyRole && (
                  <p className="text-[10px] text-on-surface-variant">
                    {profile.companyRole === "OWNER" ? "Chủ sở hữu" : "Nhà tuyển dụng"}
                  </p>
                )}
              </div>
            </Link>
          )}
        </div>
      </header>

      {/* Horizontal Tabs */}
      <nav className="flex gap-1 border-b border-outline-variant/20 mb-8">
        {([
          { key: "profile", label: "Thông tin cá nhân", icon: User },
          { key: "security", label: "Đổi mật khẩu", icon: KeyRound },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveSection(key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
              activeSection === key
                ? "text-primary border-primary"
                : "text-on-surface-variant border-transparent hover:text-on-surface hover:border-outline-variant/40"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </nav>

      {/* Error banner */}
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-600 px-4 py-3 text-sm font-medium mb-6">
          {errorMessage}
        </div>
      )}

      {/* Content */}
      {activeSection === "profile" && (
        <div className="glass-card rounded-[2rem] p-8 border border-white/40 shadow-sm">
          {loading ? (
            <div className="flex items-center gap-3 text-on-surface-variant py-8 justify-center">
              <LoaderCircle className="w-5 h-5 animate-spin" />
              <span className="text-sm">Đang tải thông tin...</span>
            </div>
          ) : (
            <>
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-10">
                <div className="relative group shrink-0">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl bg-primary/10 flex items-center justify-center">
                    {profile?.profilePictureUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        className="w-full h-full object-cover"
                        src={profile.profilePictureUrl}
                        alt="Ảnh đại diện"
                      />
                    ) : (
                      <span className="text-3xl font-black text-primary select-none">
                        {getInitials()}
                      </span>
                    )}
                  </div>
                  <input
                    ref={avatarInputRef}
                    className="sr-only"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => void handleAvatarChange(e)}
                  />
                  <button
                    type="button"
                    disabled={uploadingAvatar}
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/50 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 disabled:cursor-wait"
                    aria-label="Đổi ảnh đại diện"
                  >
                    {uploadingAvatar ? (
                      <LoaderCircle className="h-7 w-7 animate-spin" />
                    ) : (
                      <Camera className="h-7 w-7" />
                    )}
                  </button>
                </div>

                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-black tracking-tight text-on-surface mb-1">
                    {fullName || "Tên của bạn"}
                  </h2>
                  <p className="text-on-surface-variant text-sm">
                    {headline || "Thêm tiêu đề chuyên nghiệp"}
                  </p>
                  {profile?.email && (
                    <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1 justify-center sm:justify-start">
                      <Mail className="w-3 h-3" />
                      {profile.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2 px-1">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                    <input
                      className="w-full pl-11 pr-4 py-4 bg-surface-container-high/50 border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-on-surface font-medium transition-all outline-none"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2 px-1">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                    <input
                      className="w-full pl-11 pr-4 py-4 bg-surface-container-high/50 border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-on-surface font-medium transition-all outline-none"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0901 234 567"
                    />
                  </div>
                </div>

                <div className="group md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2 px-1">
                    Tiêu đề chuyên nghiệp
                  </label>
                  <div className="relative">
                    <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                    <input
                      className="w-full pl-11 pr-4 py-4 bg-surface-container-high/50 border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-on-surface font-medium transition-all outline-none"
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="VD: Senior Talent Acquisition Specialist"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2 px-1">
                    Địa chỉ Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                    <div className="w-full pl-11 pr-4 py-4 bg-surface-container-high/30 border border-white/60 rounded-xl text-on-surface-variant font-medium text-sm">
                      {profile?.email || "--"}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={saving || !hasChanges}
                    className={`signature-gradient text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg flex items-center gap-2 transition-all ${
                      saving || !hasChanges
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-[1.02] active:scale-95"
                    }`}
                  >
                    {saving ? (
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeSection === "security" && (
        <div className="max-w-3xl">
          <ChangePasswordForm />
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-[240px] max-w-[360px] rounded-xl px-4 py-3 text-sm font-semibold shadow-lg border glass-card ${
              toast.type === "success"
                ? "border-secondary/20 text-on-surface"
                : "border-red-200 text-red-600"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}

