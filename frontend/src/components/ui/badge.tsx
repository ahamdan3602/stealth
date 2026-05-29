import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--brand-blue)]/10 text-[var(--brand-blue)]",
        primary: "bg-[var(--primary)]/10 text-[var(--primary)]",
        success: "bg-[var(--success)]/10 text-[var(--success)]",
        warning: "bg-[var(--warning)]/10 text-[var(--warning)]",
        danger:  "bg-[var(--danger)]/10 text-[var(--danger)]",
        muted:   "bg-[var(--border)] text-[var(--text-muted)]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
