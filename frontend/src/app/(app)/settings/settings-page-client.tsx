"use client";

import { useState, useEffect, useMemo } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/domains/useSettingsQueries";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { Store, Receipt, Calculator, Banknote, Loader2, Save, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errors";
import {
  financeErrorBannerClassName,
  hubCardIconFor,
  hubCtaClassName,
  metricValueClassName,
  settingsSectionClassName,
  settingsSectionHeaderClassName,
  settingsSectionTitleClassName,
  statusInlineAlertClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const EMPTY_FORM: Record<string, string> = {
  companyName: "",
  taxId: "",
  vatRate: "7",
  currency: "THB",
  receiptFooter: "Thank you for your business!",
};

function settingsToForm(settings: Record<string, string | undefined>): Record<string, string> {
  return {
    companyName: settings.companyName || "",
    taxId: settings.taxId || "",
    vatRate: settings.vatRate || "7",
    currency: settings.currency || "THB",
    receiptFooter: settings.receiptFooter || "Thank you for your business!",
  };
}

export default function SettingsPage() {
  const { data: settings, isLoading, isError, error, refetch } = useSettings();
  const updateSettingsMutation = useUpdateSettings();

  const [formData, setFormData] = useState<Record<string, string>>(EMPTY_FORM);
  const [savedSnapshot, setSavedSnapshot] = useState<Record<string, string>>(EMPTY_FORM);

  useEffect(() => {
    if (settings) {
      const next = settingsToForm(settings);
      setFormData(next);
      setSavedSnapshot(next);
    }
  }, [settings]);

  const isDirty = useMemo(
    () => JSON.stringify(formData) !== JSON.stringify(savedSnapshot),
    [formData, savedSnapshot],
  );

  useUnsavedChangesGuard(isDirty);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateSettingsMutation.mutate(formData, {
      onSuccess: () => setSavedSnapshot(formData),
    });
  };

  return (
    <div className="space-y-6 max-w-4xl w-full">
      {isDirty && (
        <div role="status" className={statusInlineAlertClassName("warning")}>
          You have unsaved changes. Save before leaving this page.
        </div>
      )}

      <div className="flex justify-end">
        <Button
          className={hubCtaClassName("settings", "flex items-center gap-2")}
          onClick={handleSave}
          disabled={isLoading || isError || updateSettingsMutation.isPending || !isDirty}
        >
          <Save className="w-4 h-4" />
          {updateSettingsMutation.isPending ? "Saving…" : "Save Settings"}
        </Button>
      </div>

      {isError && (
        <div className={financeErrorBannerClassName()}>
          <p className={cn("text-sm font-medium", text.primary)}>
            {getErrorMessage(error, "Failed to load settings")}
          </p>
          <Button variant="outline" size="sm" onClick={() => void refetch()} className="shrink-0">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className={cn("w-8 h-8 animate-spin motion-reduce:animate-none", hubCardIconFor("settings"))} />
        </div>
      ) : !isError ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={settingsSectionClassName()}>
            <div className={settingsSectionHeaderClassName()}>
              <Store className={cn("w-5 h-5", metricValueClassName("blue"))} />
              <h3 className={settingsSectionTitleClassName()}>Company Information</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="settings-company-name">Company Name (Legal)</Label>
                <Input
                  id="settings-company-name"
                  value={formData.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  placeholder="e.g. Qafa Cafe Co., Ltd."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="settings-tax-id">Tax ID</Label>
                <Input
                  id="settings-tax-id"
                  value={formData.taxId}
                  onChange={(e) => handleChange("taxId", e.target.value)}
                  placeholder="13-digit Tax ID"
                />
              </div>
            </div>
          </div>

          <div className={settingsSectionClassName()}>
            <div className={settingsSectionHeaderClassName()}>
              <Calculator className={hubCardIconFor("finance")} />
              <h3 className={settingsSectionTitleClassName()}>Finance & Tax</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="settings-vat-rate">VAT Rate (%)</Label>
                  <Input
                    id="settings-vat-rate"
                    type="number"
                    value={formData.vatRate}
                    onChange={(e) => handleChange("vatRate", e.target.value)}
                    placeholder="e.g. 7"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settings-currency">Default Currency</Label>
                  <div className="relative">
                    <Banknote className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", text.muted)} />
                    <Input
                      id="settings-currency"
                      className="pl-9"
                      value={formData.currency}
                      onChange={(e) => handleChange("currency", e.target.value)}
                      placeholder="e.g. THB"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={settingsSectionClassName("md:col-span-2")}>
            <div className={settingsSectionHeaderClassName()}>
              <Receipt className={hubCardIconFor("pos")} />
              <h3 className={settingsSectionTitleClassName()}>Point of Sale (POS)</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="settings-receipt-footer">Receipt Footer Message</Label>
                <Input
                  id="settings-receipt-footer"
                  value={formData.receiptFooter}
                  onChange={(e) => handleChange("receiptFooter", e.target.value)}
                  placeholder="e.g. Thank you for your business! Password WiFi: qafa123"
                />
                <p className={cn("text-xs", text.muted)}>
                  This message will be printed at the bottom of all customer receipts.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
