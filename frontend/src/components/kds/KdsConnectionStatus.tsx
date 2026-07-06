"use client";

import { cn } from "@/lib/utils";
import { text } from "@/lib/theme/surface";

type KdsConnectionStatusProps = {
  isConnected: boolean;
  className?: string;
};

export function KdsConnectionStatus({
  isConnected,
  className,
}: KdsConnectionStatusProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/80 px-2.5 py-1 text-xs font-medium",
        isConnected ? "text-emerald-600 dark:text-emerald-400" : text.muted,
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "h-2 w-2 rounded-full",
          isConnected ? "animate-pulse bg-emerald-500" : "bg-amber-500",
        )}
      />
      {isConnected ? "Live" : "Reconnecting — refreshing every 30s"}
    </span>
  );
}
