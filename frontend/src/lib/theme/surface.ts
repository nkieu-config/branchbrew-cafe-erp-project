import { cn, focusRing } from "@/lib/utils";

/** Reusable surface + typography classes backed by CSS variables. */
export const surface = {
  card: "surface-card",
  empty: "surface-empty",
  page: "bg-background text-foreground",
} as const;

export const text = {
  primary: "text-foreground",
  secondary: "text-secondary",
  subtle: "text-subtle",
  muted: "text-muted-foreground",
  brand: "text-brand-text",
} as const;

export function surfaceCardClassName(className?: string) {
  return cn(surface.card, "p-6", className);
}

/** Solid elevated panel — tables, forms, CRM shell (replaces glass). */
export function elevatedPanelClassName(className?: string) {
  return cn(
    "hub-section-panel rounded-2xl border shadow-[var(--shadow-sm)]",
    "bg-[var(--hub-section-bg)] border-[var(--hub-section-border)]",
    className,
  );
}

export function hubTabTrackClassName(className?: string) {
  return cn(
    "inline-flex max-w-full space-x-2 p-1 rounded-xl overflow-x-auto scrollbar-thin scroll-smooth snap-x snap-mandatory",
    "bg-[var(--hub-tab-track)]",
    className,
  );
}

export function hubTabClassName(isActive: boolean, className?: string) {
  return cn(
    "flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm font-medium rounded-lg",
    "transition-opacity duration-150 whitespace-nowrap snap-start shrink-0",
    focusRing,
    isActive
      ? "bg-[var(--hub-tab-active)] text-[var(--hub-tab-active-fg)] shadow-sm"
      : "text-[var(--hub-tab-inactive-fg)] hover:text-[var(--hub-tab-inactive-hover)]",
    className,
  );
}

export function hubTabScrollFadeRightClassName(className?: string) {
  return cn(
    "pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[var(--hub-fade-from)] to-transparent motion-reduce:opacity-0",
    className,
  );
}

export function hubTabScrollFadeLeftClassName(className?: string) {
  return cn(
    "pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-[var(--hub-fade-from)] to-transparent motion-reduce:opacity-0",
    className,
  );
}
