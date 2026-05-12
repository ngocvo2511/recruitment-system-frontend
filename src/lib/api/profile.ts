export type ApiResponse<T> = {
  code: number;
  message: string;
  result: T;
};

export type CandidateProfileResponse = {
  candidateId: string;
  fullName?: string | null;
  headline?: string | null;
  phoneNumber?: string | null;
  profilePictureUrl?: string | null;
  openToWork?: boolean | null;
  skills?: string[];
  email?: string | null;
};

export type CandidateProfileUpdateRequest = {
  fullName?: string | null;
  headline?: string | null;
  phoneNumber?: string | null;
  openToWork?: boolean | null;
  confirmedSkills?: string[];
};

export type OpenToWorkUpdateRequest = {
  openToWork: boolean;
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

export function getCandidateProfile(): Promise<CandidateProfileResponse> {
  return request<CandidateProfileResponse>("/api/profile/candidate");
}

export function updateCandidateProfile(payload: CandidateProfileUpdateRequest): Promise<string> {
  return request<string>("/api/profile/candidate", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updateOpenToWork(payload: OpenToWorkUpdateRequest): Promise<string> {
  return request<string>("/api/profile/candidate/open-to-work", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
