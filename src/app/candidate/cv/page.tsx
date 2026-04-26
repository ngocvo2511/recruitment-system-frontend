"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User, FileText, Settings, Lightbulb, CloudUpload, File, Eye, Trash2, LoaderCircle, CheckCircle } from "lucide-react";
import { ApiError, CvListItemResponse, deleteCv, getMyCvs, setDefaultCv, uploadCv } from "@/lib/api/cv";

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

export default function CandidateCVPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cvs, setCvs] = useState<CvListItemResponse[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeDeleteId, setActiveDeleteId] = useState<string | null>(null);
  const [activeDefaultId, setActiveDefaultId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      setCvs(list);
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

  const handleOpenFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleUploadFile = async (file: File) => {
    setUploading(true);
    setErrorMessage(null);

    try {
      const uploaded = await uploadCv(file);
      await loadCvList();
      router.push(`/candidate/cv/${uploaded.id}`);
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
      setCvs((prev) => prev.map((cv) => ({ ...cv, isDefault: cv.id === cvId })));
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

          <section className="relative group">
            <div className="absolute -inset-1 signature-gradient rounded-[2rem] blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div
              className="relative glass-card border-dashed border-2 border-primary/30 p-10 rounded-[2rem] flex flex-col items-center text-center gap-4 hover:border-primary transition-all bg-white/40"
              role="button"
              tabIndex={0}
              onClick={handleOpenFileDialog}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleOpenFileDialog();
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="h-14 w-14 signature-gradient text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                {uploading ? <LoaderCircle className="w-7 h-7 animate-spin" /> : <CloudUpload className="w-7 h-7" />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface">Upload your new CV</h3>
                <p className="text-on-surface-variant">PDF or DOCX, max 5MB.</p>
              </div>
              <button
                type="button"
                disabled={uploading}
                onClick={handleOpenFileDialog}
                className="mt-2 signature-gradient text-white px-8 py-3 rounded-full font-bold shadow-md hover:scale-105 active:scale-95 transition-transform z-10 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : "Select File"}
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
                        <Eye className="w-4 h-4" /> Xem
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
                        Set Default
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
    </div>
  );
}
