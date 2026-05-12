export type ApiResponse<T> = {
  code: number;
  message: string;
  result: T;
};

export type CvResponse = {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
};

export type ExtractionStatusResponse = {
  cvId: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  parsedData?: string | null;
  errorMessage?: string | null;
};

export type PresignedUrlResponse = {
  downloadUrl: string;
};

export type ExtractedDataResponse = {
  cvId: string;
  parsedData?: string | null;
};

export type CvReviewResponse = {
  reviewId: string;
  cvId: string;
  jobId?: string | null;
  reviewType?: string;
  status: "COMPLETED" | "FAILED";
  fitScore?: number | null;
  summary?: string | null;
  strengths?: string | null;
  weaknesses?: string | null;
  improvements?: string | null;
  matchedRequirements?: string | null;
  missingRequirements?: string | null;
  actionPlan?: string | null;
  provider?: string | null;
  modelName?: string | null;
  promptVersion?: string | null;
  errorMessage?: string | null;
  createdAt?: string;
};

export type CvListItemResponse = {
  id: string;
  cvName: string;
  uploadedAt: string;
  isDefault?: boolean;
  default?: boolean;
  aiStatus?: "PENDING" | "COMPLETED" | "FAILED";
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
  const isFormData = init?.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
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

async function requestRaw<T>(path: string, init?: RequestInit): Promise<T> {
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

  const payload = (await response.json()) as T | ApiErrorShape;

  if (!response.ok) {
    const errorPayload = payload as ApiErrorShape;
    throw new ApiError(
      errorPayload.message ?? "Request failed",
      response.status,
      errorPayload.code,
    );
  }

  return payload as T;
}

export async function uploadCv(file: File): Promise<CvResponse> {
  const form = new FormData();
  form.append("file", file);

  return request<CvResponse>("/api/cv/process-uploaded", {
    method: "POST",
    body: form,
  });
}

export function getExtractionStatus(cvId: string): Promise<ExtractionStatusResponse> {
  return request<ExtractionStatusResponse>(`/api/cv/${cvId}/extraction-status`);
}

export function getExtractedData(cvId: string): Promise<ExtractedDataResponse> {
  return requestRaw<ExtractedDataResponse>(`/api/cv/${cvId}/extracted-data`);
}

export function getPresignedUrl(cvId: string): Promise<PresignedUrlResponse> {
  return request<PresignedUrlResponse>(`/api/cv/${cvId}/presigned-url`);
}

export function retryExtraction(cvId: string): Promise<string> {
  return request<string>(`/api/cv/${cvId}/retry`, {
    method: "POST",
  });
}

export function createCvReview(cvId: string): Promise<CvReviewResponse> {
  return request<CvReviewResponse>(`/api/cv/${cvId}/review`, {
    method: "POST",
  });
}

export function getLatestCvReview(cvId: string): Promise<CvReviewResponse> {
  return request<CvReviewResponse>(`/api/cv/${cvId}/review`);
}

export function getMyCvs(): Promise<CvListItemResponse[]> {
  return request<CvListItemResponse[]>("/api/cv");
}

export function setDefaultCv(cvId: string): Promise<string> {
  return request<string>(`/api/cv/${cvId}/default`, {
    method: "PUT",
  });
}

export function deleteCv(cvId: string): Promise<string> {
  return request<string>(`/api/cv/${cvId}`, {
    method: "DELETE",
  });
}
