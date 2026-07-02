import { cn, focusRing } from "@/lib/utils";
import { text } from "./surface";

export const shell = {
  bg: "bg-[var(--shell-bg)]",
  sidebarBorder: "border-[var(--sidebar-border)]",
  sidebarDivider: "border-[var(--sidebar-divider)]",
  maxWidth: "max-w-[1600px]",
} as const;

/** Align topbar + page content to the same centered column. */
export function shellContentFrameClassName(className?: string) {
  return cn(shell.maxWidth, "mx-auto w-full px-4 md:px-6 lg:px-8", className);
}

/** Topbar uses slightly tighter horizontal inset on phones. */
export function topbarContentFrameClassName(className?: string) {
  return cn(shell.maxWidth, "mx-auto w-full px-4 md:px-6 lg:px-8", className);
}

export function shellContentPaddingYClassName(className?: string) {
  return cn("pt-4 pb-6 md:pt-6 md:pb-8 lg:pt-8 lg:pb-10", className);
}

export function shellPageTitleClassName(className?: string) {
  return cn(
    "text-xl sm:text-2xl font-bold text-balance flex items-center gap-2 min-w-0",
    text.primary,
    className,
  );
}

/** Sticky page actions row below PageChrome title/description. */
export function pageChromeStickyBarClassName(className?: string) {
  return cn(
    "sticky top-0 z-20 -mx-4 flex flex-wrap items-center gap-2 px-4 py-2",
    "md:-mx-6 md:px-6",
    "border-b border-[var(--border)]/35",
    "bg-[var(--background)]/88 backdrop-blur-md",
    "supports-[backdrop-filter]:bg-[var(--background)]/78",
    "shadow-[0_1px_0_color-mix(in_oklch,var(--border)_50%,transparent)]",
    className,
  );
}

/** Shared top inset for sidebar brand row + main topbar (safe area + breathing room). */
export function shellHeaderInsetClassName(className?: string) {
  return cn("pt-[calc(0.75rem+env(safe-area-inset-top,0px))]", className);
}

/** Inner header row height — matches sidebar brand row (`h-14`) on desktop. */
export function shellHeaderBarRowClassName(options: { compact?: boolean } = {}) {
  const { compact = false } = options;
  return compact ? "min-h-11 lg:min-h-12" : "min-h-11 sm:min-h-12 lg:min-h-14";
}

/** Vertical padding for a topbar content row. */
export function topbarRowPaddingClassName(options: { compact?: boolean } = {}) {
  const { compact = false } = options;
  return compact ? "py-1" : "py-1.5 sm:py-2 lg:py-0";
}

/** Full-width topbar region — frosted surface, subtle bottom edge. */
export function topbarRegionClassName(options: { compact?: boolean; className?: string } = {}) {
  const { compact = false, className } = options;
  return cn(
    "relative z-30 shrink-0 w-full overflow-visible",
    "border-b border-[var(--border)]/30",
    "bg-[var(--topbar-bg)]/88 backdrop-blur-xl backdrop-saturate-150",
    "supports-[backdrop-filter]:bg-[var(--topbar-bg)]/78",
    "shadow-[var(--topbar-shadow)]",
    "transition-[box-shadow,background-color,border-color] duration-200 motion-reduce:transition-none",
    compact && [
      "shadow-[var(--shadow-sm)]",
      "supports-[backdrop-filter]:bg-[var(--topbar-bg)]/94",
      "border-[var(--border)]/45",
    ],
    compact
      ? "pt-[calc(0.5rem+env(safe-area-inset-top,0px))]"
      : shellHeaderInsetClassName(),
    className,
  );
}

/** Inner topbar shell — second row on mobile for full-width branch picker. */
export function topbarShellClassName(
  options: { stacked?: boolean; className?: string } = {},
) {
  const { stacked = false, className } = options;
  return cn(
    "relative z-20 flex w-full flex-col",
    stacked ? "gap-2" : "gap-0",
    "transition-[min-height,padding] duration-200 motion-reduce:transition-none",
    className,
  );
}

