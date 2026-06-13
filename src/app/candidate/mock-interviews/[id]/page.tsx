"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Mic, MicOff, PhoneOff, Send, Volume2 } from "lucide-react";
import {
  appendInterviewTurns,
  completeMockInterview,
  createGeminiLiveToken,
  createInterviewFollowUp,
  getMockInterview,
  startMockInterview,
  type MockInterviewQuestion,
  type MockInterviewSession,
} from "@/lib/api/mockInterviews";
import { GeminiLiveVoice } from "@/lib/geminiLiveVoice";

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>;
}

interface SpeechRecognitionErrorEventLike {
  error: "aborted" | "audio-capture" | "network" | "no-speech" | "not-allowed" | "service-not-allowed" | string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

function normalizeTechnicalTerms(value: string) {
  const replacements: Array<[RegExp, string]> = [
    [/\bback[\s-]?end\b/gi, "backend"],
    [/\bfront[\s-]?end\b/gi, "frontend"],
    [/\bfull[\s-]?stack\b/gi, "full-stack"],
    [/\bjava\s*script\b/gi, "JavaScript"],
    [/\btype\s*script\b/gi, "TypeScript"],
    [/\bnode(?:\s*dot|\s*)js\b/gi, "Node.js"],
    [/\breact(?:\s*dot|\s*)js\b/gi, "React"],
    [/\bnext(?:\s*dot|\s*)js\b/gi, "Next.js"],
    [/\bspring\s+boot\b/gi, "Spring Boot"],
    [/\bpostgre(?:s|\s*s)?\s*q\s*l\b/gi, "PostgreSQL"],
    [/\bmy\s*s\s*q\s*l\b/gi, "MySQL"],
    [/\brest\s*a\s*p\s*i\b/gi, "REST API"],
    [/\bmicro[\s-]?service(s)?\b/gi, "microservice$1"],
    [/\bdev\s*ops\b/gi, "DevOps"],
    [/\bc\s*i\s*\/?\s*c\s*d\b/gi, "CI/CD"],
    [/\bgit\s*hub\b/gi, "GitHub"],
    [/\bkuber(?:netes|net|nét)\b/gi, "Kubernetes"],
    [/\bbách\s*en(?:d)?\b/gi, "backend"],
    [/\bđơ\s*ve\s*lốp\s*pơ\b/gi, "developer"],
  ];
  return replacements.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    value,
  );
}

