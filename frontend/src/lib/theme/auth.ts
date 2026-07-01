import { cn } from "@/lib/utils";
import { text } from "./surface";
import { typeMicroClassName } from "./typography";

export function authPageShellClassName(className?: string) {
  return cn("min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 lg:items-stretch bg-background", className);
}

export function authLeftPanelClassName(className?: string) {
  return cn(
    "relative z-10 flex w-full min-h-screen items-center justify-center overflow-y-auto",
    "px-6 py-10 sm:px-10",
    "lg:min-h-0 lg:self-stretch lg:px-14 xl:px-16",
    className,
  );
}

export function authLoadingClassName(className?: string) {
  return cn(
    "min-h-screen w-full flex items-center justify-center bg-background",
    text.muted,
    className,
  );
}

export function authBrandMarkClassName(className?: string) {
  return cn(
    "w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-[var(--on-brand-solid-fg)]",
    "bg-[var(--brand-solid)]",
    className,
  );
}

export function authBrandTaglineClassName(className?: string) {
  return cn("text-xs", text.muted, className);
}

export function authInputClassName(className?: string) {
  return cn(
    "h-11 bg-[var(--form-line-bg)] border-[var(--form-line-border)] focus-visible:ring-[var(--focus-ring)]",
    className,
  );
}

export function authPrimaryButtonClassName(className?: string) {
  return cn(
    "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors",
    "bg-[var(--brand-solid)] text-[var(--on-brand-solid-fg)]",
    "hover:opacity-90 w-full h-11 mt-2 border-transparent",
    "disabled:pointer-events-none disabled:opacity-50",
    className,
  );
}

export function authDemoPanelClassName(className?: string) {
  return cn(
    "mt-6 border-t pt-5",
    "border-[var(--form-line-border)]",
    className,
  );
}

export function authDemoChipClassName(active?: boolean, className?: string) {
  return cn(
    "inline-flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-2.5 min-h-[44px] text-xs font-medium transition-colors",
    "border-[var(--form-line-border)] bg-[var(--form-line-bg)]",
    "hover:bg-[var(--table-container-bg)]",
    "disabled:pointer-events-none disabled:opacity-50",
    active && "border-[color-mix(in_oklch,var(--brand)_40%,transparent)] bg-[color-mix(in_oklch,var(--brand)_10%,transparent)] text-[var(--brand-text)]",
    className,
  );
}

export function authDemoCredentialsToggleClassName(className?: string) {
  return cn(
    "mt-2 flex w-full items-center justify-center gap-1 text-xs transition-colors",
    text.muted,
    "hover:text-[var(--foreground)]",
    className,
  );
}

export function authDemoCredentialsClassName(className?: string) {
  return cn(
    "mt-2 space-y-1 rounded-lg border px-2.5 py-2 font-mono leading-relaxed",
    typeMicroClassName(),
    "border-[var(--table-row-border)] bg-[var(--surface-elevated)] text-[var(--text-subtle)]",
    className,
  );
}

export function authDemoCredentialsPasswordRowClassName(className?: string) {
  return cn(
    "flex justify-between gap-2 border-t pt-1",
    "border-[var(--table-row-border)]",
    className,
  );
}

/** @deprecated Use authDemoChipClassName for compact demo role buttons. */
export function authDemoButtonClassName(className?: string) {
  return cn(
    "w-full flex justify-between items-center font-mono text-xs rounded-lg px-3 py-2 transition-colors text-left",
    "border border-transparent hover:border-[var(--table-container-border)]",
    "hover:bg-[var(--table-container-bg)]",
    className,
  );
}

/** @deprecated Credentials are shown in a collapsible block. */
export function authDemoDividerClassName(className?: string) {
  return cn(
    "flex justify-between mt-2 pt-2 border-t font-mono text-xs px-1",
    "border-[var(--table-row-border)]",
    className,
  );
}

export function authHeroPanelClassName(className?: string) {
  return cn(
    "hidden lg:flex relative overflow-hidden items-center justify-center",
    "bg-[var(--surface-elevated)]",
    className,
  );
}

export function authHeroPanelInnerClassName(className?: string) {
  return cn("relative z-10 w-full max-w-xl p-8 lg:p-10 xl:p-12", className);
}

export function authHeroGlowClassName(className?: string) {
  return cn(
    "absolute blur-[120px] rounded-full pointer-events-none",
    "bg-[color-mix(in_oklch,var(--brand)_18%,transparent)]",
    className,
  );
}

export function authHeroCardClassName(className?: string) {
  return cn(
    "rounded-2xl border p-7 xl:p-9 shadow-xl",
    "border-[var(--auth-hero-card-border)] bg-[var(--auth-hero-card-bg)]",
    className,
  );
}

export function authHeroEyebrowClassName(className?: string) {
  return cn(
    "mb-4 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
    "border-[var(--auth-hero-stat-border)] bg-[var(--auth-hero-stat-bg)] text-[var(--brand-text)]",
    className,
  );
}

export function authHeroTitleClassName(className?: string) {
  return cn(
    "text-2xl font-bold tracking-tight text-center xl:text-[1.75rem]",
    text.primary,
    className,
  );
}

export function authHeroTextClassName(className?: string) {
  return cn(
    "mt-3 max-w-sm mx-auto text-sm leading-relaxed text-center",
    text.secondary,
    className,
  );
}

export function authHeroSectionLabelClassName(className?: string) {
  return cn(
    typeMicroClassName("font-semibold uppercase tracking-wide text-center"),
    text.muted,
    className,
  );
}

export function authHeroDividerClassName(className?: string) {
  return cn("my-5 border-t border-[var(--auth-hero-stat-border)]", className);
}

export function authHeroModuleIconClassName(className?: string) {
  return cn(
    "flex flex-col items-center gap-2 rounded-xl border px-2 py-3.5",
    "bg-[var(--auth-hero-stat-bg)] border-[var(--auth-hero-stat-border)]",
    className,
  );
}

export function authHeroModuleWellClassName(className?: string) {
  return cn(
    "flex h-9 w-9 items-center justify-center rounded-lg",
    "bg-[color-mix(in_oklch,var(--brand)_16%,transparent)]",
    className,
  );
}

export function authHeroModuleLabelClassName(className?: string) {
  return cn(typeMicroClassName("font-medium text-center"), text.primary, className);
}

export function authHeroModuleGlyphClassName(className?: string) {
  return cn("h-4 w-4 text-[var(--brand-text)]", className);
}

export function authHeroStatsGridClassName(className?: string) {
  return cn("grid grid-cols-3 gap-2.5", className);
}

export function authHeroStatClassName(className?: string) {
  return cn(
    "rounded-xl border px-2 py-3 text-center",
    "bg-[var(--auth-hero-stat-bg)] border-[var(--auth-hero-stat-border)]",
    className,
  );
}

export function authHeroStatValueClassName(className?: string) {
  return cn("font-bold text-lg tabular-nums text-[var(--brand-text)]", className);
}

export function authHeroStatLabelClassName(className?: string) {
  return cn(typeMicroClassName(), text.muted, className);
}

export function authGitHubLinkClassName(className?: string) {
  return cn(
    "absolute bottom-6 left-6 sm:left-10 lg:left-14 xl:left-16 z-20",
    "inline-flex items-center gap-1.5 text-xs transition-colors",
    text.muted,
    "hover:text-[var(--foreground)]",
    className,
  );
}
