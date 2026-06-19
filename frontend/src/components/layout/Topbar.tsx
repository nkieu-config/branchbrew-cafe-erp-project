"use client"

import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { Bell } from "lucide-react"

export function Topbar() {
  const pathname = usePathname()
  
  // Format breadcrumb based on pathname
  const pathParts = pathname.split('/').filter(Boolean)
  const currentPage = pathParts.length > 0 
    ? pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1)
    : 'Dashboard'

  if (pathname === '/login') return null;

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-transparent mb-4 z-20 relative">
      <div className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
        <span className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer">QafaCafe</span>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        <span className="text-slate-800 dark:text-slate-200 font-bold tracking-tight">{currentPage}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <button aria-label="Notifications" className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <ThemeToggle />
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 border-2 border-white dark:border-slate-800 shadow-sm"></div>
      </div>
    </header>
  )
}
