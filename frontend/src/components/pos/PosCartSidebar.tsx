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
import { pointsToDiscountBaht } from "@/lib/loyalty";
import { formatBaht } from "@/lib/money";
import type { PosCartItem } from "@/lib/pos-cart";
import {
  posAccentIconClassName,
  posAccentTextClassName,
  posCartBadgeClassName,
  posCartEmptyIconClassName,
  posCartHeaderClassName,
  posCartItemNameClassName,
  posCartLineDividerClassName,
  posCartLineTotalClassName,
  posCartPanelClassName,
  posCartQtyClassName,
  posCartSectionClassName,
  posCartTitleClassName,
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
import type { Customer, ValidatedPromotion } from "@/types/api";

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
}: {
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
}) {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={posCartPanelClassName("w-full lg:w-[min(420px,100%)] lg:shrink-0 flex flex-col")}>
      <div className={posCartHeaderClassName()}>
        <h2 className={posCartTitleClassName()}>
          <ShoppingBag size={20} className={posAccentIconClassName()} /> Current Order
        </h2>
        <span className={posCartBadgeClassName()}>{itemCount} Items</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {cart.map((item) => (
          <div
            key={item.id}
            className={posCartLineDividerClassName("flex justify-between items-center gap-3")}
          >
            <div className="min-w-0 flex-1">
              <div className={posCartItemNameClassName()}>{item.product.name}</div>
              {item.notes && (
                <div className={`text-xs font-medium mb-1 line-clamp-2 ${posAccentTextClassName()}`}>
                  {item.notes}
                </div>
              )}
              <div className={`text-sm tabular-nums ${text.muted}`}>
                {formatBaht(item.unitPrice)} each
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className={posQtyStepperShellClassName()}>
                <Button
                  type="button"
                  aria-label={`Decrease ${item.product.name} quantity`}
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-none"
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
                  className="h-9 w-9 p-0 rounded-none"
                  onClick={() => onAdjustQuantity(item.id, 1)}
                >
                  <Plus className="w-4 h-4" aria-hidden />
                </Button>
              </div>
              <span className={posCartLineTotalClassName()}>
                {formatBaht(item.unitPrice * item.quantity)}
              </span>
              <Button
                aria-label={`Remove ${item.product.name}`}
                variant="ghost"
                size="sm"
                className={posRemoveItemClassName("h-9 w-9 p-0")}
                onClick={() => onRemoveItem(item.id)}
              >
                <X className="w-4 h-4" aria-hidden />
              </Button>
            </div>
          </div>
        ))}
        {cart.length === 0 && (
          <div className={`text-center mt-10 flex flex-col items-center gap-2 ${text.muted}`}>
            <ShoppingBag size={48} className={posCartEmptyIconClassName()} aria-hidden />
            <span>Cart is empty</span>
          </div>
        )}
      </div>

      <div className={posCartSectionClassName()}>
        <div className="space-y-2">
          {!customer ? (
            <Button
              variant="outline"
              className={posDashedButtonClassName("h-12")}
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
                className={`absolute top-1 right-1 h-6 w-6 p-0 ${posCrmMutedClassName()}`}
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
                Available: {customer.points} pts (฿{pointsToDiscountBaht(customer.points)})
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
                    className={posInputClassName("h-8")}
                  />
                  <span className={`text-xs whitespace-nowrap ${text.muted}`}>10 pts = ฿1</span>
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
                className={posInputClassName("uppercase")}
              />
              <Button variant="secondary" onClick={onApplyPromo}>
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
                className={`h-6 w-6 p-0 ${posPromoTitleClassName()}`}
                onClick={onClearPromo}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className={posSummaryPanelClassName()}>
        <div className={`flex justify-between ${posSummaryMutedClassName()}`}>
          <span>Subtotal</span>
          <span className="tabular-nums">฿{subtotal.toLocaleString()}</span>
        </div>
        {totalDiscount > 0 && (
          <div className={posSummaryDiscountClassName("flex justify-between")}>
            <span>Discount</span>
            <span className="tabular-nums">- ฿{totalDiscount.toLocaleString()}</span>
          </div>
        )}
        <div className={posSummaryTotalRowClassName()}>
          <span>Total</span>
          <span className={posSummaryTotalClassName()}>฿{netTotal.toLocaleString()}</span>
        </div>
        {pointsEarned > 0 && (
          <div className={posSummaryRewardClassName("flex justify-end pt-1")}>
            <Award className="w-3 h-3 mr-1" /> Earn {pointsEarned} pts
          </div>
        )}
        <Button
          className={posPayActionClassName("w-full h-12 text-lg mt-4")}
          disabled={cart.length === 0}
          onClick={onCheckout}
        >
          Confirm & Pay
        </Button>
      </div>
    </div>
  );
}
