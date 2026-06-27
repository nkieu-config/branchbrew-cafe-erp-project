import React from "react";
import { Table, Skeleton } from "antd";
import type { TableProps } from "antd";
import { Inbox } from "lucide-react";
import {
  dataTableContainerClassName,
  dataTableEmptyIconClassName,
  dataTableEmptyTextClassName,
  dataTableSkeletonClassName,
} from "@/lib/theme";

interface DataTableProps<RecordType extends object = object> extends TableProps<RecordType> {
  containerClassName?: string;
  hideBorders?: boolean;
  emptyDescription?: string;
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
  locale,
  ...props
}: DataTableProps<RecordType>) {
  if (props.loading && (!props.dataSource || (Array.isArray(props.dataSource) && props.dataSource.length === 0))) {
    return (
      <div className={dataTableSkeletonClassName({ hideBorders }, containerClassName)}>
        <Skeleton active paragraph={{ rows: 5 }} />
      </div>
    );
  }

  return (
    <div className={dataTableContainerClassName({ hideBorders }, containerClassName)}>
      <Table
        pagination={{
          placement: ['bottomEnd'],
          showSizeChanger: true,
          ...props.pagination,
        }}
        scroll={{ x: 'max-content', ...props.scroll }}
        locale={{
          emptyText: <TableEmptyState description={emptyDescription} />,
          ...locale,
        }}
        {...props}
      />
    </div>
  );
}
