"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Building2, MapPin, Clock, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ApiError,
  getJobById,
  getJobMatch,
  type JobMatchScore,
  type JobResponse,
} from "@/lib/api/jobs";
import {
  ApiError as CvApiError,
  createCvReview,
  getLatestCvReview,
  getMyCvs,
  type CvListItemResponse,
  type CvReviewResponse,
} from "@/lib/api/cv";

function formatDate(value?: string | null): string {
  if (!value) {
    return "--";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }
  return date.toLocaleDateString();
}

function formatSalary(job: JobResponse): string {
  if (job.salaryNegotiable) {
    return "Thỏa thuận";
  }
  const min = job.minSalary ?? null;
  const max = job.maxSalary ?? null;
  const currency = job.currency ? ` ${job.currency}` : "";
  if (min != null && max != null) {
    return `${min} - ${max}${currency}`;
  }
  if (min != null) {
    return `Từ ${min}${currency}`;
  }
  if (max != null) {
    return `Đến ${max}${currency}`;
  }
  return "--";
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

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const jobId = params?.id;
  const [job, setJob] = useState<JobResponse | null>(null);
  const [match, setMatch] = useState<JobMatchScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cvs, setCvs] = useState<CvListItemResponse[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const [loadingCvs, setLoadingCvs] = useState(false);
  const [cvError, setCvError] = useState<string | null>(null);
  const [review, setReview] = useState<CvReviewResponse | null>(null);
  const [reviewNotFound, setReviewNotFound] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);
  const [creatingReview, setCreatingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewInfo, setReviewInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      return;
    }
    let active = true;
    setLoading(true);
    setErrorMessage(null);

    const load = async () => {
      try {
        const jobData = await getJobById(jobId);
        if (!active) return;
        setJob(jobData);
      } catch (error) {
        if (!active) return;
        const message = error instanceof ApiError ? error.message : "Không thể tải tin tuyển dụng.";
        setErrorMessage(message);
        setJob(null);
      }

      try {
        const matchData = await getJobMatch(jobId);
        if (!active) return;
        setMatch(matchData);
      } catch {
        if (!active) return;
        setMatch(null);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [jobId]);

  const requirementSections = useMemo(() => {
    if (!job?.requirementSections) {
      return [];
    }
    const fallbackTitles: Record<string, string> = {
      REQUIRED: "Yêu cầu bắt buộc",
      PREFERRED: "Yêu cầu ưu tiên",
      OTHER: "Yêu cầu khác",
    };
    return job.requirementSections
      .map((section) => {
        const items = (section.items ?? [])
          .map((item) => item.content?.trim())
          .filter((content): content is string => Boolean(content && content.length > 0));
        const title = (section.title ?? "").trim();
        return {
          key: section.id ?? `${section.sectionType}-${section.displayOrder ?? 0}-${title}`,
          title: title || fallbackTitles[section.sectionType] || "Yêu cầu",
          items,
        };
      })
      .filter((section) => section.items.length > 0);
  }, [job?.requirementSections]);

  const reviewStrengths = useMemo(() => parseJsonList(review?.strengths), [review?.strengths]);
  const reviewWeaknesses = useMemo(() => parseJsonList(review?.weaknesses), [review?.weaknesses]);
  const reviewImprovements = useMemo(() => parseJsonList(review?.improvements), [review?.improvements]);
  const reviewMatched = useMemo(() => parseJsonList(review?.matchedRequirements), [review?.matchedRequirements]);
  const reviewMissing = useMemo(() => parseJsonList(review?.missingRequirements), [review?.missingRequirements]);
  const reviewActionPlan = useMemo(() => parseJsonList(review?.actionPlan), [review?.actionPlan]);

  const reviewSections = useMemo(
    () =>
      [
        { title: "Điểm mạnh", items: reviewStrengths },
        { title: "Điểm cần cải thiện", items: reviewWeaknesses },
        { title: "Gợi ý cải thiện", items: reviewImprovements },
        { title: "Yêu cầu phù hợp", items: reviewMatched },
        { title: "Yêu cầu còn thiếu", items: reviewMissing },
        { title: "Kế hoạch hành động", items: reviewActionPlan },
      ].filter((section) => section.items.length > 0),
    [reviewActionPlan, reviewImprovements, reviewMatched, reviewMissing, reviewStrengths, reviewWeaknesses],
  );

  const loadReview = async (cvId: string, activeJobId: string) => {
    setLoadingReview(true);
    setReviewError(null);
    setReviewInfo(null);
    try {
      const data = await getLatestCvReview(cvId, activeJobId);
      setReview(data);
      setReviewNotFound(false);
    } catch (error) {
      if (error instanceof CvApiError && error.code === 2009) {
        setReview(null);
        setReviewNotFound(true);
      } else if (error instanceof CvApiError) {
        setReviewError(error.message);
      } else {
        setReviewError("Không thể tải đánh giá AI.");
      }
    } finally {
      setLoadingReview(false);
    }
  };

  const handleCreateReview = async () => {
    if (!selectedCvId) {
      setReviewError("Vui lòng chọn CV để đánh giá.");
      return;
    }
    if (!jobId) {
      setReviewError("Không tìm thấy tin tuyển dụng.");
      return;
    }
    setCreatingReview(true);
    setReviewError(null);
    setReviewInfo(null);
    try {
      try {
        const existing = await getLatestCvReview(selectedCvId, jobId);
        setReview(existing);
        setReviewNotFound(false);
        setReviewInfo("Đã có đánh giá cho CV này. Không cần tạo lại.");
        return;
      } catch (error) {
        if (!(error instanceof CvApiError && error.code === 2009)) {
          throw error;
        }
      }

      const data = await createCvReview(selectedCvId, jobId);
      setReview(data);
      setReviewNotFound(false);
    } catch (error) {
      if (error instanceof CvApiError) {
        setReviewError(error.message);
      } else {
        setReviewError("Không thể tạo đánh giá AI.");
      }
    } finally {
      setCreatingReview(false);
    }
  };

  useEffect(() => {
    let active = true;
    const loadCvs = async () => {
      setLoadingCvs(true);
      setCvError(null);
      try {
        const list = await getMyCvs();
        if (!active) return;
        setCvs(list);
        const defaultCv = list.find((item) => item.isDefault) ?? list[0] ?? null;
        setSelectedCvId(defaultCv?.id ?? null);
      } catch (error) {
        if (!active) return;
        if (error instanceof CvApiError) {
          setCvError(error.message);
        } else {
          setCvError("Không thể tải danh sách CV.");
        }
      } finally {
        if (active) {
          setLoadingCvs(false);
        }
      }
    };

    void loadCvs();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCvId || !jobId) {
      setReview(null);
      setReviewNotFound(false);
      setReviewInfo(null);
      return;
    }
    setReview(null);
    setReviewNotFound(false);
    setReviewInfo(null);
    void loadReview(selectedCvId, jobId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCvId, jobId]);

  if (loading && !job) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-6 w-full text-on-surface-variant">
        Đang tải tin tuyển dụng...
      </div>
    );
  }

  if (errorMessage || !job) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-6 w-full text-error">
        {errorMessage ?? "Không tìm thấy tin tuyển dụng."}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 w-full">
      <Link href="/candidate/jobs" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary font-medium mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/>
        Quay lại danh sách việc làm
      </Link>

      <div className="glass-card rounded-[2rem] p-8 md:p-12 shadow-lg relative overflow-hidden">
        {/* Abstract Backgrounds */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-10 pb-10 border-b border-outline-variant/10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-surface rounded-2xl flex items-center justify-center p-4 shrink-0 shadow-sm">
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg"></div>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-on-surface mb-2">{job.title}</h1>
              <div className="flex flex-wrap gap-4 text-on-surface-variant text-sm font-medium">
                <span className="flex items-center gap-1"><Building2 className="w-4 h-4"/> {job.companyName ?? "Công ty"}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {job.location ?? "--"}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> Đăng: {formatDate(job.publishedAt ?? job.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex md:flex-col items-center md:items-end gap-3 w-full md:w-auto">
            <div className="text-2xl font-black text-primary">{formatSalary(job)}</div>
            <button className="signature-gradient text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all w-full md:w-auto">
              Ứng tuyển ngay
            </button>
          </div>
        </div>

        {/* AI Insight Snippet */}
          <div className="bg-primary-container/20 border border-primary/20 rounded-2xl p-6 mb-10 flex gap-4">
            <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-primary mb-1 text-lg">
                {match?.fitScore != null ? `${match.fitScore}% phù hợp AI` : "Chưa có đánh giá AI"}
              </h3>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                {match?.fitScore != null
                  ? "Mức độ phù hợp được tính từ kỹ năng, mô tả công việc và yêu cầu."
                  : "Chưa đủ dữ liệu để tính mức độ phù hợp. Vui lòng hoàn tất CV và thử lại."}
              </p>
            </div>
          </div>

        {/* Description */}
        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-bold mb-4 text-on-surface">Mô tả công việc</h2>
            <p className="text-on-surface-variant leading-relaxed">
              {job.description ?? "Thông tin mô tả đang được cập nhật."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-on-surface">Yêu cầu</h2>
            {requirementSections.length > 0 ? (
              <div className="space-y-6">
                {requirementSections.map((section) => (
                  <div key={section.key} className="space-y-3">
                    <h3 className="text-base font-semibold text-on-surface">{section.title}</h3>
                    <ul className="space-y-4">
                      {section.items.map((req, i) => (
                        <li key={`${section.title}-${req}-${i}`} className="flex items-start gap-3 text-on-surface-variant">
                          <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-on-surface-variant">Không có yêu cầu cụ thể cho vị trí này.</p>
            )}
          </section>
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold text-on-surface">Đánh giá AI theo CV</h2>
              <button
                type="button"
                onClick={handleCreateReview}
                disabled={creatingReview || loadingCvs || loadingReview || !selectedCvId || Boolean(review)}
                title={review ? "Đánh giá đã tồn tại, chọn CV khác để đánh giá." : ""}
                className={`inline-flex items-center gap-2 rounded-full bg-primary text-white px-5 py-2 text-sm font-bold shadow-lg hover:shadow-xl transition disabled:opacity-60 ${review ? "cursor-not-allowed" : ""}`}
              >
                {creatingReview ? "Đang tạo đánh giá..." : review ? "✓ Đã có đánh giá" : "Tạo đánh giá AI"}
              </button>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-white/30 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-semibold text-on-surface">Chọn CV để so khớp</p>
                  <select
                    value={selectedCvId ?? ""}
                    onChange={(event) => setSelectedCvId(event.target.value || null)}
                    className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-high/60 px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
                    disabled={loadingCvs}
                  >
                    {!selectedCvId && <option value="">Chọn CV</option>}
                    {cvs.map((cv) => (
                      <option key={cv.id} value={cv.id}>
                        {cv.cvName}
                        {cv.isDefault ? " (Mặc định)" : ""}
                      </option>
                    ))}
                  </select>
                  {cvError && <p className="text-sm text-error">{cvError}</p>}
                  {!loadingCvs && cvs.length === 0 && (
                    <p className="text-sm text-on-surface-variant">Bạn chưa có CV nào để đánh giá.</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {review?.fitScore != null && (
                    <div className="rounded-xl bg-primary/10 text-primary px-4 py-2 text-sm font-bold text-center">
                      Điểm phù hợp: {review.fitScore}%
                    </div>
                  )}
                  {review?.status === "FAILED" && (
                    <div className="rounded-xl bg-error/10 text-error px-4 py-2 text-sm font-medium text-center">
                      {review.errorMessage ?? "Đánh giá thất bại."}
                    </div>
                  )}
                </div>
              </div>

              {reviewError && (
                <div className="rounded-xl border border-error/30 bg-error/10 text-error px-4 py-3 text-sm font-medium">
                  {reviewError}
                </div>
              )}
              {reviewInfo && (
                <div className="rounded-xl border border-secondary/30 bg-secondary/10 text-secondary px-4 py-3 text-sm font-medium">
                  {reviewInfo}
                </div>
              )}

              {loadingReview ? (
                <p className="text-sm text-on-surface-variant">Đang tải đánh giá AI...</p>
              ) : reviewNotFound ? (
                <p className="text-sm text-on-surface-variant">
                  Chưa có đánh giá AI cho CV này. Hãy tạo đánh giá để xem mức độ phù hợp.
                </p>
              ) : review ? (
                <div className="space-y-5">
                  {review.summary && (
                    <div>
                      <h3 className="text-base font-semibold text-on-surface mb-2">Tổng quan</h3>
                      <p className="text-on-surface-variant leading-relaxed text-sm">{review.summary}</p>
                    </div>
                  )}

                  {reviewSections.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2">
                      {reviewSections.map((section) => (
                        <div key={section.title} className="rounded-xl border border-outline-variant/20 bg-white/70 p-4">
                          <h4 className="text-sm font-bold text-on-surface mb-2">{section.title}</h4>
                          <ul className="space-y-2 text-sm text-on-surface-variant">
                            {section.items.map((item, index) => (
                              <li key={`${section.title}-${index}`} className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant">Chọn CV để xem đánh giá.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
