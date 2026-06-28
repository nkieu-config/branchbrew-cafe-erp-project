export type HrPayrollQuery = {
  employee?: number;
};

export type HrShiftsQuery = {
  employee?: number;
  date?: string;
};

export type HrLeaveQuery = {
  status?: "PENDING" | "APPROVED" | "REJECTED";
};

export function buildHrPayrollUrl(query?: HrPayrollQuery): string {
  const params = new URLSearchParams();
  if (query?.employee != null) params.set("employee", String(query.employee));
  const qs = params.toString();
  return qs ? `/hr/payroll?${qs}` : "/hr/payroll";
}

export function buildHrShiftsUrl(query?: HrShiftsQuery): string {
  const params = new URLSearchParams();
  if (query?.employee != null) params.set("employee", String(query.employee));
  if (query?.date) params.set("date", query.date);
  const qs = params.toString();
  return qs ? `/hr/shifts?${qs}` : "/hr/shifts";
}

export function buildHrLeaveUrl(query?: HrLeaveQuery): string {
  const params = new URLSearchParams();
  if (query?.status) params.set("status", query.status);
  const qs = params.toString();
  return qs ? `/hr/leave?${qs}` : "/hr/leave";
}

export function buildHrEmployeesUrl(query?: { employee?: number }): string {
  const params = new URLSearchParams();
  if (query?.employee != null) params.set("employee", String(query.employee));
  const qs = params.toString();
  return qs ? `/hr/employees?${qs}` : "/hr/employees";
}

export function parseHrPayrollSearchParams(searchParams: URLSearchParams): {
  employeeId: number | null;
} {
  const raw = searchParams.get("employee");
  if (!raw) return { employeeId: null };
  const employeeId = Number(raw);
  return { employeeId: Number.isFinite(employeeId) && employeeId > 0 ? employeeId : null };
}

export function parseHrLeaveSearchParams(searchParams: URLSearchParams): {
  statusFilter: "ALL" | "PENDING" | "APPROVED" | "REJECTED";
} {
  const status = searchParams.get("status");
  if (status === "PENDING" || status === "APPROVED" || status === "REJECTED") {
    return { statusFilter: status };
  }
  return { statusFilter: "ALL" };
}

export function parseHrShiftsSearchParams(searchParams: URLSearchParams): {
  employeeId: number | null;
  date: string | null;
} {
  const { employeeId } = parseHrPayrollSearchParams(searchParams);
  const date = searchParams.get("date");
  return {
    employeeId,
    date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
  };
}
