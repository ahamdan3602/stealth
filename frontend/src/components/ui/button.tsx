"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:   "bg-[var(--brand-blue)] text-white hover:bg-blue-700 active:scale-[0.98] shadow-sm",
        primary:   "bg-[var(--primary)] text-white hover:bg-[var(--primary-light)] active:scale-[0.98] shadow-sm",
        outline:   "border border-[var(--border)] bg-white text-[var(--text)] hover:bg-[var(--background)] active:scale-[0.98]",
        ghost:     "text-[var(--text-muted)] hover:bg-[var(--background)] hover:text-[var(--text)]",
        danger:    "bg-[var(--danger)] text-white hover:bg-red-600 active:scale-[0.98]",
      },
      size: {
        sm:   "h-8 px-3 text-xs",
        md:   "h-10 px-4",
        lg:   "h-11 px-6 text-base",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {children}
          </span>
        ) : children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
