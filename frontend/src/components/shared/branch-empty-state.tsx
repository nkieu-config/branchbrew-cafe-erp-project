import { MapPin } from "lucide-react";
import { emptyStateIconClassName } from "@/lib/theme/color-helpers";
import { surface, text } from "@/lib/theme/surface";
import { typeUiLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";

type BranchEmptyStateProps = {
  title?: string;
  description?: string;
};

export function BranchEmptyState({
  title = "Select a branch",
  description = "Use the branch selector in the top bar to view branch-specific data.",
}: BranchEmptyStateProps) {
  return (
    <div className={cn(surface.empty)}>
      <MapPin className={emptyStateIconClassName("w-10 h-10 mx-auto mb-4")} aria-hidden />
      <p className={typeUiLabelClassName(text.primary)}>{title}</p>
      <p className={cn("text-sm mt-2", text.muted)}>{description}</p>
    </div>
  );
}
