"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useActiveClockIn, useClockIn, useClockOut } from "@/hooks/domains/useHrQueries";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { topbarClockWidgetClassName } from "@/lib/theme";
import { cn } from "@/lib/utils";

type ClockInOutWidgetProps = {
  /** Reserved for future compact/menu variants. */
  variant?: "topbar";
};

export function ClockInOutWidget(_props: ClockInOutWidgetProps = {}) {
  const { user, activeBranchId } = useAuth();
  const [elapsed, setElapsed] = useState("");

  const {
    data: activeRecord,
    isLoading,
    isError,
    error,
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

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = now - start;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setElapsed(`${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeRecord]);

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
    return (
      <div className={topbarClockWidgetClassName()} aria-hidden>
        <div className="h-9 w-24 rounded-lg bg-[var(--surface-inset)] animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={topbarClockWidgetClassName()}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-[44px]"
          onClick={() => void refetch()}
          aria-label="Retry loading clock-in status"
        >
          <RefreshCw className="w-4 h-4" aria-hidden />
        </Button>
      </div>
    );
  }

  const needsBranch = user.role === "SUPER_ADMIN" && !activeBranchId;

  if (activeRecord) {
    return (
      <div className={topbarClockWidgetClassName()}>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--sidebar-nav-active-fg)]">
          <CheckCircle2 className="w-3.5 h-3.5 animate-pulse motion-reduce:animate-none" aria-hidden />
          <span className="sr-only">Active shift</span>
          <span className="font-mono tabular-nums" aria-live="polite">
            {elapsed}
          </span>
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void handleClockOut()}
          disabled={clockOutMutation.isPending}
          className="min-h-[44px] shrink-0"
        >
          <span className="sm:hidden" aria-hidden>
            <Clock className="w-4 h-4" />
          </span>
          <span className="hidden sm:inline">Clock Out</span>
          <span className="sr-only sm:hidden">Clock Out</span>
        </Button>
      </div>
    );
  }

  if (needsBranch) {
    return (
      <div className={topbarClockWidgetClassName()} title="Select a branch to clock in">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled
          className="min-h-[44px] opacity-60"
        >
          <Clock className="w-4 h-4 sm:mr-1.5" aria-hidden />
          <span className="hidden sm:inline">Clock In</span>
        </Button>
      </div>
    );
  }

  return (
    <div className={topbarClockWidgetClassName()}>
      <Button
        type="button"
        size="sm"
        onClick={() => void handleClockIn()}
        disabled={clockInMutation.isPending}
        className="min-h-[44px] bg-[var(--brand-solid)] text-[var(--on-brand-solid-fg)] hover:opacity-90 border-none shadow-sm"
      >
        <Clock className="w-4 h-4 sm:mr-1.5" aria-hidden />
        <span className="hidden sm:inline">Clock In</span>
        <span className="sr-only sm:hidden">Clock In</span>
      </Button>
    </div>
  );
}
