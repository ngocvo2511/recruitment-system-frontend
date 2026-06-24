import { handleUnauthorizedResponse } from "@/lib/authSession";

export type ApiResponse<T> = {
  code: number;
  message: string;
  result: T;
};

export type RecruiterProfileResponse = {
  recruiterId: string;
  fullName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  profilePictureUrl?: string | null;
  headline?: string | null;
  companyName?: string | null;
  companyRole?: string | null;
};

export type RecruiterProfileUpdateRequest = {
  fullName?: string | null;
  phoneNumber?: string | null;
  headline?: string | null;
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
  if (typeof window === "undefined") return null;
  const tokenKeys = ["accessToken", "token", "authToken", "jwt", "access_token"];
  for (const key of tokenKeys) {
    const value = window.localStorage.getItem(key);
    if (value) return value;
  }
  return null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init?.headers);
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

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

export function getRecruiterProfile(): Promise<RecruiterProfileResponse> {
  return request<RecruiterProfileResponse>("/api/profile/recruiter");
}

export function updateRecruiterProfile(
  payload: RecruiterProfileUpdateRequest,
): Promise<RecruiterProfileResponse> {
  return request<RecruiterProfileResponse>("/api/profile/recruiter", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updateRecruiterAvatar(file: File): Promise<RecruiterProfileResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return request<RecruiterProfileResponse>("/api/profile/recruiter/avatar", {
    method: "PUT",
    body: formData,
  });
}
