import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';

// ==========================================
// 👥 HR HOOKS
// ==========================================
export const useShifts = (role?: string, branchId?: number) => {
  return useQuery({
    queryKey: ['shifts', role, branchId],
    queryFn: () => {
      if ((role === 'SUPER_ADMIN' || role === 'MANAGER') && branchId) {
        return fetchAPI(`/hr/shifts/branch/${branchId}`);
      } else {
        return fetchAPI('/hr/shifts/me');
      }
    },
    enabled: !!role,
  });
};

export const useAttendance = () => {
  return useQuery({
    queryKey: ['attendance', 'me'],
    queryFn: () => fetchAPI('/hr/attendance/me'),
  });
};

// ==========================================
// 👥 HR (LEAVE & PAYROLL) HOOKS
// ==========================================
export const useLeaveRequests = (branchId?: number, isManagerOrAdmin?: boolean) => {
  return useQuery({
    queryKey: ['leaveRequests', branchId, isManagerOrAdmin],
    queryFn: () => isManagerOrAdmin ? fetchAPI(branchId ? `/hr/leave?branchId=${branchId}` : '/hr/leave') : fetchAPI('/hr/leave/me'),
  });
};

export const useUpdateLeaveStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => fetchAPI(`/hr/leave/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaveRequests'] }),
  });
};

export const usePayrollRuns = (branchId?: number) => {
  return useQuery({
    queryKey: ['payrollRuns', branchId],
    queryFn: () => fetchAPI(`/hr/payroll-runs?branchId=${branchId}`),
    enabled: !!branchId,
  });
};

export const useGeneratePayrollRun = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { branchId: number; month: number; year: number }) => 
      fetchAPI('/hr/payroll-runs/generate', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payrollRuns'] }),
  });
};

export const useApprovePayrollRun = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetchAPI(`/hr/payroll-runs/${id}/approve`, { method: 'PATCH' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payrollRuns'] }),
  });
};

