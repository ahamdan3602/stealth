"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "#features",     label: "Features" },
  { href: "#architecture", label: "Architecture" },
  { href: "#security",     label: "Security" },
];

export function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#0B1E35]/90 backdrop-blur-md border-b border-white/10 shadow-lg"
          : "bg-transparent"
      )}
      role="banner"
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-lg"
          aria-label="MedGuard AI home"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]/20 ring-1 ring-[var(--accent)]/40">
            <Shield className="h-4.5 w-4.5 text-[var(--accent)]" aria-hidden />
          </div>
          <span className="text-base font-bold text-white tracking-tight">
            MedGuard <span className="text-[var(--accent)]">AI</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-1" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors duration-150 hover:text-white hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <Link href="/login">Sign in</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-[var(--accent)] text-white hover:bg-sky-400 shadow-lg shadow-[var(--accent)]/20"
          >
            <Link href="/signup">Get started</Link>
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-white/70 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-[#0B1E35]/95 backdrop-blur-md border-t border-white/10 px-6 pb-6 pt-4"
          role="dialog"
          aria-label="Mobile navigation"
        >
          <ul className="flex flex-col gap-1 mb-4" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/8 transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            <Button asChild variant="outline" size="md" className="w-full border-white/20 text-white hover:bg-white/10">
              <Link href="/login" onClick={() => setMenuOpen(false)}>Sign in</Link>
            </Button>
            <Button asChild size="md" className="w-full bg-[var(--accent)] text-white hover:bg-sky-400">
              <Link href="/signup" onClick={() => setMenuOpen(false)}>Get started</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
