"use client";

import type { ReactNode } from "react";
import { BookOpen, Landmark, Wallet } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";

export type FinanceHubTab = "overview" | "ledger" | "accounts";

type HubLink = {
  id: FinanceHubTab;
  href: string;
  label: string;
  icon: typeof Wallet;
};

const HUB_LINKS: HubLink[] = [
  { id: "overview", href: "/finance/overview", label: "Overview", icon: Wallet },
  { id: "ledger", href: "/finance/ledger", label: "General Ledger", icon: BookOpen },
  { id: "accounts", href: "/finance/accounts", label: "Chart of Accounts", icon: Landmark },
];

type FinanceHubLinksProps = {
  current: FinanceHubTab;
  children?: ReactNode;
  className?: string;
};

export function FinanceHubLinks({ current, children, className }: FinanceHubLinksProps) {
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
