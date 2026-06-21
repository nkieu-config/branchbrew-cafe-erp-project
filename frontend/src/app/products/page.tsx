"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/domains/useProductQueries";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Coffee } from "lucide-react";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { Badge } from "@/components/ui/badge";

export default function ProductsPage() {
  const { data: products, isLoading } = useProducts();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };



  if (isLoading) return <div className="p-10">Loading...</div>;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-600" />
            Menu Items
          </h2>
          <p className="text-sm text-slate-500">Manage products that appear on the POS terminal.</p>
        </div>
        <Button onClick={handleAddNew} className="bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Menu Item
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">ID</th>
              <th className="px-4 py-3">Menu Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price (฿)</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Recipe Setup</th>
              <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {(products || []).map((item: any) => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                <td className="px-4 py-3 text-slate-400">#{item.id}</td>
                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{item.name}</td>
                <td className="px-4 py-3 text-slate-500">
                  <Badge variant="outline" className="bg-white dark:bg-slate-900">{item.category}</Badge>
                </td>
                <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 tabular-nums">฿{item.price?.toFixed(2)}</td>
                <td className="px-4 py-3">
                  {item.isActive !== false ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400">Active</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400">Inactive</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  {item.recipeItems && item.recipeItems.length > 0 ? (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      {item.recipeItems.length} ingredients
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      No Recipe
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} className="text-blue-500">
                    <Edit className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {(!products || products.length === 0) && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-400">No menu items found. Create one to show in POS.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ProductFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct} 
      />
    </div>
  );
}
