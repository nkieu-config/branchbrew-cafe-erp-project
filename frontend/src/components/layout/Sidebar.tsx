"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Package, Coffee, Settings, Truck, Users, TicketPercent, UserSquare2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ClockInOutWidget } from "@/components/hr/ClockInOutWidget";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Point of Sale", href: "/pos", icon: ShoppingCart },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Procurement", href: "/procurement", icon: Truck },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Promotions", href: "/promotions", icon: TicketPercent },
  { name: "Human Resources", href: "/hr", icon: UserSquare2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (pathname === '/login') return null;

  return (
    <div className="w-64 glass-panel border-r-slate-200/50 h-screen flex flex-col z-40 relative">
      <div className="h-16 flex items-center px-6 border-b border-slate-200/30">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center mr-3 shadow-sm">
          <Coffee className="w-5 h-5 text-white" />
        </div>
        <span className="font-extrabold text-xl tracking-tight bg-gradient-to-br from-slate-800 to-slate-500 bg-clip-text text-transparent">CafeSync</span>
      </div>
      
      {user && (
        <div className="px-6 py-4 border-b border-slate-200/30 bg-white/20">
          <p className="text-sm font-bold text-slate-800">{user.name}</p>
          <p className="text-xs font-medium text-emerald-600 mt-0.5">{user.branch || 'Headquarters'}</p>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isReallyActive = item.href === '/' ? pathname === '/' : isActive;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-sm ${
                isReallyActive
                  ? "bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100"
                  : "text-slate-600 hover:bg-white/50 hover:text-slate-900 interactive-item border border-transparent"
              }`}
            >
              <item.icon className={`w-5 h-5 mr-3 transition-colors ${isReallyActive ? 'text-emerald-500' : 'text-slate-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      {user && <ClockInOutWidget />}

      <div className="p-4 border-t border-slate-200/30">
        <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl interactive-item border-red-100 bg-white/50" onClick={logout}>
          Logout
        </Button>
      </div>
    </div>
  );
}
