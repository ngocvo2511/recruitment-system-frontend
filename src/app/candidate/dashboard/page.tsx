"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bookmark,
  Building2,
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
  getJobCategories,
  getJobRecommendations,
  getLocations,
  getSavedJobs,
  type EmploymentType,
  type JobCategory,
  type JobLevel,
  type JobLocation,
  type JobRecommendationResponse,
  type SavedJobResponse,
  type WorkMode,
} from "@/lib/api/jobs";
import { getCandidateProfile, type CandidateProfileResponse } from "@/lib/api/profile";

type SalaryFilterValue = "" | "UNDER_10" | "FROM_10_TO_20" | "FROM_20_TO_30" | "FROM_30_TO_50" | "ABOVE_50" | "NEGOTIABLE";

const employmentTypeOptions: Array<{ value: EmploymentType; label: string }> = [
  { value: "FULL_TIME", label: "Toàn thời gian" },
  { value: "PART_TIME", label: "Bán thời gian" },
  { value: "CONTRACT", label: "Hợp đồng" },
  { value: "INTERNSHIP", label: "Thực tập" },
];

const workModeOptions: Array<{ value: WorkMode; label: string }> = [
  { value: "ONSITE", label: "Tại văn phòng" },
  { value: "REMOTE", label: "Từ xa" },
  { value: "HYBRID", label: "Kết hợp" },
];

const levelOptions: Array<{ value: JobLevel; label: string }> = [
  { value: "INTERN", label: "Thực tập" },
  { value: "FRESHER", label: "Fresher" },
  { value: "JUNIOR", label: "Junior" },
  { value: "MIDDLE", label: "Middle" },
  { value: "SENIOR", label: "Senior" },
  { value: "LEAD", label: "Lead" },
];

