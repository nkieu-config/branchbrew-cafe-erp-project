"use client";

import { useMemo, useState } from "react";
import { usePurchaseOrders, useSuppliers, useCreatePurchaseOrder, useSubmitPurchaseOrder, useApprovePurchaseOrder, useRejectPurchaseOrder, useReceivePurchaseOrder } from '@/hooks/domains/useProcurementQueries';
import { useIngredients } from '@/hooks/domains/useProductionQueries';
import { useAuth } from "@/context/AuthContext";
import { Table, Form, Select, InputNumber, Space, Steps } from "antd";
import { FormModal } from "@/components/shared/form-modal";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TableActionButton } from "@/components/shared/table-action-button";
import { StatusBadge, poStatusTone } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, XCircle, CheckSquare, Trash2, Truck, Send, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { HubCard } from "@/components/shared/hub-card";
import { BranchEmptyState } from "@/components/shared/branch-empty-state";
import { DataTable } from "@/components/shared/data-table";
import { PurchaseOrder, Supplier, Ingredient, PurchaseOrderItem, Branch } from "@/types/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateTime } from "@/lib/intl-date";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useBranches } from "@/hooks/domains/useGeneralQueries";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import {
  expandedRowPanelClassName,
  formSectionClassName,
  hubCtaClassName,
  hubPrimaryActionClassName,
  infoBannerClassName,
  infoBannerIconClassName,
  infoBannerTextClassName,
  infoBannerTitleClassName,
  receiveLineClassName,
  tableActionAccentClassName,
  text,
} from "@/lib/theme";

interface CreatePOFormValues {
  supplierId: number;
  items: { ingredientId: number; quantity: number; unitPrice?: number }[];
}

