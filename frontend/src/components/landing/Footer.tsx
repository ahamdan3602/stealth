import Link from "next/link";
import { Shield } from "lucide-react";

const FOOTER_LINKS = [
  { label: "Features",     href: "#features" },
  { label: "Architecture", href: "#architecture" },
  { label: "Sign in",      href: "/login" },
  { label: "Sign up",      href: "/signup" },
  { label: "GitHub",       href: "https://github.com/ahamdan3602/stealth", external: true },
];

const ROLE_TAGS = ["Clinician", "Nurse", "Admin", "Patient"];

export function Footer() {
  return (
    <footer
      className="bg-[#0B1E35] border-t border-white/8 py-12 px-6 lg:px-8"
      role="contentinfo"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between sm:items-start">

          {/* Brand */}
          <div className="flex flex-col items-center gap-3 sm:items-start">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)]/15 ring-1 ring-[var(--accent)]/30">
                <Shield className="h-4 w-4 text-[var(--accent)]" aria-hidden />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">
                MedGuard <span className="text-[var(--accent)]">AI</span>
              </span>
            </div>
            <p className="text-xs text-white/35 max-w-xs text-center sm:text-left leading-relaxed">
              Secure, RBAC-enforced RAG medical assistant for clinical and
              administrative teams.
            </p>
            {/* Role tags */}
            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start" aria-label="Supported roles">
              {ROLE_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-white/40"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Nav links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 sm:justify-end" role="list">
              {FOOTER_LINKS.map(({ label, href, external }) => (
                <li key={label} role="listitem">
                  {external ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/40 hover:text-white/80 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
                      aria-label={`${label} (opens in new tab)`}
                    >
                      {label}
                    </a>
                  ) : (
                    <Link
                      href={href}
                      className="text-sm text-white/40 hover:text-white/80 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
                    >
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Divider + copyright */}
        <div className="mt-10 border-t border-white/8 pt-6 text-center">
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} MedGuard AI · Portfolio project · Built with FastAPI, LangChain, Pinecone & Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
