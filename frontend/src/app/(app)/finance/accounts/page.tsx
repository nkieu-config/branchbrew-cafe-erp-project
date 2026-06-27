"use client";

import { useMemo } from "react";
import { useAccounts } from "@/hooks/domains/useAccountingQueries";
import type { ColumnsType } from "antd/es/table";
import { Landmark } from "lucide-react";
import { HubCard } from "@/components/shared/hub-card";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge, accountTypeTone } from "@/components/shared/status-badge";
import { groupAccountsByType } from "@/lib/accounts";
import type { AccountTableRow } from "@/types/api";

export default function ChartOfAccountsPage() {
  const { data: accountsData = [], isLoading: loading } = useAccounts();

  const accountsTree = useMemo(() => groupAccountsByType(accountsData), [accountsData]);

  const columns: ColumnsType<AccountTableRow> = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      width: 150,
      render: (code: string, record) =>
        "isGroup" in record && record.isGroup ? (
          <span className="font-semibold text-slate-800 dark:text-slate-200">{record.type}</span>
        ) : (
          <span className="font-mono font-medium">{code}</span>
        ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record) =>
        "isGroup" in record && record.isGroup ? (
          <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            {name}
          </span>
        ) : (
          <span>{name}</span>
        ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 150,
      render: (type: string, record) => {
        if ("isGroup" in record && record.isGroup) return null;
        return <StatusBadge tone={accountTypeTone(type)}>{type}</StatusBadge>;
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive: boolean, record) => {
        if ("isGroup" in record && record.isGroup) return null;
        return isActive ? (
          <StatusBadge tone="success">Active</StatusBadge>
        ) : (
          <StatusBadge tone="neutral">Inactive</StatusBadge>
        );
      },
    },
  ];

  return (
    <HubCard title="Chart of Accounts" icon={Landmark}>
      <DataTable
        columns={columns}
        dataSource={accountsTree}
        rowKey="id"
        loading={loading}
        pagination={false}
        defaultExpandAllRows={true}
      />
    </HubCard>
  );
}
