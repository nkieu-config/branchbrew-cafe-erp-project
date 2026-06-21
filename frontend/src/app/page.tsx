"use client";

import { useOrders, useIngredients } from "@/hooks/useQueries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, DollarSign, AlertTriangle, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card"
import { Order, Ingredient } from "@prisma/client";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { AnimatedPage } from "@/components/animated-page";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { data: orders = [], isLoading: loadingOrders, error: ordersError } = useOrders();
  const { data: ingredients = [], isLoading: loadingIngredients, error: ingredientsError } = useIngredients();
  
  if (ordersError) toast.error("Failed to load orders: " + (ordersError as Error).message);
  if (ingredientsError) toast.error("Failed to load ingredients: " + (ingredientsError as Error).message);

  const loading = loadingOrders || loadingIngredients;
  const revenue = orders.reduce((sum: number, o: Order) => sum + o.totalAmount, 0);
  const lowStockCount = ingredients.filter((i: any) => i.stock <= i.minStock).length;
  const stats = { revenue, ordersCount: orders.length, lowStockCount };

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
    </div>
  );

  return (
    <AnimatedPage className="w-full max-w-[1600px] mx-auto space-y-6">
      <PageHeader
        title="Dashboard Overview"
        description="Welcome back! Here's what's happening at QafaCafe today."
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card className="glass-card border-t-4 border-t-emerald-500 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-0">
            <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Revenue</CardTitle>
            <div className="p-2.5 bg-emerald-100/80 dark:bg-emerald-900/30 rounded-xl shadow-inner border border-emerald-200 dark:border-emerald-800">
              <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">฿{stats.revenue.toLocaleString()}</div>
            <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-2">All-time earnings</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-t-4 border-t-blue-500 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-0">
            <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Orders</CardTitle>
            <div className="p-2.5 bg-blue-100/80 dark:bg-blue-900/30 rounded-xl shadow-inner border border-blue-200 dark:border-blue-800">
              <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">+{stats.ordersCount}</div>
            <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-2">Completed transactions</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-t-4 border-t-rose-500 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-colors duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-0">
            <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Low Stock</CardTitle>
            <div className="p-2.5 bg-rose-100/80 dark:bg-rose-900/30 rounded-xl shadow-inner border border-rose-200 dark:border-rose-800">
              <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-rose-600 dark:text-rose-400 tracking-tight">{stats.lowStockCount} Items</div>
            <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-2">Require immediate restock</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-t-4 border-t-amber-500 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-0">
            <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">System</CardTitle>
            <div className="p-2.5 bg-amber-100/80 dark:bg-amber-900/30 rounded-xl shadow-inner border border-amber-200 dark:border-amber-800">
              <Activity className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <div className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Active</div>
            </div>
            <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-2">All services operational</p>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-8 glass-panel rounded-2xl p-6 flex flex-col justify-center min-h-[350px]"
      >
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Revenue Overview</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">7-day performance trend</p>
        </div>
        <SalesChart />
      </motion.div>
    </AnimatedPage>
  );
}