export default function ProcurementPage() {
  const { user, activeBranchId } = useAuth();
  const { data: branches = [] } = useBranches();
  const branchId = activeBranchId ? Number(activeBranchId) : undefined;
  const branchName = (branches as Branch[]).find((b) => b.id === branchId)?.name;
  const {
    data: posData,
    isLoading: loadingPos,
    isError: posError,
    error: posErr,
    refetch: refetchPos,
    isFetching: posFetching,
  } = usePurchaseOrders();
  const { data: suppliersData, isLoading: loadingSup } = useSuppliers();
  const { data: ingredientsData, isLoading: loadingIng } = useIngredients();

  const suppliers = suppliersData || [];
  const ingredients = ingredientsData || [];
  
  let pos = posData || [];
  if (activeBranchId) {
    pos = pos.filter((po: PurchaseOrder) => po.branchId === activeBranchId);
  }

  const loading = loadingPos || loadingSup || loadingIng;

  const approveMutation = useApprovePurchaseOrder();
  const rejectMutation = useRejectPurchaseOrder();
  const receiveMutation = useReceivePurchaseOrder();
  const createMutation = useCreatePurchaseOrder();
  const submitMutation = useSubmitPurchaseOrder();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receivePo, setReceivePo] = useState<PurchaseOrder | null>(null);
  const [expiryByIngredient, setExpiryByIngredient] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [confirmAction, setConfirmAction] = useState<
    { type: "approve" | "reject"; po: PurchaseOrder } | null
  >(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 300);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Removed manual loadData with useEffect

  const handleApprove = async (poId: number) => {
    try {
      await approveMutation.mutateAsync(poId);
      toast.success("Purchase Order approved successfully!");
    } catch (error: unknown) {
      if (error instanceof Error) toast.error(error.message || "Failed to approve PO");
    }
  };

  const handleReject = async (poId: number) => {
    try {
      await rejectMutation.mutateAsync(poId);
      toast.success("Purchase Order rejected.");
    } catch (error: unknown) {
      if (error instanceof Error) toast.error(error.message || "Failed to reject PO");
    }
  };

  const openReceive = (po: PurchaseOrder) => {
    setReceivePo(po);
    const defaults: Record<number, string> = {};
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    const iso = defaultDate.toISOString().slice(0, 10);
    for (const item of po.items ?? []) {
      defaults[item.ingredientId] = iso;
    }
    setExpiryByIngredient(defaults);
  };

  const handleReceive = async () => {
    if (!receivePo) return;
    try {
      const items = (receivePo.items ?? []).map((item) => ({
        ingredientId: item.ingredientId,
        expiryDate: expiryByIngredient[item.ingredientId] || undefined,
      }));
      await receiveMutation.mutateAsync({ id: receivePo.id, items });
      toast.success("Purchase Order received! Inventory updated.");
      setReceivePo(null);
    } catch (error: unknown) {
      if (error instanceof Error) toast.error(error.message || "Failed to receive PO");
    }
  };

  const handleCreateSubmit = async (values: CreatePOFormValues) => {
    if (!activeBranchId) {
      toast.error("Please select a branch first");
      return;
    }
    if (!values.items || values.items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    setSubmitting(true);
    try {
      await createMutation.mutateAsync({
        branchId: activeBranchId,
        supplierId: values.supplierId,
        items: values.items.map((i) => ({
          ingredientId: i.ingredientId,
          quantity: i.quantity,
          unitPrice: i.unitPrice ?? 0,
        })),
      });
      toast.success("Purchase Order created successfully");
      setIsModalOpen(false);
      form.resetFields();
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message || "Failed to create PO");
    } finally {
      setSubmitting(false);
    }
  };

  const getStepCurrent = (status: string) => {
    switch (status) {
      case "DRAFT": return 0;
      case "PENDING": return 1;
      case "APPROVED": return 2;
      case "RECEIVED": return 3;
      default: return 0;
    }
  };

  const canApprove = user?.role === "SUPER_ADMIN" || user?.role === "MANAGER";

  const sortedPos = useMemo(() => {
    return [...pos].sort((a, b) => {
      const aDraftAuto = a.status === 'DRAFT' && a.isAutoGenerated ? 1 : 0;
      const bDraftAuto = b.status === 'DRAFT' && b.isAutoGenerated ? 1 : 0;
      if (aDraftAuto !== bDraftAuto) return bDraftAuto - aDraftAuto;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [pos]);

  const draftAutoPos = useMemo(
    () => sortedPos.filter((po) => po.status === 'DRAFT' && po.isAutoGenerated),
    [sortedPos],
  );

  const filteredPos = useMemo(() => {
    return sortedPos.filter((po) => {
      const matchesStatus = statusFilter === "ALL" || po.status === statusFilter;
      if (!debouncedSearch) return matchesStatus;
      const haystack = [
        String(po.id),
        po.status,
        po.supplier?.name ?? "",
      ].join(" ").toLowerCase();
      return matchesStatus && haystack.includes(debouncedSearch);
    });
  }, [sortedPos, debouncedSearch, statusFilter]);

  const hasActiveFilters = search.trim().length > 0 || statusFilter !== "ALL";

  const handleSubmit = async (poId: number) => {
    try {
      await submitMutation.mutateAsync(poId);
      toast.success("Purchase order submitted for approval");
    } catch (error: unknown) {
      if (error instanceof Error) toast.error(error.message || "Failed to submit PO");
    }
  };

  const columns = [
    {
      title: 'PO Number',
      key: 'poNumber',
      render: (_: unknown, record: PurchaseOrder) => (
        <div className="flex items-center gap-2">
          <span className={`font-semibold ${text.primary}`}>{record.poNumber}</span>
          {record.isAutoGenerated && (
            <StatusBadge tone="info" className="text-[10px]">AUTO</StatusBadge>
          )}
        </div>
      ),
    },
    {
      title: 'Branch',
      dataIndex: ['branch', 'name'],
      key: 'branch',
    },
    {
      title: 'Supplier',
      dataIndex: ['supplier', 'name'],
      key: 'supplier',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDateTime(date),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: unknown, record: PurchaseOrder) => (
        <StatusBadge tone={poStatusTone(record.status)} className="tracking-wide">
          {record.status}
        </StatusBadge>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right' as const,
      render: (_: unknown, po: PurchaseOrder) => (
        <div className="flex justify-end gap-1">
          {po.status === "DRAFT" && (po.items?.length ?? 0) > 0 && (
            <TableActionButton
              icon={Send}
              label="Submit"
              onClick={() => void handleSubmit(po.id)}
              className={tableActionAccentClassName("indigo")}
            />
          )}
          {po.status === "PENDING" && canApprove && (
            <>
              <TableActionButton
                icon={CheckSquare}
                label="Approve"
                onClick={() => setConfirmAction({ type: "approve", po })}
                className={tableActionAccentClassName("blue")}
              />
              <TableActionButton
                icon={XCircle}
                label="Reject"
                onClick={() => setConfirmAction({ type: "reject", po })}
                destructive
              />
            </>
          )}

          {po.status === "APPROVED" && (
            <TableActionButton
              icon={CheckCircle2}
              label="Receive"
              onClick={() => openReceive(po)}
              className={tableActionAccentClassName("emerald")}
            />
          )}
        </div>
      ),
    },
  ];

  const expandedRowRender = (record: PurchaseOrder) => {
    const itemColumns = [
      { title: 'Ingredient', dataIndex: ['ingredient', 'name'], key: 'name' },
      { title: 'Quantity Req.', dataIndex: 'quantityRequested', key: 'qty', render: (val: number, rec: PurchaseOrderItem) => `${val} ${rec.ingredient?.unit ?? ''}` },
      { title: 'Unit Price', dataIndex: 'unitPrice', key: 'price', render: (val: number) => `฿${Number(val).toFixed(2)}` },
      { title: 'Total', key: 'total', render: (_: unknown, rec: PurchaseOrderItem) => `฿${(rec.quantityRequested * rec.unitPrice).toFixed(2)}` },
    ];

    const stepItems = [
      { title: "Draft", description: "Prepared" },
      { title: "Pending", description: "Approval" },
      { title: "Approved", description: "Waiting Delivery" },
      { title: "Received", description: "In Stock" }
    ];

    return (
      <div className={expandedRowPanelClassName()}>
        <div className="mb-6 px-10">
          <Steps 
            current={getStepCurrent(record.status)} 
            size="small"
            status={
              record.status === 'DRAFT' &&
              !record.isAutoGenerated &&
              (record.items?.length ?? 0) === 0
                ? 'error'
                : 'process'
            }
            items={stepItems}
          />
        </div>
        <DataTable 
          columns={itemColumns} 
          dataSource={record.items ?? []} 
          rowKey="id" 
          pagination={false} 
          size="small" 
          hideBorders
        />
      </div>
    );
  };

  return (
    <>
      {!activeBranchId ? (
        <BranchEmptyState description="Select a branch in the top bar to view and manage purchase orders." />
      ) : (
      <HubCard
        title="Purchase Orders"
        icon={Truck}
        description="Create and track supplier orders. Use Receive to add approved PO lines into inventory — for ad-hoc receipts without a PO, use Inventory → Receive Stock (GRN)."
        actions={
          <Button className={hubCtaClassName("procurement")} onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create PO
          </Button>
        }
      >

      {draftAutoPos.length > 0 && (
        <div className={infoBannerClassName()}>
          <div className="flex items-start gap-3">
            <AlertTriangle className={infoBannerIconClassName()} />
            <div>
              <p className={infoBannerTitleClassName()}>
                {draftAutoPos.length} auto-reorder draft{draftAutoPos.length > 1 ? 's' : ''} ready
              </p>
              <p className={infoBannerTextClassName()}>
                Created when stock fell below minimum. Review and submit for manager approval.
              </p>
            </div>
          </div>
        </div>
      )}

      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search PO #, supplier, status…"
        branchName={branchName}
        showReset={hasActiveFilters}
        onReset={() => {
          setSearch("");
          setStatusFilter("ALL");
        }}
        filters={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={cn(
              "min-h-[44px] rounded-md border px-3 text-sm",
              "border-[var(--border)] bg-[var(--table-container-bg)] text-[var(--foreground)]",
            )}
            aria-label="Filter by PO status"
          >
            <option value="ALL">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="RECEIVED">Received</option>
          </select>
        }
      />

      <DataTable 
        columns={columns} 
        dataSource={filteredPos} 
        rowKey="id"
        loading={loading}
        isError={posError}
        errorMessage={getErrorMessage(posErr, "Failed to load purchase orders")}
        onRetry={() => void refetchPos()}
        retryLoading={posFetching}
        emptyDescription={hasActiveFilters ? "No purchase orders match your filters." : "No purchase orders yet."}
        expandable={{ expandedRowRender }}
        pagination={{ pageSize: 10 }}
      />
      </HubCard>
      )}

      {/* Create PO Modal */}
      <FormModal
        title="Create Purchase Order"
        icon={Truck}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); form.resetFields(); }}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateSubmit}
          className="mt-6"
        >
          <Form.Item 
            label="Select Supplier" 
            name="supplierId" 
            rules={[{ required: true, message: 'Supplier is required' }]}
          >
            <Select 
              showSearch
              placeholder="Search and select supplier"
              optionFilterProp="children"
              className="h-10"
              options={suppliers.map((s: Supplier) => ({ value: s.id, label: s.name }))}
            />
          </Form.Item>

          <div className={formSectionClassName()}>
            <h3 className={`text-sm font-semibold mb-4 ${text.secondary}`}>Order Items</h3>
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="flex gap-4 items-start mb-4">
                      <Form.Item
                        {...restField}
                        name={[name, 'ingredientId']}
                        rules={[{ required: true, message: 'Missing ingredient' }]}
                        className="mb-0 flex-1"
                      >
                        <Select 
                          showSearch
                          placeholder="Ingredient"
                          options={ingredients.map((i: Ingredient) => ({ value: i.id, label: `${i.name} (${i.unit})` }))}
                          onChange={(val) => {
                            // Auto-fill price if available
                            const ing = ingredients.find((i: Ingredient) => i.id === val);
                            if (ing && ing.costPerUnit != null) {
                              const currentItems = form.getFieldValue('items');
                              currentItems[name].unitPrice = Number(ing.costPerUnit);
                              form.setFieldsValue({ items: currentItems });
                            }
                          }}
                        />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'quantity']}
                        rules={[{ required: true, message: 'Missing Qty' }]}
                        className="mb-0 w-32"
                      >
                        <InputNumber placeholder="Qty" min={0.1} step={0.1} className="w-full" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'unitPrice']}
                        rules={[{ required: true, message: 'Missing Price' }]}
                        className="mb-0 w-32"
                      >
                        <InputNumber placeholder="Price/Unit" min={0} step={0.01} className="w-full" />
                      </Form.Item>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive shrink-0"
                        onClick={() => remove(name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Form.Item className="mb-0 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-dashed"
                      onClick={() => add()}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              className={hubCtaClassName("procurement")}
              disabled={submitting}
              onClick={() => form.submit()}
            >
              {submitting ? "Submitting…" : "Submit PO"}
            </Button>
          </div>
        </Form>
      </FormModal>

      <FormModal
        title={`Receive ${receivePo?.poNumber ?? 'PO'}`}
        icon={CheckCircle2}
        isOpen={!!receivePo}
        onClose={() => setReceivePo(null)}
        width={560}
      >
        <div className="space-y-4 mt-4">
          <p className={`text-sm ${text.muted}`}>
            Receiving a PO updates inventory batches for this order. For deliveries not linked to a PO, use Inventory → Receive Stock (GRN) instead.
          </p>
          <p className={`text-sm ${text.muted}`}>Set expiry dates for incoming batches (optional per line).</p>
          {(receivePo?.items ?? []).map((item) => (
            <div key={item.id} className={receiveLineClassName()}>
              <div>
                <div className={`font-medium ${text.primary}`}>{item.ingredient?.name}</div>
                <div className={`text-xs ${text.muted}`}>{item.quantityRequested} {item.ingredient?.unit}</div>
              </div>
              <div className="w-44">
                <Label className="text-xs">Expiry date</Label>
                <Input
                  type="date"
                  value={expiryByIngredient[item.ingredientId] ?? ''}
                  onChange={(e) =>
                    setExpiryByIngredient((prev) => ({
                      ...prev,
                      [item.ingredientId]: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setReceivePo(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              className={hubPrimaryActionClassName()}
              disabled={receiveMutation.isPending}
              onClick={() => void handleReceive()}
            >
              {receiveMutation.isPending ? "Receiving…" : "Confirm Receive"}
            </Button>
          </div>
        </div>
      </FormModal>

      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={
          confirmAction?.type === "approve"
            ? "Approve this PO?"
            : "Reject this PO?"
        }
        confirmLabel={confirmAction?.type === "approve" ? "Approve" : "Reject"}
        destructive={confirmAction?.type === "reject"}
        loading={approveMutation.isPending || rejectMutation.isPending}
        onConfirm={async () => {
          if (!confirmAction) return;
          if (confirmAction.type === "approve") {
            await handleApprove(confirmAction.po.id);
          } else {
            await handleReject(confirmAction.po.id);
          }
        }}
      />
    </>
  );
}
