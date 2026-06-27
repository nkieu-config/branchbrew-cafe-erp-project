import { cn } from "@/lib/utils";
import { surfaceCardClassName, text } from "./surface";

/** Shared antd DataTable shell — used by `components/shared/data-table.tsx`. */
export function dataTableContainerClassName(
  options?: { hideBorders?: boolean },
  className?: string,
) {
  return cn(
    "rounded-2xl shadow-sm border overflow-hidden w-full",
    "bg-[var(--table-container-bg)] border-[var(--table-container-border)]",
    "[&_.ant-table]:bg-transparent",
    "[&_.ant-table-thead>tr>th]:bg-[var(--table-head-bg)]",
    "[&_.ant-table-thead>tr>th]:text-[var(--table-head-fg)]",
    "[&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:uppercase",
    "[&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:tracking-wider",
    "[&_.ant-table-tbody>tr>td]:border-b [&_.ant-table-tbody>tr>td]:border-[var(--table-row-border)]",
    "[&_.ant-table-tbody>tr:last-child>td]:border-b-0",
    "[&_.ant-table-tbody>tr:hover>td]:bg-[var(--table-row-hover)]",
    "[&_.ant-table-cell]:text-[var(--table-cell-fg)]",
    "[&_.ant-pagination]:px-4 [&_.ant-pagination]:pb-4",
    options?.hideBorders && "border-none shadow-none",
    className,
  );
}

export function dataTableSkeletonClassName(
  options?: { hideBorders?: boolean },
  className?: string,
) {
  return cn(
    surfaceCardClassName("w-full"),
    options?.hideBorders && "border-none shadow-none",
    className,
  );
}

export function dataTableEmptyIconClassName(className?: string) {
  return cn("w-10 h-10 mx-auto mb-3 text-[var(--table-empty-icon)]", className);
}

export function dataTableEmptyTextClassName(className?: string) {
  return cn("text-sm", text.muted, className);
}

/** Nested antd Table (e.g. ledger line items). */
export function antTableShellClassName(className?: string) {
  return cn(
    "my-2 border rounded-lg overflow-hidden border-[var(--table-container-border)]",
    className,
  );
}

export function antTableSummaryRowClassName(className?: string) {
  return cn("bg-[var(--table-summary-bg)] font-black", className);
}

/** Native HTML tables (finance overview). */
export function nativeTableClassName(className?: string) {
  return cn("w-full text-left text-sm whitespace-nowrap", className);
}

export function nativeTableHeadClassName(className?: string) {
  return cn(
    "text-xs uppercase bg-[var(--table-head-bg)] text-[var(--table-head-fg)]",
    className,
  );
}

export function nativeTableBodyClassName(className?: string) {
  return cn("divide-y divide-[var(--table-row-border)]", className);
}

export function nativeTableRowClassName(className?: string) {
  return cn("hover:bg-[var(--table-row-hover)]", className);
}

export function nativeTableCellMutedClassName(className?: string) {
  return cn("px-4 py-3", text.subtle, className);
}

export function nativeTableCellPrimaryClassName(className?: string) {
  return cn("px-4 py-3 font-medium", text.primary, className);
}

export function nativeTableEmptyCellClassName(className?: string) {
  return cn("text-center py-8", text.muted, className);
}
