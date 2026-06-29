"use client";

import { SegmentError } from "@/components/shared/segment-error";

export default function PosSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <SegmentError
      error={error}
      reset={reset}
      title="POS unavailable"
      description="The point-of-sale screen hit an error. You can retry or return to the dashboard."
    />
  );
}
