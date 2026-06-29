"use client";

import { Loader2 } from "lucide-react";
import { hubLoadingSpinnerClassName } from "@/lib/theme/hub-primitives";
import { kdsLoadingClassName } from "@/lib/theme/immersive";
import { cn } from "@/lib/utils";

type QueryLoadingPanelProps = {
  message?: string;
  className?: string;
  minHeightClassName?: string;
  variant?: "hub" | "kds";
};

export function QueryLoadingPanel({
  message = "Loading…",
  className,
  minHeightClassName = "min-h-[16rem]",
  variant = "hub",
}: QueryLoadingPanelProps) {
  const spinnerClass =
    variant === "kds" ? cn("h-10 w-10 animate-spin motion-reduce:animate-none", kdsLoadingClassName()) : hubLoadingSpinnerClassName();

  return (
    <div
      className={cn("flex items-center justify-center", minHeightClassName, className)}
      role="status"
      aria-live="polite"
    >
      <Loader2 className={spinnerClass} aria-hidden />
      <span className="sr-only">{message}</span>
    </div>
  );
}
