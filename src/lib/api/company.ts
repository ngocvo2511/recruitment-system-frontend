import { handleUnauthorizedResponse } from "@/lib/authSession";

export type ApiResponse<T> = {
  code: number;
  message: string;
  result: T;
};

export type CompanyRequest = {
  name: string;
  website?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  description?: string;
  industry: string;
  companySize: number;
  taxCode: string;
  businessLicense: string;
  logoUrl?: string | null;
};

export type CompanyResponse = CompanyRequest & {
  companyId?: string;
  createdById: string;
  status: CompanyStatus;
};

export type CompanyStatus = "PENDING" | "ACTIVE" | "REJECTED" | "BLOCKED";
export type CompanyRole = "OWNER" | "RECRUITER";
export type JoinStatus = "PENDING" | "APPROVED" | "REJECTED";
export type CompanyInviteStatus = "PENDING" | "ACCEPTED" | "CANCELLED";

export type CompanyMemberResponse = {
  companyId: string;
  companyName?: string;
  userId: string;
  fullName?: string | null;
  email?: string | null;
  joinStatus: JoinStatus;
  role: CompanyRole;
  reviewedBy?: string | null;
  requestedAt?: string | null;
  reviewedAt?: string | null;
};

export type CompanyDashboardResponse = CompanyRequest & {
  companyId: string;
  status: CompanyStatus;
  currentUserCompanyRole: CompanyRole;
  memberCount: number;
  openJobCount: number;
  pipelineCandidateCount: number;
  pendingRequestCount: number;
};

export type CompanyInviteResponse = {
  id: string;
  companyId: string;
  email: string;
  status: CompanyInviteStatus;
  sentAt?: string | null;
  invitedBy?: string | null;
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
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;

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

export function createCompany(payload: CompanyRequest): Promise<CompanyResponse> {
  return request<CompanyResponse>("/companies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function joinCompany(companyId: string): Promise<CompanyMemberResponse> {
  return request<CompanyMemberResponse>(`/companies/${companyId}/join`, {
    method: "POST",
  });
}

export function getMyCompanyMemberships(): Promise<CompanyMemberResponse[]> {
  return request<CompanyMemberResponse[]>("/companies/my-memberships");
}

export function getMyCompany(): Promise<CompanyDashboardResponse> {
  return request<CompanyDashboardResponse>("/companies/me");
}

export function updateCompany(
  companyId: string,
  payload: CompanyRequest,
): Promise<CompanyDashboardResponse> {
  return request<CompanyDashboardResponse>(`/companies/${companyId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function uploadCompanyLogo(companyId: string, file: File): Promise<CompanyDashboardResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return request<CompanyDashboardResponse>(`/companies/${companyId}/logo`, {
    method: "PUT",
    body: formData,
  });
}

export function getCompanyMembers(companyId: string): Promise<CompanyMemberResponse[]> {
  return request<CompanyMemberResponse[]>(`/companies/${companyId}/members`);
}

export function getPendingCompanyMembers(companyId: string): Promise<CompanyMemberResponse[]> {
  return request<CompanyMemberResponse[]>(`/companies/${companyId}/members/pending`);
}

export function approveCompanyMember(
  companyId: string,
  userId: string,
): Promise<CompanyMemberResponse> {
  return request<CompanyMemberResponse>(`/companies/${companyId}/members/${userId}/approve`, {
    method: "POST",
  });
}

export function rejectCompanyMember(
  companyId: string,
  userId: string,
): Promise<CompanyMemberResponse> {
  return request<CompanyMemberResponse>(`/companies/${companyId}/members/${userId}/reject`, {
    method: "POST",
  });
}

export function removeCompanyMember(companyId: string, userId: string): Promise<void> {
  return request<void>(`/companies/${companyId}/members/${userId}`, {
    method: "DELETE",
  });
}

export function inviteRecruiter(companyId: string, email: string): Promise<CompanyInviteResponse> {
  return request<CompanyInviteResponse>(`/companies/${companyId}/invites`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function getCompanyInvites(companyId: string): Promise<CompanyInviteResponse[]> {
  return request<CompanyInviteResponse[]>(`/companies/${companyId}/invites`);
}

export function cancelCompanyInvite(
  companyId: string,
  inviteId: string,
): Promise<CompanyInviteResponse> {
  return request<CompanyInviteResponse>(`/companies/${companyId}/invites/${inviteId}`, {
    method: "DELETE",
  });
}
