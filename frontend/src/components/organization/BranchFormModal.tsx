"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FormDialog } from "@/components/shared/form-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { Branch } from "@/types/api";
import { hubCtaClassName } from "@/lib/theme/hub-primitives";
import { organizationDialogContentClassName } from "@/lib/theme/organization";
import { formFieldInsetClassName } from "@/lib/theme/stock";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";

export type BranchFormValues = {
  name: string;
  location?: string;
  isCentralKitchen?: boolean;
};

type BranchFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Branch | null;
  onSave: (payload: BranchFormValues) => Promise<void>;
  isSubmitting?: boolean;
};

export function BranchFormModal({
  open,
  onOpenChange,
  initialValues,
  onSave,
  isSubmitting = false,
}: BranchFormModalProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [isCentralKitchen, setIsCentralKitchen] = useState(false);
  const editing = initialValues != null;

  useEffect(() => {
    if (!open) return;
    setName(initialValues?.name ?? "");
    setLocation(initialValues?.location ?? "");
    setIsCentralKitchen(initialValues?.isCentralKitchen ?? false);
  }, [open, initialValues]);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Branch name is required");
      return;
    }

    await onSave({
      name: trimmedName,
      location: location.trim() || undefined,
      isCentralKitchen,
    });
  };

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} className={organizationDialogContentClassName()}>
      <FormDialog.Title>{editing ? "Edit branch" : "Add branch"}</FormDialog.Title>
      <FormDialog.Body className="space-y-4 pt-1">
        <div className="space-y-2">
          <Label htmlFor="branch-name" className={text.secondary}>
            Name
          </Label>
          <Input
            id="branch-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. BranchBrew Downtown"
            className={formFieldInsetClassName()}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="branch-location" className={text.secondary}>
            Location <span className={text.muted}>(optional)</span>
          </Label>
          <Input
            id="branch-location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="e.g. 1st Floor, Center Point"
            className={formFieldInsetClassName()}
          />
        </div>

        <div className="flex items-start gap-3 border-t border-[var(--table-row-border)] pt-4">
          <Checkbox
            id="branch-central-kitchen"
            checked={isCentralKitchen}
            onCheckedChange={(checked) => setIsCentralKitchen(Boolean(checked))}
            className="mt-0.5"
          />
          <div className="space-y-0.5">
            <Label htmlFor="branch-central-kitchen" className={cn("font-medium", text.primary)}>
              Central kitchen (HQ)
            </Label>
            <p className={cn("text-sm", text.muted)}>
              Supplies other branches via stock transfers.
            </p>
          </div>
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
          disabled={isSubmitting}
          className={cn("min-h-[44px]", hubCtaClassName("organization"))}
          onClick={() => void handleSubmit()}
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />}
          {editing ? "Save" : "Create"}
        </Button>
      </FormDialog.Footer>
    </FormDialog>
  );
}
