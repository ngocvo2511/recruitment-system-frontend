export type ApiResponse<T> = {
  code: number;
  message: string;
  result: T;
};

export type CompanyStatus = "PENDING" | "ACTIVE" | "REJECTED" | "BLOCKED";
export type JobStatus = "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED" | "FLAGGED" | "CLOSED";

export type AdminDashboardMetrics = {
  totalUsers: number;
  totalCandidates: number;
  totalRecruiters: number;
  totalAdmins: number;
  totalCompanies: number;
  pendingCompanies: number;
  activeCompanies: number;
  totalJobs: number;
  publishedJobs: number;
  pendingJobs: number;
  flaggedJobs: number;
  rejectedJobs: number;
  totalApplications: number;
  applicationsLast7Days: number;
  applicationsLast30Days: number;
};

export type AdminCompanyQueueItem = {
  id: string;
  name: string;
  email?: string | null;
  website?: string | null;
  industry?: string | null;
  status: CompanyStatus;
  ownerEmail?: string | null;
};

export type AdminJobQueueItem = {
  id: string;
  title: string;
  companyId?: string | null;
  companyName?: string | null;
  status: JobStatus;
  location?: string | null;
  createdAt?: string | null;
  publishedAt?: string | null;
};

export type AdminApplicationActivityItem = {
  id: string;
  jobId?: string | null;
  jobTitle?: string | null;
  companyName?: string | null;
  candidateName?: string | null;
  candidateEmail?: string | null;
  aiScore?: number | null;
  appliedAt?: string | null;
};

export type AdminActivityItem = {
  type: string;
  title: string;
  description: string;
  occurredAt?: string | null;
};

export type AdminDashboardResponse = {
  metrics: AdminDashboardMetrics;
  pendingCompanies: AdminCompanyQueueItem[];
  pendingJobs: AdminJobQueueItem[];
  recentJobs: AdminJobQueueItem[];
  recentApplications: AdminApplicationActivityItem[];
  recentActivity: AdminActivityItem[];
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

export function getAdminDashboard(): Promise<AdminDashboardResponse> {
  return request<AdminDashboardResponse>("/api/admin/dashboard");
}
