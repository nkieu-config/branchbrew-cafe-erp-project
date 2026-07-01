"use client";

import React from "react";
import { Table, Skeleton } from "antd";
import type { TableProps } from "antd";
import { useTheme } from "next-themes";
import { Inbox } from "lucide-react";
import { AntdScope } from "@/components/providers/AntdScope";
import { QueryErrorBanner } from "@/components/shared/query-error-banner";
import { dataTableContainerClassName, dataTableEmptyIconClassName, dataTableEmptyTextClassName, dataTableSkeletonClassName } from "@/lib/theme/data-table";

interface DataTableProps<RecordType extends object = object> extends TableProps<RecordType> {
  containerClassName?: string;
  hideBorders?: boolean;
  emptyDescription?: string;
  /** When true, shows recoverable error banner above the table shell. */
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  retryLoading?: boolean;
}

function TableEmptyState({ description }: { description: string }) {
  return (
    <div className="py-12 text-center">
      <Inbox className={dataTableEmptyIconClassName()} />
      <p className={dataTableEmptyTextClassName()}>{description}</p>
    </div>
  );
}

export function DataTable<RecordType extends object = object>({
  containerClassName = "",
  hideBorders = false,
  emptyDescription = "No records found.",
  isError = false,
  errorMessage = "Failed to load data.",
  onRetry,
  retryLoading = false,
  locale,
  ...props
}: DataTableProps<RecordType>) {
  const { resolvedTheme } = useTheme();
  const tableThemeKey = resolvedTheme ?? "light";

  if (props.loading && (!props.dataSource || (Array.isArray(props.dataSource) && props.dataSource.length === 0))) {
    return (
      <AntdScope>
        <div className={dataTableSkeletonClassName({ hideBorders }, containerClassName)}>
          <Skeleton active paragraph={{ rows: 5 }} />
        </div>
      </AntdScope>
    );
  }

  return (
    <AntdScope>
      <div className="space-y-3">
      {isError && (
        <QueryErrorBanner
          message={errorMessage}
          onRetry={onRetry}
          loading={retryLoading}
        />
      )}
      <div className={dataTableContainerClassName({ hideBorders }, containerClassName)}>
        <Table
          key={tableThemeKey}
          pagination={{
            placement: ["bottomEnd"],
            showSizeChanger: true,
            ...props.pagination,
          }}
          scroll={{ x: "max-content", ...props.scroll }}
          locale={{
            emptyText: <TableEmptyState description={emptyDescription} />,
            ...locale,
          }}
          {...props}
        />
      </div>
      </div>
    </AntdScope>
  );
}
