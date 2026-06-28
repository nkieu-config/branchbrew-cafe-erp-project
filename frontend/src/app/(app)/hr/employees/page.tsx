"use client";

import { useCallback, useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useHrUsers, useUpdateHourlyRate } from "@/hooks/domains/useHrQueries";
import { useBranches } from "@/hooks/domains/useGeneralQueries";
import { Avatar } from "antd";
import { Loader2, Plus, Users, Edit3, UserSquare2 } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";
import { HubPageHeader } from "@/components/shared/hub-card";
import { BranchEmptyState } from "@/components/shared/branch-empty-state";
import { DataTable } from "@/components/shared/data-table";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { QueryErrorBanner } from "@/components/shared/query-error-banner";
import { TableActionButton } from "@/components/shared/table-action-button";
import { StatusBadge, employeeRoleTone } from "@/components/shared/status-badge";
import { HrHubLinks } from "@/components/hr/HrHubLinks";
import { EditCompensationModal } from "@/components/hr/EditCompensationModal";
import { ButtonLink } from "@/components/ui/button-link";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { Branch, User } from "@/types/api";
import { formatBaht } from "@/lib/money";
import {
  type EmployeeRateFilter,
  type EmployeeRoleFilter,
  type EmploymentTypeFilter,
  employeeHasMissingRate,
  filterEmployees,
  summarizeEmployees,
} from "@/lib/employee-filters";
import { buildHrPayrollUrl } from "@/lib/hr-hub-url";
import {
  expandedRowPanelClassName,
  formSelectContentClassName,
  hrAvatarClassName,
  hrSectionPanelClassName,
  hrSummaryChipClassName,
  hubCtaClassName,
  infoBannerClassName,
  infoBannerIconClassName,
  infoBannerTextClassName,
  infoBannerTitleClassName,
  inlineLinkClassName,
  inventorySummaryStripClassName,
  listToolbarFieldClassName,
  metricValueClassName,
  tableActionAccentClassName,
  tableCellMutedClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EmployeeDirectoryPage() {
  const { user, activeBranchId } = useAuth();
  const role = user?.role;
  const canEditCompensation = role === "SUPER_ADMIN" || role === "MANAGER";
  const canLinkPayroll = canEditCompensation;

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
  const [roleFilter, setRoleFilter] = useState<EmployeeRoleFilter>("ALL");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<EmploymentTypeFilter>("ALL");
  const [rateFilter, setRateFilter] = useState<EmployeeRateFilter>("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [hourlyRate, setHourlyRate] = useState("");

  const employees = usersData ?? [];

  const summary = useMemo(() => summarizeEmployees(employees), [employees]);

  const filteredEmployees = useMemo(
    () =>
      filterEmployees(employees, {
        search: debouncedSearch,
        roleFilter,
        employmentTypeFilter,
        rateFilter,
      }),
    [employees, debouncedSearch, roleFilter, employmentTypeFilter, rateFilter],
  );

  const hasActiveFilters =
    search.trim().length > 0 ||
    roleFilter !== "ALL" ||
    employmentTypeFilter !== "ALL" ||
    rateFilter !== "ALL";

  const toggleRoleFilter = (next: EmployeeRoleFilter) => {
    setRoleFilter((current) => (current === next ? "ALL" : next));
  };

  const toggleEmploymentFilter = (next: EmploymentTypeFilter) => {
    setEmploymentTypeFilter((current) => (current === next ? "ALL" : next));
  };

  const toggleRateFilter = () => {
    setRateFilter((current) => (current === "missing-rate" ? "ALL" : "missing-rate"));
  };

  const handleEditRate = useCallback((record: User) => {
    setSelectedUser(record);
    setHourlyRate(record.hourlyRate != null && record.hourlyRate > 0 ? String(record.hourlyRate) : "");
    setIsModalOpen(true);
  }, []);

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

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedUser(null);
  }, []);

  const columns = useMemo(
    () =>
      [
        {
          title: "Employee",
          key: "employee",
          render: (_: unknown, record: User) => (
            <div className="flex items-center gap-3">
              <Avatar className={hrAvatarClassName()}>{record.name?.charAt(0) || "U"}</Avatar>
              <div className="min-w-0">
                <div className={cn("font-bold truncate", text.primary)}>
                  {canLinkPayroll ? (
                    <Link href={buildHrPayrollUrl({ employee: record.id })} className={inlineLinkClassName()}>
                      {record.name || "Unknown User"}
                    </Link>
                  ) : (
                    record.name || "Unknown User"
                  )}
                </div>
                <div className={cn("text-xs truncate", tableCellMutedClassName())}>{record.email}</div>
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
          responsive: ["md"],
          render: (typeText: string) => (
            <span className={text.subtle}>
              {typeText ? typeText.replace("_", " ") : "Not set"}
            </span>
          ),
        },
        {
          title: "Branch",
          dataIndex: ["branch", "name"],
          key: "branch",
          responsive: ["lg"],
          render: (name: string) =>
            name ? (
              <StatusBadge tone="category">{name}</StatusBadge>
            ) : (
              <span className={text.muted}>HQ / All</span>
            ),
        },
        {
          title: "Hourly Rate",
          dataIndex: "hourlyRate",
          key: "rate",
          align: "right" as const,
          responsive: ["md"],
          render: (_: unknown, record: User) =>
            employeeHasMissingRate(record) ? (
              <StatusBadge tone="warning" className="tabular-nums font-bold">
                Not set
              </StatusBadge>
            ) : (
              <span className={cn("font-bold tabular-nums", metricValueClassName("emerald"))}>
                {formatBaht(record.hourlyRate)} / hr
              </span>
            ),
        },
        {
          title: "",
          key: "action",
          align: "right" as const,
          width: 72,
          render: (_: unknown, record: User) =>
            canEditCompensation ? (
              <TableActionButton
                icon={Edit3}
                label={`Edit rate for ${record.name ?? record.email}`}
                iconOnly
                onClick={() => handleEditRate(record)}
                className={tableActionAccentClassName("indigo")}
              />
            ) : null,
        },
      ] as ColumnsType<User>,
    [canEditCompensation, canLinkPayroll, handleEditRate],
  );

  const expandedRowRender = (record: User) => (
    <div className={expandedRowPanelClassName()}>
      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <dt className={cn("text-xs font-medium uppercase tracking-wide", text.muted)}>Email</dt>
          <dd className={cn("mt-1", text.primary)}>{record.email}</dd>
        </div>
        <div>
          <dt className={cn("text-xs font-medium uppercase tracking-wide", text.muted)}>
            Employment type
          </dt>
          <dd className={cn("mt-1", text.primary)}>
            {record.employmentType?.replace("_", " ") ?? "Not set"}
          </dd>
        </div>
        <div>
          <dt className={cn("text-xs font-medium uppercase tracking-wide", text.muted)}>
            Base salary
          </dt>
          <dd className={cn("mt-1 tabular-nums font-bold", metricValueClassName("blue"))}>
            {record.baseSalary != null && record.baseSalary > 0
              ? formatBaht(record.baseSalary)
              : "—"}
          </dd>
        </div>
      </dl>
      {canLinkPayroll && (
        <div className="mt-4">
          <Link href={buildHrPayrollUrl({ employee: record.id })} className={inlineLinkClassName()}>
            View payroll for this employee
          </Link>
        </div>
      )}
    </div>
  );

  if (!activeBranchId) {
    return (
      <BranchEmptyState description="Select a branch in the top bar to view the employee directory." />
    );
  }

  return (
    <>
      <HubPageHeader
        hideTitle
        icon={Users}
        accentHub="hr"
        description="View staff details and manage compensation rates. Login accounts are managed separately."
        actions={
          <HrHubLinks current="employees" showOrgUsers={role === "SUPER_ADMIN"}>
            {role === "SUPER_ADMIN" && (
              <ButtonLink href="/organization/users" className={hubCtaClassName("hr", "font-bold")}>
                <Plus className="w-4 h-4 mr-2" aria-hidden />
                Add user
              </ButtonLink>
            )}
          </HrHubLinks>
        }
      />

      <div className={hrSectionPanelClassName()}>
        {role === "SUPER_ADMIN" && (
          <div className={infoBannerClassName()}>
            <div className="flex items-start gap-3">
              <UserSquare2 className={infoBannerIconClassName()} aria-hidden />
              <div>
                <p className={infoBannerTitleClassName()}>Login accounts are managed separately</p>
                <p className={infoBannerTextClassName()}>
                  Create accounts, assign roles, or reset passwords in{" "}
                  <Link href="/organization/users" className={inlineLinkClassName()}>
                    Organization → Users &amp; Roles
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !isError && (
          <div
            className={inventorySummaryStripClassName()}
            aria-live="polite"
            aria-atomic="true"
          >
            <span className={cn("font-semibold tabular-nums", text.primary)}>
              {summary.total} employee{summary.total === 1 ? "" : "s"}
            </span>
            {summary.managers > 0 && (
              <button
                type="button"
                className={hrSummaryChipClassName(
                  roleFilter === "MANAGER",
                  metricValueClassName("purple"),
                )}
                onClick={() => toggleRoleFilter("MANAGER")}
              >
                {summary.managers} manager{summary.managers === 1 ? "" : "s"}
              </button>
            )}
            {summary.staff > 0 && (
              <button
                type="button"
                className={hrSummaryChipClassName(
                  roleFilter === "STAFF",
                  metricValueClassName("blue"),
                )}
                onClick={() => toggleRoleFilter("STAFF")}
              >
                {summary.staff} staff
              </button>
            )}
            {summary.fullTime > 0 && (
              <button
                type="button"
                className={hrSummaryChipClassName(
                  employmentTypeFilter === "FULL_TIME",
                  text.secondary,
                )}
                onClick={() => toggleEmploymentFilter("FULL_TIME")}
              >
                {summary.fullTime} full-time
              </button>
            )}
            {summary.partTime > 0 && (
              <button
                type="button"
                className={hrSummaryChipClassName(
                  employmentTypeFilter === "PART_TIME",
                  text.muted,
                )}
                onClick={() => toggleEmploymentFilter("PART_TIME")}
              >
                {summary.partTime} part-time
              </button>
            )}
            {summary.missingRate > 0 && (
              <button
                type="button"
                className={hrSummaryChipClassName(
                  rateFilter === "missing-rate",
                  metricValueClassName("amber"),
                )}
                onClick={toggleRateFilter}
              >
                {summary.missingRate} missing rate
              </button>
            )}
            {summary.total === 0 && (
              <span className={text.muted}>No employees for this branch yet</span>
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

        {isError && (
          <QueryErrorBanner
            message={getErrorMessage(error, "Failed to load employees")}
            onRetry={() => void refetch()}
            loading={isFetching}
          />
        )}

        <ListToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search name, email, role…"
          branchName={branchName}
          showReset={hasActiveFilters}
          onReset={() => {
            setSearch("");
            setRoleFilter("ALL");
            setEmploymentTypeFilter("ALL");
            setRateFilter("ALL");
          }}
          filters={
            <>
              <Select
                value={roleFilter}
                onValueChange={(value) => {
                  if (value != null) setRoleFilter(value as EmployeeRoleFilter);
                }}
              >
                <SelectTrigger
                  className={listToolbarFieldClassName("min-h-[44px] w-full sm:w-[180px]")}
                  aria-label="Filter by role"
                >
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  <SelectItem value="ALL">All roles</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={employmentTypeFilter}
                onValueChange={(value) => {
                  if (value != null) setEmploymentTypeFilter(value as EmploymentTypeFilter);
                }}
              >
                <SelectTrigger
                  className={listToolbarFieldClassName("min-h-[44px] w-full sm:w-[180px]")}
                  aria-label="Filter by employment type"
                >
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  <SelectItem value="ALL">All types</SelectItem>
                  <SelectItem value="FULL_TIME">Full time</SelectItem>
                  <SelectItem value="PART_TIME">Part time</SelectItem>
                </SelectContent>
              </Select>
            </>
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
            hasActiveFilters
              ? "No employees match your filters."
              : "No employees found for this branch."
          }
          pagination={{ pageSize: 15 }}
          expandable={{
            expandedRowRender,
            rowExpandable: () => true,
          }}
        />
      </div>

      <EditCompensationModal
        open={isModalOpen}
        user={selectedUser}
        hourlyRate={hourlyRate}
        onHourlyRateChange={setHourlyRate}
        onClose={closeModal}
        onSubmit={() => void handleUpdateSubmit()}
        isSubmitting={updateHourlyRateMutation.isPending}
        canLinkPayroll={canLinkPayroll}
      />
    </>
  );
}
