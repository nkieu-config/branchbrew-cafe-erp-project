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
  return cn("bg-[var(--table-summary-bg)] font-bold", className);
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

/**
 * Horizontal scroll region with thin scrollbar.
 * Do not combine with `.data-table-shell` on the same node — antd manages its own scroll body.
 */
export function horizontalScrollHintClassName(className?: string) {
  return cn("scroll-hint-x", className);
}

/** Tap-friendly card row for list pages on narrow viewports (audit, etc.). */
export function listMobileCardClassName(className?: string) {
  return cn(
    "w-full text-left rounded-xl border p-4 transition-colors",
    "bg-[var(--table-container-bg)] border-[var(--table-container-border)]",
    "hover:bg-[var(--table-row-hover)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]/50",
    className,
  );
}

export function dataTableRowHoverClassName(className?: string) {
  return cn("hover:bg-[var(--table-row-hover)]", className);
}

/** Default page-size options for hub list DataTables (Tier A). */
export const HUB_LIST_PAGE_SIZE_OPTIONS = ["10", "15", "25", "50"] as const;

export type HubListPaginationConfig = {
  pageSize?: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: readonly string[];
  hideOnSinglePage?: boolean;
};

/** Standard antd pagination for hub tab list pages. */
export function hubListTablePagination(config: HubListPaginationConfig = {}) {
  const {
    pageSize = 15,
    showSizeChanger = true,
    pageSizeOptions = HUB_LIST_PAGE_SIZE_OPTIONS,
    hideOnSinglePage,
  } = config;
  return {
    pageSize,
    showSizeChanger,
    pageSizeOptions: [...pageSizeOptions],
    ...(hideOnSinglePage != null ? { hideOnSinglePage } : {}),
  };
}

/** Spread onto DataTable inside HubListPage section panels. */
export function hubListDataTableProps(config: HubListPaginationConfig = {}) {
  return {
    hideBorders: true as const,
    pagination: hubListTablePagination(config),
  };
}
