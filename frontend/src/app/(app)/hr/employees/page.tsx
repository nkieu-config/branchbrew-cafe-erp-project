"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useHrUsers, useUpdateHourlyRate } from "@/hooks/domains/useHrQueries";
import { useBranches } from "@/hooks/domains/useGeneralQueries";
import { Avatar } from "antd";
import { Users, UserCog, Edit3 } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";
import { HubCard } from "@/components/shared/hub-card";
import { BranchEmptyState } from "@/components/shared/branch-empty-state";
import { DataTable } from "@/components/shared/data-table";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { TableActionButton } from "@/components/shared/table-action-button";
import { StatusBadge, employeeRoleTone } from "@/components/shared/status-badge";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { User, Branch } from "@/types/api";
import { formatBaht } from "@/lib/money";
import {
  expandedRowPanelClassName,
  formLineRowClassName,
  hrAvatarClassName,
  hubInfoActionClassName,
  inlineLinkClassName,
  metricValueClassName,
  tableActionAccentClassName,
  tableCellMutedClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";
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
  const { data: branches = [] } = useBranches();
  const branchIdNum = activeBranchId ? Number(activeBranchId) : undefined;
  const branchName = (branches as Branch[]).find((b) => b.id === branchIdNum)?.name;

  const {
    data: usersData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useHrUsers(branchIdNum);
  const updateHourlyRateMutation = useUpdateHourlyRate();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 300);
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [hourlyRate, setHourlyRate] = useState("");

  const employees = usersData || [];

  const filteredEmployees = useMemo(() => {
    return employees.filter((record: User) => {
      const matchesRole = roleFilter === "ALL" || record.role === roleFilter;
      if (!debouncedSearch) return matchesRole;
      const haystack = [record.name, record.email, record.role, record.branch?.name ?? ""]
        .join(" ")
        .toLowerCase();
      return matchesRole && haystack.includes(debouncedSearch);
    });
  }, [employees, debouncedSearch, roleFilter]);

  const hasActiveFilters = search.trim().length > 0 || roleFilter !== "ALL";

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
          <Avatar className={hrAvatarClassName()}>{record.name?.charAt(0) || "U"}</Avatar>
          <div>
            <div className={`font-bold ${text.primary}`}>{record.name || "Unknown User"}</div>
            <div className={`text-xs ${tableCellMutedClassName()}`}>{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (roleText: string) => (
        <StatusBadge tone={employeeRoleTone(roleText)} className="font-bold">
          {roleText}
        </StatusBadge>
      ),
    },
    {
      title: "Type",
      dataIndex: "employmentType",
      key: "type",
      render: (typeText: string) => (
        <span className={text.subtle}>
          {typeText ? typeText.replace("_", " ") : "N/A"}
        </span>
      ),
    },
    {
      title: "Branch",
      dataIndex: ["branch", "name"],
      key: "branch",
      render: (branchName: string) =>
        branchName ? (
          <StatusBadge tone="category">{branchName}</StatusBadge>
        ) : (
          <span className={text.muted}>HQ / All</span>
        ),
    },
    {
      title: "Hourly Rate",
      dataIndex: "hourlyRate",
      key: "rate",
      align: "right" as const,
      render: (val: number | string) => (
        <span className={`font-mono font-bold ${metricValueClassName("emerald")}`}>
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
              className={tableActionAccentClassName("indigo")}
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
          <p className={`text-sm mb-4 -mt-2 ${text.muted}`}>
            To create login accounts or reset passwords, go to{" "}
            <Link href="/organization/users" className={inlineLinkClassName()}>
              Organization → Users &amp; Roles
            </Link>
            .
          </p>
        )}
        <ListToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search employees…"
          branchName={branchName}
          showReset={hasActiveFilters}
          onReset={() => {
            setSearch("");
            setRoleFilter("ALL");
          }}
          filters={
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={cn(
                "min-h-[44px] rounded-md border px-3 text-sm",
                "border-[var(--border)] bg-[var(--table-container-bg)] text-[var(--foreground)]",
              )}
              aria-label="Filter by role"
            >
              <option value="ALL">All roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="STAFF">Staff</option>
            </select>
          }
        />
        <DataTable
          columns={columns}
          dataSource={filteredEmployees}
          rowKey="id"
          loading={isLoading}
          isError={isError}
          errorMessage={getErrorMessage(error, "Failed to load employees")}
          onRetry={() => void refetch()}
          retryLoading={isFetching}
          emptyDescription={
            hasActiveFilters ? "No employees match your filters." : "No employees found for this branch."
          }
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

          <div className={`mb-4 flex items-center gap-3 ${formLineRowClassName("items-center")}`}>
            <Avatar size="large" className={hrAvatarClassName()}>
              {selectedUser?.name?.charAt(0)}
            </Avatar>
            <div>
              <div className="font-bold">{selectedUser?.name}</div>
              <div className={`text-sm ${text.muted}`}>{selectedUser?.role}</div>
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
            <p className={`text-xs ${text.muted}`}>
              This rate is used to calculate payroll based on total clocked hours.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="button"
              className={hubInfoActionClassName()}
              disabled={updateHourlyRateMutation.isPending}
              onClick={() => void handleUpdateSubmit()}
            >
              {updateHourlyRateMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
