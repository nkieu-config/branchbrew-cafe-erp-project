import type { HubId } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const hubAccentClass: Record<HubId, string> = {
  inventory: "text-hub-inventory",
  procurement: "text-hub-procurement",
  hr: "text-hub-hr",
  products: "text-hub-products",
  kitchen: "text-hub-kitchen",
  crm: "text-hub-crm",
  finance: "text-hub-finance",
  assets: "text-hub-assets",
  pos: "text-hub-pos",
  settings: "text-hub-settings",
  organization: "text-hub-organization",
};

/** Hub header icon — accent color comes from CSS variables in tokens.css */
export function hubAccentIconClass(hubId: HubId, className?: string) {
  const size = hubId === "kitchen" ? "w-7 h-7" : "w-6 h-6";
  return cn(size, hubAccentClass[hubId], className);
}

/** Card heading icon accent */
export function hubCardIconClass(hubId?: HubId) {
  return cn("w-5 h-5", hubId ? hubAccentClass[hubId] : "text-hub-products");
}
