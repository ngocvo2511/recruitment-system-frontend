import { handleUnauthorizedResponse } from "@/lib/authSession";

export type ApiResponse<T> = {
  code: number;
  message: string;
  result: T;
};

export type Page<T> = {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};


export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
export type WorkMode = "ONSITE" | "REMOTE" | "HYBRID";
export type JobLevel = "INTERN" | "FRESHER" | "JUNIOR" | "MIDDLE" | "SENIOR" | "LEAD";
export type JobStatus = "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED" | "FLAGGED" | "CLOSED";
export type RequirementSectionType = "REQUIRED" | "PREFERRED" | "OTHER";
export type JobSearchSort = "RELEVANCE" | "NEWEST" | "OLDEST" | "SALARY_DESC";

export type JobCategory = {
  code: string;
  name: string;
};

export type JobLocation = {
  code: string;
  name: string;
};

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
  locationCode?: string | null;
  locationName?: string | null;
  employmentType?: EmploymentType;
  workMode?: WorkMode;
  level?: JobLevel;
  minSalary?: number | null;
  maxSalary?: number | null;
  currency?: string;
  salaryNegotiable?: boolean;
  headcount?: number | null;
  deadline?: string | null;
  categories: JobCategory[];
  requirementSections: JobRequirementSection[];
};

export type JobResponse = JobPayload & {
  id: string;
  companyId?: string | null;
  companyName?: string | null;
  companyLogoUrl?: string | null;
  companyIndustry?: string | null;
  companySize?: number | null;
  companyAddress?: string | null;
  companyCity?: string | null;
  companyCountry?: string | null;
  companyWebsite?: string | null;
  status: JobStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
  publishedAt?: string | null;
  closedAt?: string | null;
  recruiterId?: string | null;
};

export type JobSummaryResponse = {
  id: string;
  title: string;
  location?: string | null;
  employmentType?: EmploymentType | null;
  workMode?: WorkMode | null;
  level?: JobLevel | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  currency?: string | null;
  salaryNegotiable?: boolean | null;
  companyId?: string | null;
  companyName?: string | null;
  companyLogoUrl?: string | null;
  companyIndustry?: string | null;
  companySize?: number | null;
  companyAddress?: string | null;
  companyCity?: string | null;
  companyCountry?: string | null;
  status: JobStatus;
  createdAt?: string | null;
  publishedAt?: string | null;
  categories: JobCategory[];
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

export type SavedJobResponse = {
  job: JobResponse;
  savedAt: string;
};

export type JobReportReason =
  | "MISLEADING_INFORMATION"
  | "SCAM_OR_FRAUD"
  | "DISCRIMINATION"
  | "INAPPROPRIATE_CONTENT"
  | "DUPLICATE_OR_EXPIRED"
  | "OTHER";

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

export function getJobs(page: number = 0, size: number = 10): Promise<Page<JobSummaryResponse>> {
  return request<Page<JobSummaryResponse>>(`/api/jobs?page=${page}&size=${size}`);
}

export function getJobById(jobId: string): Promise<JobResponse> {
  return request<JobResponse>(`/api/jobs/${jobId}`);
}

export function getJobMatch(jobId: string, cvId?: string): Promise<JobMatchScore> {
  const params = cvId ? `?cvId=${cvId}` : "";
  return request<JobMatchScore>(`/api/jobs/${jobId}/match${params}`);
}

export function getJobCategories(): Promise<JobCategory[]> {
  return request<JobCategory[]>("/api/job-categories");
}

export function getLocations(): Promise<JobLocation[]> {
  return request<JobLocation[]>("/api/locations");
}

export function getJobRecommendations(
  topK = 10,
  cvId?: string,
  categoryCode?: string,
): Promise<JobRecommendationResponse[]> {
  const params = new URLSearchParams();
  params.set("topK", String(topK));
  if (cvId) {
    params.set("cvId", cvId);
  }
  if (categoryCode) {
    params.set("categoryCode", categoryCode);
  }
  return request<JobRecommendationResponse[]>(`/api/jobs/recommendations?${params.toString()}`);
}

export type JobFtsSearchResponse = {
  job: JobResponse;
  rank?: number | null;
};

export type JobSearchFilters = {
  categoryCode?: string;
  locations?: string[];
  employmentTypes?: EmploymentType[];
  workModes?: WorkMode[];
  levels?: JobLevel[];
  salaryMin?: number;
  salaryMax?: number;
  salaryNegotiable?: boolean;
  sort?: JobSearchSort;
};

export function searchJobsFts(
  query: string,
  limit = 10,
  status?: string,
  filters: JobSearchFilters = {},
): Promise<JobFtsSearchResponse[]> {
  const params = new URLSearchParams();
  params.set("q", query);
  params.set("limit", String(limit));
  if (status) {
    params.set("status", status);
  }
  if (filters.categoryCode) {
    params.set("categoryCode", filters.categoryCode);
  }
  filters.locations?.forEach((location) => params.append("locations", location));
  filters.employmentTypes?.forEach((type) => params.append("employmentTypes", type));
  filters.workModes?.forEach((mode) => params.append("workModes", mode));
  filters.levels?.forEach((level) => params.append("levels", level));
  if (filters.salaryMin != null) {
    params.set("salaryMin", String(filters.salaryMin));
  }
  if (filters.salaryMax != null) {
    params.set("salaryMax", String(filters.salaryMax));
  }
  if (filters.salaryNegotiable != null) {
    params.set("salaryNegotiable", String(filters.salaryNegotiable));
  }
  if (filters.sort) {
    params.set("sort", filters.sort);
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

export function getSavedJobs(): Promise<SavedJobResponse[]> {
  return request<SavedJobResponse[]>("/api/candidate/saved-jobs");
}

export function getSavedJobCount(): Promise<number> {
  return request<number>("/api/candidate/saved-jobs/count");
}

export async function isJobSaved(jobId: string): Promise<boolean> {
  const result = await request<{ saved: boolean }>(`/api/candidate/saved-jobs/${jobId}/status`);
  return result.saved;
}

export function saveJob(jobId: string): Promise<SavedJobResponse> {
  return request<SavedJobResponse>(`/api/candidate/saved-jobs/${jobId}`, {
    method: "POST",
  });
}

export function removeSavedJob(jobId: string): Promise<void> {
  return request<void>(`/api/candidate/saved-jobs/${jobId}`, {
    method: "DELETE",
  });
}

export function reportJob(jobId: string, payload: {
  reason: JobReportReason;
  details?: string;
}): Promise<void> {
  return request<void>(`/api/candidate/jobs/${jobId}/reports`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateJob(jobId: string, payload: JobPayload): Promise<JobResponse> {
  return request<JobResponse>(`/api/jobs/${jobId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function closeJob(jobId: string): Promise<JobResponse> {
  return request<JobResponse>(`/api/jobs/${jobId}/close`, {
    method: "PATCH",
  });
}

export function deleteJob(jobId: string): Promise<void> {
  return request<void>(`/api/jobs/${jobId}`, {
    method: "DELETE",
  });
}
