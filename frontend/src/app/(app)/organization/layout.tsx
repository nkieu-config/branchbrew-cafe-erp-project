"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { HubShell } from "@/components/layout/HubShell";
import { AccessDeniedState } from "@/components/shared/access-denied-state";

export default function OrganizationLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard
      allowedRoles={["SUPER_ADMIN"]}
      fallback={
        <AccessDeniedState description="Super Admin access is required to manage organization settings." />
      }
    >
      <HubShell hubId="organization">{children}</HubShell>
    </RoleGuard>
  );
}
