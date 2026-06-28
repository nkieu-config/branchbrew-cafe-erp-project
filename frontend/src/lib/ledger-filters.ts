import type { JournalEntry } from "@/types/api";

export type JournalStatusFilter = "ALL" | "DRAFT" | "POSTED";

export type LedgerChartPoint = {
  month: string;
  revenue: number;
  expense: number;
};

export function journalStatusLabel(status: JournalEntry["status"] | string): string {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "POSTED":
      return "Posted";
    default:
      return String(status).replace(/_/g, " ").toLowerCase();
  }
}

export function summarizeJournalEntries(entries: JournalEntry[]) {
  let draft = 0;
  let posted = 0;
  let lineCount = 0;

  for (const entry of entries) {
    if (entry.status === "DRAFT") draft += 1;
    if (entry.status === "POSTED") posted += 1;
    lineCount += entry.lines?.length ?? 0;
  }

  return {
    total: entries.length,
    draft,
    posted,
    lineCount,
  };
}

export function summarizeLedgerChart(points: LedgerChartPoint[]) {
  let totalRevenue = 0;
  let totalExpense = 0;

  for (const point of points) {
    totalRevenue += point.revenue ?? 0;
    totalExpense += point.expense ?? 0;
  }

  return {
    months: points.length,
    totalRevenue,
    totalExpense,
    net: totalRevenue - totalExpense,
  };
}

export function matchesJournalStatusFilter(
  entry: JournalEntry,
  filter: JournalStatusFilter,
): boolean {
  return filter === "ALL" || entry.status === filter;
}

export function matchesJournalSearch(entry: JournalEntry, search: string): boolean {
  if (!search) return true;
  const haystack = [
    entry.reference ?? "",
    entry.description ?? "",
    entry.status,
    journalStatusLabel(entry.status),
    ...(entry.lines ?? []).flatMap((line) => [
      line.account?.code ?? "",
      line.account?.name ?? "",
      line.description ?? "",
    ]),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(search);
}

export function filterJournalEntries(
  entries: JournalEntry[],
  options: {
    statusFilter: JournalStatusFilter;
    search: string;
  },
): JournalEntry[] {
  return entries.filter(
    (entry) =>
      matchesJournalStatusFilter(entry, options.statusFilter) &&
      matchesJournalSearch(entry, options.search),
  );
}
