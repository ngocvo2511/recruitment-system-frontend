"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  FileText,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  Video,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getMyApplications, type ApplicationResponse, type ApplicationStatus } from "@/lib/api/applications";
import { getMyCvs, type CvListItemResponse } from "@/lib/api/cv";
import {
  getJobRecommendations,
  getSavedJobs,
  type JobRecommendationResponse,
  type SavedJobResponse,
} from "@/lib/api/jobs";
import { getCandidateProfile, type CandidateProfileResponse } from "@/lib/api/profile";

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: "Đã ứng tuyển",
  SCREENING: "Đang sàng lọc",
  INTERVIEW: "Phỏng vấn",
  OFFERED: "Đã nhận đề nghị",
  HIRED: "Đã tuyển",
  REJECTED: "Không phù hợp",
  WITHDRAWN: "Đã rút đơn",
};

function formatDate(value?: string | null): string {
  if (!value) return "--";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "--" : date.toLocaleDateString("vi-VN");
}

function statusClass(status: ApplicationStatus): string {
  if (status === "INTERVIEW") return "bg-secondary/10 text-secondary";
  if (status === "OFFERED" || status === "HIRED") return "bg-emerald-100 text-emerald-700";
  if (status === "REJECTED") return "bg-error/10 text-error";
  return "bg-primary/10 text-primary";
}

