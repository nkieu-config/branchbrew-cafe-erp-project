import { differenceInCalendarDays, startOfDay } from "date-fns";
import type { Equipment, EquipmentStatus, EquipmentType } from "@/types/api";

export type EquipmentStatusFilter = "ALL" | EquipmentStatus;
export type EquipmentTypeFilter = "ALL" | EquipmentType;
export type EquipmentHighlightFilter = "ALL" | "due-soon";

export const EQUIPMENT_TYPE_OPTIONS = [
  { value: "ESPRESSO_MACHINE", label: "Espresso machine" },
  { value: "GRINDER", label: "Grinder" },
  { value: "BLENDER", label: "Blender" },
  { value: "POS_SYSTEM", label: "POS system" },
  { value: "REFRIGERATOR", label: "Refrigerator" },
  { value: "OTHER", label: "Other" },
] as const;

export function equipmentTypeLabel(type: EquipmentType | string): string {
  const match = EQUIPMENT_TYPE_OPTIONS.find((option) => option.value === type);
  if (match) return match.label;
  return String(type).replace(/_/g, " ").toLowerCase();
}

export function equipmentStatusLabel(status: EquipmentStatus | string): string {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "MAINTENANCE":
      return "In maintenance";
    case "BROKEN":
      return "Broken";
    case "RETIRED":
      return "Retired";
    default:
      return String(status).replace(/_/g, " ").toLowerCase();
  }
}

export function daysUntilMaintenance(date: string | null | undefined): number | null {
  if (!date) return null;
  return differenceInCalendarDays(startOfDay(new Date(date)), startOfDay(new Date()));
}

export function isMaintenanceOverdue(date: string | null | undefined): boolean {
  const days = daysUntilMaintenance(date);
  return days != null && days < 0;
}

export function isMaintenanceDueSoon(
  date: string | null | undefined,
  withinDays = 7,
): boolean {
  const days = daysUntilMaintenance(date);
  return days != null && days >= 0 && days <= withinDays;
}

export function summarizeEquipment(equipment: Equipment[]) {
  let active = 0;
  let maintenance = 0;
  let broken = 0;
  let retired = 0;
  let dueSoon = 0;

  for (const item of equipment) {
    switch (item.status) {
      case "ACTIVE":
        active += 1;
        break;
      case "MAINTENANCE":
        maintenance += 1;
        break;
      case "BROKEN":
        broken += 1;
        break;
      case "RETIRED":
        retired += 1;
        break;
    }
    if (
      item.status === "ACTIVE" &&
      (isMaintenanceDueSoon(item.nextMaintenanceDate) ||
        isMaintenanceOverdue(item.nextMaintenanceDate))
    ) {
      dueSoon += 1;
    }
  }

  return {
    total: equipment.length,
    active,
    maintenance,
    broken,
    retired,
    dueSoon,
  };
}

export function matchesEquipmentStatusFilter(
  item: Equipment,
  filter: EquipmentStatusFilter,
): boolean {
  return filter === "ALL" || item.status === filter;
}

export function matchesEquipmentTypeFilter(
  item: Equipment,
  filter: EquipmentTypeFilter,
): boolean {
  return filter === "ALL" || item.type === filter;
}

export function matchesEquipmentHighlightFilter(
  item: Equipment,
  filter: EquipmentHighlightFilter,
): boolean {
  if (filter === "ALL") return true;
  return (
    item.status === "ACTIVE" &&
    (isMaintenanceDueSoon(item.nextMaintenanceDate) ||
      isMaintenanceOverdue(item.nextMaintenanceDate))
  );
}

export function matchesEquipmentSearch(item: Equipment, search: string): boolean {
  if (!search) return true;
  const haystack = [
    item.name,
    item.type,
    equipmentTypeLabel(item.type),
    item.status,
    equipmentStatusLabel(item.status),
    item.serialNumber ?? "",
    item.branch?.name ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(search);
}

export function filterEquipment(
  equipment: Equipment[],
  options: {
    statusFilter: EquipmentStatusFilter;
    typeFilter: EquipmentTypeFilter;
    highlightFilter: EquipmentHighlightFilter;
    search: string;
  },
): Equipment[] {
  return equipment.filter(
    (item) =>
      matchesEquipmentStatusFilter(item, options.statusFilter) &&
      matchesEquipmentTypeFilter(item, options.typeFilter) &&
      matchesEquipmentHighlightFilter(item, options.highlightFilter) &&
      matchesEquipmentSearch(item, options.search),
  );
}
