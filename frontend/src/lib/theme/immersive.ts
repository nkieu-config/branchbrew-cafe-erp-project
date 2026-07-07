import { cn } from "@/lib/utils";
import { dashboardErrorPanelClass } from "./dashboard";
import { statusToneClassName } from "./status";
import { text } from "./surface";
import {
  typeHeadingClassName,
  typeMetricClassName,
  typeSectionLabelClassName,
  typeUiLabelClassName,
} from "./typography";

export type KdsTicketUrgency = "on-time" | "warning" | "late";

const kdsTicketUrgencyAccent: Record<KdsTicketUrgency, string> = {
  "on-time": "border-l-[var(--kds-on-time-border)]",
  warning: "border-l-[var(--kds-warning-border)]",
  late: "border-l-[var(--kds-late-border)]",
};

const kdsTimerTone: Record<KdsTicketUrgency, string> = {
  "on-time": text.muted,
  warning: "text-[var(--kds-warning-border)]",
  late: "text-[var(--kds-late-border)]",
};

export function posProductCardClassName(className?: string) {
  return cn(
    "ring-0 shadow-none cursor-default transition-colors",
    "bg-[var(--pos-panel-bg)] border-[var(--pos-panel-border)]",
    "hover:border-[var(--pos-accent-hover-border)] hover:shadow-md",
    className,
  );
}

export function posPriceClassName(className?: string) {
  return cn("font-bold tabular-nums text-lg text-[var(--pos-price-fg)]", className);
}

export function posAddButtonClassName(className?: string) {
  return cn(
    "bg-[var(--pos-accent-soft-bg)] text-[var(--pos-accent-soft-fg)]",
    "hover:opacity-90",
    className,
  );
}

export function posCartPanelClassName(className?: string) {
  return cn(
    "rounded-2xl shadow-md border flex flex-col h-full overflow-hidden",
    "bg-[var(--pos-panel-bg)] border-[var(--pos-panel-border)]",
    className,
  );
}

/** Contextual cart strip above POS bottom nav — not a second tab bar. */
export function posMobileCartBarClassName(className?: string) {
  return cn(
    "fixed inset-x-0 z-40 border-t px-3 py-2 lg:hidden",
    "bottom-[var(--mobile-nav-offset)]",
    "bg-[var(--background)] border-[var(--pos-panel-border)]",
    className,
  );
}

export function posMobileCartButtonClassName(className?: string) {
  return cn(
    "flex w-full min-h-[44px] items-center gap-2 rounded-xl border px-3 text-left transition-colors",
    "border-[var(--pos-panel-border)] bg-[var(--pos-panel-muted-bg)] hover:bg-[var(--table-row-hover)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]/50",
    "disabled:pointer-events-none disabled:opacity-50",
    className,
  );
}

export function posMobileCartIconClassName(className?: string) {
  return cn("text-[var(--pos-accent-soft-fg)]", className);
}

export function posMobileCartTotalClassName(className?: string) {
  return cn(typeHeadingClassName("tabular-nums"), className);
}

export function posMobileCartSheetClassName(className?: string) {
  return cn(
    "h-[min(92dvh,800px)] gap-0 rounded-t-2xl p-0",
    "border-[var(--pos-panel-border)] bg-[var(--pos-panel-bg)]",
    className,
  );
}

export function posCartTouchButtonClassName(className?: string) {
  return cn("h-11 w-11 min-h-[44px] min-w-[44px] p-0", className);
}

export function posFormPanelClassName(className?: string) {
  return cn(
    "flex flex-col gap-5 rounded-2xl border p-5 sm:p-6 shadow-sm",
    "bg-[var(--pos-panel-bg)] border-[var(--pos-panel-border)]",
    className,
  );
}

export function posCartHeaderClassName(className?: string) {
  return cn(
    "flex items-center justify-between border-b px-4 py-3.5 rounded-t-2xl",
    "bg-[var(--pos-panel-header-bg)] border-[var(--pos-panel-border)]",
    className,
  );
}

