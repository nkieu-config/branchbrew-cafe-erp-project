import { cn } from "@/lib/utils";

export {
  procurementDialogContentClassName,
  procurementMetaBadgeClassName,
  procurementSectionPanelClassName,
} from "./hub-section-aliases";

export function receiveLineClassName(className?: string) {
  return cn(
    "flex items-center justify-between gap-4 border-b pb-3 border-[var(--table-row-border)]",
    className,
  );
}
