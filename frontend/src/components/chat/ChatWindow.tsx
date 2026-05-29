"use client";

import { useState, useRef, useEffect, useId } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageBubble } from "./MessageBubble";
import { sendMessage } from "@/lib/api";
import { getRole, allowedScopes } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import type { Message, Scope } from "@/types";
import { cn } from "@/lib/utils";

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-16">
      <div className="h-14 w-14 rounded-2xl bg-[var(--primary)]/8 flex items-center justify-center">
        <svg className="h-7 w-7 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--text)]">Start a conversation</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Ask a question about medications, clinical guidelines, or policies.
        </p>
      </div>
    </div>
  );
}

export function ChatWindow() {
  const role       = getRole();
  const scopes     = role ? allowedScopes(role) : [];
  const scopeId    = useId();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [scope, setScope]       = useState<Scope>((scopes[0] as Scope) ?? "clinical");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const bottomRef               = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id:        crypto.randomUUID(),
      role:      "user",
      content:   text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await sendMessage({ message: text, scope });
      const assistantMsg: Message = {
        id:        crypto.randomUUID(),
        role:      "assistant",
        content:   res.answer,
        citations: res.citations,
        guardrail: res.guardrail,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.status === 403
            ? "You don't have permission to access that scope."
            : err.message
          : "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as React.FormEvent);
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-3.5rem-2rem)] bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
      {/* Scope selector header */}
      {scopes.length > 1 && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--background)]">
          <label htmlFor={scopeId} className="text-xs font-medium text-[var(--text-muted)] shrink-0">
            Scope
          </label>
          <select
            id={scopeId}
            value={scope}
            onChange={(e) => setScope(e.target.value as Scope)}
            className="text-xs rounded-md border border-[var(--border)] bg-white px-2 py-1 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]"
          >
            {scopes.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Message list */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4"
        role="log"
        aria-live="polite"
        aria-label="Conversation"
      >
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]" aria-live="assertive" aria-label="Assistant is thinking">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            MedGuard is thinking…
          </div>
        )}
        {error && (
          <div role="alert" className="text-xs text-[var(--danger)] bg-[var(--danger)]/8 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <div ref={bottomRef} aria-hidden />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        className="flex items-end gap-3 border-t border-[var(--border)] bg-[var(--background)] px-4 py-3"
        aria-label="Message input"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a clinical, administrative, or health question… (Enter to send, Shift+Enter for new line)"
          rows={1}
          className="flex-1 min-h-[40px] max-h-[120px] resize-none"
          aria-label="Message"
          disabled={loading}
          style={{ height: "auto" }}
          onInput={(e) => {
            const t = e.currentTarget;
            t.style.height = "auto";
            t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
          }}
        />
        <Button
          type="submit"
          variant="primary"
          size="icon"
          disabled={!input.trim() || loading}
          aria-label="Send message"
          className="shrink-0 h-10 w-10"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Send className="h-4 w-4" aria-hidden />
          )}
        </Button>
      </form>
    </div>
  );
}
