import { cn } from "@/lib/utils";
import { hubPrimaryActionClassName } from "./stock";
import { text } from "./surface";

export function authPageShellClassName(className?: string) {
  return cn("min-h-screen w-full flex bg-background", className);
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
    "w-10 h-10 rounded-xl flex items-center justify-center text-[var(--brand-foreground)] shadow-lg",
    "bg-[var(--brand)] shadow-[color-mix(in_oklch,var(--brand),transparent_80%)]",
    className,
  );
}

export function authInputClassName(className?: string) {
  return cn(
    "h-12 bg-[var(--form-line-bg)] border-[var(--form-line-border)] focus-visible:ring-[var(--brand)]",
    className,
  );
}

export function authPrimaryButtonClassName(className?: string) {
  return cn(hubPrimaryActionClassName(), "w-full h-12 shadow-lg mt-4 group", className);
}

export function authDemoPanelClassName(className?: string) {
  return cn(
    "mt-12 p-6 rounded-2xl border text-sm",
    "bg-[var(--form-line-bg)] border-[var(--form-line-border)]",
    text.muted,
    className,
  );
}

export function authDemoButtonClassName(className?: string) {
  return cn(
    "w-full flex justify-between items-center font-mono text-xs rounded-lg px-3 py-2 transition-colors text-left",
    "border border-transparent hover:border-[var(--table-container-border)]",
    "hover:bg-[var(--table-container-bg)]",
    className,
  );
}

export function authDemoDividerClassName(className?: string) {
  return cn(
    "flex justify-between mt-2 pt-2 border-t font-mono text-xs px-1",
    "border-[var(--table-row-border)]",
    className,
  );
}

export function authHeroPanelClassName(className?: string) {
  return cn(
    "hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center",
    "bg-[var(--surface-elevated)]",
    className,
  );
}

export function authHeroGlowClassName(className?: string) {
  return cn(
    "absolute blur-[120px] rounded-full",
    "bg-[color-mix(in_oklch,var(--brand)_20%,transparent)]",
    className,
  );
}

export function authHeroCardClassName(className?: string) {
  return cn(
    "rounded-3xl border p-10 backdrop-blur-2xl shadow-2xl",
    "border-white/10 bg-white/5",
    className,
  );
}

export function authHeroStatClassName(className?: string) {
  return cn("bg-white/5 p-4 rounded-xl border border-white/10", className);
}

export function authHeroStatValueClassName(className?: string) {
  return cn("font-bold text-xl mb-1 text-[var(--brand)]", className);
}

export function authHeroStatLabelClassName(className?: string) {
  return cn("text-xs uppercase tracking-wider text-white/60", className);
}
