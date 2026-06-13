import { handleUnauthorizedResponse } from "@/lib/authSession";

export type ApiResponse<T> = {
  code: number;
  message: string;
  result: T;
};

export type ApplicationStatus =
  | "APPLIED"
  | "SCREENING"
  | "INTERVIEW"
  | "OFFERED"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN";

export type ApplicationResponse = {
  id: string;
  jobId: string;
  jobTitle: string;
  companyId?: string | null;
  companyName?: string | null;
  candidateId: string;
  candidateName?: string | null;
  candidateEmail?: string | null;
  candidatePhone?: string | null;
  cvId: string;
  cvName?: string | null;
  cvUrl?: string | null;
  status: ApplicationStatus;
  aiScore?: number | null;
  coverLetter?: string | null;
  appliedAt?: string | null;
  updatedAt?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
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

export function applyToJob(payload: {
  jobId: string;
  cvId: string;
  coverLetter?: string;
}): Promise<ApplicationResponse> {
  return request<ApplicationResponse>("/api/applications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMyApplications(): Promise<ApplicationResponse[]> {
  return request<ApplicationResponse[]>("/api/applications/me");
}

export function withdrawApplication(applicationId: string): Promise<ApplicationResponse> {
  return request<ApplicationResponse>(`/api/applications/${applicationId}/withdraw`, {
    method: "PATCH",
  });
}

export function getRecruiterApplications(): Promise<ApplicationResponse[]> {
  return request<ApplicationResponse[]>("/api/recruiter/applications");
}

export function getRecruiterJobApplications(jobId: string): Promise<ApplicationResponse[]> {
  return request<ApplicationResponse[]>(`/api/recruiter/jobs/${jobId}/applications`);
}

export function updateRecruiterApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
): Promise<ApplicationResponse> {
  return request<ApplicationResponse>(`/api/recruiter/applications/${applicationId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
