"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, RefreshCw, TrendingUp } from "lucide-react";
import { getMockInterviewResult, type MockInterviewResult } from "@/lib/api/mockInterviews";

const criterionLabels: Record<string, string> = {
  CONTENT_KNOWLEDGE: "Nội dung và kiến thức",
  RELEVANCE: "Mức độ liên quan",
  EVIDENCE: "Ví dụ và bằng chứng",
  STRUCTURE: "Cấu trúc câu trả lời",
  CLARITY: "Rõ ràng và súc tích",
};

export default function MockInterviewResultPage() {
  const params = useParams<{ id: string }>();
  const [result, setResult] = useState<MockInterviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMockInterviewResult(params.id)
      .then(setResult)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Không thể tải kết quả."));
  }, [params.id]);

  if (!result) {
    return <main className="mx-auto max-w-4xl px-6 py-12 text-on-surface-variant">{error ?? "Đang tạo phản hồi..."}</main>;
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8">
      <Link href="/candidate/mock-interviews" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
        <ArrowLeft className="h-4 w-4" /> Lịch sử luyện tập
      </Link>

      <section className="glass-card grid gap-8 rounded-[2rem] p-8 shadow-lg md:grid-cols-[220px_1fr]">
        <div className="flex flex-col items-center justify-center rounded-3xl bg-primary/10 p-6">
          <span className="text-6xl font-black text-primary">{result.overallScore}</span>
          <span className="font-bold text-primary">/ 100</span>
          <span className="mt-3 rounded-full bg-white px-4 py-2 text-sm font-bold">{result.scoreLabel}</span>
          <span className="mt-2 text-xs text-on-surface-variant">Độ tin cậy: {result.confidence}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-primary">{result.session.jobTitle}</p>
          <h1 className="mt-1 text-3xl font-black">Kết quả luyện phỏng vấn</h1>
          <p className="mt-4 leading-7 text-on-surface-variant">{result.overallSummary}</p>
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{result.disclaimer}</p>
          <Link href={`/candidate/jobs/${result.session.jobId}/mock-interview/setup`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-bold text-white">
            <RefreshCw className="h-4 w-4" /> Luyện lại
          </Link>
        </div>
      </section>

      <section className="glass-card rounded-[2rem] p-8">
        <h2 className="mb-5 flex items-center gap-2 text-xl font-black"><TrendingUp className="h-5 w-5 text-primary" /> Điểm theo tiêu chí</h2>
        <div className="space-y-5">
          {result.criteriaScores.map((criterion) => (
            <div key={criterion.criterion}>
              <div className="mb-2 flex justify-between text-sm font-bold">
                <span>{criterionLabels[criterion.criterion] ?? criterion.criterion} ({criterion.weight}%)</span>
                <span>{criterion.score}/100</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
                <div className="h-full rounded-full bg-primary" style={{ width: `${criterion.score}%` }} />
              </div>
              <p className="mt-2 text-xs text-on-surface-variant">{criterion.evidence[0]}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="glass-card rounded-[2rem] p-7">
          <h2 className="mb-4 text-xl font-black text-secondary">Điểm mạnh</h2>
          <ul className="space-y-3">
            {result.strengths.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-secondary" /> {item}</li>)}
          </ul>
        </section>
        <section className="glass-card rounded-[2rem] p-7">
          <h2 className="mb-4 text-xl font-black text-primary">Cần cải thiện</h2>
          <ul className="space-y-3">
            {result.improvements.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" /> {item}</li>)}
          </ul>
        </section>
      </div>

      <section className="glass-card rounded-[2rem] p-8">
        <h2 className="mb-5 text-xl font-black">Phản hồi từng câu trả lời</h2>
        <div className="space-y-4">
          {result.questionFeedback.map((item, index) => (
            <article key={`${item.questionId ?? "answer"}-${index}`} className="rounded-2xl border border-outline-variant/20 p-5">
              <h3 className="font-bold">Câu trả lời {index + 1}</h3>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">{item.answerSummary}</p>
              <p className="mt-3 text-sm"><strong>Gợi ý:</strong> {item.whatToImprove.join(" ")}</p>
              <p className="mt-2 text-sm"><strong>Cách trình bày tốt hơn:</strong> {item.betterAnswerExample}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
