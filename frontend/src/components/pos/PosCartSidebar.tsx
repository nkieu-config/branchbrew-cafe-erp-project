"use client";

import {
  Award,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Ticket,
  User,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pointsToDiscountAmount } from "@/lib/loyalty";
import { formatCurrency } from "@/lib/money";
import type { PosCartItem } from "@/lib/pos-cart";
import {
  posAccentIconClassName,
  posAccentTextClassName,
  posCartBadgeClassName,
  posCartEmptyIconClassName,
  posCartEmptyStateClassName,
  posCartHeaderClassName,
  posCartItemNameClassName,
  posCartLineActionsClassName,
  posCartLineDividerClassName,
  posCartLineTotalClassName,
  posCartPanelClassName,
  posCartQtyClassName,
  posCartSectionClassName,
  posCartTitleClassName,
  posCartTouchButtonClassName,
  posCrmMutedClassName,
  posCrmPanelClassName,
  posCrmTierBadgeClassName,
  posCrmTitleClassName,
  posDashedButtonClassName,
  posInputClassName,
  posPayActionClassName,
  posPromoPanelClassName,
  posPromoTitleClassName,
  posQtyStepperShellClassName,
  posRemoveItemClassName,
  posSummaryDiscountClassName,
  posSummaryMutedClassName,
  posSummaryPanelClassName,
  posSummaryRewardClassName,
  posSummaryTotalClassName,
  posSummaryTotalRowClassName,
} from "@/lib/theme/immersive";
import { text } from "@/lib/theme/surface";
import { typeUiLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";
import type { Customer, ValidatedPromotion } from "@/types/api";

export type PosCartSidebarProps = {
  cart: PosCartItem[];
  customer: Customer | null;
  pointsToRedeem: number;
  onPointsToRedeemChange: (value: number) => void;
  onFindMember: () => void;
  onClearCustomer: () => void;
  promoCode: string;
  onPromoCodeChange: (value: string) => void;
  appliedPromo: ValidatedPromotion | null;
  onApplyPromo: () => void;
  onClearPromo: () => void;
  subtotal: number;
  totalDiscount: number;
  netTotal: number;
  pointsEarned: number;
  onAdjustQuantity: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onCheckout: () => void;
  className?: string;
};

export function PosCartSidebar({
  cart,
  customer,
  pointsToRedeem,
  onPointsToRedeemChange,
  onFindMember,
  onClearCustomer,
  promoCode,
  onPromoCodeChange,
  appliedPromo,
  onApplyPromo,
  onClearPromo,
  subtotal,
  totalDiscount,
  netTotal,
  pointsEarned,
  onAdjustQuantity,
  onRemoveItem,
  onCheckout,
  className,
}: PosCartSidebarProps) {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={posCartPanelClassName(cn("w-full lg:w-[min(400px,100%)] lg:shrink-0 flex flex-col min-h-0 max-h-full", className))}>
      <div className={posCartHeaderClassName("shrink-0")}>
        <h2 className={posCartTitleClassName()}>
          <ShoppingBag size={20} className={posAccentIconClassName()} /> Current Order
        </h2>
        <span className={posCartBadgeClassName()}>{itemCount} Items</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-2">
        {cart.map((item) => (
          <div key={item.id} className={posCartLineDividerClassName()}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className={posCartItemNameClassName()}>{item.product.name}</div>
                {item.notes ? (
                  <div className={cn("text-xs font-medium mt-0.5 line-clamp-2", posAccentTextClassName())}>
                    {item.notes}
                  </div>
                ) : null}
                <div className={cn("text-xs tabular-nums mt-1", text.muted)}>
                  {formatCurrency(item.unitPrice)} each
                </div>
              </div>
              <Button
                aria-label={`Remove ${item.product.name}`}
                variant="ghost"
                size="sm"
                className={posRemoveItemClassName(posCartTouchButtonClassName("h-9 w-9 min-h-9 min-w-9"))}
                onClick={() => onRemoveItem(item.id)}
              >
                <X className="w-4 h-4" aria-hidden />
              </Button>
            </div>
            <div className={posCartLineActionsClassName()}>
              <div className={posQtyStepperShellClassName()}>
                <Button
                  type="button"
                  aria-label={`Decrease ${item.product.name} quantity`}
                  variant="ghost"
                  size="sm"
                  className={posCartTouchButtonClassName("rounded-none h-10 w-10 min-h-10 min-w-10")}
                  onClick={() => onAdjustQuantity(item.id, -1)}
                >
                  <Minus className="w-4 h-4" aria-hidden />
                </Button>
                <span className={posCartQtyClassName()}>{item.quantity}</span>
                <Button
                  type="button"
                  aria-label={`Increase ${item.product.name} quantity`}
                  variant="ghost"
                  size="sm"
                  className={posCartTouchButtonClassName("rounded-none h-10 w-10 min-h-10 min-w-10")}
                  onClick={() => onAdjustQuantity(item.id, 1)}
                >
                  <Plus className="w-4 h-4" aria-hidden />
                </Button>
              </div>
              <span className={posCartLineTotalClassName()}>
                {formatCurrency(item.unitPrice * item.quantity)}
              </span>
            </div>
          </div>
        ))}
        {cart.length === 0 && (
          <div className={posCartEmptyStateClassName()}>
            <ShoppingBag size={40} className={posCartEmptyIconClassName()} aria-hidden />
            <p className={cn(typeUiLabelClassName("text-sm font-semibold"), text.primary)}>
              Cart is empty
            </p>
            <p className={cn("text-xs", text.muted)}>Tap a menu item to add.</p>
          </div>
        )}
      </div>

      <div className={posCartSectionClassName("shrink-0")}>
        <div className="space-y-2">
          {!customer ? (
            <Button
              variant="outline"
              className={posDashedButtonClassName("h-11 rounded-xl")}
              onClick={onFindMember}
            >
              <Search className="w-4 h-4 mr-2" /> Find Member via Phone
            </Button>
          ) : (
            <div className={posCrmPanelClassName()}>
              <Button
                aria-label="Clear customer"
                variant="ghost"
                size="sm"
                className={cn(posCrmMutedClassName(), posCartTouchButtonClassName("h-9 w-9 min-h-9 min-w-9 absolute top-1 right-1"))}
                onClick={onClearCustomer}
              >
                <X className="w-4 h-4" />
              </Button>
              <div className={`${posCrmTitleClassName()} mb-1`}>
                <User className="w-4 h-4" /> {customer.name}{" "}
                <Badge variant="outline" className={posCrmTierBadgeClassName()}>
                  {customer.tier}
                </Badge>
              </div>
              <div className={`${posCrmMutedClassName()} mb-2`}>
                Available: {customer.points} pts ({formatCurrency(pointsToDiscountAmount(customer.points))})
              </div>
              {customer.points > 0 && (
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    min="0"
                    max={customer.points}
                    placeholder="Pts to redeem"
                    value={pointsToRedeem || ""}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      if (Number.isNaN(next)) {
                        onPointsToRedeemChange(0);
                        return;
                      }
                      onPointsToRedeemChange(Math.min(Math.max(0, next), customer.points));
                    }}
                    className={posInputClassName("h-8 rounded-lg")}
                  />
                  <span className={`text-xs whitespace-nowrap ${text.muted}`}>
                    10 pts = {formatCurrency(1)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          {!appliedPromo ? (
            <div className="flex gap-2">
              <Input
                placeholder="Promo Code"
                value={promoCode}
                onChange={(e) => onPromoCodeChange(e.target.value.toUpperCase())}
                className={posInputClassName("uppercase rounded-lg")}
              />
              <Button variant="secondary" className="min-h-[44px] rounded-lg shrink-0" onClick={onApplyPromo}>
                Apply
              </Button>
            </div>
          ) : (
            <div className={posPromoPanelClassName()}>
              <div className={posPromoTitleClassName()}>
                <Ticket className="w-4 h-4" /> {appliedPromo.code}
              </div>
              <Button
                aria-label="Remove promotion"
                variant="ghost"
                size="sm"
                className={cn(posPromoTitleClassName(), posCartTouchButtonClassName("h-9 w-9 min-h-9 min-w-9"))}
                onClick={onClearPromo}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className={posSummaryPanelClassName("shrink-0")}>
        <div className={`flex justify-between ${posSummaryMutedClassName()}`}>
          <span>Subtotal</span>
          <span className="tabular-nums">{formatCurrency(subtotal)}</span>
        </div>
        {totalDiscount > 0 && (
          <div className={posSummaryDiscountClassName("flex justify-between")}>
            <span>Discount</span>
            <span className="tabular-nums">- {formatCurrency(totalDiscount)}</span>
          </div>
        )}
        <div className={posSummaryTotalRowClassName()}>
          <span>Total</span>
          <span className={posSummaryTotalClassName()}>{formatCurrency(netTotal)}</span>
        </div>
        {pointsEarned > 0 && (
          <div className={posSummaryRewardClassName("flex justify-end pt-1")}>
            <Award className="w-3 h-3 mr-1" /> Earn {pointsEarned} pts
          </div>
        )}
        <Button
          className={posPayActionClassName("w-full h-12 text-lg mt-4 rounded-xl")}
          disabled={cart.length === 0}
          onClick={onCheckout}
        >
          Confirm & Pay
        </Button>
      </div>
    </div>
  );
}
