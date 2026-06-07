export type AccountType = "candidate" | "recruiter" | "admin";

type JwtPayload = {
  scope?: string;
  user_id?: string;
};

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + (4 - normalized.length % 4) % 4, "=");
    return JSON.parse(window.atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

export function normalizeAccountType(value?: string | null): AccountType | null {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase();
  if (normalized === "candidate" || normalized === "recruiter" || normalized === "admin") {
    return normalized;
  }

  return null;
}

export function getAccountTypeFromToken(token: string): AccountType | null {
  const payload = decodeJwtPayload(token);
  const scopes = payload?.scope?.split(" ") ?? [];

  if (scopes.includes("ROLE_ADMIN")) {
    return "admin";
  }

  if (scopes.includes("ROLE_RECRUITER")) {
    return "recruiter";
  }

  if (scopes.includes("ROLE_CANDIDATE")) {
    return "candidate";
  }

  return null;
}

export function getStoredAccountType(): AccountType | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedAccountType = normalizeAccountType(window.localStorage.getItem("accountType"));
  if (storedAccountType) {
    return storedAccountType;
  }

  const token = window.localStorage.getItem("token");
  return token ? getAccountTypeFromToken(token) : null;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("token");
}

export function getHomePathForAccount(accountType: AccountType): string {
  if (accountType === "admin") {
    return "/admin/dashboard";
  }

  if (accountType === "recruiter") {
    return "/recruiter/dashboard";
  }

  return "/candidate/dashboard";
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem("token");
  window.localStorage.removeItem("accountType");
  window.localStorage.removeItem("userId");
}

export function saveAuthSession(token: string, accountType: AccountType, userId?: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem("token", token);
  window.localStorage.setItem("accountType", accountType);
  if (userId) {
    window.localStorage.setItem("userId", userId);
  }
}
