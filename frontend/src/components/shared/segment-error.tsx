"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { statusToneClassName } from "@/lib/theme/status";
import { hubPrimaryActionClassName } from "@/lib/theme/stock";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";

type SegmentErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
};

export function SegmentError({
  error,
  reset,
  title = "Something went wrong",
  description = "An unexpected error occurred while loading this section.",
}: SegmentErrorProps) {
  useEffect(() => {
    console.error("Segment error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[min(50dvh,24rem)] flex-col items-center justify-center gap-4 p-6 text-center">
      <div className={cn("rounded-full p-4", statusToneClassName("danger"))}>
        <AlertCircle className="h-10 w-10" aria-hidden />
      </div>
      <h2 className={typeHeadingClassName("text-xl")}>{title}</h2>
      <p className={cn("max-w-md text-sm", text.muted)}>{description}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={() => reset()} className={hubPrimaryActionClassName()}>
          Try again
        </Button>
        <Button type="button" variant="outline" onClick={() => window.location.assign("/")}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
