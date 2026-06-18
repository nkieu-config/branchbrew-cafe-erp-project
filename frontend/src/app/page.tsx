"use client";

import { useEffect, useState } from "react";
import { getOrders, getIngredients } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, DollarSign, AlertTriangle, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const [stats, setStats] = useState({ revenue: 0, ordersCount: 0, lowStockCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOrders(), getIngredients()])
      .then(([orders, ingredients]) => {
        const revenue = orders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);
        const lowStockCount = ingredients.filter((i: any) => i.stock <= i.minStock).length;
        setStats({
          revenue,
          ordersCount: orders.length,
          lowStockCount
        });
      })
      .catch((err) => toast.error("Failed to load dashboard data: " + err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">Dashboard Overview</h1>
        <p className="text-slate-500 text-lg">Welcome back! Here's what's happening at CafeSync today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card border-t-4 border-t-emerald-500 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Revenue</CardTitle>
            <div className="p-2.5 bg-emerald-100/80 rounded-xl shadow-inner border border-emerald-200">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-800 tracking-tight">฿{stats.revenue.toLocaleString()}</div>
            <p className="text-sm font-medium text-slate-400 mt-2">All-time earnings</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-t-4 border-t-blue-500 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Orders</CardTitle>
            <div className="p-2.5 bg-blue-100/80 rounded-xl shadow-inner border border-blue-200">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-800 tracking-tight">+{stats.ordersCount}</div>
            <p className="text-sm font-medium text-slate-400 mt-2">Completed transactions</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-t-4 border-t-rose-500 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Low Stock</CardTitle>
            <div className="p-2.5 bg-rose-100/80 rounded-xl shadow-inner border border-rose-200">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-rose-600 tracking-tight">{stats.lowStockCount} Items</div>
            <p className="text-sm font-medium text-slate-400 mt-2">Require immediate restock</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-t-4 border-t-amber-500 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">System</CardTitle>
            <div className="p-2.5 bg-amber-100/80 rounded-xl shadow-inner border border-amber-200">
              <Activity className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <div className="text-4xl font-black text-slate-800 tracking-tight">Active</div>
            </div>
            <p className="text-sm font-medium text-slate-400 mt-2">All services operational</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 glass-panel rounded-2xl p-10 flex flex-col items-center justify-center min-h-[350px] text-slate-400">
        <div className="w-20 h-20 bg-white shadow-inner border border-slate-100 rounded-full flex items-center justify-center mb-6">
            <Activity className="text-slate-300 w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-600 mb-1">Sales Analytics Setup Required</h3>
        <p className="max-w-md text-center text-slate-500">
          Generate more point-of-sale data to populate the interactive charts. The system requires at least 5 orders this week to generate meaningful trends.
        </p>
      </div>
    </div>
  );
}
