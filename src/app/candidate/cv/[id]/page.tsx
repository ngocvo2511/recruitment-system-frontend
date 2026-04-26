"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { User, FileText, Settings, Lightbulb, Eye, LoaderCircle, ArrowLeft, Sparkles } from "lucide-react";
import {
  ApiError,
  CvListItemResponse,
  CvReviewResponse,
  createCvReview,
  getExtractionStatus,
  getLatestCvReview,
  getMyCvs,
  getPresignedUrl,
} from "@/lib/api/cv";

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

function parseJsonList(value?: string | null): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }
        if (item && typeof item === "object") {
          if ("title" in item && typeof item.title === "string") {
            return item.title;
          }
          if ("text" in item && typeof item.text === "string") {
            return item.text;
          }
          if ("skill" in item && typeof item.skill === "string") {
            return item.skill;
          }
        }
        return "";
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

export default function CandidateCvDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const cvId = params.id;

  const [cvItem, setCvItem] = useState<CvListItemResponse | null>(null);
  const [status, setStatus] = useState<"PENDING" | "COMPLETED" | "FAILED" | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [review, setReview] = useState<CvReviewResponse | null>(null);
  const [reviewNotFound, setReviewNotFound] = useState(false);

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingReview, setLoadingReview] = useState(false);
  const [creatingReview, setCreatingReview] = useState(false);
  const [openingCv, setOpeningCv] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reviewStrengths = useMemo(() => parseJsonList(review?.strengths), [review?.strengths]);
  const reviewWeaknesses = useMemo(() => parseJsonList(review?.weaknesses), [review?.weaknesses]);
  const reviewImprovements = useMemo(() => parseJsonList(review?.improvements), [review?.improvements]);
  const reviewActionPlan = useMemo(() => parseJsonList(review?.actionPlan), [review?.actionPlan]);

  const loadReview = async () => {
    setLoadingReview(true);
    setErrorMessage(null);
    try {
      const data = await getLatestCvReview(cvId);
      setReview(data);
      setReviewNotFound(false);
    } catch (error) {
      if (error instanceof ApiError && error.code === 2009) {
        setReview(null);
        setReviewNotFound(true);
      } else if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Could not load review data.");
      }
    } finally {
      setLoadingReview(false);
    }
  };

  const loadPageData = async () => {
    setLoadingPage(true);
    setErrorMessage(null);

    try {
      const list = await getMyCvs();
      const found = list.find((item) => item.id === cvId);
      if (!found) {
        setErrorMessage("CV not found in your account.");
        setCvItem(null);
        return;
      }
      setCvItem(found);

      try {
        const extraction = await getExtractionStatus(cvId);
        setStatus(extraction.status);
        setStatusError(extraction.errorMessage ?? null);
      } catch (error) {
        if (error instanceof ApiError) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Could not load extraction status.");
        }
      }

      await loadReview();
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPageData();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cvId]);

  const handleOpenCv = async () => {
    setOpeningCv(true);
    setErrorMessage(null);
    try {
      const data = await getPresignedUrl(cvId);
      window.open(data.downloadUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Could not open this CV.");
      }
    } finally {
      setOpeningCv(false);
    }
  };

  const handleCreateReview = async () => {
    setCreatingReview(true);
    setErrorMessage(null);
    try {
      const data = await createCvReview(cvId);
      setReview(data);
      setReviewNotFound(false);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Could not generate review.");
      }
    } finally {
      setCreatingReview(false);
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

        <div className="flex-1 space-y-6 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.push("/candidate/cv")}
              className="inline-flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-on-surface"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to CV list
            </button>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-error/30 bg-error/10 text-error px-4 py-3 text-sm font-medium">
              {errorMessage}
            </div>
          )}

          {loadingPage ? (
            <div className="glass-card rounded-[2rem] p-8 text-on-surface-variant text-sm flex items-center gap-2">
              <LoaderCircle className="w-4 h-4 animate-spin" />
              Loading CV details...
            </div>
          ) : !cvItem ? (
            <div className="glass-card rounded-[2rem] p-8 text-on-surface-variant text-sm">
              CV not found.
            </div>
          ) : (
            <>
              <section className="glass-card rounded-[2rem] p-6 border border-white/30 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface break-all">{cvItem.cvName}</h1>
                    <p className="text-on-surface-variant text-sm mt-1">Uploaded on {formatDate(cvItem.uploadedAt)}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {cvItem.isDefault && (
                      <span className="bg-secondary/10 text-secondary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                        Default
                      </span>
                    )}
                    {status && (
                      <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                        {status}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void handleOpenCv()}
                    disabled={openingCv}
                    className="inline-flex items-center gap-2 signature-gradient text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-60"
                  >
                    {openingCv ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                    Xem CV
                  </button>
                </div>

                {statusError && (
                  <div className="text-sm text-error bg-error/10 border border-error/20 rounded-xl p-3">
                    {statusError}
                  </div>
                )}
              </section>

              <section className="glass-card rounded-[2rem] p-6 border border-white/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-on-surface">AI Review</h2>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void loadReview()}
                      disabled={loadingReview || creatingReview}
                      className="px-3 py-2 rounded-lg text-xs font-bold border border-outline/30 text-on-surface-variant hover:bg-surface-container-high disabled:opacity-60"
                    >
                      {loadingReview ? "Refreshing..." : "Refresh"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleCreateReview()}
                      disabled={status !== "COMPLETED" || creatingReview}
                      className="signature-gradient text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-60"
                    >
                      {creatingReview ? "Generating..." : "Generate review"}
                    </button>
                  </div>
                </div>

                {status !== "COMPLETED" && (
                  <div className="text-sm text-on-surface-variant bg-surface-container-high rounded-xl p-3">
                    Review is available only when CV extraction is completed.
                  </div>
                )}

                {loadingReview && (
                  <div className="text-sm text-on-surface-variant flex items-center gap-2 py-2">
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                    Loading review...
                  </div>
                )}

                {!loadingReview && reviewNotFound && status === "COMPLETED" && (
                  <div className="text-sm text-on-surface-variant bg-surface-container-high rounded-xl p-3">
                    No review yet for this CV. Click Generate review to create one.
                  </div>
                )}

                {!loadingReview && review && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-primary/10 text-primary px-3 py-2 text-lg font-black">
                        {review.fitScore ?? "--"}
                        {review.fitScore != null ? "%" : ""}
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        <p>Status: {review.status}</p>
                        <p>Generated: {review.createdAt ? formatDate(review.createdAt) : "--"}</p>
                      </div>
                    </div>

                    {review.summary && (
                      <div className="bg-white/50 border border-secondary/10 rounded-xl p-3">
                        <p className="text-sm italic text-on-surface-variant">{review.summary}</p>
                      </div>
                    )}

                    {review.errorMessage && (
                      <div className="bg-error/10 border border-error/20 rounded-xl p-3 text-sm text-error">
                        {review.errorMessage}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded-xl border border-surface-container-high p-3">
                        <p className="text-[11px] font-black uppercase tracking-wider text-on-surface-variant mb-2">Strengths</p>
                        {reviewStrengths.length > 0 ? (
                          <ul className="space-y-1 text-sm text-on-surface-variant">
                            {reviewStrengths.slice(0, 5).map((item) => (
                              <li key={item}>- {item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-on-surface-variant">No data</p>
                        )}
                      </div>

                      <div className="rounded-xl border border-surface-container-high p-3">
                        <p className="text-[11px] font-black uppercase tracking-wider text-on-surface-variant mb-2">Weaknesses</p>
                        {reviewWeaknesses.length > 0 ? (
                          <ul className="space-y-1 text-sm text-on-surface-variant">
                            {reviewWeaknesses.slice(0, 5).map((item) => (
                              <li key={item}>- {item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-on-surface-variant">No data</p>
                        )}
                      </div>

                      <div className="rounded-xl border border-surface-container-high p-3">
                        <p className="text-[11px] font-black uppercase tracking-wider text-on-surface-variant mb-2">Improvements</p>
                        {reviewImprovements.length > 0 ? (
                          <ul className="space-y-1 text-sm text-on-surface-variant">
                            {reviewImprovements.slice(0, 5).map((item) => (
                              <li key={item}>- {item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-on-surface-variant">No data</p>
                        )}
                      </div>

                      <div className="rounded-xl border border-surface-container-high p-3">
                        <p className="text-[11px] font-black uppercase tracking-wider text-on-surface-variant mb-2">Action Plan</p>
                        {reviewActionPlan.length > 0 ? (
                          <ul className="space-y-1 text-sm text-on-surface-variant">
                            {reviewActionPlan.slice(0, 5).map((item) => (
                              <li key={item}>- {item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-on-surface-variant">No data</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
