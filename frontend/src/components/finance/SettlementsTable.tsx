"use client";

import { CheckCircle2 } from "lucide-react";
import { TableActionButton } from "@/components/shared/table-action-button";
import { StatusBadge, settlementStatusTone } from "@/components/shared/status-badge";
import { FinanceTableSkeleton } from "@/components/finance/FinanceTableSkeleton";
import { formatDate } from "@/lib/intl-date";
import { formatBaht } from "@/lib/money";
import { settlementStatusLabel, type SettlementStatusFilter } from "@/lib/finance-overview-filters";
import {
  nativeTableBodyClassName,
  nativeTableCellMutedClassName,
  nativeTableCellPrimaryClassName,
  nativeTableClassName,
  nativeTableEmptyCellClassName,
  nativeTableHeadClassName,
  nativeTableRowClassName,
} from "@/lib/theme/data-table";
import { financeSectionPanelClassName, financeSectionTitleClassName, financeHubIconClassName, settlementDifferenceClassName } from "@/lib/theme/finance";
import { tableActionAccentClassName } from "@/lib/theme/hub-primitives";
import type { Settlement } from "@/types/api";

type SettlementsTableProps = {
  settlements: Settlement[];
  loading: boolean;
  settlementFilter: SettlementStatusFilter;
  onApprove: (settlement: Settlement) => void;
};

export function SettlementsTable({
  settlements,
  loading,
  settlementFilter,
  onApprove,
}: SettlementsTableProps) {
  return (
    <div className={financeSectionPanelClassName("flex flex-col")}>
      <h2 className={financeSectionTitleClassName("mb-4")}>
        <CheckCircle2 className={financeHubIconClassName()} aria-hidden />
        Shift settlements
      </h2>
      <div className="overflow-x-auto">
        {loading ? (
          <FinanceTableSkeleton />
        ) : (
          <table className={nativeTableClassName()}>
            <thead className={nativeTableHeadClassName()}>
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Date</th>
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3 text-right">Expected</th>
                <th className="px-4 py-3 text-right">Actual</th>
                <th className="px-4 py-3 text-right">Diff</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 rounded-r-lg text-right">Action</th>
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
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatBaht(settlement.expectedCash)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatBaht(settlement.actualCash)}
                  </td>
                  <td className={settlementDifferenceClassName(settlement.difference)}>
                    {settlement.difference === 0
                      ? formatBaht(0)
                      : `${settlement.difference > 0 ? "+" : "-"}${formatBaht(Math.abs(settlement.difference))}`}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge tone={settlementStatusTone(settlement.status)}>
                      {settlementStatusLabel(settlement.status)}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-right">
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
              {settlements.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className={nativeTableEmptyCellClassName()}>
                    {settlementFilter !== "ALL"
                      ? "No settlements match the current filter."
                      : "No shift settlements recorded yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
