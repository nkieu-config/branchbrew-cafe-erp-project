"use client";

import { useCallback, useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
  usePurchaseOrders,
} from "@/hooks/domains/useProcurementQueries";
import { HubPageHeader } from "@/components/shared/hub-card";
import { DataTable } from "@/components/shared/data-table";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TableActionButton } from "@/components/shared/table-action-button";
import { RoleGuard } from "@/components/RoleGuard";
import { AccessDeniedState } from "@/components/shared/access-denied-state";
import { ProcurementHubLinks } from "@/components/procurement/ProcurementHubLinks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/intl-date";
import { buildProcurementOrdersUrl } from "@/lib/procurement-hub-url";
import {
  countPurchaseOrdersBySupplier,
  matchesSupplierContactFilter,
  summarizeSuppliers,
  type SupplierContactFilter,
} from "@/lib/supplier-filters";
import { Building2, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Supplier } from "@/types/api";
import {
  formFieldInsetClassName,
  formSelectContentClassName,
  hubCtaClassName,
  inlineLinkClassName,
  inventorySummaryStripClassName,
  listToolbarFieldClassName,
  metricValueClassName,
  procurementDialogContentClassName,
  procurementSectionPanelClassName,
  procurementSummaryChipClassName,
  tableCellMutedClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function SuppliersPage() {
  return (
    <RoleGuard
      allowedRoles={["SUPER_ADMIN", "MANAGER"]}
      fallback={
        <AccessDeniedState
          description="Manager or Super Admin access is required to manage suppliers."
          backHref="/procurement/orders"
          backLabel="Back to Purchase Orders"
        />
      }
    >
      <SuppliersPageContent />
    </RoleGuard>
  );
}

function SuppliersPageContent() {
  const { data: suppliers = [], isLoading, isError, error, refetch, isFetching } = useSuppliers();
  const { data: purchaseOrders = [] } = usePurchaseOrders();
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 300);
  const [contactFilter, setContactFilter] = useState<SupplierContactFilter>("ALL");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");

  const poCountBySupplier = useMemo(
    () => countPurchaseOrdersBySupplier(purchaseOrders),
    [purchaseOrders],
  );

  const summary = useMemo(() => summarizeSuppliers(suppliers), [suppliers]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier: Supplier) => {
      const haystack = [supplier.name, supplier.contactEmail ?? "", supplier.phone ?? ""]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !debouncedSearch || haystack.includes(debouncedSearch);
      const matchesContact = matchesSupplierContactFilter(supplier, contactFilter);
      return matchesSearch && matchesContact;
    });
  }, [suppliers, debouncedSearch, contactFilter]);

  const hasActiveFilters = search.trim().length > 0 || contactFilter !== "ALL";

  const resetForm = useCallback(() => {
    setName("");
    setContactEmail("");
    setPhone("");
  }, []);

  const openCreate = useCallback(() => {
    setEditing(null);
    resetForm();
    setOpen(true);
  }, [resetForm]);

  const openEdit = useCallback((supplier: Supplier) => {
    setEditing(supplier);
    setName(supplier.name);
    setContactEmail(supplier.contactEmail ?? "");
    setPhone(supplier.phone ?? "");
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setEditing(null);
    resetForm();
  }, [resetForm]);

  const toggleContactFilter = (next: SupplierContactFilter) => {
    setContactFilter((current) => (current === next ? "ALL" : next));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    const payload = {
      name: name.trim(),
      contactEmail: contactEmail.trim() || undefined,
      phone: phone.trim() || undefined,
    };
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, ...payload });
        toast.success("Supplier updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Supplier created");
      }
      closeDialog();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to save supplier"));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Supplier deleted");
      setDeleteTarget(null);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete supplier"));
    }
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  const columns = useMemo(
    () =>
      [
        {
          title: "Name",
          dataIndex: "name",
          key: "name",
          render: (value: string) => (
            <span className={cn("font-bold", text.primary)}>{value}</span>
          ),
        },
        {
          title: "Email",
          dataIndex: "contactEmail",
          key: "email",
          responsive: ["md"],
          render: (value?: string | null) =>
            value ? (
              <span className={text.secondary}>{value}</span>
            ) : (
              <span className={text.muted}>—</span>
            ),
        },
        {
          title: "Phone",
          dataIndex: "phone",
          key: "phone",
          responsive: ["md"],
          render: (value?: string | null) =>
            value ? (
              <span className={text.secondary}>{value}</span>
            ) : (
              <span className={text.muted}>—</span>
            ),
        },
        {
          title: "POs",
          key: "poCount",
          responsive: ["lg"],
          render: (_: unknown, supplier: Supplier) => {
            const count = poCountBySupplier.get(supplier.id) ?? 0;
            return count > 0 ? (
              <Link
                href={buildProcurementOrdersUrl({ supplier: supplier.id })}
                className={inlineLinkClassName("tabular-nums")}
              >
                {count} order{count === 1 ? "" : "s"}
              </Link>
            ) : (
              <span className={tableCellMutedClassName()}>—</span>
            );
          },
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
          align: "right" as const,
          render: (_: unknown, supplier: Supplier) => (
            <div className="flex justify-end gap-1">
              <TableActionButton
                icon={Pencil}
                label={`Edit ${supplier.name}`}
                iconOnly
                tone="purple"
                onClick={() => openEdit(supplier)}
              />
              <TableActionButton
                icon={Trash2}
                label={`Delete ${supplier.name}`}
                iconOnly
                destructive
                onClick={() => setDeleteTarget(supplier)}
              />
            </div>
          ),
        },
      ] as ColumnsType<Supplier>,
    [openEdit, poCountBySupplier],
  );

  return (
    <>
      <HubPageHeader
        hideTitle
        icon={Building2}
        accentHub="procurement"
        description="Manage vendor contacts for purchase orders."
        actions={
          <ProcurementHubLinks current="suppliers">
            <Button
              onClick={openCreate}
              className={hubCtaClassName("procurement", "font-bold")}
            >
              <Plus className="w-4 h-4 mr-2" aria-hidden />
              Add Supplier
            </Button>
          </ProcurementHubLinks>
        }
      />

      <div className={procurementSectionPanelClassName()}>
        {!isLoading && !isError && (
          <div
            className={inventorySummaryStripClassName()}
            aria-live="polite"
            aria-atomic="true"
          >
            <span className={cn("font-semibold tabular-nums", text.primary)}>
              {summary.total} supplier{summary.total === 1 ? "" : "s"}
            </span>
            {summary.missingEmail > 0 && (
              <button
                type="button"
                className={procurementSummaryChipClassName(
                  contactFilter === "missing-email",
                  metricValueClassName("amber"),
                )}
                onClick={() => toggleContactFilter("missing-email")}
              >
                {summary.missingEmail} missing email
              </button>
            )}
            {summary.missingPhone > 0 && (
              <button
                type="button"
                className={procurementSummaryChipClassName(
                  contactFilter === "missing-phone",
                  metricValueClassName("amber"),
                )}
                onClick={() => toggleContactFilter("missing-phone")}
              >
                {summary.missingPhone} missing phone
              </button>
            )}
            {summary.total === 0 && (
              <span className={text.muted}>
                No suppliers yet — used in{" "}
                <Link href="/procurement/orders" className={inlineLinkClassName()}>
                  purchase orders
                </Link>
              </span>
            )}
            {isFetching && !isLoading && (
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

        <ListToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search suppliers…"
          showReset={hasActiveFilters}
          onReset={() => {
            setSearch("");
            setContactFilter("ALL");
          }}
          filters={
            <Select
              value={contactFilter}
              onValueChange={(value) => {
                if (value != null) setContactFilter(value as SupplierContactFilter);
              }}
            >
              <SelectTrigger
                className={listToolbarFieldClassName("min-h-[44px] w-full sm:w-[200px]")}
                aria-label="Filter by contact data"
              >
                <SelectValue placeholder="All contact levels" />
              </SelectTrigger>
              <SelectContent className={formSelectContentClassName()}>
                <SelectItem value="ALL">All contact levels</SelectItem>
                <SelectItem value="missing-email">Missing email</SelectItem>
                <SelectItem value="missing-phone">Missing phone</SelectItem>
              </SelectContent>
            </Select>
          }
        />

        <DataTable
          loading={isLoading}
          isError={isError}
          errorMessage={getErrorMessage(error, "Failed to load suppliers")}
          onRetry={() => void refetch()}
          retryLoading={isFetching}
          emptyDescription={
            hasActiveFilters
              ? "No suppliers match your filters."
              : "No suppliers yet. Add vendors to create purchase orders."
          }
          rowKey="id"
          dataSource={filteredSuppliers}
          columns={columns}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            pageSizeOptions: ["10", "15", "25", "50"],
          }}
          hideBorders
        />
      </div>

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeDialog();
          else setOpen(true);
        }}
      >
        <DialogContent className={procurementDialogContentClassName()}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editing ? "Edit Supplier" : "Add Supplier"}
            </DialogTitle>
            <DialogDescription>
              Supplier details appear on purchase orders and ingredient primary supplier links.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="supplier-name" className={text.secondary}>
                Name
              </Label>
              <Input
                id="supplier-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Supplier name"
                className={formFieldInsetClassName()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-email" className={text.secondary}>
                Email
              </Label>
              <Input
                id="supplier-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="sales@vendor.com"
                className={formFieldInsetClassName()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-phone" className={text.secondary}>
                Phone
              </Label>
              <Input
                id="supplier-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08x-xxx-xxxx"
                className={formFieldInsetClassName()}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={closeDialog} className="min-h-[44px]">
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saving}
              className={cn("min-h-[44px]", hubCtaClassName("procurement", "font-bold"))}
              onClick={() => void handleSubmit()}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />}
              {editing ? "Save changes" : "Create supplier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(isOpen) => !isOpen && setDeleteTarget(null)}
        title="Delete this supplier?"
        description={
          deleteTarget
            ? `Remove "${deleteTarget.name}" from the vendor list? Existing purchase orders will keep their historical supplier reference.`
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
