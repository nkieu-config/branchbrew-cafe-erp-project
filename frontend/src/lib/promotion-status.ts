import type { Promotion } from "@/types/api";
import type { StatusTone } from "@/lib/theme";

export type PromoValidity = "active" | "inactive" | "expired" | "scheduled";

export type PromoStatusFilter = "ALL" | PromoValidity;

export type PromoDiscountFilter = "ALL" | "PERCENTAGE" | "FIXED_AMOUNT";

export function getPromoValidity(
  promotion: Pick<Promotion, "isActive" | "startDate" | "endDate">,
  now = new Date(),
): PromoValidity {
  if (promotion.endDate && new Date(promotion.endDate) < now) return "expired";
  if (promotion.startDate && new Date(promotion.startDate) > now) return "scheduled";
  if (!promotion.isActive) return "inactive";
  return "active";
}

export function promoValidityLabel(validity: PromoValidity): string {
  switch (validity) {
    case "active":
      return "Active";
    case "inactive":
      return "Inactive";
    case "expired":
      return "Expired";
    case "scheduled":
      return "Scheduled";
  }
}

export function promoValidityTone(validity: PromoValidity): StatusTone {
  switch (validity) {
    case "active":
      return "success";
    case "inactive":
      return "neutral";
    case "expired":
      return "danger";
    case "scheduled":
      return "warning";
  }
}

export function isDuplicatePromoCodeError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("already exists") ||
    lower.includes("unique") ||
    lower.includes("duplicate")
  );
}

export function toDateInputValue(iso?: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function dateInputToIso(date: string, endOfDay = false): string | undefined {
  if (!date) return undefined;
  return endOfDay
    ? new Date(`${date}T23:59:59.999`).toISOString()
    : new Date(`${date}T00:00:00`).toISOString();
}
