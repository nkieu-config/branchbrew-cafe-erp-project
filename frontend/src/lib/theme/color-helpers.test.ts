import { describe, expect, it } from "vitest";
import {
  accessDeniedIconClassName,
  decorativeIconClassName,
  emptyStateIconClassName,
  formContextBannerClassName,
  formValidationHintClassName,
  formFieldInvalidClassName,
  formFieldErrorMessageClassName,
  hubModalIconClassName,
  statusTextClassName,
  surfaceInsetSkeletonClassName,
  tableRowDividerClassName,
} from "./color-helpers";
import {
  dashboardAlertsLowValueClassName,
  dashboardWidgetErrorIconClassName,
} from "./dashboard";
import { dataTableRowHoverClassName } from "./data-table";
import { posNativeCheckboxClassName, posQtyStepperShellClassName } from "./immersive";
import { sidebarBrandMarkClassName, sidebarBrandMarkIconClassName } from "./shell";

describe("color helpers", () => {
  it("maps status tones to semantic CSS variables", () => {
    expect(statusTextClassName("danger")).toContain("--status-danger-fg");
    expect(formValidationHintClassName("warning")).toContain("--status-warning-fg");
  });

  it("uses hub accent bridge for modal icons", () => {
    expect(hubModalIconClassName("finance")).toContain("text-hub-finance-icon");
  });

  it("covers shared empty and skeleton surfaces", () => {
    expect(decorativeIconClassName()).toContain("--text-subtle");
    expect(emptyStateIconClassName()).toContain("--state-empty-icon");
    expect(accessDeniedIconClassName()).toContain("--state-denied-icon");
    expect(surfaceInsetSkeletonClassName()).toContain("--surface-inset");
    expect(formContextBannerClassName()).toContain("--form-line-bg");
  });

  it("covers layout and table interaction tokens", () => {
    expect(tableRowDividerClassName()).toContain("--table-row-border");
    expect(dataTableRowHoverClassName()).toContain("--table-row-hover");
    expect(sidebarBrandMarkClassName()).toContain("--sidebar-brand-mark-bg");
    expect(sidebarBrandMarkIconClassName()).toContain("--sidebar-brand-mark-fg");
  });

  it("covers form field validation helpers", () => {
    expect(formFieldInvalidClassName(true)).toContain("--form-field-invalid-border");
    expect(formFieldInvalidClassName(true)).not.toContain("border-destructive");
    expect(formFieldErrorMessageClassName()).toContain("--status-danger-fg");
  });

  it("covers dashboard and POS domain tokens", () => {
    expect(dashboardAlertsLowValueClassName()).toContain("--widget-alerts-low-value");
    expect(dashboardWidgetErrorIconClassName()).toContain("--widget-error-icon");
    expect(posQtyStepperShellClassName()).toContain("--pos-panel-border");
    expect(posNativeCheckboxClassName()).toContain("--pos-input-border");
  });
});