export default function CandidateDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfileResponse | null>(null);
  const [cvs, setCvs] = useState<CvListItemResponse[]>([]);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [recommendations, setRecommendations] = useState<JobRecommendationResponse[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJobResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      getCandidateProfile(),
      getMyCvs(),
      getMyApplications(),
      getJobRecommendations(4),
      getSavedJobs(),
    ]).then(([profileResult, cvResult, applicationResult, recommendationResult, savedResult]) => {
      if (!active) return;
      if (profileResult.status === "fulfilled") setProfile(profileResult.value);
      if (cvResult.status === "fulfilled") setCvs(cvResult.value);
      if (applicationResult.status === "fulfilled") setApplications(applicationResult.value);
      if (recommendationResult.status === "fulfilled") setRecommendations(recommendationResult.value);
      if (savedResult.status === "fulfilled") setSavedJobs(savedResult.value);
      if (applicationResult.status === "rejected") {
        setErrorMessage("Không thể tải đầy đủ dữ liệu hành trình tìm việc.");
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const sortedApplications = useMemo(
    () => [...applications].sort((a, b) =>
      new Date(b.updatedAt ?? b.appliedAt ?? 0).getTime() - new Date(a.updatedAt ?? a.appliedAt ?? 0).getTime()),
    [applications],
  );
  const interviewApplication = sortedApplications.find((item) => item.status === "INTERVIEW");

  const nextActions = useMemo(() => {
    const actions: Array<{ title: string; description: string; href: string; label: string; icon: typeof FileText }> = [];
    if (cvs.length === 0) {
      actions.push({
        title: "Tạo CV đầu tiên",
        description: "Bạn cần ít nhất một CV để bắt đầu ứng tuyển.",
        href: "/candidate/cv",
        label: "Tạo CV",
        icon: FileText,
      });
    } else if (!cvs.some((cv) => cv.isDefault || cv.default)) {
      actions.push({
        title: "Chọn CV mặc định",
        description: "Giúp quá trình ứng tuyển nhanh và nhất quán hơn.",
        href: "/candidate/cv",
        label: "Chọn CV",
        icon: FileText,
      });
    }
    if (!profile?.headline || !profile.phoneNumber || !(profile.skills?.length)) {
      actions.push({
        title: "Hoàn thiện hồ sơ",
        description: "Bổ sung tiêu đề, số điện thoại và kỹ năng để được gợi ý chính xác hơn.",
        href: "/candidate/profile",
        label: "Cập nhật",
        icon: CircleUserRound,
      });
    }
    if (!profile?.openToWork) {
      actions.push({
        title: "Bật trạng thái tìm việc",
        description: "Cho phép nhà tuyển dụng phù hợp tìm thấy hồ sơ của bạn.",
        href: "/candidate/profile",
        label: "Thiết lập",
        icon: CheckCircle2,
      });
    }
    if (interviewApplication) {
      actions.unshift({
        title: `Chuẩn bị phỏng vấn tại ${interviewApplication.companyName ?? "công ty"}`,
        description: `Luyện tập câu hỏi cho vị trí ${interviewApplication.jobTitle}.`,
        href: `/candidate/jobs/${interviewApplication.jobId}/mock-interview/setup`,
        label: "Luyện ngay",
        icon: Video,
      });
    }
    if (actions.length === 0) {
      actions.push({
        title: "Hồ sơ đã sẵn sàng",
        description: "Khám phá các công việc phù hợp và bắt đầu ứng tuyển.",
        href: "/candidate/jobs",
        label: "Tìm việc",
        icon: CheckCircle2,
      });
    }
    return actions.slice(0, 3);
  }, [cvs, interviewApplication, profile]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    router.push(query ? `/candidate/jobs?query=${encodeURIComponent(query)}` : "/candidate/jobs");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6">
      <header className="mb-8 flex flex-col gap-2">
        <p className="text-sm font-semibold text-primary">Chào {profile?.fullName || "bạn"},</p>
        <h1 className="text-3xl font-black text-on-surface md:text-4xl">Hôm nay bạn muốn tìm cơ hội nào?</h1>
      </header>

      <form onSubmit={handleSearch} className="mb-10 flex flex-col gap-3 border-y border-outline-variant/20 py-5 md:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-12 w-full rounded-md border border-outline-variant/30 bg-white pl-12 pr-4 outline-none focus:border-primary"
            placeholder="Chức danh, kỹ năng hoặc công ty"
          />
        </label>
        <button className="h-12 rounded-md bg-primary px-7 font-bold text-white" type="submit">Tìm việc</button>
      </form>

      {errorMessage && <div className="mb-6 rounded-md bg-error/10 px-4 py-3 text-sm text-error">{errorMessage}</div>}

      <section className="mb-12">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-on-surface">Việc bạn nên làm tiếp theo</h2>
            <p className="mt-1 text-sm text-on-surface-variant">Các bước có tác động trực tiếp đến hành trình tìm việc.</p>
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {nextActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} href={action.href} className="group border border-outline-variant/20 bg-white p-5 transition-colors hover:border-primary/40">
                <Icon className="mb-4 h-6 w-6 text-primary" />
                <h3 className="font-bold text-on-surface">{action.title}</h3>
                <p className="mt-2 min-h-10 text-sm text-on-surface-variant">{action.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary">
                  {action.label}<ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mb-12 grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
        <div>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-black text-on-surface">Cập nhật đơn ứng tuyển</h2>
              <p className="mt-1 text-sm text-on-surface-variant">Những thay đổi gần đây từ nhà tuyển dụng.</p>
            </div>
            <Link href="/candidate/applications" className="text-sm font-bold text-primary">Xem tất cả</Link>
          </div>
          {sortedApplications.length === 0 ? (
            <div className="border border-dashed border-outline-variant/30 p-8 text-center">
              <BriefcaseBusiness className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-3 font-bold">Bạn chưa có đơn ứng tuyển</p>
              <Link href="/candidate/jobs" className="mt-4 inline-flex items-center gap-2 font-bold text-primary">Khám phá việc làm<ArrowRight className="h-4 w-4" /></Link>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/15 border-y border-outline-variant/20">
              {sortedApplications.slice(0, 4).map((application) => (
                <Link key={application.id} href={`/candidate/jobs/${application.jobId}`} className="flex items-center gap-4 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-on-surface">{application.jobTitle}</p>
                    <p className="truncate text-sm text-on-surface-variant">{application.companyName ?? "Công ty"} · cập nhật {formatDate(application.updatedAt ?? application.appliedAt)}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${statusClass(application.status)}`}>
                    {STATUS_LABELS[application.status]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-black text-on-surface">Đã lưu gần đây</h2>
              <p className="mt-1 text-sm text-on-surface-variant">{savedJobs.length} cơ hội đang quan tâm.</p>
            </div>
            <Link href="/candidate/saved-jobs" aria-label="Xem việc làm đã lưu"><ArrowRight className="h-5 w-5 text-primary" /></Link>
          </div>
          {savedJobs.length === 0 ? (
            <div className="border border-dashed border-outline-variant/30 p-6 text-center text-sm text-on-surface-variant">Chưa có công việc đã lưu.</div>
          ) : (
            <div className="space-y-3">
              {savedJobs.slice(0, 3).map(({ job }) => (
                <Link key={job.id} href={`/candidate/jobs/${job.id}`} className="flex gap-3 border border-outline-variant/20 bg-white p-4">
                  <Bookmark className="h-5 w-5 shrink-0 fill-primary text-primary" />
                  <div className="min-w-0">
                    <p className="truncate font-bold">{job.title}</p>
                    <p className="truncate text-sm text-on-surface-variant">{job.companyName ?? "Công ty"}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-secondary" />
              <h2 className="text-2xl font-black text-on-surface">Việc làm phù hợp với bạn</h2>
            </div>
            <p className="mt-1 text-sm text-on-surface-variant">Dựa trên CV, kỹ năng và hồ sơ hiện tại.</p>
          </div>
          <Link href="/candidate/jobs" className="text-sm font-bold text-primary">Xem thêm</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {recommendations.map(({ job, matchScore }) => (
            <Link key={job.id} href={`/candidate/jobs/${job.id}`} className="border border-outline-variant/20 bg-white p-5 transition-colors hover:border-primary/40">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold text-on-surface">{job.title}</h3>
                  <p className="mt-1 truncate text-sm text-on-surface-variant">{job.companyName ?? "Công ty"}</p>
                </div>
                {matchScore != null && <span className="shrink-0 rounded-full bg-secondary/10 px-3 py-1 text-xs font-black text-secondary">{Math.round(matchScore)}%</span>}
              </div>
              <p className="mt-4 flex items-center gap-1 text-sm text-on-surface-variant"><MapPin className="h-4 w-4" />{job.location ?? "Chưa cập nhật"}</p>
            </Link>
          ))}
          {recommendations.length === 0 && (
            <div className="col-span-full border border-dashed border-outline-variant/30 p-8 text-center text-on-surface-variant">
              Hoàn thiện CV và kỹ năng để nhận gợi ý phù hợp hơn.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
