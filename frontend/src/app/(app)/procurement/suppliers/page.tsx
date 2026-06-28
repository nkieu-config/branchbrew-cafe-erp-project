"use client";

import { useMemo, useState } from "react";
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from "@/hooks/domains/useProcurementQueries";
import { HubCard } from "@/components/shared/hub-card";
import { DataTable } from "@/components/shared/data-table";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TableActionButton } from "@/components/shared/table-action-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getErrorMessage } from "@/lib/errors";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Building2, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Supplier } from "@/types/api";
import { hubCtaClassName } from "@/lib/theme";

export default function SuppliersPage() {
  const { data: suppliers = [], isLoading, isError, error, refetch, isFetching } = useSuppliers();
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 300);

  const filteredSuppliers = useMemo(() => {
    if (!debouncedSearch) return suppliers;
    return suppliers.filter((s: Supplier) => {
      const haystack = [s.name, s.contactEmail ?? "", s.phone ?? ""].join(" ").toLowerCase();
      return haystack.includes(debouncedSearch);
    });
  }, [suppliers, debouncedSearch]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");

  const resetForm = () => {
    setName("");
    setContactEmail("");
    setPhone("");
  };

  const openCreate = () => {
    setEditing(null);
    resetForm();
    setOpen(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditing(supplier);
    setName(supplier.name);
    setContactEmail(supplier.contactEmail ?? "");
    setPhone(supplier.phone ?? "");
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setEditing(null);
    resetForm();
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
      if (err instanceof Error) toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Supplier deleted");
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    }
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <HubCard
        title="Suppliers"
        icon={Building2}
        description="Manage vendor contacts for purchase orders."
        actions={
          <Button className={hubCtaClassName("procurement")} onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Supplier
          </Button>
        }
      >
        <ListToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search suppliers…"
          showReset={search.trim().length > 0}
          onReset={() => setSearch("")}
        />
        <DataTable
          loading={isLoading}
          isError={isError}
          errorMessage={getErrorMessage(error, "Failed to load suppliers")}
          onRetry={() => void refetch()}
          retryLoading={isFetching}
          emptyDescription={search.trim() ? "No suppliers match your search." : "No suppliers yet."}
          rowKey="id"
          dataSource={filteredSuppliers}
          columns={[
            { title: "Name", dataIndex: "name", key: "name" },
            { title: "Email", dataIndex: "contactEmail", key: "email", render: (v: string) => v || "-" },
            { title: "Phone", dataIndex: "phone", key: "phone", render: (v: string) => v || "-" },
            {
              title: "Actions",
              key: "actions",
              align: "right" as const,
              render: (_: unknown, row: Supplier) => (
                <div className="flex justify-end gap-1">
                  <TableActionButton
                    icon={Pencil}
                    label="Edit"
                    iconOnly
                    onClick={() => openEdit(row)}
                  />
                  <TableActionButton
                    icon={Trash2}
                    label="Delete"
                    iconOnly
                    destructive
                    onClick={() => setDeleteTarget(row)}
                  />
                </div>
              ),
            },
          ]}
        />
      </HubCard>

      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="supplier-name">Name</Label>
              <Input
                id="supplier-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Supplier name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-email">Email</Label>
              <Input
                id="supplier-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="sales@vendor.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-phone">Phone</Label>
              <Input
                id="supplier-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08x-xxx-xxxx"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              className={hubCtaClassName("procurement")}
              disabled={saving}
              onClick={() => void handleSubmit()}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(isOpen) => !isOpen && setDeleteTarget(null)}
        title="Delete this supplier?"
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
