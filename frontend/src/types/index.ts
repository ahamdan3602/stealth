// Mirrors backend Pydantic schemas exactly.

export type Role = "clinician" | "nurse" | "admin" | "patient";

export type Scope = "clinical" | "admin" | "patient";

export interface UserRead {
  id: string;
  email: string;
  role: Role;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ChatRequest {
  message: string;
  scope: Scope;
}

export interface ChatResponse {
  answer: string;
  citations: string[];
  guardrail: string | null;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  guardrail?: string | null;
  timestamp: Date;
}
