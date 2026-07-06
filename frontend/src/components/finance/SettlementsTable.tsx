"use client";

import type { ColumnsType } from "antd/es/table";
import { CheckCircle2 } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import {
  ListMobileCard,
  PaginatedMobileList,
  ResponsiveDataTableLayout,
} from "@/components/shared/responsive-data-table";
import { TableActionButton } from "@/components/shared/table-action-button";
import { StatusBadge, settlementStatusTone } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/intl-date";
import { formatCurrency, toNumber } from "@/lib/money";
import { settlementStatusLabel, type SettlementStatusFilter } from "@/lib/filters/finance-overview-filters";
import { tableCellMutedClassName } from "@/lib/theme/feedback";
import { financeSectionLabelClassName, settlementDifferenceClassName } from "@/lib/theme/finance";
import { tableActionAccentClassName } from "@/lib/theme/hub-primitives";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";
import type { Settlement } from "@/types/api";

type SettlementsTableProps = {
  settlements: Settlement[];
  loading: boolean;
  settlementFilter: SettlementStatusFilter;
  onApprove: (settlement: Settlement) => void;
};

function settlementEmptyMessage(filter: SettlementStatusFilter) {
  return filter !== "ALL"
    ? "No settlements match the current filter."
    : "No shift settlements recorded yet.";
}

function formatSettlementDifference(difference: Settlement["difference"]): string {
  const diff = toNumber(difference);
  if (diff === 0) return formatCurrency(0);
  return `${diff > 0 ? "+" : "-"}${formatCurrency(Math.abs(diff))}`;
}

export function SettlementsTable({
  settlements,
  loading,
  settlementFilter,
  onApprove,
}: SettlementsTableProps) {
  const emptyMessage = settlementEmptyMessage(settlementFilter);

  const columns: ColumnsType<Settlement> = [
    {
      title: "Date",
      key: "date",
      render: (_: unknown, settlement: Settlement) => (
        <span className={cn("tabular-nums", tableCellMutedClassName())}>
          {formatDate(settlement.date)}
        </span>
      ),
    },
    {
      title: "Branch",
      key: "branch",
      render: (_: unknown, settlement: Settlement) => (
        <span className={cn("font-medium", text.primary)}>
          {settlement.branch?.name ?? "Main"}
        </span>
      ),
    },
    {
      title: "Expected",
      key: "expected",
      align: "right",
      render: (_: unknown, settlement: Settlement) => (
        <span className="tabular-nums">{formatCurrency(settlement.expectedCash)}</span>
      ),
    },
    {
      title: "Actual",
      key: "actual",
      align: "right",
      render: (_: unknown, settlement: Settlement) => (
        <span className="tabular-nums">{formatCurrency(settlement.actualCash)}</span>
      ),
    },
    {
      title: "Diff",
      key: "difference",
      align: "right",
      render: (_: unknown, settlement: Settlement) => (
        <span className={settlementDifferenceClassName(toNumber(settlement.difference))}>
          {formatSettlementDifference(settlement.difference)}
        </span>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_: unknown, settlement: Settlement) => (
        <StatusBadge tone={settlementStatusTone(settlement.status)}>
          {settlementStatusLabel(settlement.status)}
        </StatusBadge>
      ),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_: unknown, settlement: Settlement) =>
        settlement.status === "PENDING" ? (
          <TableActionButton
            icon={CheckCircle2}
            label={`Approve settlement for ${settlement.branch?.name ?? "branch"} on ${formatDate(settlement.date)}`}
            iconOnly
            onClick={() => onApprove(settlement)}
            className={tableActionAccentClassName("emerald")}
          />
        ) : null,
    },
  ];

  return (
    <div className="flex min-w-0 flex-col" data-testid="finance-settlements">
      <h2 className={financeSectionLabelClassName()}>Settlements</h2>

      <ResponsiveDataTableLayout
        mobile={
          loading ? (
            <ResponsiveDataTableLayout.Skeleton rows={3} />
          ) : settlements.length === 0 ? (
            <ResponsiveDataTableLayout.Empty message={emptyMessage} />
          ) : (
            <PaginatedMobileList items={settlements} pageSize={0}>
              {(settlement) => (
                <ListMobileCard>
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className={cn("font-medium", text.primary)}>
                        {settlement.branch?.name ?? "Main"}
                      </p>
                      <time className={cn("text-xs tabular-nums", text.muted)} dateTime={settlement.date}>
                        {formatDate(settlement.date)}
                      </time>
                    </div>
                    <StatusBadge tone={settlementStatusTone(settlement.status)}>
                      {settlementStatusLabel(settlement.status)}
                    </StatusBadge>
                  </div>
                  <dl className="mb-3 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <dt className={text.muted}>Expected</dt>
                      <dd className="tabular-nums">{formatCurrency(settlement.expectedCash)}</dd>
                    </div>
                    <div>
                      <dt className={text.muted}>Actual</dt>
                      <dd className="tabular-nums">{formatCurrency(settlement.actualCash)}</dd>
                    </div>
                    <div>
                      <dt className={text.muted}>Diff</dt>
                      <dd className={settlementDifferenceClassName(toNumber(settlement.difference))}>
                        {formatSettlementDifference(settlement.difference)}
                      </dd>
                    </div>
                  </dl>
                  {settlement.status === "PENDING" && (
                    <TableActionButton
                      icon={CheckCircle2}
                      label="Approve settlement"
                      iconOnly
                      onClick={() => onApprove(settlement)}
                      className={tableActionAccentClassName("emerald")}
                    />
                  )}
                </ListMobileCard>
              )}
            </PaginatedMobileList>
          )
        }
        desktop={
          <DataTable<Settlement>
            columns={columns}
            dataSource={settlements}
            rowKey="id"
            loading={loading}
            pagination={false}
            emptyDescription={emptyMessage}
          />
        }
      />
    </div>
  );
}
