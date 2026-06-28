"use client";

import type { ReactNode } from "react";
import {
  Briefcase,
  CalendarDays,
  Clock,
  UserSquare2,
  Users,
  Wallet,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";

export type HrHubTab = "employees" | "shifts" | "attendance" | "leave" | "payroll";

type HubLink = {
  id: HrHubTab;
  href: string;
  label: string;
  icon: typeof Users;
  managerOnly?: boolean;
};

const HUB_LINKS: HubLink[] = [
  { id: "employees", href: "/hr/employees", label: "Directory", icon: Users },
  { id: "shifts", href: "/hr/shifts", label: "Shifts", icon: CalendarDays, managerOnly: true },
  { id: "attendance", href: "/hr/attendance", label: "Attendance", icon: Clock },
  { id: "leave", href: "/hr/leave", label: "Leave", icon: Briefcase },
  { id: "payroll", href: "/hr/payroll", label: "Payroll", icon: Wallet, managerOnly: true },
];

type HrHubLinksProps = {
  current: HrHubTab;
  showOrgUsers?: boolean;
  contextual?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function HrHubLinks({
  current,
  showOrgUsers = false,
  contextual,
  children,
  className,
}: HrHubLinksProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {HUB_LINKS.map(({ id, href, label, icon: Icon }) => {
        const isCurrent = id === current;
        return (
          <ButtonLink
            key={id}
            href={href}
            variant={isCurrent ? "secondary" : "outline"}
            className={cn("font-medium", isCurrent && "pointer-events-none")}
            aria-current={isCurrent ? "page" : undefined}
          >
            <Icon className="w-4 h-4 mr-2" aria-hidden />
            {label}
          </ButtonLink>
        );
      })}
      {showOrgUsers && (
        <ButtonLink href="/organization/users" variant="outline" className="font-medium">
          <UserSquare2 className="w-4 h-4 mr-2" aria-hidden />
          Users &amp; Roles
        </ButtonLink>
      )}
      {contextual}
      {children}
    </div>
  );
}
