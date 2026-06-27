"use client";

import { useBranchInventory } from "@/hooks/domains/useInventoryQueries";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { HubCard } from "@/components/shared/hub-card";
import { BranchEmptyState } from "@/components/shared/branch-empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  stockLevel,
  stockLevelIconClassName,
  stockLevelStatusTone,
  stockLevelValueClassName,
  text,
} from "@/lib/theme";

import type { BranchInventory } from "@/types/api";

type InventoryRow = BranchInventory & { ingredient?: { name: string; unit: string } };

export default function InventoryBalancePage() {
  const { activeBranchId } = useAuth();
  const { data: inventoryData, isLoading } = useBranchInventory(activeBranchId || undefined);
  const inventory = inventoryData || [];

  if (!activeBranchId) {
    return <BranchEmptyState description="Select a branch in the top bar to view stock balances." />;
  }

  return (
    <HubCard
      title="Branch Stock Balance"
      icon={Package}
      description="Current aggregate stock for all raw ingredients."
    >
      <DataTable 
        loading={isLoading}
        emptyDescription="No inventory records for this branch yet."
        hideBorders
        columns={[
          {
            title: "Ingredient Name",
            key: "name",
            render: (_: unknown, record: InventoryRow) => (
              <span className={`font-medium ${text.primary}`}>{record.ingredient?.name}</span>
            ),
          },
          {
            title: "Stock Balance",
            key: "stock",
            render: (_: unknown, record: InventoryRow) => {
              const level = stockLevel(record.stock, record.minStock);
              return (
                <span className="inline-flex items-center gap-1.5">
                  {level !== "ok" ? (
                    <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${stockLevelIconClassName(level)}`} aria-hidden />
                  ) : null}
                  <span className={stockLevelValueClassName(level)}>
                    {record.stock.toFixed(2)}
                  </span>
                  {level === "out" ? (
                    <span className={`text-xs font-semibold ${stockLevelValueClassName("out")}`}>Out</span>
                  ) : level === "low" ? (
                    <span className={`text-xs font-semibold ${stockLevelValueClassName("low")}`}>Low</span>
                  ) : null}
                </span>
              );
            },
          },
          {
            title: "Unit",
            key: "unit",
            render: (_: unknown, record: InventoryRow) => (
              <span className={text.muted}>{record.ingredient?.unit}</span>
            ),
          },
          {
            title: "Status",
            key: "status",
            render: (_: unknown, record: InventoryRow) => {
              const level = stockLevel(record.stock, record.minStock);
              const tone = stockLevelStatusTone(level);
              const label = level === "out" ? "Out of Stock" : level === "low" ? "Low Stock" : "In Stock";
              return (
                <StatusBadge tone={tone} className="flex items-center gap-1 w-fit">
                  {level !== "ok" ? <AlertTriangle className="w-3 h-3" /> : null}
                  {label}
                </StatusBadge>
              );
            },
          },
        ]}
        dataSource={inventory}
        rowKey="id"
        pagination={{ pageSize: 15 }}
      />
    </HubCard>
  );
}