/** Primary topbar row — nav context plus the same action cluster as desktop. */
export function topbarMainRowClassName(options: { compact?: boolean; className?: string } = {}) {
  const { compact = false, className } = options;
  return cn(
    "flex w-full min-w-0 items-center gap-1.5 sm:gap-2",
    shellHeaderBarRowClassName({ compact }),
    topbarRowPaddingClassName({ compact }),
    className,
  );
}

/** Mobile-only full-width branch picker row — bottom padding matches main-row rhythm. */
export function topbarBranchRowClassName(className?: string) {
  return cn("w-full lg:hidden max-lg:pb-3 sm:max-lg:pb-2.5", className);
}
/** Work-context actions (branch, clock). */
export function topbarWorkActionsClassName(className?: string) {
  return cn("flex min-w-0 shrink items-center gap-0.5 sm:gap-1", className);
}

/** Account / preference actions — grouped pill on all breakpoints. */
export function topbarAccountActionsClassName(className?: string) {
  return cn(
    "flex items-center gap-0.5 shrink-0 self-center",
    "rounded-xl border border-[var(--border)]/45",
    "bg-[color-mix(in_oklch,var(--topbar-action-hover)_40%,transparent)]",
    "px-0.5 py-0",
    className,
  );
}

/** Current page title in the mobile topbar (replaces breadcrumb on covered routes). */
export function topbarMobileTitleClassName(className?: string) {
  return cn(
    "lg:hidden flex-1 min-w-0 truncate text-base font-semibold leading-tight tracking-tight",
    text.primary,
    className,
  );
}

/** Mobile topbar breadcrumb — current segment matches page title weight. */
export function topbarMobileBreadcrumbCurrentClassName(className?: string) {
  return cn(
    "min-w-0 truncate text-base font-semibold text-[var(--breadcrumb-current)]",
    className,
  );
}

/** Right-side topbar actions row — branch (desktop), clock, divider, account. */
export function topbarActionsRowClassName(className?: string) {
  return cn(
    "flex min-w-0 items-center justify-end gap-1 sm:gap-1.5 shrink-0",
    className,
  );
}

/** Subtle divider between work actions and account controls. */
export function topbarActionsDividerClassName(className?: string) {
  return cn("w-px h-5 shrink-0 bg-[var(--border)]/50 mx-0.5", className);
}

/** Standalone topbar icon control — ghost style, no pill chrome. */
export function topbarActionButtonClassName(
  options: { active?: boolean; className?: string } = {},
) {
  return cn(topbarIconButtonClassName(options), options.className);
}

/** Fixed slot for toolbar clock — stable width between idle / active states. */
export function topbarClockSlotClassName(className?: string) {
  return cn("inline-flex items-center justify-center shrink-0", className);
}

/** Active shift timer — grows with elapsed time, not a square icon button. */
export function topbarClockActiveClassName(className?: string) {
  return cn(
    "inline-flex items-center justify-center shrink-0 rounded-lg px-2 sm:px-2.5",
    shellTopbarControlHeightClassName(),
      "min-w-[4.5rem] sm:min-w-[5.75rem] max-lg:min-w-[5.25rem]",
    "bg-[var(--topbar-action-active-bg)] text-[var(--topbar-action-active-fg)]",
    "font-mono text-xs tabular-nums transition-colors hover:opacity-90",
    focusRing,
    className,
  );
}

/** Branch select trigger inside the topbar pill — no nested border/ring chrome. */
export function topbarBranchSelectTriggerClassName(className?: string) {
  return cn(
    "topbar-branch-select-trigger",
    "h-full min-h-0 w-full min-w-0 border-0 bg-transparent shadow-none p-0",
    "text-xs font-medium text-[var(--topbar-picker-fg-muted)]",
    "focus-visible:outline-none focus-visible:ring-0 focus-visible:border-transparent",
    "dark:bg-transparent dark:hover:bg-transparent",
    "[&_[data-slot=select-value]]:truncate",
    "[&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:opacity-70 [&_svg]:!text-[var(--topbar-picker-fg-muted)]",
    className,
  );
}

/** Shared control height inside the topbar row — fits within shellHeaderBarRowClassName. */
export function shellTopbarControlHeightClassName(className?: string) {
  return cn("h-10 min-h-[40px] lg:h-9 lg:min-h-[36px]", className);
}

