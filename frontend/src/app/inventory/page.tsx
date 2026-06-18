"use client";

import { useEffect, useState } from "react";
import { getBranch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PackageOpen } from "lucide-react";
import { toast } from "sonner";

export default function InventoryPage() {
  const { activeBranchId } = useAuth();
  const [inventories, setInventories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeBranchId) {
      fetchInventory();
    } else {
      setInventories([]);
      setLoading(false);
    }
  }, [activeBranchId]);

  const fetchInventory = () => {
    setLoading(true);
    getBranch(activeBranchId!)
      .then((branch) => setInventories(branch.inventories || []))
      .catch((err) => toast.error("Failed to load inventory: " + err.message))
      .finally(() => setLoading(false));
  };

  if (loading) return <div className="p-10 text-center">Loading Inventory...</div>;

  if (!activeBranchId) {
    return (
      <div className="p-10 text-center text-slate-500">
        Please select a branch to view its inventory. (Feature coming soon for Super Admins)
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2 mb-2">
            <PackageOpen className="text-amber-600" /> Inventory Management
          </h1>
          <p className="text-slate-500">Track and manage raw materials for your active branch.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Ingredient Name</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Min Stock Level</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventories.map((inv) => {
              const isLowStock = inv.stock <= inv.minStock;
              return (
                <TableRow key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-semibold text-slate-700">{inv.ingredient.name}</TableCell>
                  <TableCell>
                    <span className="font-medium">{inv.stock}</span> <span className="text-slate-400">{inv.ingredient.unit}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{inv.minStock}</span> <span className="text-slate-400">{inv.ingredient.unit}</span>
                  </TableCell>
                  <TableCell>
                    {isLowStock ? (
                      <Badge variant="destructive" className="bg-rose-500">Low Stock</Badge>
                    ) : (
                      <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">In Stock</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {inventories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-slate-500">
                  No inventory data found for this branch.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
