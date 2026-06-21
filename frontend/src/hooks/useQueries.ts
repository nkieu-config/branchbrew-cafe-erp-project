import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';

// ==========================================
// 📊 ANALYTICS & REPORTS HOOKS
// ==========================================

export const useAnalyticsSummary = (branchId?: string) => {
  return useQuery({
    queryKey: ['analyticsSummary', branchId],
    queryFn: () => fetchAPI(branchId && branchId !== "ALL" ? `/reports/executive?branchId=${branchId}` : '/reports/executive'),
  });
};

export const useTopProducts = (branchId?: string) => {
  return useQuery({
    queryKey: ['topProducts', branchId],
    queryFn: () => fetchAPI(branchId && branchId !== "ALL" ? `/reports/top-products?branchId=${branchId}` : '/reports/top-products'),
  });
};

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => fetchAPI('/orders'),
  });
};

export const useAuditLogs = (limit: number = 100, skip: number = 0) => {
  return useQuery({
    queryKey: ['auditLogs', limit, skip],
    queryFn: () => fetchAPI(`/audit?limit=${limit}&skip=${skip}`),
  });
};

// ==========================================
// 💰 ACCOUNTING HOOKS
// ==========================================

export const useLedger = (branchId?: string) => {
  return useQuery({
    queryKey: ['ledger', branchId],
    queryFn: () => fetchAPI(branchId && branchId !== "ALL" ? `/accounting/profit-loss?branchId=${branchId}` : '/accounting/profit-loss'),
  });
};

export const useJournalEntries = (branchId?: string) => {
  return useQuery({
    queryKey: ['journalEntries', branchId],
    queryFn: () => fetchAPI(branchId && branchId !== "ALL" ? `/accounting/journal?branchId=${branchId}` : '/accounting/journal'),
  });
};

export const useAccounts = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: () => fetchAPI('/accounts'),
  });
};


export const useProductionBOMs = () => {
  return useQuery({
    queryKey: ['productionBOMs'],
    queryFn: () => fetchAPI('/production/boms'),
  });
};

export const useCreateProductionBOM = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchAPI('/production/boms', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['productionBOMs'] }),
  });
};

// ==========================================
// 🍳 KITCHEN & PRODUCTION HOOKS
// ==========================================

export const useKitchenOrders = () => {
  return useQuery({
    queryKey: ['kitchenOrders'],
    queryFn: () => fetchAPI('/production/orders'),
    // Poll every 10 seconds for real-time kitchen updates
    refetchInterval: 10000, 
  });
};

export const useIngredients = () => {
  return useQuery({
    queryKey: ['ingredients'],
    queryFn: () => fetchAPI('/inventory/ingredients'),
  });
};

export const useCompleteKitchenOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetchAPI(`/production/orders/${id}/complete`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchenOrders'] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => fetchAPI(`/production/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchenOrders'] });
    },
  });
};

export const useCreateProductionOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchAPI('/production/orders', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchenOrders'] });
    },
  });
};

// ==========================================
// 👥 CRM HOOKS
// ==========================================