export function posCartTitleClassName(className?: string) {
  return typeHeadingClassName(cn("text-xl flex items-center gap-2", className));
}

export function posCartItemNameClassName(className?: string) {
  return typeUiLabelClassName(cn(text.primary, className));
}

export function posCartQtyClassName(className?: string) {
  return cn("min-w-[2rem] text-center text-sm font-bold tabular-nums px-1", className);
}

export function posCartLineTotalClassName(className?: string) {
  return cn("font-bold tabular-nums min-w-[4.5rem] text-right", text.secondary, className);
}

export function posCartSectionClassName(className?: string) {
  return cn(
    "border-t p-4 space-y-4 bg-[var(--pos-panel-muted-bg)] border-[var(--pos-panel-border)]",
    className,
  );
}

export function posCartBadgeClassName(className?: string) {
  return cn(
    "px-3 py-1 rounded-full text-xs font-bold tabular-nums",
    "bg-[var(--pos-accent-soft-bg)] text-[var(--pos-accent-soft-fg)]",
    className,
  );
}

export function posAccentIconClassName(className?: string) {
  return cn("text-[var(--pos-accent)]", className);
}

export function posAccentTextClassName(className?: string) {
  return cn("text-[var(--pos-price-fg)]", className);
}

export function posSummaryMutedClassName(className?: string) {
  return cn("text-sm", text.secondary, className);
}

export function posSummaryTotalClassName(className?: string) {
  return cn(posPriceClassName("text-2xl"), className);
}

export function posSummaryTotalRowClassName(className?: string) {
  return cn(
    "flex justify-between text-2xl font-bold pt-2 border-t border-[var(--pos-panel-border)]",
    text.primary,
    className,
  );
}

export function posSummaryDiscountClassName(className?: string) {
  return cn("text-sm text-[var(--status-success-fg)]", className);
}

export function posSummaryRewardClassName(className?: string) {
  return cn("text-xs", text.muted, className);
}

export function posStickyFilterBarClassName(className?: string) {
  return cn("shrink-0 pb-3", className);
}

export function posCatalogFilterBarClassName(className?: string) {
  return cn(
    "space-y-2.5 rounded-xl border px-3 py-2.5",
    "bg-[var(--surface-inset)] border-[var(--border)]",
    className,
  );
}

export function posCategoryScrollClassName(className?: string) {
  return cn(
    "flex gap-1.5 overflow-x-auto pb-0.5 -mx-0.5 px-0.5",
    "[scrollbar-width:thin] [&::-webkit-scrollbar]:h-1",
    className,
  );
}

export function posCatalogMetaClassName(className?: string) {
  return cn(
    typeUiLabelClassName("shrink-0 tabular-nums text-xs text-[var(--text-subtle)]"),
    className,
  );
}

export function posProductTileClassName(className?: string) {
  return cn(
    "group relative flex min-h-[108px] w-full flex-col rounded-2xl border p-3 text-left",
    "bg-[var(--pos-product-tile-bg)] border-[var(--pos-panel-border)]",
    "transition-[transform,box-shadow,background-color,border-color] duration-200",
    "hover:border-[var(--pos-accent-hover-border)] hover:bg-[var(--pos-product-tile-hover)] hover:shadow-md",
    "active:scale-[0.98] active:bg-[var(--pos-product-tile-active)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]/50",
    "motion-reduce:transition-none motion-reduce:active:scale-100",
    className,
  );
}

export function posProductTileCategoryClassName(className?: string) {
  return cn(
    typeSectionLabelClassName(
      "inline-flex w-fit max-w-full truncate rounded-full px-2.5 py-0.5 tracking-wide",
    ),
    "bg-[var(--pos-product-category-bg)] text-[var(--pos-product-category-fg)]",
    className,
  );
}

export function posProductTileNameClassName(className?: string) {
  return cn(typeHeadingClassName("mt-2 line-clamp-2 text-base leading-snug"), className);
}

export function posProductTileFooterClassName(className?: string) {
  return cn("mt-auto flex items-end justify-between gap-2 pt-2", className);
}

