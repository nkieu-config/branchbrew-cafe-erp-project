/**
 * Back-compat barrel for hub UI tokens.
 * Prefer importing from domain modules directly:
 * - `./hub-primitives` — CTAs, chips, form sections, links
 * - `./hub-banners` — info/warning banners
 * - `./hub-section-aliases` — per-hub section panels, meta badges, dialogs
 * - `./hub-products` — food cost, modifier panels
 * - `./hub-procurement` — PO receive lines
 * - `./hub-kitchen` — kanban, production tones
 * - `./hub-hr` — gantt, shifts, attendance, payroll
 * - `./hub-crm` — CRM cards, tiers, loyalty
 * - `./hub-settings` — settings section chrome
 */
export {
  hubCtaClassName,
  hubCardIconFor,
  summaryChipClassName,
  kitchenSummaryChipClassName,
  tableActionAccentClassName,
  inlineLinkClassName,
  expandedRowPanelClassName,
  formSectionClassName,
  branchCardClassName,
  emptyStatePanelClassName,
  avatarPlaceholderClassName,
  formDashedButtonClassName,
  statusInlineAlertClassName,
  hubLoadingSpinnerClassName,
} from "./hub-primitives";

export {
  infoBannerClassName,
  infoBannerIconClassName,
  infoBannerTitleClassName,
  infoBannerTextClassName,
  warningBannerClassName,
  warningBannerPanelClassName,
  warningBannerIconClassName,
  warningBannerTitleClassName,
  warningBannerTextClassName,
} from "./hub-banners";

export {
  crmSectionPanelClassName,
  productsSectionPanelClassName,
  productsCategoryBadgeClassName,
  productsDialogContentClassName,
  procurementSectionPanelClassName,
  procurementMetaBadgeClassName,
  procurementDialogContentClassName,
  kitchenSectionPanelClassName,
  kitchenMetaBadgeClassName,
  kitchenDialogContentClassName,
  hrSectionPanelClassName,
  posSectionPanelClassName,
  hrMetaBadgeClassName,
  hrDialogContentClassName,
} from "./hub-section-aliases";

export {
  foodCostStatusMetricTone,
  foodCostStatusClassName,
  foodCostProgressIndicatorClassName,
  modifierGroupPanelClassName,
} from "./hub-products";

export { receiveLineClassName } from "./hub-procurement";

export {
  productionColumnTone,
  kanbanColumnClassName,
  kanbanColumnHeaderClassName,
  kanbanCardClassName,
  kanbanOrderBadgeClassName,
  kanbanMetaChipClassName,
} from "./hub-kitchen";

export {
  ganttPanelClassName,
  ganttHeaderClassName,
  ganttTimeAxisClassName,
  ganttHourLabelClassName,
  ganttHourMarkerClassName,
  ganttGridLineClassName,
  ganttUserColumnClassName,
  ganttTrackClassName,
  shiftBarClassName,
  hrAvatarClassName,
  attendanceLateRowClassName,
  attendanceOnTimeClassName,
  attendanceLateTimeClassName,
  payrollExpandedPanelClassName,
  payrollSummaryRowClassName,
  type ShiftBarStatus,
} from "./hub-hr";

export {
  crmSearchInputClassName,
  crmPointsClassName,
  crmPointsSuffixClassName,
  crmInsightPanelClassName,
  crmSectionLabelClassName,
  crmFavoriteChipClassName,
  crmFavoriteCountClassName,
  crmOrderCardClassName,
  crmOrderIconWrapClassName,
  crmMaxTierBadgeClassName,
  crmProgressClassName,
  crmSheetContentClassName,
  crmDialogContentClassName,
  customerTierTone,
  churnRiskTone,
  customerTierIconClassName,
} from "./hub-crm";

export {
  settingsSectionClassName,
  settingsSectionHeaderClassName,
  settingsSectionTitleClassName,
} from "./hub-settings";
