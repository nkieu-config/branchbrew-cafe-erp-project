"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryErrorBannerClassName, queryErrorMessageClassName } from "@/lib/theme";
import { cn } from "@/lib/utils";

type QueryErrorBannerProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  loading?: boolean;
  className?: string;
};

export function QueryErrorBanner({
  message,
  onRetry,
  retryLabel = "Retry",
  loading = false,
  className,
}: QueryErrorBannerProps) {
  return (
    <div className={queryErrorBannerClassName(className)} role="alert">
      <p className={queryErrorMessageClassName()}>{message}</p>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={loading}
          className="shrink-0 min-h-[44px]"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} aria-hidden />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
