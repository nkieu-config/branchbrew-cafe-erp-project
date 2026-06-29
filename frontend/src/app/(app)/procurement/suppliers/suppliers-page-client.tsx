"use client";

import { useCallback, useMemo, useState } from "react";
import { Building2, Plus } from "lucide-react";
import { toast } from "sonner";
import { HubPageHeader } from "@/components/shared/hub-card";
import { HubListPage } from "@/components/shared/hub-list-page";
import { ListFilterSelect } from "@/components/shared/list-filters";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SupplierFormDialog } from "@/components/procurement/SupplierFormDialog";
import { SuppliersTable } from "@/components/procurement/SuppliersTable";
import { Button } from "@/components/ui/button";
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
  usePurchaseOrders,
} from "@/hooks/domains/useProcurementQueries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getErrorMessage } from "@/lib/errors";
import {
  countPurchaseOrdersBySupplier,
  filterSuppliers,
  hasSupplierFilters,
  summarizeSuppliers,
  type SupplierContactFilter,
} from "@/lib/supplier-filters";
import { hubCtaClassName } from "@/lib/theme/hub-primitives";
import { procurementSectionPanelClassName } from "@/lib/theme/hub-procurement";
import type { Supplier } from "@/types/api";

export default function SuppliersPageClient() {
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

  const filteredSuppliers = useMemo(
    () => filterSuppliers(suppliers, { search: debouncedSearch, contactFilter }),
    [suppliers, debouncedSearch, contactFilter],
  );

  const hasActiveFilters = hasSupplierFilters({ search, contactFilter });

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

  return (
    <>
      <HubPageHeader
        hideTitle
        icon={Building2}
        accentHub="procurement"
        actions={
          <Button onClick={openCreate} className={hubCtaClassName("procurement")}>
            <Plus className="w-4 h-4 mr-2" aria-hidden />
            Add Supplier
          </Button>
        }
      />

      <HubListPage className={procurementSectionPanelClassName()}>
        <HubListPage.Error
          message={isError ? getErrorMessage(error, "Failed to load suppliers") : undefined}
          onRetry={() => void refetch()}
          loading={isFetching}
        />

        <HubListPage.Toolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search suppliers…"
          showReset={hasActiveFilters}
          onReset={() => {
            setSearch("");
            setContactFilter("ALL");
          }}
          filters={
            <ListFilterSelect
              value={contactFilter}
              onValueChange={(value) => setContactFilter(value as SupplierContactFilter)}
              ariaLabel="Filter by contact data"
              widthClassName="w-full sm:w-[200px]"
              options={[
                { value: "ALL", label: "All contact levels" },
                { value: "missing-email", label: "Missing email" },
                { value: "missing-phone", label: "Missing phone" },
              ]}
            />
          }
        />

        <HubListPage.Count
          isLoading={isLoading}
          isError={isError}
          isFetching={isFetching}
          hasActiveFilters={hasActiveFilters}
          filteredCount={filteredSuppliers.length}
          totalCount={summary.total}
          itemLabel="supplier"
        />

        <SuppliersTable
          suppliers={filteredSuppliers}
          loading={isLoading}
          hasActiveFilters={hasActiveFilters}
          poCountBySupplier={poCountBySupplier}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
        />
      </HubListPage>

      <SupplierFormDialog
        open={open}
        editing={editing}
        name={name}
        contactEmail={contactEmail}
        phone={phone}
        saving={saving}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeDialog();
          else setOpen(true);
        }}
        onNameChange={setName}
        onContactEmailChange={setContactEmail}
        onPhoneChange={setPhone}
        onSubmit={() => void handleSubmit()}
      />

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
