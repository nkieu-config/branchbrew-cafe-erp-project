"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  usePurchaseOrders,
  useSuppliers,
  useCreatePurchaseOrder,
  useSubmitPurchaseOrder,
  useApprovePurchaseOrder,
  useRejectPurchaseOrder,
  useReceivePurchaseOrder,
} from "@/hooks/domains/useProcurementQueries";
import { useIngredients } from "@/hooks/domains/useProductQueries";
import { useAuth } from "@/context/AuthContext";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TableActionButton } from "@/components/shared/table-action-button";
import { StatusBadge, poStatusTone } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Plus,
  CheckCircle2,
  XCircle,
  CheckSquare,
  Truck,
  Send,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { HubPageHeader } from "@/components/shared/hub-card";
import { BranchEmptyState } from "@/components/shared/branch-empty-state";
import { DataTable } from "@/components/shared/data-table";
import { HubListPage } from "@/components/shared/hub-list-page";
import { ListFilterSelect } from "@/components/shared/list-filters";
import { CreatePOModal } from "@/components/procurement/CreatePOModal";
import {
  PurchaseOrderExpandedPanel,
  ReceivePurchaseOrderDialog,
} from "@/components/procurement/ReceivePurchaseOrderDialog";
import { formatDateTime } from "@/lib/intl-date";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useBranches } from "@/hooks/domains/useGeneralQueries";
import { getErrorMessage } from "@/lib/errors";
import { formatCurrency } from "@/lib/money";
import {
  buildProcurementOrdersUrl,
  parseProcurementOrdersSearchParams,
} from "@/lib/procurement-hub-url";
import {
  computePurchaseOrderTotal,
  matchesPOHighlightFilter,
  matchesPOSupplierFilter,
  matchesPOStatusFilter,
  summarizePurchaseOrders,
  type POHighlightFilter,
  type POStatusFilter,
} from "@/lib/purchase-order-filters";
import type { Branch, PurchaseOrder, Supplier } from "@/types/api";
import { hubListDataTableProps } from "@/lib/theme/data-table";
import { tableCellMutedClassName } from "@/lib/theme/feedback";
import { infoBannerClassName, infoBannerIconClassName, infoBannerTextClassName, infoBannerTitleClassName } from "@/lib/theme/hub-banners";
import { hubCtaClassName, inlineLinkClassName, tableActionAccentClassName } from "@/lib/theme/hub-primitives";
import { procurementMetaBadgeClassName, procurementSectionPanelClassName } from "@/lib/theme/hub-procurement";
import { metricValueClassName } from "@/lib/theme/metric";
import { text } from "@/lib/theme/surface";
import { typeUiLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";

export default function ProcurementOrdersPageClient() {
  const { user, activeBranchId } = useAuth();
  const searchParams = useSearchParams();
  const { data: branches = [] } = useBranches();
  const branchId = activeBranchId ? Number(activeBranchId) : undefined;
  const branchName = (branches as Branch[]).find((b) => b.id === branchId)?.name;

  const {
    data: posData = [],
    isLoading: loadingPos,
    isError: posError,
    error: posErr,
    refetch: refetchPos,
    isFetching: posFetching,
  } = usePurchaseOrders();
  const { data: suppliersData = [], isLoading: loadingSup } = useSuppliers();
  const { data: ingredientsData = [], isLoading: loadingIng } = useIngredients();

  const suppliers = suppliersData;
  const ingredients = ingredientsData;

  const branchOrders = useMemo(() => {
    if (!activeBranchId) return [];
    return posData.filter((po: PurchaseOrder) => po.branchId === activeBranchId);
  }, [posData, activeBranchId]);

  const loading = loadingPos || loadingSup || loadingIng;

  const approveMutation = useApprovePurchaseOrder();
  const rejectMutation = useRejectPurchaseOrder();
  const receiveMutation = useReceivePurchaseOrder();
  const createMutation = useCreatePurchaseOrder();
  const submitMutation = useSubmitPurchaseOrder();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receivePo, setReceivePo] = useState<PurchaseOrder | null>(null);
  const [expiryByIngredient, setExpiryByIngredient] = useState<Record<number, string>>({});
  const [confirmAction, setConfirmAction] = useState<
    { type: "approve" | "reject"; po: PurchaseOrder } | null
  >(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 300);
  const [statusFilter, setStatusFilter] = useState<POStatusFilter>("ALL");
  const [highlightFilter, setHighlightFilter] = useState<POHighlightFilter>("ALL");
  const [supplierFilter, setSupplierFilter] = useState<number | null>(null);
  const [submittingPoId, setSubmittingPoId] = useState<number | null>(null);

  useEffect(() => {
    const parsed = parseProcurementOrdersSearchParams(searchParams);
    if (parsed.status !== "ALL") setStatusFilter(parsed.status);
    if (parsed.highlightFilter !== "ALL") setHighlightFilter(parsed.highlightFilter);
    if (parsed.supplierId != null) setSupplierFilter(parsed.supplierId);
  }, [searchParams]);

  const sortedPos = useMemo(() => {
    return [...branchOrders].sort((a, b) => {
      const aDraftAuto = a.status === "DRAFT" && a.isAutoGenerated ? 1 : 0;
      const bDraftAuto = b.status === "DRAFT" && b.isAutoGenerated ? 1 : 0;
      if (aDraftAuto !== bDraftAuto) return bDraftAuto - aDraftAuto;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [branchOrders]);

  const summary = useMemo(() => summarizePurchaseOrders(branchOrders), [branchOrders]);

  const filteredPos = useMemo(() => {
    return sortedPos.filter((po) => {
      const matchesStatus = matchesPOStatusFilter(po, statusFilter);
      const matchesHighlight = matchesPOHighlightFilter(po, highlightFilter);
      const matchesSupplier = matchesPOSupplierFilter(po, supplierFilter);
      if (!debouncedSearch) {
        return matchesStatus && matchesHighlight && matchesSupplier;
      }
      const haystack = [String(po.id), po.poNumber, po.status, po.supplier?.name ?? ""]
        .join(" ")
        .toLowerCase();
      return (
        matchesStatus &&
        matchesHighlight &&
        matchesSupplier &&
        haystack.includes(debouncedSearch)
      );
    });
  }, [sortedPos, debouncedSearch, statusFilter, highlightFilter, supplierFilter]);

  const hasActiveFilters =
    search.trim().length > 0 ||
    statusFilter !== "ALL" ||
    highlightFilter !== "ALL" ||
    supplierFilter != null;

  const canApprove = user?.role === "SUPER_ADMIN" || user?.role === "MANAGER";

  const handleApprove = async (poId: number) => {
    try {
      await approveMutation.mutateAsync(poId);
      toast.success("Purchase Order approved successfully!");
      setConfirmAction(null);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to approve PO"));
    }
  };

  const handleReject = async (poId: number) => {
    try {
      await rejectMutation.mutateAsync(poId);
      toast.success("Purchase Order returned to draft.");
      setConfirmAction(null);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to reject PO"));
    }
  };

  const openReceive = useCallback((po: PurchaseOrder) => {
    setReceivePo(po);
    const defaults: Record<number, string> = {};
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    const iso = defaultDate.toISOString().slice(0, 10);
    for (const item of po.items ?? []) {
      defaults[item.ingredientId] = iso;
    }
    setExpiryByIngredient(defaults);
  }, []);

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
      toast.error(getErrorMessage(error, "Failed to receive PO"));
    }
  };

  const handleCreateSubmit = async (payload: {
    supplierId: number;
    items: { ingredientId: number; quantity: number; unitPrice: number }[];
  }) => {
    if (!activeBranchId) {
      toast.error("Please select a branch first");
      return;
    }
    try {
      await createMutation.mutateAsync({
        branchId: activeBranchId,
        supplierId: payload.supplierId,
        items: payload.items,
      });
      toast.success("Purchase Order created successfully");
      setIsModalOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to create PO"));
    }
  };

  const handleSubmit = async (poId: number) => {
    setSubmittingPoId(poId);
    try {
      await submitMutation.mutateAsync(poId);
      toast.success("Purchase order submitted for approval");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to submit PO"));
    } finally {
      setSubmittingPoId(null);
    }
  };

  const columns = useMemo(
    () =>
      [
        {
          title: "PO Number",
          key: "poNumber",
          render: (_: unknown, record: PurchaseOrder) => (
            <div className="flex flex-wrap items-center gap-2">
              <span className={typeUiLabelClassName(text.primary)}>{record.poNumber}</span>
              {record.isAutoGenerated && (
                <StatusBadge tone="info" className={procurementMetaBadgeClassName()}>
                  AUTO
                </StatusBadge>
              )}
            </div>
          ),
        },
        {
          title: "Supplier",
          key: "supplier",
          render: (_: unknown, record: PurchaseOrder) =>
            record.supplier?.name ? (
              <Link
                href={buildProcurementOrdersUrl({ supplier: record.supplierId })}
                className={inlineLinkClassName()}
              >
                {record.supplier.name}
              </Link>
            ) : (
              <span className={text.muted}>—</span>
            ),
        },
        {
          title: "Total",
          key: "total",
          align: "right" as const,
          responsive: ["md"],
          render: (_: unknown, record: PurchaseOrder) => (
            <span className={typeUiLabelClassName(cn("tabular-nums", metricValueClassName("emerald")))}>
              {formatCurrency(computePurchaseOrderTotal(record))}
            </span>
          ),
        },
        {
          title: "Created",
          dataIndex: "createdAt",
          key: "createdAt",
          responsive: ["lg"],
          render: (date: string) => (
            <span className={cn("text-sm", text.muted)}>{formatDateTime(date)}</span>
          ),
        },
        {
          title: "Status",
          key: "status",
          render: (_: unknown, record: PurchaseOrder) => (
            <StatusBadge tone={poStatusTone(record.status)} className="tracking-wide">
              {record.status}
            </StatusBadge>
          ),
        },
        {
          title: "",
          key: "action",
          align: "right" as const,
          width: 160,
          render: (_: unknown, po: PurchaseOrder) => (
            <div className="flex justify-end gap-1">
              {po.status === "DRAFT" && (po.items?.length ?? 0) > 0 && (
                <TableActionButton
                  icon={submittingPoId === po.id ? Loader2 : Send}
                  label={`Submit ${po.poNumber}`}
                  onClick={() => {
                    if (submittingPoId === po.id) return;
                    void handleSubmit(po.id);
                  }}
                  className={cn(
                    tableActionAccentClassName("indigo"),
                    submittingPoId === po.id && "[&_svg]:animate-spin",
                  )}
                />
              )}
              {po.status === "PENDING" && canApprove && (
                <>
                  <TableActionButton
                    icon={CheckSquare}
                    label={`Approve ${po.poNumber}`}
                    iconOnly
                    onClick={() => setConfirmAction({ type: "approve", po })}
                    className={tableActionAccentClassName("blue")}
                  />
                  <TableActionButton
                    icon={XCircle}
                    label={`Reject ${po.poNumber}`}
                    iconOnly
                    destructive
                    onClick={() => setConfirmAction({ type: "reject", po })}
                  />
                </>
              )}
              {po.status === "APPROVED" && (
                <TableActionButton
                  icon={CheckCircle2}
                  label={`Receive ${po.poNumber}`}
                  onClick={() => openReceive(po)}
                  className={tableActionAccentClassName("emerald")}
                />
              )}
            </div>
          ),
        },
      ] as ColumnsType<PurchaseOrder>,
    [canApprove, openReceive, submittingPoId],
  );

  const expandedRowRender = (record: PurchaseOrder) => (
    <PurchaseOrderExpandedPanel record={record} />
  );

  if (!activeBranchId) {
    return (
      <BranchEmptyState description="Select a branch in the top bar to view and manage purchase orders." />
    );
  }

  return (
    <>
      <HubPageHeader
        hideTitle
        icon={Truck}
        accentHub="procurement"
        branchScope={{ branchName }}
        actions={
          <Button
            className={hubCtaClassName("procurement")}
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden />
            Create PO
          </Button>
        }
      />

      <HubListPage className={procurementSectionPanelClassName()}>
        {summary.autoDraft > 0 && (
          <HubListPage.Banner>
            <div className={infoBannerClassName()}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={infoBannerIconClassName()} aria-hidden />
                <div>
                  <p className={infoBannerTitleClassName()}>
                    {summary.autoDraft} auto-reorder draft{summary.autoDraft > 1 ? "s" : ""} ready
                  </p>
                  <p className={infoBannerTextClassName()}>
                    Created when stock fell below minimum. Review and submit for manager approval.
                  </p>
                </div>
              </div>
            </div>
          </HubListPage.Banner>
        )}

        <HubListPage.Error
          message={posError ? getErrorMessage(posErr, "Failed to load purchase orders") : undefined}
          onRetry={() => void refetchPos()}
          loading={posFetching}
        />

        <HubListPage.Toolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search PO #, supplier, status…"
          showReset={hasActiveFilters}
          onReset={() => {
            setSearch("");
            setStatusFilter("ALL");
            setHighlightFilter("ALL");
            setSupplierFilter(null);
          }}
          filters={
            <>
              <ListFilterSelect
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as POStatusFilter)}
                ariaLabel="Filter by PO status"
                widthClassName="w-full sm:w-[180px]"
                options={[
                  { value: "ALL", label: "All statuses" },
                  { value: "DRAFT", label: "Draft" },
                  { value: "PENDING", label: "Pending" },
                  { value: "APPROVED", label: "Approved" },
                  { value: "RECEIVED", label: "Received" },
                ]}
              />
              <ListFilterSelect
                value={highlightFilter}
                onValueChange={(value) => setHighlightFilter(value as POHighlightFilter)}
                ariaLabel="Filter by order type"
                widthClassName="w-full sm:w-[180px]"
                options={[
                  { value: "ALL", label: "All types" },
                  { value: "auto-draft", label: "Auto-reorder drafts" },
                ]}
              />
              {suppliers.length > 0 && (
                <ListFilterSelect
                  value={supplierFilter != null ? String(supplierFilter) : "ALL"}
                  onValueChange={(value) => {
                    setSupplierFilter(value === "ALL" ? null : Number(value));
                  }}
                  ariaLabel="Filter by supplier"
                  widthClassName="w-full sm:w-[200px]"
                  options={[
                    { value: "ALL", label: "All suppliers" },
                    ...suppliers.map((supplier: Supplier) => ({
                      value: String(supplier.id),
                      label: supplier.name,
                    })),
                  ]}
                />
              )}
            </>
          }
        />

        <HubListPage.Count
          isLoading={loading}
          isError={posError}
          isFetching={posFetching}
          hasActiveFilters={hasActiveFilters}
          filteredCount={filteredPos.length}
          totalCount={summary.total}
          itemLabel="purchase order"
        />

        <DataTable
          {...hubListDataTableProps()}
          columns={columns}
          dataSource={filteredPos}
          rowKey="id"
          loading={loading}
          emptyDescription={
            hasActiveFilters
              ? "No purchase orders match your filters."
              : suppliers.length === 0
                ? "No suppliers yet — add vendors before creating purchase orders."
                : "No purchase orders yet."
          }
          expandable={{ expandedRowRender }}
        />
      </HubListPage>

      <CreatePOModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        suppliers={suppliers}
        ingredients={ingredients}
        onSubmit={handleCreateSubmit}
        isSubmitting={createMutation.isPending}
      />

      <ReceivePurchaseOrderDialog
        purchaseOrder={receivePo}
        expiryByIngredient={expiryByIngredient}
        onExpiryChange={(ingredientId, value) =>
          setExpiryByIngredient((prev) => ({ ...prev, [ingredientId]: value }))
        }
        onClose={() => setReceivePo(null)}
        onConfirm={() => void handleReceive()}
        isSubmitting={receiveMutation.isPending}
      />

      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={confirmAction?.type === "approve" ? "Approve this PO?" : "Reject this PO?"}
        description={
          confirmAction?.type === "reject"
            ? "The purchase order will return to draft so it can be edited and resubmitted."
            : "This will allow the branch to receive the order into inventory."
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
