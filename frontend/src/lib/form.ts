/** Immutable update for a single field on a line-item row in a form list. */
export function updateLineItem<T extends object>(
  items: T[],
  index: number,
  field: keyof T,
  value: T[keyof T],
): T[] {
  const next = [...items];
  next[index] = { ...next[index], [field]: value };
  return next;
}

/** Filter master-data rows where isActive is not explicitly false. */
export function filterActive<T extends { isActive?: boolean }>(items: T[]): T[] {
  return items.filter((item) => item.isActive !== false);
}
