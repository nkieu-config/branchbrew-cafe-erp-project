"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useActiveClockIn, useClockIn, useClockOut } from "@/hooks/domains/useHrQueries";
import { Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { surfaceInsetSkeletonClassName } from "@/lib/theme/color-helpers";
import {
  topbarActionButtonClassName,
  topbarClockActiveClassName,
  topbarClockSlotClassName,
  topbarClockWidgetClassName,
  topbarPrimaryActionClassName,
} from "@/lib/theme/shell";
import { cn } from "@/lib/utils";

type ClockInOutWidgetProps = {
  /** `toolbar` — standalone control in topbar; `standalone` — bordered pill. */
  variant?: "toolbar" | "standalone";
};

function formatCompactElapsed(elapsed: string) {
  return elapsed.startsWith("00:") ? elapsed.slice(3) : elapsed;
}

export function ClockInOutWidget({ variant = "toolbar" }: ClockInOutWidgetProps) {
  const { user, activeBranchId } = useAuth();
  const [elapsed, setElapsed] = useState("");
  const isToolbar = variant === "toolbar";

  const {
    data: activeRecord,
    isLoading,
    isError,
    refetch,
  } = useActiveClockIn(!!user);

  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();

  useEffect(() => {
    if (!activeRecord?.clockIn) {
      setElapsed("");
      return;
    }

    const start = new Date(activeRecord.clockIn).getTime();

    const updateElapsed = () => {
      const now = Date.now();
      const diff = now - start;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setElapsed(
        `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`,
      );
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeRecord]);

  const wrap = (node: ReactNode, slotClassName?: string) => {
    if (!isToolbar) {
      return <div className={topbarClockWidgetClassName()}>{node}</div>;
    }
    return <div className={topbarClockSlotClassName(slotClassName)}>{node}</div>;
  };

  const handleClockIn = async () => {
    if (!activeBranchId) {
      toast.error("Select a branch in the top bar before clocking in.");
      return;
    }
    try {
      await clockInMutation.mutateAsync(activeBranchId);
      toast.success("Clocked in successfully!");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to clock in"));
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOutMutation.mutateAsync();
      toast.success("Clocked out successfully!");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to clock out"));
    }
  };

  if (!user) return null;

  if (isLoading) {
    return wrap(
      <div
        className={cn(
          topbarActionButtonClassName(),
          surfaceInsetSkeletonClassName("w-10 lg:w-9"),
        )}
        aria-hidden
      />,
      "w-10 lg:w-9",
    );
  }

  if (isError) {
    return wrap(
      <button
        type="button"
        className={topbarActionButtonClassName()}
        onClick={() => void refetch()}
        aria-label="Retry loading clock-in status"
      >
        <RefreshCw className="w-4 h-4" aria-hidden />
      </button>,
      "w-10 lg:w-9",
    );
  }

  const needsBranch = user.role === "SUPER_ADMIN" && !activeBranchId;

  if (activeRecord) {
    const compactElapsed = formatCompactElapsed(elapsed);
    return wrap(
      <button
        type="button"
        className={topbarClockActiveClassName()}
        onClick={() => void handleClockOut()}
        disabled={clockOutMutation.isPending}
        aria-label={elapsed ? `Clock out — active shift ${elapsed}` : "Clock out"}
        title="Tap to clock out"
      >
        <span className="sm:hidden">{compactElapsed || "00:00"}</span>
        <span className="hidden sm:inline">{elapsed || "00:00:00"}</span>
      </button>,
      "min-w-[5rem] sm:min-w-[5.75rem]",
    );
  }

  if (needsBranch) {
    return wrap(
      <button
        type="button"
        className={cn(topbarActionButtonClassName(), "opacity-50 cursor-not-allowed")}
        disabled
        aria-label="Select a branch to clock in"
        title="Select a branch to clock in"
      >
        <Clock className="w-4 h-4" aria-hidden />
      </button>,
      "w-10 lg:w-9",
    );
  }

  return wrap(
    <button
      type="button"
      className={topbarPrimaryActionClassName()}
      onClick={() => void handleClockIn()}
      disabled={clockInMutation.isPending}
      aria-label="Clock in"
    >
      <Clock className="w-4 h-4 shrink-0" aria-hidden />
      <span className="hidden sm:inline">Clock in</span>
    </button>,
    "w-auto",
  );
}
