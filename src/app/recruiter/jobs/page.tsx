"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Ban, CalendarDays, Edit2, Eye, Filter, Loader2, Plus, Trash2 } from "lucide-react";
import { getJobs, type JobResponse, type JobStatus } from "@/lib/api/jobs";

const statusLabel: Record<JobStatus, string> = {
  DRAFT: "Bản nháp",
  PENDING: "Chờ duyệt",
  PUBLISHED: "Đang đăng",
  REJECTED: "Bị từ chối",
  FLAGGED: "Bị gắn cờ",
  CLOSED: "Đã đóng",
};

const statusClass: Record<JobStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  PENDING: "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  FLAGGED: "bg-orange-100 text-orange-700",
  CLOSED: "bg-surface-container text-on-surface-variant",
};

function formatSalary(job: JobResponse) {
  if (job.salaryNegotiable) return "Lương thỏa thuận";
  const currency = job.currency ? ` ${job.currency}` : "";
  if (job.minSalary && job.maxSalary) {
    return `${job.minSalary.toLocaleString("vi-VN")} - ${job.maxSalary.toLocaleString("vi-VN")}${currency}`;
  }
  if (job.minSalary) return `Từ ${job.minSalary.toLocaleString("vi-VN")}${currency}`;
  if (job.maxSalary) return `Đến ${job.maxSalary.toLocaleString("vi-VN")}${currency}`;
  return "Chưa cập nhật lương";
}

function formatDate(value?: string | null) {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

export default function RecruiterJobManagementPage() {
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadJobs() {
      setLoading(true);
      setError("");
      try {
        const result = await getJobs();
        if (mounted) setJobs(result);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Không thể tải danh sách tin tuyển dụng.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void loadJobs();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const published = jobs.filter((job) => job.status === "PUBLISHED").length;
    const pending = jobs.filter((job) => job.status === "PENDING").length;
    const closed = jobs.filter((job) => job.status === "CLOSED").length;
    return { published, pending, closed, total: jobs.length };
  }, [jobs]);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      <div className="mb-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-on-surface mb-2">Quản lý tin tuyển dụng</h2>
          <p className="text-on-surface-variant max-w-xl">Tạo, theo dõi và tối ưu các vị trí đang tuyển của công ty.</p>
        </div>
        <Link href="/recruiter/jobs/create" className="px-6 py-2.5 rounded-full text-sm font-bold bg-primary text-white signature-gradient shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 self-start">
          <Plus className="w-5 h-5" />
          Tạo tin mới
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 border border-red-100 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatCard label="Tổng tin" value={stats.total} />
        <StatCard label="Đang đăng" value={stats.published} tone="text-green-700" />
        <StatCard label="Chờ duyệt" value={stats.pending} tone="text-amber-700" />
        <StatCard label="Đã đóng" value={stats.closed} />
      </div>

      <div className="flex flex-wrap gap-4 mb-8 items-center bg-surface-container-low/50 p-4 rounded-2xl backdrop-blur-sm border border-outline-variant/10">
        <div className="flex items-center gap-2">
          <Filter className="text-outline w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Bộ lọc</span>
        </div>
        <div className="hidden md:block h-6 w-px bg-outline-variant/30 mx-2"></div>
        <select className="bg-surface-container-lowest border-none rounded-xl text-sm font-medium px-4 py-2 focus:ring-primary/20 shadow-sm cursor-pointer outline-none">
          <option>Tất cả trạng thái</option>
          <option>Đang đăng</option>
          <option>Chờ duyệt</option>
          <option>Đã đóng</option>
        </select>
        <button className="md:ml-auto flex items-center gap-2 px-4 py-2 bg-surface-container-lowest text-on-surface rounded-xl text-sm font-semibold shadow-sm hover:bg-surface-container transition-colors border border-outline-variant/10">
          <CalendarDays className="w-4 h-4" />
          Khoảng thời gian
        </button>
      </div>

      <div className="glass-card rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden border border-white/40">
        {loading ? (
          <div className="h-56 flex items-center justify-center text-on-surface-variant">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Đang tải tin tuyển dụng...
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-10 text-center text-on-surface-variant">
            Chưa có tin tuyển dụng. Hãy tạo tin đầu tiên để bắt đầu nhận ứng viên.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-surface-container-low/30 border-b border-outline-variant/10">
                  <th className="px-8 py-5 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">Vị trí</th>
                  <th className="px-6 py-5 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">Công ty</th>
                  <th className="px-6 py-5 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">Ngày tạo</th>
                  <th className="px-6 py-5 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant text-center">Trạng thái</th>
                  <th className="px-8 py-5 text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {jobs.map((job) => (
                  <tr key={job.id} className="group hover:bg-primary/5 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-on-surface text-base group-hover:text-primary transition-colors">{job.title}</span>
                        <span className="text-xs text-on-surface-variant">
                          {[job.employmentType, job.workMode, job.level, job.location].filter(Boolean).join(" · ")}
                        </span>
                        {job.categories.length > 0 && (
                          <span className="text-xs font-medium text-on-surface-variant">
                            {job.categories.map((category) => category.name).join(", ")}
                          </span>
                        )}
                        <span className="text-xs font-semibold text-primary">{formatSalary(job)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-sm font-medium text-on-surface-variant">{job.companyName ?? "Chưa có công ty"}</span>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-sm font-medium text-on-surface-variant">{formatDate(job.createdAt)}</span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full ${statusClass[job.status]}`}>{statusLabel[job.status]}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Link href="/recruiter/pipeline" className="p-2 text-outline hover:text-primary transition-colors" title="Xem pipeline">
                          <Eye className="w-5 h-5" />
                        </Link>
                        <button className="p-2 text-outline hover:text-primary transition-colors" title="Chỉnh sửa">
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-outline hover:text-error transition-colors" title="Đóng tin">
                          <Ban className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-outline hover:text-error transition-colors" title="Xóa">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, tone = "text-on-surface" }: { label: string; value: number; tone?: string }) {
  return (
    <div className="glass-card p-6 rounded-xl shadow-sm border border-white/40">
      <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1">{label}</p>
      <span className={`text-3xl font-extrabold tracking-tighter ${tone}`}>{value}</span>
    </div>
  );
}
