"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { HubShell } from "@/components/layout/HubShell";
import { AccessDeniedState } from "@/components/shared/access-denied-state";

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard
      allowedRoles={["SUPER_ADMIN", "MANAGER"]}
      fallback={
        <AccessDeniedState
          description="Manager or Super Admin access is required to manage the menu catalog."
          backHref="/"
          backLabel="Back to Dashboard"
        />
      }
    >
      <HubShell hubId="products">{children}</HubShell>
    </RoleGuard>
  );
}
