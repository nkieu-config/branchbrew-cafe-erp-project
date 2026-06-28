"use client";

import { usePathname } from "next/navigation";
import { HubShell } from "@/components/layout/HubShell";
import { PosImmersiveHeader, PosImmersiveNav } from "@/components/pos/PosImmersiveChrome";

const POS_IMMERSIVE_PATHS = ["/pos/terminal", "/pos/settlement"];

export default function POSLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive = POS_IMMERSIVE_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (immersive) {
    return (
      <div className="relative flex flex-col flex-1 min-h-0 w-full h-full">
        <PosImmersiveHeader />
        <div className="flex-1 min-h-0 min-w-0">{children}</div>
        <PosImmersiveNav />
      </div>
    );
  }

  return (
    <HubShell hubId="pos" contentClassName="relative flex-1 min-h-0 w-full">
      {children}
    </HubShell>
  );
}