/** Topbar icon buttons — slightly smaller than sidebar sheet targets to avoid crowding. */
const shellTopbarIconSizeClassName =
  "h-10 w-10 min-h-[40px] min-w-[40px] lg:h-9 lg:w-9 lg:min-h-[36px] lg:min-w-[36px]";

/** Compact on desktop; 44px minimum on touch-first viewports (mobile sheet, sidebar). */
const shellTouchTargetClassName =
  "h-11 w-11 min-h-[44px] min-w-[44px] lg:h-9 lg:w-9 lg:min-h-[36px] lg:min-w-[36px]";

/** Compact icon control — matches sidebar touch targets. */
export function topbarIconButtonClassName(
  options: { active?: boolean; className?: string } = {},
) {
  return cn(
    "inline-flex items-center justify-center shrink-0 rounded-lg",
    shellTopbarIconSizeClassName,
    "text-[var(--topbar-action-fg)] transition-colors",
    "hover:bg-[var(--topbar-action-hover)] hover:text-[var(--foreground)]",
    focusRing,
    options.active && "bg-[var(--topbar-action-active-bg)] text-[var(--topbar-action-active-fg)]",
    options.className,
  );
}

/** Mobile menu trigger. */
export function topbarMenuButtonClassName(className?: string) {
  return cn(topbarIconButtonClassName(), "shrink-0 lg:hidden", className);
}

/** Primary action inside toolbar (e.g. Clock in). */
export function topbarPrimaryActionClassName(className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-1.5 shrink-0 rounded-lg",
    shellTopbarControlHeightClassName(),
    "px-2.5 sm:px-3 text-xs sm:text-sm font-medium transition-colors",
    "max-sm:gap-0 max-sm:px-0 max-sm:w-10 max-sm:min-w-[40px]",
    "bg-[var(--brand-solid)] text-[var(--on-brand-solid-fg)]",
    "hover:opacity-90",
    focusRing,
    className,
  );
}

/** Profile trigger — icon-only, same size/radius as clock/theme. */
export function topbarProfileButtonClassName(className?: string) {
  return cn(topbarActionButtonClassName(), className);
}

export function topbarDesktopBreadcrumbClassName(className?: string) {
  return cn(
    breadcrumbNavClassName(),
    "hidden lg:flex min-w-0 flex-1 overflow-hidden",
    className,
  );
}

export function sidebarRootClassName(className?: string, collapsed?: boolean) {
  return cn(
    collapsed ? "w-16" : "w-60",
    "border-r h-screen flex flex-col z-40 relative transition-[width] duration-200 motion-reduce:transition-none",
    "bg-[var(--sidebar-panel-bg)]",
    shell.sidebarBorder,
    className,
  );
}

export function sidebarRailLinkClassName(isActive: boolean, isCurrentPage: boolean, className?: string) {
  return cn(
    "relative flex items-center justify-center rounded-lg transition-colors",
    shellTouchTargetClassName,
    focusRing,
    isActive
      ? "bg-[var(--sidebar-nav-active-bg)] text-[var(--sidebar-nav-active-fg)]"
      : "text-[var(--sidebar-nav-inactive-fg)] hover:bg-[var(--sidebar-nav-inactive-hover-bg)] hover:text-[var(--sidebar-nav-inactive-hover-fg)]",
    isCurrentPage &&
      "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4 before:w-[2px] before:rounded-full before:bg-[var(--sidebar-nav-active-indicator)]",
    className,
  );
}

export function sidebarRailExpandButtonClassName(className?: string) {
  return cn(
    "flex items-center justify-center rounded-lg transition-colors",
    shellTouchTargetClassName,
    "text-[var(--sidebar-nav-inactive-fg)] hover:bg-[var(--sidebar-nav-inactive-hover-bg)] hover:text-[var(--sidebar-nav-inactive-hover-fg)]",
    focusRing,
    className,
  );
}

export function mobileBottomNavClassName(className?: string) {
  return cn(
    "fixed inset-x-0 bottom-0 z-50 lg:hidden",
    "pointer-events-none px-3 pt-2",
    "pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]",
    className,
  );
}

