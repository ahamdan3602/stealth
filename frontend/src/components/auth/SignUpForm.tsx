"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { register } from "@/lib/api";
import { ApiError } from "@/lib/api";
import type { Role } from "@/types";

const ROLES: { value: Role; label: string; description: string }[] = [
  { value: "clinician", label: "Clinician",  description: "Physician or specialist" },
  { value: "nurse",     label: "Nurse",      description: "Nursing staff" },
  { value: "patient",   label: "Patient",    description: "Personal health information" },
];

export function SignUpForm() {
  const router = useRouter();

  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [role, setRole]           = useState<Role>("clinician");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!email.includes("@")) errs.email = "Enter a valid email address.";
    if (password.length < 8)  errs.password = "Password must be at least 8 characters.";
    if (password !== confirm)  errs.confirm = "Passwords do not match.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await register(email, password, role);
      // Redirect to login with a success flag in the URL
      router.push("/login?registered=1");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 400 ? "An account with that email already exists." : err.message);
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
        <CardTitle className="text-2xl">Create account</CardTitle>
        <CardDescription>Join MedGuard AI — access is role-scoped</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

          <Input
            id="email"
            type="email"
            label="Email address"
            placeholder="you@hospital.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            required
            autoComplete="email"
            autoFocus
          />

          {/* Password */}
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              label="Password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              required
              autoComplete="new-password"
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

          <Input
            id="confirm"
            type={showPw ? "text" : "password"}
            label="Confirm password"
            placeholder="Re-enter password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={fieldErrors.confirm}
            required
            autoComplete="new-password"
          />

          {/* Role selector */}
          <fieldset>
            <legend className="text-sm font-medium text-[var(--text)] mb-2">
              Role
            </legend>
            <div className="flex flex-col gap-2">
              {ROLES.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all duration-150 ${
                    role === r.value
                      ? "border-[var(--brand-blue)] bg-[var(--brand-blue)]/5 ring-1 ring-[var(--brand-blue)]"
                      : "border-[var(--border)] hover:border-[var(--text-muted)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={role === r.value}
                    onChange={() => setRole(r.value)}
                    className="mt-0.5 accent-[var(--brand-blue)]"
                    aria-label={r.label}
                  />
                  <span className="flex flex-col">
                    <span className="text-sm font-medium text-[var(--text)]">{r.label}</span>
                    <span className="text-xs text-[var(--text-muted)]">{r.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

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
            {loading ? "Creating account…" : "Create account"}
          </Button>

          <p className="text-center text-sm text-[var(--text-muted)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[var(--brand-blue)] font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
