export type ApiResponse<T> = {
  code: number;
  message: string;
  result: T;
};

export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
export type WorkMode = "ONSITE" | "REMOTE" | "HYBRID";
export type JobLevel = "INTERN" | "FRESHER" | "JUNIOR" | "MIDDLE" | "SENIOR" | "LEAD";
export type JobStatus = "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED" | "FLAGGED" | "CLOSED";
export type RequirementSectionType = "REQUIRED" | "PREFERRED" | "OTHER";

export type JobRequirementItem = {
  id?: string;
  content: string;
  displayOrder?: number;
};

export type JobRequirementSection = {
  id?: string;
  title: string;
  sectionType: RequirementSectionType;
  displayOrder?: number;
  items: JobRequirementItem[];
};

export type JobPayload = {
  title: string;
  description: string;
  workingTime?: string;
  location?: string;
  employmentType?: EmploymentType;
  workMode?: WorkMode;
  level?: JobLevel;
  minSalary?: number | null;
  maxSalary?: number | null;
  currency?: string;
  salaryNegotiable?: boolean;
  headcount?: number | null;
  deadline?: string | null;
  requirementSections: JobRequirementSection[];
};

export type JobResponse = JobPayload & {
  id: string;
  companyId?: string | null;
  companyName?: string | null;
  status: JobStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
  publishedAt?: string | null;
  closedAt?: string | null;
  recruiterId?: string | null;
};

export type JobMatchScore = {
  jobId: string;
  cvId: string;
  fitScore?: number | null;
  skillsScore?: number | null;
  descriptionScore?: number | null;
  requirementsScore?: number | null;
  model?: string | null;
  dimensions?: number | null;
};

export type JobRecommendationResponse = {
  job: JobResponse;
  matchScore?: number | null;
};

export type CvItemResponse = {
  id: string;
  cvName: string;
  uploadedAt: string;
  isDefault?: boolean;
  aiStatus?: "PENDING" | "COMPLETED" | "FAILED";
};

export type CvRecommendationResponse = {
  cv: CvItemResponse;
  matchScore?: number | null;
  candidateId?: string | null;
  candidateName?: string | null;
  candidateHeadline?: string | null;
  candidateAvatar?: string | null;
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

export function getJobs(): Promise<JobResponse[]> {
  return request<JobResponse[]>("/api/jobs");
}

export function getJobById(jobId: string): Promise<JobResponse> {
  return request<JobResponse>(`/api/jobs/${jobId}`);
}

export function getJobMatch(jobId: string, cvId?: string): Promise<JobMatchScore> {
  const params = cvId ? `?cvId=${cvId}` : "";
  return request<JobMatchScore>(`/api/jobs/${jobId}/match${params}`);
}

export function getJobRecommendations(topK = 10, cvId?: string): Promise<JobRecommendationResponse[]> {
  const params = new URLSearchParams();
  params.set("topK", String(topK));
  if (cvId) {
    params.set("cvId", cvId);
  }
  return request<JobRecommendationResponse[]>(`/api/jobs/recommendations?${params.toString()}`);
}

export type JobFtsSearchResponse = {
  job: JobResponse;
  rank?: number | null;
};

export function searchJobsFts(query: string, limit = 10, status?: string): Promise<JobFtsSearchResponse[]> {
  const params = new URLSearchParams();
  params.set("q", query);
  params.set("limit", String(limit));
  if (status) {
    params.set("status", status);
  }
  return request<JobFtsSearchResponse[]>(`/api/search/fts/jobs?${params.toString()}`);
}

export function createJob(payload: JobPayload): Promise<JobResponse> {
  return request<JobResponse>("/api/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getJobMatches(jobId: string, topK = 10): Promise<CvRecommendationResponse[]> {
  const params = new URLSearchParams();
  params.set("topK", String(topK));
  return request<CvRecommendationResponse[]>(`/api/jobs/${jobId}/matches?${params.toString()}`);
}
