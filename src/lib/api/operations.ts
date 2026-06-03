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

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type OperationsOverview = {
  totalCvEmbeddings: number;
  totalJobEmbeddings: number;
  activePipelineJobs: number;
  queuedPipelineJobs: number;
  failedPipelineJobs: number;
  completedPipelineJobs: number;
  avgSearchLatencyMs: number;
  p95SearchLatencyMs: number;
  totalSearchRequests: number;
  cacheNames: string[];
  totalCaches: number;
};

export type EmbeddingStats = {
  totalCvEmbeddings: number;
  totalJobEmbeddings: number;
  cvEmbeddingsByType: Record<string, number>;
  jobEmbeddingsByType: Record<string, number>;
  models: string[];
  dimensions: number[];
};

export type SearchLatency = {
  requestType: string;
  totalRequests: number;
  avgLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  p50LatencyMs: number;
  p90LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  latencyBuckets: Record<string, number>;
};

export type PipelineJobSummary = {
  id: string;
  jobType: string;
  status: string;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  errorMessage: string | null;
};

export type PipelineHealth = {
  activeJobs: number;
  queuedJobs: number;
  completedJobs: number;
  failedJobs: number;
  stalledJobs: number;
  lastCompletionTime: string | null;
  recentJobs: PipelineJobSummary[];
};

export type Alert = {
  severity: "CRITICAL" | "WARNING" | "INFO";
  type: string;
  message: string;
  details: string;
  detectedAt: string;
};

export type CacheStats = {
  cacheNames: string[];
  totalCaches: number;
};

/* ------------------------------------------------------------------ */
/*  API functions                                                      */
/* ------------------------------------------------------------------ */

export function getOperationsOverview(): Promise<OperationsOverview> {
  return request<OperationsOverview>("/api/admin/operations/overview");
}

export function getEmbeddingStats(): Promise<EmbeddingStats> {
  return request<EmbeddingStats>("/api/admin/operations/embeddings");
}

export function getSearchLatency(requestType?: string): Promise<SearchLatency> {
  const query = requestType ? `?requestType=${encodeURIComponent(requestType)}` : "";
  return request<SearchLatency>(`/api/admin/operations/search-latency${query}`);
}

export function getPipelineHealth(): Promise<PipelineHealth> {
  return request<PipelineHealth>("/api/admin/operations/pipeline-health");
}

export function getAlerts(): Promise<Alert[]> {
  return request<Alert[]>("/api/admin/operations/alerts");
}

export function getCacheStats(): Promise<CacheStats> {
  return request<CacheStats>("/api/admin/operations/cache-stats");
}

export function evictAllCaches(): Promise<string> {
  return request<string>("/api/admin/operations/cache/evict-all", { method: "POST" });
}

export function startReEmbedCvs(): Promise<PipelineJobSummary> {
  return request<PipelineJobSummary>("/api/admin/pipeline-jobs/re-embed/cvs", { method: "POST" });
}

export function startReEmbedJobs(): Promise<PipelineJobSummary> {
  return request<PipelineJobSummary>("/api/admin/pipeline-jobs/re-embed/jobs", { method: "POST" });
}

export function startRebuildFts(): Promise<PipelineJobSummary> {
  return request<PipelineJobSummary>("/api/admin/pipeline-jobs/rebuild-fts", { method: "POST" });
}

export function startReEmbedSingleCv(cvId: string): Promise<PipelineJobSummary> {
  return request<PipelineJobSummary>(`/api/admin/pipeline-jobs/re-embed/cv/${encodeURIComponent(cvId)}`, { method: "POST" });
}

export function startReEmbedSingleJob(jobId: string): Promise<PipelineJobSummary> {
  return request<PipelineJobSummary>(`/api/admin/pipeline-jobs/re-embed/job/${encodeURIComponent(jobId)}`, { method: "POST" });
}

export function getPipelineJobs(): Promise<PipelineJobSummary[]> {
  return request<PipelineJobSummary[]>("/api/admin/pipeline-jobs");
}

export function cancelPipelineJob(id: string): Promise<PipelineJobSummary> {
  return request<PipelineJobSummary>(`/api/admin/pipeline-jobs/${encodeURIComponent(id)}`, { method: "DELETE" });
}
