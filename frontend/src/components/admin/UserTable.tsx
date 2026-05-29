"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listUsers } from "@/lib/api";
import type { UserRead, Role } from "@/types";

const ROLE_BADGE: Record<Role, "primary" | "default" | "success" | "muted"> = {
  admin:     "primary",
  clinician: "default",
  nurse:     "success",
  patient:   "muted",
};

export function UserTable() {
  const [users, setUsers]     = useState<UserRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      setUsers(await listUsers());
    } catch {
      setError("Failed to load users. Check your permissions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--text)]">
          Users
          {!loading && (
            <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">
              ({users.length})
            </span>
          )}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsers}
          disabled={loading}
          aria-label="Refresh user list"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden />
          Refresh
        </Button>
      </div>

      {error && (
        <div role="alert" className="text-sm text-[var(--danger)] bg-[var(--danger)]/8 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-[var(--border)] overflow-hidden">
        <table className="w-full text-sm" aria-label="Users table">
          <thead>
            <tr className="bg-[var(--background)] border-b border-[var(--border)]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                Email
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                Role
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                ID
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                  Loading users…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user, i) => (
                <tr
                  key={user.id}
                  className={`border-b border-[var(--border)] last:border-0 hover:bg-[var(--background)] transition-colors ${i % 2 === 0 ? "" : "bg-[var(--background)]/40"}`}
                >
                  <td className="px-4 py-3 text-[var(--text)] font-medium">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={ROLE_BADGE[user.role]}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)] font-mono text-xs">
                    {user.id.slice(0, 8)}…
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
