import { cn } from "@/lib/utils";

import { text } from "./surface";

export {
  procurementDialogContentClassName,
  procurementMetaBadgeClassName,
  procurementSectionPanelClassName,
} from "./hub-panel";

export function procurementMutedMetaClassName(className?: string) {
  return cn("text-xs", text.muted, className);
}

export function receiveLineClassName(className?: string) {
  return cn(
    "flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0 border-[var(--table-row-border)]",
    className,
  );
}
