import { RoleGuard } from "@/components/auth/RoleGuard";
import { AccessDeniedState } from "@/components/shared/access-denied-state";
import PayrollPageClient from "./payroll-page-client";

export default function PayrollPage() {
  return (
    <RoleGuard
      allowedRoles={["SUPER_ADMIN", "MANAGER"]}
      fallback={
        <AccessDeniedState
          description="Manager or Super Admin access is required to view payroll."
          backHref="/hr/attendance"
          backLabel="Back to Attendance"
        />
      }
    >
      <PayrollPageClient />
    </RoleGuard>
  );
}