export function mobileBottomNavBarClassName(className?: string) {
  return cn(
    "pointer-events-auto flex items-stretch justify-around gap-0.5",
    "rounded-2xl border px-1 py-1",
    "bg-[var(--mobile-nav-bg)]/90 backdrop-blur-xl backdrop-saturate-150",
    "border-[var(--mobile-nav-border)]/55",
    "shadow-[var(--mobile-nav-shadow)]",
    "supports-[backdrop-filter]:bg-[var(--mobile-nav-bg)]/82",
    className,
  );
}

export function mobileBottomNavItemClassName(isActive: boolean, className?: string) {
  return cn(
    "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-px",
    "min-h-[52px] rounded-xl px-1 py-1.5",
    "transition-[color,background-color] duration-200 motion-reduce:transition-none",
    focusRing,
    isActive
      ? "text-[var(--sidebar-nav-active-fg)]"
      : "text-[var(--sidebar-nav-inactive-fg)] active:text-[var(--sidebar-nav-inactive-hover-fg)]",
    className,
  );
}

export function mobileBottomNavIconWrapClassName(isActive: boolean, className?: string) {
  return cn(
    "relative inline-flex h-8 w-10 items-center justify-center rounded-xl",
    "transition-colors duration-200 motion-reduce:transition-none",
    isActive && "bg-[var(--sidebar-nav-active-bg)]",
    className,
  );
}

export function mobileBottomNavIconClassName(isActive: boolean) {
  return cn(
    "h-[22px] w-[22px] shrink-0 transition-colors duration-200 motion-reduce:transition-none",
    isActive ? "text-[var(--sidebar-nav-active-icon)]" : "text-[var(--sidebar-nav-icon)]",
  );
}

export function mobileBottomNavLabelClassName(isActive: boolean, className?: string) {
  return cn(
    "max-w-full truncate text-[10px] font-medium leading-tight tracking-wide",
    isActive ? "font-semibold" : "opacity-75",
    className,
  );
}

export function mobileNavBadgePlacementClassName(className?: string) {
  return cn(
    "top-0 right-0 translate-x-1/3 -translate-y-1/3 ring-[var(--mobile-nav-bg)]",
    className,
  );
}

export function mainContentWithMobileNavClassName(className?: string) {
  return cn(
    "pb-[calc(var(--mobile-nav-offset)+0.75rem)] scroll-pb-[calc(var(--mobile-nav-offset)+0.75rem)] lg:pb-0 lg:scroll-pb-0",
    className,
  );
}

/** Immersive routes (POS terminal, KDS) — mobile uses global AppHeader for top chrome. */
export function immersiveMobileShellClassName(className?: string) {
  return cn(
    "flex h-full min-h-0 flex-col",
    "px-4 py-2",
    "sm:p-4 lg:p-8",
    className,
  );
}

/** Bottom padding when POS immersive tab bar replaces global mobile nav. */
export function mainContentWithPosImmersiveNavClassName(className?: string) {
  return cn("pb-[var(--mobile-nav-offset)] lg:pb-0", className);
}

export function sidebarPinnedLabelClassName(className?: string) {
  return cn(
    "px-3 py-2 mb-1 text-[11px] font-medium uppercase tracking-widest",
    "text-[var(--sidebar-group-label)]",
    className,
  );
}

/** Tree ul indent — keep in sync with child link active-indicator offset. */
export const sidebarTreeIndentClassName =
  "ml-2.5 border-l border-[var(--sidebar-tree-border)] pl-2";

const sidebarTreeChildIndicatorClassName =
  "before:absolute before:-left-[calc(0.5rem+1px)] before:top-1/2 before:-translate-y-1/2 before:h-3.5 before:w-[2px] before:rounded-full before:bg-[var(--sidebar-nav-active-indicator)]";

export function sidebarIconButtonClassName(className?: string) {
  return cn(
    "flex h-9 w-9 min-h-[36px] min-w-[36px] shrink-0 items-center justify-center rounded-lg transition-colors",
    "text-[var(--sidebar-nav-inactive-fg)] hover:bg-[var(--sidebar-nav-inactive-hover-bg)] hover:text-[var(--sidebar-nav-inactive-hover-fg)]",
    focusRing,
    className,
  );
}

