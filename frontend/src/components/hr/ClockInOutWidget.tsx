"use client";

import { useEffect, useState, useCallback } from "react";
import { getActiveClockIn, clockIn, clockOut } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

export function ClockInOutWidget() {
  const { user, activeBranchId } = useAuth();
  const [activeRecord, setActiveRecord] = useState<{ clockIn: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState("");

  const fetchStatus = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const record = await getActiveClockIn();
      setActiveRecord(record);
      setFetchError(null);
    } catch (err) {
      setFetchError(getErrorMessage(err, "Failed to load clock-in status"));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      void fetchStatus();
    }
  }, [user, fetchStatus]);

  useEffect(() => {
    if (!activeRecord) {
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
      setElapsed(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeRecord]);

  const handleClockIn = async () => {
    if (!activeBranchId) {
      toast.error("Select a branch in the top bar before clocking in.");
      return;
    }
    try {
      await clockIn(activeBranchId);
      toast.success("Clocked in successfully!");
      void fetchStatus();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to clock in"));
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut();
      toast.success("Clocked out successfully!");
      void fetchStatus();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to clock out"));
    }
  };

  if (loading) {
    return (
      <div className="p-4 border-t border-slate-200/30 dark:border-slate-800/50">
        <div className="h-10 rounded-xl bg-white/20 dark:bg-slate-900/20 animate-pulse" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-4 border-t border-slate-200/30 dark:border-slate-800/50 bg-white/10 dark:bg-slate-900/10">
        <p className="text-xs text-rose-600 dark:text-rose-400 text-center mb-2">{fetchError}</p>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={() => void fetchStatus()}
        >
          <RefreshCw className="w-3 h-3 mr-1.5" />
          Retry
        </Button>
      </div>
    );
  }

  const needsBranch = user?.role === "SUPER_ADMIN" && !activeBranchId;

  return (
    <div className="p-4 border-t border-slate-200/30 dark:border-slate-800/50 bg-white/10 dark:bg-slate-900/10 flex flex-col items-center">
      {activeRecord ? (
        <div className="w-full space-y-3 p-3 bg-white/40 dark:bg-slate-900/40 rounded-xl border border-white/60 dark:border-slate-800/60 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="animate-pulse"/> Active Shift</span>
            <span className="font-mono bg-white/60 dark:bg-slate-900/60 px-2 py-0.5 rounded text-emerald-700 dark:text-emerald-400">{elapsed}</span>
          </div>
          <Button onClick={handleClockOut} className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg interactive-item shadow-md border border-slate-700 dark:border-slate-600" size="sm">
            Clock Out
          </Button>
        </div>
      ) : needsBranch ? (
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center px-2">
          Select a branch in the top bar to clock in.
        </p>
      ) : (
        <Button onClick={handleClockIn} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl interactive-item shadow-md border border-emerald-400" size="default">
          <Clock size={16} className="mr-2" /> Clock In
        </Button>
      )}
    </div>
  );
}
