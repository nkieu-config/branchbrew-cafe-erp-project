import { RoleGuard } from "@/components/auth/RoleGuard";
import { AccessDeniedState } from "@/components/shared/access-denied-state";
import SuppliersPageClient from "./suppliers-page-client";

export default function SuppliersPage() {
  return (
    <RoleGuard
      allowedRoles={["SUPER_ADMIN", "MANAGER"]}
      fallback={
        <AccessDeniedState
          description="Manager or Super Admin access is required to manage suppliers."
          backHref="/procurement/orders"
          backLabel="Back to Purchase Orders"
        />
      }
    >
      <SuppliersPageClient />
    </RoleGuard>
  );
}
