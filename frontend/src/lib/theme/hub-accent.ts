import type { HubId } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/** Readable hub icon accents — use `-icon` tokens, not pastel `--hub-*` CTA fills. */
const hubIconAccentClass: Record<HubId, string> = {
  inventory: "text-hub-inventory-icon",
  procurement: "text-hub-procurement-icon",
  hr: "text-hub-hr-icon",
  products: "text-hub-products-icon",
  kitchen: "text-hub-kitchen-icon",
  crm: "text-hub-crm-icon",
  finance: "text-hub-finance-icon",
  assets: "text-hub-assets-icon",
  pos: "text-hub-pos-icon",
  settings: "text-hub-settings-icon",
  organization: "text-hub-organization-icon",
};

/** Hub header icon — accent color comes from CSS variables in tokens.css */
export function hubAccentIconClass(hubId: HubId, className?: string) {
  const size = hubId === "kitchen" ? "w-7 h-7" : "w-6 h-6";
  return cn(size, hubIconAccentClass[hubId], className);
}

/** Card / modal heading icon accent */
export function hubCardIconClass(hubId?: HubId, className?: string) {
  return cn("w-5 h-5", hubId ? hubIconAccentClass[hubId] : "text-hub-products-icon", className);
}
