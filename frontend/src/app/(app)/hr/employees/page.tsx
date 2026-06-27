"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useHrUsers, useUpdateHourlyRate } from "@/hooks/domains/useHrQueries";
import { Avatar } from "antd";
import { Users, UserCog, Edit3 } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";
import { HubCard } from "@/components/shared/hub-card";
import { BranchEmptyState } from "@/components/shared/branch-empty-state";
import { DataTable } from "@/components/shared/data-table";
import { TableActionButton } from "@/components/shared/table-action-button";
import { StatusBadge, employeeRoleTone } from "@/components/shared/status-badge";
import { User } from "@/types/api";
import { formatBaht } from "@/lib/money";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EmployeeDirectoryPage() {
  const { user, activeBranchId } = useAuth();
  const role = user?.role;
  const branchIdNum = activeBranchId ? Number(activeBranchId) : undefined;

  const { data: usersData, isLoading } = useHrUsers(branchIdNum);
  const updateHourlyRateMutation = useUpdateHourlyRate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [hourlyRate, setHourlyRate] = useState("");

  const employees = usersData || [];

  const handleEditRate = (record: User) => {
    setSelectedUser(record);
    setHourlyRate(String(record.hourlyRate ?? ""));
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async () => {
    if (!selectedUser) return;
    const rate = Number(hourlyRate);
    if (Number.isNaN(rate) || rate < 0) {
      toast.error("Hourly rate is required");
      return;
    }
    try {
      await updateHourlyRateMutation.mutateAsync({ userId: selectedUser.id, hourlyRate: rate });
      toast.success("Hourly rate updated successfully");
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update hourly rate"));
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const columns = [
    {
      title: "Employee",
      key: "employee",
      render: (_: unknown, record: User) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-violet-500 font-bold">{record.name?.charAt(0) || "U"}</Avatar>
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-200">{record.name || "Unknown User"}</div>
            <div className="text-xs text-slate-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (text: string) => (
        <StatusBadge tone={employeeRoleTone(text)} className="font-bold">
          {text}
        </StatusBadge>
      ),
    },
    {
      title: "Type",
      dataIndex: "employmentType",
      key: "type",
      render: (text: string) => (
        <span className="text-slate-600 dark:text-slate-300">
          {text ? text.replace("_", " ") : "N/A"}
        </span>
      ),
    },
    {
      title: "Branch",
      dataIndex: ["branch", "name"],
      key: "branch",
      render: (text: string) =>
        text ? (
          <StatusBadge tone="category">{text}</StatusBadge>
        ) : (
          <span className="text-slate-400">HQ / All</span>
        ),
    },
    {
      title: "Hourly Rate",
      dataIndex: "hourlyRate",
      key: "rate",
      align: "right" as const,
      render: (val: number | string) => (
        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
          {formatBaht(val)} / hr
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "right" as const,
      render: (_: unknown, record: User) => {
        if (role === "SUPER_ADMIN" || role === "MANAGER") {
          return (
            <TableActionButton
              icon={Edit3}
              label="Edit Rate"
              onClick={() => handleEditRate(record)}
              className="text-indigo-600 hover:text-indigo-800"
            />
          );
        }
        return null;
      },
    },
  ];

  if (!activeBranchId) {
    return (
      <BranchEmptyState description="Select a branch in the top bar to view the employee directory." />
    );
  }

  return (
    <>
      <HubCard
        title="Employee Directory"
        icon={Users}
        description="View staff details and manage compensation rates. Login accounts are managed separately."
      >
        {role === "SUPER_ADMIN" && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 -mt-2">
            To create login accounts or reset passwords, go to{" "}
            <Link href="/organization/users" className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
              Organization → Users &amp; Roles
            </Link>
            .
          </p>
        )}
        <DataTable
          columns={columns}
          dataSource={employees}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 15 }}
        />
      </HubCard>

      <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5" />
              Edit Compensation
            </DialogTitle>
          </DialogHeader>

          <div className="mb-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <Avatar size="large" className="bg-violet-500 font-bold">
              {selectedUser?.name?.charAt(0)}
            </Avatar>
            <div>
              <div className="font-bold">{selectedUser?.name}</div>
              <div className="text-sm text-slate-500">{selectedUser?.role}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourly-rate">Hourly Rate (฿)</Label>
            <Input
              id="hourly-rate"
              type="number"
              min={0}
              step={1}
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
            <p className="text-xs text-slate-500">
              This rate is used to calculate payroll based on total clocked hours.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={updateHourlyRateMutation.isPending}
              onClick={() => void handleUpdateSubmit()}
            >
              {updateHourlyRateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