export default function MockInterviewRoomPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<MockInterviewSession | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<MockInterviewQuestion | null>(null);
  const [mainIndex, setMainIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [listening, setListening] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const keepListeningRef = useRef(false);
  const committedTranscriptRef = useRef("");
  const restartTimerRef = useRef<number | null>(null);
  const speechRetryTimerRef = useRef<number | null>(null);
  const vietnameseVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const liveVoiceRef = useRef<GeminiLiveVoice | null>(null);
  const liveVoicePromiseRef = useRef<Promise<GeminiLiveVoice> | null>(null);
  const sequenceRef = useRef(1);
  const askedQuestionIdsRef = useRef(new Set<string>());
  const finishingRef = useRef(false);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const vietnameseVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith("vi"));
      vietnameseVoiceRef.current = vietnameseVoices.find((voice) =>
        /google|hoaimy|namminh|vietnamese|tiếng việt/i.test(voice.name))
        ?? vietnameseVoices.find((voice) => voice.localService)
        ?? vietnameseVoices[0]
        ?? null;
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const persistAiQuestion = useCallback(async (question: MockInterviewQuestion) => {
    if (askedQuestionIdsRef.current.has(question.id)) return;
    askedQuestionIdsRef.current.add(question.id);
    await appendInterviewTurns(params.id, [{
      clientEventId: crypto.randomUUID(),
      questionId: question.id,
      sequenceNumber: sequenceRef.current++,
      speaker: "AI",
      content: question.questionText,
    }]);
  }, [params.id]);

  const getLiveVoice = useCallback(async () => {
    if (liveVoiceRef.current) return liveVoiceRef.current;
    if (!liveVoicePromiseRef.current) {
      liveVoicePromiseRef.current = (async () => {
        const token = await createGeminiLiveToken();
        const voice = new GeminiLiveVoice();
        await voice.connect(token);
        liveVoiceRef.current = voice;
        return voice;
      })().catch((caught) => {
        liveVoicePromiseRef.current = null;
        throw caught;
      });
    }
    return liveVoicePromiseRef.current;
  }, []);

  const speakWithBrowserVietnameseVoice = useCallback((question: MockInterviewQuestion) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const speakWhenReady = (attempt: number) => {
      const voices = window.speechSynthesis.getVoices();
      const vietnameseVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith("vi"));
      const selectedVoice = vietnameseVoiceRef.current
        ?? vietnameseVoices.find((voice) => /google|hoaimy|namminh|vietnamese|tiếng việt/i.test(voice.name))
        ?? vietnameseVoices.find((voice) => voice.localService)
        ?? vietnameseVoices[0]
        ?? null;
      if (!selectedVoice && voices.length === 0 && attempt < 3) {
        speechRetryTimerRef.current = window.setTimeout(() => speakWhenReady(attempt + 1), 100);
        return;
      }
      if (!selectedVoice) {
        setError("Thiết bị không có giọng đọc tiếng Việt và Gemini Live hiện không kết nối được.");
        return;
      }
      vietnameseVoiceRef.current = selectedVoice;
      const utterance = new SpeechSynthesisUtterance(question.questionText);
      utterance.lang = "vi-VN";
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = 1.08;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    };
    speakWhenReady(0);
  }, []);

  const speak = useCallback((question: MockInterviewQuestion) => {
    keepListeningRef.current = false;
    recognitionRef.current?.stop();
    liveVoiceRef.current?.stopTranscription();
    liveVoiceRef.current?.stopAudio();
    window.speechSynthesis?.cancel();
    void getLiveVoice()
      .then((voice) => voice.speak(question.questionText))
      .catch(() => speakWithBrowserVietnameseVoice(question));
  }, [getLiveVoice, speakWithBrowserVietnameseVoice]);

  const ask = useCallback(async (question: MockInterviewQuestion) => {
    setActiveQuestion(question);
    setAnswer("");
    await persistAiQuestion(question);
    speak(question);
  }, [persistAiQuestion, speak]);

  const finish = useCallback(async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setSubmitting(true);
    keepListeningRef.current = false;
    recognitionRef.current?.stop();
    liveVoiceRef.current?.stopTranscription();
    window.speechSynthesis?.cancel();
    try {
      await completeMockInterview(params.id);
      router.replace(`/candidate/mock-interviews/${params.id}/result`);
    } catch (caught) {
      finishingRef.current = false;
      setError(caught instanceof Error ? caught.message : "Không thể hoàn tất phiên.");
      setSubmitting(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const loaded = await getMockInterview(params.id);
        const started = loaded.status === "CREATED" ? await startMockInterview(params.id) : loaded;
        if (!active) return;
        setSession(started);
        if (started.status === "COMPLETED") {
          router.replace(`/candidate/mock-interviews/${params.id}/result`);
          return;
        }
        const first = started.questions.find((question) => !question.followUp);
        if (first) await ask(first);
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : "Không thể tải phiên phỏng vấn.");
      }
    };
    void load();
    return () => {
      active = false;
      recognitionRef.current?.stop();
      if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current);
      if (speechRetryTimerRef.current) window.clearTimeout(speechRetryTimerRef.current);
      liveVoiceRef.current?.close();
      liveVoiceRef.current = null;
      window.speechSynthesis?.cancel();
    };
  }, [ask, params.id, router]);

  useEffect(() => {
    if (!session || session.status !== "IN_PROGRESS") return;
    const timer = window.setInterval(() => {
      setElapsed((current) => {
        const next = current + 1;
        if (next >= session.hardLimitSeconds) void finish();
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [finish, session]);

  const toggleListening = async () => {
    if (listening) {
      keepListeningRef.current = false;
      recognitionRef.current?.stop();
      liveVoiceRef.current?.stopTranscription();
      setListening(false);
      return;
    }

    window.speechSynthesis.cancel();
    liveVoiceRef.current?.stopAudio();
    setError(null);
    committedTranscriptRef.current = answer.trim();
    const transcriptBase = committedTranscriptRef.current;
    try {
      const liveVoice = await getLiveVoice();
      await liveVoice.startTranscription((transcript, finished) => {
        const normalized = normalizeTechnicalTerms(transcript);
        const combined = [transcriptBase, normalized].filter(Boolean).join(" ");
        setAnswer(combined);
        if (finished) committedTranscriptRef.current = combined;
      });
      setListening(true);
      return;
    } catch {
      // Fall back to the browser recognizer when Gemini Live is unavailable.
    }

    const speechWindow = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setError("Trình duyệt không hỗ trợ nhận diện giọng nói. Bạn vẫn có thể nhập câu trả lời.");
      return;
    }
    keepListeningRef.current = true;

    const startRecognition = () => {
      if (!keepListeningRef.current || finishingRef.current) return;
      const recognition = new Recognition();
      recognition.lang = "vi-VN";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        let finalText = "";
        let interimText = "";
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const result = event.results[index];
          const transcript = result[0]?.transcript?.trim() ?? "";
          if (!transcript) continue;
          if (result.isFinal) finalText += `${transcript} `;
          else interimText += `${transcript} `;
        }
        if (finalText.trim()) {
          committedTranscriptRef.current = normalizeTechnicalTerms([
            committedTranscriptRef.current,
            finalText.trim(),
          ].filter(Boolean).join(" "));
        }
        setAnswer([
          committedTranscriptRef.current,
          interimText.trim(),
        ].filter(Boolean).join(" "));
      };
      recognition.onerror = (event) => {
        if (event.error === "aborted" || event.error === "no-speech") return;
        keepListeningRef.current = false;
        setListening(false);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setError("Trình duyệt chưa cho phép sử dụng microphone hoặc dịch vụ nhận diện giọng nói.");
        } else if (event.error === "audio-capture") {
          setError("Không tìm thấy microphone đang hoạt động. Hãy kiểm tra thiết bị đầu vào.");
        } else if (event.error === "network") {
          setError("Dịch vụ nhận diện giọng nói bị mất kết nối. Bạn có thể thử lại hoặc nhập văn bản.");
        } else {
          setError(`Nhận diện giọng nói tạm thời gián đoạn (${event.error}).`);
        }
      };
      recognition.onend = () => {
        if (keepListeningRef.current && !finishingRef.current) {
          restartTimerRef.current = window.setTimeout(startRecognition, 250);
          return;
        }
        setListening(false);
      };
      recognitionRef.current = recognition;
      try {
        recognition.start();
        setListening(true);
      } catch {
        keepListeningRef.current = false;
        setListening(false);
        setError("Không thể khởi động nhận diện giọng nói. Hãy thử lại.");
      }
    };
    startRecognition();
  };

  const submitAnswer = async () => {
    if (!session || !activeQuestion || !answer.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    keepListeningRef.current = false;
    recognitionRef.current?.stop();
    liveVoiceRef.current?.stopTranscription();
    setListening(false);
    try {
      await appendInterviewTurns(params.id, [{
        clientEventId: crypto.randomUUID(),
        questionId: activeQuestion.id,
        sequenceNumber: sequenceRef.current++,
        speaker: "CANDIDATE",
        content: answer.trim(),
      }]);

      const mainQuestions = session.questions.filter((question) => !question.followUp);
      const canFollowUp = !activeQuestion.followUp && elapsed < session.softLimitSeconds;
      if (canFollowUp) {
        try {
          const followUp = await createInterviewFollowUp(params.id, activeQuestion.id, answer.trim());
          await ask(followUp);
          setSubmitting(false);
          return;
        } catch {
          // Continue with the next planned question when follow-up is unavailable.
        }
      }

      const nextIndex = activeQuestion.followUp ? mainIndex + 1 : mainIndex + 1;
      if (elapsed >= session.softLimitSeconds || nextIndex >= mainQuestions.length) {
        await finish();
        return;
      }
      setMainIndex(nextIndex);
      await ask(mainQuestions[nextIndex]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể lưu câu trả lời.");
    } finally {
      if (!finishingRef.current) setSubmitting(false);
    }
  };

  const handleAnswerChange = (value: string) => {
    keepListeningRef.current = false;
    recognitionRef.current?.stop();
    liveVoiceRef.current?.stopTranscription();
    setListening(false);
    committedTranscriptRef.current = value;
    setAnswer(value);
  };

  if (!session || !activeQuestion) {
    return <main className="mx-auto max-w-3xl px-6 py-12 text-on-surface-variant">{error ?? "Đang chuẩn bị buổi phỏng vấn..."}</main>;
  }

  const softReached = elapsed >= session.softLimitSeconds;
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-8">
      <section className="glass-card overflow-hidden rounded-[2rem] shadow-xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/20 p-6">
          <div>
            <p className="text-sm font-semibold text-primary">AI Mock Interview</p>
            <h1 className="text-xl font-black">{session.jobTitle}</h1>
          </div>
          <div className={`rounded-full px-4 py-2 font-mono font-bold ${softReached ? "bg-amber-100 text-amber-800" : "bg-primary/10 text-primary"}`}>
            {formatTime(elapsed)} / {formatTime(session.softLimitSeconds)}
          </div>
        </header>

        <div className="space-y-7 p-6 md:p-10">
          <div className="rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 p-7">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
              <Volume2 className="h-4 w-4" />
              {activeQuestion.followUp ? "Câu hỏi đào sâu" : `Câu hỏi ${mainIndex + 1}`}
            </div>
            <p className="text-xl font-bold leading-relaxed text-on-surface">{activeQuestion.questionText}</p>
            <button type="button" onClick={() => speak(activeQuestion)} className="mt-4 text-sm font-semibold text-primary">
              Nghe lại câu hỏi
            </button>
          </div>

          {softReached && (
            <p className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
              Đã hết thời gian mục tiêu. Hãy hoàn thành câu đang trả lời; phiên sẽ kết thúc sau đó.
            </p>
          )}

          <textarea
            value={answer}
            onChange={(event) => handleAnswerChange(event.target.value)}
            rows={8}
            placeholder="Câu trả lời từ microphone sẽ hiện ở đây. Bạn cũng có thể nhập văn bản..."
            className="w-full resize-none rounded-2xl border border-outline-variant/30 bg-white/70 p-5 leading-7 outline-none focus:ring-2 focus:ring-primary/30"
          />

          {error && <p className="rounded-xl bg-error/10 p-3 text-sm font-semibold text-error">{error}</p>}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={toggleListening} className={`inline-flex items-center gap-2 rounded-full px-5 py-3 font-bold ${listening ? "bg-error text-white" : "bg-surface-container-high text-on-surface"}`}>
              {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              {listening ? "Dừng nghe" : "Trả lời bằng giọng nói"}
            </button>
            <div className="flex gap-3">
              <button type="button" onClick={() => void finish()} disabled={submitting} className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-5 py-3 font-bold">
                <PhoneOff className="h-5 w-5" /> Kết thúc
              </button>
              <button type="button" onClick={submitAnswer} disabled={!answer.trim() || submitting} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-white disabled:opacity-50">
                <Send className="h-5 w-5" /> {submitting ? "Đang lưu..." : "Gửi câu trả lời"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
