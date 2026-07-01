"use client";

import { useCallback, useEffect, useMemo, useState, useDeferredValue } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { HubListPage } from "@/components/shared/hub-list-page";
import { ListFilterSelect } from "@/components/shared/list-filters";
import { BranchEmptyState } from "@/components/shared/branch-empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  LeaveRequestsTable,
  type LeaveConfirmAction,
} from "@/components/hr/LeaveRequestsTable";
import { RequestLeaveModal } from "@/components/hr/RequestLeaveModal";
import {
  useCreateLeave,
  useLeaveRequests,
  useUpdateLeaveStatus,
} from "@/hooks/domains/useHrQueries";
import { getErrorMessage } from "@/lib/errors";
import {
  type LeaveStatusFilter,
  type LeaveTypeFilter,
  filterLeaveRequests,
  summarizeLeaveRequests,
} from "@/lib/leave-filters";
import { buildHrLeaveUrl, parseHrLeaveSearchParams } from "@/lib/hr-hub-url";
import { infoBannerClassName, infoBannerTextClassName } from "@/lib/theme/hub-banners";
import { hubCtaClassName } from "@/lib/theme/hub-primitives";
import { hrSectionPanelClassName } from "@/lib/theme/hub-hr";

export default function LeavePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeBranchId, user } = useAuth();
  const role = user?.role;
  const isManagerOrAdmin = role === "SUPER_ADMIN" || role === "MANAGER";
  const branchIdNum = activeBranchId ? Number(activeBranchId) : undefined;

  const initialStatus = parseHrLeaveSearchParams(searchParams).statusFilter;

  const {
    data: leaveRequests = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useLeaveRequests(branchIdNum, isManagerOrAdmin);

  const updateLeaveStatusMutation = useUpdateLeaveStatus();
  const createLeaveMutation = useCreateLeave();

  const [statusFilter, setStatusFilter] = useState<LeaveStatusFilter>(initialStatus);
  const [typeFilter, setTypeFilter] = useState<LeaveTypeFilter>("ALL");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<LeaveConfirmAction | null>(null);

  const leaveStatusParam = searchParams.get("status");

  useEffect(() => {
    setStatusFilter(parseHrLeaveSearchParams(
      new URLSearchParams(leaveStatusParam ? `status=${leaveStatusParam}` : ""),
    ).statusFilter);
  }, [leaveStatusParam]);

  const summary = useMemo(() => summarizeLeaveRequests(leaveRequests), [leaveRequests]);

  const filteredLeaveRequests = useMemo(
    () =>
      filterLeaveRequests(leaveRequests, {
        statusFilter,
        typeFilter,
        search: deferredSearch,
      }),
    [leaveRequests, statusFilter, typeFilter, deferredSearch],
  );

  const hasActiveFilters =
    statusFilter !== "ALL" || typeFilter !== "ALL" || search.trim().length > 0;

  const setStatusFilterAndUrl = useCallback(
    (next: LeaveStatusFilter) => {
      setStatusFilter(next);
      router.replace(
        buildHrLeaveUrl(next === "ALL" ? undefined : { status: next }),
        { scroll: false },
      );
    },
    [router],
  );

  const handleCreateLeave = async (payload: {
    type: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) => {
    if (new Date(payload.startDate) > new Date(payload.endDate)) {
      toast.error("End date must be on or after start date");
      return;
    }
    try {
      await createLeaveMutation.mutateAsync(payload);
      toast.success("Leave requested successfully");
      setIsModalOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to request leave"));
    }
  };

  const handleConfirmStatusUpdate = async () => {
    if (!confirmAction) return;
    const status = confirmAction.type === "approve" ? "APPROVED" : "REJECTED";
    try {
      await updateLeaveStatusMutation.mutateAsync({ id: confirmAction.id, status });
      toast.success(`Leave ${status.toLowerCase()}`);
      setConfirmAction(null);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update leave status"));
    }
  };

  if (!activeBranchId) {
    return (
      <BranchEmptyState description="Select a branch in the top bar to view and manage leave requests." />
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button className={hubCtaClassName("hr")} onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" aria-hidden />
          Request leave
        </Button>
      </div>

      <HubListPage className={hrSectionPanelClassName()}>
        {isManagerOrAdmin && summary.pending > 0 && initialStatus === "PENDING" && (
          <HubListPage.Banner>
            <div className={infoBannerClassName("py-3")}>
              <p className={infoBannerTextClassName()}>
                {summary.pending} request{summary.pending === 1 ? "" : "s"} awaiting approval
              </p>
            </div>
          </HubListPage.Banner>
        )}

        <HubListPage.Error
          message={isError ? getErrorMessage(error, "Failed to load leave requests") : undefined}
          onRetry={() => void refetch()}
          loading={isFetching}
        />

        <HubListPage.Toolbar
          search={isManagerOrAdmin ? search : undefined}
          onSearchChange={isManagerOrAdmin ? setSearch : undefined}
          searchPlaceholder="Search staff or reason…"
          showReset={hasActiveFilters}
          onReset={() => {
            setStatusFilterAndUrl("ALL");
            setTypeFilter("ALL");
            setSearch("");
          }}
          filters={
            <>
              <ListFilterSelect
                value={statusFilter}
                onValueChange={(value) => setStatusFilterAndUrl(value as LeaveStatusFilter)}
                ariaLabel="Filter by leave status"
                widthClassName="w-full sm:w-[180px]"
                options={[
                  { value: "ALL", label: "All statuses" },
                  { value: "PENDING", label: "Pending" },
                  { value: "APPROVED", label: "Approved" },
                  { value: "REJECTED", label: "Rejected" },
                ]}
              />
              <ListFilterSelect
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value as LeaveTypeFilter)}
                ariaLabel="Filter by leave type"
                widthClassName="w-full sm:w-[180px]"
                options={[
                  { value: "ALL", label: "All types" },
                  { value: "SICK", label: "Sick leave" },
                  { value: "ANNUAL", label: "Annual leave" },
                  { value: "UNPAID", label: "Unpaid leave" },
                ]}
              />
            </>
          }
        />

        <HubListPage.Count
          isLoading={isLoading}
          isError={isError}
          isFetching={isFetching}
          hasActiveFilters={hasActiveFilters}
          filteredCount={filteredLeaveRequests.length}
          totalCount={leaveRequests.length}
          itemLabel="request"
          emptyLabel="No leave requests yet"
        />

        <LeaveRequestsTable
          leaveRequests={filteredLeaveRequests}
          isManagerOrAdmin={isManagerOrAdmin}
          isLoading={isLoading}
          hasActiveFilters={hasActiveFilters}
          onConfirmAction={setConfirmAction}
        />
      </HubListPage>

      <RequestLeaveModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateLeave}
        isSubmitting={createLeaveMutation.isPending}
      />

      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={confirmAction?.type === "approve" ? "Approve leave?" : "Reject leave?"}
        description={
          confirmAction
            ? `${confirmAction.staffName} · ${confirmAction.dateRange}`
            : undefined
        }
        confirmLabel={confirmAction?.type === "approve" ? "Approve" : "Reject"}
        destructive={confirmAction?.type === "reject"}
        loading={updateLeaveStatusMutation.isPending}
        onConfirm={handleConfirmStatusUpdate}
      />
    </>
  );
}
