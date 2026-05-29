import { getToken } from "@/lib/auth";
import type { ChatRequest, ChatResponse, TokenResponse, UserRead } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(init.body && !(init.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<TokenResponse> {
  const form = new URLSearchParams({ username: email, password });
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    body: form,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: "Login failed" }));
    throw new ApiError(res.status, body.detail);
  }
  return res.json();
}

export async function register(
  email: string,
  password: string,
  role: string
): Promise<UserRead> {
  return request<UserRead>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  });
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export async function sendMessage(payload: ChatRequest): Promise<ChatResponse> {
  return request<ChatResponse>("/chat", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function listUsers(): Promise<UserRead[]> {
  return request<UserRead[]>("/admin/users");
}

export async function ingestDocument(file: File, docType: string): Promise<{ status: string }> {
  const form = new FormData();
  form.append("file", file);
  form.append("doc_type", docType);
  return request<{ status: string }>("/ingest", { method: "POST", body: form });
}

export { ApiError };
