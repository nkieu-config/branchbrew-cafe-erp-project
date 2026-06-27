import { cn } from "@/lib/utils";
import { statusToneClassName, type StatusTone } from "@/lib/theme";

export type { StatusTone as StatusBadgeTone };

export function StatusBadge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: StatusTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        statusToneClassName(tone),
        className,
      )}
    >
      {children}
    </span>
  );
}

export function roleTone(role: string): StatusTone {
  switch (role) {
    case "SUPER_ADMIN":
      return "purple";
    case "MANAGER":
      return "blue";
    default:
      return "neutral";
  }
}

export function employeeRoleTone(role: string): StatusTone {
  switch (role) {
    case "SUPER_ADMIN":
      return "purple";
    case "MANAGER":
      return "purple";
    case "STAFF":
      return "blue";
    default:
      return "neutral";
  }
}

export function payrollStatusTone(status: string): StatusTone {
  switch (status) {
    case "APPROVED":
      return "success";
    case "PAID":
      return "info";
    case "DRAFT":
      return "neutral";
    default:
      return "warning";
  }
}

export function orderStatusTone(status: string): StatusTone {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "PENDING":
    case "PREPARING":
      return "info";
    case "CANCELLED":
      return "danger";
    case "REFUNDED":
      return "warning";
    default:
      return "neutral";
  }
}

export function leaveStatusTone(status: string): StatusTone {
  switch (status) {
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "danger";
    default:
      return "warning";
  }
}

export function auditActionTone(action: string): StatusTone {
  if (action.includes("CREATE")) return "info";
  if (action.includes("APPROVE")) return "success";
  if (action.includes("REJECT") || action.includes("DELETE")) return "danger";
  if (action.includes("UPDATE") || action.includes("RECEIVE")) return "warning";
  return "neutral";
}

export function poStatusTone(status: string): StatusTone {
  switch (status) {
    case "APPROVED":
      return "info";
    case "RECEIVED":
      return "success";
    case "PENDING":
      return "warning";
    default:
      return "neutral";
  }
}

export function transferStatusTone(status: string): StatusTone {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "PENDING":
      return "warning";
    case "SHIPPED":
      return "info";
    case "CANCELLED":
      return "danger";
    default:
      return "neutral";
  }
}

export function journalStatusTone(status: string): StatusTone {
  return status === "POSTED" ? "success" : "neutral";
}

export function settlementStatusTone(status: string): StatusTone {
  return status === "APPROVED" ? "success" : "warning";
}

export function equipmentStatusTone(status: string): StatusTone {
  switch (status) {
    case "OPERATIONAL":
      return "success";
    case "NEEDS_MAINTENANCE":
      return "warning";
    case "OUT_OF_ORDER":
      return "danger";
    default:
      return "neutral";
  }
}

export function accountTypeTone(type: string): StatusTone {
  switch (type) {
    case "ASSET":
      return "blue";
    case "LIABILITY":
      return "danger";
    case "EQUITY":
      return "purple";
    case "REVENUE":
      return "success";
    case "EXPENSE":
      return "warning";
    default:
      return "neutral";
  }
}
