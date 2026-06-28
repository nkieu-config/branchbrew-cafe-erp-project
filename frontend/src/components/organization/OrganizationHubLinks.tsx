"use client";

import type { ReactNode } from "react";
import { Building2, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";

export type OrganizationHubTab = "branches" | "users";

type HubLink = {
  id: OrganizationHubTab;
  href: string;
  label: string;
  icon: typeof Building2;
};

const HUB_LINKS: HubLink[] = [
  { id: "branches", href: "/organization/branches", label: "Branches", icon: Building2 },
  { id: "users", href: "/organization/users", label: "Users & Roles", icon: ShieldCheck },
];

type OrganizationHubLinksProps = {
  current: OrganizationHubTab;
  children?: ReactNode;
  className?: string;
};

export function OrganizationHubLinks({
  current,
  children,
  className,
}: OrganizationHubLinksProps) {
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
      {children}
    </div>
  );
}
