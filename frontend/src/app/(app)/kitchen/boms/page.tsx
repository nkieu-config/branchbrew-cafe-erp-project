"use client";

import { useState, useMemo } from "react";
import { useProductionBOMs } from "@/hooks/domains/useAccountingQueries";
import { useIngredients } from "@/hooks/domains/useProductionQueries";
import type { ColumnsType } from "antd/es/table";
import { ListTree, Plus, AlertTriangle } from "lucide-react";
import { HubCard } from "@/components/shared/hub-card";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { BOMModalForm } from "@/components/kitchen/BOMModalForm";
import { CentralKitchenBanner } from "@/components/kitchen/central-kitchen-banner";
import { Button } from "@/components/ui/button";
import { Progress, ProgressIndicator, ProgressTrack, ProgressValue } from "@/components/ui/progress";
import { groupProductionBoms } from "@/lib/bom";
import type { BomGroupRow, BomTableRow, ProductionBOM } from "@/types/api";

export default function BOMPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { data: bomsData = [], isLoading: loadingBoms } = useProductionBOMs();
  const { data: ingredientsData = [], isLoading: loadingIng } = useIngredients();

  const loading = loadingBoms || loadingIng;
  const ingredients = ingredientsData;

  const bomsGrouped = useMemo(
    () => groupProductionBoms(bomsData as ProductionBOM[]),
    [bomsData],
  );

  const columns: ColumnsType<BomTableRow> = [
    {
      title: "Target / Raw Ingredient",
      dataIndex: "targetName",
      key: "name",
      render: (_: unknown, record) => {
        if ("isGroup" in record && record.isGroup) {
          return (
            <span className="font-bold text-slate-800 dark:text-slate-200 text-base">
              {record.targetName}
            </span>
          );
        }
        return <span className="text-slate-600 dark:text-slate-400 pl-4">{record.rawName}</span>;
      },
    },
    {
      title: "Quantity Needed",
      key: "quantity",
      render: (_: unknown, record) => {
        if ("isGroup" in record && record.isGroup) {
          return (
            <span className="text-slate-400 text-xs uppercase tracking-wider">
              Per 1 {record.targetUnit}
            </span>
          );
        }
        return (
          <span className="font-mono font-medium">
            {record.quantityNeeded} {record.rawUnit}
          </span>
        );
      },
    },
    {
      title: "Est. Cost",
      key: "cost",
      render: (_: unknown, record) => {
        if ("isGroup" in record && record.isGroup) {
          const total = record.children.reduce((sum, c) => sum + c.totalCost, 0);
          return (
            <span className="font-black text-rose-600 dark:text-rose-400">
              ฿{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          );
        }
        return (
          <span className="text-slate-500 font-mono">
            ฿{record.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      title: "Food Cost % (Target < 30%)",
      key: "foodcost",
      render: (_: unknown, record) => {
        if ("isGroup" in record && record.isGroup) {
          const totalRawCost = record.children.reduce((sum, c) => sum + c.totalCost, 0);
          const mockSalePrice = totalRawCost > 30 ? 120 : 60;
          const foodCostPercent = (totalRawCost / mockSalePrice) * 100;
          const isWarning = foodCostPercent > 30;
          const percent = parseFloat(foodCostPercent.toFixed(1));

          return (
            <div className="flex items-center gap-4">
              <Progress value={percent} className="w-28 gap-1">
                <ProgressTrack className="h-2">
                  <ProgressIndicator className={isWarning ? "bg-rose-500" : "bg-emerald-500"} />
                </ProgressTrack>
                <ProgressValue
                  className={`text-xs font-black tabular-nums ${isWarning ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}
                />
              </Progress>
              {isWarning && (
                <StatusBadge tone="danger" className="gap-1 font-bold">
                  <AlertTriangle className="w-3 h-3" /> High Cost
                </StatusBadge>
              )}
            </div>
          );
        }
        return null;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <CentralKitchenBanner message="Production BOMs are managed at the central kitchen branch." />

      <HubCard
        title="Production BOM"
        icon={ListTree}
        description="Define raw ingredients and quantities for each finished product produced in the central kitchen."
        actions={
          <Button
            className="bg-orange-500 hover:bg-orange-600 shadow-sm font-bold"
            onClick={() => setIsModalVisible(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create / Update BOM
          </Button>
        }
      >
        {!loading && bomsGrouped.length === 0 ? (
          <div className="py-16 text-center">
            <ListTree className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <p className="font-semibold text-slate-800 dark:text-slate-100">No production BOMs yet</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
              Create a production BOM to define raw ingredients and quantities for each finished
              product.
            </p>
            <Button
              className="mt-6 bg-orange-500 hover:bg-orange-600 font-bold"
              onClick={() => setIsModalVisible(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create first BOM
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            dataSource={bomsGrouped as BomGroupRow[]}
            rowKey="id"
            loading={loading}
            pagination={false}
            defaultExpandAllRows={true}
          />
        )}
      </HubCard>

      <BOMModalForm
        isOpen={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        ingredients={ingredients}
      />
    </div>
  );
}
