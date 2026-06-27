import { cn } from "@/lib/utils";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]/50 motion-reduce:transition-none";

export const shell = {
  bg: "bg-[var(--shell-bg)]",
  sidebarBorder: "border-[var(--sidebar-border)]",
  sidebarDivider: "border-[var(--sidebar-divider)]",
} as const;

export function sidebarRootClassName(className?: string) {
  return cn(
    "w-64 glass-panel border-r h-screen flex flex-col z-40 relative",
    shell.sidebarBorder,
    className,
  );
}

export function sidebarBrandTitleClassName() {
  return cn(
    "font-extrabold text-xl tracking-tight bg-clip-text text-transparent",
    "bg-gradient-to-br from-[var(--sidebar-brand-gradient-from)] to-[var(--sidebar-brand-gradient-to)]",
  );
}

export function sidebarGroupButtonClassName(className?: string) {
  return cn(
    "w-full flex items-center justify-between px-3 py-2 min-h-[44px] mb-1",
    "text-xs font-bold uppercase tracking-wider rounded-lg transition-colors",
    "text-[var(--sidebar-group-label)] hover:text-[var(--sidebar-group-label-hover)]",
    focusRing,
    className,
  );
}

export function sidebarNavLinkClassName(isActive: boolean, className?: string) {
  return cn(
    "flex items-center px-3 py-2.5 min-h-[44px] rounded-xl transition-colors duration-200 font-semibold text-sm border",
    focusRing,
    isActive
      ? "bg-[var(--sidebar-nav-active-bg)] text-[var(--sidebar-nav-active-fg)] border-[var(--sidebar-nav-active-border)] shadow-sm"
      : "text-[var(--sidebar-nav-inactive-fg)] border-transparent hover:bg-[var(--sidebar-nav-inactive-hover-bg)] hover:text-[var(--sidebar-nav-inactive-hover-fg)] interactive-item",
    className,
  );
}

export function sidebarNavIconClassName(isActive: boolean) {
  return cn(
    "w-4 h-4 mr-3 transition-colors shrink-0",
    isActive ? "text-[var(--sidebar-nav-active-icon)]" : "text-[var(--sidebar-nav-icon)]",
  );
}

export function sidebarLogoutButtonClassName(className?: string) {
  return cn(
    "w-full justify-start min-h-[44px] rounded-xl interactive-item transition-colors",
    "text-[var(--status-danger-fg)] hover:text-[var(--status-danger-fg)]",
    "hover:bg-[var(--status-danger-bg)]",
    "border-[var(--sidebar-logout-border)] bg-[var(--sidebar-logout-bg)]",
    className,
  );
}

export function topbarBranchPickerClassName(className?: string) {
  return cn(
    "flex items-center gap-2 rounded-lg px-2 py-1 shadow-sm min-h-[44px] border",
    "bg-[var(--topbar-picker-bg)] border-[var(--topbar-picker-border)]",
    className,
  );
}

export function topbarBranchIconClassName() {
  return "w-4 h-4 shrink-0 text-[var(--topbar-picker-icon)]";
}

export function breadcrumbNavClassName(className?: string) {
  return cn(
    "flex items-center min-w-0 text-sm font-medium overflow-x-auto",
    "text-[var(--breadcrumb-fg)]",
    className,
  );
}

export function breadcrumbLinkClassName(className?: string) {
  return cn(
    "shrink-0 transition-colors rounded-sm",
    "hover:text-[var(--breadcrumb-link-hover)]",
    focusRing,
    className,
  );
}

export function breadcrumbSeparatorClassName() {
  return "mx-2 shrink-0 text-[var(--breadcrumb-separator)]";
}

export function breadcrumbCurrentClassName(className?: string) {
  return cn("font-bold tracking-tight truncate text-[var(--breadcrumb-current)]", className);
}

export function breadcrumbParentClassName(className?: string) {
  return cn("shrink-0 text-[var(--breadcrumb-parent)]", className);
}

export function profileMenuPanelClassName(className?: string) {
  return cn(
    "absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border p-2 shadow-lg",
    "bg-[var(--profile-menu-bg)] border-[var(--profile-menu-border)]",
    className,
  );
}

export function profileAvatarButtonClassName(className?: string) {
  return cn(
    "h-11 w-11 rounded-full border-[var(--profile-avatar-border)]",
    className,
  );
}

export function profileAvatarInitialClassName() {
  return "font-bold text-[var(--profile-avatar-fg)]";
}

export function destructiveMenuItemClassName(className?: string) {
  return cn(
    "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 min-h-[44px] text-sm font-medium",
    "text-[var(--status-danger-fg)] hover:bg-[var(--status-danger-bg)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--status-danger-fg)]/40",
    className,
  );
}

export function skipLinkClassName() {
  return cn(
    "sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]",
    "focus:rounded-lg focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg focus:outline-none",
    "focus:bg-[var(--skip-link-bg)] focus:text-[var(--skip-link-fg)]",
  );
}

export function selectFocusClassName(className?: string) {
  return cn("focus-visible:ring-[var(--focus-ring)]/50", className);
}
