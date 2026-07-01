"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type RouteTransitionProps = {
  children: ReactNode;
  className?: string;
};

/** Subtle cross-fade when navigating between app routes (CSS-only, no framer-motion). */
export function RouteTransition({ children, className }: RouteTransitionProps) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className={cn(
        className,
        "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-200 motion-reduce:animate-none",
      )}
    >
      {children}
    </div>
  );
}
