"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, CheckCircle, XCircle, CalendarOff } from "lucide-react";
import { HubCard } from "@/components/shared/hub-card";
import { BranchEmptyState } from "@/components/shared/branch-empty-state";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge, leaveStatusTone } from "@/components/shared/status-badge";
import { TableActionButton } from "@/components/shared/table-action-button";
import { LeaveRequest } from "@/types/api";
import { useLeaveRequests, useUpdateLeaveStatus, useCreateLeave } from "@/hooks/domains/useHrQueries";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";
import { useState } from "react";
import { DatePicker } from "antd";
import type { Dayjs } from "dayjs";

const LEAVE_TYPES = [
  { value: "SICK", label: "Sick Leave" },
  { value: "ANNUAL", label: "Annual Leave" },
  { value: "UNPAID", label: "Unpaid Leave" },
] as const;

export default function LeaveRequestsPage() {
  const { activeBranchId, user } = useAuth();
  const role = user?.role;
  const isManagerOrAdmin = role === "SUPER_ADMIN" || role === "MANAGER";
  const branchIdNum = activeBranchId ? Number(activeBranchId) : undefined;

  const { data: leaveRequests = [], isLoading } = useLeaveRequests(branchIdNum, isManagerOrAdmin);
  const updateLeaveStatusMutation = useUpdateLeaveStatus();
  const createLeaveMutation = useCreateLeave();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<string>("");
  const [dates, setDates] = useState<[Dayjs, Dayjs] | null>(null);
  const [reason, setReason] = useState("");

  const resetForm = () => {
    setLeaveType("");
    setDates(null);
    setReason("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const approveLeave = async (id: number, status: string) => {
    try {
      await updateLeaveStatusMutation.mutateAsync({ id, status });
      toast.success(`Leave status updated to ${status}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update leave status"));
    }
  };

  const handleCreateLeave = async () => {
    if (!leaveType) {
      toast.error("Please select leave type");
      return;
    }
    if (!dates?.[0] || !dates?.[1]) {
      toast.error("Please select dates");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    try {
      await createLeaveMutation.mutateAsync({
        type: leaveType,
        startDate: dates[0].toDate().toISOString(),
        endDate: dates[1].toDate().toISOString(),
        reason: reason.trim(),
      });
      toast.success("Leave requested successfully");
      closeModal();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to request leave"));
    }
  };

  if (!activeBranchId) {
    return (
      <BranchEmptyState description="Select a branch in the top bar to view and manage leave requests." />
    );
  }

  return (
    <>
      <HubCard
        title="Leave Requests"
        icon={CalendarOff}
        actions={
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Request Leave
          </Button>
        }
      >
        <DataTable
          columns={[
            ...(role === "SUPER_ADMIN" || role === "MANAGER"
              ? [{ title: "Staff", dataIndex: ["user", "name"], key: "staff" }]
              : []),
            { title: "Type", dataIndex: "type", key: "type" },
            {
              title: "Dates",
              key: "dates",
              render: (_: unknown, req: LeaveRequest) =>
                `${new Date(req.startDate).toLocaleDateString()} - ${new Date(req.endDate).toLocaleDateString()}`,
            },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              render: (status: string) => (
                <StatusBadge tone={leaveStatusTone(status)}>{status}</StatusBadge>
              ),
            },
            ...(role === "SUPER_ADMIN" || role === "MANAGER"
              ? [
                  {
                    title: "Actions",
                    key: "actions",
                    render: (_: unknown, req: LeaveRequest) =>
                      req.status === "PENDING" ? (
                        <div className="flex gap-1">
                          <TableActionButton
                            icon={CheckCircle}
                            onClick={() => approveLeave(req.id, "APPROVED")}
                            className="text-emerald-600 hover:text-emerald-700"
                          />
                          <TableActionButton
                            icon={XCircle}
                            onClick={() => approveLeave(req.id, "REJECTED")}
                            destructive
                          />
                        </div>
                      ) : null,
                  },
                ]
              : []),
          ]}
          dataSource={leaveRequests}
          rowKey="id"
          loading={isLoading}
        />
      </HubCard>

      <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarOff className="w-5 h-5" />
              Request Leave
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Leave Type</Label>
              <Select value={leaveType} onValueChange={(v) => v && setLeaveType(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {LEAVE_TYPES.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dates</Label>
              <DatePicker.RangePicker
                className="w-full h-10"
                value={dates}
                onChange={(vals) => setDates(vals as [Dayjs, Dayjs] | null)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="leave-reason">Reason</Label>
              <textarea
                id="leave-reason"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly explain your reason..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={createLeaveMutation.isPending}
              onClick={() => void handleCreateLeave()}
            >
              {createLeaveMutation.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
