"use client";

import { HubShell } from "@/components/layout/HubShell";
import { RoleGuard } from "@/components/RoleGuard";
import { AccessDeniedState } from "@/components/shared/access-denied-state";

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard
      allowedRoles={["SUPER_ADMIN", "MANAGER"]}
      fallback={
        <AccessDeniedState
          description="Manager or Super Admin access is required to manage production."
          backHref="/"
          backLabel="Back to dashboard"
        />
      }
    >
      <HubShell hubId="kitchen">{children}</HubShell>
    </RoleGuard>
  );
}
