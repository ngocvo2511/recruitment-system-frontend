"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, BriefcaseBusiness, Download, Search, SlidersHorizontal } from "lucide-react";
import { ApiError, getRecruiterApplications, type ApplicationResponse } from "@/lib/api/applications";

type CandidateRow = {
  candidateId: string;
  candidateName?: string | null;
  candidateEmail?: string | null;
  candidatePhone?: string | null;
  latestApplication: ApplicationResponse;
  applications: ApplicationResponse[];
};

function formatDate(value?: string | null): string {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("vi-VN");
}

function buildCandidateRows(applications: ApplicationResponse[]): CandidateRow[] {
  const map = new Map<string, CandidateRow>();

  applications
    .filter((application) => application.status !== "WITHDRAWN")
    .forEach((application) => {
      const current = map.get(application.candidateId);
      if (!current) {
        map.set(application.candidateId, {
          candidateId: application.candidateId,
          candidateName: application.candidateName,
          candidateEmail: application.candidateEmail,
          candidatePhone: application.candidatePhone,
          latestApplication: application,
          applications: [application],
        });
        return;
      }

      current.applications.push(application);
      const latest = new Date(current.latestApplication.appliedAt ?? 0).getTime();
      const next = new Date(application.appliedAt ?? 0).getTime();
      if (next > latest) {
        current.latestApplication = application;
      }
    });

  return Array.from(map.values()).sort((a, b) => {
    const aTime = new Date(a.latestApplication.appliedAt ?? 0).getTime();
    const bTime = new Date(b.latestApplication.appliedAt ?? 0).getTime();
    return bTime - aTime;
  });
}

export default function CandidateDatabasePage() {
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const data = await getRecruiterApplications();
        if (active) setApplications(data);
      } catch (error) {
        if (!active) return;
        setErrorMessage(error instanceof ApiError ? error.message : "Không thể tải danh sách ứng viên.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const candidates = useMemo(() => buildCandidateRows(applications), [applications]);
  const filteredCandidates = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) return candidates;
    return candidates.filter((candidate) => {
      const haystack = [
        candidate.candidateName,
        candidate.candidateEmail,
        candidate.candidatePhone,
        candidate.latestApplication.jobTitle,
        candidate.latestApplication.companyName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [candidates, keyword]);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">Ứng viên đã nộp</h1>
          <p className="text-on-surface-variant max-w-xl">
            Danh sách candidate được tổng hợp từ các đơn ứng tuyển vào công ty của bạn.
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-6 py-2.5 bg-surface-container-high rounded-full font-semibold text-sm hover:bg-surface-container-highest transition-colors"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      <div className="glass-card rounded-xl p-6 mb-8 border border-outline-variant/10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-2 relative">
            <label className="block text-[10px] font-bold uppercase tracking-[0.05em] text-on-surface-variant mb-2 ml-1">
              Tìm kiếm
            </label>
            <Search className="absolute left-4 bottom-3 w-5 h-5 text-outline" />
            <input
              className="w-full bg-surface-container-high border-none rounded-xl pl-11 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
              placeholder="Tên, email, vị trí ứng tuyển..."
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.05em] text-on-surface-variant mb-2 ml-1">
              Tổng ứng viên
            </label>
            <div className="rounded-xl bg-surface-container-high px-4 py-2.5 text-sm font-bold text-on-surface">
              {filteredCandidates.length}
            </div>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              className="w-full bg-secondary/10 text-secondary border border-secondary/20 rounded-xl py-2.5 font-bold text-sm hover:bg-secondary/20 transition-all flex items-center justify-center gap-2"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Bộ lọc
            </button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm font-medium text-error">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/50 text-[10px] font-bold uppercase tracking-[0.05em] text-on-surface-variant">
                <th className="px-6 py-4">Ứng viên</th>
                <th className="px-6 py-4">Vị trí gần nhất</th>
                <th className="px-6 py-4">Số đơn</th>
                <th className="px-6 py-4">AI Match</th>
                <th className="px-6 py-4">Ngày nộp</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr>
                  <td className="px-6 py-8 text-on-surface-variant" colSpan={6}>
                    Đang tải danh sách ứng viên...
                  </td>
                </tr>
              ) : filteredCandidates.length === 0 ? (
                <tr>
                  <td className="px-6 py-10 text-center text-on-surface-variant" colSpan={6}>
                    <BriefcaseBusiness className="mx-auto mb-3 h-9 w-9 text-primary" />
                    Chưa có ứng viên phù hợp.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((candidate) => {
                  const latest = candidate.latestApplication;
                  const matchScore = latest.aiScore != null ? Math.round(latest.aiScore) : null;

                  return (
                    <tr key={candidate.candidateId} className="bg-surface-container-lowest hover:bg-surface-container-low/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
                            {(candidate.candidateName ?? candidate.candidateEmail ?? "?").slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-on-surface">{candidate.candidateName ?? "Ứng viên"}</p>
                            <p className="text-xs text-on-surface-variant">{candidate.candidateEmail ?? candidate.candidatePhone ?? "--"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-on-surface">{latest.jobTitle}</p>
                        <p className="text-xs text-on-surface-variant">{latest.cvName ?? "CV đã nộp"}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-bold text-on-surface">
                          {candidate.applications.length}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {matchScore == null ? (
                          <span className="text-sm text-on-surface-variant">--</span>
                        ) : (
                          <div className="flex flex-col gap-1.5" title={`Điểm AI Match được tính lúc ứng viên nộp đơn (${formatDate(latest.appliedAt)}). Xem trang "Gợi ý AI" để xem điểm real-time.`}>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase rounded-sm border border-primary/20">AI Match</span>
                              <span className="text-sm font-black text-secondary">{matchScore}%</span>
                              <span className="text-[10px] text-on-surface-variant">(lúc nộp đơn)</span>
                            </div>
                            <div className="w-20 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                              <div className="h-full signature-gradient" style={{ width: `${matchScore}%` }} />
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 text-sm text-on-surface-variant">{formatDate(latest.appliedAt)}</td>
                      <td className="px-6 py-5 text-right">
                        <Link
                          href="/recruiter/pipeline"
                          className="inline-block px-5 py-2 bg-surface-variant/30 text-on-surface hover:bg-primary hover:text-white rounded-full text-xs font-bold transition-all shadow-sm"
                        >
                          Xem pipeline
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
