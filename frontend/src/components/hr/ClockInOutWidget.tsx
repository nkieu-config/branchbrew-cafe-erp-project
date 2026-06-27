"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useActiveClockIn, useClockIn, useClockOut } from "@/hooks/domains/useHrQueries";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { shell, text } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ClockInOutWidget() {
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

  const widgetShell = cn(
    "p-4 border-t bg-[var(--sidebar-user-panel-bg)]",
    shell.sidebarDivider,
  );

  if (isLoading) {
    return (
      <div className={widgetShell}>
        <div className="h-10 rounded-xl bg-[var(--sidebar-user-panel-bg)] animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={widgetShell}>
        <p className={cn("text-xs text-center mb-2 text-[var(--status-danger-fg)]")}>
          {getErrorMessage(error, "Failed to load clock-in status")}
        </p>
        <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => void refetch()}>
          <RefreshCw className="w-3 h-3 mr-1.5" />
          Retry
        </Button>
      </div>
    );
  }

  const needsBranch = user?.role === "SUPER_ADMIN" && !activeBranchId;

  return (
    <div className={cn(widgetShell, "flex flex-col items-center")}>
      {activeRecord ? (
        <div className="w-full space-y-3 p-3 rounded-xl border shadow-sm backdrop-blur-sm bg-[var(--surface-overlay)] border-[var(--sidebar-divider)]">
          <div className="flex items-center justify-between font-bold text-sm text-[var(--sidebar-nav-active-fg)]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="animate-pulse motion-reduce:animate-none" /> Active Shift
            </span>
            <span className="font-mono px-2 py-0.5 rounded bg-[var(--sidebar-user-panel-bg)] text-[var(--sidebar-nav-active-fg)]">
              {elapsed}
            </span>
          </div>
          <Button
            onClick={() => void handleClockOut()}
            disabled={clockOutMutation.isPending}
            className="w-full rounded-lg interactive-item shadow-md bg-primary text-primary-foreground hover:bg-primary/90"
            size="sm"
          >
            Clock Out
          </Button>
        </div>
      ) : needsBranch ? (
        <p className={cn("text-xs text-center px-2", text.muted)}>Select a branch in the top bar to clock in.</p>
      ) : (
        <Button
          onClick={() => void handleClockIn()}
          disabled={clockInMutation.isPending}
          className="w-full rounded-xl interactive-item shadow-md bg-[var(--brand)] text-[var(--brand-foreground)] hover:opacity-90 border border-[var(--sidebar-nav-active-border)]"
          size="default"
        >
          <Clock size={16} className="mr-2" /> Clock In
        </Button>
      )}
    </div>
  );
}