export function sidebarPinButtonClassName(isPinned: boolean, className?: string) {
  return cn(
    sidebarIconButtonClassName(),
    "text-[var(--sidebar-nav-icon)]",
    !isPinned && "md:opacity-40 md:group-hover/navitem:opacity-100 md:focus-visible:opacity-100",
    isPinned && "text-[var(--sidebar-nav-active-icon)]",
    className,
  );
}

export function sidebarNavBadgeClassName(tone: "warning" | "danger" | "info" = "warning", className?: string) {
  const toneClass =
    tone === "danger"
      ? "bg-[var(--status-danger-bg)] text-[var(--status-danger-fg)]"
      : tone === "info"
        ? "bg-[var(--status-info-bg)] text-[var(--status-info-fg)]"
        : "bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)]";

  return cn(
    "ml-auto inline-flex min-w-[1.125rem] h-[18px] items-center justify-center rounded-md px-1",
    "text-xs font-medium tabular-nums leading-none shrink-0",
    toneClass,
    className,
  );
}

export function sidebarRailBadgeDotClassName(tone: "warning" | "danger" | "info" = "warning", className?: string) {
  const toneClass =
    tone === "danger"
      ? "bg-[var(--status-danger-fg)]"
      : tone === "info"
        ? "bg-[var(--status-info-fg)]"
        : "bg-[var(--status-warning-fg)]";

  return cn(
    "absolute top-1 right-1 h-2 w-2 rounded-full ring-2 ring-[var(--sidebar-panel-bg)]",
    toneClass,
    className,
  );
}

export function sidebarBrandTitleClassName() {
  return cn("font-semibold text-base tracking-tight", text.primary);
}

export function sidebarBrandLinkClassName(className?: string) {
  return cn(
    "flex items-center min-w-0 flex-1 gap-3 rounded-lg transition-opacity hover:opacity-90",
    focusRing,
    className,
  );
}

export function sidebarBrandMarkClassName(className?: string) {
  return cn(
    "w-8 h-8 rounded-lg flex items-center justify-center",
    "bg-[var(--sidebar-brand-mark-bg)]",
    className,
  );
}

export function sidebarBrandMarkIconClassName(className?: string) {
  return cn("w-5 h-5 text-[var(--sidebar-brand-mark-fg)]", className);
}

export function sidebarGroupButtonClassName(className?: string) {
  return cn(
    "w-full flex items-center justify-between px-2 py-1.5 min-h-[36px] mb-0.5",
    "text-xs font-medium rounded-md transition-colors",
    "text-[var(--sidebar-group-label)] hover:text-[var(--sidebar-group-label-hover)]",
    focusRing,
    className,
  );
}

export function sidebarNavLinkClassName(
  isActive: boolean,
  isCurrentPage = isActive,
  className?: string,
) {
  return cn(
    "relative flex items-center px-2.5 py-2 min-h-[44px] lg:min-h-[40px] rounded-lg transition-colors duration-150 text-sm font-medium",
    focusRing,
    isActive
      ? "bg-[var(--sidebar-nav-active-bg)] text-[var(--sidebar-nav-active-fg)]"
      : "text-[var(--sidebar-nav-inactive-fg)] hover:bg-[var(--sidebar-nav-inactive-hover-bg)] hover:text-[var(--sidebar-nav-inactive-hover-fg)]",
    isCurrentPage &&
      "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4 before:w-[2px] before:rounded-full before:bg-[var(--sidebar-nav-active-indicator)]",
    className,
  );
}

export function sidebarNavChildLinkClassName(isActive: boolean, className?: string) {
  return cn(
    "relative flex items-center gap-2 px-2 py-1.5 min-h-[44px] lg:min-h-[36px] rounded-md text-xs transition-colors",
    focusRing,
    isActive
      ? "text-[var(--sidebar-nav-active-fg)] font-medium"
      : "text-[var(--sidebar-nav-inactive-fg)] hover:bg-[var(--sidebar-nav-inactive-hover-bg)] hover:text-[var(--sidebar-nav-inactive-hover-fg)]",
    isActive && sidebarTreeChildIndicatorClassName,
    className,
  );
}

/** Branch scope pill shown in the sidebar header (SUPER_ADMIN). */
export function sidebarBranchPillClassName(className?: string) {
  return cn(
    "flex items-center gap-2 rounded-lg px-2.5 py-1.5 min-h-[36px] w-full border",
    "bg-[var(--topbar-picker-bg)] border-[var(--topbar-picker-border)] shadow-sm",
    className,
  );
}

