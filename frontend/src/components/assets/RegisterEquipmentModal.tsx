"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EQUIPMENT_TYPE_OPTIONS } from "@/lib/equipment-filters";
import type { EquipmentType } from "@/types/api";
import {
  assetsDialogContentClassName,
  formFieldInsetClassName,
  formLineDateFieldClassName,
  formSelectContentClassName,
  hubCtaClassName,
  text,
  typeHeadingClassName,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

type RegisterEquipmentModalProps = {
  open: boolean;
  onClose: () => void;
  branchId: number;
  onSubmit: (payload: {
    branchId: number;
    name: string;
    type: EquipmentType;
    serialNumber?: string;
    nextMaintenanceDate?: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
};

export function RegisterEquipmentModal({
  open,
  onClose,
  branchId,
  onSubmit,
  isSubmitting = false,
}: RegisterEquipmentModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<EquipmentType>("ESPRESSO_MACHINE");
  const [serialNumber, setSerialNumber] = useState("");
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    setType("ESPRESSO_MACHINE");
    setSerialNumber("");
    setNextMaintenanceDate("");
  }, [open]);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Equipment name is required");
      return;
    }

    await onSubmit({
      branchId,
      name: trimmedName,
      type,
      serialNumber: serialNumber.trim() || undefined,
      nextMaintenanceDate: nextMaintenanceDate
        ? new Date(`${nextMaintenanceDate}T12:00:00`).toISOString()
        : undefined,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className={assetsDialogContentClassName()}>
        <DialogHeader>
          <DialogTitle className={typeHeadingClassName("text-xl flex items-center gap-2")}>
            <Plus className="w-5 h-5 text-[var(--hub-assets)]" aria-hidden />
            Register equipment
          </DialogTitle>
          <DialogDescription>
            Add a machine or appliance to this branch. Status defaults to active; schedule
            preventative maintenance when known.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="equipment-name" className={text.secondary}>
              Name
            </Label>
            <Input
              id="equipment-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. La Marzocco Linea PB"
              className={formFieldInsetClassName()}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment-type" className={text.secondary}>
              Type
            </Label>
            <Select
              value={type}
              onValueChange={(value) => value && setType(value as EquipmentType)}
            >
              <SelectTrigger id="equipment-type" className={formFieldInsetClassName("w-full")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={formSelectContentClassName()}>
                {EQUIPMENT_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment-serial" className={text.secondary}>
              Serial number <span className={text.muted}>(optional)</span>
            </Label>
            <Input
              id="equipment-serial"
              value={serialNumber}
              onChange={(event) => setSerialNumber(event.target.value)}
              placeholder="e.g. SN-12345"
              className={formFieldInsetClassName()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment-next-maintenance" className={text.secondary}>
              Next maintenance <span className={text.muted}>(optional)</span>
            </Label>
            <Input
              id="equipment-next-maintenance"
              type="date"
              value={nextMaintenanceDate}
              onChange={(event) => setNextMaintenanceDate(event.target.value)}
              className={formLineDateFieldClassName()}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px]">
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            className={cn("min-h-[44px]", hubCtaClassName("assets"))}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />}
            Register
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
