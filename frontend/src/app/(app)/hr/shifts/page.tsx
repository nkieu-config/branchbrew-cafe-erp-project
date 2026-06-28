"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { addDays, format, subDays } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useBranches } from "@/hooks/domains/useGeneralQueries";
import { useCreateShift, useHrUsers, useShifts } from "@/hooks/domains/useHrQueries";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Plus,
} from "lucide-react";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";
import { HubPageHeader } from "@/components/shared/hub-card";
import { BranchEmptyState } from "@/components/shared/branch-empty-state";
import { QueryErrorBanner } from "@/components/shared/query-error-banner";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { RoleGuard } from "@/components/RoleGuard";
import { AccessDeniedState } from "@/components/shared/access-denied-state";
import { HrHubLinks } from "@/components/hr/HrHubLinks";
import { CreateShiftModal } from "@/components/hr/CreateShiftModal";
import { ShiftGanttTimeline } from "@/components/hr/ShiftGanttTimeline";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Branch, ShiftStatus, User } from "@/types/api";
import {
  filterShifts,
  groupShiftsByUserId,
  summarizeShifts,
  type ShiftStatusFilter,
  type ShiftWithUser,
} from "@/lib/shift-filters";
import { parseHrShiftsSearchParams } from "@/lib/hr-hub-url";
import { formatDate } from "@/lib/intl-date";
import {
  formSelectContentClassName,
  ganttPanelClassName,
  hubCardIconFor,
  hubCtaClassName,
  hrSectionPanelClassName,
  hrSummaryChipClassName,
  hubLoadingSpinnerClassName,
  inlineLinkClassName,
  inventorySummaryStripClassName,
  listToolbarFieldClassName,
  metricValueClassName,
  shiftLegendSwatchClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

function toDateInputValue(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export default function EmployeesShiftsPage() {
  return (
    <RoleGuard
      allowedRoles={["SUPER_ADMIN", "MANAGER"]}
      fallback={
        <AccessDeniedState
          description="Manager or Super Admin access is required to manage shift schedules."
          backHref="/hr/attendance"
          backLabel="Back to Attendance"
        />
      }
    >
      <ShiftsPageContent />
    </RoleGuard>
  );
}

function ShiftsPageContent() {
  const { user, activeBranchId } = useAuth();
  const role = user?.role;
  const searchParams = useSearchParams();
  const urlState = useMemo(() => parseHrShiftsSearchParams(searchParams), [searchParams]);

  const { data: branches = [] } = useBranches();
  const branchIdNum = activeBranchId ? Number(activeBranchId) : undefined;
  const branchName = (branches as Branch[]).find((b) => b.id === branchIdNum)?.name;

  const {
    data: shiftsData = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useShifts(role, branchIdNum);
  const { data: employees = [] } = useHrUsers(branchIdNum);
  const createShiftMutation = useCreateShift();

  const [selectedDate, setSelectedDate] = useState(() => urlState.date ?? toDateInputValue(new Date()));
  const [statusFilter, setStatusFilter] = useState<ShiftStatusFilter>("ALL");
  const [employeeFilterId, setEmployeeFilterId] = useState<number | null>(urlState.employeeId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (urlState.date) setSelectedDate(urlState.date);
    if (urlState.employeeId != null) setEmployeeFilterId(urlState.employeeId);
  }, [urlState.date, urlState.employeeId]);

  const selectedDateObj = useMemo(() => new Date(`${selectedDate}T12:00:00`), [selectedDate]);

  const filteredShifts = useMemo(
    () =>
      filterShifts(shiftsData as ShiftWithUser[], {
        date: selectedDateObj,
        statusFilter,
        employeeId: employeeFilterId,
      }),
    [shiftsData, selectedDateObj, statusFilter, employeeFilterId],
  );

  const summary = useMemo(() => summarizeShifts(filteredShifts), [filteredShifts]);
  const ganttRows = useMemo(() => groupShiftsByUserId(filteredShifts), [filteredShifts]);

  const hasActiveFilters = statusFilter !== "ALL" || employeeFilterId != null;

  const toggleStatusFilter = (next: ShiftStatusFilter) => {
    setStatusFilter((current) => (current === next ? "ALL" : next));
  };

  const shiftDateLabel = formatDate(selectedDateObj);

  const handleCreateShift = async (payload: {
    userId: number;
    branchId: number;
    startTime: string;
    endTime: string;
  }) => {
    try {
      await createShiftMutation.mutateAsync(payload);
      toast.success("Shift scheduled");
      setIsModalOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to schedule shift"));
    }
  };

  if (!activeBranchId || !branchIdNum) {
    return (
      <BranchEmptyState description="Select a branch in the top bar to view and manage shift schedules." />
    );
  }

  return (
    <div className="space-y-6">
      <HubPageHeader
        hideTitle
        icon={CalendarDays}
        accentHub="hr"
        description="Manage time-block shift schedules. Shifts drive attendance late detection and payroll hours."
        actions={
          <HrHubLinks current="shifts" showOrgUsers={role === "SUPER_ADMIN"}>
            <Button
              className={hubCtaClassName("hr", "font-bold")}
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" aria-hidden />
              Schedule shift
            </Button>
          </HrHubLinks>
        }
      />

      <div className={hrSectionPanelClassName()}>
        {!isLoading && !isError && (
          <div
            className={inventorySummaryStripClassName()}
            aria-live="polite"
            aria-atomic="true"
          >
            <span className={cn("font-semibold tabular-nums", text.primary)}>
              {summary.total > 0
                ? `${summary.total} shift${summary.total === 1 ? "" : "s"} · ${shiftDateLabel}`
                : `${shiftDateLabel} — no shifts scheduled`}
            </span>
            {summary.scheduled > 0 && (
              <button
                type="button"
                className={hrSummaryChipClassName(
                  statusFilter === "SCHEDULED",
                  metricValueClassName("blue"),
                )}
                onClick={() => toggleStatusFilter("SCHEDULED")}
              >
                {summary.scheduled} scheduled
              </button>
            )}
            {summary.completed > 0 && (
              <button
                type="button"
                className={hrSummaryChipClassName(
                  statusFilter === "COMPLETED",
                  metricValueClassName("emerald"),
                )}
                onClick={() => toggleStatusFilter("COMPLETED")}
              >
                {summary.completed} completed
              </button>
            )}
            {summary.absent > 0 && (
              <button
                type="button"
                className={hrSummaryChipClassName(
                  statusFilter === "ABSENT",
                  metricValueClassName("red"),
                )}
                onClick={() => toggleStatusFilter("ABSENT")}
              >
                {summary.absent} absent
              </button>
            )}
            {summary.cancelled > 0 && (
              <button
                type="button"
                className={hrSummaryChipClassName(
                  statusFilter === "CANCELLED",
                  text.muted,
                )}
                onClick={() => toggleStatusFilter("CANCELLED")}
              >
                {summary.cancelled} cancelled
              </button>
            )}
            {isFetching && !isLoading && (
              <span className={cn("inline-flex items-center gap-1.5", text.muted)}>
                <Loader2
                  className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none"
                  aria-hidden
                />
                Updating…
              </span>
            )}
          </div>
        )}

        {!isLoading && !isError && (
          <div
            className={cn(
              "flex flex-wrap items-center gap-x-4 gap-y-2 text-xs",
              "pb-3 border-b border-[var(--table-row-border)]",
            )}
            aria-label="Shift status legend"
          >
            {(
              [
                ["SCHEDULED", "Scheduled"],
                ["COMPLETED", "Completed"],
                ["ABSENT", "Absent"],
                ["CANCELLED", "Cancelled"],
              ] as const
            ).map(([status, label]) => (
              <span
                key={status}
                className={cn("inline-flex items-center gap-1.5 font-medium", text.secondary)}
              >
                <span className={shiftLegendSwatchClassName(status)} aria-hidden />
                {label}
              </span>
            ))}
            <Link
              href="/hr/attendance"
              className={cn("inline-flex items-center gap-1 font-medium", inlineLinkClassName())}
            >
              <Clock className="w-3.5 h-3.5" aria-hidden />
              View attendance
            </Link>
          </div>
        )}

        {isError && (
          <QueryErrorBanner
            message={getErrorMessage(error, "Failed to load shifts")}
            onRetry={() => void refetch()}
            loading={isFetching}
          />
        )}

        <ListToolbar
          branchName={branchName}
          showReset={hasActiveFilters}
          onReset={() => {
            setStatusFilter("ALL");
            setEmployeeFilterId(null);
          }}
          filters={
            <>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="min-h-[44px] min-w-[44px] shrink-0"
                  aria-label="Previous day"
                  onClick={() =>
                    setSelectedDate(toDateInputValue(subDays(selectedDateObj, 1)))
                  }
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden />
                </Button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className={listToolbarFieldClassName("min-h-[44px] w-full sm:w-[160px]")}
                  aria-label="Shift date"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="min-h-[44px] min-w-[44px] shrink-0"
                  aria-label="Next day"
                  onClick={() =>
                    setSelectedDate(toDateInputValue(addDays(selectedDateObj, 1)))
                  }
                >
                  <ChevronRight className="w-4 h-4" aria-hidden />
                </Button>
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  if (value != null) setStatusFilter(value as ShiftStatusFilter);
                }}
              >
                <SelectTrigger
                  className={listToolbarFieldClassName("min-h-[44px] w-full sm:w-[180px]")}
                  aria-label="Filter by shift status"
                >
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  {( ["SCHEDULED", "COMPLETED", "ABSENT", "CANCELLED"] as ShiftStatus[]).map(
                    (status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              {employees.length > 0 && (
                <Select
                  value={employeeFilterId != null ? String(employeeFilterId) : "ALL"}
                  onValueChange={(value) => {
                    if (value == null) return;
                    setEmployeeFilterId(value === "ALL" ? null : Number(value));
                  }}
                >
                  <SelectTrigger
                    className={listToolbarFieldClassName("min-h-[44px] w-full sm:w-[200px]")}
                    aria-label="Filter by employee"
                  >
                    <SelectValue placeholder="All employees" />
                  </SelectTrigger>
                  <SelectContent className={formSelectContentClassName()}>
                    <SelectItem value="ALL">All employees</SelectItem>
                    {employees.map((employee: User) => (
                      <SelectItem key={employee.id} value={String(employee.id)}>
                        {employee.name ?? employee.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </>
          }
        />

        <div className={ganttPanelClassName()}>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className={hubLoadingSpinnerClassName("w-8 h-8")} aria-hidden />
              <span className="sr-only">Loading shift schedule…</span>
            </div>
          ) : !isError && ganttRows.length === 0 ? (
            <div className="py-16 text-center px-4">
              <CalendarDays className={hubCardIconFor("hr", "w-12 h-12 mx-auto mb-4")} />
              <p className={cn("font-semibold", text.primary)}>
                {hasActiveFilters ? "No shifts match your filters" : "No shifts scheduled"}
              </p>
              <p className={cn("text-sm mt-2 max-w-md mx-auto", text.muted)}>
                {hasActiveFilters
                  ? "Try another date, status, or employee filter."
                  : `No shifts on ${shiftDateLabel}. Schedule a block to populate the timeline.`}
              </p>
              {!hasActiveFilters && (
                <Button
                  className={cn("mt-6", hubCtaClassName("hr", "font-bold"))}
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" aria-hidden />
                  Schedule shift
                </Button>
              )}
            </div>
          ) : !isError ? (
            <ShiftGanttTimeline rows={ganttRows} />
          ) : null}
        </div>
      </div>

      <CreateShiftModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employees={employees}
        branchId={branchIdNum}
        defaultDate={selectedDate}
        onSubmit={handleCreateShift}
        isSubmitting={createShiftMutation.isPending}
      />
    </div>
  );
}
