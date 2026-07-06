"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { AntdProvider } from "@/providers/AntdProvider";
import { AccessDeniedState } from "@/components/shared/access-denied-state";

export default function PosOrdersLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard
      allowedRoles={["SUPER_ADMIN", "MANAGER"]}
      fallback={
        <AccessDeniedState description="Manager or Super Admin access is required to view order history." />
      }
    >
      <AntdProvider>{children}</AntdProvider>
    </RoleGuard>
  );
}
