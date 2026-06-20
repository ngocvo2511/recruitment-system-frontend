import { handleUnauthorizedResponse } from "@/lib/authSession";

export type ApiResponse<T> = {
  code: number;
  message: string;
  result: T;
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

export interface InviteToApplyRequest {
  email: string;
  candidateName: string;
  companyName: string;
  jobTitle: string;
  jobUrl: string;
  idempotencyKey: string;
}

export function sendInviteToApplyNotification(payload: InviteToApplyRequest): Promise<string> {
  return request<string>("/api/notifications/invite-to-apply", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function checkInviteStatus(jobId: string, candidateId: string): Promise<boolean> {
  const params = new URLSearchParams();
  params.set("jobId", jobId);
  params.set("candidateId", candidateId);
  return request<boolean>(`/api/notifications/invite-to-apply/status?${params.toString()}`);
}
