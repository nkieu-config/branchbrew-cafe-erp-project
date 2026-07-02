"use client";

import { useEffect, useState } from "react";
import { infoBannerClassName, infoBannerTextClassName } from "@/lib/theme/hub-banners";
import { statusTextClassName } from "@/lib/theme/color-helpers";
import { formatTime } from "@/lib/intl-date";

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
};

export function AttendanceActiveBanner({
  clockIn,
  branchLabel,
}: AttendanceActiveBannerProps) {
  const elapsed = useElapsedTimer(clockIn);

  return (
    <div className={infoBannerClassName("py-3")}>
      <p className={infoBannerTextClassName()}>
        Clocked in since {formatTime(clockIn)} at {branchLabel}
        {elapsed ? (
          <>
            {" "}
            ·{" "}
            <span className={statusTextClassName("info", "font-mono tabular-nums")}>
              {elapsed}
            </span>
          </>
        ) : null}
      </p>
    </div>
  );
}
