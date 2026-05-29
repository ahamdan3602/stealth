import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata = { title: "Create account — MedGuard AI" };

export default function SignUpPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4"
      aria-label="Sign up page"
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-md">
        <SignUpForm />
        <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
          HIPAA-aligned · Role-based access control · Encrypted in transit
        </p>
      </div>
    </div>
  );
}
