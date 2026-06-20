"use client"

import { useState, useEffect } from "react"
import { fetchAPI } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { Table, Tag, Typography, Tooltip } from "antd"
import { Clock, AlertCircle } from "lucide-react"
import { AnimatedPage } from "@/components/animated-page"
import { format, isSameDay, differenceInMinutes } from "date-fns"

const { Text } = Typography;

export default function AttendancePage() {
  const { activeBranchId } = useAuth()
  const [attendance, setAttendance] = useState<any[]>([])
  const [shifts, setShifts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (activeBranchId) {
      fetchData()
    }
  }, [activeBranchId])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [attendanceData, shiftsData] = await Promise.all([
        fetchAPI('/hr/attendance/me'),
        fetchAPI('/hr/shifts/me')
      ])
      setAttendance(attendanceData || [])
      setShifts(shiftsData || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const columns = [
    {
      title: 'Date',
      dataIndex: 'clockIn',
      key: 'date',
      render: (val: string) => <span className="font-medium text-slate-800 dark:text-slate-200">{format(new Date(val), 'dd MMM yyyy')}</span>,
    },
    {
      title: 'Clock In',
      dataIndex: 'clockIn',
      key: 'in',
      render: (val: string, record: any) => {
        const clockInDate = new Date(val);
        // Find the corresponding shift for this day
        const dayShift = shifts.find(s => isSameDay(new Date(s.startTime), clockInDate));
        
        let isLate = false;
        let lateMinutes = 0;
        
        if (dayShift) {
          const shiftStart = new Date(dayShift.startTime);
          lateMinutes = differenceInMinutes(clockInDate, shiftStart);
          if (lateMinutes > 15) {
            isLate = true;
          }
        }

        return (
          <div className="flex items-center gap-2">
            <Text type={isLate ? "danger" : "success"} className="font-mono font-bold">
              {format(clockInDate, 'HH:mm:ss')}
            </Text>
            {isLate && (
              <Tooltip title={`Late by ${lateMinutes} minutes (Shift started at ${format(new Date(dayShift.startTime), 'HH:mm')})`}>
                <Tag color="error" className="flex items-center gap-1 font-bold rounded-md border-0 m-0 shadow-sm">
                  <AlertCircle className="w-3 h-3" /> LATE
                </Tag>
              </Tooltip>
            )}
          </div>
        )
      },
    },
    {
      title: 'Clock Out',
      dataIndex: 'clockOut',
      key: 'out',
      render: (val: string) => val ? (
        <Text className="font-mono text-slate-600 dark:text-slate-400 font-medium">{format(new Date(val), 'HH:mm:ss')}</Text>
      ) : (
        <Tag color="processing" className="animate-pulse font-bold border-0 shadow-sm">Active</Tag>
      ),
    },
    {
      title: 'Total Hours',
      dataIndex: 'totalHours',
      key: 'hours',
      align: 'right' as const,
      render: (val: number) => val ? (
        <span className="font-bold">{val.toFixed(2)} hrs</span>
      ) : (
        <span className="text-slate-400">-</span>
      ),
    },
  ];

  return (
    <AnimatedPage className="space-y-6 w-full">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-1">
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-t-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-violet-500" />
          My Attendance Records
        </div>
        <Table 
          columns={columns} 
          dataSource={attendance} 
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          className="w-full overflow-x-auto [&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:dark:bg-slate-900"
          rowClassName={(record) => {
            const clockInDate = new Date(record.clockIn);
            const dayShift = shifts.find(s => isSameDay(new Date(s.startTime), clockInDate));
            if (dayShift) {
              const lateMinutes = differenceInMinutes(clockInDate, new Date(dayShift.startTime));
              if (lateMinutes > 15) return "bg-rose-50/50 dark:bg-rose-900/10";
            }
            return "";
          }}
        />
      </div>
    </AnimatedPage>
  )
}
