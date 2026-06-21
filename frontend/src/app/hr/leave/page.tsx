"use client"

import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Plus, CheckCircle, XCircle, CalendarOff } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { LeaveRequest } from "@prisma/client"
import { AnimatedPage } from "@/components/animated-page"
import { useLeaveRequests, useUpdateLeaveStatus } from "@/hooks/useQueries"
import { toast } from "sonner"

export default function LeaveRequestsPage() {
  const { activeBranchId, user } = useAuth()
  const role = user?.role;
  const isManagerOrAdmin = role === 'SUPER_ADMIN' || role === 'MANAGER';
  const branchIdNum = activeBranchId ? Number(activeBranchId) : undefined;

  const { data: leaveRequests = [], isLoading } = useLeaveRequests(branchIdNum, isManagerOrAdmin);
  const updateLeaveStatusMutation = useUpdateLeaveStatus();

  const approveLeave = async (id: number, status: string) => {
    try {
      await updateLeaveStatusMutation.mutateAsync({ id, status });
      toast.success(`Leave status updated to ${status}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update leave status");
    }
  }

  if (isLoading) {
    return <div className="text-center py-12 text-slate-500">Loading leave requests...</div>
  }

  return (
    <AnimatedPage className="space-y-6 w-full">
      <PageHeader 
        title="Leave Requests"
        icon={CalendarOff}
        actions={
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/20">
            <Plus className="w-4 h-4 mr-2" />
            Request Leave
          </Button>
        }
      />
      <DataTable 
        columns={[
          ...(role === 'SUPER_ADMIN' || role === 'MANAGER' ? [{ title: "Staff", dataIndex: ["user", "name"], key: "staff" }] : []),
          { title: "Type", dataIndex: "type", key: "type" },
          { 
            title: "Dates", 
            key: "dates",
            render: (_: unknown, req: LeaveRequest) => `${new Date(req.startDate).toLocaleDateString()} - ${new Date(req.endDate).toLocaleDateString()}`
          },
          { 
            title: "Status", 
            dataIndex: "status", 
            key: "status",
            render: (status: string) => (
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {status}
              </span>
            )
          },
          ...(role === 'SUPER_ADMIN' || role === 'MANAGER' ? [{
            title: "Actions",
            key: "actions",
            render: (_: unknown, req: LeaveRequest) => req.status === 'PENDING' ? (
              <div className="flex gap-2">
                <button onClick={() => approveLeave(req.id, 'APPROVED')} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                </button>
                <button onClick={() => approveLeave(req.id, 'REJECTED')} className="p-1 text-red-600 hover:bg-red-50 rounded-lg">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            ) : null
          }] : [])
        ]}
        dataSource={leaveRequests}
        rowKey="id"
        loading={isLoading}
      />
    </AnimatedPage>
  )
}
