"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { AccessDeniedState } from "@/components/shared/access-denied-state";

export default function PromotionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard
      allowedRoles={["SUPER_ADMIN", "MANAGER"]}
      fallback={
        <AccessDeniedState
          description="Manager or Super Admin access is required to manage marketing campaigns."
          backHref="/crm/customers"
          backLabel="Back to Customers"
        />
      }
    >
      {children}
    </RoleGuard>
  );
}