export function posProductTileAddHintClassName(className?: string) {
  return cn(
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
    "bg-[var(--pos-product-add-bg)] text-[var(--pos-product-add-fg)]",
    "shadow-sm transition-transform duration-200 group-hover:scale-105 group-active:scale-95",
    "motion-reduce:transition-none motion-reduce:group-hover:scale-100",
    className,
  );
}

export function posCartLineCardClassName(className?: string) {
  return cn("space-y-2 py-3", className);
}

export function posCartLineDividerClassName(className?: string) {
  return cn(
    "border-b border-[var(--pos-panel-border)]/40 py-3 last:border-b-0",
    className,
  );
}

export function posCartLineActionsClassName(className?: string) {
  return cn("flex items-center justify-between gap-2", className);
}

export function posCartEmptyStateClassName(className?: string) {
  return cn(
    "mx-2 mt-10 flex flex-col items-center gap-2 px-4 py-8 text-center",
    className,
  );
}

export function posPaymentMethodTileClassName(isSelected: boolean, className?: string) {
  return cn(
    "flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-xl border px-2 text-sm font-semibold transition-colors",
    isSelected
      ? "border-[var(--brand-solid)] bg-[var(--pos-accent-soft-bg)] text-[var(--pos-accent-soft-fg)] shadow-sm"
      : "border-[var(--pos-panel-border)] bg-[var(--pos-input-bg)] text-[var(--foreground)] hover:border-[var(--pos-accent-hover-border)]",
    className,
  );
}

export function posSummaryPanelClassName(className?: string) {
  return cn(
    "border-t p-4 space-y-2 rounded-b-xl",
    "bg-[var(--pos-panel-muted-bg)] border-[var(--pos-panel-border)]",
    className,
  );
}

export function posPanelTopDividerClassName(className?: string) {
  return cn("border-t border-[var(--pos-panel-border)]", className);
}

export function posQtyStepperShellClassName(className?: string) {
  return cn(
    "flex items-center rounded-lg border border-[var(--pos-panel-border)] overflow-hidden",
    className,
  );
}

export function posNativeCheckboxClassName(className?: string) {
  return cn("rounded border-[var(--pos-input-border)] w-4 h-4", className);
}

export function posCheckoutMutedPanelClassName(className?: string) {
  return cn(
    "space-y-3 p-3 rounded-lg border",
    "bg-[var(--pos-panel-muted-bg)] border-[var(--pos-panel-border)]",
    className,
  );
}

export function posPrimaryActionClassName(className?: string) {
  return cn(
    "font-bold bg-[var(--brand-solid)] text-[var(--on-brand-solid-fg)] hover:opacity-90 shadow-lg",
    "disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 disabled:shadow-none",
    className,
  );
}

export function posPayActionClassName(className?: string) {
  return cn(
    "font-bold bg-[var(--brand-solid)] text-[var(--on-brand-solid-fg)] hover:opacity-90 shadow-lg transition-colors",
    "disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 disabled:shadow-none",
    className,
  );
}

export function posCrmPanelClassName(className?: string) {
  return cn(
    "border p-3 rounded-lg relative",
    "bg-[var(--pos-crm-bg)] border-[var(--pos-crm-border)]",
    className,
  );
}

export function posCrmTitleClassName(className?: string) {
  return cn("flex items-center gap-2 font-bold text-[var(--pos-crm-fg)]", className);
}

export function posCrmMutedClassName(className?: string) {
  return cn("text-sm text-[var(--pos-crm-muted)]", className);
}

export function posCrmTierBadgeClassName(className?: string) {
  return cn(
    typeSectionLabelClassName("bg-[var(--pos-input-bg)] py-0 px-2 tracking-wider"),
    className,
  );
}

export function posPromoPanelClassName(className?: string) {
  return cn(
    "border p-3 rounded-lg flex justify-between items-center",
    "bg-[var(--pos-promo-bg)] border-[var(--pos-promo-border)]",
    className,
  );
}

export function posPromoTitleClassName(className?: string) {
  return cn("flex items-center gap-2 font-bold text-[var(--pos-promo-fg)]", className);
}

