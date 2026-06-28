"use client";

import { useMemo, useState, useCallback } from "react";
import type { ColumnsType } from "antd/es/table";
import {
  usePromotions,
  useCreatePromotion,
  useUpdatePromotion,
  useDeletePromotion,
  useTogglePromotion,
} from "@/hooks/domains/useCrmQueries";
import { TicketPercent, Plus, Users, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { HubPageHeader } from "@/components/shared/hub-card";
import { DataTable } from "@/components/shared/data-table";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { QueryErrorBanner } from "@/components/shared/query-error-banner";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TableActionButton } from "@/components/shared/table-action-button";
import { Promotion } from "@/types/api";
import { getErrorMessage } from "@/lib/errors";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatDate } from "@/lib/intl-date";
import {
  dateInputToIso,
  getPromoValidity,
  isDuplicatePromoCodeError,
  promoValidityLabel,
  promoValidityTone,
  toDateInputValue,
  type PromoDiscountFilter,
  type PromoStatusFilter,
} from "@/lib/promotion-status";
import {
  crmDialogContentClassName,
  crmSectionPanelClassName,
  crmSummaryChipClassName,
  formFieldInsetClassName,
  formSelectContentClassName,
  hubCtaClassName,
  inventorySummaryStripClassName,
  listToolbarFieldClassName,
  metricValueClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

function formatValidityRange(promotion: Promotion): string {
  const start = promotion.startDate ? formatDate(promotion.startDate) : null;
  const end = promotion.endDate ? formatDate(promotion.endDate) : null;
  if (start && end) return `${start} – ${end}`;
  if (start) return `From ${start}`;
  if (end) return `Until ${end}`;
  return "—";
}

export default function PromotionsPage() {
  const {
    data: promotionsData,
    isLoading: loading,
    isError,
    error,
    refetch,
    isFetching,
  } = usePromotions();
  const promotions = promotionsData || [];

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 300);
  const [statusFilter, setStatusFilter] = useState<PromoStatusFilter>("ALL");
  const [discountFilter, setDiscountFilter] = useState<PromoDiscountFilter>("ALL");

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [minPurchase, setMinPurchase] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const createMutation = useCreatePromotion();
  const updateMutation = useUpdatePromotion();
  const deleteMutation = useDeletePromotion();
  const toggleMutation = useTogglePromotion();

  const summary = useMemo(() => {
    const counts = { active: 0, inactive: 0, expired: 0, scheduled: 0 };
    for (const p of promotions) {
      counts[getPromoValidity(p)] += 1;
    }
    return { total: promotions.length, ...counts };
  }, [promotions]);

  const filteredPromotions = useMemo(() => {
    return promotions.filter((p: Promotion) => {
      const haystack = [p.code, p.description].join(" ").toLowerCase();
      const matchesSearch = !debouncedSearch || haystack.includes(debouncedSearch);
      const validity = getPromoValidity(p);
      const matchesStatus = statusFilter === "ALL" || validity === statusFilter;
      const matchesDiscount =
        discountFilter === "ALL" || p.discountType === discountFilter;
      return matchesSearch && matchesStatus && matchesDiscount;
    });
  }, [promotions, debouncedSearch, statusFilter, discountFilter]);

  const hasActiveFilters =
    search.trim().length > 0 || statusFilter !== "ALL" || discountFilter !== "ALL";

  const resetForm = () => {
    setCode("");
    setDescription("");
    setDiscountType("PERCENTAGE");
    setDiscountValue("");
    setMinPurchase("");
    setStartDate("");
    setEndDate("");
    setCodeError(null);
  };

  const openCreate = useCallback(() => {
    setEditing(null);
    resetForm();
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((promotion: Promotion) => {
    setEditing(promotion);
    setCode(promotion.code);
    setDescription(promotion.description);
    setDiscountType(promotion.discountType);
    setDiscountValue(String(promotion.discountValue));
    setMinPurchase(promotion.minPurchase != null ? String(promotion.minPurchase) : "");
    setStartDate(toDateInputValue(promotion.startDate));
    setEndDate(toDateInputValue(promotion.endDate));
    setCodeError(null);
    setDialogOpen(true);
  }, []);

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    resetForm();
  };

  const validateDiscountValue = (): boolean => {
    const value = Number(discountValue);
    if (Number.isNaN(value) || value < 0) {
      toast.error("Enter a valid discount value");
      return false;
    }
    if (discountType === "PERCENTAGE" && value > 100) {
      toast.error("Percentage discount cannot exceed 100%");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !discountValue) return;
    if (!editing && !code) return;
    if (!validateDiscountValue()) return;

    const datePayload = {
      startDate: startDate ? dateInputToIso(startDate) : null,
      endDate: endDate ? dateInputToIso(endDate, true) : null,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          data: {
            description,
            discountType,
            discountValue: Number(discountValue),
            minPurchase: minPurchase ? Number(minPurchase) : undefined,
            ...datePayload,
          },
        });
        toast.success("Promotion updated");
      } else {
        await createMutation.mutateAsync({
          code: code.toUpperCase(),
          description,
          discountType,
          discountValue: Number(discountValue),
          minPurchase: minPurchase ? Number(minPurchase) : undefined,
          isActive: true,
          ...(datePayload.startDate && { startDate: datePayload.startDate }),
          ...(datePayload.endDate && { endDate: datePayload.endDate }),
        });
        toast.success("Promotion created");
      }
      closeDialog();
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Failed to save promotion");
      if (!editing && isDuplicatePromoCodeError(message)) {
        setCodeError("This code is already in use");
      }
      toast.error(message);
    }
  };

  const handleToggle = useCallback(
    async (id: number, currentStatus: boolean) => {
      setTogglingId(id);
      try {
        await toggleMutation.mutateAsync({ id, isActive: !currentStatus });
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, "Failed to update promotion"));
      } finally {
        setTogglingId(null);
      }
    },
    [toggleMutation],
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Promotion deleted");
      setDeleteTarget(null);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete promotion"));
    }
  };

  const toggleStatusFilter = (next: PromoStatusFilter) => {
    setStatusFilter((current) => (current === next ? "ALL" : next));
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const columns = useMemo(
    () =>
      [
        {
          title: "Status",
          dataIndex: "isActive",
          key: "status",
          width: 160,
          render: (_: boolean, record: Promotion) => {
            const validity = getPromoValidity(record);
            const isExpired = validity === "expired";
            const isToggling = togglingId === record.id;

            return (
              <div className="flex items-center gap-2">
                <StatusBadge tone={promoValidityTone(validity)} className="uppercase text-[10px] font-bold tracking-wider">
                  {promoValidityLabel(validity)}
                </StatusBadge>
                <Switch
                  checked={record.isActive}
                  disabled={isExpired || isToggling}
                  onCheckedChange={() => handleToggle(record.id, record.isActive)}
                  aria-label={`Toggle promotion ${record.code}`}
                />
              </div>
            );
          },
        },
        {
          title: "Code",
          dataIndex: "code",
          key: "code",
          render: (code: string) => (
            <span className={cn("font-mono font-bold", text.primary)}>{code}</span>
          ),
        },
        {
          title: "Description",
          dataIndex: "description",
          key: "desc",
          responsive: ["md"],
          render: (desc: string) => <span className={text.secondary}>{desc}</span>,
        },
        {
          title: "Discount",
          key: "discount",
          render: (_: unknown, record: Promotion) => (
            <span className={cn("font-semibold", metricValueClassName("emerald"))}>
              {record.discountType === "PERCENTAGE"
                ? `${record.discountValue}%`
                : `฿${Number(record.discountValue).toLocaleString()}`}
            </span>
          ),
        },
        {
          title: "Min Purchase",
          dataIndex: "minPurchase",
          key: "minPurchase",
          responsive: ["lg"],
          render: (min: number | null) => (
            <span className={text.muted}>
              {min != null ? `฿${Number(min).toLocaleString()}` : "—"}
            </span>
          ),
        },
        {
          title: "Validity",
          key: "validity",
          responsive: ["lg"],
          render: (_: unknown, record: Promotion) => (
            <span className={cn("text-sm", text.muted)}>{formatValidityRange(record)}</span>
          ),
        },
        {
          title: "Created",
          dataIndex: "createdAt",
          key: "createdAt",
          responsive: ["lg"],
          render: (createdAt?: string) => (
            <span className={cn("text-sm font-medium", text.muted)}>
              {createdAt ? formatDate(createdAt) : "—"}
            </span>
          ),
        },
        {
          title: "",
          key: "actions",
          width: 96,
          render: (_: unknown, record: Promotion) => (
            <div className="flex items-center justify-end gap-1">
              <TableActionButton
                label={`Edit ${record.code}`}
                icon={Pencil}
                iconOnly
                tone="purple"
                onClick={() => openEdit(record)}
              />
              <TableActionButton
                label={`Delete ${record.code}`}
                icon={Trash2}
                iconOnly
                destructive
                onClick={() => setDeleteTarget(record)}
              />
            </div>
          ),
        },
      ] as ColumnsType<Promotion>,
    [handleToggle, togglingId, openEdit],
  );

  const promoForm = (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      {!editing ? (
        <div className="space-y-2">
          <Label htmlFor="promo-code" className={text.secondary}>
            Code
          </Label>
          <Input
            id="promo-code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setCodeError(null);
            }}
            required
            placeholder="e.g. SUMMER20"
            aria-invalid={codeError != null}
            className={formFieldInsetClassName(
              cn(codeError != null && "border-destructive ring-destructive/30"),
            )}
          />
          {codeError && (
            <p className="text-sm text-destructive" role="alert">
              {codeError}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Label className={text.secondary}>Code</Label>
          <p className={cn("font-mono font-bold text-sm px-3 py-2.5 rounded-xl bg-[var(--form-line-bg)] border border-[var(--form-line-border)]", text.primary)}>
            {code}
          </p>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="promo-description" className={text.secondary}>
          Description
        </Label>
        <Input
          id="promo-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="e.g. Summer drink discount"
          className={formFieldInsetClassName()}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="promo-discount-type" className={text.secondary}>
            Discount Type
          </Label>
          <Select
            value={discountType}
            onValueChange={(value) => {
              if (value === "PERCENTAGE" || value === "FIXED_AMOUNT") {
                setDiscountType(value);
              }
            }}
          >
            <SelectTrigger id="promo-discount-type" className={formFieldInsetClassName("w-full")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={formSelectContentClassName()}>
              <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
              <SelectItem value="FIXED_AMOUNT">Fixed Amount (THB)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="promo-discount-value" className={text.secondary}>
            Value
          </Label>
          <Input
            id="promo-discount-value"
            type="number"
            min="0"
            max={discountType === "PERCENTAGE" ? "100" : undefined}
            step={discountType === "PERCENTAGE" ? "1" : "0.01"}
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            required
            placeholder={discountType === "PERCENTAGE" ? "e.g. 20" : "e.g. 50"}
            className={formFieldInsetClassName()}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="promo-min-purchase" className={text.secondary}>
          Minimum Purchase (Optional)
        </Label>
        <Input
          id="promo-min-purchase"
          type="number"
          min="0"
          value={minPurchase}
          onChange={(e) => setMinPurchase(e.target.value)}
          placeholder="e.g. 200"
          className={formFieldInsetClassName()}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="promo-start-date" className={text.secondary}>
            Start Date (Optional)
          </Label>
          <Input
            id="promo-start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={formFieldInsetClassName()}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="promo-end-date" className={text.secondary}>
            End Date (Optional)
          </Label>
          <Input
            id="promo-end-date"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            className={formFieldInsetClassName()}
          />
        </div>
      </div>
      <Button
        type="submit"
        className={hubCtaClassName("crm", "w-full text-md font-bold")}
        disabled={isSaving}
      >
        {isSaving ? "Saving…" : editing ? "Save Changes" : "Create Promotion"}
      </Button>
    </form>
  );

  return (
    <>
      <HubPageHeader
        hideTitle
        icon={TicketPercent}
        accentHub="crm"
        description="Create and manage discount codes and marketing campaigns."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ButtonLink href="/crm/customers" variant="outline" className="font-medium">
              <Users className="w-4 h-4 mr-2" aria-hidden />
              View customers
            </ButtonLink>
            <Button className={hubCtaClassName("crm", "font-bold")} onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" aria-hidden />
              New Promo Code
            </Button>
            <Dialog
              open={dialogOpen}
              onOpenChange={(next) => (next ? setDialogOpen(true) : closeDialog())}
            >
              <DialogContent className={crmDialogContentClassName("sm:max-w-lg")}>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">
                    {editing ? "Edit Promotion" : "Create Promotion Code"}
                  </DialogTitle>
                </DialogHeader>
                {promoForm}
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className={crmSectionPanelClassName()}>
        {!loading && !isError && (
          <div
            className={inventorySummaryStripClassName()}
            aria-live="polite"
            aria-atomic="true"
          >
            <span className={cn("font-semibold tabular-nums", text.primary)}>
              {summary.total} promo {summary.total === 1 ? "code" : "codes"}
            </span>
            {summary.active > 0 && (
              <button
                type="button"
                className={crmSummaryChipClassName(
                  statusFilter === "active",
                  metricValueClassName("emerald"),
                )}
                onClick={() => toggleStatusFilter("active")}
              >
                {summary.active} active
              </button>
            )}
            {summary.inactive > 0 && (
              <button
                type="button"
                className={crmSummaryChipClassName(
                  statusFilter === "inactive",
                  text.muted,
                )}
                onClick={() => toggleStatusFilter("inactive")}
              >
                {summary.inactive} inactive
              </button>
            )}
            {summary.expired > 0 && (
              <button
                type="button"
                className={crmSummaryChipClassName(
                  statusFilter === "expired",
                  metricValueClassName("red"),
                )}
                onClick={() => toggleStatusFilter("expired")}
              >
                {summary.expired} expired
              </button>
            )}
            {summary.scheduled > 0 && (
              <button
                type="button"
                className={crmSummaryChipClassName(
                  statusFilter === "scheduled",
                  metricValueClassName("amber"),
                )}
                onClick={() => toggleStatusFilter("scheduled")}
              >
                {summary.scheduled} scheduled
              </button>
            )}
            {summary.total === 0 && (
              <span className={text.muted}>No promotion codes yet</span>
            )}
            {isFetching && !loading && (
              <span className={cn("inline-flex items-center gap-1.5", text.muted)}>
                <Loader2
                  className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none"
                  aria-hidden
                />
                Updating…
              </span>
            )}
          </div>
        )}

        {isError && (
          <QueryErrorBanner
            message={getErrorMessage(error, "Failed to load promotions")}
            onRetry={() => void refetch()}
            loading={isFetching}
          />
        )}

        <ListToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by code or description…"
          showReset={hasActiveFilters}
          onReset={() => {
            setSearch("");
            setStatusFilter("ALL");
            setDiscountFilter("ALL");
          }}
          filters={
            <>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  if (value != null) setStatusFilter(value as PromoStatusFilter);
                }}
              >
                <SelectTrigger
                  className={listToolbarFieldClassName("min-h-[44px] w-full sm:w-[180px]")}
                  aria-label="Filter by status"
                >
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={discountFilter}
                onValueChange={(value) => {
                  if (value != null) setDiscountFilter(value as PromoDiscountFilter);
                }}
              >
                <SelectTrigger
                  className={listToolbarFieldClassName("min-h-[44px] w-full sm:w-[200px]")}
                  aria-label="Filter by discount type"
                >
                  <SelectValue placeholder="All discount types" />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  <SelectItem value="ALL">All discount types</SelectItem>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Fixed amount</SelectItem>
                </SelectContent>
              </Select>
            </>
          }
        />

        <DataTable
          columns={columns}
          dataSource={filteredPromotions}
          rowKey="id"
          loading={loading && !isError}
          hideBorders
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            pageSizeOptions: ["10", "15", "25", "50"],
          }}
          emptyDescription={
            hasActiveFilters
              ? "No promotions match your filters."
              : "No promotion codes yet. Create one to get started."
          }
        />
      </div>

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete promotion?"
        description={
          deleteTarget
            ? `Remove promo code "${deleteTarget.code}"? This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
