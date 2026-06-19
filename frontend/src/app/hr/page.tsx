"use client";

import { useEffect, useState } from "react";
import { getMyAttendance, getMyShifts } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserSquare2, Clock, Calendar, DollarSign, Edit2, Settings } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function HrDashboardPage() {
  const { user, activeBranchId } = useAuth();
  const [activeTab, setActiveTab] = useState('timesheet');
  const [loading, setLoading] = useState(true);

  const [attendance, setAttendance] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [activeTab, activeBranchId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'timesheet') {
        const data = await getMyAttendance();
        setAttendance(data);
      } else if (activeTab === 'shifts') {
        const data = await getMyShifts();
        setShifts(data);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };



  const formatDuration = (hours: number | null) => {
    if (hours === null) return "In Progress";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  if (loading && attendance.length === 0 && shifts.length === 0) {
    return <div className="p-10 text-center">Loading HR Dashboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
          <UserSquare2 className="text-emerald-600 dark:text-emerald-500" /> Human Resources
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Manage time, attendance, and payroll.</p>
      </div>

      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button 
          className={`pb-2 px-1 font-semibold ${activeTab === 'timesheet' ? 'border-b-2 border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}
          onClick={() => setActiveTab('timesheet')}
        >
          My Timesheet
        </button>
        <button 
          className={`pb-2 px-1 font-semibold ${activeTab === 'shifts' ? 'border-b-2 border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}
          onClick={() => setActiveTab('shifts')}
        >
          My Shifts
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[400px]">
        {activeTab === 'timesheet' && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Total Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{new Date(a.clockIn).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(a.clockIn).toLocaleTimeString()}</TableCell>
                  <TableCell>{a.clockOut ? new Date(a.clockOut).toLocaleTimeString() : '-'}</TableCell>
                  <TableCell>{formatDuration(a.totalHours)}</TableCell>
                  <TableCell>
                    {a.clockOut ? <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Completed</Badge> 
                      : <Badge variant="outline" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 animate-pulse">Active</Badge>}
                  </TableCell>
                </TableRow>
              ))}
              {attendance.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400 dark:text-slate-500">No records found</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}

        {activeTab === 'shifts' && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <Calendar className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Shift Scheduling Coming Soon</h3>
            <p>You currently have no assigned shifts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
