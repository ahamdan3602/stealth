import { ShieldAlert, ShieldCheck, ShieldOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const GUARDRAIL_CONFIG: Record<
  string,
  { label: string; variant: "warning" | "danger" | "success"; Icon: typeof ShieldAlert }
> = {
  off_topic:               { label: "Off-topic blocked",        variant: "warning", Icon: ShieldOff },
  prompt_injection:        { label: "Injection blocked",        variant: "danger",  Icon: ShieldAlert },
  groundedness_corrected:  { label: "Self-corrected",           variant: "warning", Icon: ShieldCheck },
};

interface GuardrailBadgeProps {
  guardrail: string;
}

export function GuardrailBadge({ guardrail }: GuardrailBadgeProps) {
  const config = GUARDRAIL_CONFIG[guardrail];
  if (!config) return null;

  const { label, variant, Icon } = config;
  return (
    <Badge variant={variant} className="text-xs gap-1" aria-label={`Guardrail: ${label}`}>
      <Icon className="h-3 w-3" aria-hidden />
      {label}
    </Badge>
  );
}
