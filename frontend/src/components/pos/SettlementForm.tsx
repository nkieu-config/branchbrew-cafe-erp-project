import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calculator, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSubmitSettlement } from "@/hooks/domains/useFinanceQueries";
import type { SettlementExpected } from "@/types/api";
import { getErrorMessage } from "@/lib/errors";
import { formatCurrency } from "@/lib/money";
import { statusTextClassName, surfaceInsetSkeletonClassName } from "@/lib/theme/color-helpers";
import {
  posCheckoutMutedPanelClassName,
  posFormFieldLabelClassName,
  posFormPanelClassName,
  posFormPanelHeaderClassName,
  posFormPanelIconClassName,
  posNativeInputClassName,
  posPanelTopDividerClassName,
  posPrimaryActionClassName,
  posSettlementChannelRowClassName,
  posSettlementExpectedHeroClassName,
  posSettlementHighlightClassName,
  posSettlementSummaryClassName,
} from "@/lib/theme/immersive";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";

type SettlementFormProps = {
  branchIdNum: number | undefined;
  expected: SettlementExpected | undefined;
  expectedLoading?: boolean;
  expectedError?: boolean;
  canViewFinance?: boolean;
};

function SettlementSummarySkeleton() {
  return (
    <div className={posSettlementSummaryClassName()} aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className={surfaceInsetSkeletonClassName(
            cn("h-4 rounded-md", index === 2 && "h-5 mt-2"),
          )}
        />
      ))}
    </div>
  );
}

export function SettlementForm({
  branchIdNum,
  expected,
  expectedLoading = false,
  expectedError = false,
  canViewFinance = false,
}: SettlementFormProps) {
  const router = useRouter();
  const [actualCash, setActualCash] = useState<string>("");
  const [actualCreditCard, setActualCreditCard] = useState<string>("");
  const [actualQR, setActualQR] = useState<string>("");

  const submitSettlementMutation = useSubmitSettlement();
  const formDisabled = expectedLoading || submitSettlementMutation.isPending;

  const handleSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actualCash || !branchIdNum) return;
    try {
      await submitSettlementMutation.mutateAsync({
        branchId: branchIdNum,
        actualCash: parseFloat(actualCash),
        actualCreditCard: parseFloat(actualCreditCard || "0"),
        actualQR: parseFloat(actualQR || "0"),
      });
      toast.success(
        "Settlement submitted for HQ approval.",
        canViewFinance
          ? {
              action: {
                label: "Finance Overview",
                onClick: () => router.push("/finance/overview"),
              },
            }
          : undefined,
      );
      setActualCash("");
      setActualCreditCard("");
      setActualQR("");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to submit settlement"));
    }
  };

  return (
    <div className={posFormPanelClassName()}>
      <div className={posFormPanelHeaderClassName()}>
        <div className={posFormPanelIconClassName("settlement")}>
          <Calculator className="h-5 w-5" aria-hidden />
        </div>
        <h2 className={typeHeadingClassName("text-lg")}>Shift Settlement</h2>
      </div>

      {expectedLoading ? (
        <SettlementSummarySkeleton />
      ) : expectedError ? (
        <p className={cn("text-sm", text.muted, posCheckoutMutedPanelClassName("rounded-xl"))}>
          Expected totals unavailable. Enter actual counts below.
        </p>
      ) : (
        <div className="space-y-0.5">
          <div className={posSettlementChannelRowClassName()}>
            <span className={text.muted}>Cash sales</span>
            <span className="font-medium tabular-nums">{formatCurrency(expected?.sales)}</span>
          </div>
          <div className={posSettlementChannelRowClassName()}>
            <span className={text.muted}>Petty cash expenses</span>
            <span className={cn("font-medium tabular-nums", statusTextClassName("danger"))}>
              -{formatCurrency(expected?.expenses)}
            </span>
          </div>
          <div className={posSettlementExpectedHeroClassName()}>
            <span className={cn("font-medium", text.primary)}>Expected cash in drawer</span>
            <span
              className={cn(
                typeHeadingClassName("text-lg"),
                Number(expected?.expectedCash ?? 0) < 0
                  ? statusTextClassName("danger")
                  : posSettlementHighlightClassName(),
              )}
            >
              {formatCurrency(expected?.expectedCash)}
            </span>
          </div>
          <div className={posSettlementChannelRowClassName()}>
            <span className={text.muted}>Expected card</span>
            <span className="font-medium tabular-nums">
              {formatCurrency(expected?.expectedCreditCard)}
            </span>
          </div>
          <div className={posSettlementChannelRowClassName()}>
            <span className={text.muted}>Expected QR</span>
            <span className="font-medium tabular-nums">{formatCurrency(expected?.expectedQR)}</span>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSettlement}
        className={cn("flex flex-col gap-4", posPanelTopDividerClassName(), "pt-4")}
      >
        <div>
          <label htmlFor="actual-cash" className={posFormFieldLabelClassName()}>
            Cash counted *
          </label>
          <input
            id="actual-cash"
            type="number"
            step="0.01"
            min="0"
            className={posNativeInputClassName("py-3 text-lg font-semibold")}
            value={actualCash}
            onChange={(e) => setActualCash(e.target.value)}
            required
            disabled={formDisabled}
            placeholder="0.00"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="actual-card" className={posFormFieldLabelClassName()}>
              Card sales
            </label>
            <input
              id="actual-card"
              type="number"
              step="0.01"
              min="0"
              className={posNativeInputClassName("py-2.5")}
              value={actualCreditCard}
              onChange={(e) => setActualCreditCard(e.target.value)}
              disabled={formDisabled}
              placeholder="0.00"
            />
          </div>
          <div>
            <label htmlFor="actual-qr" className={posFormFieldLabelClassName()}>
              QR sales
            </label>
            <input
              id="actual-qr"
              type="number"
              step="0.01"
              min="0"
              className={posNativeInputClassName("py-2.5")}
              value={actualQR}
              onChange={(e) => setActualQR(e.target.value)}
              disabled={formDisabled}
              placeholder="0.00"
            />
          </div>
        </div>
        <Button
          type="submit"
          className={posPrimaryActionClassName("w-full min-h-[48px] rounded-xl border-0")}
          disabled={formDisabled || !actualCash}
        >
          {submitSettlementMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin motion-reduce:animate-none" aria-hidden />
              Submitting…
            </>
          ) : expectedLoading ? (
            "Loading…"
          ) : (
            "Submit Settlement"
          )}
        </Button>
      </form>
    </div>
  );
}
