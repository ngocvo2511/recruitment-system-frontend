"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User, FileText, Settings, Lightbulb, CloudUpload, File, Eye, Trash2, LoaderCircle, CheckCircle, Sparkles } from "lucide-react";
import { ApiError, CvListItemResponse, deleteCv, getExtractedData, getExtractionStatus, getMyCvs, retryExtraction, setDefaultCv, uploadCv } from "@/lib/api/cv";
import { getCandidateProfile, updateCandidateProfile } from "@/lib/api/profile";

type ConfirmAction = {
  type: "delete" | "default";
  cvId: string;
  cvName: string;
};

type ToastItem = {
  id: number;
  type: "success" | "error";
  message: string;
};

type ExtractedProfileData = {
  fullName?: string;
  headline?: string;
  phoneNumber?: string;
  skills?: string[];
  email?: string;
};

type ExtractedProfileForm = {
  fullName: string;
  headline: string;
  phoneNumber: string;
  skillsText: string;
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value || "--";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function getFileTypeLabel(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) {
    return "PDF";
  }
  if (lower.endsWith(".docx") || lower.endsWith(".doc")) {
    return "DOCX";
  }
  return "FILE";
}

function parseExtractedProfileData(payload?: string | null): ExtractedProfileData | null {
  if (!payload) {
    return null;
  }

  try {
    const parsed = JSON.parse(payload) as Record<string, unknown>;
    const fullName = typeof parsed.full_name === "string"
      ? parsed.full_name
      : typeof parsed.fullName === "string"
        ? parsed.fullName
        : undefined;
    const headline = typeof parsed.headline === "string"
      ? parsed.headline
      : typeof parsed.summary === "string"
        ? parsed.summary
        : undefined;
    const phoneNumber = typeof parsed.phone_number === "string"
      ? parsed.phone_number
      : typeof parsed.phoneNumber === "string"
        ? parsed.phoneNumber
        : undefined;
    const email = typeof parsed.email === "string" ? parsed.email : undefined;
    let skills: string[] | undefined;

    if (Array.isArray(parsed.extracted_skills)) {
      skills = parsed.extracted_skills.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
    } else if (typeof parsed.skills === "string") {
      skills = parsed.skills
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (!fullName && !headline && !phoneNumber && !email && (!skills || skills.length === 0)) {
      return null;
    }

    return {
      fullName,
      headline,
      phoneNumber,
      skills,
      email,
    };
  } catch {
    return null;
  }
}

export default function CandidateCVPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const extractionTimerRef = useRef<number | null>(null);

  const [cvs, setCvs] = useState<CvListItemResponse[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeDeleteId, setActiveDeleteId] = useState<string | null>(null);
  const [activeDefaultId, setActiveDefaultId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeExtractId, setActiveExtractId] = useState<string | null>(null);
  const [showExtractForm, setShowExtractForm] = useState(false);
  const [extractCvId, setExtractCvId] = useState<string | null>(null);
  const [extractCvName, setExtractCvName] = useState<string | null>(null);
  const [extractOpenToWork, setExtractOpenToWork] = useState<boolean | null>(null);
  const [activeRetryId, setActiveRetryId] = useState<string | null>(null);
  const [extractForm, setExtractForm] = useState<ExtractedProfileForm>({
    fullName: "",
    headline: "",
    phoneNumber: "",
    skillsText: "",
  });
  const [extractApplying, setExtractApplying] = useState(false);
  const [extractionCvId, setExtractionCvId] = useState<string | null>(null);
  const [extractionCvName, setExtractionCvName] = useState<string | null>(null);
  const [extractionStatus, setExtractionStatus] = useState<"PENDING" | "COMPLETED" | "FAILED" | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [extractionData, setExtractionData] = useState<ExtractedProfileData | null>(null);
  const [showExtractionModal, setShowExtractionModal] = useState(false);
  const [pollingExtraction, setPollingExtraction] = useState(false);
  const [applyingExtraction, setApplyingExtraction] = useState(false);

  const addToast = (type: ToastItem["type"], message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3200);
  };

  const loadCvList = async (showLoading = true) => {
    if (showLoading) {
      setLoadingList(true);
    }

    try {
      const list = await getMyCvs();
      setCvs([...list].sort((first, second) => Number(Boolean(second.isDefault)) - Number(Boolean(first.isDefault))));
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Could not load CV list.");
      }
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCvList(false);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!pollingExtraction || !extractionCvId) {
      return undefined;
    }

    const pollExtraction = async () => {
      try {
        const status = await getExtractionStatus(extractionCvId);
        setExtractionStatus(status.status);
        setExtractionError(status.errorMessage ?? null);

        if (status.status === "COMPLETED") {
          setExtractionData(parseExtractedProfileData(status.parsedData));
          setPollingExtraction(false);
        }

        if (status.status === "FAILED") {
          setPollingExtraction(false);
        }
      } catch (error) {
        if (error instanceof ApiError) {
          setExtractionError(error.message);
        } else {
          setExtractionError("Could not load extraction status.");
        }
      }
    };

    void pollExtraction();
    extractionTimerRef.current = window.setInterval(pollExtraction, 3000);

    return () => {
      if (extractionTimerRef.current) {
        window.clearInterval(extractionTimerRef.current);
        extractionTimerRef.current = null;
      }
    };
  }, [pollingExtraction, extractionCvId]);

  const handleOpenFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleUploadFile = async (file: File) => {
    setUploading(true);
    setErrorMessage(null);

    try {
      const uploaded = await uploadCv(file);
      await loadCvList();
      setExtractionCvId(uploaded.id);
      setExtractionCvName(uploaded.fileName);
      setExtractionStatus("PENDING");
      setExtractionError(null);
      setExtractionData(null);
      setShowExtractionModal(true);
      setPollingExtraction(true);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Upload failed. Please try again.");
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    await handleUploadFile(file);
  };

  const handleDeleteCv = async (cvId: string, cvName: string) => {
    setActiveDeleteId(cvId);
    setErrorMessage(null);

    try {
      await deleteCv(cvId);
      await loadCvList(false);
      addToast("success", `Deleted CV: ${cvName}`);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
        addToast("error", error.message);
      } else {
        setErrorMessage("Could not delete CV.");
        addToast("error", "Could not delete CV.");
      }
    } finally {
      setActiveDeleteId(null);
    }
  };

  const handleSetDefault = async (cvId: string, cvName: string) => {
    setActiveDefaultId(cvId);
    setErrorMessage(null);

    try {
      await setDefaultCv(cvId);
      setCvs((prev) => {
        const updated = prev.map((cv) => ({ ...cv, isDefault: cv.id === cvId }));
        return [...updated].sort((first, second) => Number(Boolean(second.isDefault)) - Number(Boolean(first.isDefault)));
      });
      addToast("success", `Set default CV: ${cvName}`);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
        addToast("error", error.message);
      } else {
        setErrorMessage("Could not set default CV.");
        addToast("error", "Could not set default CV.");
      }
    } finally {
      setActiveDefaultId(null);
    }
  };

  const confirmCurrentAction = async () => {
    if (!confirmAction) {
      return;
    }

    const action = confirmAction;
    setConfirmAction(null);

    if (action.type === "delete") {
      await handleDeleteCv(action.cvId, action.cvName);
      return;
    }

    await handleSetDefault(action.cvId, action.cvName);
  };

  const handleCancelExtractionPolling = () => {
    setPollingExtraction(false);
  };

  const handleCloseExtractionModal = () => {
    setPollingExtraction(false);
    setShowExtractionModal(false);
  };

  const handleApplyExtraction = async () => {
    if (!extractionData) {
      return;
    }

    const payload: Record<string, unknown> = {};

    if (extractionData.fullName) {
      payload.fullName = extractionData.fullName;
    }

    if (extractionData.headline) {
      payload.headline = extractionData.headline;
    }

    if (extractionData.phoneNumber) {
      payload.phoneNumber = extractionData.phoneNumber;
    }

    if (extractionData.skills && extractionData.skills.length > 0) {
      payload.confirmedSkills = extractionData.skills;
    }

    if (Object.keys(payload).length === 0) {
      addToast("error", "Không có dữ liệu phù hợp để cập nhật.");
      return;
    }

    setApplyingExtraction(true);
    try {
      await updateCandidateProfile(payload);
      addToast("success", "Đã cập nhật thông tin cá nhân từ CV.");
      setShowExtractionModal(false);
    } catch (error) {
      if (error instanceof ApiError) {
        addToast("error", error.message);
      } else {
        addToast("error", "Không thể cập nhật thông tin cá nhân.");
      }
    } finally {
      setApplyingExtraction(false);
    }
  };

  const handleOpenExtractForm = (cvId: string, cvName: string, formValues: ExtractedProfileForm, openToWork: boolean | null) => {
    setExtractCvId(cvId);
    setExtractCvName(cvName);
    setExtractOpenToWork(openToWork);
    setExtractForm(formValues);
    setShowExtractForm(true);
  };

  const handleFetchExtractedData = async (cvId: string, cvName: string) => {
    setActiveExtractId(cvId);
    setErrorMessage(null);
    try {
      const response = await getExtractedData(cvId);
      const parsed = parseExtractedProfileData(response.parsedData ?? null);

      if (!parsed) {
        addToast("error", "Không có dữ liệu trích xuất phù hợp để cập nhật.");
        return;
      }

      const profile = await getCandidateProfile();
      const baseForm: ExtractedProfileForm = {
        fullName: profile.fullName ?? "",
        headline: profile.headline ?? "",
        phoneNumber: profile.phoneNumber ?? "",
        skillsText: profile.skills && profile.skills.length > 0 ? profile.skills.join(", ") : "",
      };

      const mergedForm: ExtractedProfileForm = {
        fullName: parsed.fullName ?? baseForm.fullName,
        headline: parsed.headline ?? baseForm.headline,
        phoneNumber: parsed.phoneNumber ?? baseForm.phoneNumber,
        skillsText: parsed.skills && parsed.skills.length > 0 ? parsed.skills.join(", ") : baseForm.skillsText,
      };

      handleOpenExtractForm(cvId, cvName, mergedForm, profile.openToWork ?? false);
    } catch (error) {
      if (error instanceof ApiError) {
        addToast("error", error.message);
      } else {
        addToast("error", "Không thể lấy dữ liệu trích xuất.");
      }
    } finally {
      setActiveExtractId(null);
    }
  };

  const handleConfirmExtractForm = async () => {
    if (!extractCvId) {
      return;
    }

    const payload: Record<string, unknown> = {};
    const fullName = extractForm.fullName.trim();
    const headline = extractForm.headline.trim();
    const phoneNumber = extractForm.phoneNumber.trim();
    const skills = extractForm.skillsText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    payload.fullName = fullName || null;
    payload.headline = headline || null;
    payload.phoneNumber = phoneNumber || null;
    payload.openToWork = Boolean(extractOpenToWork);
    payload.confirmedSkills = skills;

    setExtractApplying(true);
    try {
      await updateCandidateProfile(payload);
      addToast("success", "Đã cập nhật thông tin cá nhân từ CV.");
      setShowExtractForm(false);
    } catch (error) {
      if (error instanceof ApiError) {
        addToast("error", error.message);
      } else {
        addToast("error", "Không thể cập nhật thông tin cá nhân.");
      }
    } finally {
      setExtractApplying(false);
    }
  };

  const handleRetryExtraction = async (cvId: string, cvName: string) => {
    setActiveRetryId(cvId);
    setErrorMessage(null);

    try {
      await retryExtraction(cvId);
      addToast("success", `Đã gửi lại trích xuất cho CV ${cvName}.`);
    } catch (error) {
      if (error instanceof ApiError) {
        addToast("error", error.message);
      } else {
        addToast("error", "Không thể gửi lại trích xuất.");
      }
    } finally {
      setActiveRetryId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 w-full animate-fade-in-up">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex flex-col gap-2 shrink-0">
          <nav className="flex flex-col gap-1">
            <Link href="/candidate/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors">
              <User className="w-5 h-5" />
              <span className="font-medium">Personal Info</span>
            </Link>
            <Link href="/candidate/cv" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-container/20 text-primary font-bold">
              <FileText className="w-5 h-5 fill-primary/20" />
              <span>CV Management</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors">
              <Lightbulb className="w-5 h-5" />
              <span className="font-medium">AI Insights</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </Link>
          </nav>
        </aside>

        <div className="flex-1 space-y-8 min-w-0">
          <header className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">CV Management</h1>
            <p className="text-on-surface-variant text-lg bg-transparent">Manage your CV list, then open any CV to view details and AI review.</p>
          </header>

          {errorMessage && (
            <div className="rounded-xl border border-error/30 bg-error/10 text-error px-4 py-3 text-sm font-medium">
              {errorMessage}
            </div>
          )}

          <section className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <button
                type="button"
                disabled={uploading}
                onClick={handleOpenFileDialog}
                className="rounded-[1.5rem] border border-white/40 bg-white/80 px-6 py-6 flex flex-col items-center gap-3 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 disabled:opacity-70"
              >
                <div className="h-12 w-12 signature-gradient text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                  {uploading ? <LoaderCircle className="w-6 h-6 animate-spin" /> : <CloudUpload className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Upload CV</h3>
                  <p className="text-on-surface-variant text-sm">PDF or DOCX, max 5MB.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => router.push("/candidate/cv/builder")}
                className="rounded-[1.5rem] border border-primary/20 bg-primary/5 px-6 py-6 flex flex-col items-center gap-3 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="h-12 w-12 bg-primary/90 text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Create from template</h3>
                  <p className="text-on-surface-variant text-sm">Start building with a ready layout.</p>
                </div>
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-on-surface px-1">My CVs</h2>

            {loadingList ? (
              <div className="glass-card rounded-[2rem] p-8 text-on-surface-variant text-sm flex items-center gap-2">
                <LoaderCircle className="w-4 h-4 animate-spin" />
                Loading CVs...
              </div>
            ) : cvs.length === 0 ? (
              <div className="glass-card rounded-[2rem] p-8 text-on-surface-variant text-sm">
                No CV yet. Upload one to get started.
              </div>
            ) : (
              cvs.map((cv) => (
                <div key={cv.id} className="glass-card rounded-[2rem] overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
                  <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="h-20 w-16 shrink-0 bg-surface-container-high rounded-xl flex items-center justify-center text-primary-dim relative overflow-hidden">
                      <File className="w-8 h-8" />
                      <div className="absolute bottom-0 left-0 w-full bg-primary/10 py-1 text-[8px] font-black text-center uppercase tracking-tighter">
                        {getFileTypeLabel(cv.cvName)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg md:text-xl font-bold text-on-surface break-all">{cv.cvName}</h3>
                        {cv.isDefault && (
                          <span className="bg-secondary/10 text-secondary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shrink-0">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-on-surface-variant text-sm mt-1">Uploaded on {formatDate(cv.uploadedAt)}</p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <button
                        type="button"
                        onClick={() => router.push(`/candidate/cv/${cv.id}`)}
                        className="flex items-center gap-1 text-primary font-bold text-sm hover:underline"
                      >
                        <Eye className="w-4 h-4" /> Chi tiết
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmAction({ type: "default", cvId: cv.id, cvName: cv.cvName })}
                        disabled={cv.isDefault || activeDefaultId === cv.id || activeDeleteId === cv.id}
                        className="flex items-center gap-1 text-on-surface-variant font-bold text-sm hover:text-primary disabled:opacity-60"
                      >
                        {activeDefaultId === cv.id ? (
                          <LoaderCircle className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Mặc định
                      </button>

                      {cv.aiStatus === "FAILED" && (
                        <button
                          type="button"
                          onClick={() => void handleRetryExtraction(cv.id, cv.cvName)}
                          disabled={activeRetryId === cv.id}
                          className="flex items-center gap-1 text-on-surface-variant font-bold text-sm hover:text-primary disabled:opacity-60"
                        >
                          {activeRetryId === cv.id ? (
                            <LoaderCircle className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                          Retry
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => void handleFetchExtractedData(cv.id, cv.cvName)}
                        disabled={activeExtractId === cv.id}
                        className="flex items-center gap-1 text-on-surface-variant font-bold text-sm hover:text-primary disabled:opacity-60"
                      >
                        {activeExtractId === cv.id ? (
                          <LoaderCircle className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        Trích xuất
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmAction({ type: "delete", cvId: cv.id, cvName: cv.cvName })}
                        disabled={activeDeleteId === cv.id || activeDefaultId === cv.id}
                        className="flex items-center gap-1 text-error/70 font-bold text-sm hover:text-error disabled:opacity-60"
                      >
                        {activeDeleteId === cv.id ? (
                          <LoaderCircle className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Xoá
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </div>

      {confirmAction && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-card rounded-3xl border border-white/50 p-6 shadow-2xl">
            <h3 className="text-xl font-extrabold text-on-surface">
              {confirmAction.type === "delete" ? "Xác nhận xoá CV" : "Đặt CV mặc định"}
            </h3>
            <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
              {confirmAction.type === "delete"
                ? `Bạn có chắc muốn xoá CV ${confirmAction.cvName}? Hành động này không thể hoàn tác.`
                : `Bạn có muốn đặt CV ${confirmAction.cvName} làm CV mặc định không?`}
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container-high"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={() => void confirmCurrentAction()}
                className={`px-4 py-2 rounded-xl text-sm font-bold text-white ${
                  confirmAction.type === "delete" ? "bg-error hover:bg-error-dim" : "signature-gradient"
                }`}
              >
                {confirmAction.type === "delete" ? "Xoá" : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

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

      {showExtractionModal && extractionCvId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-card rounded-3xl border border-white/50 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-extrabold text-on-surface">Đang trích xuất thông tin CV</h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  {extractionCvName ?? "CV vừa tải lên"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseExtractionModal}
                className="text-on-surface-variant text-sm font-bold hover:text-on-surface"
              >
                Đóng
              </button>
            </div>

            {extractionStatus === "PENDING" && (
              <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-4 flex items-center gap-3">
                <LoaderCircle className="w-5 h-5 animate-spin text-primary" />
                <div className="text-sm text-on-surface-variant">
                  Hệ thống đang phân tích CV của bạn. Vui lòng chờ trong giây lát.
                </div>
              </div>
            )}

            {extractionStatus === "FAILED" && (
              <div className="rounded-2xl border border-error/20 bg-error/10 px-4 py-4 text-sm text-error">
                {extractionError ?? "Trích xuất thất bại. Vui lòng thử lại sau."}
              </div>
            )}

            {extractionStatus === "COMPLETED" && (
              <div className="space-y-3">
                <div className="rounded-2xl border border-secondary/20 bg-secondary/5 px-4 py-4 text-sm text-on-surface">
                  Đã trích xuất xong. Bạn có muốn dùng dữ liệu này để cập nhật hồ sơ cá nhân không?
                </div>

                {extractionData ? (
                  <div className="rounded-2xl border border-surface-container-high p-4 space-y-2 text-sm">
                    {extractionData.fullName && (
                      <div>
                        <span className="font-bold">Họ tên:</span> {extractionData.fullName}
                      </div>
                    )}
                    {extractionData.headline && (
                      <div>
                        <span className="font-bold">Headline:</span> {extractionData.headline}
                      </div>
                    )}
                    {extractionData.phoneNumber && (
                      <div>
                        <span className="font-bold">Số điện thoại:</span> {extractionData.phoneNumber}
                      </div>
                    )}
                    {extractionData.email && (
                      <div>
                        <span className="font-bold">Email:</span> {extractionData.email}
                      </div>
                    )}
                    {extractionData.skills && extractionData.skills.length > 0 && (
                      <div>
                        <span className="font-bold">Kỹ năng:</span> {extractionData.skills.join(", ")}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-surface-container-high p-4 text-sm text-on-surface-variant">
                    Không tìm thấy dữ liệu phù hợp để cập nhật.
                  </div>
                )}
              </div>
            )}

            {extractionError && extractionStatus !== "FAILED" && (
              <div className="text-xs text-error">{extractionError}</div>
            )}

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              {pollingExtraction && extractionStatus === "PENDING" && (
                <button
                  type="button"
                  onClick={handleCancelExtractionPolling}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container-high"
                >
                  Huỷ chờ
                </button>
              )}
              {!pollingExtraction && extractionStatus === "PENDING" && (
                <button
                  type="button"
                  onClick={() => setPollingExtraction(true)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container-high"
                >
                  Tiếp tục chờ
                </button>
              )}
              {extractionStatus === "COMPLETED" && (
                <button
                  type="button"
                  onClick={handleCloseExtractionModal}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container-high"
                >
                  Bỏ qua
                </button>
              )}
              {extractionStatus === "COMPLETED" && extractionData && (
                <button
                  type="button"
                  onClick={() => void handleApplyExtraction()}
                  disabled={applyingExtraction}
                  className="signature-gradient text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-60"
                >
                  {applyingExtraction ? "Đang cập nhật..." : "Cập nhật hồ sơ"}
                </button>
              )}
              {extractionCvId && (
                <button
                  type="button"
                  onClick={() => router.push(`/candidate/cv/${extractionCvId}`)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-primary border border-primary/30 hover:bg-primary/5"
                >
                  Xem CV
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showExtractForm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-xl glass-card rounded-3xl border border-white/50 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-extrabold text-on-surface">Xac nhan cap nhat ho so</h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  Du lieu duoc trich xuat tu CV: {extractCvName ?? "--"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowExtractForm(false)}
                className="text-on-surface-variant text-sm font-bold hover:text-on-surface"
              >
                Dong
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Ho ten</label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-high/50 border border-white/60 text-sm text-on-surface focus:ring-2 focus:ring-primary/40 outline-none"
                  value={extractForm.fullName}
                  onChange={(event) => setExtractForm((prev) => ({ ...prev, fullName: event.target.value }))}
                  placeholder="Nguyen Van A"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Headline</label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-high/50 border border-white/60 text-sm text-on-surface focus:ring-2 focus:ring-primary/40 outline-none"
                  value={extractForm.headline}
                  onChange={(event) => setExtractForm((prev) => ({ ...prev, headline: event.target.value }))}
                  placeholder="Product Designer"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">So dien thoai</label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-high/50 border border-white/60 text-sm text-on-surface focus:ring-2 focus:ring-primary/40 outline-none"
                  value={extractForm.phoneNumber}
                  onChange={(event) => setExtractForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
                  placeholder="09xx xxx xxx"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Ky nang</label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-high/50 border border-white/60 text-sm text-on-surface focus:ring-2 focus:ring-primary/40 outline-none"
                  value={extractForm.skillsText}
                  onChange={(event) => setExtractForm((prev) => ({ ...prev, skillsText: event.target.value }))}
                  placeholder="Figma, React, Communication"
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowExtractForm(false)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container-high"
              >
                Huy
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmExtractForm()}
                disabled={extractApplying}
                className="signature-gradient text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-60"
              >
                {extractApplying ? "Dang cap nhat..." : "Cap nhat ho so"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
