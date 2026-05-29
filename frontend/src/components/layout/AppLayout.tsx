"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { isAuthenticated } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title = "MedGuard AI" }: AppLayoutProps) {
  const router        = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Guard: redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) router.replace("/login");
  }, [router]);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* ── Desktop sidebar ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar />
      </div>

      {/* ── Mobile sidebar overlay ──────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col shadow-lg">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Main area ────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Topbar
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main
          className={cn(
            "flex-1 overflow-y-auto",
            "p-4 lg:p-6"
          )}
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
