"use client";

import { useState } from "react";
import Link from "next/link";
import { useProducts } from "@/hooks/domains/useProductQueries";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Coffee } from "lucide-react";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { DataTable } from "@/components/shared/data-table";
import { HubCard } from "@/components/shared/hub-card";
import { TableActionButton } from "@/components/shared/table-action-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatBaht } from "@/lib/money";
import { calcProductFoodCost, foodCostStatus } from "@/lib/food-cost";
import {
  foodCostStatusClassName,
  hubCtaClassName,
  inlineLinkClassName,
  text,
} from "@/lib/theme";
import type { Product } from "@/types/api";

export default function ProductsPage() {
  const { data: products, isLoading } = useProducts();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  return (
    <>
      <HubCard
        title="Menu Items"
        icon={Coffee}
        description="Manage products that appear on the POS terminal."
        actions={
          <Button onClick={handleAddNew} className={hubCtaClassName("products")}>
            <Plus className="w-4 h-4 mr-2" /> Add Menu Item
          </Button>
        }
      >
        <DataTable
          loading={isLoading}
          emptyDescription="No menu items yet. Add raw ingredients first, then create menu items for the POS."
          columns={[
            {
              title: "ID",
              dataIndex: "id",
              key: "id",
              render: (id) => <span className={text.muted}>#{id}</span>,
            },
            {
              title: "Menu Name",
              dataIndex: "name",
              key: "name",
              render: (name) => <span className={`font-medium ${text.primary}`}>{name}</span>,
            },
            {
              title: "Category",
              dataIndex: "category",
              key: "category",
              render: (category) => <StatusBadge tone="category">{category}</StatusBadge>,
            },
            {
              title: "Price (฿)",
              dataIndex: "price",
              key: "price",
              render: (price) => <span className={`font-bold tabular-nums ${text.secondary}`}>{formatBaht(price)}</span>,
            },
            {
              title: "Food Cost %",
              key: "foodCost",
              render: (_: unknown, record: Product) => {
                const { cost, foodCostPercent } = calcProductFoodCost(record);
                const status = foodCostStatus(foodCostPercent);
                return (
                  <div>
                    <span className={foodCostStatusClassName(status)}>{foodCostPercent.toFixed(1)}%</span>
                    <div className={`text-xs ${text.muted}`}>COGS {formatBaht(cost)}</div>
                  </div>
                );
              },
            },
            {
              title: "Status",
              key: "isActive",
              render: (_: unknown, record: Product) =>
                record.isActive !== false ? (
                  <StatusBadge tone="success">Active</StatusBadge>
                ) : (
                  <StatusBadge tone="neutral">Inactive</StatusBadge>
                ),
            },
            {
              title: "Menu Recipe",
              key: "recipe",
              render: (_: unknown, record: Product) =>
                record.recipeItems && record.recipeItems.length > 0 ? (
                  <StatusBadge tone="info">{record.recipeItems.length} ingredients</StatusBadge>
                ) : (
                  <StatusBadge tone="neutral">No Menu Recipe</StatusBadge>
                ),
            },
            {
              title: "Actions",
              key: "actions",
              align: "right",
              render: (_: unknown, record: Product) => (
                <TableActionButton icon={Edit} label="Edit" onClick={() => handleEdit(record)} />
              ),
            },
          ]}
          dataSource={products || []}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          hideBorders
        />
        {!isLoading && (products?.length ?? 0) === 0 && (
          <p className={`text-sm mt-4 ${text.muted}`}>
            Setting up a new menu? Start with{" "}
            <Link href="/products/ingredients" className={inlineLinkClassName()}>
              Raw Ingredients
            </Link>
            , then return here to add menu items.
          </p>
        )}
      </HubCard>

      <ProductFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={selectedProduct ?? undefined} />
    </>
  );
}
