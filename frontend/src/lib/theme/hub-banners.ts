import { cn } from "@/lib/utils";

export function infoBannerClassName(className?: string) {
  return cn(
    "rounded-xl border p-4 flex flex-wrap items-center justify-between gap-3",
    "bg-[var(--status-info-bg)] border-[var(--status-info-fg)]/20",
    className,
  );
}

export function infoBannerIconClassName(className?: string) {
  return cn("w-5 h-5 mt-0.5 shrink-0 text-[var(--status-info-fg)]", className);
}

export function infoBannerTitleClassName(className?: string) {
  return cn("font-semibold text-[var(--status-info-fg)]", className);
}

export function infoBannerTextClassName(className?: string) {
  return cn("text-sm opacity-80 text-[var(--status-info-fg)]", className);
}

export function warningBannerClassName(className?: string) {
  return cn(
    "rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3",
    "bg-[var(--status-warning-bg)] border-[var(--status-warning-fg)]/20",
    className,
  );
}

export function warningBannerPanelClassName(className?: string) {
  return cn(
    "rounded-xl border p-10 text-center max-w-lg mx-auto w-full",
    "flex flex-col items-center",
    "bg-[var(--status-warning-bg)] border-[var(--status-warning-fg)]/20",
    className,
  );
}

export function warningBannerIconClassName(className?: string) {
  return cn("w-5 h-5 shrink-0 text-[var(--status-warning-fg)]", className);
}

export function warningBannerTitleClassName(className?: string) {
  return cn("font-semibold text-[var(--status-warning-fg)]", className);
}

export function warningBannerTextClassName(className?: string) {
  return cn("text-sm opacity-80 text-[var(--status-warning-fg)]", className);
}
