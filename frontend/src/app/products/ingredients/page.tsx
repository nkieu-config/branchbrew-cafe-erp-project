"use client";

import { useState } from "react";
import { useIngredients } from "@/hooks/domains/useProductQueries";
import { Button } from "@/components/ui/button";
import { Plus, Edit } from "lucide-react";
import { IngredientFormModal } from "@/components/products/IngredientFormModal";
import { Badge } from "@/components/ui/badge";

export default function IngredientsPage() {
  const { data: ingredients, isLoading } = useIngredients();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<any>(null);

  const handleEdit = (ingredient: any) => {
    setSelectedIngredient(ingredient);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedIngredient(null);
    setIsModalOpen(true);
  };



  if (isLoading) return <div className="p-10">Loading...</div>;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Raw Ingredients Catalog</h2>
          <p className="text-sm text-slate-500">Manage all raw materials used in your recipes.</p>
        </div>
        <Button onClick={handleAddNew} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" /> Add Ingredient
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">ID</th>
              <th className="px-4 py-3">Ingredient Name</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">Cost / Unit (฿)</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {(ingredients || []).map((item: any) => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                <td className="px-4 py-3 text-slate-400">#{item.id}</td>
                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{item.name}</td>
                <td className="px-4 py-3 text-slate-500">{item.unit}</td>
                <td className="px-4 py-3 text-slate-500 tabular-nums">฿{item.costPerUnit?.toFixed(2)}</td>
                <td className="px-4 py-3">
                  {item.isActive !== false ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400">Active</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400">Inactive</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} className="text-blue-500">
                    <Edit className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {(!ingredients || ingredients.length === 0) && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400">No ingredients found. Create one to start building recipes.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <IngredientFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        ingredient={selectedIngredient} 
      />
    </div>
  );
}
