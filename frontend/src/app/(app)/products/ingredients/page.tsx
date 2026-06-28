"use client";

import { useMemo, useState } from "react";
import { useIngredients } from "@/hooks/domains/useProductQueries";
import { Button } from "@/components/ui/button";
import { Plus, Edit, FlaskConical } from "lucide-react";
import { IngredientFormModal } from "@/components/products/IngredientFormModal";
import { DataTable } from "@/components/shared/data-table";
import { HubCard } from "@/components/shared/hub-card";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { TableActionButton } from "@/components/shared/table-action-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getErrorMessage } from "@/lib/errors";
import { hubCtaClassName, tableCellMutedClassName, text } from "@/lib/theme";
import type { Ingredient } from "@/types/api";
import { formatBaht } from "@/lib/money";

export default function IngredientsPage() {
  const { data: ingredients, isLoading, isError, error, refetch, isFetching } = useIngredients();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 300);

  const filteredIngredients = useMemo(() => {
    return (ingredients ?? []).filter((item: Ingredient) => {
      if (!debouncedSearch) return true;
      const haystack = [item.name, item.unit, String(item.id)].join(" ").toLowerCase();
      return haystack.includes(debouncedSearch);
    });
  }, [ingredients, debouncedSearch]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  const handleEdit = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedIngredient(null);
    setIsModalOpen(true);
  };

  return (
    <>
      <HubCard
        title="Raw Ingredients Catalog"
        icon={FlaskConical}
        description="Manage all raw materials used in your recipes."
        actions={
          <Button onClick={handleAddNew} className={hubCtaClassName("inventory")}>
            <Plus className="w-4 h-4 mr-2" /> Add Ingredient
          </Button>
        }
      >
        <ListToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search ingredients…"
          showReset={search.trim().length > 0}
          onReset={() => setSearch("")}
        />
        <DataTable
          loading={isLoading}
          isError={isError}
          errorMessage={getErrorMessage(error, "Failed to load ingredients")}
          onRetry={() => void refetch()}
          retryLoading={isFetching}
          emptyDescription={
            search.trim() ? "No ingredients match your search." : "No ingredients yet. Add raw materials to build menu recipes and production BOMs."
          }
          columns={[
            {
              title: "ID",
              dataIndex: "id",
              key: "id",
              render: (id) => <span className={tableCellMutedClassName()}>#{id}</span>,
            },
            {
              title: "Ingredient Name",
              dataIndex: "name",
              key: "name",
              render: (name) => <span className={`font-medium ${text.primary}`}>{name}</span>,
            },
            {
              title: "Unit",
              dataIndex: "unit",
              key: "unit",
              render: (unit) => <span className={text.muted}>{unit}</span>,
            },
            {
              title: "Cost / Unit (฿)",
              dataIndex: "costPerUnit",
              key: "costPerUnit",
              render: (costPerUnit) => (
                <span className={`tabular-nums ${text.muted}`}>{formatBaht(costPerUnit)}</span>
              ),
            },
            {
              title: "Status",
              key: "isActive",
              render: (_: unknown, record: Ingredient) =>
                record.isActive !== false ? (
                  <StatusBadge tone="success">Active</StatusBadge>
                ) : (
                  <StatusBadge tone="neutral">Inactive</StatusBadge>
                ),
            },
            {
              title: "Actions",
              key: "actions",
              align: "right",
              render: (_: unknown, record: Ingredient) => (
                <TableActionButton
                  icon={Edit}
                  label="Edit"
                  iconOnly
                  onClick={() => handleEdit(record)}
                />
              ),
            },
          ]}
          dataSource={filteredIngredients}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          hideBorders
        />
      </HubCard>

      <IngredientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ingredient={selectedIngredient ?? undefined}
      />
    </>
  );
}
