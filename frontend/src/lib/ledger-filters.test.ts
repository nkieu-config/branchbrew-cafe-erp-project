import { describe, expect, it } from "vitest";
import type { JournalEntry } from "@/types/api";
import {
  filterJournalEntries,
  journalStatusLabel,
  summarizeJournalEntries,
  summarizeLedgerChart,
} from "./ledger-filters";

describe("ledger-filters", () => {
  const entries = [
    {
      id: 1,
      date: "2026-06-28",
      reference: "JE-001",
      description: "Daily sales",
      status: "POSTED",
      lines: [{ id: 1, debit: 1000, credit: 0, account: { code: "4000", name: "Revenue" } }],
    },
    {
      id: 2,
      date: "2026-06-27",
      reference: "JE-002",
      description: "Petty cash",
      status: "DRAFT",
      lines: [],
    },
  ] as JournalEntry[];

  it("labels journal statuses", () => {
    expect(journalStatusLabel("POSTED")).toBe("Posted");
  });

  it("summarizes journal entries", () => {
    const summary = summarizeJournalEntries(entries);
    expect(summary.total).toBe(2);
    expect(summary.posted).toBe(1);
    expect(summary.draft).toBe(1);
    expect(summary.lineCount).toBe(1);
  });

  it("summarizes ledger chart points", () => {
    const summary = summarizeLedgerChart([
      { month: "Jun", revenue: 10000, expense: 4000 },
      { month: "Jul", revenue: 12000, expense: 5000 },
    ]);
    expect(summary.months).toBe(2);
    expect(summary.net).toBe(13000);
  });

  it("filters entries by status and search", () => {
    const draftOnly = filterJournalEntries(entries, {
      statusFilter: "DRAFT",
      search: "",
    });
    expect(draftOnly).toHaveLength(1);

    const byRef = filterJournalEntries(entries, {
      statusFilter: "ALL",
      search: "je-001",
    });
    expect(byRef).toHaveLength(1);
  });
});
