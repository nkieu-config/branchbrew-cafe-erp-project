"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useCreatePromotion,
  useUpdatePromotion,
} from "@/hooks/domains/useCrmQueries";
import { getErrorMessage } from "@/lib/errors";
import {
  dateInputToIso,
  isDuplicatePromoCodeError,
  toDateInputValue,
} from "@/lib/promotion-status";
import type { Promotion } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { crmDialogContentClassName } from "@/lib/theme/hub-crm";
import {
  formContextBannerClassName,
  formFieldErrorMessageClassName,
  formFieldInvalidClassName,
} from "@/lib/theme/color-helpers";
import { hubCtaClassName } from "@/lib/theme/hub-primitives";
import { formFieldInsetClassName, formSelectContentClassName } from "@/lib/theme/stock";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName, typeUiLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";

type PromotionFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion: Promotion | null;
};

const emptyForm = {
  code: "",
  description: "",
  discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
  discountValue: "",
  minPurchase: "",
  startDate: "",
  endDate: "",
};

export function PromotionFormDialog({ open, onOpenChange, promotion }: PromotionFormDialogProps) {
  const editing = promotion != null;
  const [code, setCode] = useState(emptyForm.code);
  const [description, setDescription] = useState(emptyForm.description);
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">(
    emptyForm.discountType,
  );
  const [discountValue, setDiscountValue] = useState(emptyForm.discountValue);
  const [minPurchase, setMinPurchase] = useState(emptyForm.minPurchase);
  const [startDate, setStartDate] = useState(emptyForm.startDate);
  const [endDate, setEndDate] = useState(emptyForm.endDate);
  const [codeError, setCodeError] = useState<string | null>(null);

  const createMutation = useCreatePromotion();
  const updateMutation = useUpdatePromotion();

  useEffect(() => {
    if (!open) return;
    if (promotion) {
      setCode(promotion.code);
      setDescription(promotion.description);
      setDiscountType(promotion.discountType);
      setDiscountValue(String(promotion.discountValue));
      setMinPurchase(promotion.minPurchase != null ? String(promotion.minPurchase) : "");
      setStartDate(toDateInputValue(promotion.startDate));
      setEndDate(toDateInputValue(promotion.endDate));
    } else {
      setCode(emptyForm.code);
      setDescription(emptyForm.description);
      setDiscountType(emptyForm.discountType);
      setDiscountValue(emptyForm.discountValue);
      setMinPurchase(emptyForm.minPurchase);
      setStartDate(emptyForm.startDate);
      setEndDate(emptyForm.endDate);
    }
    setCodeError(null);
  }, [open, promotion]);

  const closeDialog = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const validateDiscountValue = (): boolean => {
    const value = Number(discountValue);
    if (Number.isNaN(value) || value < 0) {
      toast.error("Enter a valid discount value");
      return false;
    }
    if (discountType === "PERCENTAGE" && value > 100) {
      toast.error("Percentage discount cannot exceed 100%");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !discountValue) return;
    if (!editing && !code) return;
    if (!validateDiscountValue()) return;

    const datePayload = {
      startDate: startDate ? dateInputToIso(startDate) : null,
      endDate: endDate ? dateInputToIso(endDate, true) : null,
    };

    try {
      if (editing && promotion) {
        await updateMutation.mutateAsync({
          id: promotion.id,
          data: {
            description,
            discountType,
            discountValue: Number(discountValue),
            minPurchase: minPurchase ? Number(minPurchase) : undefined,
            ...datePayload,
          },
        });
        toast.success("Promotion updated");
      } else {
        await createMutation.mutateAsync({
          code: code.toUpperCase(),
          description,
          discountType,
          discountValue: Number(discountValue),
          minPurchase: minPurchase ? Number(minPurchase) : undefined,
          isActive: true,
          ...(datePayload.startDate && { startDate: datePayload.startDate }),
          ...(datePayload.endDate && { endDate: datePayload.endDate }),
        });
        toast.success("Promotion created");
      }
      closeDialog();
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Failed to save promotion");
      if (!editing && isDuplicatePromoCodeError(message)) {
        setCodeError("This code is already in use");
      }
      toast.error(message);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) closeDialog();
        else onOpenChange(true);
      }}
    >
      <DialogContent className={crmDialogContentClassName("sm:max-w-lg")}>
        <DialogHeader>
          <DialogTitle className={typeHeadingClassName("text-xl")}>
            {editing ? "Edit Promotion" : "Create Promotion Code"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {!editing ? (
            <div className="space-y-2">
              <Label htmlFor="promo-code" className={text.secondary}>
                Code
              </Label>
              <Input
                id="promo-code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setCodeError(null);
                }}
                required
                placeholder="e.g. SUMMER20"
                aria-invalid={codeError != null}
                className={formFieldInsetClassName(formFieldInvalidClassName(codeError != null))}
              />
              {codeError && (
                <p className={formFieldErrorMessageClassName()} role="alert">
                  {codeError}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label className={text.secondary}>Code</Label>
              <p
                className={typeUiLabelClassName(
                  cn(
                    formContextBannerClassName("font-mono text-sm px-3 py-2.5 rounded-xl"),
                    text.primary,
                  ),
                )}
              >
                {code}
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="promo-description" className={text.secondary}>
              Description
            </Label>
            <Input
              id="promo-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="e.g. Summer drink discount"
              className={formFieldInsetClassName()}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="promo-discount-type" className={text.secondary}>
                Discount Type
              </Label>
              <Select
                value={discountType}
                onValueChange={(value) => {
                  if (value === "PERCENTAGE" || value === "FIXED_AMOUNT") {
                    setDiscountType(value);
                  }
                }}
              >
                <SelectTrigger id="promo-discount-type" className={formFieldInsetClassName("w-full")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Fixed Amount (THB)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-discount-value" className={text.secondary}>
                Value
              </Label>
              <Input
                id="promo-discount-value"
                type="number"
                min="0"
                max={discountType === "PERCENTAGE" ? "100" : undefined}
                step={discountType === "PERCENTAGE" ? "1" : "0.01"}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                required
                placeholder={discountType === "PERCENTAGE" ? "e.g. 20" : "e.g. 50"}
                className={formFieldInsetClassName()}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="promo-min-purchase" className={text.secondary}>
              Minimum Purchase (Optional)
            </Label>
            <Input
              id="promo-min-purchase"
              type="number"
              min="0"
              value={minPurchase}
              onChange={(e) => setMinPurchase(e.target.value)}
              placeholder="e.g. 200"
              className={formFieldInsetClassName()}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="promo-start-date" className={text.secondary}>
                Start Date (Optional)
              </Label>
              <Input
                id="promo-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={formFieldInsetClassName()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-end-date" className={text.secondary}>
                End Date (Optional)
              </Label>
              <Input
                id="promo-end-date"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className={formFieldInsetClassName()}
              />
            </div>
          </div>
          <Button
            type="submit"
            className={hubCtaClassName("crm", "w-full text-md")}
            disabled={isSaving}
          >
            {isSaving ? "Saving…" : editing ? "Save Changes" : "Create Promotion"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
