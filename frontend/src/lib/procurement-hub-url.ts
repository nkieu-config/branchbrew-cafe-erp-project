import type { POHighlightFilter, POStatusFilter } from "@/lib/purchase-order-filters";

const PO_STATUS_PARAMS: POStatusFilter[] = [
  "DRAFT",
  "PENDING",
  "APPROVED",
  "RECEIVED",
];

export type ProcurementOrdersQuery = {
  status?: Exclude<POStatusFilter, "ALL">;
  supplier?: number;
  auto?: boolean;
};

export function buildProcurementOrdersUrl(query?: ProcurementOrdersQuery): string {
  const params = new URLSearchParams();
  if (query?.status) params.set("status", query.status);
  if (query?.supplier != null) params.set("supplier", String(query.supplier));
  if (query?.auto) params.set("auto", "1");
  const qs = params.toString();
  return qs ? `/procurement/orders?${qs}` : "/procurement/orders";
}

export function parseProcurementOrdersSearchParams(searchParams: URLSearchParams): {
  status: POStatusFilter;
  supplierId: number | null;
  highlightFilter: POHighlightFilter;
} {
  const rawStatus = searchParams.get("status")?.toUpperCase() ?? null;
  const status = PO_STATUS_PARAMS.includes(rawStatus as POStatusFilter)
    ? (rawStatus as POStatusFilter)
    : "ALL";
  const supplierRaw = searchParams.get("supplier");
  const supplierId =
    supplierRaw != null && supplierRaw !== "" ? Number(supplierRaw) : null;
  const highlightFilter = searchParams.get("auto") === "1" ? "auto-draft" : "ALL";
  return {
    status,
    supplierId: Number.isFinite(supplierId) ? supplierId : null,
    highlightFilter,
  };
}
