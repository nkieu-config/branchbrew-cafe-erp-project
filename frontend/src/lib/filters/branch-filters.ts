import type { Branch } from "@/types/api";

export type BranchTypeFilter = "ALL" | "central" | "franchise";

export function branchTypeLabel(isCentralKitchen?: boolean): string {
  return isCentralKitchen ? "Central kitchen" : "Franchise";
}

export function summarizeBranches(branches: Branch[]) {
  let centralKitchen = 0;
  let franchise = 0;

  for (const branch of branches) {
    if (branch.isCentralKitchen) {
      centralKitchen += 1;
    } else {
      franchise += 1;
    }
  }

  return {
    total: branches.length,
    centralKitchen,
    franchise,
  };
}

export function matchesBranchTypeFilter(
  branch: Branch,
  filter: BranchTypeFilter,
): boolean {
  if (filter === "ALL") return true;
  if (filter === "central") return Boolean(branch.isCentralKitchen);
  return !branch.isCentralKitchen;
}

export function matchesBranchSearch(branch: Branch, search: string): boolean {
  if (!search) return true;
  const haystack = [
    branch.name,
    branch.location ?? "",
    String(branch.id),
    branchTypeLabel(branch.isCentralKitchen),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(search);
}

export function filterBranches(
  branches: Branch[],
  options: {
    typeFilter: BranchTypeFilter;
    search: string;
  },
): Branch[] {
  return branches.filter(
    (branch) =>
      matchesBranchTypeFilter(branch, options.typeFilter) &&
      matchesBranchSearch(branch, options.search),
  );
}
