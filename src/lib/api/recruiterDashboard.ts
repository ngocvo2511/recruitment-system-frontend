import type { ApplicationStatus } from "@/lib/api/applications";
import { handleUnauthorizedResponse } from "@/lib/authSession";

export type ApiResponse<T> = {
  code: number;
  message: string;
  result: T;
};

export type RecruiterDashboardStats = {
  activeJobs: number;
  totalApplications: number;
  uniqueCandidates: number;
  applicationsLast7Days: number;
  interviewStageApplications: number;
  conversionRate: number;
  averageAiScore?: number | null;
};

export type RecruiterDashboardApplication = {
  id: string;
  jobId: string;
  jobTitle?: string | null;
  candidateId?: string | null;
  candidateName?: string | null;
  candidateEmail?: string | null;
  cvId?: string | null;
  cvName?: string | null;
  status: ApplicationStatus;
  aiScore?: number | null;
  appliedAt?: string | null;
};

export type RecruiterDashboardResponse = {
  stats: RecruiterDashboardStats;
  recentApplications: RecruiterDashboardApplication[];
};

type ApiErrorShape = {
  code?: number;
  message?: string;
};

export class ApiError extends Error {
  status: number;
  code?: number;

  constructor(message: string, status: number, code?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const tokenKeys = ["accessToken", "token", "authToken", "jwt", "access_token"];
  for (const key of tokenKeys) {
    const value = window.localStorage.getItem(key);
    if (value) {
      return value;
    }
  }

  return null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (handleUnauthorizedResponse(response)) {
    throw new ApiError("Phiên đăng nhập đã hết hạn.", 401, 1003);
  }
  const payload = (await response.json()) as ApiResponse<T> | ApiErrorShape;

  if (!response.ok) {
    const errorPayload = payload as ApiErrorShape;
    throw new ApiError(
      errorPayload.message ?? "Request failed",
      response.status,
      errorPayload.code,
    );
  }

  return (payload as ApiResponse<T>).result;
}

export function getRecruiterDashboard(): Promise<RecruiterDashboardResponse> {
  return request<RecruiterDashboardResponse>("/api/recruiter/dashboard");
}
