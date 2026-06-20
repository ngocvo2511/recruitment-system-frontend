"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bookmark, Briefcase, Building2, CircleDollarSign, MapPin, Clock, CheckCircle2, Flag, Mic, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ApiError,
  getJobById,
  getJobMatch,
  isJobSaved,
  removeSavedJob,
  reportJob,
  saveJob,
  type JobReportReason,
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
import {
  ApiError as ApplicationApiError,
  applyToJob,
  getMyApplications,
  type ApplicationResponse,
} from "@/lib/api/applications";

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

function formatMoneyAmount(value: number, currency?: string | null): string {
  const code = (currency ?? "VND").toUpperCase();
  if (code === "VND") {
    const millions = value / 1000000;
    const text = Number.isInteger(millions) ? String(millions) : millions.toFixed(1).replace(/\.0$/, "");
    return `${text} triệu`;
  }
  return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value)} ${code}`;
}

function formatSalary(job: JobResponse): string {
  if (job.salaryNegotiable) {
    return "Thỏa thuận";
  }
  const min = job.minSalary ?? null;
  const max = job.maxSalary ?? null;
  const currency = job.currency ?? "VND";
  if (min != null && max != null) {
    return `${formatMoneyAmount(min, currency)} - ${formatMoneyAmount(max, currency)}`;
  }
  if (min != null) {
    return `Từ ${formatMoneyAmount(min, currency)}`;
  }
  if (max != null) {
    return `Đến ${formatMoneyAmount(max, currency)}`;
  }
  return "--";
}

const employmentTypeLabel: Record<string, string> = {
  FULL_TIME: "Toàn thời gian",
  PART_TIME: "Bán thời gian",
  CONTRACT: "Hợp đồng",
  INTERNSHIP: "Thực tập",
};

const workModeLabel: Record<string, string> = {
  ONSITE: "Tại văn phòng",
  REMOTE: "Từ xa",
  HYBRID: "Kết hợp",
};

const levelLabel: Record<string, string> = {
  INTERN: "Thực tập",
  FRESHER: "Fresher",
  JUNIOR: "Junior",
  MIDDLE: "Middle",
  SENIOR: "Senior",
  LEAD: "Lead",
};

function getLabel(map: Record<string, string>, value?: string | null): string {
  return value ? map[value] ?? value : "--";
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
  const [myApplications, setMyApplications] = useState<ApplicationResponse[]>([]);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [updatingSaved, setUpdatingSaved] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState<JobReportReason>("MISLEADING_INFORMATION");
  const [reportDetails, setReportDetails] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reportMessage, setReportMessage] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      return;
    }
    let active = true;

    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const jobData = await getJobById(jobId);
        if (!active) return;
        setJob(jobData);
      } catch (error) {
        if (!active) return;
        const message = error instanceof ApiError ? error.message : "Không thể tải tin tuyển dụng.";
        setErrorMessage(message);
        setJob(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [jobId]);

  // Reload match score when selectedCvId changes to keep it in sync with the CV review section.
  // This ensures the circular score and the review score are always based on the same CV.
  useEffect(() => {
    if (!jobId) return;
    let active = true;
    const loadMatch = async () => {
      try {
        const matchData = await getJobMatch(jobId, selectedCvId ?? undefined);
        if (!active) return;
        setMatch(matchData);
      } catch {
        if (!active) return;
        setMatch(null);
      }
    };
    void loadMatch();
    return () => {
      active = false;
    };
  }, [jobId, selectedCvId]);

  useEffect(() => {
    if (!jobId) return;
    isJobSaved(jobId).then(setSaved).catch(() => setSaved(false));
  }, [jobId]);

  const toggleSaved = async () => {
    if (!jobId || updatingSaved) return;
    setUpdatingSaved(true);
    try {
      if (saved) await removeSavedJob(jobId);
      else await saveJob(jobId);
      setSaved((current) => !current);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Không thể cập nhật công việc đã lưu.");
    } finally {
      setUpdatingSaved(false);
    }
  };

  const submitReport = async () => {
    if (!jobId || reporting) return;
    setReporting(true);
    setReportError(null);
    try {
      await reportJob(jobId, { reason: reportReason, details: reportDetails.trim() || undefined });
      setShowReportForm(false);
      setReportDetails("");
      setReportMessage("Cảm ơn bạn. Báo cáo đã được gửi đến quản trị viên.");
    } catch (error) {
      setReportError(error instanceof ApiError ? error.message : "Không thể gửi báo cáo.");
    } finally {
      setReporting(false);
    }
  };

  const jobRequirementSections = job?.requirementSections;
  const requirementSections = useMemo(() => {
    if (!jobRequirementSections) {
      return [];
    }
    const fallbackTitles: Record<string, string> = {
      REQUIRED: "Yêu cầu bắt buộc",
      PREFERRED: "Yêu cầu ưu tiên",
      OTHER: "Yêu cầu khác",
    };
    return jobRequirementSections
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
  }, [jobRequirementSections]);

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

  const currentApplication = useMemo(
    () => myApplications.find((application) => application.jobId === jobId && application.status !== "WITHDRAWN") ?? null,
    [jobId, myApplications],
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
    let active = true;
    const loadApplications = async () => {
      try {
        const list = await getMyApplications();
        if (active) {
          setMyApplications(list);
        }
      } catch {
        if (active) {
          setMyApplications([]);
        }
      }
    };
    void loadApplications();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCvId || !jobId) {
      queueMicrotask(() => {
        setReview(null);
        setReviewNotFound(false);
        setReviewInfo(null);
      });
      return;
    }
    queueMicrotask(() => {
      setReview(null);
      setReviewNotFound(false);
      setReviewInfo(null);
    });
    queueMicrotask(() => {
      void loadReview(selectedCvId, jobId);
    });
  }, [selectedCvId, jobId]);

  const handleApply = async () => {
    if (!jobId) {
      setApplyError("Không tìm thấy tin tuyển dụng.");
      return;
    }
    if (!selectedCvId) {
      setApplyError("Vui lòng chọn CV để ứng tuyển.");
      return;
    }

    setApplying(true);
    setApplyError(null);
    setApplySuccess(null);
    try {
      const application = await applyToJob({
        jobId,
        cvId: selectedCvId,
        coverLetter,
      });
      setMyApplications((current) => [application, ...current]);
      setApplySuccess("Ứng tuyển thành công. Nhà tuyển dụng sẽ xem hồ sơ của bạn.");
      setShowApplyForm(false);
    } catch (error) {
      setApplyError(error instanceof ApplicationApiError ? error.message : "Không thể gửi đơn ứng tuyển.");
    } finally {
      setApplying(false);
    }
  };

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
    <div className="mx-auto w-full max-w-7xl px-6 py-6">
      <Link href="/candidate/jobs" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary font-medium mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/>
        Quay lại danh sách việc làm
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <div className="glass-card rounded-[2rem] p-8 md:p-10 shadow-lg relative overflow-hidden">
        {/* Abstract Backgrounds */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

        {/* Header */}
        <div className="relative mb-5 border-b border-outline-variant/10 pb-5 pr-12">
          <button
            type="button"
            onClick={() => {
              setReportError(null);
              setShowReportForm(true);
            }}
            className="absolute right-0 top-0 inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/25 bg-white text-on-surface-variant transition hover:border-error/30 hover:bg-error/10 hover:text-error"
            title="Báo cáo tin tuyển dụng"
            aria-label="Báo cáo tin tuyển dụng"
          >
            <Flag className="h-4 w-4" />
          </button>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-outline-variant/15 bg-white shadow-sm">
              {job.companyLogoUrl ? (
                // Company logos are user-managed external images from Cloudinary.
                // eslint-disable-next-line @next/next/no-img-element
                <img className="h-full w-full object-cover" src={job.companyLogoUrl} alt={`Logo ${job.companyName ?? "công ty"}`} />
              ) : (
                <Building2 className="h-9 w-9 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-on-surface mb-2">{job.title}</h1>
              <div className="flex flex-wrap gap-4 text-on-surface-variant text-sm font-medium">
                <span className="flex items-center gap-1"><Building2 className="w-4 h-4"/> {job.companyName ?? "Công ty"}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {job.location ?? "--"}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> Đăng: {formatDate(job.publishedAt ?? job.createdAt)}</span>
              </div>
              {job.categories.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {job.categories.map((category) => (
                    <span
                      key={category.code}
                      className="rounded-full bg-primary/8 px-3 py-1 text-xs font-bold text-primary"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-5 grid gap-6 rounded-3xl border border-outline-variant/20 bg-white px-6 py-5 shadow-sm md:grid-cols-3">
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <CircleDollarSign className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-on-surface-variant">Mức lương</p>
              <p className="mt-1 text-base font-black text-on-surface">{formatSalary(job)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-on-surface-variant">Địa điểm</p>
              <p className="mt-1 text-base font-black text-on-surface">{job.locationName ?? job.location ?? "--"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Briefcase className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-on-surface-variant">Cấp bậc</p>
              <p className="mt-1 text-base font-black text-on-surface">{getLabel(levelLabel, job.level)}</p>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-3 rounded-3xl border border-outline-variant/20 bg-white/80 p-5 shadow-sm sm:grid-cols-[minmax(0,1fr)_220px]">
          <button
            type="button"
            onClick={() => {
              setApplyError(null);
              setApplySuccess(null);
              setShowApplyForm((visible) => !visible);
            }}
            disabled={Boolean(currentApplication)}
            className="signature-gradient inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-black text-white shadow-lg transition hover:scale-[1.01] active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
          >
            {currentApplication ? "Đã ứng tuyển" : "Ứng tuyển ngay"}
          </button>
          <button
            type="button"
            onClick={() => void toggleSaved()}
            disabled={updatingSaved}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-outline-variant/30 bg-white text-sm font-bold text-on-surface-variant transition hover:border-primary/30 hover:text-primary disabled:opacity-50"
          >
            <Bookmark className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} />
            {saved ? "Đã lưu" : "Lưu công việc"}
          </button>
        </div>

        {reportMessage && (
          <div className="mb-8 rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
            {reportMessage}
          </div>
        )}

        {(showApplyForm || currentApplication || applySuccess) && (
          <div className="mb-10 rounded-2xl border border-primary/20 bg-primary-container/10 p-6">
            {currentApplication ? (
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-on-surface">Bạn đã ứng tuyển công việc này</h2>
                <p className="text-sm text-on-surface-variant">
                  Trạng thái hiện tại: <span className="font-bold text-primary">{currentApplication.status}</span>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Nộp đơn ứng tuyển</h2>
                  <p className="text-sm text-on-surface-variant">Chọn CV phù hợp và thêm lời nhắn ngắn nếu cần.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm font-semibold text-on-surface">
                    CV ứng tuyển
                    <select
                      value={selectedCvId ?? ""}
                      onChange={(event) => setSelectedCvId(event.target.value || null)}
                      disabled={loadingCvs || applying}
                      className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-high/60 px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {!selectedCvId && <option value="">Chọn CV</option>}
                      {cvs.map((cv) => (
                        <option key={cv.id} value={cv.id}>
                          {cv.cvName}
                          {cv.isDefault ? " (Mặc định)" : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm font-semibold text-on-surface md:col-span-2">
                    Lời nhắn cho nhà tuyển dụng
                    <textarea
                      value={coverLetter}
                      onChange={(event) => setCoverLetter(event.target.value)}
                      disabled={applying}
                      rows={4}
                      className="w-full resize-none rounded-xl border border-outline-variant/20 bg-surface-container-high/60 px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="Viết ngắn gọn lý do bạn phù hợp với vị trí này..."
                    />
                  </label>
                </div>
                {applyError && <p className="text-sm font-medium text-error">{applyError}</p>}
                {cvError && <p className="text-sm font-medium text-error">{cvError}</p>}
                {applySuccess && <p className="text-sm font-medium text-secondary">{applySuccess}</p>}
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={applying || !selectedCvId}
                    className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:shadow-xl disabled:opacity-60"
                  >
                    {applying ? "Đang gửi..." : "Gửi đơn ứng tuyển"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowApplyForm(false)}
                    disabled={applying}
                    className="rounded-full bg-surface-container-high px-6 py-3 text-sm font-bold text-on-surface transition hover:bg-surface-container-highest"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Insight Snippet */}
        <div className="glass-card rounded-3xl p-8 mb-10 border border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
          <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
            <div className="relative shrink-0 flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-surface-container-highest opacity-50" />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray="351.8" 
                  strokeDashoffset={match?.fitScore ? 351.8 - (351.8 * match.fitScore) / 100 : 351.8} 
                  className="text-primary transition-all duration-1000 ease-out" 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-on-surface">{match?.fitScore ?? 0}%</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Phù hợp</span>
              </div>
            </div>
            
            <div className="flex-1 w-full space-y-4">
              <h3 className="font-bold text-xl text-on-surface">Điểm so khớp AI <span className="text-xs font-medium text-on-surface-variant">(Hybrid Matching)</span></h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Thuật toán Hybrid Matching đánh giá CV của bạn dựa trên 3 tiêu chí cốt lõi: Kỹ năng chuyên môn, kinh nghiệm làm việc và yêu cầu cụ thể của vị trí này.
              </p>
              
              {match ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20 hover:border-primary/20 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Kỹ năng</span>
                      <span className="text-sm font-black text-secondary">{match.skillsScore ?? 0}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full signature-gradient transition-all duration-1000" style={{ width: `${match.skillsScore ?? 0}%` }}></div>
                    </div>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20 hover:border-primary/20 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Kinh nghiệm</span>
                      <span className="text-sm font-black text-secondary">{match.descriptionScore ?? 0}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full signature-gradient transition-all duration-1000" style={{ width: `${match.descriptionScore ?? 0}%` }}></div>
                    </div>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20 hover:border-primary/20 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Yêu cầu</span>
                      <span className="text-sm font-black text-secondary">{match.requirementsScore ?? 0}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full signature-gradient transition-all duration-1000" style={{ width: `${match.requirementsScore ?? 0}%` }}></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-4 rounded-2xl border border-dashed border-outline-variant/30 text-center text-sm text-on-surface-variant">
                  Chưa có đánh giá độ phù hợp. Vui lòng cập nhật CV để AI có thể phân tích.
                </div>
              )}
              <Link
                href={`/candidate/jobs/${job.id}/mock-interview/setup`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/25 bg-primary/8 px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/12"
              >
                <Mic className="h-4 w-4" />
                Luyện phỏng vấn với AI
              </Link>
            </div>
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
                    <div className="rounded-xl bg-primary/10 text-primary px-4 py-2 text-sm font-bold text-center" title="Điểm này được LLM AI đánh giá nội dung CV, khác với điểm Hybrid Matching phía trên">
                      Điểm đánh giá AI (LLM): {review.fitScore}%
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

      <aside className="space-y-5 lg:sticky lg:top-24">
        <section className="rounded-3xl border border-outline-variant/20 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-on-surface">Thông tin công ty</h2>
          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-outline-variant/30 bg-white shadow-sm">
              {job.companyLogoUrl ? (
                // Company logos are user-managed external images from Cloudinary.
                // eslint-disable-next-line @next/next/no-img-element
                <img className="h-full w-full object-cover" src={job.companyLogoUrl} alt={`Logo ${job.companyName ?? "công ty"}`} />
              ) : (
                <Building2 className="h-8 w-8 text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-black text-on-surface">{job.companyName ?? "Công ty"}</p>
              <p className="mt-1 text-sm text-on-surface-variant">{job.companyIndustry ?? "Chưa cập nhật lĩnh vực"}</p>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-start justify-between gap-4 border-t border-outline-variant/15 pt-3">
              <span className="text-on-surface-variant">Lĩnh vực</span>
              <span className="text-right font-bold text-on-surface">{job.companyIndustry ?? "--"}</span>
            </div>
            <div className="flex items-start justify-between gap-4 border-t border-outline-variant/15 pt-3">
              <span className="text-on-surface-variant">Quy mô</span>
              <span className="text-right font-bold text-on-surface">{job.companySize ? `${job.companySize} nhân sự` : "--"}</span>
            </div>
            <div className="flex items-start justify-between gap-4 border-t border-outline-variant/15 pt-3">
              <span className="text-on-surface-variant">Địa điểm</span>
              <span className="text-right font-bold text-on-surface">
                {[job.companyAddress, job.companyCity, job.companyCountry].filter(Boolean).join(", ") || "--"}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 border-t border-outline-variant/15 pt-3">
              <span className="text-on-surface-variant">Website</span>
              {job.companyWebsite ? (
                <a className="max-w-[190px] truncate text-right font-bold text-primary hover:underline" href={job.companyWebsite} target="_blank" rel="noreferrer">
                  {job.companyWebsite}
                </a>
              ) : (
                <span className="text-right font-bold text-on-surface">--</span>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-outline-variant/20 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-on-surface">Thông tin chung</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-start justify-between gap-4 border-t border-outline-variant/15 pt-3">
              <span className="text-on-surface-variant">Loại hình</span>
              <span className="text-right font-bold text-on-surface">{getLabel(employmentTypeLabel, job.employmentType)}</span>
            </div>
            <div className="flex items-start justify-between gap-4 border-t border-outline-variant/15 pt-3">
              <span className="text-on-surface-variant">Hình thức</span>
              <span className="text-right font-bold text-on-surface">{getLabel(workModeLabel, job.workMode)}</span>
            </div>
            <div className="flex items-start justify-between gap-4 border-t border-outline-variant/15 pt-3">
              <span className="text-on-surface-variant">Cấp bậc</span>
              <span className="text-right font-bold text-on-surface">{getLabel(levelLabel, job.level)}</span>
            </div>
            <div className="flex items-start justify-between gap-4 border-t border-outline-variant/15 pt-3">
              <span className="text-on-surface-variant">Số lượng tuyển</span>
              <span className="text-right font-bold text-on-surface">{job.headcount ?? "--"}</span>
            </div>
            <div className="flex items-start justify-between gap-4 border-t border-outline-variant/15 pt-3">
              <span className="text-on-surface-variant">Thời gian làm việc</span>
              <span className="text-right font-bold text-on-surface">{job.workingTime || "--"}</span>
            </div>
            <div className="flex items-start justify-between gap-4 border-t border-outline-variant/15 pt-3">
              <span className="text-on-surface-variant">Hạn nộp</span>
              <span className="text-right font-bold text-on-surface">{formatDate(job.deadline)}</span>
            </div>
          </div>
        </section>
      </aside>
      </div>

      {showReportForm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-on-surface">Báo cáo tin tuyển dụng</h2>
                <p className="mt-1 text-sm text-on-surface-variant">{job.title}</p>
              </div>
              <button type="button" onClick={() => setShowReportForm(false)} aria-label="Đóng">
                <X className="h-5 w-5" />
              </button>
            </div>
            <label className="mt-5 block text-sm font-semibold">
              Lý do
              <select
                value={reportReason}
                onChange={(event) => setReportReason(event.target.value as JobReportReason)}
                className="mt-2 w-full rounded-lg border border-outline-variant/30 bg-white px-3 py-3 outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="MISLEADING_INFORMATION">Thông tin sai lệch</option>
                <option value="SCAM_OR_FRAUD">Có dấu hiệu lừa đảo</option>
                <option value="DISCRIMINATION">Nội dung phân biệt đối xử</option>
                <option value="INAPPROPRIATE_CONTENT">Nội dung không phù hợp</option>
                <option value="DUPLICATE_OR_EXPIRED">Tin trùng hoặc đã hết hạn</option>
                <option value="OTHER">Lý do khác</option>
              </select>
            </label>
            <label className="mt-4 block text-sm font-semibold">
              Mô tả thêm
              <textarea
                value={reportDetails}
                onChange={(event) => setReportDetails(event.target.value)}
                maxLength={2000}
                className="mt-2 min-h-28 w-full rounded-lg border border-outline-variant/30 p-3 outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Mô tả vấn đề để quản trị viên kiểm tra..."
              />
            </label>
            {reportError && (
              <div className="mt-4 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm font-medium text-error">
                {reportError}
              </div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowReportForm(false)} className="px-4 py-2 font-semibold text-on-surface-variant">Hủy</button>
              <button type="button" disabled={reporting} onClick={() => void submitReport()} className="rounded-lg bg-error px-5 py-2 font-bold text-white disabled:opacity-50">
                {reporting ? "Đang gửi..." : "Gửi báo cáo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
