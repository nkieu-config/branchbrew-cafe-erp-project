"use client";

import { Fragment, useCallback, useEffect, useMemo, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HUB_LIST_PAGE_SIZE_OPTIONS } from "@/lib/theme/data-table";
import { dataTableEmptyTextClassName, listMobileCardClassName } from "@/lib/theme/data-table";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";

export const DEFAULT_MOBILE_PAGE_SIZE = 15;

type ListMobileCardProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
} & Omit<ComponentPropsWithoutRef<"button">, "className" | "onClick" | "children" | "type">;

/** Tap-friendly card row for list pages on narrow viewports. */
export function ListMobileCard({ children, className, onClick, ...buttonProps }: ListMobileCardProps) {
  if (onClick) {
    return (
      <button
        type="button"
        className={listMobileCardClassName(className)}
        onClick={onClick}
        {...buttonProps}
      >
        {children}
      </button>
    );
  }

  return (
    <div className={listMobileCardClassName(cn("cursor-default", className))}>{children}</div>
  );
}

export function ListMobileCardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className={listMobileCardClassName("space-y-2")}>
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </>
  );
}

function defaultItemKey<T>(item: T, index: number): string | number {
  if (item && typeof item === "object" && "id" in item) {
    const id = (item as { id: string | number }).id;
    if (id != null) return id;
  }
  return index;
}

export function useMobileListPagination<T>(
  items: readonly T[],
  pageSize: number,
  getItemKey?: (item: T) => string | number,
  controlled?: { page: number; onPageChange: (page: number) => void },
) {
  const [internalPage, setInternalPage] = useState(1);
  const page = controlled?.page ?? internalPage;
  const setPage = controlled?.onPageChange ?? setInternalPage;

  const resolveKey = useCallback(
    (item: T, index: number) => (getItemKey ? getItemKey(item) : defaultItemKey(item, index)),
    [getItemKey],
  );

  const listSignature = useMemo(() => {
    if (items.length === 0) return "empty";
    return `${items.length}:${resolveKey(items[0], 0)}:${resolveKey(items[items.length - 1], items.length - 1)}`;
  }, [items, resolveKey]);

  useEffect(() => {
    setPage(1);
  }, [listSignature]);

  const totalPages = Math.max(1, Math.ceil(items.length / Math.max(pageSize, 1)));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages, setPage]);

  const pageItems = useMemo(() => {
    if (pageSize <= 0 || items.length <= pageSize) return items;
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, pageSize, safePage]);

  return {
    pageItems,
    currentPage: safePage,
    totalPages,
    setPage,
    showPagination: pageSize > 0 && items.length > pageSize,
  };
}

type MobileListPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
};

/** Mobile pagination footer aligned with hub list page sizes. */
export function MobileListPagination({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  className,
}: MobileListPaginationProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-[var(--table-row-border)] pt-3",
        className,
      )}
    >
      <p className={cn("text-sm tabular-nums", text.muted)}>
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-[44px] min-w-[44px]"
          disabled={currentPage <= 1}
          aria-label="Previous page"
          onClick={onPrevious}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-[44px] min-w-[44px]"
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          onClick={onNext}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

type PaginatedMobileListProps<T> = {
  items: readonly T[];
  children: (item: T) => ReactNode;
  pageSize?: number;
  getItemKey?: (item: T) => string | number;
  /** When set with {@link onPageChange}, syncs with antd table pagination. */
  page?: number;
  onPageChange?: (page: number) => void;
};

/**
 * Slice mobile cards to match desktop antd pagination (default page size 15).
 * Pass `pageSize={0}` when desktop shows all rows (no pagination).
 */
export function PaginatedMobileList<T>({
  items,
  children,
  pageSize = DEFAULT_MOBILE_PAGE_SIZE,
  getItemKey,
  page,
  onPageChange,
}: PaginatedMobileListProps<T>) {
  const resolveKey = useCallback(
    (item: T, index: number) => (getItemKey ? getItemKey(item) : defaultItemKey(item, index)),
    [getItemKey],
  );

  const controlled =
    page != null && onPageChange != null ? { page, onPageChange } : undefined;

  const { pageItems, currentPage, totalPages, setPage, showPagination } = useMobileListPagination(
    items,
    pageSize,
    getItemKey,
    controlled,
  );

  return (
    <>
      {pageItems.map((item, index) => (
        <Fragment key={resolveKey(item, index)}>{children(item)}</Fragment>
      ))}
      {showPagination ? (
        <MobileListPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={() => setPage(Math.max(1, currentPage - 1))}
          onNext={() => setPage(Math.min(totalPages, currentPage + 1))}
        />
      ) : null}
    </>
  );
}

export { HUB_LIST_PAGE_SIZE_OPTIONS };

type ResponsiveDataTableLayoutProps = {
  mobile: ReactNode;
  desktop: ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  mobileSkeletonRows?: number;
};

type ResponsiveDataTableSkeletonProps = {
  rows?: number;
};

function ResponsiveDataTableSkeleton({ rows = 4 }: ResponsiveDataTableSkeletonProps) {
  return <ListMobileCardSkeleton rows={rows} />;
}

type ResponsiveDataTableEmptyProps = {
  children?: ReactNode;
  message?: string;
  className?: string;
};

function ResponsiveDataTableEmpty({
  children,
  message = "No records found.",
  className,
}: ResponsiveDataTableEmptyProps) {
  return (
    <p className={cn(dataTableEmptyTextClassName(), "py-8 text-center", className)}>
      {children ?? message}
    </p>
  );
}

/**
 * Splits hub list UI: card stack below `md`, table at `md+`.
 * Wrap `mobile` with {@link PaginatedMobileList} when desktop paginates.
 */
function ResponsiveDataTableLayoutRoot({
  mobile,
  desktop,
  loading = false,
  empty = false,
  emptyMessage = "No records found.",
  mobileSkeletonRows = 4,
}: ResponsiveDataTableLayoutProps) {
  return (
    <>
      <div className="min-w-0 space-y-3 md:hidden">
        {loading ? (
          <ResponsiveDataTableSkeleton rows={mobileSkeletonRows} />
        ) : empty ? (
          <ResponsiveDataTableEmpty message={emptyMessage} />
        ) : (
          mobile
        )}
      </div>
      <div className="hidden min-w-0 md:block">{desktop}</div>
    </>
  );
}

export const ResponsiveDataTableLayout = Object.assign(ResponsiveDataTableLayoutRoot, {
  Empty: ResponsiveDataTableEmpty,
  Skeleton: ResponsiveDataTableSkeleton,
});