export function posDashedButtonClassName(className?: string) {
  return cn(
    "w-full border-dashed border-2 bg-[var(--pos-input-bg)] border-[var(--pos-input-border)]",
    "text-muted-foreground hover:text-[var(--pos-price-fg)] hover:border-[var(--pos-accent-hover-border)]",
    className,
  );
}

export function posInputClassName(className?: string) {
  return cn(
    "bg-[var(--pos-input-bg)] border-[var(--pos-input-border)]",
    "focus-visible:ring-[var(--focus-ring)]/50",
    className,
  );
}

export function posRemoveItemClassName(className?: string) {
  return cn(
    "text-[var(--status-danger-fg)] hover:bg-[var(--status-danger-bg)]",
    className,
  );
}

export function posEmptyProductsClassName(className?: string) {
  return cn(
    "col-span-3 text-center py-10 rounded-xl border border-dashed",
    "text-muted-foreground bg-[var(--pos-panel-bg)] border-[var(--pos-panel-border)]",
    className,
  );
}

export function posModifierSelectedClassName(className?: string) {
  return cn("bg-[var(--brand-solid)] hover:opacity-90 font-bold text-[var(--on-brand-solid-fg)]", className);
}

export function posModifierOptionTileClassName(isSelected: boolean, className?: string) {
  return cn(
    "flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl border px-2 py-2.5 text-center text-sm font-semibold transition-colors",
    isSelected
      ? "border-[var(--brand-solid)] bg-[var(--pos-accent-soft-bg)] text-[var(--pos-accent-soft-fg)] shadow-sm"
      : "border-[var(--pos-panel-border)] bg-[var(--pos-input-bg)] text-[var(--foreground)] hover:border-[var(--pos-accent-hover-border)]",
    className,
  );
}

export function posImmersiveDialogHeaderClassName(className?: string) {
  return cn("flex items-start justify-between gap-3 px-5 pt-5", className);
}

export function posImmersiveDialogBodyClassName(className?: string) {
  return cn("max-h-[min(52vh,400px)] overflow-y-auto px-5 py-4 space-y-6", className);
}

export function posImmersiveDialogFooterClassName(className?: string) {
  return cn(
    "border-t border-[var(--pos-panel-border)]/60 bg-[var(--pos-panel-muted-bg)]/50 p-4 sm:px-5 sm:py-4",
    className,
  );
}

export function posModifierSectionClassName(className?: string) {
  return cn("space-y-2", className);
}

export function posModifierGroupHeadingClassName(className?: string) {
  return cn("mb-1", className);
}

export function posModifierOptionRowClassName(isSelected: boolean, className?: string) {
  return cn(
    "flex w-full items-center gap-3 rounded-lg px-2 py-2.5 min-h-[44px] text-left transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]/50",
    isSelected
      ? "bg-[var(--pos-accent-soft-bg)] text-[var(--pos-accent-soft-fg)]"
      : "hover:bg-[var(--pos-product-tile-hover)]",
    className,
  );
}

export function posModifierOptionIndicatorClassName(isSelected: boolean, className?: string) {
  return cn(
    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
    isSelected
      ? "border-[var(--brand-solid)] bg-[var(--brand-solid)] text-[var(--on-brand-solid-fg)]"
      : "border-[var(--pos-panel-border)] bg-transparent",
    className,
  );
}

export function posModifierOptionPriceClassName(className?: string) {
  return cn("shrink-0 text-xs font-semibold tabular-nums text-[var(--text-subtle)]", className);
}

export function posModifierSummaryStripClassName(className?: string) {
  return cn(
    "border-t border-[var(--pos-panel-border)] bg-[var(--pos-panel-bg)] px-5 py-3 space-y-2",
    className,
  );
}

export function posModifierProductHeaderClassName(className?: string) {
  return cn(
    "rounded-xl border p-3 space-y-1",
    "bg-[var(--pos-panel-muted-bg)] border-[var(--pos-panel-border)]",
    className,
  );
}

