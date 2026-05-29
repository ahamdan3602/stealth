import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section
      id="security"
      aria-labelledby="cta-heading"
      className="py-24 px-6 lg:px-8 bg-[var(--primary)] relative overflow-hidden"
    >
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 50% 100%, rgba(14,165,233,0.15) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h2
          id="cta-heading"
          className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Ready to bring role-aware AI to your team?
        </h2>
        <p className="mt-4 text-lg text-white/60 leading-relaxed">
          Create an account and see MedGuard AI in action — clinical staff get
          clinical answers, patients get patient answers, and nothing leaks across
          roles.
        </p>

        <div
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
          role="group"
          aria-label="Sign up or sign in"
        >
          <Button
            asChild
            size="lg"
            className="group bg-[var(--accent)] text-white hover:bg-sky-400 shadow-xl shadow-[var(--accent)]/20 hover:shadow-[var(--accent)]/40 hover:scale-[1.02] transition-all duration-200"
          >
            <Link href="/signup">
              Create free account
              <ArrowRight
                className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 backdrop-blur-sm"
          >
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" aria-hidden />
              Sign in
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
