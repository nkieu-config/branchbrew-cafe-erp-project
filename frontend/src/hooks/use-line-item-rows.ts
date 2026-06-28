import { useCallback, useMemo, useState } from "react";
import { updateLineItem } from "@/lib/form";

export type LineItemRowsOptions<T extends { rowId: string }> = {
  initial?: T[];
  createEmpty: () => T;
  isDirty?: (row: T) => boolean;
  /** Returns a key to detect duplicates; falsy keys are ignored. */
  duplicateKey?: (row: T) => string | number | null | undefined;
  minRows?: number;
};

export function collectDuplicateKeys<T>(
  items: T[],
  duplicateKey?: (row: T) => string | number | null | undefined,
): Set<string | number> {
  if (!duplicateKey) return new Set();
  const counts = new Map<string | number, number>();
  for (const item of items) {
    const key = duplicateKey(item);
    if (key != null && key !== "" && key !== 0) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return new Set(
    [...counts.entries()].filter(([, count]) => count > 1).map(([key]) => key),
  );
}

export function useLineItemRows<T extends { rowId: string }>({
  initial,
  createEmpty,
  isDirty: isDirtyRow,
  duplicateKey,
  minRows = 1,
}: LineItemRowsOptions<T>) {
  const [items, setItems] = useState<T[]>(() => {
    if (initial != null) return initial;
    return minRows > 0 ? [createEmpty()] : [];
  });

  const addRow = useCallback(() => {
    setItems((prev) => [...prev, createEmpty()]);
  }, [createEmpty]);

  const removeRow = useCallback(
    (index: number) => {
      setItems((prev) => {
        const next = [...prev];
        next.splice(index, 1);
        if (next.length >= minRows) return next;
        if (minRows === 0) return [];
        return [createEmpty()];
      });
    },
    [createEmpty, minRows],
  );

  const updateRow = useCallback(<K extends keyof T>(index: number, field: K, value: T[K]) => {
    setItems((prev) => updateLineItem(prev, index, field, value));
  }, []);

  const resetRows = useCallback(() => {
    setItems(minRows > 0 ? [createEmpty()] : []);
  }, [createEmpty, minRows]);

  const duplicateKeys = useMemo(
    () => collectDuplicateKeys(items, duplicateKey),
    [items, duplicateKey],
  );

  const isDirty = useMemo(
    () =>
      isDirtyRow
        ? items.some(isDirtyRow)
        : minRows === 0
          ? items.length > 0
          : items.length > 1,
    [items, isDirtyRow, minRows],
  );

  return {
    items,
    setItems,
    addRow,
    removeRow,
    updateRow,
    resetRows,
    duplicateKeys,
    isDirty,
  };
}