export function posModifierGroupLabelClassName(className?: string) {
  return cn(typeSectionLabelClassName("text-xs tracking-wide"), text.secondary, className);
}

export function posSuccessDialogClassName(className?: string) {
  return cn(
    "overflow-hidden rounded-2xl border-[var(--pos-panel-border)]",
    className,
  );
}

export function posSuccessHeroClassName(className?: string) {
  return cn(
    "flex flex-col items-center gap-3 rounded-2xl border px-4 py-5 text-center",
    "border-[var(--pos-panel-border)] bg-[var(--pos-panel-muted-bg)]",
    className,
  );
}

export function posSuccessIconRingClassName(className?: string) {
  return cn(
    "flex h-16 w-16 items-center justify-center rounded-full",
    "bg-[var(--pos-accent-soft-bg)] text-[var(--pos-accent-soft-fg)] ring-4 ring-[var(--pos-accent-soft-bg)]",
    className,
  );
}

export function posSuccessTitleClassName(className?: string) {
  return cn(typeHeadingClassName("text-center text-xl sm:text-2xl"), className);
}

export function posReceiptPreviewClassName(className?: string) {
  return cn(
    "w-full max-w-[280px] rounded-2xl border p-4 text-sm text-center shadow-sm",
    "bg-[var(--pos-product-tile-bg)] border-[var(--pos-panel-border)] text-[var(--foreground)]",
    className,
  );
}

export function posReceiptCaptionClassName(className?: string) {
  return cn(
    typeSectionLabelClassName("border-b border-[var(--pos-panel-border)] pb-2 mb-3 tracking-wide"),
    text.muted,
    className,
  );
}

export function posQueueNumberClassName(className?: string) {
  return cn(
    "text-5xl font-black tabular-nums tracking-tight text-[var(--brand-text)]",
    className,
  );
}

export function posReceiptPreviewTotalClassName(className?: string) {
  return cn(typeMetricClassName("text-lg tabular-nums"), posPriceClassName(), className);
}

export function posSecondaryActionClassName(className?: string) {
  return cn(
    "w-full min-h-[48px] rounded-xl border-2 font-semibold",
    "border-[var(--pos-panel-border)] bg-[var(--pos-input-bg)] hover:bg-[var(--pos-product-tile-hover)]",
    className,
  );
}

export function posFormPanelHeaderClassName(className?: string) {
  return cn("flex items-center gap-3", className);
}

export function posFormPanelIconClassName(
  variant: "settlement" | "expense" | "member" | "customize",
  className?: string,
) {
  return cn(
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
    variant === "settlement" && "bg-[var(--pos-accent-soft-bg)] text-[var(--pos-accent-soft-fg)]",
    variant === "expense" && "bg-[var(--tone-amber-subtle)] text-[var(--pos-expense-icon)]",
    variant === "member" && "bg-[var(--pos-crm-bg)] text-[var(--pos-crm-fg)]",
    variant === "customize" && "bg-[var(--pos-accent-soft-bg)] text-[var(--pos-accent-soft-fg)]",
    className,
  );
}

export function posSettlementChannelRowClassName(className?: string) {
  return cn("flex items-center justify-between gap-3 py-1.5 text-sm", className);
}

export function posSettlementExpectedHeroClassName(className?: string) {
  return cn(
    "flex items-center justify-between gap-3 border-t border-[var(--pos-panel-border)]/60 pt-3 mt-1",
    className,
  );
}

export function posFormFieldLabelClassName(className?: string) {
  return cn(typeUiLabelClassName("mb-1.5 block text-sm"), text.secondary, className);
}

export function posSettlementIconClassName(className?: string) {
  return cn("text-[var(--pos-settlement-icon)]", className);
}

export function posSettlementHighlightClassName(className?: string) {
  return cn("text-[var(--pos-settlement-highlight)] tabular-nums", className);
}

export function posExpenseIconClassName(className?: string) {
  return cn("text-[var(--pos-expense-icon)]", className);
}

