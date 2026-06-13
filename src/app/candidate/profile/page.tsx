"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  User,
  FileText,
  Lightbulb,
  Camera,
  Verified,
  Phone,
  Mail,
  TrendingUp,
  History,
  Bookmark,
  Award,
  Sparkles,
  LoaderCircle,
} from "lucide-react";
import {
  ApiError,
  CandidateProfileResponse,
  getCandidateProfile,
  updateCandidateAvatar,
  updateCandidateProfile,
  updateOpenToWork,
} from "@/lib/api/profile";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { getSavedJobCount } from "@/lib/api/jobs";

type ToastItem = {
  id: number;
  type: "success" | "error";
  message: string;
};

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<CandidateProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingOpenToWork, setSavingOpenToWork] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [openToWork, setOpenToWork] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [savedJobCount, setSavedJobCount] = useState(0);
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
      const data = await getCandidateProfile();
      setProfile(data);
      setFullName(data.fullName ?? "");
      setHeadline(data.headline ?? "");
      setPhoneNumber(data.phoneNumber ?? "");
      setEmail(data.email ?? "");
      setOpenToWork(Boolean(data.openToWork));
      setSkills(data.skills ?? []);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Could not load profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProfile();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    getSavedJobCount().then(setSavedJobCount).catch(() => setSavedJobCount(0));
  }, []);

  const skillChips = useMemo(() => skills.filter(Boolean), [skills]);
  const hasChanges = useMemo(() => {
    if (!profile) {
      return false;
    }

    const initialSkills = (profile.skills ?? []).filter(Boolean);
    const isSkillsChanged =
      initialSkills.length !== skillChips.length ||
      initialSkills.some((skill, index) => skill !== skillChips[index]);

    return (
      fullName !== (profile.fullName ?? "") ||
      headline !== (profile.headline ?? "") ||
      phoneNumber !== (profile.phoneNumber ?? "") ||
      isSkillsChanged
    );
  }, [fullName, headline, phoneNumber, profile, skillChips]);

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) {
      return;
    }
    if (skills.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      setSkillInput("");
      return;
    }
    setSkills((prev) => [...prev, trimmed]);
    setSkillInput("");
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills((prev) => prev.filter((item) => item !== skill));
  };

  const handleSave = async () => {
    if (!hasChanges) {
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    try {
      const updatedProfile = await updateCandidateProfile({
        fullName,
        headline,
        phoneNumber,
        openToWork,
        confirmedSkills: skills,
      });
      window.dispatchEvent(new CustomEvent("candidate-profile-updated", { detail: updatedProfile }));
      addToast("success", "Cập nhật hồ sơ thành công.");
      await loadProfile();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
        addToast("error", error.message);
      } else {
        setErrorMessage("Không thể lưu hồ sơ.");
        addToast("error", "Không thể lưu hồ sơ.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
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
      const updatedProfile = await updateCandidateAvatar(file);
      setProfile(updatedProfile);
      window.dispatchEvent(new CustomEvent("candidate-profile-updated", { detail: updatedProfile }));
      addToast("success", "Đã cập nhật ảnh đại diện.");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Không thể cập nhật ảnh đại diện.";
      setErrorMessage(message);
      addToast("error", message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleToggleOpenToWork = async () => {
    if (savingOpenToWork) {
      return;
    }

    const nextValue = !openToWork;
    setOpenToWork(nextValue);
    setSavingOpenToWork(true);
    setErrorMessage(null);

    try {
      await updateOpenToWork({ openToWork: nextValue });
      addToast("success", "Đã cập nhật trạng thái tìm việc.");
    } catch (error) {
      setOpenToWork((prev) => !prev);
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
        addToast("error", error.message);
      } else {
        setErrorMessage("Không thể cập nhật trạng thái tìm việc.");
        addToast("error", "Không thể cập nhật trạng thái tìm việc.");
      }
    } finally {
      setSavingOpenToWork(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 w-full animate-fade-in-up flex flex-col md:flex-row gap-8">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 flex flex-col gap-2 shrink-0">
        <nav className="flex flex-col gap-1">
          <Link href="/candidate/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-container/20 text-primary font-bold">
            <User className="w-5 h-5 fill-primary/20" />
            <span>Thông tin cá nhân</span>
          </Link>
          <Link href="/candidate/cv" className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors">
            <FileText className="w-5 h-5" />
            <span className="font-medium">Quản lý CV</span>
          </Link>
        </nav>
        
        {/* Pro Tip Card */}
        <div className="mt-8 signature-gradient rounded-[1.5rem] p-6 text-white overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
            <Lightbulb className="w-24 h-24" />
          </div>
          <h4 className="font-bold text-lg mb-2 relative z-10">Điểm hồ sơ: 85%</h4>
          <p className="text-white/80 text-sm mb-4 leading-relaxed relative z-10">Thêm tiểu sử chuyên nghiệp để mở khóa các cơ hội việc làm phù hợp từ AI.</p>
          <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden relative z-10">
            <div className="h-full bg-white w-[85%]"></div>
          </div>
        </div>
      </aside>

      {/* Profile Content */}
      <section className="flex-grow space-y-8 min-w-0">
        <div className="glass-card rounded-[2rem] p-8 md:p-12 shadow-[0_8px_40px_rgba(0,0,0,0.02)] border border-white/40">
          {errorMessage && (
            <div className="rounded-xl border border-error/30 bg-error/10 text-error px-4 py-3 text-sm font-medium mb-6">
              {errorMessage}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl bg-surface-container-high/50 border border-white/40 p-6 text-sm text-on-surface-variant flex items-center gap-2">
              <LoaderCircle className="w-4 h-4 animate-spin" />
              Đang tải hồ sơ...
            </div>
          ) : (
            <>
          
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
            <div className="relative group">
              <div className="flex w-32 h-32 md:w-36 md:h-36 items-center justify-center rounded-full overflow-hidden border-4 border-white bg-primary/10 text-primary shadow-xl">
                {profile?.profilePictureUrl ? (
                  // Profile images can come from user-configured external storage domains.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="w-full h-full object-cover"
                    src={profile.profilePictureUrl}
                    alt="Ảnh đại diện"
                  />
                ) : (
                  <User className="h-16 w-16" />
                )}
              </div>
              <input
                ref={avatarInputRef}
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => void handleAvatarChange(event)}
              />
              <button
                type="button"
                disabled={uploadingAvatar}
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/50 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 disabled:cursor-wait"
                aria-label="Đổi ảnh đại diện"
              >
                {uploadingAvatar ? (
                  <LoaderCircle className="h-8 w-8 animate-spin" />
                ) : (
                  <Camera className="h-8 w-8" />
                )}
              </button>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-black tracking-tight mb-2 bg-gradient-to-br from-blue-700 to-purple-600 bg-clip-text text-transparent">
                {fullName || "Tên của bạn"}
              </h2>
              <p className="text-on-surface-variant font-medium flex items-center justify-center md:justify-start gap-2">
                <Verified className="w-4 h-4 text-primary fill-primary/20" />
                {headline || "Thêm tiêu đề của bạn"}
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              
                <div className="group">
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2 px-1">Họ và tên</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <input
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-high/50 border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-on-surface font-medium transition-all outline-none"
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2 px-1">Tiêu đề</label>
                  <div className="relative">
                    <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <input
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-high/50 border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-on-surface font-medium transition-all outline-none"
                      type="text"
                      value={headline}
                      onChange={(event) => setHeadline(event.target.value)}
                      placeholder="VD: Thiết kế Sản phẩm"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2 px-1">Số điện thoại</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <input
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-high/50 border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-on-surface font-medium transition-all outline-none"
                      type="tel"
                      value={phoneNumber}
                      onChange={(event) => setPhoneNumber(event.target.value)}
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2 px-1">Kỹ năng</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {skillChips.length === 0 ? (
                      <span className="text-xs text-on-surface-variant">Chưa có kỹ năng nào.</span>
                    ) : (
                      skillChips.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-2 bg-surface-container-highest px-3 py-1 rounded-full text-xs font-semibold text-on-surface-variant"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-xs text-on-surface-variant hover:text-on-surface"
                          >
                            ✕
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 px-4 py-3 bg-surface-container-high/50 border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-on-surface font-medium transition-all outline-none"
                      type="text"
                      value={skillInput}
                      onChange={(event) => setSkillInput(event.target.value)}
                      placeholder="Nhập kỹ năng và nhấn Thêm"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-3 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dim"
                    >
                      Thêm
                    </button>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2 px-1">Địa chỉ Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <div className="w-full pl-12 pr-4 py-4 bg-surface-container-high/50 border border-white/60 rounded-xl text-on-surface font-medium">
                      {email || "--"}
                    </div>
                  </div>
                </div>

            </div>

            {/* Side Info / Settings Card */}
            <div className="flex flex-col justify-between">
                <div className="bg-surface-container-high/30 rounded-2xl p-6 border border-white/60 shadow-sm space-y-5">
                  <div>
                    <h5 className="text-sm font-bold text-on-surface mb-2">Sẵn sàng làm việc</h5>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      Cho nhà tuyển dụng biết bạn đang tích cực tìm kiếm cơ hội mới.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleToggleOpenToWork()}
                    disabled={savingOpenToWork}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                      openToWork
                        ? "border-secondary/40 bg-secondary/10 text-secondary"
                        : "border-white/60 bg-white/70 text-on-surface-variant"
                    }`}
                  >
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {openToWork ? "Đang tìm việc" : "Chưa có nhu cầu"}
                    </span>
                    <span
                      className={`w-11 h-6 rounded-full relative transition-colors ${
                        openToWork ? "bg-secondary" : "bg-surface-container-high"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform ${
                          openToWork ? "translate-x-6" : "translate-x-0"
                        }`}
                      ></span>
                    </span>
                  </button>
                </div>

              <div className="mt-8 flex justify-end h-min">
                <button
                  className={`signature-gradient text-white px-10 py-3 rounded-full font-bold text-sm shadow-lg transition-transform flex items-center justify-center gap-2 ${
                    saving || !hasChanges
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-[1.02] active:scale-95"
                  }`}
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving || !hasChanges}
                >
                  {saving && <LoaderCircle className="w-4 h-4 animate-spin" />}
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
            </>
          )}
        </div>

        {/* Experience Bento Grid Concept */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-2 glass-card rounded-[1.5rem] p-6 shadow-sm border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Truy cập nhanh</h3>
              <TrendingUp className="text-primary w-5 h-5" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-blue-50/50 hover:bg-blue-100/50 transition-all cursor-pointer border border-blue-100/50">
                <History className="text-blue-600 mb-2 w-6 h-6" />
                <div className="font-bold text-sm text-blue-950">Đã xem gần đây</div>
                <div className="text-[10px] uppercase tracking-wider text-blue-400 font-bold mt-1">12 Công ty</div>
              </div>
              
              <Link href="/candidate/saved-jobs" className="block p-4 rounded-xl bg-purple-50/50 hover:bg-purple-100/50 transition-all border border-purple-100/50">
                <Bookmark className="text-purple-600 mb-2 w-6 h-6" />
                <div className="font-bold text-sm text-purple-950">Công việc đã lưu</div>
                <div className="text-[10px] uppercase tracking-wider text-purple-400 font-bold mt-1">{savedJobCount} cơ hội</div>
              </Link>
            </div>
          </div>
          
          <div className="bg-secondary/10 rounded-[1.5rem] p-6 flex flex-col justify-center items-center text-center border border-secondary/20">
            <Award className="w-10 h-10 text-secondary mb-3 fill-secondary/20" />
            <h4 className="font-bold mb-2 text-secondary-900">Xác thực tài năng</h4>
            <p className="text-xs text-on-surface-variant px-2 leading-relaxed">Thực hiện bài đánh giá để nhận huy hiệu.</p>
          </div>
          
        </div>

        <ChangePasswordForm />
      </section>

      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-[240px] max-w-[360px] rounded-xl px-4 py-3 text-sm font-semibold shadow-lg border glass-card ${
              toast.type === "success"
                ? "border-secondary/20 text-on-surface"
                : "border-error/30 text-error"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