const salaryOptions: Array<{ value: SalaryFilterValue; label: string }> = [
  { value: "UNDER_10", label: "Dưới 10 triệu" },
  { value: "FROM_10_TO_20", label: "10 - 20 triệu" },
  { value: "FROM_20_TO_30", label: "20 - 30 triệu" },
  { value: "FROM_30_TO_50", label: "30 - 50 triệu" },
  { value: "ABOVE_50", label: "Trên 50 triệu" },
  { value: "NEGOTIABLE", label: "Thỏa thuận" },
];

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
  const [locationOptions, setLocationOptions] = useState<JobLocation[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<JobCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedEmploymentType, setSelectedEmploymentType] = useState<EmploymentType | "">("");
  const [selectedWorkMode, setSelectedWorkMode] = useState<WorkMode | "">("");
  const [selectedLevel, setSelectedLevel] = useState<JobLevel | "">("");
  const [selectedSalary, setSelectedSalary] = useState<SalaryFilterValue>("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
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
      getLocations(),
      getJobCategories(),
    ]).then(([profileResult, cvResult, applicationResult, recommendationResult, savedResult, locationResult, categoryResult]) => {
      if (!active) return;
      if (profileResult.status === "fulfilled") setProfile(profileResult.value);
      if (cvResult.status === "fulfilled") setCvs(cvResult.value);
      if (applicationResult.status === "fulfilled") setApplications(applicationResult.value);
      if (recommendationResult.status === "fulfilled") setRecommendations(recommendationResult.value);
      if (savedResult.status === "fulfilled") setSavedJobs(savedResult.value);
      if (locationResult.status === "fulfilled") setLocationOptions(locationResult.value);
      if (categoryResult.status === "fulfilled") setCategoryOptions(categoryResult.value);
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
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (selectedLocation) params.set("location", selectedLocation);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedEmploymentType) params.set("employmentType", selectedEmploymentType);
    if (selectedWorkMode) params.set("workMode", selectedWorkMode);
    if (selectedLevel) params.set("level", selectedLevel);
    if (selectedSalary) params.set("salary", selectedSalary);
    const suffix = params.toString();
    router.push(suffix ? `/candidate/jobs?${suffix}` : "/candidate/jobs");
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
      <section className="relative left-1/2 mb-10 w-screen -translate-x-1/2 overflow-hidden bg-[#123983] pb-10 pt-12 shadow-[0_24px_58px_rgba(18,57,131,0.24)] md:min-h-[390px] md:pb-14 md:pt-16">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[44%] md:block">
          <svg className="absolute right-0 top-7 h-[266px] w-[373px]" viewBox="0 0 373 266" fill="none" aria-hidden="true">
            <path fill="#fff" fillOpacity=".05" fillRule="evenodd" d="M3.72 45.424A187.092 187.092 0 0 0 .603 79.507c0 102.748 83.294 186.041 186.042 186.041s186.042-83.293 186.042-186.041c0-72.89-41.917-135.99-102.962-166.507V6.215c17.243 19.531 27.706 45.19 27.706 73.291 0 61.188-49.601 110.79-110.788 110.79-61.188 0-110.79-49.602-110.79-110.79 0-11.891 1.874-23.345 5.342-34.082H3.719Z" clipRule="evenodd" />
          </svg>
          <svg className="absolute -right-12 bottom-[-4.5rem] h-[302px] w-[163px]" viewBox="0 0 163 302" fill="none" aria-hidden="true">
            <path fill="#fff" fillRule="evenodd" d="M12 302c83.395 0 151-67.605 151-151S95.395 0 12 0s-151 67.605-151 151 67.605 151 151 151Zm0-61.079c49.662 0 89.921-40.259 89.921-89.921 0-49.662-40.26-89.921-89.922-89.921S-77.92 101.338-77.92 151c0 49.662 40.258 89.921 89.92 89.921Z" clipRule="evenodd" opacity=".05" />
          </svg>
          <svg className="absolute bottom-8 right-40 h-28 w-28" viewBox="0 0 112 112" fill="none" aria-hidden="true">
            <path fill="#fff" fillOpacity=".05" fillRule="evenodd" d="M56 112c30.928 0 56-25.072 56-56S86.928 0 56 0 0 25.072 0 56s25.072 56 56 56Zm0-25.667c16.752 0 30.333-13.58 30.333-30.333S72.753 25.667 56 25.667 25.666 39.247 25.666 56 39.247 86.333 56 86.333Z" clipRule="evenodd" />
          </svg>
          <svg className="absolute right-9 top-[46%] h-[78px] w-[125px] -translate-y-1/2" viewBox="0 0 125 78" fill="none" aria-hidden="true">
            <g opacity=".3" fill="#FCFCFC">
              {[2.9, 26.7, 50.5, 74.3, 98.1, 121.9].flatMap((cx) =>
                [2.9, 20.9, 39, 57.1, 75.1].map((cy) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.9" />),
              )}
            </g>
          </svg>
        </div>
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mb-6 max-w-2xl">
            <p className="text-sm font-bold uppercase text-white/75">Tìm việc nhanh</p>
            <h2 className="mt-1 text-2xl font-black text-white md:text-3xl">Khám phá cơ hội phù hợp với bạn</h2>
          </div>
          <form onSubmit={handleSearch} className="grid grid-cols-1 gap-2 rounded-3xl bg-white p-2 shadow-[0_18px_45px_rgba(3,65,56,0.28)] md:grid-cols-[minmax(0,1fr)_280px_auto]">
            <label className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-14 w-full rounded-2xl bg-transparent py-4 pl-12 pr-4 outline-none transition-all placeholder:text-outline-variant focus:bg-surface-container-low focus:ring-2 focus:ring-primary/35"
                placeholder="Chức danh, kỹ năng hoặc công ty"
              />
            </label>
            <label className="relative">
              <select
                value={selectedLocation}
                onChange={(event) => setSelectedLocation(event.target.value)}
                className="h-14 w-full appearance-none rounded-2xl border-t border-outline-variant/20 bg-transparent py-3 pl-11 pr-9 font-semibold text-on-surface outline-none transition-all focus:bg-surface-container-low focus:ring-2 focus:ring-primary/35 md:border-l md:border-t-0"
              >
                <option value="">Tất cả địa điểm</option>
                {locationOptions.map((location) => (
                  <option key={location.code} value={location.code}>
                    {location.name}
                  </option>
                ))}
              </select>
              <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
              <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-on-surface-variant" />
            </label>
            <button className="signature-gradient h-14 rounded-2xl px-8 font-bold text-white shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-95" type="submit">
              Tìm việc
            </button>
          </form>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters((current) => !current)}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-white/12 px-4 text-sm font-bold text-white transition-colors hover:bg-white/18"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/60 text-base leading-none">
                {showAdvancedFilters ? "-" : "+"}
              </span>
              Lọc nâng cao
            </button>
          </div>
          {showAdvancedFilters && (
            <div className="mt-3 rounded-3xl bg-white/10 p-3 backdrop-blur-sm">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
              <AdvancedSelect
                label="Ngành nghề"
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={categoryOptions.map((category) => ({ value: category.code, label: category.name }))}
              />
              <AdvancedSelect
                label="Loại hình"
                value={selectedEmploymentType}
                onChange={(value) => setSelectedEmploymentType(value as EmploymentType | "")}
                options={employmentTypeOptions}
              />
              <AdvancedSelect
                label="Chế độ làm việc"
                value={selectedWorkMode}
                onChange={(value) => setSelectedWorkMode(value as WorkMode | "")}
                options={workModeOptions}
              />
              <AdvancedSelect
                label="Cấp bậc"
                value={selectedLevel}
                onChange={(value) => setSelectedLevel(value as JobLevel | "")}
                options={levelOptions}
              />
              <AdvancedSelect
                label="Mức lương"
                value={selectedSalary}
                onChange={(value) => setSelectedSalary(value as SalaryFilterValue)}
                options={salaryOptions}
              />
            </div>
            </div>
          )}
        </div>
      </section>

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
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-outline-variant/15 bg-surface p-2">
                    {job.companyLogoUrl ? (
                      // Company logos are user-managed external images from Cloudinary.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="h-full w-full rounded-xl object-cover" src={job.companyLogoUrl} alt={`Logo ${job.companyName ?? "công ty"}`} />
                    ) : (
                      <Building2 className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold text-on-surface">{job.title}</h3>
                    <p className="mt-1 truncate text-sm text-on-surface-variant">{job.companyName ?? "Công ty"}</p>
                  </div>
                </div>
                {matchScore != null && <span className="shrink-0 rounded-full bg-secondary/10 px-3 py-1 text-xs font-black text-secondary">{Math.round(matchScore)}%</span>}
              </div>
              <p className="mt-4 flex items-center gap-1 text-sm text-on-surface-variant"><MapPin className="h-4 w-4" />{job.locationName ?? job.location ?? "Chưa cập nhật"}</p>
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

function AdvancedSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="relative block">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full appearance-none rounded-2xl bg-white/95 px-4 pr-9 text-sm font-semibold text-on-surface outline-none transition-all focus:ring-2 focus:ring-white/55"
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-on-surface-variant" />
    </label>
  );
}
