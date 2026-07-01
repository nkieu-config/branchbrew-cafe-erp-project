"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDialog } from "@/components/shared/form-modal";
import { procurementDialogContentClassName } from "@/lib/theme/hub-procurement";
import { formFieldInsetClassName } from "@/lib/theme/stock";
import { hubCtaClassName } from "@/lib/theme/hub-primitives";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";
import type { Supplier } from "@/types/api";

export type SupplierFormValues = {
  name: string;
  contactEmail: string;
  phone: string;
};

type SupplierFormDialogProps = {
  open: boolean;
  initialValues?: Supplier | null;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: SupplierFormValues) => void;
};

export function SupplierFormDialog({
  open,
  initialValues,
  saving,
  onOpenChange,
  onSave,
}: SupplierFormDialogProps) {
  const [values, setValues] = useState<SupplierFormValues>({
    name: "",
    contactEmail: "",
    phone: "",
  });
  const editing = initialValues != null;

  useEffect(() => {
    if (!open) return;
    setValues({
      name: initialValues?.name ?? "",
      contactEmail: initialValues?.contactEmail ?? "",
      phone: initialValues?.phone ?? "",
    });
  }, [initialValues, open]);

  const updateValue = (field: keyof SupplierFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} className={procurementDialogContentClassName()}>
      <FormDialog.Title>{editing ? "Edit supplier" : "Add supplier"}</FormDialog.Title>
      <FormDialog.Body className="space-y-4 pt-1">
        <div className="space-y-2">
          <Label htmlFor="supplier-name" className={text.secondary}>
            Name
          </Label>
          <Input
            id="supplier-name"
            value={values.name}
            onChange={(e) => updateValue("name", e.target.value)}
            placeholder="Supplier name"
            className={formFieldInsetClassName()}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supplier-email" className={text.secondary}>
            Email
          </Label>
          <Input
            id="supplier-email"
            type="email"
            value={values.contactEmail}
            onChange={(e) => updateValue("contactEmail", e.target.value)}
            placeholder="sales@vendor.com"
            className={formFieldInsetClassName()}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supplier-phone" className={text.secondary}>
            Phone
          </Label>
          <Input
            id="supplier-phone"
            value={values.phone}
            onChange={(e) => updateValue("phone", e.target.value)}
            placeholder="08x-xxx-xxxx"
            className={formFieldInsetClassName()}
          />
        </div>
      </FormDialog.Body>
      <FormDialog.Footer className="gap-2 sm:gap-0">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="min-h-[44px]"
        >
          Cancel
        </Button>
        <Button
          type="button"
          disabled={saving}
          className={cn("min-h-[44px]", hubCtaClassName("procurement"))}
          onClick={() => onSave(values)}
        >
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />}
          {editing ? "Save" : "Create"}
        </Button>
      </FormDialog.Footer>
    </FormDialog>
  );
}
