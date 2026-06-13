"use client";

import Link from "next/link";
import { Bookmark, Building2, Clock, MapPin, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  ApiError,
  getSavedJobs,
  removeSavedJob,
  type SavedJobResponse,
} from "@/lib/api/jobs";

function formatDate(value?: string | null): string {
  if (!value) return "--";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "--" : date.toLocaleDateString("vi-VN");
}

export default function SavedJobsPage() {
  const [items, setItems] = useState<SavedJobResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    getSavedJobs()
      .then(setItems)
      .catch((error) => {
        setErrorMessage(error instanceof ApiError ? error.message : "Không thể tải việc làm đã lưu.");
      })
      .finally(() => setLoading(false));
  }, []);

  const remove = async (jobId: string) => {
    setRemovingId(jobId);
    setErrorMessage(null);
    try {
      await removeSavedJob(jobId);
      setItems((current) => current.filter((item) => item.job.id !== jobId));
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Không thể bỏ lưu công việc.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-black text-on-surface">Việc làm đã lưu</h1>
        <p className="mt-2 text-on-surface-variant">Những cơ hội bạn muốn xem lại hoặc ứng tuyển sau.</p>
      </header>

      {errorMessage && (
        <div className="mb-5 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <p className="text-on-surface-variant">Đang tải việc làm đã lưu...</p>
      ) : items.length === 0 ? (
        <section className="flex flex-col items-center border border-outline-variant/20 bg-surface-container-lowest px-6 py-14 text-center">
          <Bookmark className="mb-4 h-10 w-10 text-primary" />
          <h2 className="text-xl font-bold text-on-surface">Bạn chưa lưu công việc nào</h2>
          <Link href="/candidate/jobs" className="mt-5 rounded-full bg-primary px-6 py-3 font-bold text-white">
            Khám phá việc làm
          </Link>
        </section>
      ) : (
        <div className="space-y-4">
          {items.map(({ job, savedAt }) => (
            <article
              key={job.id}
              className="flex flex-col gap-5 border border-outline-variant/20 bg-surface-container-lowest p-6 md:flex-row md:items-center"
            >
              <div className="min-w-0 flex-1">
                <Link href={`/candidate/jobs/${job.id}`} className="text-xl font-bold text-on-surface hover:text-primary">
                  {job.title}
                </Link>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-on-surface-variant">
                  <span className="flex items-center gap-1"><Building2 className="h-4 w-4" />{job.companyName ?? "Công ty"}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location ?? "--"}</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" />Đã lưu {formatDate(savedAt)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/candidate/jobs/${job.id}`} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white">
                  Xem chi tiết
                </Link>
                <button
                  type="button"
                  title="Bỏ lưu"
                  aria-label="Bỏ lưu công việc"
                  disabled={removingId === job.id}
                  onClick={() => void remove(job.id)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-error/20 text-error hover:bg-error/10 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
