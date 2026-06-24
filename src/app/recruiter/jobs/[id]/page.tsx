"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Briefcase, Building2, CircleDollarSign, Clock, Edit2, MapPin } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ApiError,
  getJobById,
  type JobResponse,
} from "@/lib/api/jobs";

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

export default function RecruiterJobDetailPage() {
  const params = useParams<{ id: string }>();
  const jobId = params?.id;
  const [job, setJob] = useState<JobResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
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

  const requirementSections = useMemo(() => {
    if (!job?.requirementSections) return [];
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
  }, [job]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-on-surface-variant">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
        Đang tải tin tuyển dụng...
      </div>
    );
  }

  if (errorMessage || !job) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-6 w-full text-red-600 font-medium">
        {errorMessage ?? "Không tìm thấy tin tuyển dụng."}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-6">
      <Link href="/recruiter/jobs" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary font-medium mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Quay lại danh sách tin tuyển dụng
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="glass-card rounded-[2rem] p-8 md:p-10 shadow-lg relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

          {/* Header */}
          <div className="relative mb-5 border-b border-outline-variant/10 pb-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-outline-variant/15 bg-white shadow-sm">
                {job.companyLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="h-full w-full object-cover" src={job.companyLogoUrl} alt={`Logo ${job.companyName ?? "công ty"}`} />
                ) : (
                  <Building2 className="h-9 w-9 text-primary" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-on-surface mb-2">{job.title}</h1>
                <div className="flex flex-wrap gap-4 text-on-surface-variant text-sm font-medium">
                  <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {job.companyName ?? "Công ty"}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location ?? "--"}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Đăng: {formatDate(job.publishedAt ?? job.createdAt)}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    Trạng thái: {job.status}
                  </span>
                  {job.categories.map((category) => (
                    <span key={category.code} className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">
                      {category.name}
                    </span>
                  ))}
                </div>
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
                <p className="text-sm font-semibold text-on-surface-variant">Hình thức</p>
                <p className="mt-1 text-base font-black text-on-surface">
                  {employmentTypeLabel[job.employmentType ?? ""] || job.employmentType || "--"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Briefcase className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-on-surface-variant">Cấp bậc</p>
                <p className="mt-1 text-base font-black text-on-surface">{levelLabel[job.level ?? ""] || job.level || "--"}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-8 mt-8">
            <section>
              <h2 className="text-xl font-bold mb-3 text-on-surface">Mô tả công việc</h2>
              <p className="text-on-surface-variant leading-relaxed whitespace-pre-line">
                {job.description ?? "Thông tin mô tả đang được cập nhật."}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3 text-on-surface">Yêu cầu</h2>
              {requirementSections.length > 0 ? (
                <div className="space-y-6">
                  {requirementSections.map((section) => (
                    <div key={section.key} className="space-y-2">
                      <h3 className="text-base font-semibold text-on-surface">{section.title}</h3>
                      <ul className="space-y-2">
                        {section.items.map((req, i) => (
                          <li key={i} className="flex items-start gap-3 text-on-surface-variant">
                            <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0"></span>
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
          </div>
        </div>

        {/* Recruiter Sidebar Actions */}
        <div className="glass-card rounded-[2rem] p-6 border border-white/40 shadow-sm space-y-6">
          <h3 className="font-bold text-lg text-on-surface">Thông tin đăng tuyển</h3>
          
          <div className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-outline-variant/10 pb-2">
              <span className="text-on-surface-variant">Chế độ làm việc</span>
              <span className="font-semibold">{workModeLabel[job.workMode ?? ""] || job.workMode || "--"}</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/10 pb-2">
              <span className="text-on-surface-variant">Số lượng tuyển</span>
              <span className="font-semibold">{job.headcount ?? 1} người</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/10 pb-2">
              <span className="text-on-surface-variant">Hạn nộp hồ sơ</span>
              <span className="font-semibold">{formatDate(job.deadline)}</span>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              href={`/recruiter/jobs/edit/${job.id}`}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Edit2 className="w-4 h-4" />
              Chỉnh sửa tin đăng
            </Link>
            
            <Link
              href={`/recruiter/pipeline?jobId=${job.id}`}
              className="w-full flex items-center justify-center gap-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold py-3 px-4 rounded-xl transition-all"
            >
              <Briefcase className="w-4 h-4" />
              Xem ứng viên (Pipeline)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Loader2({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`animate-spin ${className}`}
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
