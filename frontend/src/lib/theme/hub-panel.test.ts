import { describe, expect, it } from "vitest";
import {
  hubDialogContentClassName,
  hubMetaBadgeClassName,
  hubSectionPanelClassName,
} from "./hub-panel";
import { crmSectionPanelClassName, hrMetaBadgeClassName } from "./hub-section-aliases";

describe("hub panel primitives", () => {
  it("hubSectionPanelClassName uses hub section frame tokens", () => {
    const panel = hubSectionPanelClassName("inventory");
    expect(panel).toContain("hub-section-panel");
    expect(panel).toContain("var(--hub-section-bg)");
    expect(panel).toContain("var(--hub-section-border)");
  });

  it("deprecated hub aliases delegate to parameterized primitives", () => {
    expect(crmSectionPanelClassName()).toBe(hubSectionPanelClassName("crm"));
    expect(hrMetaBadgeClassName()).toBe(hubMetaBadgeClassName("hr"));
  });

  it("hubDialogContentClassName wraps form dialog shell", () => {
    expect(hubDialogContentClassName(640)).toContain("max-w-[640px]");
  });
});
