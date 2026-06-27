"use client";

import { useState } from "react";
import { useCustomers, useCustomer360, useCreateCustomer } from '@/hooks/domains/useCrmQueries';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, UserPlus, Star, Award, Crown, Activity, AlertTriangle, CheckCircle2, History, Heart, ShoppingBag, Users, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/intl-date";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { HubPageHeader } from "@/components/shared/hub-card";
import { Customer, Order } from "@/types/api";
import {
  churnRiskTone,
  crmFavoriteChipClassName,
  crmFavoriteCountClassName,
  crmInsightPanelClassName,
  crmMaxTierBadgeClassName,
  crmOrderCardClassName,
  crmOrderIconWrapClassName,
  crmPointsClassName,
  crmPointsSuffixClassName,
  crmSearchInputClassName,
  crmSectionLabelClassName,
  customerTierIconClassName,
  customerTierTone,
  hubCardIconFor,
  hubCtaClassName,
  hubLoadingSpinnerClassName,
  metricValueClassName,
  statusToneClassName,
  text,
} from "@/lib/theme";

function TierIcon({ tier }: { tier: string }) {
  const className = customerTierIconClassName(tier, "w-4 h-4");
  switch (tier?.toUpperCase()) {
    case 'PLATINUM': return <Crown className={className} />;
    case 'GOLD': return <Award className={className} />;
    case 'SILVER': return <Star className={className} />;
    default: return null;
  }
}

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  
  const { data: customersData, isLoading: loading } = useCustomers(debouncedSearch || undefined);
  const customers = customersData || [];
  
  const { data: customer360, isLoading: loading360 } = useCustomer360(drawerOpen ? selectedCustomerId : null);
  const createMutation = useCreateCustomer();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    try {
      await createMutation.mutateAsync({ name, phone });
      toast.success("Customer created!");
      setName(""); setPhone("");
    } catch (error: unknown) {
      if (error instanceof Error) toast.error(error.message || "Failed to create customer");
    }
  };

  const formatCurrency = (val: number) => `฿${val.toLocaleString()}`;

  return (
    <div className="space-y-6">
      <HubPageHeader
        title="Customer Directory"
        icon={Users}
        description="Manage members, tiers, and loyalty points."
        actions={
          <Dialog>
            <DialogTrigger>
              <div className={`flex items-center justify-center px-4 py-2 shadow-md rounded-xl cursor-pointer text-sm font-medium ${hubCtaClassName("crm")}`}>
                <UserPlus className="w-4 h-4 mr-2" />
                New Member
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Register Customer</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="font-bold">Full Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. John Doe" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Phone Number</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} required placeholder="e.g. 0812345678" className="rounded-xl" />
                </div>
                <Button type="submit" className={hubCtaClassName("crm", "w-full text-md font-bold")}>Register</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="glass-card shadow-sm border-[var(--table-container-border)]">
        <CardHeader className="pb-4">
          <div className="relative w-full max-w-sm">
            <Search className={`w-4 h-4 absolute left-3 top-3 ${text.muted}`} />
            <Input
              placeholder="Search by phone…"
              className={crmSearchInputClassName()}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search customers by phone"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-2">
            <DataTable 
              loading={loading}
                columns={[
                  {
                    title: "Customer",
                    dataIndex: "name",
                    key: "name",
                    render: (name) => <span className={`font-bold text-md ${text.primary}`}>{name}</span>
                  },
                  {
                    title: "Phone",
                    dataIndex: "phone",
                    key: "phone",
                    render: (phone) => <span className={`font-mono font-medium ${text.muted}`}>{phone}</span>
                  },
                  {
                    title: "Tier",
                    key: "tier",
                    render: (_, record: Customer) => (
                      <StatusBadge tone={customerTierTone(record.tier)} className="flex w-fit items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg">
                        <TierIcon tier={record.tier} />
                        {record.tier}
                      </StatusBadge>
                    )
                  },
                  {
                    title: "Points",
                    dataIndex: "points",
                    key: "points",
                    render: (points) => (
                      <span className={crmPointsClassName()}>
                        {points} <span className={crmPointsSuffixClassName()}>pts</span>
                      </span>
                    )
                  },
                  {
                    title: "Joined",
                    dataIndex: "createdAt",
                    key: "createdAt",
                    render: (createdAt) => <span className={`font-medium text-sm ${text.muted}`}>{formatDate(createdAt)}</span>
                  }
                ]}
                dataSource={customers}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                onRow={(record) => ({
                  onClick: () => {
                    setSelectedCustomerId(record.id);
                    setDrawerOpen(true);
                  },
                  className: "cursor-pointer"
                })}
                hideBorders
            />
          </div>
        </CardContent>
      </Card>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="font-black text-xl">Customer 360° Profile</SheetTitle>
          </SheetHeader>
          
          {loading360 || !customer360 ? (
            <div className={`flex flex-col items-center justify-center h-64 gap-4 ${text.muted}`}>
              <Loader2 className={`w-8 h-8 ${hubLoadingSpinnerClassName()}`} />
              <p className="font-medium animate-pulse motion-reduce:animate-none">Loading insights…</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-2xl font-black ${text.primary}`}>{customer360.customer.name}</h3>
                  <p className={`font-mono font-medium ${text.muted}`}>{customer360.customer.phone}</p>
                </div>
                <StatusBadge tone={customerTierTone(customer360.customer.tier)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-black uppercase rounded-xl">
                  <TierIcon tier={customer360.customer.tier} />
                  {customer360.customer.tier}
                </StatusBadge>
              </div>

              <div className="h-px bg-border my-4" />

              <div className={`p-4 rounded-2xl border flex items-start gap-3 ${statusToneClassName(churnRiskTone(customer360.churnRisk))}`}>
                {customer360.churnRisk === 'LOW' ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <AlertTriangle className="w-6 h-6 shrink-0" />}
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wider opacity-80 mb-1">Retention Status</h4>
                  <p className="font-black text-lg">
                    {customer360.churnRisk === 'LOW' ? 'Active Customer' : customer360.churnRisk === 'MEDIUM' ? 'At Risk (Slipping Away)' : 'High Churn Risk'}
                  </p>
                  <p className="text-sm font-medium opacity-80 mt-1">
                    Last ordered {customer360.daysSinceLastOrder} days ago
                  </p>
                </div>
              </div>

              <div className={crmInsightPanelClassName()}>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className={crmSectionLabelClassName("mb-0")}>Lifetime Spend</p>
                    <p className={`text-2xl font-black mt-1 ${text.primary}`}>{formatCurrency(customer360.lifetimeSpend)}</p>
                  </div>
                  {customer360.nextTier !== 'MAX' && (
                    <div className="text-right">
                      <p className={`text-xs font-bold uppercase tracking-wider ${text.muted}`}>Next Tier: {customer360.nextTier}</p>
                      <p className={`text-sm font-bold ${metricValueClassName("emerald")}`}>{formatCurrency(customer360.amountToNextTier)} to go</p>
                    </div>
                  )}
                </div>
                {customer360.nextTier !== 'MAX' ? (
                  <Progress value={parseFloat(customer360.progressPercentage.toFixed(1))} className="h-2 mt-3" />
                ) : (
                  <div className={crmMaxTierBadgeClassName()}>Maximum Tier Reached</div>
                )}
              </div>

              <div>
                <h4 className={crmSectionLabelClassName()}><Heart className={`w-4 h-4 ${metricValueClassName("red")}`}/> Top Favorites</h4>
                {customer360.favoriteDrinks.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {customer360.favoriteDrinks.map((fav: { product: { name: string }; count: number }, i: number) => (
                      <div key={i} className={crmFavoriteChipClassName()}>
                        <span className={`font-bold ${metricValueClassName("red")}`}>{fav.product.name}</span>
                        <span className={crmFavoriteCountClassName()}>{fav.count}x</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm italic ${text.muted}`}>No purchase history yet.</p>
                )}
              </div>

              <div>
                <h4 className={crmSectionLabelClassName()}><History className={hubCardIconFor("procurement", "w-4 h-4")}/> Recent Activity</h4>
                {customer360.recentOrders?.length > 0 ? (
                  <div className="space-y-3">
                    {customer360.recentOrders.map((order: Order) => (
                      <div key={order.id} className={crmOrderCardClassName()}>
                        <div className="flex items-center gap-3">
                          <div className={crmOrderIconWrapClassName()}>
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                          <div>
                            <p className={`font-bold ${text.secondary}`}>{formatDate(order.createdAt)}</p>
                            <p className={`text-xs font-medium ${text.muted}`}>{order.items?.length ?? 0} items</p>
                          </div>
                        </div>
                        <div className={`font-black ${text.primary}`}>
                          {formatCurrency(order.netAmount)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm italic ${text.muted}`}>No orders found.</p>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
