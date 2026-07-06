import type { Account, AccountTreeGroup, AccountType } from "@/types/api";

export type AccountTypeFilter = "ALL" | AccountType;
export type AccountActiveFilter = "ALL" | "active" | "inactive";

const ACCOUNT_TYPES: AccountType[] = [
  "ASSET",
  "LIABILITY",
  "EQUITY",
  "REVENUE",
  "EXPENSE",
];

export function accountTypeLabel(type: AccountType | string): string {
  switch (type) {
    case "ASSET":
      return "Asset";
    case "LIABILITY":
      return "Liability";
    case "EQUITY":
      return "Equity";
    case "REVENUE":
      return "Revenue";
    case "EXPENSE":
      return "Expense";
    default:
      return String(type).replace(/_/g, " ").toLowerCase();
  }
}

export function summarizeAccounts(accounts: Account[]) {
  let active = 0;
  let inactive = 0;
  const byType: Record<AccountType, number> = {
    ASSET: 0,
    LIABILITY: 0,
    EQUITY: 0,
    REVENUE: 0,
    EXPENSE: 0,
  };

  for (const account of accounts) {
    if (account.isActive) active += 1;
    else inactive += 1;
    byType[account.type] += 1;
  }

  return {
    total: accounts.length,
    active,
    inactive,
    byType,
  };
}

export function matchesAccountTypeFilter(
  account: Account,
  filter: AccountTypeFilter,
): boolean {
  return filter === "ALL" || account.type === filter;
}

export function matchesAccountActiveFilter(
  account: Account,
  filter: AccountActiveFilter,
): boolean {
  if (filter === "ALL") return true;
  if (filter === "active") return account.isActive;
  return !account.isActive;
}

export function matchesAccountSearch(account: Account, search: string): boolean {
  if (!search) return true;
  const haystack = [
    account.code,
    account.name,
    account.type,
    accountTypeLabel(account.type),
    account.description ?? "",
    account.isActive ? "active" : "inactive",
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(search);
}

export function filterAccountTree(
  tree: AccountTreeGroup[],
  options: {
    search: string;
    typeFilter: AccountTypeFilter;
    activeFilter: AccountActiveFilter;
  },
): AccountTreeGroup[] {
  return tree
    .map((group) => ({
      ...group,
      children: group.children.filter(
        (account) =>
          matchesAccountTypeFilter(account, options.typeFilter) &&
          matchesAccountActiveFilter(account, options.activeFilter) &&
          matchesAccountSearch(account, options.search),
      ),
    }))
    .filter(
      (group) =>
        (options.typeFilter === "ALL" || group.type === options.typeFilter) &&
        group.children.length > 0,
    );
}

export function accountTypesForLegend(): AccountType[] {
  return ACCOUNT_TYPES;
}
