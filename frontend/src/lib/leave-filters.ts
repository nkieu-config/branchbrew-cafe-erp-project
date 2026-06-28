import { differenceInCalendarDays } from "date-fns";
import type { LeaveRequest, LeaveStatus, LeaveType } from "@/types/api";

export type LeaveStatusFilter = "ALL" | LeaveStatus;
export type LeaveTypeFilter = "ALL" | LeaveType;

export function leaveTypeLabel(type: LeaveType | string): string {
  switch (type) {
    case "SICK":
      return "Sick leave";
    case "ANNUAL":
      return "Annual leave";
    case "UNPAID":
      return "Unpaid leave";
    default:
      return String(type).replace(/_/g, " ").toLowerCase();
  }
}

export function leaveStatusLabel(status: LeaveStatus | string): string {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    default:
      return String(status).replace(/_/g, " ").toLowerCase();
  }
}

export function leaveDurationDays(startDate: string, endDate: string): number {
  const days = differenceInCalendarDays(new Date(endDate), new Date(startDate));
  return Math.max(1, days + 1);
}

export function summarizeLeaveRequests(requests: LeaveRequest[]) {
  let pending = 0;
  let approved = 0;
  let rejected = 0;
  let sick = 0;
  let annual = 0;
  let unpaid = 0;

  for (const request of requests) {
    switch (request.status) {
      case "PENDING":
        pending += 1;
        break;
      case "APPROVED":
        approved += 1;
        break;
      case "REJECTED":
        rejected += 1;
        break;
    }
    switch (request.type) {
      case "SICK":
        sick += 1;
        break;
      case "ANNUAL":
        annual += 1;
        break;
      case "UNPAID":
        unpaid += 1;
        break;
    }
  }

  return {
    total: requests.length,
    pending,
    approved,
    rejected,
    sick,
    annual,
    unpaid,
  };
}

export function matchesLeaveStatusFilter(
  request: LeaveRequest,
  filter: LeaveStatusFilter,
): boolean {
  return filter === "ALL" || request.status === filter;
}

export function matchesLeaveTypeFilter(
  request: LeaveRequest,
  filter: LeaveTypeFilter,
): boolean {
  return filter === "ALL" || request.type === filter;
}

export function matchesLeaveSearch(request: LeaveRequest, search: string): boolean {
  if (!search) return true;
  const haystack = [
    request.user?.name ?? "",
    request.user?.email ?? "",
    request.type,
    request.status,
    request.reason ?? "",
    leaveTypeLabel(request.type),
    leaveStatusLabel(request.status),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(search);
}

export function filterLeaveRequests(
  requests: LeaveRequest[],
  options: {
    statusFilter: LeaveStatusFilter;
    typeFilter: LeaveTypeFilter;
    search: string;
  },
): LeaveRequest[] {
  return requests.filter(
    (request) =>
      matchesLeaveStatusFilter(request, options.statusFilter) &&
      matchesLeaveTypeFilter(request, options.typeFilter) &&
      matchesLeaveSearch(request, options.search),
  );
}
