"use client";

import { Delete, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  posImmersiveDialogFooterClassName,
  posImmersiveDialogHeaderClassName,
  posNumpadBodyClassName,
  posNumpadCloseButtonClassName,
  posNumpadDeleteClassName,
  posNumpadDisplayClassName,
  posNumpadKeyClassName,
  posNumpadShellClassName,
  posNumpadSubmitClassName,
} from "@/lib/theme/immersive";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";

const PHONE_LENGTH = 10;

function formatPhoneDisplay(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, PHONE_LENGTH);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

interface OnScreenNumpadProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function OnScreenNumpad({ value, onChange, onSubmit, onClose }: OnScreenNumpadProps) {
  const digits = value.replace(/\D/g, "").slice(0, PHONE_LENGTH);
  const isComplete = digits.length === PHONE_LENGTH;

  const handleKeyClick = (key: string) => {
    if (digits.length < PHONE_LENGTH) {
      onChange(digits + key);
    }
  };

  const handleBackspace = () => {
    onChange(digits.slice(0, -1));
  };

  return (
    <div className={posNumpadShellClassName()}>
      <div className={posImmersiveDialogHeaderClassName()}>
        <h3 className={typeHeadingClassName("text-lg flex-1")}>Find member</h3>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className={posNumpadCloseButtonClassName()}
          aria-label="Close member lookup"
        >
          <X className={cn("h-5 w-5", text.muted)} aria-hidden />
        </Button>
      </div>

      <div className={posNumpadBodyClassName()}>
        <div
          className={cn(posNumpadDisplayClassName(), "relative")}
          aria-live="polite"
          aria-label={`Phone number ${formatPhoneDisplay(digits) || "empty"}`}
        >
          {digits ? (
            formatPhoneDisplay(digits)
          ) : (
            <span className={cn("text-lg tracking-[0.15em]", text.muted)}>0XX-XXX-XXXX</span>
          )}
          <span
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums",
              text.muted,
            )}
            aria-hidden
          >
            {digits.length}/{PHONE_LENGTH}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Button
              key={num}
              type="button"
              variant="outline"
              className={posNumpadKeyClassName()}
              onClick={() => handleKeyClick(num.toString())}
              aria-label={`Digit ${num}`}
            >
              {num}
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            className={posNumpadDeleteClassName()}
            onClick={handleBackspace}
            disabled={digits.length === 0}
            aria-label="Delete last digit"
          >
            <Delete className="h-5 w-5" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="outline"
            className={posNumpadKeyClassName("col-span-2")}
            onClick={() => handleKeyClick("0")}
            aria-label="Digit 0"
          >
            0
          </Button>
        </div>
      </div>

      <div className={posImmersiveDialogFooterClassName()}>
        <Button
          type="button"
          className={posNumpadSubmitClassName("w-full")}
          onClick={onSubmit}
          disabled={!isComplete}
        >
          <Search className="h-4 w-4 mr-2" aria-hidden />
          Find Member
        </Button>
      </div>
    </div>
  );
}
