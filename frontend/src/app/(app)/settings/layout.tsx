"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { HubShell } from "@/components/layout/HubShell";
import { AccessDeniedState } from "@/components/shared/access-denied-state";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard
      allowedRoles={["SUPER_ADMIN"]}
      fallback={
        <AccessDeniedState description="Super Admin access is required for system administration." />
      }
    >
      <HubShell hubId="settings">{children}</HubShell>
    </RoleGuard>
  );
}
