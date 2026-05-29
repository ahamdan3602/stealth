"use client";

import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
  className?: string;
}

export function Topbar({ title, onMenuClick, className }: TopbarProps) {
  return (
    <header
      className={cn(
        "flex h-14 items-center gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-4 lg:px-6",
        className
      )}
      role="banner"
    >
      {/* Mobile menu trigger */}
      <button
        onClick={onMenuClick}
        className="text-[var(--text-muted)] hover:text-[var(--text)] lg:hidden"
        aria-label="Open navigation menu"
        aria-expanded="false"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>

      <h1 className="text-base font-semibold text-[var(--text)] truncate">
        {title}
      </h1>
    </header>
  );
}
