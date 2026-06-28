"use client";

import { useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import {
  Building,
  Mail,
  Pencil,
  Plus,
  Shield,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useHrUsers, useCreateUser, useUpdateUser } from "@/hooks/domains/useHrQueries";
import { useBranches } from "@/hooks/domains/useGeneralQueries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { AnimatedPage } from "@/components/animated-page";
import { HubPageHeader } from "@/components/shared/hub-card";
import { AccessDeniedState } from "@/components/shared/access-denied-state";
import { DataTable } from "@/components/shared/data-table";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { QueryErrorBanner } from "@/components/shared/query-error-banner";
import { TableActionButton } from "@/components/shared/table-action-button";
import { StatusBadge, roleTone } from "@/components/shared/status-badge";
import { RoleGuard } from "@/components/RoleGuard";
import { OrganizationHubLinks } from "@/components/organization/OrganizationHubLinks";
import { UserFormModal } from "@/components/organization/UserFormModal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type EmployeeRateFilter,
  type EmployeeRoleFilter,
  type EmploymentTypeFilter,
  type OrgUserBranchFilter,
  employmentTypeLabel,
  filterEmployees,
  roleLabel,
  summarizeEmployees,
} from "@/lib/employee-filters";
import { getErrorMessage } from "@/lib/errors";
import type {
  Branch,
  CreateUserPayload,
  EmploymentType,
  Role,
  User,
} from "@/types/api";
import {
  avatarPlaceholderClassName,
  formSelectContentClassName,
  hubCtaClassName,
  infoBannerClassName,
  infoBannerIconClassName,
  infoBannerTextClassName,
  infoBannerTitleClassName,
  inlineLinkClassName,
  inventorySummaryStripClassName,
  listToolbarFieldClassName,
  metricValueClassName,
  organizationSectionPanelClassName,
  organizationSummaryChipClassName,
  text,
  userRoleLegendSwatchClassName,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function UsersPageClient({ embedded = false }: { embedded?: boolean }) {
  const {
    data: users,
    isLoading: usersLoading,
    isError: usersError,
    error: usersQueryError,
    refetch: refetchUsers,
    isFetching: usersFetching,
  } = useHrUsers();
  const {
    data: branches,
    isLoading: branchesLoading,
    isError: branchesError,
    error: branchesQueryError,
    refetch: refetchBranches,
    isFetching: branchesFetching,
  } = useBranches();

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 300);
  const [roleFilter, setRoleFilter] = useState<EmployeeRoleFilter>("ALL");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<EmploymentTypeFilter>("ALL");
  const [rateFilter, setRateFilter] = useState<EmployeeRateFilter>("ALL");
  const [branchFilter, setBranchFilter] = useState<OrgUserBranchFilter>("ALL");

  const branchList = (branches as Branch[] | undefined) ?? [];
  const userList = (users as User[] | undefined) ?? [];

  const branchNameById = useMemo(
    () => new Map(branchList.map((branch) => [branch.id, branch.name])),
    [branchList],
  );

  const summary = useMemo(() => summarizeEmployees(userList), [userList]);

  const filteredUsers = useMemo(
    () =>
      filterEmployees(userList, {
        search: debouncedSearch,
        roleFilter,
        employmentTypeFilter,
        rateFilter,
        branchFilter,
        branchNames: branchNameById,
      }),
    [
      userList,
      debouncedSearch,
      roleFilter,
      employmentTypeFilter,
      rateFilter,
      branchFilter,
      branchNameById,
    ],
  );

  const isLoading = usersLoading || branchesLoading;
  const isError = usersError || branchesError;
  const error = usersQueryError ?? branchesQueryError;
  const isFetching = usersFetching || branchesFetching;

  const hasActiveFilters =
    search.trim().length > 0 ||
    roleFilter !== "ALL" ||
    employmentTypeFilter !== "ALL" ||
    rateFilter !== "ALL" ||
    branchFilter !== "ALL";

  const toggleRoleFilter = (next: EmployeeRoleFilter) => {
    setRoleFilter((current) => (current === next ? "ALL" : next));
  };

  const toggleRateFilter = () => {
    setRateFilter((current) => (current === "missing-rate" ? "ALL" : "missing-rate"));
  };

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("ALL");
    setEmploymentTypeFilter("ALL");
    setRateFilter("ALL");
    setBranchFilter("ALL");
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleSave = async (payload: {
    name: string;
    email: string;
    password?: string;
    role: Role;
    branchId: number | null;
    employmentType: EmploymentType;
    hourlyRate: number;
    baseSalary: number;
  }) => {
    try {
      const body: CreateUserPayload = {
        ...payload,
        branchId: payload.branchId,
      };
      if (!body.password) delete body.password;

      if (editingUser) {
        await updateMutation.mutateAsync({ id: editingUser.id, ...body });
        toast.success("User updated");
      } else {
        if (!payload.password) {
          toast.error("Password is required for new users");
          return;
        }
        await createMutation.mutateAsync({ ...body, password: payload.password });
        toast.success("User created");
      }
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to save user"));
      throw err;
    }
  };

  const columns = useMemo(
    () =>
      [
        {
          title: "User",
          key: "user",
          render: (_: unknown, record: User) => (
            <div className="flex items-center gap-3 min-w-0">
              <div className={avatarPlaceholderClassName()}>
                <UserIcon className={cn("w-4 h-4", text.muted)} aria-hidden />
              </div>
              <div className="min-w-0">
                <div className={cn("font-medium truncate", text.primary)}>
                  {record.name || "Unnamed user"}
                </div>
                <div className={cn("text-xs flex items-center gap-1 truncate", text.muted)}>
                  <Mail className="w-3 h-3 shrink-0" aria-hidden />
                  {record.email}
                </div>
              </div>
            </div>
          ),
        },
        {
          title: "Role",
          dataIndex: "role",
          key: "role",
          render: (role: Role) => (
            <StatusBadge tone={roleTone(role)}>
              <span className="inline-flex items-center gap-1">
                <Shield className="w-3 h-3" aria-hidden />
                {roleLabel(role)}
              </span>
            </StatusBadge>
          ),
        },
        {
          title: "Branch",
          key: "branch",
          responsive: ["md"],
          render: (_: unknown, record: User) => {
            const label =
              record.branchId == null
                ? "All branches (HQ)"
                : branchNameById.get(record.branchId) ??
                  record.branch?.name ??
                  `Branch #${record.branchId}`;
            return (
              <div className={cn("flex items-center gap-1.5 min-w-0", text.secondary)}>
                <Building className={cn("w-4 h-4 shrink-0", text.muted)} aria-hidden />
                <span className="truncate">{label}</span>
              </div>
            );
          },
        },
        {
          title: "Employment",
          key: "employment",
          responsive: ["lg"],
          render: (_: unknown, record: User) => (
            <span className={text.secondary}>{employmentTypeLabel(record.employmentType)}</span>
          ),
        },
        {
          title: "Actions",
          key: "actions",
          align: "right",
          width: 100,
          render: (_: unknown, record: User) => (
            <TableActionButton
              label="Edit"
              icon={Pencil}
              tone="blue"
              onClick={() => handleEdit(record)}
            />
          ),
        },
      ] satisfies ColumnsType<User>,
    [branchNameById],
  );

  const content = (
    <div className={cn("space-y-6 w-full", embedded ? "max-w-6xl" : "max-w-6xl mx-auto")}>
      <HubPageHeader
        hideTitle
        accentHub="organization"
        description="Manage system access, passwords, and branch assignments."
        actions={
          <OrganizationHubLinks current="users">
            <Button
              className={hubCtaClassName("organization", "font-bold min-h-[44px]")}
              onClick={handleAddNew}
            >
              <Plus className="w-4 h-4 mr-2" aria-hidden />
              Add user
            </Button>
          </OrganizationHubLinks>
        }
      />

      <div className={organizationSectionPanelClassName()}>
        <div className={infoBannerClassName()}>
          <div className="flex items-start gap-3">
            <ShieldCheck className={infoBannerIconClassName()} aria-hidden />
            <div>
              <p className={infoBannerTitleClassName()}>Compensation &amp; HR workflows</p>
              <p className={infoBannerTextClassName()}>
                Use this tab for credentials and roles. To update hourly rates or browse staff by
                branch, open{" "}
                <Link href="/hr/employees" className={inlineLinkClassName()}>
                  HR → Employee Directory
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        {!isLoading && !isError && summary.total > 0 && (
          <div
            className={inventorySummaryStripClassName()}
            aria-live="polite"
            aria-atomic="true"
          >
            <span className={cn("font-semibold tabular-nums", text.primary)}>
              {summary.total} user{summary.total === 1 ? "" : "s"}
            </span>
            {summary.superAdmins > 0 && (
              <button
                type="button"
                className={organizationSummaryChipClassName(
                  roleFilter === "SUPER_ADMIN",
                  metricValueClassName("purple"),
                )}
                onClick={() => toggleRoleFilter("SUPER_ADMIN")}
              >
                {summary.superAdmins} super admin{summary.superAdmins === 1 ? "" : "s"}
              </button>
            )}
            {summary.managers > 0 && (
              <button
                type="button"
                className={organizationSummaryChipClassName(
                  roleFilter === "MANAGER",
                  metricValueClassName("blue"),
                )}
                onClick={() => toggleRoleFilter("MANAGER")}
              >
                {summary.managers} manager{summary.managers === 1 ? "" : "s"}
              </button>
            )}
            {summary.staff > 0 && (
              <button
                type="button"
                className={organizationSummaryChipClassName(
                  roleFilter === "STAFF",
                  text.muted,
                )}
                onClick={() => toggleRoleFilter("STAFF")}
              >
                {summary.staff} staff
              </button>
            )}
            {summary.missingRate > 0 && (
              <button
                type="button"
                className={organizationSummaryChipClassName(
                  rateFilter === "missing-rate",
                  metricValueClassName("amber"),
                )}
                onClick={toggleRateFilter}
              >
                {summary.missingRate} missing rate
              </button>
            )}
          </div>
        )}

        {!isLoading && !isError && summary.total > 0 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--text-subtle)]">
            <span className="font-medium uppercase tracking-wide">Legend</span>
            <span className="inline-flex items-center gap-1.5">
              <span className={userRoleLegendSwatchClassName("SUPER_ADMIN")} aria-hidden />
              Super Admin
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className={userRoleLegendSwatchClassName("MANAGER")} aria-hidden />
              Manager
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className={userRoleLegendSwatchClassName("STAFF")} aria-hidden />
              Staff
            </span>
          </div>
        )}

        {isError && (
          <QueryErrorBanner
            message={getErrorMessage(error, "Failed to load users.")}
            onRetry={() => {
              void refetchUsers();
              void refetchBranches();
            }}
            loading={isFetching}
          />
        )}

        <ListToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search name, email, role, branch…"
          showReset={hasActiveFilters}
          onReset={resetFilters}
          filters={
            <>
              <Select
                value={roleFilter}
                onValueChange={(value) => value && setRoleFilter(value as EmployeeRoleFilter)}
              >
                <SelectTrigger
                  className={listToolbarFieldClassName("w-full sm:w-[160px]")}
                  aria-label="Filter by role"
                >
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  <SelectItem value="ALL">All roles</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={
                  branchFilter === "ALL"
                    ? "ALL"
                    : branchFilter === "hq"
                      ? "hq"
                      : String(branchFilter)
                }
                onValueChange={(value) => {
                  if (!value || value === "ALL") setBranchFilter("ALL");
                  else if (value === "hq") setBranchFilter("hq");
                  else setBranchFilter(Number(value));
                }}
              >
                <SelectTrigger
                  className={listToolbarFieldClassName("w-full sm:w-[180px]")}
                  aria-label="Filter by branch"
                >
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  <SelectItem value="ALL">All branches</SelectItem>
                  <SelectItem value="hq">HQ / unassigned</SelectItem>
                  {branchList.map((branch) => (
                    <SelectItem key={branch.id} value={String(branch.id)}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={employmentTypeFilter}
                onValueChange={(value) =>
                  value && setEmploymentTypeFilter(value as EmploymentTypeFilter)
                }
              >
                <SelectTrigger
                  className={listToolbarFieldClassName("w-full sm:w-[160px]")}
                  aria-label="Filter by employment type"
                >
                  <SelectValue placeholder="Employment" />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  <SelectItem value="ALL">All types</SelectItem>
                  <SelectItem value="FULL_TIME">Full-time</SelectItem>
                  <SelectItem value="PART_TIME">Part-time</SelectItem>
                </SelectContent>
              </Select>
            </>
          }
        />

        <DataTable
          loading={isLoading}
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          emptyDescription={
            hasActiveFilters
              ? "No users match your filters."
              : "Add your first user to grant system access."
          }
        />
      </div>

      <UserFormModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        branches={branchList}
        onSubmit={handleSave}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );

  if (embedded) return content;

  return (
    <RoleGuard
      allowedRoles={["SUPER_ADMIN"]}
      fallback={
        <AccessDeniedState description="Super Admin access is required to manage users and roles." />
      }
    >
      <AnimatedPage className="space-y-6 max-w-6xl mx-auto w-full">{content}</AnimatedPage>
    </RoleGuard>
  );
}
