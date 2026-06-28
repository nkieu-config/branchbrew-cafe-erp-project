"use client";

import { useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { useCustomers, useCustomer360, useCreateCustomer } from "@/hooks/domains/useCrmQueries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { HubListPage } from "@/components/shared/hub-list-page";
import { ListFilterSelect } from "@/components/shared/list-filters";
import { HubPageHeader } from "@/components/shared/hub-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserPlus,
  Star,
  Award,
  Crown,
  AlertTriangle,
  CheckCircle2,
  History,
  Heart,
  ShoppingBag,
  Users,
  Loader2,
  User,
} from "lucide-react";
import { formatDate } from "@/lib/intl-date";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Customer, Order, Tier } from "@/types/api";
import {
  churnRiskTone,
  crmDialogContentClassName,
  crmFavoriteChipClassName,
  crmFavoriteCountClassName,
  crmInsightPanelClassName,
  crmMaxTierBadgeClassName,
  crmOrderCardClassName,
  crmOrderIconWrapClassName,
  crmPointsClassName,
  crmPointsSuffixClassName,
  crmProgressClassName,
  crmSectionLabelClassName,
  crmSectionPanelClassName,
  crmSheetContentClassName,
  customerTierIconClassName,
  customerTierTone,
  formFieldInsetClassName,
  hubCardIconFor,
  hubCtaClassName,
  hubListDataTableProps,
  hubLoadingSpinnerClassName,
  metricValueClassName,
  statusToneClassName,
  typeHeadingClassName,
  typeSectionLabelClassName,
  typeUiLabelClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

type TierFilter = "ALL" | Tier;

function TierIcon({ tier }: { tier: string }) {
  const className = customerTierIconClassName(tier, "w-4 h-4");
  switch (tier?.toUpperCase()) {
    case "PLATINUM":
      return <Crown className={className} aria-hidden />;
    case "GOLD":
      return <Award className={className} aria-hidden />;
    case "SILVER":
      return <Star className={className} aria-hidden />;
    default:
      return <User className={className} aria-hidden />;
  }
}

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const [tierFilter, setTierFilter] = useState<TierFilter>("ALL");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  const {
    data: customersData,
    isLoading: loading,
    isError,
    error,
    refetch,
    isFetching,
  } = useCustomers(debouncedSearch || undefined);
  const customers = customersData || [];

  const { data: customer360, isLoading: loading360 } = useCustomer360(
    drawerOpen ? selectedCustomerId : null,
  );
  const createMutation = useCreateCustomer();

  const tierSummary = useMemo(() => {
    const counts = { platinum: 0, gold: 0, silver: 0, regular: 0 };
    for (const c of customers) {
      switch (c.tier?.toUpperCase()) {
        case "PLATINUM":
          counts.platinum += 1;
          break;
        case "GOLD":
          counts.gold += 1;
          break;
        case "SILVER":
          counts.silver += 1;
          break;
        default:
          counts.regular += 1;
      }
    }
    return { total: customers.length, ...counts };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    if (tierFilter === "ALL") return customers;
    return customers.filter((c: Customer) => c.tier === tierFilter);
  }, [customers, tierFilter]);

  const hasActiveFilters = search.trim().length > 0 || tierFilter !== "ALL";

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    try {
      await createMutation.mutateAsync({ name, phone });
      toast.success("Customer created!");
      setName("");
      setPhone("");
      setRegisterOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to create customer"));
    }
  };

  const openDrawer = (id: number) => {
    setSelectedCustomerId(id);
    setDrawerOpen(true);
  };

  const formatCurrency = (val: number) => `฿${val.toLocaleString()}`;

  const columns = useMemo(
    () =>
      [
        {
          title: "Customer",
          dataIndex: "name",
          key: "name",
          render: (name: string) => (
            <span className={typeUiLabelClassName(cn("text-md", text.primary))}>{name}</span>
          ),
        },
        {
          title: "Phone",
          dataIndex: "phone",
          key: "phone",
          responsive: ["md"],
          render: (phone: string) => (
            <span className={cn("font-mono font-medium", text.muted)}>{phone}</span>
          ),
        },
        {
          title: "Tier",
          key: "tier",
          render: (_: unknown, record: Customer) => (
            <StatusBadge
              tone={customerTierTone(record.tier)}
              className={typeHeadingClassName(
                "flex w-fit items-center gap-1.5 px-2.5 py-1 text-xs uppercase tracking-wider rounded-lg",
              )}
            >
              <TierIcon tier={record.tier} />
              {record.tier}
            </StatusBadge>
          ),
        },
        {
          title: "Points",
          dataIndex: "points",
          key: "points",
          render: (points: number) => (
            <span className={crmPointsClassName()}>
              {points.toLocaleString()}{" "}
              <span className={crmPointsSuffixClassName()}>pts</span>
            </span>
          ),
        },
        {
          title: "Joined",
          dataIndex: "createdAt",
          key: "createdAt",
          responsive: ["lg"],
          render: (createdAt: string) => (
            <span className={cn("font-medium text-sm", text.muted)}>
              {formatDate(createdAt)}
            </span>
          ),
        },
      ] as ColumnsType<Customer>,
    [],
  );

  return (
    <>
      <HubPageHeader
        hideTitle
        icon={Users}
        accentHub="crm"
        actions={
          <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
            <DialogTrigger
              render={
                <Button className={hubCtaClassName("crm", "font-medium")}>
                  <UserPlus className="w-4 h-4 mr-2" aria-hidden />
                  New Member
                </Button>
              }
            />
            <DialogContent className={crmDialogContentClassName()}>
              <DialogHeader>
                <DialogTitle className={typeHeadingClassName("text-xl")}>Register Customer</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-name" className={text.secondary}>
                    Full Name
                  </Label>
                  <Input
                    id="customer-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. John Doe"
                    className={formFieldInsetClassName()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-phone" className={text.secondary}>
                    Phone Number
                  </Label>
                  <Input
                    id="customer-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="e.g. 0812345678"
                    className={formFieldInsetClassName()}
                  />
                </div>
                <Button
                  type="submit"
                  className={hubCtaClassName("crm", "w-full text-md")}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Registering…" : "Register"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <HubListPage className={crmSectionPanelClassName()}>
        <HubListPage.Error
          message={isError ? getErrorMessage(error, "Failed to load customers") : undefined}
          onRetry={() => void refetch()}
          loading={isFetching}
        />

        <HubListPage.Toolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name or phone…"
          showReset={hasActiveFilters}
          onReset={() => {
            setSearch("");
            setTierFilter("ALL");
          }}
          filters={
            <ListFilterSelect
              value={tierFilter}
              onValueChange={(value) => setTierFilter(value as TierFilter)}
              ariaLabel="Filter by tier"
              widthClassName="w-full sm:w-[180px]"
              options={[
                { value: "ALL", label: "All tiers" },
                { value: "PLATINUM", label: "Platinum" },
                { value: "GOLD", label: "Gold" },
                { value: "SILVER", label: "Silver" },
                { value: "REGULAR", label: "Regular" },
              ]}
            />
          }
        />

        <HubListPage.Count
          isLoading={loading}
          isError={isError}
          isFetching={isFetching}
          hasActiveFilters={hasActiveFilters}
          filteredCount={filteredCustomers.length}
          totalCount={tierSummary.total}
          itemLabel="member"
          emptyLabel="No members yet"
        />

        <DataTable
          {...hubListDataTableProps()}
          loading={loading && !isError}
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="id"
          emptyDescription={
            hasActiveFilters
              ? "No members match your filters."
              : "No members registered yet."
          }
          onRow={(record) => ({
            onClick: () => openDrawer(record.id),
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openDrawer(record.id);
              }
            },
            tabIndex: 0,
            role: "button",
            "aria-label": `View profile for ${record.name}`,
            className:
              "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          })}
        />
      </HubListPage>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          className={crmSheetContentClassName("w-full sm:max-w-xl overflow-y-auto")}
        >
          <SheetHeader className="mb-4">
            <SheetTitle className={typeHeadingClassName("text-xl")}>Customer 360° Profile</SheetTitle>
          </SheetHeader>

          {loading360 || !customer360 ? (
            <div className={cn("flex flex-col items-center justify-center h-64 gap-4", text.muted)}>
              <Loader2 className={cn("w-8 h-8", hubLoadingSpinnerClassName())} />
              <p className="font-medium animate-pulse motion-reduce:animate-none">
                Loading insights…
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className={typeHeadingClassName("text-xl sm:text-2xl truncate")}>
                    {customer360.customer.name}
                  </h3>
                  <p className={cn("font-mono font-medium text-sm", text.muted)}>
                    {customer360.customer.phone}
                  </p>
                </div>
                <StatusBadge
                  tone={customerTierTone(customer360.customer.tier)}
                  className={typeUiLabelClassName(
                    "flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-sm uppercase rounded-xl",
                  )}
                >
                  <TierIcon tier={customer360.customer.tier} />
                  {customer360.customer.tier}
                </StatusBadge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  className={cn(
                    "p-3 sm:p-4 rounded-2xl border flex items-start gap-3",
                    statusToneClassName(churnRiskTone(customer360.churnRisk)),
                  )}
                >
                  {customer360.churnRisk === "LOW" ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden />
                  ) : (
                    <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden />
                  )}
                  <div className="min-w-0">
                    <h4 className={typeUiLabelClassName("text-xs uppercase tracking-wider opacity-80 mb-1")}>
                      Retention Status
                    </h4>
                    <p className={typeHeadingClassName("text-base")}>
                      {customer360.churnRisk === "LOW"
                        ? "Active Customer"
                        : customer360.churnRisk === "MEDIUM"
                          ? "At Risk (Slipping Away)"
                          : "High Churn Risk"}
                    </p>
                    <p className={cn("text-xs font-medium opacity-80 mt-1", text.muted)}>
                      Last ordered {customer360.daysSinceLastOrder} days ago
                    </p>
                  </div>
                </div>

                <div className={crmInsightPanelClassName("p-3 sm:p-4")}>
                  <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row sm:justify-between sm:items-end mb-2">
                    <div>
                      <p className={crmSectionLabelClassName("mb-0")}>Lifetime Spend</p>
                      <p className={typeHeadingClassName("text-xl sm:text-2xl mt-1")}>
                        {formatCurrency(customer360.lifetimeSpend)}
                      </p>
                    </div>
                    {customer360.nextTier !== "MAX" && (
                      <div className="sm:text-right">
                        <p className={typeSectionLabelClassName()}>
                          Next Tier: {customer360.nextTier}
                        </p>
                        <p className={typeUiLabelClassName(cn("text-sm", metricValueClassName("emerald")))}>
                          {formatCurrency(customer360.amountToNextTier)} to go
                        </p>
                      </div>
                    )}
                  </div>
                  {customer360.nextTier !== "MAX" ? (
                    <Progress
                      value={parseFloat(customer360.progressPercentage.toFixed(1))}
                      className={crmProgressClassName()}
                    />
                  ) : (
                    <div className={crmMaxTierBadgeClassName()}>Maximum Tier Reached</div>
                  )}
                </div>
              </div>

              <div>
                <h4 className={crmSectionLabelClassName()}>
                  <Heart className={hubCardIconFor("crm", "w-4 h-4")} aria-hidden /> Top Favorites
                </h4>
                {customer360.favoriteDrinks.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {customer360.favoriteDrinks.map(
                      (fav: { product: { name: string }; count: number }, i: number) => (
                        <div key={i} className={crmFavoriteChipClassName()}>
                          <span className={typeUiLabelClassName(text.secondary)}>
                            {fav.product.name}
                          </span>
                          <span className={crmFavoriteCountClassName()}>{fav.count}x</span>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p className={cn("text-sm italic", text.muted)}>No purchase history yet.</p>
                )}
              </div>

              <div>
                <h4 className={crmSectionLabelClassName()}>
                  <History className={hubCardIconFor("crm", "w-4 h-4")} aria-hidden /> Recent
                  Activity
                </h4>
                {customer360.recentOrders?.length > 0 ? (
                  <div className="space-y-3">
                    {customer360.recentOrders.map((order: Order) => (
                      <div key={order.id} className={crmOrderCardClassName()}>
                        <div className="flex items-center gap-3">
                          <div className={crmOrderIconWrapClassName()}>
                            <ShoppingBag className="w-4 h-4" aria-hidden />
                          </div>
                          <div>
                            <p className={typeUiLabelClassName(text.secondary)}>
                              {formatDate(order.createdAt)}
                            </p>
                            <p className={cn("text-xs font-medium", text.muted)}>
                              {order.items?.length ?? 0} items
                            </p>
                          </div>
                        </div>
                        <div className={typeUiLabelClassName(text.primary)}>
                          {formatCurrency(order.netAmount)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={cn("text-sm italic", text.muted)}>No orders found.</p>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
