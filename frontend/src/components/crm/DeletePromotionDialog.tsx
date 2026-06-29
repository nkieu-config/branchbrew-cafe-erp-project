"use client";

import { toast } from "sonner";
import { useDeletePromotion } from "@/hooks/domains/useCrmQueries";
import { getErrorMessage } from "@/lib/errors";
import type { Promotion } from "@/types/api";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

type DeletePromotionDialogProps = {
  promotion: Promotion | null;
  onOpenChange: (open: boolean) => void;
};

export function DeletePromotionDialog({ promotion, onOpenChange }: DeletePromotionDialogProps) {
  const deleteMutation = useDeletePromotion();

  const handleDelete = async () => {
    if (!promotion) return;
    try {
      await deleteMutation.mutateAsync(promotion.id);
      toast.success("Promotion deleted");
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete promotion"));
    }
  };

  return (
    <ConfirmDialog
      open={promotion != null}
      onOpenChange={onOpenChange}
      title="Delete promotion?"
      description={
        promotion ? `Remove promo code "${promotion.code}"? This cannot be undone.` : undefined
      }
      confirmLabel="Delete"
      destructive
      loading={deleteMutation.isPending}
      onConfirm={handleDelete}
    />
  );
}
