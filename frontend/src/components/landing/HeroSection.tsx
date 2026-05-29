import Link from "next/link";
import {
  ShieldCheck,
  Database,
  Activity,
  ArrowRight,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FLOATING_BADGES = [
  { icon: ShieldCheck, label: "RBAC Enforced",       color: "text-[var(--accent)]",   bg: "bg-[var(--accent)]/10 border-[var(--accent)]/20" },
  { icon: Database,    label: "Pinecone ACL",         color: "text-emerald-400",       bg: "bg-emerald-400/10 border-emerald-400/20" },
  { icon: ShieldCheck, label: "NeMo Guardrails",      color: "text-amber-400",         bg: "bg-amber-400/10 border-amber-400/20" },
  { icon: Activity,    label: "LangSmith Tracing",    color: "text-purple-400",        bg: "bg-purple-400/10 border-purple-400/20" },
];

export function HeroSection() {
  return (
    <section
      id="hero"
      aria-label="Hero"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16 lg:px-8"
      style={{
        background: "linear-gradient(135deg, #0B1E35 0%, #1E3A5F 55%, #163152 100%)",
      }}
    >
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(14,165,233,0.12) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">

        {/* Eyebrow tag */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
            HIPAA-aligned · Secure RAG
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
          Medical AI that knows{" "}
          <span
            className="bg-gradient-to-r from-[var(--accent)] to-[var(--brand-blue)] bg-clip-text text-transparent"
          >
            who you are
          </span>
        </h1>

        {/* Subheading */}
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/65 sm:text-xl">
          MedGuard AI is a role-scoped RAG assistant for clinical and
          administrative teams. Clinicians see clinical data. Admins see admin
          data. Patients see only their own. Enforced at the vector level — not
          just the API.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4" role="group" aria-label="Get started">
          <Button
            asChild
            size="lg"
            className="group bg-[var(--accent)] text-white hover:bg-sky-400 shadow-xl shadow-[var(--accent)]/25 hover:shadow-[var(--accent)]/40 hover:scale-[1.02] transition-all duration-200"
          >
            <Link href="/signup">
              Get started free
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
            <a
              href="https://github.com/ahamdan3602/stealth"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View source code on GitHub (opens in new tab)"
            >
              <Code2 className="mr-2 h-4 w-4" aria-hidden />
              View on GitHub
            </a>
          </Button>
        </div>

        {/* Floating feature badges */}
        <div
          className="mt-14 flex flex-wrap items-center justify-center gap-3"
          aria-label="Key features"
          role="list"
        >
          {FLOATING_BADGES.map(({ icon: Icon, label, color, bg }) => (
            <div
              key={label}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-sm transition-transform duration-200 hover:scale-105 ${bg}`}
              role="listitem"
            >
              <Icon className={`h-4 w-4 ${color}`} aria-hidden />
              <span className="text-white/80">{label}</span>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="mt-16 flex flex-col items-center gap-2 opacity-40" aria-hidden>
          <span className="text-xs text-white uppercase tracking-widest">Scroll</span>
          <div className="h-8 w-px bg-gradient-to-b from-white to-transparent" />
        </div>
      </div>
    </section>
  );
}
