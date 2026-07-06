"use client";

import { Avatar } from "@/components/ui/avatar";
import { formatTime } from "@/lib/intl-date";
import {
  calculateGanttLeftPercent,
  calculateGanttWidthPercent,
  ganttHourRange,
  shiftStatusLabel,
  type ShiftUserRow,
  type ShiftWithUser,
} from "@/lib/filters/shift-filters";
import { horizontalScrollHintClassName } from "@/lib/theme/data-table";
import {
  ganttGridLineClassName,
  ganttHourLabelClassName,
  ganttHourMarkerClassName,
  ganttTimeAxisClassName,
  ganttTrackClassName,
  ganttUserColumnClassName,
  hrAvatarClassName,
  shiftBarClassName,
} from "@/lib/theme/hub-hr";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";

type ShiftGanttTimelineProps = {
  rows: ShiftUserRow[];
};

export function ShiftGanttTimeline({ rows }: ShiftGanttTimelineProps) {
  const hoursRange = ganttHourRange();

  return (
    <div className={horizontalScrollHintClassName("p-3 sm:p-4")}>
      <p className={cn("text-xs mb-2 lg:hidden", text.muted)}>Scroll timeline →</p>
      <div className="min-w-[600px] sm:min-w-[680px]">
        <div className={ganttTimeAxisClassName()} role="presentation">
          {hoursRange.map((hour) => (
            <div key={hour} className={ganttHourLabelClassName()}>
              <span className={ganttHourMarkerClassName("-left-3")}>
                {hour.toString().padStart(2, "0")}:00
              </span>
            </div>
          ))}
        </div>

        <div className="relative mt-3 space-y-3">
          <div className="absolute top-0 bottom-0 left-32 sm:left-36 right-0 flex pointer-events-none">
            {hoursRange.slice(0, -1).map((hour) => (
              <div key={hour} className={ganttGridLineClassName()} />
            ))}
          </div>

          {rows.map((row) => (
            <div key={row.userId} className="flex items-center h-10 relative">
              <div className={ganttUserColumnClassName()}>
                <Avatar className={hrAvatarClassName("h-7 w-7 text-xs")}>{row.userName.charAt(0)}</Avatar>
                <span className={cn("text-sm truncate", text.primary)}>{row.userName}</span>
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
                      {width > 12 ? label : ""}
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
