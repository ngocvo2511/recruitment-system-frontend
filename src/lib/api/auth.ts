export type ApiResponse<T> = {
  code: number;
  message: string;
  result: T;
};

export type AuthResponse = {
  token: string;
  authenticated: boolean;
  accountType?: "CANDIDATE" | "RECRUITER" | string;
  userId?: string;
};

export type RegisterRecruiterProfileRequest = {
  fullName: string;
  gender: string;
  phone: string;
  position?: string;
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

export function saveAccessToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem("token", token);
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem("token");
  window.localStorage.removeItem("accountType");
  window.localStorage.removeItem("userId");
}

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

async function request<T>(
  path: string,
  init?: RequestInit,
  options: { auth?: boolean } = { auth: true },
): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false && token) {
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

export function registerCandidate(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/register/candidate", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }, { auth: false });
}

export function registerRecruiter(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/register/recruiter", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }, { auth: false });
}

export function createRecruiterProfile(
  payload: RegisterRecruiterProfileRequest,
): Promise<RegisterRecruiterProfileRequest> {
  return request<RegisterRecruiterProfileRequest>("/api/recruiters/profile", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
