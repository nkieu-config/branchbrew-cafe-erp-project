import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusBadgeTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "purple"
  | "blue"
  | "category";

const toneClass: Record<StatusBadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  info: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  danger: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  purple: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  category: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
};

export function StatusBadge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: StatusBadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn("border-transparent font-medium", toneClass[tone], className)}>
      {children}
    </Badge>
  );
}

export function roleTone(role: string): StatusBadgeTone {
  switch (role) {
    case "SUPER_ADMIN":
      return "purple";
    case "MANAGER":
      return "blue";
    default:
      return "neutral";
  }
}

export function employeeRoleTone(role: string): StatusBadgeTone {
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

export function payrollStatusTone(status: string): StatusBadgeTone {
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

export function orderStatusTone(status: string): StatusBadgeTone {
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

export function leaveStatusTone(status: string): StatusBadgeTone {
  switch (status) {
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "danger";
    default:
      return "warning";
  }
}

export function auditActionTone(action: string): StatusBadgeTone {
  if (action.includes("CREATE")) return "info";
  if (action.includes("APPROVE")) return "success";
  if (action.includes("REJECT") || action.includes("DELETE")) return "danger";
  if (action.includes("UPDATE") || action.includes("RECEIVE")) return "warning";
  return "neutral";
}

export function poStatusTone(status: string): StatusBadgeTone {
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

export function transferStatusTone(status: string): StatusBadgeTone {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "PENDING":
      return "warning";
    case "CANCELLED":
      return "danger";
    default:
      return "neutral";
  }
}

export function journalStatusTone(status: string): StatusBadgeTone {
  return status === "POSTED" ? "success" : "neutral";
}

export function accountTypeTone(type: string): StatusBadgeTone {
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
