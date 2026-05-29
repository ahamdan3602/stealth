import type { Role, UserRead } from "@/types";

const TOKEN_KEY = "medguard_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** Decode the JWT payload (no signature verification — server validates). */
export function decodeToken(token: string): { sub: string; role: Role; exp: number } | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

export function getCurrentUser(): (UserRead & { exp: number }) | null {
  const token = getToken();
  if (!token) return null;
  const payload = decodeToken(token);
  if (!payload) return null;
  if (Date.now() / 1000 > payload.exp) {
    clearToken();
    return null;
  }
  return { id: payload.sub, email: "", role: payload.role, exp: payload.exp };
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export function getRole(): Role | null {
  return getCurrentUser()?.role ?? null;
}

/** Allowed chat scope(s) for a given role. */
export function allowedScopes(role: Role): string[] {
  const map: Record<Role, string[]> = {
    admin:     ["clinical", "admin"],
    clinician: ["clinical"],
    nurse:     ["clinical"],
    patient:   ["patient"],
  };
  return map[role] ?? [];
}
