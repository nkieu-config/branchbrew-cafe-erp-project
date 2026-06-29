"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Heart,
  History,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { useCustomer360 } from "@/hooks/domains/useCrmQueries";
import { formatBaht } from "@/lib/money";
import { formatDate } from "@/lib/intl-date";
import { StatusBadge } from "@/components/shared/status-badge";
import { TierIcon } from "@/components/crm/TierIcon";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Customer360, Order } from "@/types/api";
import {
  churnRiskTone,
  crmFavoriteChipClassName,
  crmFavoriteCountClassName,
  crmInsightPanelClassName,
  crmMaxTierBadgeClassName,
  crmOrderCardClassName,
  crmOrderIconWrapClassName,
  crmProgressClassName,
  crmSectionLabelClassName,
  crmSheetContentClassName,
  customerTierTone,
} from "@/lib/theme/hub-crm";
import { hubCardIconFor, hubLoadingSpinnerClassName } from "@/lib/theme/hub-primitives";
import { metricValueClassName } from "@/lib/theme/metric";
import { statusToneClassName } from "@/lib/theme/status";
import { text } from "@/lib/theme/surface";
import {
  typeHeadingClassName,
  typeSectionLabelClassName,
  typeUiLabelClassName,
} from "@/lib/theme/typography";
import { cn } from "@/lib/utils";

type Customer360SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: number | null;
};

function Customer360Profile({ data }: { data: Customer360 }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className={typeHeadingClassName("text-xl sm:text-2xl truncate")}>
            {data.customer.name}
          </h3>
          <p className={cn("font-mono font-medium text-sm", text.muted)}>{data.customer.phone}</p>
        </div>
        <StatusBadge
          tone={customerTierTone(data.customer.tier)}
          className={typeUiLabelClassName(
            "flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-sm uppercase rounded-xl",
          )}
        >
          <TierIcon tier={data.customer.tier} />
          {data.customer.tier}
        </StatusBadge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          className={cn(
            "p-3 sm:p-4 rounded-2xl border flex items-start gap-3",
            statusToneClassName(churnRiskTone(data.churnRisk)),
          )}
        >
          {data.churnRisk === "LOW" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden />
          )}
          <div className="min-w-0">
            <h4 className={typeUiLabelClassName("text-xs uppercase tracking-wider opacity-80 mb-1")}>
              Retention Status
            </h4>
            <p className={typeHeadingClassName("text-base")}>
              {data.churnRisk === "LOW"
                ? "Active Customer"
                : data.churnRisk === "MEDIUM"
                  ? "At Risk (Slipping Away)"
                  : "High Churn Risk"}
            </p>
            <p className={cn("text-xs font-medium opacity-80 mt-1", text.muted)}>
              Last ordered {data.daysSinceLastOrder} days ago
            </p>
          </div>
        </div>

        <div className={crmInsightPanelClassName("p-3 sm:p-4")}>
          <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row sm:justify-between sm:items-end mb-2">
            <div>
              <p className={crmSectionLabelClassName("mb-0")}>Lifetime Spend</p>
              <p className={typeHeadingClassName("text-xl sm:text-2xl mt-1")}>
                {formatBaht(data.lifetimeSpend)}
              </p>
            </div>
            {data.nextTier !== "MAX" && (
              <div className="sm:text-right">
                <p className={typeSectionLabelClassName()}>Next Tier: {data.nextTier}</p>
                <p className={typeUiLabelClassName(cn("text-sm", metricValueClassName("emerald")))}>
                  {formatBaht(data.amountToNextTier)} to go
                </p>
              </div>
            )}
          </div>
          {data.nextTier !== "MAX" ? (
            <Progress
              value={parseFloat(data.progressPercentage.toFixed(1))}
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
        {data.favoriteDrinks.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.favoriteDrinks.map((fav, i) => (
              <div key={i} className={crmFavoriteChipClassName()}>
                <span className={typeUiLabelClassName(text.secondary)}>{fav.product.name}</span>
                <span className={crmFavoriteCountClassName()}>{fav.count}x</span>
              </div>
            ))}
          </div>
        ) : (
          <p className={cn("text-sm italic", text.muted)}>No purchase history yet.</p>
        )}
      </div>

      <div>
        <h4 className={crmSectionLabelClassName()}>
          <History className={hubCardIconFor("crm", "w-4 h-4")} aria-hidden /> Recent Activity
        </h4>
        {data.recentOrders?.length > 0 ? (
          <div className="space-y-3">
            {data.recentOrders.map((order: Order) => (
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
                  {formatBaht(order.netAmount)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={cn("text-sm italic", text.muted)}>No orders found.</p>
        )}
      </div>
    </div>
  );
}

export function Customer360Sheet({ open, onOpenChange, customerId }: Customer360SheetProps) {
  const { data: customer360, isLoading } = useCustomer360(open ? customerId : null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={crmSheetContentClassName("w-full sm:max-w-xl overflow-y-auto")}>
        <SheetHeader className="mb-4">
          <SheetTitle className={typeHeadingClassName("text-xl")}>Customer 360° Profile</SheetTitle>
        </SheetHeader>

        {isLoading || !customer360 ? (
          <div className={cn("flex flex-col items-center justify-center h-64 gap-4", text.muted)}>
            <Loader2 className={cn("w-8 h-8", hubLoadingSpinnerClassName())} />
            <p className="font-medium animate-pulse motion-reduce:animate-none">Loading insights…</p>
          </div>
        ) : (
          <Customer360Profile data={customer360} />
        )}
      </SheetContent>
    </Sheet>
  );
}
