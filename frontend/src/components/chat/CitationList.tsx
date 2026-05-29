"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";

interface CitationListProps {
  citations: string[];
}

export function CitationList({ citations }: CitationListProps) {
  const [open, setOpen] = useState(false);

  if (!citations.length) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--brand-blue)] transition-colors"
        aria-expanded={open}
        aria-controls="citation-list"
      >
        {open ? (
          <ChevronUp className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" aria-hidden />
        )}
        {citations.length} source{citations.length !== 1 ? "s" : ""}
      </button>

      {open && (
        <ul
          id="citation-list"
          className="mt-1.5 flex flex-wrap gap-1.5"
          aria-label="Sources"
        >
          {citations.map((source) => (
            <li
              key={source}
              className="flex items-center gap-1 rounded-md bg-[var(--background)] border border-[var(--border)] px-2 py-1 text-xs text-[var(--text-muted)] font-mono"
            >
              <FileText className="h-3 w-3 shrink-0" aria-hidden />
              {source}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
