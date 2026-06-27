/** Customer-facing queue number (e.g. 007). */
export function formatQueueNumber(value: number | null | undefined): string {
  if (value == null || value <= 0) return '—';
  return String(value).padStart(3, '0');
}
