"use client";

import type { ReactNode } from "react";
import { History, Settings } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";

export type SettingsHubTab = "general" | "audit";

type HubLink = {
  id: SettingsHubTab;
  href: string;
  label: string;
  icon: typeof Settings;
};

const HUB_LINKS: HubLink[] = [
  { id: "general", href: "/settings", label: "General", icon: Settings },
  { id: "audit", href: "/settings/audit", label: "Audit Trail", icon: History },
];

type SettingsHubLinksProps = {
  current: SettingsHubTab;
  children?: ReactNode;
  className?: string;
};

export function SettingsHubLinks({ current, children, className }: SettingsHubLinksProps) {
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
