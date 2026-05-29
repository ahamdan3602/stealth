import {
  ShieldCheck,
  Database,
  Shield,
  RefreshCw,
  Activity,
  Lock,
} from "lucide-react";

const FEATURES = [
  {
    icon:        ShieldCheck,
    title:       "Role-Based Access Control",
    description: "Four roles — clinician, nurse, admin, patient — each with a strict permission matrix. Every request is checked before touching the chain.",
    color:       "text-[var(--brand-blue)]",
    bg:          "bg-[var(--brand-blue)]/8 group-hover:bg-[var(--brand-blue)]/14",
    border:      "group-hover:border-[var(--brand-blue)]/40",
  },
  {
    icon:        Database,
    title:       "Vector-Level ACL",
    description: "ACL metadata is embedded directly into Pinecone vectors at ingest time. The wrong role gets zero results — not hidden results, zero.",
    color:       "text-emerald-600",
    bg:          "bg-emerald-500/8 group-hover:bg-emerald-500/14",
    border:      "group-hover:border-emerald-500/40",
  },
  {
    icon:        Shield,
    title:       "Input Guardrails",
    description: "Prompt injection and off-topic requests are intercepted before reaching the RAG chain — no API cost, no LLM exposure, no jailbreaks.",
    color:       "text-amber-600",
    bg:          "bg-amber-500/8 group-hover:bg-amber-500/14",
    border:      "group-hover:border-amber-500/40",
  },
  {
    icon:        RefreshCw,
    title:       "Groundedness + Self-Correction",
    description: "Every response is scored against the retrieved context. Answers that fall below the groundedness threshold are automatically rewritten.",
    color:       "text-purple-600",
    bg:          "bg-purple-500/8 group-hover:bg-purple-500/14",
    border:      "group-hover:border-purple-500/40",
  },
  {
    icon:        Activity,
    title:       "LangSmith Tracing",
    description: "Every chain run is tagged by role and traced end-to-end. Filter by clinician vs patient in the LangSmith dashboard to debug access patterns.",
    color:       "text-[var(--accent)]",
    bg:          "bg-[var(--accent)]/8 group-hover:bg-[var(--accent)]/14",
    border:      "group-hover:border-[var(--accent)]/40",
  },
  {
    icon:        Lock,
    title:       "HIPAA-Aligned Security",
    description: "JWT authentication, bcrypt passwords, structured audit logging, and role-scoped data access enforced at every layer of the stack.",
    color:       "text-[var(--primary)]",
    bg:          "bg-[var(--primary)]/8 group-hover:bg-[var(--primary)]/14",
    border:      "group-hover:border-[var(--primary)]/40",
  },
];

export function FeatureGrid() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="bg-[var(--background)] py-24 px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">

        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--brand-blue)] mb-3">
            Built for healthcare
          </p>
          <h2
            id="features-heading"
            className="text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl"
          >
            Security is not a feature. It&apos;s the foundation.
          </h2>
          <p className="mt-4 text-lg text-[var(--text-muted)] leading-relaxed">
            Every layer of MedGuard AI is designed with the assumption that the
            wrong person will try to access the wrong data.
          </p>
        </div>

        {/* Grid */}
        <ul
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Security features"
          role="list"
        >
          {FEATURES.map(({ icon: Icon, title, description, color, bg, border }) => (
            <li
              key={title}
              className={`group relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${border}`}
              role="article"
            >
              {/* Icon */}
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-200 ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} aria-hidden />
              </div>

              {/* Text */}
              <h3 className="mb-2 text-base font-semibold text-[var(--text)]">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                {description}
              </p>

              {/* Subtle corner accent on hover */}
              <div
                className="pointer-events-none absolute bottom-0 right-0 h-16 w-16 rounded-br-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(circle at bottom right, rgba(14,165,233,0.08), transparent 70%)",
                }}
                aria-hidden
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
