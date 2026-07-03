"use client";

import { CheckCircle2 } from "lucide-react";
import { FinanceTableSkeleton } from "@/components/finance/FinanceTableSkeleton";
import {
  ListMobileCard,
  PaginatedMobileList,
  ResponsiveDataTableLayout,
} from "@/components/shared/responsive-data-table";
import { TableActionButton } from "@/components/shared/table-action-button";
import { StatusBadge, settlementStatusTone } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/intl-date";
import { formatCurrency } from "@/lib/money";
import { settlementStatusLabel, type SettlementStatusFilter } from "@/lib/finance-overview-filters";
import {
  horizontalScrollHintClassName,
  nativeTableBodyClassName,
  nativeTableCellMutedClassName,
  nativeTableCellPrimaryClassName,
  nativeTableClassName,
  nativeTableEmptyCellClassName,
  nativeTableHeadClassName,
  nativeTableRowClassName,
} from "@/lib/theme/data-table";
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

export function SettlementsTable({
  settlements,
  loading,
  settlementFilter,
  onApprove,
}: SettlementsTableProps) {
  const emptyMessage = settlementEmptyMessage(settlementFilter);

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
                      <dd className={settlementDifferenceClassName(settlement.difference)}>
                        {settlement.difference === 0
                          ? formatCurrency(0)
                          : `${settlement.difference > 0 ? "+" : "-"}${formatCurrency(Math.abs(settlement.difference))}`}
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
          loading ? (
            <FinanceTableSkeleton />
          ) : (
            <div className={horizontalScrollHintClassName()}>
              <table className={nativeTableClassName()}>
                <thead className={nativeTableHeadClassName()}>
                  <tr>
                    <th className="rounded-l-lg px-3 py-2.5">Date</th>
                    <th className="px-3 py-2.5">Branch</th>
                    <th className="px-3 py-2.5 text-right">Expected</th>
                    <th className="px-3 py-2.5 text-right">Actual</th>
                    <th className="px-3 py-2.5 text-right">Diff</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="w-12 rounded-r-lg px-3 py-2.5 text-right" />
                  </tr>
                </thead>
                <tbody className={nativeTableBodyClassName()}>
                  {settlements.map((settlement) => (
                    <tr key={settlement.id} className={nativeTableRowClassName()}>
                      <td className={nativeTableCellMutedClassName()}>
                        {formatDate(settlement.date)}
                      </td>
                      <td className={nativeTableCellPrimaryClassName()}>
                        {settlement.branch?.name ?? "Main"}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {formatCurrency(settlement.expectedCash)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {formatCurrency(settlement.actualCash)}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-2.5 text-right",
                          settlementDifferenceClassName(settlement.difference),
                        )}
                      >
                        {settlement.difference === 0
                          ? formatCurrency(0)
                          : `${settlement.difference > 0 ? "+" : "-"}${formatCurrency(Math.abs(settlement.difference))}`}
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge tone={settlementStatusTone(settlement.status)}>
                          {settlementStatusLabel(settlement.status)}
                        </StatusBadge>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {settlement.status === "PENDING" && (
                          <TableActionButton
                            icon={CheckCircle2}
                            label={`Approve settlement for ${settlement.branch?.name ?? "branch"} on ${formatDate(settlement.date)}`}
                            iconOnly
                            onClick={() => onApprove(settlement)}
                            className={tableActionAccentClassName("emerald")}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                  {settlements.length === 0 && (
                    <tr>
                      <td colSpan={7} className={nativeTableEmptyCellClassName()}>
                        {emptyMessage}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )
        }
      />
    </div>
  );
}