export function posNativeInputClassName(className?: string) {
  return cn(
    "w-full rounded-xl px-4 outline-none transition-colors tabular-nums",
    "bg-[var(--pos-input-bg)] border border-[var(--pos-input-border)]",
    "focus:border-[var(--focus-ring)] focus:ring-1 focus:ring-[var(--focus-ring)]",
    className,
  );
}

export function posSettlementSummaryClassName(className?: string) {
  return cn(
    "p-4 rounded-xl border space-y-2",
    "bg-[var(--pos-panel-muted-bg)] border-[var(--pos-panel-border)]",
    className,
  );
}

export function posNumpadShellClassName(className?: string) {
  return cn("flex w-full flex-col", className);
}

export function posNumpadHeaderClassName(className?: string) {
  return cn("flex items-start justify-between gap-3 px-5 pt-5", className);
}

export function posNumpadBodyClassName(className?: string) {
  return cn("px-5 py-4 space-y-4", className);
}

export function posNumpadFooterClassName(className?: string) {
  return cn(
    "border-t border-[var(--pos-panel-border)] bg-[var(--pos-panel-muted-bg)] p-4 sm:p-5",
    className,
  );
}

export function posNumpadDisplayClassName(className?: string) {
  return cn(
    "flex h-[3.25rem] items-center justify-center rounded-xl border text-2xl font-mono tracking-[0.2em] shadow-inner tabular-nums",
    "bg-[var(--pos-numpad-display-bg)] border-[var(--pos-panel-border)] text-[var(--foreground)]",
    className,
  );
}

export function posNumpadMetaClassName(className?: string) {
  return cn(typeUiLabelClassName("text-xs tabular-nums text-[var(--text-subtle)]"), className);
}

export function posNumpadKeyClassName(className?: string) {
  return cn(
    "h-14 min-h-[56px] rounded-xl border text-xl font-bold shadow-sm transition-colors",
    "bg-[var(--pos-numpad-key-bg)] border-[var(--pos-panel-border)]",
    "hover:bg-[var(--pos-numpad-key-hover)] hover:text-[var(--pos-price-fg)] hover:border-[var(--pos-accent-hover-border)]",
    "active:scale-[0.98] motion-reduce:active:scale-100",
    className,
  );
}

export function posNumpadDeleteClassName(className?: string) {
  return cn(
    posNumpadKeyClassName(),
    "text-[var(--pos-numpad-delete)] hover:bg-[var(--status-danger-bg)]",
    className,
  );
}

export function posNumpadSubmitClassName(className?: string) {
  return cn(posPrimaryActionClassName("min-h-[48px] rounded-xl text-base font-bold"), className);
}

export function posNumpadCloseButtonClassName(className?: string) {
  return cn(
    "h-10 w-10 shrink-0 rounded-xl border",
    "border-[var(--pos-panel-border)] bg-[var(--pos-input-bg)] hover:bg-[var(--pos-product-tile-hover)]",
    className,
  );
}

export function posQueueHighlightClassName(className?: string) {
  return cn("font-mono font-bold text-[var(--brand)]", className);
}

export function kdsConnectedBadgeClassName(className?: string) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium sm:px-2.5 sm:py-1 sm:text-xs",
    statusToneClassName("success"),
    className,
  );
}

export function kdsDisconnectedBadgeClassName(className?: string) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium sm:px-2.5 sm:py-1 sm:text-xs",
    statusToneClassName("danger"),
    className,
  );
}

export function kdsConnectedDotClassName() {
  return "w-2 h-2 rounded-full bg-[var(--kds-connected-dot)] animate-pulse motion-reduce:animate-none";
}

export function kdsErrorBannerClassName(className?: string) {
  return dashboardErrorPanelClass(cn("flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4", className));
}

export function kdsErrorRetryClassName(className?: string) {
  return cn(
    "border-[var(--widget-error-border)] text-[var(--status-danger-fg)] hover:bg-[var(--status-danger-bg)] shrink-0",
    className,
  );
}

export function kdsLoadingClassName(className?: string) {
  return cn("text-[var(--kds-loading)]", className);
}

