"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import { Pencil } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import {
  ListMobileCard,
  PaginatedMobileList,
  ResponsiveDataTableLayout,
} from "@/components/shared/responsive-data-table";
import { TableActionButton } from "@/components/shared/table-action-button";
import { roleLabel } from "@/lib/filters/employee-filters";
import { useHubListPagination } from "@/hooks/useHubListPagination";
import { organizationMutedMetaClassName } from "@/lib/theme/organization";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";
import type { Role, User } from "@/types/api";

type OrganizationUsersTableProps = {
  users: User[];
  loading: boolean;
  hasActiveFilters: boolean;
  branchNameById: Map<number, string>;
  onEdit: (user: User) => void;
};

function branchLabel(record: User, branchNameById: Map<number, string>) {
  if (record.branchId == null) return "All branches (HQ)";
  return (
    branchNameById.get(record.branchId) ?? `Branch #${record.branchId}`
  );
}

type OrganizationUserMobileCardProps = {
  user: User;
  branchNameById: Map<number, string>;
  onEdit: (user: User) => void;
};

function OrganizationUserMobileCard({
  user,
  branchNameById,
  onEdit,
}: OrganizationUserMobileCardProps) {
  return (
    <ListMobileCard>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn("font-medium", text.primary)}>
            {user.name || "Unnamed user"}
          </p>
          <p className={organizationMutedMetaClassName("truncate")}>{user.email}</p>
          <p className={cn("mt-1 text-sm", text.secondary)}>{roleLabel(user.role)}</p>
          <p className={cn("text-sm", text.muted)}>{branchLabel(user, branchNameById)}</p>
        </div>
        <TableActionButton
          label="Edit"
          icon={Pencil}
          tone="blue"
          onClick={() => onEdit(user)}
        />
      </div>
    </ListMobileCard>
  );
}

export function OrganizationUsersTable({
  users,
  loading,
  hasActiveFilters,
  branchNameById,
  onEdit,
}: OrganizationUsersTableProps) {
  const emptyDescription = hasActiveFilters
    ? "No users match your filters."
    : "Add your first user to grant system access.";

  const listPagination = useHubListPagination(
    { pageSize: 10 },
    `${users.length}-${hasActiveFilters}`,
  );

  const columns = useMemo(
    () =>
      [
        {
          title: "User",
          key: "user",
          render: (_: unknown, record: User) => (
            <div className="min-w-0">
              <div className={cn("truncate font-medium", text.primary)}>
                {record.name || "Unnamed user"}
              </div>
              <div className={organizationMutedMetaClassName("truncate")}>{record.email}</div>
            </div>
          ),
        },
        {
          title: "Role",
          dataIndex: "role",
          key: "role",
          width: 140,
          render: (role: Role) => <span className={text.secondary}>{roleLabel(role)}</span>,
        },
        {
          title: "Branch",
          key: "branch",
          responsive: ["md"],
          render: (_: unknown, record: User) => {
            const label = branchLabel(record, branchNameById);
            return (
              <span
                title={typeof label === "string" ? label : undefined}
                className={cn("block max-w-70 truncate", text.secondary)}
              >
                {label}
              </span>
            );
          },
        },
        {
          title: "",
          key: "actions",
          align: "right",
          width: 56,
          render: (_: unknown, record: User) => (
            <TableActionButton
              label="Edit"
              icon={Pencil}
              tone="blue"
              onClick={() => onEdit(record)}
            />
          ),
        },
      ] satisfies ColumnsType<User>,
    [branchNameById, onEdit],
  );

  return (
    <ResponsiveDataTableLayout
      mobile={
        loading ? (
          <ResponsiveDataTableLayout.Skeleton />
        ) : users.length === 0 ? (
          <ResponsiveDataTableLayout.Empty message={emptyDescription} />
        ) : (
          <PaginatedMobileList
            items={users}
            pageSize={listPagination.pageSize}
            page={listPagination.currentPage}
            onPageChange={listPagination.setCurrentPage}
          >
            {(user) => (
              <OrganizationUserMobileCard
                user={user}
                branchNameById={branchNameById}
                onEdit={onEdit}
              />
            )}
          </PaginatedMobileList>
        )
      }
      desktop={
        <DataTable
          hideBorders
          pagination={listPagination.tablePagination}
          loading={loading}
          columns={columns}
          dataSource={users}
          rowKey="id"
          emptyDescription={emptyDescription}
        />
      }
    />
  );
}
