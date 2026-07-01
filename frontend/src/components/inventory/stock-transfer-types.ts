import type { Ingredient } from "@/types/api";

export type SourceInventory = { ingredient: Ingredient; stock: number };

export type CreateTransferForm = {
  fromBranchId: number;
  toBranchId: number;
  ingredientId: number;
  quantity: string;
};

export type StatusFilter = "ALL" | "PENDING";
export type DirectionFilter = "ALL" | "incoming" | "outgoing";

export const emptyCreateForm = (): CreateTransferForm => ({
  fromBranchId: 0,
  toBranchId: 0,
  ingredientId: 0,
  quantity: "",
});

export function parseStatusFilter(param: string | null): StatusFilter {
  return param === "PENDING" ? "PENDING" : "ALL";
}

export function parseDirectionFilter(param: string | null): DirectionFilter {
  if (param === "incoming" || param === "outgoing") return param;
  return "ALL";
}

export function branchLabel(name: string | undefined) {
  return name?.trim() || "—";
}

export function transferMatchesSearch(
  transfer: {
    ingredient?: { name?: string | null };
    fromBranch?: { name?: string | null };
    toBranch?: { name?: string | null };
    requestedBy?: { name?: string | null; email?: string | null };
  },
  query: string,
) {
  const ingredient = transfer.ingredient?.name?.toLowerCase() ?? "";
  const from = transfer.fromBranch?.name?.toLowerCase() ?? "";
  const to = transfer.toBranch?.name?.toLowerCase() ?? "";
  const requester = (
    transfer.requestedBy?.name ??
    transfer.requestedBy?.email ??
    ""
  ).toLowerCase();
  return (
    ingredient.includes(query) ||
    from.includes(query) ||
    to.includes(query) ||
    requester.includes(query)
  );
}
