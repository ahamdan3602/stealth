"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MessageSquare,
  Users,
  Upload,
  LogOut,
  Shield,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { clearToken, getRole } from "@/lib/auth";
import type { Role } from "@/types";

const ROLE_LABELS: Record<Role, string> = {
  admin:     "Admin",
  clinician: "Clinician",
  nurse:     "Nurse",
  patient:   "Patient",
};

const ROLE_BADGE: Record<Role, "primary" | "default" | "success" | "muted"> = {
  admin:     "primary",
  clinician: "default",
  nurse:     "success",
  patient:   "muted",
};

const NAV_ITEMS = [
  { href: "/chat",  label: "Chat",       icon: MessageSquare, roles: ["admin", "clinician", "nurse", "patient"] },
  { href: "/admin", label: "Users",      icon: Users,         roles: ["admin"] },
  { href: "/admin", label: "Ingest Docs",icon: Upload,        roles: ["admin"] },
] as const;

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const role     = getRole();

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  const visibleNav = NAV_ITEMS.filter(
    (item) => !role || (item.roles as readonly string[]).includes(role)
  );

  return (
    <aside
      className="flex h-full w-64 flex-col bg-[var(--primary)]"
      aria-label="Main navigation"
    >
      {/* Logo + close button (mobile) */}
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <Shield className="h-6 w-6 text-[var(--accent)]" aria-hidden />
          <span className="text-lg font-bold text-white tracking-tight">
            MedGuard
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Role badge */}
      {role && (
        <div className="px-6 pb-4">
          <Badge variant={ROLE_BADGE[role]} className="text-xs">
            {ROLE_LABELS[role]}
          </Badge>
        </div>
      )}

      {/* Nav divider */}
      <div className="mx-6 h-px bg-white/10 mb-4" />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1" aria-label="Navigation links">
        {visibleNav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-white/15 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
              aria-current={active ? "page" : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <Button
          variant="ghost"
          size="md"
          className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
          onClick={handleLogout}
          aria-label="Log out"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Log out
        </Button>
      </div>
    </aside>
  );
}