/** Compact clock-in/out control in the top bar (standalone pill — prefer toolbar variant). */
export function topbarClockWidgetClassName(className?: string) {
  return cn(
    "flex items-center gap-1.5 rounded-lg border px-1.5 py-0.5 min-h-[36px]",
    "bg-[var(--topbar-picker-bg)] border-[var(--topbar-picker-border)]",
    className,
  );
}

export function sidebarNavIconClassName(isActive: boolean) {
  return cn(
    "w-4 h-4 mr-2.5 transition-colors shrink-0",
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

export function topbarBranchPickerClassName(
  options: { scoped?: boolean; className?: string } | string = {},
) {
  const opts = typeof options === "string" ? { className: options } : options;
  const { scoped = false, className } = opts;

  return cn(
    "topbar-branch-picker flex min-w-0 items-center rounded-lg border px-1.5 sm:px-2 shrink",
    shellTopbarControlHeightClassName(),
    scoped
      ? "topbar-branch-picker--scoped border-[var(--topbar-picker-border-active)] bg-[var(--topbar-picker-bg-active)]"
      : "border-[var(--topbar-picker-border)] bg-[var(--topbar-picker-bg)]",
    className,
  );
}

/** Dropdown panel for the topbar branch picker. */
export function topbarBranchSelectContentClassName(className?: string) {
  return cn("topbar-branch-select-content form-select-content", className);
}

/** Option row inside the topbar branch picker dropdown. */
export function topbarBranchSelectItemClassName(className?: string) {
  return cn(
    "data-[selected]:bg-[var(--topbar-picker-bg-active)] data-[selected]:text-[var(--topbar-picker-fg-active)]",
    "data-[selected]:font-medium",
    className,
  );
}

export function topbarBranchIconClassName() {
  return "w-4 h-4 shrink-0 text-[var(--topbar-picker-icon)]";
}

export function breadcrumbNavClassName(className?: string) {
  return cn(
    "flex min-w-0 items-center text-sm font-medium",
    "text-[var(--breadcrumb-fg)]",
    className,
  );
}

export function breadcrumbLinkClassName(className?: string) {
  return cn(
    "truncate transition-colors rounded-sm max-w-[11rem] sm:max-w-[12rem] lg:max-w-[14rem]",
    "hover:text-[var(--breadcrumb-link-hover)]",
    focusRing,
    className,
  );
}

export function breadcrumbSeparatorClassName(className?: string) {
  return cn(
    "mx-1 h-3.5 w-3.5 shrink-0 text-[var(--breadcrumb-separator)]",
    className,
  );
}

export function breadcrumbEllipsisClassName(className?: string) {
  return cn(
    "shrink-0 px-0.5 text-[var(--breadcrumb-separator)] select-none",
    className,
  );
}

export function breadcrumbCurrentClassName(className?: string) {
  return cn("font-medium truncate text-[var(--breadcrumb-current)]", className);
}

export function breadcrumbParentClassName(className?: string) {
  return cn("shrink-0 text-[var(--breadcrumb-parent)]", className);
}

export function profileMenuHeaderDividerClassName(className?: string) {
  return cn("px-2.5 py-2 border-b mb-0.5 border-[var(--profile-menu-divider)]", className);
}

export function profileMenuPanelClassName(className?: string) {
  return cn(
    "z-[100] w-52 rounded-lg border p-1 shadow-md",
    "bg-[var(--profile-menu-bg)] border-[var(--profile-menu-border)]",
    className,
  );
}

export function profileAvatarButtonClassName(className?: string) {
  return cn(
    topbarProfileButtonClassName(),
    className,
  );
}

export function profileAvatarInitialClassName(className?: string) {
  return cn(
    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
    "font-bold text-xs bg-[var(--surface-inset)] text-[var(--profile-avatar-fg)]",
    className,
  );
}

export function destructiveMenuItemClassName(className?: string) {
  return cn(
    "flex w-full items-center gap-2 rounded-md px-2.5 py-2 min-h-[40px] text-sm font-medium",
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
  return cn(focusRing, className);
}
