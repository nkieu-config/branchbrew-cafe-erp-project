import { cn } from "@/lib/utils";
import { text } from "./surface";

/** Shared antd DataTable shell — used by `components/shared/data-table.tsx`. */
export function dataTableContainerClassName(
  options?: { hideBorders?: boolean },
  className?: string,
) {
  return cn(
    "data-table-shell",
    "[&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:uppercase",
    "[&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:tracking-wider",
    "[&_.ant-pagination]:px-4 [&_.ant-pagination]:pb-4",
    options?.hideBorders && "data-table-shell--flat",
    className,
  );
}

export function dataTableSkeletonClassName(
  options?: { hideBorders?: boolean },
  className?: string,
) {
  return cn(
    dataTableContainerClassName(options),
    "p-4",
    className,
  );
}

export function dataTableEmptyIconClassName(className?: string) {
  return cn("w-10 h-10 mx-auto mb-3 text-[var(--table-empty-icon)]", className);
}

export function dataTableEmptyTextClassName(className?: string) {
  return cn("text-sm", text.muted, className);
}

/** Nested antd Table (e.g. ledger line items). Styles inherit from parent `.data-table-shell`. */
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
  return cn("native-table", className);
}

export function nativeTableHeadClassName(className?: string) {
  return cn(className);
}

export function nativeTableBodyClassName(className?: string) {
  return cn(className);
}

export function nativeTableRowClassName(className?: string) {
  return cn(className);
}

export function nativeTableCellMutedClassName(className?: string) {
  return cn("px-4 py-3 text-[var(--table-cell-muted-fg)]", className);
}

export function nativeTableCellPrimaryClassName(className?: string) {
  return cn("px-4 py-3 font-medium text-[var(--table-cell-fg)]", className);
}

export function nativeTableEmptyCellClassName(className?: string) {
  return cn("text-center py-8 text-[var(--text-subtle)]", className);
}

/** shadcn/ui Table wrapper — audit log and similar native table components. */
export function semanticTableClassName(className?: string) {
  return cn("semantic-table", className);
}
