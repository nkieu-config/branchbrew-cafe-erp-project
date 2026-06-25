"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isInitialized && !isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [isInitialized, isAuthenticated, pathname, router]);

  if (!isInitialized) {
    return <div className="h-screen w-full flex items-center justify-center text-slate-500">Loading…</div>;
  }

  if (!isAuthenticated && pathname !== '/login') {
    return <div className="h-screen w-full flex items-center justify-center text-slate-500">Redirecting to login…</div>;
  }

  return <>{children}</>;
}
