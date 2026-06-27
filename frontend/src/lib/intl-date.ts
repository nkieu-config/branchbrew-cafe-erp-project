const DEFAULT_LOCALE = "th-TH";

type DateInput = string | Date | number;

function toDate(input: DateInput): Date | null {
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(
  input: DateInput,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = toDate(input);
  if (!date) return "—";
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(date);
}

export function formatTime(
  input: DateInput,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = toDate(input);
  if (!date) return "—";
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(date);
}

export function formatDateTime(
  input: DateInput,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = toDate(input);
  if (!date) return "—";
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(date);
}

export function formatDateTimeSeconds(input: DateInput): string {
  const date = toDate(input);
  if (!date) return "—";
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export function formatDateRange(start: DateInput, end: DateInput): string {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

/** ISO calendar date for filters/API keys (yyyy-MM-dd). */
export function formatIsoDate(input: DateInput): string {
  const date = toDate(input);
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
