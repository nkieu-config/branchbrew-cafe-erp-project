"use client";

import { KdsImmersiveNav } from "@/components/kds/KdsImmersiveChrome";
import { kdsShellFrameClassName } from "@/lib/theme/immersive";

export default function KdsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <div className={kdsShellFrameClassName()}>{children}</div>
      <KdsImmersiveNav />
    </div>
  );
}
