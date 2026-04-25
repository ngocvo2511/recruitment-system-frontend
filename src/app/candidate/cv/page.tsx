"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  User,
  FileText,
  Settings,
  Lightbulb,
  CloudUpload,
  File,
  CheckCircle,
  Trash2,
  Eye,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";
import {
  ApiError,
  CvResponse,
  CvReviewResponse,
  createCvReview,
  getExtractionStatus,
  getLatestCvReview,
  getPresignedUrl,
  retryExtraction,
  uploadCv,
} from "@/lib/api/cv";

type CvItem = {
  id: string;
  fileName: string;
  uploadedAt: string;
  sizeLabel: string;
  typeLabel: string;
  isDefault: boolean;
  aiStatus: "PENDING" | "COMPLETED" | "FAILED";
  aiError?: string;
  review?: CvReviewResponse;
  reviewLoading?: boolean;
};

const POLL_INTERVAL_MS = 2500;

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
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

function stringifySmallList(jsonString?: string | null): string[] {
  if (!jsonString) {
    return [];
  }

  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }
          if (item && typeof item === "object" && "skill" in item && typeof item.skill === "string") {
            return item.skill;
          }
          return "";
        })
        .filter(Boolean)
        .slice(0, 4);
    }
  } catch {
    return [];
  }

  return [];
}

function toCvItem(cv: CvResponse): CvItem {
  return {
    id: cv.id,
    fileName: cv.fileName,
    uploadedAt: cv.uploadedAt,
    sizeLabel: "New Upload",
    typeLabel: getFileTypeLabel(cv.fileName),
    isDefault: false,
    aiStatus: "PENDING",
  };
}

