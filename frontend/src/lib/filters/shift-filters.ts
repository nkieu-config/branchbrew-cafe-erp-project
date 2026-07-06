import { endOfDay, isWithinInterval, startOfDay } from "date-fns";
import type { Shift, ShiftStatus, User } from "@/types/api";

export type ShiftStatusFilter = "ALL" | ShiftStatus;

export type ShiftWithUser = Shift & { user?: User };

export function shiftStatusLabel(status: string): string {
  switch (status) {
    case "SCHEDULED":
      return "Scheduled";
    case "COMPLETED":
      return "Completed";
    case "ABSENT":
      return "Absent";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status.replace(/_/g, " ").toLowerCase();
  }
}

export function getShiftsForDate(shifts: ShiftWithUser[], date: Date): ShiftWithUser[] {
  const start = startOfDay(date);
  const end = endOfDay(date);
  return shifts.filter((shift) => {
    const startTime = new Date(shift.startTime);
    return isWithinInterval(startTime, { start, end });
  });
}

export function summarizeShifts(shifts: ShiftWithUser[]) {
  let scheduled = 0;
  let completed = 0;
  let absent = 0;
  let cancelled = 0;

  for (const shift of shifts) {
    switch (shift.status) {
      case "SCHEDULED":
        scheduled += 1;
        break;
      case "COMPLETED":
        completed += 1;
        break;
      case "ABSENT":
        absent += 1;
        break;
      case "CANCELLED":
        cancelled += 1;
        break;
    }
  }

  return {
    total: shifts.length,
    scheduled,
    completed,
    absent,
    cancelled,
  };
}

export function matchesShiftStatusFilter(shift: ShiftWithUser, filter: ShiftStatusFilter): boolean {
  return filter === "ALL" || shift.status === filter;
}

export function matchesShiftEmployeeFilter(
  shift: ShiftWithUser,
  employeeId: number | null,
): boolean {
  if (employeeId == null) return true;
  return shift.userId === employeeId;
}

export function filterShifts(
  shifts: ShiftWithUser[],
  options: {
    date: Date;
    statusFilter: ShiftStatusFilter;
    employeeId: number | null;
  },
): ShiftWithUser[] {
  return getShiftsForDate(shifts, options.date).filter(
    (shift) =>
      matchesShiftStatusFilter(shift, options.statusFilter) &&
      matchesShiftEmployeeFilter(shift, options.employeeId),
  );
}

export type ShiftUserRow = {
  userId: number;
  userName: string;
  shifts: ShiftWithUser[];
};

export function groupShiftsByUserId(shifts: ShiftWithUser[]): ShiftUserRow[] {
  const byUser = new Map<number, ShiftUserRow>();

  for (const shift of shifts) {
    const userId = shift.userId;
    const userName = shift.user?.name ?? `Employee #${userId}`;
    const existing = byUser.get(userId);
    if (existing) {
      existing.shifts.push(shift);
    } else {
      byUser.set(userId, { userId, userName, shifts: [shift] });
    }
  }

  return Array.from(byUser.values()).sort((a, b) =>
    a.userName.localeCompare(b.userName),
  );
}

export const GANTT_HOURS_START = 6;
export const GANTT_HOURS_END = 22;

export function ganttHourRange(): number[] {
  return Array.from(
    { length: GANTT_HOURS_END - GANTT_HOURS_START + 1 },
    (_, i) => i + GANTT_HOURS_START,
  );
}

export function calculateGanttLeftPercent(date: string | Date): number {
  const d = new Date(date);
  const h = d.getHours() + d.getMinutes() / 60;
  if (h < GANTT_HOURS_START) return 0;
  if (h > GANTT_HOURS_END) return 100;
  return ((h - GANTT_HOURS_START) / (GANTT_HOURS_END - GANTT_HOURS_START)) * 100;
}

export function calculateGanttWidthPercent(start: string | Date, end: string | Date): number {
  const s = new Date(start);
  const e = new Date(end);
  let sh = s.getHours() + s.getMinutes() / 60;
  let eh = e.getHours() + e.getMinutes() / 60;

  if (sh < GANTT_HOURS_START) sh = GANTT_HOURS_START;
  if (eh > GANTT_HOURS_END) eh = GANTT_HOURS_END;

  const width = ((eh - sh) / (GANTT_HOURS_END - GANTT_HOURS_START)) * 100;
  return Math.max(0, width);
}
