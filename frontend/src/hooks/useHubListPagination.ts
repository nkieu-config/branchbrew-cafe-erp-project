"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { TablePaginationConfig } from "antd/es/table";
import {
  HUB_LIST_PAGE_SIZE_OPTIONS,
  type HubListPaginationConfig,
} from "@/lib/theme/data-table";

/**
 * Shared pagination state for hub lists — keeps antd DataTable and
 * {@link PaginatedMobileList} on the same page + page size.
 */
export function useHubListPagination(
  config: HubListPaginationConfig = {},
  resetKey?: string | number,
) {
  const {
    pageSize: initialPageSize = 15,
    showSizeChanger = true,
    pageSizeOptions = HUB_LIST_PAGE_SIZE_OPTIONS,
    hideOnSinglePage,
  } = config;

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  useEffect(() => {
    setPageSize(initialPageSize);
    setCurrentPage(1);
  }, [initialPageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [resetKey]);

  const resetPage = useCallback(() => setCurrentPage(1), []);

  const tablePagination = useMemo<TablePaginationConfig>(
    () => ({
      current: currentPage,
      pageSize,
      showSizeChanger,
      pageSizeOptions: [...pageSizeOptions],
      ...(hideOnSinglePage != null ? { hideOnSinglePage } : {}),
      onChange: (page, size) => {
        setCurrentPage(page);
        if (size !== pageSize) {
          setPageSize(size);
        }
      },
      onShowSizeChange: (_current, size) => {
        setPageSize(size);
        setCurrentPage(1);
      },
    }),
    [currentPage, pageSize, showSizeChanger, pageSizeOptions, hideOnSinglePage],
  );

  return {
    tablePagination,
    pageSize,
    currentPage,
    setCurrentPage,
    resetPage,
  };
}