export const useCustomers = (search?: string) => {
  return useQuery({
    queryKey: ['customers', search],
    queryFn: () => fetchAPI(`/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  });
};

export const useCustomer360 = (id: number | null) => {
  return useQuery({
    queryKey: ['customer360', id],
    queryFn: () => fetchAPI(`/customers/${id}/360`),
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchAPI('/customers', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
};

export const usePromotions = () => {
  return useQuery({
    queryKey: ['promotions'],
    queryFn: () => fetchAPI('/promotions'),
  });
};

export const useCreatePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchAPI('/promotions', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promotions'] }),
  });
};

export const useTogglePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number, isActive: boolean }) => fetchAPI(`/promotions/${id}/toggle`, { method: 'PATCH', body: JSON.stringify({ isActive }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promotions'] }),
  });
};

// ==========================================
// 📦 INVENTORY HOOKS
// ==========================================

export const useBranchDetails = (branchId?: number) => {
  return useQuery({
    queryKey: ['branch', branchId],
    queryFn: () => fetchAPI(`/branches/${branchId}`),
    enabled: !!branchId,
  });
};

export const useTransfers = (branchId?: number) => {
  return useQuery({
    queryKey: ['transfers', branchId],
    queryFn: () => fetchAPI(`/branches/${branchId}/transfers`),
    enabled: !!branchId,
  });
};

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchAPI(`/branches/transfers`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transfers', variables.fromBranchId] });
      queryClient.invalidateQueries({ queryKey: ['branch', variables.fromBranchId] });
    },
  });
};

export const useAcceptTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ transferId, branchId }: { transferId: number, branchId: number }) => fetchAPI(`/branches/transfers/${transferId}/accept`, { method: 'POST' }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transfers', variables.branchId] });
      queryClient.invalidateQueries({ queryKey: ['branch', variables.branchId] });
    },
  });
};

export const useAddInventoryBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, data }: { branchId: number, data: unknown }) => fetchAPI(`/branches/${branchId}/batches`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['branch', variables.branchId] });
    },
  });
};

export const useWasteLogs = (branchId?: number) => {
  return useQuery({
    queryKey: ['wasteLogs', branchId],
    queryFn: () => fetchAPI(`/ingredients/waste/logs${branchId ? `?branchId=${branchId}` : ''}`),
    enabled: !!branchId,
  });
};

export const useReportWaste = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, data }: { branchId: number, data: unknown }) => fetchAPI(`/ingredients/${branchId}/waste`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wasteLogs', variables.branchId] });
      queryClient.invalidateQueries({ queryKey: ['branch', variables.branchId] });
    },
  });
};

// ==========================================
// 🛒 PROCUREMENT HOOKS
// ==========================================

export const usePurchaseOrders = () => {
  return useQuery({
    queryKey: ['purchaseOrders'],
    queryFn: () => fetchAPI('/purchase-orders'),
  });
};

export const useSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: () => fetchAPI('/suppliers'),
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchAPI('/purchase-orders', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] }),
  });
};

export const useApprovePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetchAPI(`/purchase-orders/${id}/approve`, { method: 'PATCH' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] }),
  });
};

export const useRejectPurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetchAPI(`/purchase-orders/${id}/reject`, { method: 'PATCH' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] }),
  });
};

export const useReceivePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetchAPI(`/purchase-orders/${id}/receive`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] }),
  });
};

export const useEquipment = (branchId?: number) => {
  return useQuery({
    queryKey: ['equipment', branchId],
    queryFn: () => fetchAPI(branchId ? `/equipment?branchId=${branchId}` : '/equipment'),
  });
};

export const useCreateEquipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchAPI('/equipment', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['equipment', variables.branchId] }),
  });
};

export const useLogMaintenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: unknown }) => fetchAPI(`/equipment/${id}/maintenance`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equipment'] }),
  });
};

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
// 🛒 POS HOOKS
// ==========================================

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => fetchAPI('/products'),
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchAPI('/orders', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
};

export const useValidatePromotion = () => {
  return useMutation({
    mutationFn: ({ code, subtotal }: { code: string, subtotal: number }) => fetchAPI('/promotions/validate', { method: 'POST', body: JSON.stringify({ code, subtotal }) }),
  });
};

export const useCustomerByPhone = () => {
  return useMutation({
    mutationFn: (phone: string) => fetchAPI(`/customers/phone/${phone}`),
  });
};

// ==========================================
// 🌍 GENERAL HOOKS
// ==========================================

export const useBranches = () => {
  return useQuery({
    queryKey: ['branches'],
    queryFn: () => fetchAPI('/branches'),
    staleTime: Infinity, // Branches rarely change
  });
};

// ==========================================
// 💸 FINANCE & SETTLEMENT HOOKS
// ==========================================

export const useFinanceSettlements = (branchId?: number) => {
  return useQuery({
    queryKey: ['financeSettlements', branchId],
    queryFn: () => fetchAPI(branchId ? `/finance/settlements?branchId=${branchId}` : '/finance/settlements'),
  });
};

export const useFinanceExpenses = (branchId?: number) => {
  return useQuery({
    queryKey: ['financeExpenses', branchId],
    queryFn: () => fetchAPI(branchId ? `/finance/expenses?branchId=${branchId}` : '/finance/expenses'),
  });
};

export const useApproveSettlement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetchAPI(`/finance/settlements/${id}/approve`, { method: 'PATCH' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['financeSettlements'] }),
  });
};

export const useExpectedCash = (branchId?: number) => {
  return useQuery({
    queryKey: ['expectedCash', branchId],
    queryFn: () => fetchAPI(`/finance/expected-cash?branchId=${branchId}`),
    enabled: !!branchId,
  });
};

export const useSubmitSettlement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { branchId: number; actualCash: number; actualCreditCard: number; actualQR: number }) => 
      fetchAPI('/finance/settlements', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['financeSettlements'] }),
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { branchId: number; amount: number; category: string; description?: string }) => 
      fetchAPI('/finance/expenses', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['financeExpenses'] }),
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
