"use client";

import { useEffect, useState } from "react";
import { Clock, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { statusTextClassName } from "@/lib/theme/color-helpers";
import { infoBannerClassName, infoBannerIconClassName, infoBannerTextClassName, infoBannerTitleClassName } from "@/lib/theme/hub-banners";
import { formatTime } from "@/lib/intl-date";
import { typeUiLabelClassName } from "@/lib/theme/typography";

function useElapsedTimer(clockIn: string | undefined | null) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (!clockIn) {
      setElapsed("");
      return;
    }

    const start = new Date(clockIn).getTime();
    const tick = () => {
      const diff = Date.now() - start;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setElapsed(
        `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`,
      );
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [clockIn]);

  return elapsed;
}

type AttendanceActiveBannerProps = {
  clockIn: string;
  branchLabel: string;
  clockActionPending: boolean;
  onClockOut: () => void;
};

export function AttendanceActiveBanner({
  clockIn,
  branchLabel,
  clockActionPending,
  onClockOut,
}: AttendanceActiveBannerProps) {
  const elapsed = useElapsedTimer(clockIn);

  return (
    <div className={infoBannerClassName()}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <Clock className={infoBannerIconClassName()} aria-hidden />
          <div className="min-w-0">
            <p className={infoBannerTitleClassName()}>Currently clocked in</p>
            <p className={infoBannerTextClassName()}>
              Started {formatTime(clockIn)} at {branchLabel}
              {elapsed && (
                <>
                  {" "}
                  ·{" "}
                  <span className={statusTextClassName("info", typeUiLabelClassName("font-mono tabular-nums"))}>
                    {elapsed}
                  </span>{" "}
                  elapsed
                </>
              )}
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          className={typeUiLabelClassName("shrink-0 min-h-[44px]")}
          disabled={clockActionPending}
          onClick={onClockOut}
        >
          <StopCircle className="w-4 h-4 mr-2" aria-hidden />
          Clock out
        </Button>
      </div>
    </div>
  );
}
