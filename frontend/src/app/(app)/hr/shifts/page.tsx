"use client"

import { useAuth } from "@/context/AuthContext"
import { useShifts } from '@/hooks/domains/useHrQueries';
import { CalendarDays, Plus, UserPlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { HubPageHeader } from "@/components/shared/hub-card";
import { BranchEmptyState } from "@/components/shared/branch-empty-state";
import { formatDate, formatTime } from "@/lib/intl-date";
import { Shift, User } from "@/types/api"
import { Avatar, Tooltip } from "antd"
import {
  ganttGridLineClassName,
  ganttHeaderClassName,
  ganttHourLabelClassName,
  ganttHourMarkerClassName,
  ganttPanelClassName,
  ganttTimeAxisClassName,
  ganttTrackClassName,
  ganttUserColumnClassName,
  hrAvatarClassName,
  hubInfoActionClassName,
  hubLoadingSpinnerClassName,
  shiftBarClassName,
  text,
} from "@/lib/theme"

export default function EmployeesShiftsPage() {
  const { user, activeBranchId } = useAuth()
  const role = user?.role

  const { data: shiftsData, isLoading: loading } = useShifts(role, activeBranchId ?? undefined)
  const shifts = shiftsData || []

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todaysShifts = shifts.filter((s: Shift & { user: User }) => {
    const d = new Date(s.startTime);
    return d >= todayStart && d <= todayEnd;
  });

  const usersWithShifts = Array.from(new Set(todaysShifts.map((s: Shift & { user: User }) => s.user?.name || 'Unknown'))) as string[];

  const HOURS_START = 6;
  const HOURS_END = 22;
  const hoursRange = Array.from({ length: HOURS_END - HOURS_START + 1 }, (_, i) => i + HOURS_START);

  const calculateLeftPercent = (date: string | Date) => {
    const d = new Date(date);
    const h = d.getHours() + d.getMinutes() / 60;
    if (h < HOURS_START) return 0;
    if (h > HOURS_END) return 100;
    return ((h - HOURS_START) / (HOURS_END - HOURS_START)) * 100;
  }

  const calculateWidthPercent = (start: string | Date, end: string | Date) => {
    const s = new Date(start);
    const e = new Date(end);
    let sh = s.getHours() + s.getMinutes() / 60;
    let eh = e.getHours() + e.getMinutes() / 60;
    
    if (sh < HOURS_START) sh = HOURS_START;
    if (eh > HOURS_END) eh = HOURS_END;
    
    let width = ((eh - sh) / (HOURS_END - HOURS_START)) * 100;
    return Math.max(0, width);
  }

  if (!activeBranchId) {
    return (
      <BranchEmptyState description="Select a branch in the top bar to view and manage shift schedules." />
    );
  }

  return (
    <div className="space-y-6">
      <HubPageHeader
        title={(role === 'SUPER_ADMIN' || role === 'MANAGER') ? 'Shift Schedule (Gantt)' : 'My Shifts'}
        icon={CalendarDays}
        description="Manage and view the time-block shift schedule for today."
        actions={
          (role === 'SUPER_ADMIN' || role === 'MANAGER') && (
            <div className="flex gap-2">
              {role === 'SUPER_ADMIN' && (
                <ButtonLink
                  className={hubInfoActionClassName("font-bold")}
                  href="/organization/users"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Employee
                </ButtonLink>
              )}
              <ButtonLink
                variant="outline"
                className="font-bold shadow-sm"
                href="/hr/employees"
              >
                <UserPlus className="w-4 h-4 mr-2" /> Directory
              </ButtonLink>
            </div>
          )
        }
      />

      <div className={ganttPanelClassName()}>
        <div className={ganttHeaderClassName()}>
          <h2 className={`font-black text-lg ${text.primary}`}>Today&apos;s Timeline ({formatDate(new Date())})</h2>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className={`w-8 h-8 ${hubLoadingSpinnerClassName()}`} />
          </div>
        ) : todaysShifts.length === 0 ? (
          <div className={`p-12 text-center font-bold ${text.muted}`}>No shifts scheduled for today.</div>
        ) : (
          <div className="p-4 overflow-x-auto">
            <div className="min-w-[800px]">
              <div className={ganttTimeAxisClassName()}>
                {hoursRange.map(hour => (
                  <div key={hour} className={ganttHourLabelClassName()}>
                    <span className={ganttHourMarkerClassName("-left-3")}>{hour.toString().padStart(2, '0')}:00</span>
                    {hour === HOURS_END && <span className={ganttHourMarkerClassName("-right-3")}>22:00</span>}
                  </div>
                ))}
              </div>

              <div className="relative mt-4 space-y-4">
                <div className="absolute top-0 bottom-0 left-40 right-0 flex pointer-events-none">
                  {hoursRange.slice(0, -1).map(hour => (
                    <div key={hour} className={ganttGridLineClassName()} />
                  ))}
                </div>

                {usersWithShifts.map((userName: string, idx: number) => {
                  const userShifts = todaysShifts.filter((s: Shift & { user: User }) => s.user?.name === userName);
                  return (
                    <div key={idx} className="flex items-center h-12 relative group">
                      <div className={ganttUserColumnClassName()}>
                        <Avatar className={hrAvatarClassName()}>{userName.charAt(0)}</Avatar>
                        <span className={`font-bold text-sm truncate ${text.secondary}`}>{userName}</span>
                      </div>

                      <div className={ganttTrackClassName()}>
                        {userShifts.map((shift: Shift & { user: User }, i: number) => {
                          const left = calculateLeftPercent(shift.startTime);
                          const width = calculateWidthPercent(shift.startTime, shift.endTime);

                          return (
                            <Tooltip 
                              key={i} 
                              title={`${formatTime(shift.startTime)} - ${formatTime(shift.endTime)} (${shift.status})`}
                            >
                              <div 
                                className={shiftBarClassName(shift.status)}
                                style={{ left: `${left}%`, width: `${width}%` }}
                              >
                                {width > 10 ? shift.status : ''}
                              </div>
                            </Tooltip>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
