import { getStoredToken, handleUnauthorizedResponse } from "@/lib/authSession";

export type MockInterviewType = "BEHAVIORAL" | "TECHNICAL" | "MIXED";
export type MockInterviewStatus =
  | "CREATED"
  | "IN_PROGRESS"
  | "PROCESSING_FEEDBACK"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";
export type InterviewSpeaker = "AI" | "CANDIDATE" | "SYSTEM";

export type MockInterviewQuestion = {
  id: string;
  sequenceNumber: number;
  questionType: string;
  questionText: string;
  competency?: string | null;
  followUp: boolean;
  parentQuestionId?: string | null;
};

export type MockInterviewSession = {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName?: string | null;
  interviewType: MockInterviewType;
  language: string;
  plannedDurationMinutes: number;
  softLimitSeconds: number;
  hardLimitSeconds: number;
  actualDurationSeconds?: number | null;
  status: MockInterviewStatus;
  startedAt?: string | null;
  endedAt?: string | null;
  createdAt: string;
  questions: MockInterviewQuestion[];
};

export type InterviewTurn = {
  id?: string;
  clientEventId?: string;
  questionId?: string | null;
  sequenceNumber: number;
  speaker: InterviewSpeaker;
  content: string;
  startedOffsetMs?: number | null;
  endedOffsetMs?: number | null;
};

export type MockInterviewResult = {
  session: MockInterviewSession;
  overallScore: number;
  scoreLabel: string;
  confidence: string;
  overallSummary: string;
  criteriaScores: Array<{
    criterion: string;
    score: number;
    weight: number;
    evidence: string[];
  }>;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  questionFeedback: Array<{
    questionId?: string | null;
    answerSummary: string;
    whatWentWell: string[];
    whatToImprove: string[];
    betterAnswerExample: string;
  }>;
  transcript: InterviewTurn[];
  disclaimer: string;
};

export type GeminiLiveToken = {
  token: string;
  model: string;
  voice: string;
};

type ApiResponse<T> = { result: T; message?: string };
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  const token = getStoredToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (handleUnauthorizedResponse(response)) {
    throw new Error("Phiên đăng nhập đã hết hạn.");
  }
  const payload = (await response.json()) as ApiResponse<T> & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? "Không thể xử lý yêu cầu.");
  return payload.result;
}

export function createMockInterview(input: {
  jobId: string;
  interviewType: MockInterviewType;
  language: "vi" | "en";
  plannedDurationMinutes: 5 | 10 | 15;
}) {
  return request<MockInterviewSession>("/api/candidate/mock-interviews", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listMockInterviews() {
  return request<MockInterviewSession[]>("/api/candidate/mock-interviews");
}

export function getMockInterview(id: string) {
  return request<MockInterviewSession>(`/api/candidate/mock-interviews/${id}`);
}

export function startMockInterview(id: string) {
  return request<MockInterviewSession>(`/api/candidate/mock-interviews/${id}/start`, {
    method: "POST",
  });
}

export function createGeminiLiveToken() {
  return request<GeminiLiveToken>("/api/candidate/mock-interviews/live-token", {
    method: "POST",
  });
}

export function appendInterviewTurns(id: string, turns: InterviewTurn[]) {
  return request<InterviewTurn[]>(`/api/candidate/mock-interviews/${id}/turns`, {
    method: "POST",
    body: JSON.stringify({
      turns: turns.map((turn) => ({
        ...turn,
        clientEventId: turn.clientEventId ?? crypto.randomUUID(),
      })),
    }),
  });
}

export function createInterviewFollowUp(id: string, parentQuestionId: string, answer: string) {
  return request<MockInterviewQuestion>(`/api/candidate/mock-interviews/${id}/follow-ups`, {
    method: "POST",
    signal: AbortSignal.timeout(15_000),
    body: JSON.stringify({ parentQuestionId, answer }),
  });
}

export function completeMockInterview(id: string) {
  return request<MockInterviewResult>(`/api/candidate/mock-interviews/${id}/complete`, {
    method: "POST",
  });
}

export function getMockInterviewResult(id: string) {
  return request<MockInterviewResult>(`/api/candidate/mock-interviews/${id}/result`);
}

export function deleteMockInterview(id: string) {
  return request<void>(`/api/candidate/mock-interviews/${id}`, { method: "DELETE" });
}
