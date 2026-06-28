import type { AuditLog, User } from "@/types/api";

export type AuditActionCategory = "ALL" | "create" | "update" | "delete" | "approve" | "other";
export type AuditTargetTypeFilter = "ALL" | string;

export type AuditLogRow = AuditLog & { user?: User };

const AUDIT_ACRONYMS = new Set(["PO", "QR", "HQ", "ID", "VAT", "KDS", "POS"]);

function titleCaseAuditToken(token: string): string {
  const upper = token.toUpperCase();
  if (AUDIT_ACRONYMS.has(upper)) return upper;
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

export function categorizeAuditAction(action: string): Exclude<AuditActionCategory, "ALL"> {
  const upper = action.toUpperCase();
  if (upper.includes("CREATE")) return "create";
  if (upper.includes("DELETE") || upper.includes("REJECT")) return "delete";
  if (upper.includes("APPROVE")) return "approve";
  if (
    upper.includes("UPDATE") ||
    upper.includes("RECEIVE") ||
    upper.includes("ACCEPT") ||
    upper.includes("ADD")
  ) {
    return "update";
  }
  return "other";
}

export function auditActionLabel(action: string): string {
  return action.split("_").map(titleCaseAuditToken).join(" ");
}

export function formatAuditDetails(details: string | null | undefined): {
  preview: string;
  display: string;
  isStructured: boolean;
} {
  if (!details?.trim()) {
    return {
      preview: "—",
      display: "No additional details recorded.",
      isStructured: false,
    };
  }

  try {
    const parsed = JSON.parse(details) as unknown;
    if (typeof parsed === "object" && parsed !== null) {
      const display = JSON.stringify(parsed, null, 2);
      const preview =
        Object.entries(parsed as Record<string, unknown>)
          .slice(0, 2)
          .map(([key, value]) => `${key}: ${String(value)}`)
          .join(" · ") || display.slice(0, 96);
      return { preview, display, isStructured: true };
    }
  } catch {
    // plain text fallback
  }

  const trimmed = details.trim();
  const preview = trimmed.length > 96 ? `${trimmed.slice(0, 96)}…` : trimmed;
  return { preview, display: trimmed, isStructured: false };
}

export function uniqueAuditTargetTypes(logs: AuditLogRow[]): string[] {
  return [...new Set(logs.map((log) => log.targetType))].sort((a, b) =>
    auditTargetTypeLabel(a).localeCompare(auditTargetTypeLabel(b)),
  );
}

export function auditTargetTypeLabel(targetType: string): string {
  return targetType
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function summarizeAuditLogs(logs: AuditLogRow[]) {
  let create = 0;
  let update = 0;
  let deleteCount = 0;
  let approve = 0;
  let other = 0;

  for (const log of logs) {
    switch (categorizeAuditAction(log.action)) {
      case "create":
        create += 1;
        break;
      case "update":
        update += 1;
        break;
      case "delete":
        deleteCount += 1;
        break;
      case "approve":
        approve += 1;
        break;
      default:
        other += 1;
    }
  }

  return {
    total: logs.length,
    create,
    update,
    delete: deleteCount,
    approve,
    other,
  };
}

export function matchesAuditActionFilter(log: AuditLogRow, filter: AuditActionCategory): boolean {
  if (filter === "ALL") return true;
  return categorizeAuditAction(log.action) === filter;
}

export function matchesAuditTargetTypeFilter(
  log: AuditLogRow,
  filter: AuditTargetTypeFilter,
): boolean {
  return filter === "ALL" || log.targetType === filter;
}

export function matchesAuditSearch(log: AuditLogRow, search: string): boolean {
  if (!search) return true;
  const haystack = [
    log.action,
    auditActionLabel(log.action),
    log.targetType,
    auditTargetTypeLabel(log.targetType),
    log.details ?? "",
    log.user?.name ?? "",
    log.user?.email ?? "",
    log.user?.role ?? "",
    log.targetId != null ? String(log.targetId) : "",
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(search);
}

export function filterAuditLogs(
  logs: AuditLogRow[],
  options: {
    search: string;
    actionFilter: AuditActionCategory;
    targetTypeFilter?: AuditTargetTypeFilter;
  },
): AuditLogRow[] {
  const targetTypeFilter = options.targetTypeFilter ?? "ALL";
  return logs.filter(
    (log) =>
      matchesAuditActionFilter(log, options.actionFilter) &&
      matchesAuditTargetTypeFilter(log, targetTypeFilter) &&
      matchesAuditSearch(log, options.search),
  );
}
