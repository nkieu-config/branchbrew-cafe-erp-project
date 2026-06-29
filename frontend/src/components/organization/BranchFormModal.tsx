"use client";

import { useEffect, useState } from "react";
import { Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { Branch } from "@/types/api";
import { formContextBannerClassName, hubModalIconClassName } from "@/lib/theme/color-helpers";
import { hubCtaClassName } from "@/lib/theme/hub-primitives";
import { organizationDialogContentClassName } from "@/lib/theme/organization";
import { formFieldInsetClassName } from "@/lib/theme/stock";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";

type BranchFormModalProps = {
  open: boolean;
  onClose: () => void;
  branch: Branch | null;
  onSubmit: (payload: {
    name: string;
    location?: string;
    isCentralKitchen?: boolean;
  }) => Promise<void>;
  isSubmitting?: boolean;
};

export function BranchFormModal({
  open,
  onClose,
  branch,
  onSubmit,
  isSubmitting = false,
}: BranchFormModalProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [isCentralKitchen, setIsCentralKitchen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(branch?.name ?? "");
    setLocation(branch?.location ?? "");
    setIsCentralKitchen(branch?.isCentralKitchen ?? false);
  }, [open, branch]);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Branch name is required");
      return;
    }

    await onSubmit({
      name: trimmedName,
      location: location.trim() || undefined,
      isCentralKitchen,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className={organizationDialogContentClassName()}>
        <DialogHeader>
          <DialogTitle className={typeHeadingClassName("text-xl flex items-center gap-2")}>
            <Building2 className={hubModalIconClassName("organization")} aria-hidden />
            {branch ? "Edit branch" : "Create branch"}
          </DialogTitle>
          <DialogDescription>
            {branch
              ? "Update location details or mark this site as a central kitchen (HQ)."
              : "Add a franchise location or central kitchen. Inventory rows are provisioned automatically on create."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="branch-name" className={text.secondary}>
              Branch name
            </Label>
            <Input
              id="branch-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Qafa Siam Square"
              className={formFieldInsetClassName()}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch-location" className={text.secondary}>
              Location / address <span className={text.muted}>(optional)</span>
            </Label>
            <Input
              id="branch-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="e.g. 1st Floor, Center Point"
              className={formFieldInsetClassName()}
            />
          </div>

          <div className={formContextBannerClassName("flex items-start gap-3 p-3")}>
            <Checkbox
              id="branch-central-kitchen"
              checked={isCentralKitchen}
              onCheckedChange={(checked) => setIsCentralKitchen(Boolean(checked))}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <Label htmlFor="branch-central-kitchen" className={cn("font-medium", text.primary)}>
                Central kitchen (HQ)
              </Label>
              <p className={cn("text-sm", text.muted)}>
                HQ sites can supply other branches via stock transfers and often hold bulk prep
                inventory.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px]">
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            className={cn("min-h-[44px]", hubCtaClassName("organization"))}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />}
            {branch ? "Save changes" : "Create branch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
