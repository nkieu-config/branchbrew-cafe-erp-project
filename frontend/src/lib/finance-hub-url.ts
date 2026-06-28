export type FinanceOverviewQuery = {
  status?: "PENDING" | "APPROVED" | "REJECTED";
};

export function buildFinanceOverviewUrl(query?: FinanceOverviewQuery): string {
  const params = new URLSearchParams();
  if (query?.status) params.set("status", query.status);
  const qs = params.toString();
  return qs ? `/finance/overview?${qs}` : "/finance/overview";
}

export function parseFinanceOverviewSearchParams(searchParams: URLSearchParams): {
  statusFilter: "ALL" | "PENDING" | "APPROVED" | "REJECTED";
} {
  const status = searchParams.get("status");
  if (status === "PENDING" || status === "APPROVED" || status === "REJECTED") {
    return { statusFilter: status };
  }
  return { statusFilter: "ALL" };
}
