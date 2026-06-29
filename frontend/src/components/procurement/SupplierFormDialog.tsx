"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { procurementDialogContentClassName } from "@/lib/theme/hub-procurement";
import { formFieldInsetClassName } from "@/lib/theme/stock";
import { hubCtaClassName } from "@/lib/theme/hub-primitives";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";
import type { Supplier } from "@/types/api";

type SupplierFormDialogProps = {
  open: boolean;
  editing: Supplier | null;
  name: string;
  contactEmail: string;
  phone: string;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onNameChange: (value: string) => void;
  onContactEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onSubmit: () => void;
};

export function SupplierFormDialog({
  open,
  editing,
  name,
  contactEmail,
  phone,
  saving,
  onOpenChange,
  onNameChange,
  onContactEmailChange,
  onPhoneChange,
  onSubmit,
}: SupplierFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={procurementDialogContentClassName()}>
        <DialogHeader>
          <DialogTitle className={typeHeadingClassName("text-xl")}>
            {editing ? "Edit Supplier" : "Add Supplier"}
          </DialogTitle>
          <DialogDescription>
            Supplier details appear on purchase orders and ingredient primary supplier links.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="supplier-name" className={text.secondary}>
              Name
            </Label>
            <Input
              id="supplier-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
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
              value={contactEmail}
              onChange={(e) => onContactEmailChange(e.target.value)}
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
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="08x-xxx-xxxx"
              className={formFieldInsetClassName()}
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
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
            onClick={onSubmit}
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />}
            {editing ? "Save changes" : "Create supplier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
