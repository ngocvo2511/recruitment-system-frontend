export type ApiResponse<T> = {
  code: number;
  message: string;
  result: T;
};

export type CvBuilderTemplateResponse = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  previewImageUrl?: string | null;
  displayOrder?: number | null;
};

export type CvBuilderDraftResponse = {
  id: string;
  templateId: string;
  templateCode: string;
  templateName: string;
  title?: string | null;
  contentJson: string;
  status: "DRAFT" | "PUBLISHED";
  validationStatus?: "VALID" | "HAS_WARNINGS" | "HAS_ERRORS";
  validationIssues?: CvBuilderValidationIssue[];
  validatedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type CvBuilderValidationIssue = {
  code: string;
  severity: "WARNING" | "ERROR";
  sectionId?: string | null;
  fieldPath?: string | null;
  message?: string | null;
  hint?: string | null;
};

export type CreateDraftFromTemplateRequest = {
  templateId: string;
  title?: string;
  profileSeed?: string;
};

export type UpdateCvBuilderDraftRequest = {
  title?: string;
  contentJson: string;
};

export type AddCustomSectionRequest = {
  sectionType?: string | null;
  sectionTitle: string;
  dataJson?: string | null;
  insertAt?: number | null;
};

export type ReorderCvBuilderSectionsRequest = {
  sectionIds: string[];
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

export function getCvBuilderTemplates(): Promise<CvBuilderTemplateResponse[]> {
  return request<CvBuilderTemplateResponse[]>("/api/cv-builder/templates");
}

export function createDraftFromTemplate(
  payload: CreateDraftFromTemplateRequest,
): Promise<CvBuilderDraftResponse> {
  return request<CvBuilderDraftResponse>("/api/cv-builder/drafts/from-template", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCvBuilderDraft(draftId: string): Promise<CvBuilderDraftResponse> {
  return request<CvBuilderDraftResponse>(`/api/cv-builder/drafts/${draftId}`);
}

export function updateCvBuilderDraft(
  draftId: string,
  payload: UpdateCvBuilderDraftRequest,
): Promise<CvBuilderDraftResponse> {
  return request<CvBuilderDraftResponse>(`/api/cv-builder/drafts/${draftId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function addCvBuilderSection(
  draftId: string,
  payload: AddCustomSectionRequest,
): Promise<CvBuilderDraftResponse> {
  return request<CvBuilderDraftResponse>(`/api/cv-builder/drafts/${draftId}/sections`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function reorderCvBuilderSections(
  draftId: string,
  payload: ReorderCvBuilderSectionsRequest,
): Promise<CvBuilderDraftResponse> {
  return request<CvBuilderDraftResponse>(`/api/cv-builder/drafts/${draftId}/sections/reorder`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteCvBuilderSection(draftId: string, sectionId: string): Promise<CvBuilderDraftResponse> {
  return request<CvBuilderDraftResponse>(`/api/cv-builder/drafts/${draftId}/sections/${sectionId}`, {
    method: "DELETE",
  });
}
