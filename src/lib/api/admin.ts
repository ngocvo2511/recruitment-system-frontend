import { handleUnauthorizedResponse } from "@/lib/authSession";

export type ApiResponse<T> = {
  code: number;
  message: string;
  result: T;
};

export type CompanyStatus = "PENDING" | "ACTIVE" | "REJECTED" | "BLOCKED";
export type JobStatus = "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED" | "FLAGGED" | "CLOSED";
export type JobReportStatus = "PENDING" | "RESOLVED" | "DISMISSED";
export type JobReportReason = "MISLEADING_INFORMATION" | "SCAM_OR_FRAUD" | "DISCRIMINATION" | "INAPPROPRIATE_CONTENT" | "DUPLICATE_OR_EXPIRED" | "OTHER";

export type JobReportResponse = {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName?: string | null;
  jobStatus: JobStatus;
  reporterId: string;
  reporterEmail: string;
  reason: JobReportReason;
  details?: string | null;
  status: JobReportStatus;
  adminNote?: string | null;
  reviewedByEmail?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
};

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

export type AdminPageResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

export type AdminUserResponse = {
  id: string;
  email: string;
  role?: string | null;
  enabled: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type AdminCompanyResponse = {
  id: string;
  name: string;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  description?: string | null;
  industry?: string | null;
  companySize?: number | null;
  taxCode?: string | null;
  businessLicense?: string | null;
  status: CompanyStatus;
  createdById?: string | null;
  ownerEmail?: string | null;
  ownerName?: string | null;
  memberCount: number;
  pendingMemberCount: number;
  openJobCount: number;
};

export type AdminJobResponse = {
  id: string;
  title: string;
  description?: string | null;
  workingTime?: string | null;
  location?: string | null;
  employmentType?: string | null;
  workMode?: string | null;
  level?: string | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  currency?: string | null;
  salaryNegotiable?: boolean | null;
  headcount?: number | null;
  deadline?: string | null;
  companyId?: string | null;
  companyName?: string | null;
  companyStatus?: string | null;
  recruiterId?: string | null;
  recruiterEmail?: string | null;
  status: JobStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
  publishedAt?: string | null;
  closedAt?: string | null;
  applicationCount: number;
  requirementSections?: Array<{
    id?: string | null;
    title: string;
    sectionType?: string | null;
    displayOrder?: number | null;
    items?: Array<{
      id?: string | null;
      content: string;
      displayOrder?: number | null;
    }>;
  }>;
};

export type AdminAnalyticsOverviewResponse = {
  overview: {
    totalUsers: number;
    totalCompanies: number;
    totalJobs: number;
    totalApplications: number;
    jobsLast30Days: number;
    applicationsLast30Days: number;
  };
  funnel: {
    applications: number;
    screening: number;
    interviews: number;
    offers: number;
    hires: number;
    rejected: number;
  };
  aiMetrics: {
    scoredApplications: number;
    averageApplicationAiScore?: number | null;
  };
  applicationsByDay: Array<{ date: string; count: number }>;
  jobsByDay: Array<{ date: string; count: number }>;
};

export type AdminAuditLogResponse = {
  id: string;
  adminUserId?: string | null;
  adminEmail?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  reason?: string | null;
  createdAt?: string | null;
};

export type AdminSettingsResponse = {
  autoApproveJobsFromVerifiedCompanies: boolean;
  requireAdminApprovalForAllJobs: boolean;
  companyVerificationMode: "MANUAL" | "AUTO_APPROVE";
  aiMatchingEnabled: boolean;
  notifyAdminsForCompanyReview: boolean;
  notifyAdminsForJobReview: boolean;
  notifyRecruitersForModeration: boolean;
  notifyCompanyOwnersForModeration: boolean;
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

export function getAdminDashboard(): Promise<AdminDashboardResponse> {
  return request<AdminDashboardResponse>("/api/admin/dashboard");
}

function moderationBody(reason?: string): RequestInit {
  return {
    method: "PATCH",
    body: JSON.stringify({ reason: reason ?? "" }),
  };
}

export function getAdminUsers(params: {
  page?: number;
  size?: number;
  keyword?: string;
  role?: string;
  enabled?: boolean | null;
} = {}): Promise<AdminPageResponse<AdminUserResponse>> {
  const search = new URLSearchParams();
  search.set("page", String(params.page ?? 0));
  search.set("size", String(params.size ?? 20));
  if (params.keyword) search.set("keyword", params.keyword);
  if (params.role && params.role !== "ALL") search.set("role", params.role);
  if (params.enabled !== undefined && params.enabled !== null) search.set("enabled", String(params.enabled));
  return request<AdminPageResponse<AdminUserResponse>>(`/api/admin/users?${search.toString()}`);
}

export function getAdminUser(userId: string): Promise<AdminUserResponse> {
  return request<AdminUserResponse>(`/api/admin/users/${userId}`);
}

export function enableAdminUser(userId: string, reason?: string): Promise<AdminUserResponse> {
  return request<AdminUserResponse>(`/api/admin/users/${userId}/enable`, moderationBody(reason));
}

export function disableAdminUser(userId: string, reason?: string): Promise<AdminUserResponse> {
  return request<AdminUserResponse>(`/api/admin/users/${userId}/disable`, moderationBody(reason));
}

export function getAdminCompanies(params: {
  page?: number;
  size?: number;
  keyword?: string;
  status?: CompanyStatus | "ALL";
} = {}): Promise<AdminPageResponse<AdminCompanyResponse>> {
  const search = new URLSearchParams();
  search.set("page", String(params.page ?? 0));
  search.set("size", String(params.size ?? 20));
  if (params.keyword) search.set("keyword", params.keyword);
  if (params.status && params.status !== "ALL") search.set("status", params.status);
  return request<AdminPageResponse<AdminCompanyResponse>>(`/api/admin/companies?${search.toString()}`);
}

export function getAdminCompany(companyId: string): Promise<AdminCompanyResponse> {
  return request<AdminCompanyResponse>(`/api/admin/companies/${companyId}`);
}

export function verifyAdminCompany(companyId: string, reason?: string): Promise<AdminCompanyResponse> {
  return request<AdminCompanyResponse>(`/api/admin/companies/${companyId}/verify`, moderationBody(reason));
}

export function rejectAdminCompany(companyId: string, reason?: string): Promise<AdminCompanyResponse> {
  return request<AdminCompanyResponse>(`/api/admin/companies/${companyId}/reject`, moderationBody(reason));
}

export function requestMoreInfoAdminCompany(companyId: string, reason?: string): Promise<AdminCompanyResponse> {
  return request<AdminCompanyResponse>(`/api/admin/companies/${companyId}/request-more-info`, moderationBody(reason));
}

export function getAdminJobs(params: {
  page?: number;
  size?: number;
  keyword?: string;
  status?: JobStatus | "ALL";
  companyStatus?: CompanyStatus | "ALL";
  fromDate?: string;
  toDate?: string;
} = {}): Promise<AdminPageResponse<AdminJobResponse>> {
  const search = new URLSearchParams();
  search.set("page", String(params.page ?? 0));
  search.set("size", String(params.size ?? 20));
  if (params.keyword) search.set("keyword", params.keyword);
  if (params.status && params.status !== "ALL") search.set("status", params.status);
  if (params.companyStatus && params.companyStatus !== "ALL") search.set("companyStatus", params.companyStatus);
  if (params.fromDate) search.set("fromDate", params.fromDate);
  if (params.toDate) search.set("toDate", params.toDate);
  return request<AdminPageResponse<AdminJobResponse>>(`/api/admin/jobs?${search.toString()}`);
}

export function getAdminJob(jobId: string): Promise<AdminJobResponse> {
  return request<AdminJobResponse>(`/api/admin/jobs/${jobId}`);
}

export function approveAdminJob(jobId: string, reason?: string): Promise<AdminJobResponse> {
  return request<AdminJobResponse>(`/api/admin/jobs/${jobId}/approve`, moderationBody(reason));
}

export function rejectAdminJob(jobId: string, reason?: string): Promise<AdminJobResponse> {
  return request<AdminJobResponse>(`/api/admin/jobs/${jobId}/reject`, moderationBody(reason));
}

export function flagAdminJob(jobId: string, reason?: string): Promise<AdminJobResponse> {
  return request<AdminJobResponse>(`/api/admin/jobs/${jobId}/flag`, moderationBody(reason));
}

export function unflagAdminJob(jobId: string, reason?: string): Promise<AdminJobResponse> {
  return request<AdminJobResponse>(`/api/admin/jobs/${jobId}/unflag`, moderationBody(reason));
}

export function closeAdminJob(jobId: string, reason?: string): Promise<AdminJobResponse> {
  return request<AdminJobResponse>(`/api/admin/jobs/${jobId}/close`, moderationBody(reason));
}

export function getAdminJobReports(params: {
  page?: number;
  size?: number;
  status?: JobReportStatus | "ALL";
} = {}): Promise<AdminPageResponse<JobReportResponse>> {
  const search = new URLSearchParams();
  search.set("page", String(params.page ?? 0));
  search.set("size", String(params.size ?? 20));
  if (params.status && params.status !== "ALL") search.set("status", params.status);
  return request<AdminPageResponse<JobReportResponse>>(`/api/admin/job-reports?${search.toString()}`);
}

export function reviewAdminJobReport(
  reportId: string,
  status: "RESOLVED" | "DISMISSED",
  adminNote?: string,
): Promise<JobReportResponse> {
  return request<JobReportResponse>(`/api/admin/job-reports/${reportId}`, {
    method: "PATCH",
    body: JSON.stringify({ status, adminNote }),
  });
}

export function getAdminAnalyticsOverview(params: {
  fromDate?: string;
  toDate?: string;
} = {}): Promise<AdminAnalyticsOverviewResponse> {
  const search = new URLSearchParams();
  if (params.fromDate) search.set("fromDate", params.fromDate);
  if (params.toDate) search.set("toDate", params.toDate);
  const suffix = search.toString() ? `?${search.toString()}` : "";
  return request<AdminAnalyticsOverviewResponse>(`/api/admin/analytics/overview${suffix}`);
}

export function getAdminAuditLogs(params: {
  page?: number;
  size?: number;
  adminUserId?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  fromDate?: string;
  toDate?: string;
} = {}): Promise<AdminPageResponse<AdminAuditLogResponse>> {
  const search = new URLSearchParams();
  search.set("page", String(params.page ?? 0));
  search.set("size", String(params.size ?? 20));
  if (params.adminUserId) search.set("adminUserId", params.adminUserId);
  if (params.action) search.set("action", params.action);
  if (params.targetType) search.set("targetType", params.targetType);
  if (params.targetId) search.set("targetId", params.targetId);
  if (params.fromDate) search.set("fromDate", params.fromDate);
  if (params.toDate) search.set("toDate", params.toDate);
  return request<AdminPageResponse<AdminAuditLogResponse>>(`/api/admin/audit-logs?${search.toString()}`);
}

export function getAdminSettings(): Promise<AdminSettingsResponse> {
  return request<AdminSettingsResponse>("/api/admin/settings");
}

export function updateAdminSettings(settings: Partial<AdminSettingsResponse>): Promise<AdminSettingsResponse> {
  return request<AdminSettingsResponse>("/api/admin/settings", {
    method: "PATCH",
    body: JSON.stringify(settings),
  });
}
