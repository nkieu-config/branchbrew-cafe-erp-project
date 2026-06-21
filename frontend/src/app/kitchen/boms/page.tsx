"use client"

import { useState, useMemo } from "react"
import { useProductionBOMs } from '@/hooks/domains/useAccountingQueries';
import { useIngredients } from '@/hooks/domains/useProductionQueries';
import { Button, Progress, Tag } from "antd"
import { ListTree, Plus, AlertTriangle } from "lucide-react"
import { AnimatedPage } from "@/components/animated-page"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { BOMModalForm } from "@/components/kitchen/BOMModalForm"

export default function BOMPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { data: bomsData = [], isLoading: loadingBoms } = useProductionBOMs();
  const { data: ingredientsData = [], isLoading: loadingIng } = useIngredients();

  const loading = loadingBoms || loadingIng;
  const ingredients = ingredientsData;

  const bomsGrouped: any[] = useMemo(() => {
    // Group BOMs by targetIngredientId
    const grouped = bomsData.reduce((acc: Record<string, any>, bom: any) => {
      const targetId = bom.targetIngredientId;
      if (!acc[targetId]) {
        acc[targetId] = {
          id: `TARGET_${targetId}`,
          targetName: bom.targetIngredient.name,
          targetUnit: bom.targetIngredient.unit,
          isGroup: true,
          children: []
        };
      }
      acc[targetId].children.push({
        id: bom.id,
        rawIngredientId: bom.rawIngredientId,
        rawName: bom.rawIngredient.name,
        rawUnit: bom.rawIngredient.unit,
        quantityNeeded: bom.quantityNeeded,
        costPerUnit: bom.rawIngredient.costPerUnit,
        totalCost: bom.quantityNeeded * bom.rawIngredient.costPerUnit
      });
      return acc;
    }, {});

    return Object.values(grouped);
  }, [bomsData]);

  const columns: any = [
    {
      title: 'Target / Raw Ingredient',
      dataIndex: 'targetName',
      key: 'name',
      render: (_: unknown, record: any) => {
        if (record.isGroup) {
          return <span className="font-bold text-slate-800 dark:text-slate-200 text-base">{record.targetName}</span>
        }
        return <span className="text-slate-600 dark:text-slate-400 pl-4">{record.rawName}</span>
      }
    },
    {
      title: 'Quantity Needed',
      key: 'quantity',
      render: (_: unknown, record: any) => {
        if (record.isGroup) return <span className="text-slate-400 text-xs uppercase tracking-wider">Per 1 {record.targetUnit}</span>;
        return <span className="font-mono font-medium">{record.quantityNeeded} {record.rawUnit}</span>
      }
    },
    {
      title: 'Est. Cost',
      key: 'cost',
      render: (_: unknown, record: any) => {
        if (record.isGroup) {
          const total = record.children.reduce((sum: number, c: any) => sum + c.totalCost, 0);
          return <span className="font-black text-rose-600 dark:text-rose-400">฿{total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
        }
        return <span className="text-slate-500 font-mono">฿{record.totalCost.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
      }
    },
    {
      title: 'Food Cost % (Target < 30%)',
      key: 'foodcost',
      render: (_: unknown, record: any) => {
        if (record.isGroup) {
          const totalRawCost = record.children.reduce((sum: number, c: any) => sum + c.totalCost, 0);
          // Mock an estimated sale price for demonstration purposes
          const mockSalePrice = totalRawCost > 30 ? 120 : 60; 
          const foodCostPercent = (totalRawCost / mockSalePrice) * 100;
          const isWarning = foodCostPercent > 30;

          return (
            <div className="flex items-center gap-4">
              <div className="w-24">
                <Progress 
                  percent={parseFloat(foodCostPercent.toFixed(1))} 
                  size="small"
                  strokeColor={isWarning ? '#ef4444' : '#10b981'}
                  format={(percent) => (
                    <span className={`font-black text-xs ${isWarning ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {percent}%
                    </span>
                  )}
                />
              </div>
              {isWarning && (
                <Tag color="error" className="flex items-center gap-1 font-bold rounded-lg border-rose-200">
                  <AlertTriangle className="w-3 h-3" /> High Cost
                </Tag>
              )}
            </div>
          )
        }
        return null;
      }
    }
  ]

  return (
    <AnimatedPage className="space-y-6 w-full">
      <PageHeader 
        title="Bill of Materials (Recipes)"
        icon={ListTree}
        description="Manage recipes and monitor food cost efficiency."
        actions={
          <Button 
            type="primary" 
            className="bg-orange-500 hover:bg-orange-600 shadow-sm font-bold flex items-center gap-2"
            onClick={() => setIsModalVisible(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Create / Update BOM
          </Button>
        }
      />

      <DataTable 
        columns={columns} 
        dataSource={bomsGrouped} 
        rowKey="id"
        loading={loading}
        pagination={false}
        defaultExpandAllRows={true}
      />

      <BOMModalForm 
        isOpen={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
        ingredients={ingredients} 
      />
    </AnimatedPage>
  )
}
