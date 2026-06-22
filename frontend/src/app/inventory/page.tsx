"use client";

import { useBranchInventory } from "@/hooks/domains/useInventoryQueries";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle } from "lucide-react";

export default function InventoryBalancePage() {
  const { activeBranchId } = useAuth();
  const { data: inventoryData, isLoading } = useBranchInventory(activeBranchId || undefined);
  const inventory = inventoryData || [];

  if (isLoading) return <div className="p-10">Loading inventory...</div>;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            Branch Stock Balance
          </h2>
          <p className="text-sm text-slate-500">Current aggregate stock for all raw ingredients.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Ingredient Name</th>
              <th className="px-4 py-3">Stock Balance</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {inventory.map((item: any) => {
              const isLowStock = item.stock <= item.minStock;
              const isOut = item.stock <= 0;

              return (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{item.ingredient?.name}</td>
                  <td className={`px-4 py-3 font-bold tabular-nums ${isOut ? 'text-red-500' : isLowStock ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {item.stock.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{item.ingredient?.unit}</td>
                  <td className="px-4 py-3">
                    {isOut ? (
                      <Badge variant="destructive" className="flex items-center gap-1 w-fit bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">
                        <AlertTriangle className="w-3 h-3" /> Out of Stock
                      </Badge>
                    ) : isLowStock ? (
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400">
                        <AlertTriangle className="w-3 h-3" /> Low Stock
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                        Healthy
                      </Badge>
                    )}
                  </td>
                </tr>
              );
            })}
            {inventory.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-10 text-slate-400">No inventory data. Please record Stock In (GRN) to initialize stock.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
