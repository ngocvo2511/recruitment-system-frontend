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

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const jobId = params?.id;
  const [job, setJob] = useState<JobResponse | null>(null);
  const [match, setMatch] = useState<JobMatchScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
                {match?.fitScore != null ? `${match.fitScore}% AI Match` : "Chưa có điểm AI Match"}
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
        </div>
      </div>
    </div>
  );
}
