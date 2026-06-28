"use client";

import { useEffect, useState } from "react";
import { Loader2, Wrench } from "lucide-react";
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
import { equipmentStatusLabel } from "@/lib/equipment-filters";
import type { Equipment, EquipmentStatus } from "@/types/api";
import {
  assetsDialogContentClassName,
  formFieldInsetClassName,
  formLineDateFieldClassName,
  formSelectContentClassName,
  hubCtaClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: EquipmentStatus[] = ["ACTIVE", "MAINTENANCE", "BROKEN", "RETIRED"];

type LogMaintenanceModalProps = {
  open: boolean;
  onClose: () => void;
  equipment: Equipment | null;
  performedBy?: string;
  onSubmit: (payload: {
    id: number;
    data: {
      description: string;
      cost: number;
      performedBy?: string;
      date: string;
      nextMaintenanceDate?: string;
      newStatus?: EquipmentStatus;
    };
  }) => Promise<void>;
  isSubmitting?: boolean;
};

export function LogMaintenanceModal({
  open,
  onClose,
  equipment,
  performedBy,
  onSubmit,
  isSubmitting = false,
}: LogMaintenanceModalProps) {
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState("");
  const [newStatus, setNewStatus] = useState<EquipmentStatus | "">("");

  useEffect(() => {
    if (!open || !equipment) return;
    setDescription("");
    setCost("");
    setNextMaintenanceDate(
      equipment.nextMaintenanceDate
        ? equipment.nextMaintenanceDate.slice(0, 10)
        : "",
    );
    setNewStatus("");
  }, [open, equipment]);

  const handleSubmit = async () => {
    if (!equipment) return;

    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      toast.error("Description is required");
      return;
    }

    const parsedCost = Number(cost);
    if (!Number.isFinite(parsedCost) || parsedCost < 0) {
      toast.error("Enter a valid cost");
      return;
    }

    await onSubmit({
      id: equipment.id,
      data: {
        description: trimmedDescription,
        cost: parsedCost,
        performedBy: performedBy?.trim() || undefined,
        date: new Date().toISOString(),
        nextMaintenanceDate: nextMaintenanceDate
          ? new Date(`${nextMaintenanceDate}T12:00:00`).toISOString()
          : undefined,
        newStatus: newStatus || undefined,
      },
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
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[var(--hub-assets)]" aria-hidden />
            Log maintenance
          </DialogTitle>
          <DialogDescription>
            {equipment
              ? `Record service for ${equipment.name}. Update the next due date and status when applicable.`
              : "Record a maintenance visit for this asset."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="maintenance-description" className={text.secondary}>
              Description
            </Label>
            <Input
              id="maintenance-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="e.g. Group head gasket replaced"
              className={formFieldInsetClassName()}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maintenance-cost" className={text.secondary}>
                Cost (THB)
              </Label>
              <Input
                id="maintenance-cost"
                type="number"
                min={0}
                step="0.01"
                value={cost}
                onChange={(event) => setCost(event.target.value)}
                className={formFieldInsetClassName()}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintenance-next-date" className={text.secondary}>
                Next maintenance
              </Label>
              <Input
                id="maintenance-next-date"
                type="date"
                value={nextMaintenanceDate}
                onChange={(event) => setNextMaintenanceDate(event.target.value)}
                className={formLineDateFieldClassName()}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maintenance-status" className={text.secondary}>
              Update status <span className={text.muted}>(optional)</span>
            </Label>
            <Select
              value={newStatus}
              onValueChange={(value) =>
                setNewStatus(value ? (value as EquipmentStatus) : "")
              }
            >
              <SelectTrigger id="maintenance-status" className={formFieldInsetClassName("w-full")}>
                <SelectValue placeholder="Keep current status" />
              </SelectTrigger>
              <SelectContent className={formSelectContentClassName()}>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {equipmentStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px]">
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || !equipment}
            className={cn("min-h-[44px]", hubCtaClassName("assets", "font-bold"))}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />}
            Save record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