export function kdsEmptyStateClassName(className?: string) {
  return cn(
    "flex flex-1 flex-col items-center justify-center px-4 py-10 text-center sm:py-16",
    className,
  );
}

export function kdsEmptyIconClassName(className?: string) {
  return cn("text-[var(--kds-empty-icon)]", className);
}

export function kdsPageHeaderDividerClassName(className?: string) {
  return cn("space-y-1 pb-3 border-b border-[var(--kds-ticket-divider)]", className);
}

export function kdsTicketGridClassName(className?: string) {
  return cn(
    "grid gap-4 auto-rows-min",
    "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-[repeat(auto-fill,minmax(340px,1fr))]",
    className,
  );
}

export function kdsColumnBoardClassName(className?: string) {
  return cn(
    "flex flex-1 min-h-0 flex-col gap-4",
    "lg:grid lg:grid-cols-2 lg:gap-4 lg:overflow-visible",
    className,
  );
}

export function kdsMobileColumnSwitchClassName(className?: string) {
  return cn(
    "lg:hidden grid grid-cols-2 gap-1.5 p-1.5 rounded-xl shrink-0",
    "bg-[var(--hub-tab-track)]",
    className,
  );
}

export function kdsMobileColumnTabClassName(isActive: boolean, className?: string) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-3 py-2",
    "text-sm font-medium transition-colors tabular-nums",
    isActive
      ? "bg-[var(--hub-tab-active)] text-[var(--hub-tab-active-fg)] shadow-sm"
      : "text-[var(--hub-tab-inactive-fg)] hover:text-[var(--hub-tab-inactive-hover)]",
    className,
  );
}

export function kdsColumnClassName(className?: string) {
  return cn(
    "flex min-h-0 min-w-0 flex-col rounded-xl",
    "flex-1 min-h-0",
    "max-lg:w-full",
    "bg-[var(--kds-ticket-footer-bg)]/60",
    className,
  );
}

export function kdsColumnHeaderClassName(className?: string) {
  return cn("shrink-0 px-3 py-2 sm:px-4 sm:pt-3", className);
}

export function kdsColumnScrollClassName(className?: string) {
  return cn(
    "flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-2 py-2 sm:px-4 sm:py-3",
    className,
  );
}

export function kdsColumnTicketStackClassName(className?: string) {
  return cn("flex flex-col gap-3 sm:gap-3.5", className);
}

export function kdsColumnEmptyClassName(className?: string) {
  return cn("py-12 text-center text-sm", text.muted, className);
}

export function kdsTicketClassName(urgency: KdsTicketUrgency, className?: string) {
  return cn(
    "w-full rounded-xl border border-l-4 overflow-hidden flex flex-col shrink-0 shadow-sm",
    "bg-[var(--kds-ticket-bg)] border-[var(--kds-ticket-divider)]",
    kdsTicketUrgencyAccent[urgency],
    urgency === "late" && "ring-1 ring-[var(--kds-late-border)]/40",
    className,
  );
}

export function kdsTicketHeaderClassName(className?: string) {
  return cn(
    "flex items-start justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3",
    "border-b border-[var(--kds-ticket-divider)]",
    className,
  );
}

export function kdsTicketBodyClassName(className?: string) {
  return cn("space-y-3 p-3 sm:p-4", className);
}

export function kdsTicketFooterClassName(className?: string) {
  return cn(
    "flex gap-2 border-t px-3 py-2.5 sm:py-3",
    "border-[var(--kds-ticket-divider)]",
    className,
  );
}

export function kdsItemDividerClassName(className?: string) {
  return cn("pb-3 border-b border-[var(--kds-ticket-divider)] last:border-0 last:pb-0", className);
}

export function kdsItemQtyClassName(className?: string) {
  return cn("font-semibold text-lg tabular-nums text-[var(--kds-item-qty)] shrink-0", className);
}

export function kdsItemNameClassName(className?: string) {
  return cn(
    "font-semibold text-base leading-snug break-words sm:text-lg",
    text.primary,
    className,
  );
}

