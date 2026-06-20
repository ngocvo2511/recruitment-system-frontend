"use client";

import { useEffect, useMemo, useState } from "react";
import { Bookmark, Building2, ChevronRight, Clock, MapPin, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import {
  ApiError,
  getJobCategories,
  getJobRecommendations,
  getLocations,
  getSavedJobs,
  removeSavedJob,
  saveJob,
  searchJobsFts,
  type EmploymentType,
  type JobCategory,
  type JobLevel,
  type JobLocation,
  type JobRecommendationResponse,
  type JobResponse,
  type JobSearchSort,
  type WorkMode,
} from "@/lib/api/jobs";

const PAGE_SIZE = 12;

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

const sortOptions: Array<{ value: JobSearchSort; label: string }> = [
  { value: "RELEVANCE", label: "Phù hợp nhất" },
  { value: "NEWEST", label: "Mới nhất" },
  { value: "OLDEST", label: "Cũ nhất" },
  { value: "SALARY_DESC", label: "Lương cao nhất" },
];

type SalaryFilterValue = "" | "UNDER_10" | "FROM_10_TO_20" | "FROM_20_TO_30" | "FROM_30_TO_50" | "ABOVE_50" | "NEGOTIABLE";

const salaryOptions: Array<{ value: SalaryFilterValue; label: string; salaryMin?: number; salaryMax?: number; salaryNegotiable?: boolean }> = [
  { value: "UNDER_10", label: "Dưới 10 triệu", salaryMax: 10000000 },
  { value: "FROM_10_TO_20", label: "10 - 20 triệu", salaryMin: 10000000, salaryMax: 20000000 },
  { value: "FROM_20_TO_30", label: "20 - 30 triệu", salaryMin: 20000000, salaryMax: 30000000 },
  { value: "FROM_30_TO_50", label: "30 - 50 triệu", salaryMin: 30000000, salaryMax: 50000000 },
  { value: "ABOVE_50", label: "Trên 50 triệu", salaryMin: 50000000 },
  { value: "NEGOTIABLE", label: "Thỏa thuận", salaryNegotiable: true },
];

function formatDate(value?: string | null): string {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("vi-VN");
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
  if (job.salaryNegotiable) return "Thỏa thuận";
  const min = job.minSalary ?? null;
  const max = job.maxSalary ?? null;
  const currency = job.currency ?? "VND";
  if (min != null && max != null) return `${formatMoneyAmount(min, currency)} - ${formatMoneyAmount(max, currency)}`;
  if (min != null) return `Từ ${formatMoneyAmount(min, currency)}`;
  if (max != null) return `Đến ${formatMoneyAmount(max, currency)}`;
  return "--";
}

export default function CandidateJobsPage() {
  const [jobs, setJobs] = useState<JobRecommendationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [savingJobId, setSavingJobId] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<JobCategory[]>([]);
  const [locationOptions, setLocationOptions] = useState<JobLocation[]>([]);

  const [searchQueryInput, setSearchQueryInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedEmploymentType, setSelectedEmploymentType] = useState<EmploymentType | "">("");
  const [selectedWorkMode, setSelectedWorkMode] = useState<WorkMode | "">("");
  const [selectedLevel, setSelectedLevel] = useState<JobLevel | "">("");
  const [selectedSalary, setSelectedSalary] = useState<SalaryFilterValue>("");
  const [sort, setSort] = useState<JobSearchSort>("RELEVANCE");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const hasActiveFilters =
    Boolean(selectedLocation) ||
    Boolean(selectedCategory) ||
    Boolean(selectedEmploymentType) ||
    Boolean(selectedWorkMode) ||
    Boolean(selectedLevel) ||
    Boolean(selectedSalary) ||
    sort !== "RELEVANCE";


  useEffect(() => {
    getJobCategories()
      .then(setCategoryOptions)
      .catch(() => setCategoryOptions([]));
    getLocations()
      .then(setLocationOptions)
      .catch(() => setLocationOptions([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("query")?.trim() ?? "";
    const initialLocation = params.get("location")?.trim() ?? "";
    const initialCategory = params.get("category")?.trim() ?? "";
    const initialEmploymentType = params.get("employmentType")?.trim() ?? "";
    const initialWorkMode = params.get("workMode")?.trim() ?? "";
    const initialLevel = params.get("level")?.trim() ?? "";
    const initialSalary = params.get("salary")?.trim() ?? "";
    queueMicrotask(() => {
      if (initialQuery) {
        setSearchQueryInput(initialQuery);
        setSearchQuery(initialQuery);
      }
      if (initialLocation) {
        setSelectedLocation(initialLocation);
      }
      if (initialCategory) setSelectedCategory(initialCategory);
      if (initialEmploymentType) setSelectedEmploymentType(initialEmploymentType as EmploymentType);
      if (initialWorkMode) setSelectedWorkMode(initialWorkMode as WorkMode);
      if (initialLevel) setSelectedLevel(initialLevel as JobLevel);
      if (initialSalary) setSelectedSalary(initialSalary as SalaryFilterValue);
    });
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) setLoading(true);
    });

    const trimmedQuery = searchQuery.trim();
    const salaryFilter = salaryOptions.find((option) => option.value === selectedSalary);
    const filters = {
      categoryCode: selectedCategory || undefined,
      locations: selectedLocation ? [selectedLocation] : undefined,
      employmentTypes: selectedEmploymentType ? [selectedEmploymentType] : undefined,
      workModes: selectedWorkMode ? [selectedWorkMode] : undefined,
      levels: selectedLevel ? [selectedLevel] : undefined,
      salaryMin: salaryFilter?.salaryMin,
      salaryMax: salaryFilter?.salaryMax,
      salaryNegotiable: salaryFilter?.salaryNegotiable,
      sort,
    };

    const request = !trimmedQuery && !hasActiveFilters
      ? getJobRecommendations(limit)
      : searchJobsFts(trimmedQuery, limit, "PUBLISHED", filters).then((data) =>
          data.map((item) => ({
            job: item.job,
            matchScore: item.rank ? Math.round(item.rank * 100) : null,
          })),
        );

    request
      .then((data) => {
        if (!active) return;
        setJobs(data);
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        if (!active) return;
        const message = error instanceof ApiError ? error.message : "Không thể tải tin tuyển dụng.";
        setErrorMessage(message);
        setJobs([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });


    return () => {
      active = false;
    };

  }, [
    searchQuery,
    selectedLocation,
    selectedCategory,
    selectedEmploymentType,
    selectedWorkMode,
    selectedLevel,
    selectedSalary,
    sort,
    limit,
    hasActiveFilters,
  ]);


  useEffect(() => {
    getSavedJobs()
      .then((items) => setSavedJobIds(new Set(items.map((item) => item.job.id))))
      .catch(() => setSavedJobIds(new Set()));
  }, []);

  const jobList = useMemo(() => jobs, [jobs]);

  const resetFilters = () => {
    setSelectedLocation("");
    setSelectedCategory("");
    setSelectedEmploymentType("");
    setSelectedWorkMode("");
    setSelectedLevel("");
    setSelectedSalary("");
    setSort("RELEVANCE");
    setLimit(PAGE_SIZE);
  };

  const submitSearch = () => {
    setSearchQuery(searchQueryInput.trim());
    setLimit(PAGE_SIZE);
  };

  const toggleSavedJob = async (jobId: string) => {
    if (savingJobId) return;
    const currentlySaved = savedJobIds.has(jobId);
    setSavingJobId(jobId);
    try {
      if (currentlySaved) await removeSavedJob(jobId);
      else await saveJob(jobId);
      setSavedJobIds((current) => {
        const next = new Set(current);
        if (currentlySaved) next.delete(jobId);
        else next.add(jobId);
        return next;
      });
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Không thể cập nhật công việc đã lưu.");
    } finally {
      setSavingJobId(null);
    }
  };

  return (
    <div className="w-full">
      <section className="sticky top-20 z-30 w-full bg-[#123983] px-6 py-4 shadow-[0_18px_42px_rgba(18,57,131,0.22)] lg:px-8">
        <div className="relative mx-auto max-w-[90rem] overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[32%] md:block">
            <svg className="absolute right-0 top-[-4.5rem] h-[266px] w-[373px]" viewBox="0 0 373 266" fill="none" aria-hidden="true">
              <path fill="#fff" fillOpacity=".05" fillRule="evenodd" d="M3.72 45.424A187.092 187.092 0 0 0 .603 79.507c0 102.748 83.294 186.041 186.042 186.041s186.042-83.293 186.042-186.041c0-72.89-41.917-135.99-102.962-166.507V6.215c17.243 19.531 27.706 45.19 27.706 73.291 0 61.188-49.601 110.79-110.788 110.79-61.188 0-110.79-49.602-110.79-110.79 0-11.891 1.874-23.345 5.342-34.082H3.719Z" clipRule="evenodd" />
            </svg>
            <svg className="absolute -right-12 bottom-[-7rem] h-[302px] w-[163px]" viewBox="0 0 163 302" fill="none" aria-hidden="true">
              <path fill="#fff" fillRule="evenodd" d="M12 302c83.395 0 151-67.605 151-151S95.395 0 12 0s-151 67.605-151 151 67.605 151 151 151Zm0-61.079c49.662 0 89.921-40.259 89.921-89.921 0-49.662-40.26-89.921-89.922-89.921S-77.92 101.338-77.92 151c0 49.662 40.258 89.921 89.92 89.921Z" clipRule="evenodd" opacity=".05" />
            </svg>
            <svg className="absolute right-8 top-1/2 h-[78px] w-[125px] -translate-y-1/2" viewBox="0 0 125 78" fill="none" aria-hidden="true">
              <g opacity=".3" fill="#FCFCFC">
                {[2.9, 26.7, 50.5, 74.3, 98.1, 121.9].flatMap((cx) =>
                  [2.9, 20.9, 39, 57.1, 75.1].map((cy) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.9" />),
                )}
              </g>
            </svg>
          </div>
          <div className="relative z-10 grid w-full grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_280px_auto]">
            <div className="relative">
              <input
                className="h-14 w-full rounded-2xl bg-surface-container-high py-4 pl-12 pr-4 text-left outline-none transition-all placeholder:text-outline-variant focus:ring-2 focus:ring-primary/40"
                placeholder="Vị trí, kỹ năng hoặc công ty..."
                type="text"
                value={searchQueryInput}
                onChange={(event) => setSearchQueryInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submitSearch();
                }}
              />
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
            </div>
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(event) => {
                  setSelectedLocation(event.target.value);
                  setLimit(PAGE_SIZE);
                }}
                className="h-14 w-full appearance-none rounded-2xl bg-surface-container-high py-3 pl-11 pr-9 text-left font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
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
            </div>
            <button
              type="button"
              onClick={submitSearch}
              className="signature-gradient h-14 rounded-2xl px-8 font-bold text-white shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-95"
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-[90rem] mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 mb-32 pt-8">
        <aside className="lg:col-span-3">
          <div className="custom-scrollbar space-y-8 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
            <h4 className="text-sm font-bold tracking-widest uppercase text-on-surface-variant mb-6">Lọc kết quả</h4>
            <div className="space-y-6">
              <div>
                <label className="mb-3 block font-bold text-on-surface" htmlFor="job-category">
                  Ngành nghề
                </label>
                <select
                  id="job-category"
                  value={selectedCategory}
                  onChange={(event) => {
                    setSelectedCategory(event.target.value);
                    setLimit(PAGE_SIZE);
                  }}
                  className="w-full rounded-xl border-none bg-surface-container-high px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">Tất cả ngành nghề</option>
                  {categoryOptions.map((category) => (
                    <option key={category.code} value={category.code}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <FilterRadioGroup
                title="Loại hình"
                options={employmentTypeOptions}
                value={selectedEmploymentType}
                onChange={(value) => {
                  setSelectedEmploymentType(value);
                  setLimit(PAGE_SIZE);
                }}
              />

              <FilterRadioGroup
                title="Chế độ làm việc"
                options={workModeOptions}
                value={selectedWorkMode}
                onChange={(value) => {
                  setSelectedWorkMode(value);
                  setLimit(PAGE_SIZE);
                }}
              />

              <FilterRadioGroup
                title="Cấp bậc"
                options={levelOptions}
                value={selectedLevel}
                onChange={(value) => {
                  setSelectedLevel(value);
                  setLimit(PAGE_SIZE);
                }}
              />

              <FilterRadioGroup
                title="Mức lương"
                options={salaryOptions}
                value={selectedSalary}
                onChange={(value) => {
                  setSelectedSalary(value);
                  setLimit(PAGE_SIZE);
                }}
              />

              {(hasActiveFilters || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    resetFilters();
                    setSearchQuery("");
                    setSearchQueryInput("");
                  }}
                  className="w-full rounded-xl border border-outline-variant/30 px-4 py-2 text-sm font-bold text-on-surface-variant hover:text-primary"
                >
                  Xóa tìm kiếm và bộ lọc
                </button>
              )}
            </div>

            <div className="glass-card p-6 rounded-3xl border border-secondary/20 bg-secondary/5 relative overflow-hidden">
              <Sparkles className="text-secondary mb-3 w-6 h-6" />
              <h5 className="font-bold mb-2 text-on-surface">Gợi ý từ AI</h5>
              <p className="text-sm text-on-surface-variant mb-4">
                Khi không dùng bộ lọc, danh sách sẽ ưu tiên công việc phù hợp với hồ sơ của bạn.
              </p>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-9">
          <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-bold text-on-surface-variant">Hiển thị {jobList.length} kết quả</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-on-surface-variant">Sắp xếp:</span>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value as JobSearchSort);
                    setLimit(PAGE_SIZE);
                  }}
                  className="appearance-none rounded-xl bg-surface-container-high px-4 py-2 pr-8 text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronRight className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-on-surface-variant" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {loading && <div className="text-on-surface-variant">Đang tải việc làm...</div>}
            {!loading && errorMessage && <div className="text-error">{errorMessage}</div>}
            {!loading && !errorMessage && jobList.length === 0 && (
              <div className="text-on-surface-variant">Chưa có việc làm phù hợp.</div>
            )}
            {!loading && !errorMessage && jobList.map(({ job, matchScore }, index) => (
              <div
                key={job.id}
                className="group bg-surface-container-lowest p-6 rounded-3xl border border-transparent hover:border-primary/10 hover:shadow-[0_8px_32px_0_rgba(0,80,212,0.05)] transition-all flex flex-col md:flex-row gap-6 items-start md:items-center"
              >
                <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-outline-variant/35 bg-white shadow-sm">
                  {job.companyLogoUrl ? (
                    // Company logos are user-managed external images from Cloudinary.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="h-full w-full object-cover" src={job.companyLogoUrl} alt={`Logo ${job.companyName ?? "công ty"}`} />
                  ) : (
                    <Building2 className="h-12 w-12 text-primary" />
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors text-on-surface">{job.title}</h3>
                    {index === 0 && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded">Mới</span>}
                    {matchScore != null && (
                      <span className="flex items-center gap-1 px-3 py-1 signature-gradient text-white text-[11px] font-black uppercase rounded-full shadow-md shadow-primary/20">
                        <Sparkles className="w-3 h-3" />
                        {matchScore}% phù hợp AI
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-on-surface-variant font-medium mt-2">
                    <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {job.companyName ?? "Công ty"}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.locationName ?? job.location ?? "--"}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {formatDate(job.publishedAt ?? job.createdAt)}</span>
                  </div>
                  {job.categories.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.categories.map((category) => (
                        <span key={category.code} className="rounded-full bg-primary/8 px-3 py-1 text-xs font-bold text-primary">
                          {category.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex md:flex-col items-end gap-2 shrink-0 w-full md:w-auto">
                  <span className="text-lg font-black text-primary">{formatSalary(job)}</span>
                  <div className="flex w-full gap-2 md:w-auto">
                    <button
                      type="button"
                      aria-label={savedJobIds.has(job.id) ? "Bỏ lưu công việc" : "Lưu công việc"}
                      title={savedJobIds.has(job.id) ? "Bỏ lưu" : "Lưu công việc"}
                      disabled={savingJobId === job.id}
                      onClick={() => void toggleSavedJob(job.id)}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors disabled:opacity-50 ${
                        savedJobIds.has(job.id)
                          ? "border-primary bg-primary text-white"
                          : "border-outline-variant/30 bg-surface text-on-surface-variant hover:text-primary"
                      }`}
                    >
                      <Bookmark className={`h-5 w-5 ${savedJobIds.has(job.id) ? "fill-current" : ""}`} />
                    </button>
                    <Link href={`/candidate/jobs/${job.id}`} className="px-6 py-2 bg-surface text-on-surface-variant font-bold rounded-xl hover:bg-primary hover:text-white transition-all w-full md:w-auto text-center">
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => setLimit((current) => current + PAGE_SIZE)}
              disabled={loading || jobList.length < limit}
              className="px-8 py-3 bg-white/50 border border-outline-variant/30 rounded-full font-bold hover:bg-white transition-colors text-on-surface disabled:cursor-not-allowed disabled:opacity-50"
            >
              Tải thêm việc làm
            </button>
          </div>

        </div>
      </section>
    </div>
  );
}

function FilterRadioGroup<T extends string>({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: Array<{ value: T; label: string }>;
  value: T | "";
  onChange: (value: T | "") => void;
}) {
  return (
    <div>
      <p className="font-bold mb-4 text-on-surface">{title}</p>
      <div className="grid grid-cols-2 gap-2 text-on-surface">
        <label className={`flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 py-2 text-sm font-semibold transition-colors ${
          value === ""
            ? "border-primary bg-primary/10 text-primary"
            : "border-outline-variant/20 bg-transparent text-on-surface-variant hover:border-outline-variant/40 hover:text-on-surface"
        }`}>
          <input
            checked={value === ""}
            className="h-4 w-4 accent-primary"
            type="radio"
            onChange={() => onChange("")}
          />
          <span className="whitespace-nowrap">Tất cả</span>
        </label>
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 py-2 text-sm font-semibold transition-colors ${
              value === option.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-outline-variant/20 bg-transparent text-on-surface-variant hover:border-outline-variant/40 hover:text-on-surface"
            }`}
          >
            <input
              checked={value === option.value}
              className="h-4 w-4 accent-primary"
              type="radio"
              onChange={() => onChange(option.value)}
            />
            <span className="whitespace-nowrap leading-tight">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
