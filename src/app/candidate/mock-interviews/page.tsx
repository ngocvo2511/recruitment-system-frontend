"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock3, Mic } from "lucide-react";
import { listMockInterviews, type MockInterviewSession } from "@/lib/api/mockInterviews";

export default function MockInterviewHistoryPage() {
  const [sessions, setSessions] = useState<MockInterviewSession[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listMockInterviews()
      .then(setSessions)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Không thể tải lịch sử."));
  }, []);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-8">
        <p className="text-sm font-semibold text-primary">AI Mock Interview</p>
        <h1 className="text-3xl font-black">Lịch sử luyện phỏng vấn</h1>
      </div>
      {error && <p className="rounded-xl bg-error/10 p-4 text-error">{error}</p>}
      <div className="grid gap-4">
        {sessions.map((session) => {
          const href = session.status === "COMPLETED"
            ? `/candidate/mock-interviews/${session.id}/result`
            : `/candidate/mock-interviews/${session.id}`;
          return (
            <Link key={session.id} href={href} className="glass-card flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6 transition hover:-translate-y-0.5">
              <div className="flex items-center gap-4">
                <span className="rounded-2xl bg-primary/10 p-3 text-primary"><Mic className="h-5 w-5" /></span>
                <div>
                  <h2 className="font-bold">{session.jobTitle}</h2>
                  <p className="text-sm text-on-surface-variant">{session.interviewType} · {session.status}</p>
                </div>
              </div>
              <span className="flex items-center gap-2 text-sm text-on-surface-variant">
                <Clock3 className="h-4 w-4" /> {session.plannedDurationMinutes} phút
              </span>
            </Link>
          );
        })}
        {!error && sessions.length === 0 && (
          <div className="rounded-2xl border border-dashed border-outline-variant/30 p-10 text-center text-on-surface-variant">
            Bạn chưa có buổi luyện tập nào. Hãy mở một tin tuyển dụng để bắt đầu.
          </div>
        )}
      </div>
    </main>
  );
}
