"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shield, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { login } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { access_token } = await login(email, password);
      setToken(access_token);
      router.replace("/chat");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 401 ? "Invalid email or password." : err.message);
      } else {
        setError("Unable to connect to the server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]">
          <Shield className="h-7 w-7 text-[var(--accent)]" aria-hidden />
        </div>
        <CardTitle className="text-2xl">MedGuard AI</CardTitle>
        <CardDescription>Sign in to your secure medical assistant</CardDescription>
      </CardHeader>

      <CardContent>
        {justRegistered && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-lg bg-[var(--success)]/8 border border-[var(--success)]/20 px-3 py-2.5 text-sm text-[var(--success)] mb-2"
          >
            <CheckCircle className="h-4 w-4 shrink-0" aria-hidden />
            Account created! Sign in below.
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            id="email"
            type="email"
            label="Email address"
            placeholder="you@hospital.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
          />

          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-8 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg bg-[var(--danger)]/8 border border-[var(--danger)]/20 px-3 py-2.5 text-sm text-[var(--danger)]"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full mt-1"
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>

          <p className="text-center text-sm text-[var(--text-muted)]">
            No account?{" "}
            <Link
              href="/signup"
              className="text-[var(--brand-blue)] font-medium hover:underline"
            >
              Create one
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
