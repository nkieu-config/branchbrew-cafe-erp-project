"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateIngredient, useUpdateIngredient } from "@/hooks/domains/useProductQueries";
import { toast } from "sonner";

import type { Ingredient } from '@/types/api';
import { getErrorMessage } from '@/lib/errors';
import { hubCtaClassName } from "@/lib/theme";

export function IngredientFormModal({ isOpen, onClose, ingredient }: { isOpen: boolean, onClose: () => void, ingredient?: Ingredient }) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [costPerUnit, setCostPerUnit] = useState<number | "">("");
  const [isActive, setIsActive] = useState(true);

  const createMutation = useCreateIngredient();
  const updateMutation = useUpdateIngredient();

  useEffect(() => {
    if (ingredient) {
      setName(ingredient.name);
      setUnit(ingredient.unit);
      setCostPerUnit(ingredient.costPerUnit || 0);
      setIsActive(ingredient.isActive ?? true);
    } else {
      setName("");
      setUnit("");
      setCostPerUnit("");
      setIsActive(true);
    }
  }, [ingredient, isOpen]);

  const handleSubmit = async () => {
    if (!name || !unit) {
      toast.error("Name and unit are required");
      return;
    }
    try {
      const payload = { name, unit, costPerUnit: Number(costPerUnit) || 0, isActive };
      if (ingredient) {
        await updateMutation.mutateAsync({ id: ingredient.id, ...payload });
        toast.success("Ingredient updated successfully!");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Ingredient created successfully!");
      }
      onClose();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Operation failed"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{ingredient ? "Edit Ingredient" : "New Raw Ingredient"}</DialogTitle>
          <DialogDescription>Add raw materials that will be used to build recipes.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Ingredient Name</Label>
            <Input placeholder="e.g. Arabica Beans" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Unit of Measurement</Label>
              <Input placeholder="e.g. g, ml, pcs" value={unit} onChange={e => setUnit(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Estimated Cost per Unit (฿)</Label>
              <Input type="number" min="0" step="0.01" value={costPerUnit} onChange={e => setCostPerUnit(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-[var(--table-row-border)]">
            <input 
              type="checkbox" 
              id="isActive" 
              checked={isActive} 
              onChange={e => setIsActive(e.target.checked)} 
              className="w-4 h-4 rounded border-input"
            />
            <Label htmlFor="isActive" className="cursor-pointer">Active (Available for recipes and POs)</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} className={hubCtaClassName("products")}>Save Ingredient</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
