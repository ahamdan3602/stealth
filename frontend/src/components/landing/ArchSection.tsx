import {
  Monitor,
  Server,
  ShieldCheck,
  GitBranch,
  Database,
  Cpu,
  ArrowDown,
} from "lucide-react";

const STACK_LAYERS = [
  {
    id:      "frontend",
    label:   "Next.js Frontend",
    tech:    "TypeScript · React 19 · Tailwind CSS v4",
    icon:    Monitor,
    color:   "text-[var(--accent)]",
    border:  "border-[var(--accent)]/30",
    bg:      "bg-[var(--accent)]/8",
  },
  {
    id:      "api",
    label:   "FastAPI + JWT + RBAC",
    tech:    "Python 3.14 · SQLAlchemy · Postgres",
    icon:    Server,
    color:   "text-[var(--brand-blue)]",
    border:  "border-[var(--brand-blue)]/30",
    bg:      "bg-[var(--brand-blue)]/8",
  },
  {
    id:      "guardrails",
    label:   "NeMo Guardrails",
    tech:    "Input rails · Groundedness · Self-correction",
    icon:    ShieldCheck,
    color:   "text-amber-400",
    border:  "border-amber-400/30",
    bg:      "bg-amber-400/8",
  },
  {
    id:      "rag",
    label:   "LangChain RAG Chain",
    tech:    "LCEL · Role prompts · LangSmith tracing",
    icon:    GitBranch,
    color:   "text-purple-400",
    border:  "border-purple-400/30",
    bg:      "bg-purple-400/8",
  },
];

const BOTTOM_LAYER = [
  { label: "Pinecone",    sub: "Vector DB · ACL metadata",          icon: Database, color: "text-emerald-400", border: "border-emerald-400/30", bg: "bg-emerald-400/8" },
  { label: "OpenAI",      sub: "GPT-4o · text-embedding-3-small",   icon: Cpu,      color: "text-[var(--accent)]", border: "border-[var(--accent)]/30", bg: "bg-[var(--accent)]/8" },
];

const TECH_BADGES = [
  "Python 3.14", "TypeScript", "FastAPI", "Next.js 16",
  "LangChain", "LangSmith", "Pinecone", "OpenAI",
  "NeMo Guardrails", "Postgres", "Docker", "SQLAlchemy",
];

export function ArchSection() {
  return (
    <section
      id="architecture"
      aria-labelledby="arch-heading"
      className="py-24 px-6 lg:px-8"
      style={{ background: "linear-gradient(180deg, #0F2442 0%, #0B1E35 100%)" }}
    >
      <div className="mx-auto max-w-7xl">

        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--accent)] mb-3">
            Architecture
          </p>
          <h2
            id="arch-heading"
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            A secure RAG stack, layer by layer
          </h2>
          <p className="mt-4 text-lg text-white/55 leading-relaxed">
            Each layer has exactly one job. Security is enforced at every boundary,
            not just the top.
          </p>
        </div>

        {/* Stack diagram */}
        <div
          className="mx-auto max-w-lg flex flex-col items-center gap-0"
          role="list"
          aria-label="Architecture layers from top to bottom"
        >
          {STACK_LAYERS.map(({ id, label, tech, icon: Icon, color, border, bg }, i) => (
            <div key={id} className="flex flex-col items-center w-full" role="listitem">
              <div
                className={`group w-full rounded-2xl border ${border} ${bg} px-6 py-4 flex items-center gap-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/30 backdrop-blur-sm`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 group-hover:ring-white/20 transition-all`}>
                  <Icon className={`h-5 w-5 ${color}`} aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{label}</p>
                  <p className="text-xs text-white/45 truncate">{tech}</p>
                </div>
              </div>

              {/* Connector arrow (not after last layer) */}
              {i < STACK_LAYERS.length - 1 && (
                <div className="flex flex-col items-center py-1" aria-hidden>
                  <div className="w-px h-4 bg-white/15" />
                  <ArrowDown className="h-3 w-3 text-white/25" />
                </div>
              )}
            </div>
          ))}

          {/* Arrow to split bottom layer */}
          <div className="flex flex-col items-center py-1" aria-hidden>
            <div className="w-px h-4 bg-white/15" />
            <ArrowDown className="h-3 w-3 text-white/25" />
          </div>

          {/* Bottom split: Pinecone + OpenAI */}
          <div
            className="grid grid-cols-2 gap-4 w-full"
            role="list"
            aria-label="Data layer"
          >
            {BOTTOM_LAYER.map(({ label, sub, icon: Icon, color, border, bg }) => (
              <div
                key={label}
                className={`group rounded-2xl border ${border} ${bg} px-4 py-4 flex flex-col items-center gap-2 text-center transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:shadow-black/30 backdrop-blur-sm`}
                role="listitem"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
                  <Icon className={`h-5 w-5 ${color}`} aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-white/45 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech badge grid */}
        <div className="mt-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/35 mb-5">
            Full tech stack
          </p>
          <ul
            className="flex flex-wrap justify-center gap-2"
            aria-label="Technologies used"
            role="list"
          >
            {TECH_BADGES.map((tech) => (
              <li key={tech} role="listitem">
                <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60 transition-all duration-150 hover:border-white/25 hover:bg-white/10 hover:text-white/90">
                  {tech}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
