"use client"

import { useState, useEffect } from "react"
import { AnimatedPage } from "@/components/animated-page"
import { fetchAPI } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Clock, CalendarDays, Users, Briefcase, Plus, CheckCircle, XCircle } from "lucide-react"

export default function HRDashboardPage() {
  const [activeTab, setActiveTab] = useState<'attendance' | 'shifts' | 'leave' | 'payroll'>('attendance')
  const { activeBranchId, user } = useAuth()
  const role = user?.role;
  
  // States
  const [attendance, setAttendance] = useState<any[]>([])
  const [shifts, setShifts] = useState<any[]>([])
  const [leaveRequests, setLeaveRequests] = useState<any[]>([])
  const [payrollRuns, setPayrollRuns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (activeBranchId) {
      fetchData()
    }
  }, [activeBranchId, activeTab])

  const fetchData = async () => {
    if (!activeBranchId) return;
    setIsLoading(true)
    try {
      if (activeTab === 'attendance') {
        const data = await fetchAPI('/hr/attendance/me')
        setAttendance(data || [])
      } else if (activeTab === 'shifts') {
        if (role === 'SUPER_ADMIN' || role === 'MANAGER') {
          const data = await fetchAPI(`/hr/shifts/branch/${activeBranchId}`)
          setShifts(data || [])
        } else {
          const data = await fetchAPI('/hr/shifts/me')
          setShifts(data || [])
        }
      } else if (activeTab === 'leave') {
        if (role === 'SUPER_ADMIN' || role === 'MANAGER') {
          const data = await fetchAPI(`/hr/leave?branchId=${activeBranchId}`)
          setLeaveRequests(data || [])
        } else {
          const data = await fetchAPI('/hr/leave/me')
          setLeaveRequests(data || [])
        }
      } else if (activeTab === 'payroll') {
        if (role === 'SUPER_ADMIN' || role === 'MANAGER') {
          const data = await fetchAPI(`/hr/payroll-runs?branchId=${activeBranchId}`)
          setPayrollRuns(data || [])
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const approveLeave = async (id: number, status: string) => {
    try {
      await fetchAPI(`/hr/leave/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err) {
      alert("Failed to update leave status");
    }
  }

  return (
    <AnimatedPage className="max-w-[1600px] w-full mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-balance">Human Resources</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage staff, shifts, attendance and payroll.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'attendance'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Attendance
        </button>
        <button
          onClick={() => setActiveTab('shifts')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'shifts'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          Shifts
        </button>
        <button
          onClick={() => setActiveTab('leave')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'leave'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Leave Requests
        </button>
        {(role === 'SUPER_ADMIN' || role === 'MANAGER') && (
          <button
            onClick={() => setActiveTab('payroll')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'payroll'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Payroll
          </button>
        )}
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Loading {activeTab}...</div>
        ) : (
          <>
            {/* ATTENDANCE TAB */}
            {activeTab === 'attendance' && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">My Attendance Records</h2>
                {attendance.length === 0 ? <p className="text-slate-500">No records found.</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                          <th className="px-4 py-3 rounded-l-lg">Date</th>
                          <th className="px-4 py-3">Clock In</th>
                          <th className="px-4 py-3">Clock Out</th>
                          <th className="px-4 py-3 rounded-r-lg">Total Hours</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {attendance.map((record) => (
                          <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                            <td className="px-4 py-4">{new Date(record.clockIn).toLocaleDateString()}</td>
                            <td className="px-4 py-4 text-emerald-600 font-medium">{new Date(record.clockIn).toLocaleTimeString()}</td>
                            <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                              {record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : 'Active'}
                            </td>
                            <td className="px-4 py-4 font-bold">{record.totalHours ? record.totalHours.toFixed(2) + ' hrs' : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SHIFTS TAB */}
            {activeTab === 'shifts' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {(role === 'SUPER_ADMIN' || role === 'MANAGER') ? 'Branch Shifts' : 'My Shifts'}
                  </h2>
                  {(role === 'SUPER_ADMIN' || role === 'MANAGER') && (
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Shift
                    </Button>
                  )}
                </div>
                {shifts.length === 0 ? <p className="text-slate-500">No shifts scheduled.</p> : (
                  <div className="grid gap-3">
                    {shifts.map(shift => (
                      <div key={shift.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {new Date(shift.startTime).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-slate-500 mt-1">
                            {new Date(shift.startTime).toLocaleTimeString()} - {new Date(shift.endTime).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="text-right">
                          {(role === 'SUPER_ADMIN' || role === 'MANAGER') && (
                            <div className="text-sm font-medium mb-1">{shift.user?.name}</div>
                          )}
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                            shift.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                            shift.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {shift.status || 'SCHEDULED'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* LEAVE TAB */}
            {activeTab === 'leave' && (
              <div>
                 <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Leave Requests</h2>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Request Leave
                  </Button>
                </div>
                {leaveRequests.length === 0 ? <p className="text-slate-500">No leave requests.</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                          {(role === 'SUPER_ADMIN' || role === 'MANAGER') && <th className="px-4 py-3 rounded-l-lg">Staff</th>}
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Dates</th>
                          <th className="px-4 py-3">Status</th>
                          {(role === 'SUPER_ADMIN' || role === 'MANAGER') && <th className="px-4 py-3 rounded-r-lg">Actions</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {leaveRequests.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                            {(role === 'SUPER_ADMIN' || role === 'MANAGER') && (
                              <td className="px-4 py-4 font-medium">{req.user?.name}</td>
                            )}
                            <td className="px-4 py-4">{req.type}</td>
                            <td className="px-4 py-4">
                              {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-4">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {req.status}
                              </span>
                            </td>
                            {(role === 'SUPER_ADMIN' || role === 'MANAGER') && req.status === 'PENDING' && (
                              <td className="px-4 py-4">
                                <div className="flex gap-2">
                                  <button onClick={() => approveLeave(req.id, 'APPROVED')} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                                    <CheckCircle className="w-5 h-5" />
                                  </button>
                                  <button onClick={() => approveLeave(req.id, 'REJECTED')} className="p-1 text-red-600 hover:bg-red-50 rounded-lg">
                                    <XCircle className="w-5 h-5" />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* PAYROLL TAB */}
            {activeTab === 'payroll' && (
              <div>
                 <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Payroll Runs</h2>
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl">
                    Generate Payroll
                  </Button>
                </div>
                {payrollRuns.length === 0 ? <p className="text-slate-500">No payroll runs found.</p> : (
                  <div className="grid gap-4">
                    {payrollRuns.map(run => (
                      <div key={run.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            Month {run.month} / {run.year}
                          </div>
                          <div className="text-sm text-slate-500 mt-1">
                            {run.payslips?.length} Payslips generated
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                            run.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                            run.status === 'PAID' ? 'bg-indigo-100 text-indigo-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {run.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AnimatedPage>
  )
}
