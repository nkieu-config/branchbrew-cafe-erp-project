import Link from "next/link";
import { ShieldOff } from "lucide-react";
import { accessDeniedIconClassName } from "@/lib/theme/color-helpers";
import { surface, text } from "@/lib/theme/surface";
import { typeUiLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";

type AccessDeniedStateProps = {
  title?: string;
  description?: string;
  showBackLink?: boolean;
  backHref?: string;
  backLabel?: string;
};

export function AccessDeniedState({
  title = "Access denied",
  description = "You don't have permission to view this page.",
  showBackLink = true,
  backHref = "/",
  backLabel = "Back to Dashboard",
}: AccessDeniedStateProps) {
  return (
    <div className={cn(surface.empty)}>
      <ShieldOff className={accessDeniedIconClassName("w-10 h-10 mx-auto mb-4")} aria-hidden />
      <p className={typeUiLabelClassName(text.primary)}>{title}</p>
      <p className={cn("text-sm mt-2", text.muted)}>{description}</p>
      {showBackLink && (
        <Link
          href={backHref}
          className={cn(
            "inline-flex mt-6 min-h-[44px] items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors",
            "border-border bg-card text-foreground hover:bg-muted",
          )}
        >
          {backLabel}
        </Link>
      )}
    </div>
  );
}
