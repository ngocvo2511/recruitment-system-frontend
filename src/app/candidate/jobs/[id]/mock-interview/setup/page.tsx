"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mic, ShieldCheck, Timer } from "lucide-react";
import {
  createMockInterview,
  type MockInterviewType,
} from "@/lib/api/mockInterviews";

export default function MockInterviewSetupPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [type, setType] = useState<MockInterviewType>("MIXED");
  const [duration, setDuration] = useState<5 | 10 | 15>(10);
  const [consent, setConsent] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    if (!consent) return;
    setCreating(true);
    setError(null);
    try {
      const session = await createMockInterview({
        jobId: params.id,
        interviewType: type,
        language: "vi",
        plannedDurationMinutes: duration,
      });
      router.push(`/candidate/mock-interviews/${session.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể tạo phiên luyện tập.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-8">
      <Link href={`/candidate/jobs/${params.id}`} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
        <ArrowLeft className="h-4 w-4" /> Quay lại công việc
      </Link>

      <section className="glass-card rounded-[2rem] p-8 shadow-lg md:p-10">
        <div className="mb-8 flex items-start gap-4">
          <div className="rounded-2xl bg-primary/10 p-4 text-primary"><Mic className="h-7 w-7" /></div>
          <div>
            <h1 className="text-3xl font-black text-on-surface">Luyện phỏng vấn với AI</h1>
            <p className="mt-2 text-on-surface-variant">
              Đây là buổi luyện tập tùy chọn. Điểm và phản hồi không ảnh hưởng đến đơn ứng tuyển.
            </p>
          </div>
        </div>

        <div className="space-y-7">
          <fieldset>
            <legend className="mb-3 font-bold">Loại phỏng vấn</legend>
            <div className="grid gap-3 md:grid-cols-3">
              {([
                ["BEHAVIORAL", "Hành vi / HR"],
                ["TECHNICAL", "Chuyên môn"],
                ["MIXED", "Kết hợp"],
              ] as const).map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setType(value)}
                  className={`rounded-2xl border p-4 text-left font-semibold transition ${
                    type === value ? "border-primary bg-primary/10 text-primary" : "border-outline-variant/20"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 flex items-center gap-2 font-bold"><Timer className="h-4 w-4" /> Thời lượng mục tiêu</legend>
            <div className="grid grid-cols-3 gap-3">
              {([5, 10, 15] as const).map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setDuration(value)}
                  className={`rounded-2xl border p-4 font-bold transition ${
                    duration === value ? "border-primary bg-primary/10 text-primary" : "border-outline-variant/20"
                  }`}
                >
                  {value} phút
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-on-surface-variant">
              Khi hết thời gian mục tiêu, AI sẽ không mở câu hỏi chính mới. Bạn vẫn được hoàn thành câu đang trả lời.
            </p>
          </fieldset>

          <label className="flex gap-3 rounded-2xl bg-surface-container-low p-5">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span className="text-sm leading-6 text-on-surface-variant">
              <strong className="flex items-center gap-2 text-on-surface"><ShieldCheck className="h-4 w-4" /> Quyền riêng tư</strong>
              Tôi đồng ý cho phép trình duyệt sử dụng microphone trong phiên này. Hệ thống lưu bản ghi văn bản và phản hồi,
              không lưu file âm thanh.
            </span>
          </label>

          {error && <p className="rounded-xl bg-error/10 p-3 text-sm font-semibold text-error">{error}</p>}

          <button
            type="button"
            disabled={!consent || creating}
            onClick={handleStart}
            className="w-full rounded-full bg-primary px-6 py-4 font-bold text-white shadow-lg disabled:opacity-50"
          >
            {creating ? "Đang tạo bộ câu hỏi..." : "Bắt đầu luyện tập"}
          </button>
        </div>
      </section>
    </main>
  );
}