export default function CandidateCVPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cvs, setCvs] = useState<CvItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);

  useEffect(() => {
    const pendingIds = cvs.filter((cv) => cv.aiStatus === "PENDING").map((cv) => cv.id);
    if (pendingIds.length === 0) {
      return;
    }

    const timer = window.setInterval(async () => {
      const results = await Promise.allSettled(pendingIds.map((id) => getExtractionStatus(id)));
      setCvs((prev) => {
        const next = [...prev];
        for (const result of results) {
          if (result.status !== "fulfilled") {
            continue;
          }

          const status = result.value;
          const index = next.findIndex((item) => item.id === status.cvId);
          if (index < 0) {
            continue;
          }

          next[index] = {
            ...next[index],
            aiStatus: status.status,
            aiError: status.errorMessage ?? undefined,
          };
        }
        return next;
      });
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [cvs]);

  const profileStrength = useMemo(() => {
    if (cvs.length === 0) {
      return 65;
    }
    const completed = cvs.filter((cv) => cv.aiStatus === "COMPLETED").length;
    return Math.min(95, 65 + completed * 10);
  }, [cvs]);

  const handleOpenFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleUploadFile = async (file: File) => {
    setUploading(true);
    setErrorMessage(null);

    try {
      const uploadedCv = await uploadCv(file);
      setCvs((prev) => [toCvItem(uploadedCv), ...prev]);
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

  const handlePreview = async (cvId: string) => {
    setActivePreviewId(cvId);
    setErrorMessage(null);
    try {
      const data = await getPresignedUrl(cvId);
      window.open(data.downloadUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Could not open CV preview.");
      }
    } finally {
      setActivePreviewId(null);
    }
  };

  const handleReview = async (cvId: string) => {
    setActiveReviewId(cvId);
    setErrorMessage(null);

    setCvs((prev) =>
      prev.map((cv) => (cv.id === cvId ? { ...cv, reviewLoading: true } : cv)),
    );

    try {
      const review = await getLatestCvReview(cvId).catch(async (error) => {
        if (error instanceof ApiError && error.code === 2009) {
          return createCvReview(cvId);
        }
        throw error;
      });

      setCvs((prev) =>
        prev.map((cv) => (cv.id === cvId ? { ...cv, review, reviewLoading: false } : cv)),
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to generate AI review right now.");
      }
      setCvs((prev) =>
        prev.map((cv) => (cv.id === cvId ? { ...cv, reviewLoading: false } : cv)),
      );
    } finally {
      setActiveReviewId(null);
    }
  };

  const handleRetryExtraction = async (cvId: string) => {
    setErrorMessage(null);
    try {
      await retryExtraction(cvId);
      setCvs((prev) =>
        prev.map((cv) =>
          cv.id === cvId
            ? { ...cv, aiStatus: "PENDING", aiError: undefined, review: undefined }
            : cv,
        ),
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Retry failed. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 w-full animate-fade-in-up">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex flex-col gap-2 shrink-0">
          <nav className="flex flex-col gap-1">
            <Link
              href="/candidate/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Personal Info</span>
            </Link>
            <Link
              href="/candidate/cv"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-container/20 text-primary font-bold"
            >
              <FileText className="w-5 h-5 fill-primary/20" />
              <span>CV Management</span>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <Lightbulb className="w-5 h-5" />
              <span className="font-medium">AI Insights</span>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </Link>
          </nav>

          <div className="mt-8 glass-card p-6 rounded-3xl border-none shadow-sm">
            <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Profile Strength</p>
            <div className="w-full bg-surface-container-highest h-2 rounded-full mb-4 overflow-hidden">
              <div className="signature-gradient h-full rounded-full" style={{ width: `${profileStrength}%` }}></div>
            </div>
            <p className="text-xs text-on-surface-variant">
              Upload and process CVs to unlock stronger AI insights.
            </p>
          </div>
        </aside>

        <div className="flex-1 space-y-8 min-w-0">
          <header className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">CV Management</h1>
            <p className="text-on-surface-variant text-lg bg-transparent">
              Upload, track AI extraction status, preview your CV, and request AI review.
            </p>
          </header>

          {errorMessage && (
            <div className="rounded-xl border border-error/30 bg-error/10 text-error px-4 py-3 text-sm font-medium">
              {errorMessage}
            </div>
          )}

          <section className="relative group">
            <div className="absolute -inset-1 signature-gradient rounded-[2rem] blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div
              className="relative glass-card border-dashed border-2 border-primary/30 p-12 rounded-[2rem] flex flex-col items-center text-center gap-4 hover:border-primary transition-all bg-white/40"
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
              <div className="h-16 w-16 signature-gradient text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                {uploading ? <LoaderCircle className="w-8 h-8 animate-spin" /> : <CloudUpload className="w-8 h-8" />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface">Upload your new Resume</h3>
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

          <section className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-on-surface px-1">My CVs</h2>

            {cvs.length === 0 ? (
              <div className="glass-card rounded-[2rem] p-8 text-on-surface-variant text-sm">
                No CV yet. Upload one to start extracting and reviewing.
              </div>
            ) : (
              cvs.map((cv) => {
                const skills = stringifySmallList(cv.review?.matchedRequirements);
                return (
                  <div
                    key={cv.id}
                    className="glass-card rounded-[2rem] overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
                  >
                    <div className="p-8 flex flex-col xl:flex-row gap-8">
                      <div className="flex-1 flex flex-col sm:flex-row gap-6">
                        <div className="h-20 w-16 shrink-0 bg-surface-container-high rounded-xl flex items-center justify-center text-primary-dim relative overflow-hidden">
                          <File className="w-8 h-8" />
                          <div className="absolute bottom-0 left-0 w-full bg-primary/10 py-1 text-[8px] font-black text-center uppercase tracking-tighter">
                            {cv.typeLabel}
                          </div>
                        </div>
                        <div className="flex flex-col justify-between py-1">
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-xl font-bold text-on-surface break-all">{cv.fileName}</h3>
                              {cv.isDefault && (
                                <span className="bg-secondary/10 text-secondary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shrink-0">
                                  Default
                                </span>
                              )}
                              <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shrink-0">
                                {cv.aiStatus}
                              </span>
                            </div>
                            <p className="text-on-surface-variant text-sm mt-1">
                              Uploaded on {formatDate(cv.uploadedAt)} • {cv.sizeLabel}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-4 mt-4">
                            <button
                              type="button"
                              onClick={() => handlePreview(cv.id)}
                              disabled={activePreviewId === cv.id}
                              className="flex items-center gap-1 text-primary font-bold text-sm hover:underline disabled:opacity-70"
                            >
                              {activePreviewId === cv.id ? (
                                <LoaderCircle className="w-4 h-4 animate-spin" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                              View
                            </button>
                            <button
                              type="button"
                              disabled
                              className="flex items-center gap-1 text-on-surface-variant font-bold text-sm opacity-50 cursor-not-allowed"
                              title="Chức năng chưa được backend hỗ trợ"
                            >
                              <CheckCircle className="w-4 h-4" /> Set as Default
                            </button>
                            <button
                              type="button"
                              disabled
                              className="flex items-center gap-1 text-error/70 font-bold text-sm opacity-50 cursor-not-allowed"
                              title="Chức năng chưa được backend hỗ trợ"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                            {cv.aiStatus === "FAILED" && (
                              <button
                                type="button"
                                onClick={() => handleRetryExtraction(cv.id)}
                                className="flex items-center gap-1 text-on-surface-variant font-bold text-sm hover:text-primary transition-colors"
                              >
                                <RotateCcw className="w-4 h-4" /> Retry extraction
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="xl:w-80 shrink-0 bg-surface-container-low/50 rounded-2xl p-6 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant">
                            AI Analysis
                          </span>
                          <div className="flex items-center gap-1">
                            <span
                              className={`text-xl font-black ${
                                (cv.review?.fitScore ?? 0) > 80 ? "text-secondary" : "text-primary"
                              }`}
                            >
                              {cv.review?.fitScore ?? "--"}
                              {cv.review?.fitScore != null ? "%" : ""}
                            </span>
                            <span className="text-[10px] text-on-surface-variant font-bold">MATCH</span>
                          </div>
                        </div>

                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {skills.map((skill) => (
                              <span
                                key={`${cv.id}-${skill}`}
                                className="px-3 py-1 bg-surface-container-highest rounded-full text-[10px] font-bold text-on-surface-variant"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="bg-white/50 p-3 rounded-xl border border-secondary/10 min-h-[72px]">
                          {cv.aiStatus === "PENDING" && (
                            <p className="text-[11px] font-medium text-on-surface-variant italic">
                              AI is extracting your CV. Review will be available after completion.
                            </p>
                          )}

                          {cv.aiStatus === "FAILED" && (
                            <p className="text-[11px] font-medium text-error italic">
                              {cv.aiError ?? "CV extraction failed."}
                            </p>
                          )}

                          {cv.aiStatus === "COMPLETED" && cv.review?.summary && (
                            <p className="text-[11px] font-medium text-on-surface-variant italic">{cv.review.summary}</p>
                          )}

                          {cv.aiStatus === "COMPLETED" && !cv.review?.summary && (
                            <p className="text-[11px] font-medium text-on-surface-variant italic">
                              Ready for AI review. Click button below to analyze this CV.
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleReview(cv.id)}
                          disabled={cv.aiStatus !== "COMPLETED" || cv.reviewLoading || activeReviewId === cv.id}
                          className="signature-gradient text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cv.reviewLoading || activeReviewId === cv.id ? "Processing review..." : "Generate AI Review"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
