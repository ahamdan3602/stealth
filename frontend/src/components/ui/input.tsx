import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-[var(--text)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2",
            "text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-0 focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--background)]",
            error && "border-[var(--danger)] focus:ring-[var(--danger)]",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${id}-error`} className="text-xs text-[var(--danger)]" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
