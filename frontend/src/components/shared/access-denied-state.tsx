import Link from "next/link";
import { ShieldOff } from "lucide-react";
import { surface, text } from "@/lib/theme";
import { cn } from "@/lib/utils";

type AccessDeniedStateProps = {
  title?: string;
  description?: string;
  showBackLink?: boolean;
};

export function AccessDeniedState({
  title = "Access denied",
  description = "You don't have permission to view this page.",
  showBackLink = true,
}: AccessDeniedStateProps) {
  return (
    <div className={cn(surface.empty)}>
      <ShieldOff className="w-10 h-10 mx-auto mb-4 text-[var(--state-denied-icon)]" aria-hidden />
      <p className={cn("font-semibold", text.primary)}>{title}</p>
      <p className={cn("text-sm mt-2", text.muted)}>{description}</p>
      {showBackLink && (
        <Link
          href="/"
          className={cn(
            "inline-flex mt-6 h-9 items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors",
            "border-border bg-card text-foreground hover:bg-muted",
          )}
        >
          Back to Dashboard
        </Link>
      )}
    </div>
  );
}
