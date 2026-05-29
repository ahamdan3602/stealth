import { User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { CitationList } from "./CitationList";
import { GuardrailBadge } from "./GuardrailBadge";
import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 max-w-3xl",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
      role="article"
      aria-label={isUser ? "Your message" : "Assistant response"}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-[var(--brand-blue)] text-white"
            : "bg-[var(--primary)] text-[var(--accent)]"
        )}
        aria-hidden
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Bubble */}
      <div className={cn("flex flex-col gap-1.5 max-w-[85%]", isUser && "items-end")}>
        {/* Guardrail badge — above the bubble */}
        {!isUser && message.guardrail && (
          <GuardrailBadge guardrail={message.guardrail} />
        )}

        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-[var(--brand-blue)] text-white rounded-tr-sm"
              : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-tl-sm shadow-sm"
          )}
        >
          {/* Preserve line breaks in answers */}
          {message.content.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              {i < message.content.split("\n").length - 1 && <br />}
            </span>
          ))}
        </div>

        {/* Citations — below the bubble */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <CitationList citations={message.citations} />
        )}

        {/* Timestamp */}
        <time
          className="text-xs text-[var(--text-muted)] px-1"
          dateTime={message.timestamp.toISOString()}
        >
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </time>
      </div>
    </div>
  );
}
