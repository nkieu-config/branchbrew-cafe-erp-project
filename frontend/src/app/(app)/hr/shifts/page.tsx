import { RoleGuard } from "@/components/auth/RoleGuard";
import { AccessDeniedState } from "@/components/shared/access-denied-state";
import ShiftsPageClient from "./shifts-page-client";

export default function ShiftsPage() {
  return (
    <RoleGuard
      allowedRoles={["SUPER_ADMIN", "MANAGER"]}
      fallback={
        <AccessDeniedState
          description="Manager or Super Admin access is required to manage shift schedules."
          backHref="/hr/attendance"
          backLabel="Back to Attendance"
        />
      }
    >
      <ShiftsPageClient />
    </RoleGuard>
  );
}
