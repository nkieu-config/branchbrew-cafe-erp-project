"use client";

import { useMemo, useState, useCallback } from "react";
import type { ColumnsType } from "antd/es/table";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTogglePromotion } from "@/hooks/domains/useCrmQueries";
import { getErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/intl-date";
import { formatBaht } from "@/lib/money";
import {
  formatPromoValidityRange,
  getPromoValidity,
  promoValidityLabel,
  promoValidityTone,
} from "@/lib/promotion-status";
import type { Promotion } from "@/types/api";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableActionButton } from "@/components/shared/table-action-button";
import { Switch } from "@/components/ui/switch";
import { hubListDataTableProps } from "@/lib/theme/data-table";
import { metricValueClassName } from "@/lib/theme/metric";
import { text } from "@/lib/theme/surface";
import { typeSectionLabelClassName, typeUiLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";

type PromotionListTableProps = {
  promotions: Promotion[];
  loading: boolean;
  isError: boolean;
  hasActiveFilters: boolean;
  onEdit: (promotion: Promotion) => void;
  onDelete: (promotion: Promotion) => void;
};

export function PromotionListTable({
  promotions,
  loading,
  isError,
  hasActiveFilters,
  onEdit,
  onDelete,
}: PromotionListTableProps) {
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const toggleMutation = useTogglePromotion();

  const handleToggle = useCallback(
    async (id: number, currentStatus: boolean) => {
      setTogglingId(id);
      try {
        await toggleMutation.mutateAsync({ id, isActive: !currentStatus });
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, "Failed to update promotion"));
      } finally {
        setTogglingId(null);
      }
    },
    [toggleMutation],
  );

  const columns = useMemo(
    () =>
      [
        {
          title: "Status",
          dataIndex: "isActive",
          key: "status",
          width: 160,
          render: (_: boolean, record: Promotion) => {
            const validity = getPromoValidity(record);
            const isExpired = validity === "expired";
            const isToggling = togglingId === record.id;

            return (
              <div className="flex items-center gap-2">
                <StatusBadge
                  tone={promoValidityTone(validity)}
                  className={typeSectionLabelClassName("tracking-wider")}
                >
                  {promoValidityLabel(validity)}
                </StatusBadge>
                <Switch
                  checked={record.isActive}
                  disabled={isExpired || isToggling}
                  onCheckedChange={() => handleToggle(record.id, record.isActive)}
                  aria-label={`Toggle promotion ${record.code}`}
                />
              </div>
            );
          },
        },
        {
          title: "Code",
          dataIndex: "code",
          key: "code",
          render: (code: string) => (
            <span className={typeUiLabelClassName(cn("font-mono", text.primary))}>{code}</span>
          ),
        },
        {
          title: "Description",
          dataIndex: "description",
          key: "desc",
          responsive: ["md"],
          render: (desc: string) => <span className={text.secondary}>{desc}</span>,
        },
        {
          title: "Discount",
          key: "discount",
          render: (_: unknown, record: Promotion) => (
            <span className={typeUiLabelClassName(metricValueClassName("emerald"))}>
              {record.discountType === "PERCENTAGE"
                ? `${record.discountValue}%`
                : formatBaht(record.discountValue)}
            </span>
          ),
        },
        {
          title: "Min Purchase",
          dataIndex: "minPurchase",
          key: "minPurchase",
          responsive: ["lg"],
          render: (min: number | null) => (
            <span className={text.muted}>{min != null ? formatBaht(min) : "—"}</span>
          ),
        },
        {
          title: "Validity",
          key: "validity",
          responsive: ["lg"],
          render: (_: unknown, record: Promotion) => (
            <span className={cn("text-sm", text.muted)}>{formatPromoValidityRange(record)}</span>
          ),
        },
        {
          title: "Created",
          dataIndex: "createdAt",
          key: "createdAt",
          responsive: ["lg"],
          render: (createdAt?: string) => (
            <span className={cn("text-sm font-medium", text.muted)}>
              {createdAt ? formatDate(createdAt) : "—"}
            </span>
          ),
        },
        {
          title: "",
          key: "actions",
          width: 96,
          render: (_: unknown, record: Promotion) => (
            <div className="flex items-center justify-end gap-1">
              <TableActionButton
                label={`Edit ${record.code}`}
                icon={Pencil}
                iconOnly
                tone="purple"
                onClick={() => onEdit(record)}
              />
              <TableActionButton
                label={`Delete ${record.code}`}
                icon={Trash2}
                iconOnly
                destructive
                onClick={() => onDelete(record)}
              />
            </div>
          ),
        },
      ] as ColumnsType<Promotion>,
    [handleToggle, onDelete, onEdit, togglingId],
  );

  return (
    <DataTable
      {...hubListDataTableProps()}
      columns={columns}
      dataSource={promotions}
      rowKey="id"
      loading={loading && !isError}
      emptyDescription={
        hasActiveFilters
          ? "No promotions match your filters."
          : "No promotion codes yet. Create one to get started."
      }
    />
  );
}