export function kdsItemNoteClassName(className?: string) {
  return cn(
    "mt-1 text-sm italic break-words text-[var(--kds-note-fg)]",
    className,
  );
}

export function kdsItemNoteLabelClassName(className?: string) {
  return cn(
    typeSectionLabelClassName("mr-1.5"),
    "text-[var(--kds-note-fg)]",
    className,
  );
}

export function kdsItemNoteTextClassName(className?: string) {
  return cn("font-medium", className);
}

export function kdsItemModifiersClassName(className?: string) {
  return cn(
    "mt-0.5 text-sm leading-snug text-[var(--kds-modifier-fg)]",
    className,
  );
}

export function kdsTicketStatusBadgeClassName(
  status: "PENDING" | "PREPARING",
  className?: string,
) {
  return cn(
    "mt-1.5 inline-flex text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded",
    status === "PENDING"
      ? "bg-black/15 text-[var(--on-kds-header-fg)]"
      : "bg-white/25 text-[var(--on-kds-header-fg)]",
    className,
  );
}

export function kdsTicketQueueClassName(className?: string) {
  return cn(
    "text-xl font-bold tabular-nums tracking-wide sm:text-2xl lg:text-3xl",
    text.primary,
    className,
  );
}

export function kdsConfirmCancelButtonClassName(className?: string) {
  return cn("flex-1 min-h-12 text-base font-medium rounded-xl", className);
}

export function kdsTimerClassName(urgency: KdsTicketUrgency, className?: string) {
  return cn(
    "flex items-center gap-1.5 text-sm font-medium tabular-nums shrink-0",
    kdsTimerTone[urgency],
    urgency === "late" && "font-semibold motion-safe:animate-pulse",
    className,
  );
}

export function kdsImmersiveHeaderClassName(className?: string) {
  return cn(
    "shrink-0 space-y-2.5 pb-3 mb-1 border-b sm:space-y-2 sm:pb-3 sm:mb-3 lg:mb-4",
    "border-[var(--kds-ticket-divider)]",
    className,
  );
}

export function kdsImmersiveHeaderRowClassName(className?: string) {
  return cn(
    "flex flex-col gap-2 min-w-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3",
    className,
  );
}

export function kdsImmersiveHeaderMetaClassName(className?: string) {
  return cn("flex flex-wrap items-center gap-2", className);
}

export function kdsShellFrameClassName(className?: string) {
  return cn(
    "flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden sm:gap-4",
    className,
  );
}

export function kdsStartButtonClassName(className?: string) {
  return cn(
    "flex-1 min-h-12 rounded-xl text-base font-semibold text-[var(--on-kds-start-fg)]",
    "bg-[var(--kds-start-btn)] hover:opacity-90",
    className,
  );
}

export function kdsDoneButtonClassName(className?: string) {
  return cn(
    "flex-1 min-h-12 rounded-xl text-base font-semibold text-[var(--on-kds-done-fg)]",
    "bg-[var(--kds-done-btn)] hover:opacity-90",
    className,
  );
}

export function posLoadingSpinnerClassName(className?: string) {
  return kdsLoadingClassName(className);
}

export function posDialogContentClassName(className?: string) {
  return cn(
    "bg-[var(--pos-panel-bg)] border-[var(--pos-panel-border)] text-[var(--foreground)]",
    className,
  );
}

export function posCategoryChipClassName(isActive: boolean, className?: string) {
  return cn(
    "shrink-0 min-h-11 lg:min-h-9 rounded-full px-3.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-[var(--pos-category-active-bg)] text-[var(--pos-category-active-fg)]"
      : "text-[var(--pos-category-inactive-fg)] hover:bg-[var(--pos-product-tile-hover)]",
    className,
  );
}

export function posCartEmptyIconClassName(className?: string) {
  return cn("text-[var(--state-empty-icon)]", className);
}

export function posImmersiveHeaderClassName(className?: string) {
  return cn("shrink-0 pb-3 mb-3 border-b border-[var(--pos-panel-border)]", className);
}

export { text };

export { posSectionPanelClassName } from "./hub-panel";
