"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { formatTime } from "@/lib/intl-date";
import {
  calculateGanttLeftPercent,
  calculateGanttWidthPercent,
  ganttHourRange,
  shiftStatusLabel,
  type ShiftUserRow,
  type ShiftWithUser,
} from "@/lib/shift-filters";
import { buildHrEmployeesUrl } from "@/lib/hr-hub-url";
import {
  ganttGridLineClassName,
  ganttHourLabelClassName,
  ganttHourMarkerClassName,
  ganttTimeAxisClassName,
  ganttTrackClassName,
  ganttUserColumnClassName,
  horizontalScrollHintClassName,
  hrAvatarClassName,
  inlineLinkClassName,
  shiftBarClassName,
  text,
  typeMicroClassName,
  typeUiLabelClassName,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

type ShiftGanttTimelineProps = {
  rows: ShiftUserRow[];
};

export function ShiftGanttTimeline({ rows }: ShiftGanttTimelineProps) {
  const hoursRange = ganttHourRange();

  return (
    <div className={horizontalScrollHintClassName("p-4")}>
      <p className={cn(typeMicroClassName("mb-3 lg:hidden"), text.muted)}>Scroll timeline →</p>
      <div className="min-w-[640px] sm:min-w-[720px] md:min-w-[800px]">
        <div className={ganttTimeAxisClassName()} role="presentation">
          {hoursRange.map((hour) => (
            <div key={hour} className={ganttHourLabelClassName()}>
              <span className={ganttHourMarkerClassName("-left-3")}>
                {hour.toString().padStart(2, "0")}:00
              </span>
            </div>
          ))}
        </div>

        <div className="relative mt-4 space-y-4">
          <div className="absolute top-0 bottom-0 left-28 sm:left-32 md:left-40 right-0 flex pointer-events-none">
            {hoursRange.slice(0, -1).map((hour) => (
              <div key={hour} className={ganttGridLineClassName()} />
            ))}
          </div>

          {rows.map((row) => (
            <div key={row.userId} className="flex items-center h-12 relative group">
              <div className={ganttUserColumnClassName()}>
                <Avatar className={hrAvatarClassName()}>{row.userName.charAt(0)}</Avatar>
                <Link
                  href={buildHrEmployeesUrl()}
                  className={cn(typeUiLabelClassName("text-sm truncate"), inlineLinkClassName())}
                >
                  {row.userName}
                </Link>
              </div>

              <div className={ganttTrackClassName()}>
                {row.shifts.map((shift: ShiftWithUser) => {
                  const left = calculateGanttLeftPercent(shift.startTime);
                  const width = calculateGanttWidthPercent(shift.startTime, shift.endTime);
                  const label = shiftStatusLabel(shift.status);
                  const tooltip = `${formatTime(shift.startTime)} – ${formatTime(shift.endTime)} · ${label}`;

                  return (
                    <div
                      key={shift.id}
                      className={shiftBarClassName(shift.status)}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      title={tooltip}
                      aria-label={tooltip}
                      role="img"
                    >
                      {width > 10 ? label : ""}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
