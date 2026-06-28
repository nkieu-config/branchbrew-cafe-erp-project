"use client";

import type { ReactNode } from "react";
import { ArrowDownToLine, FileCheck, Leaf, Store } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";

export type ProcurementHubTab = "suppliers" | "orders";

type HubLink = {
  id: ProcurementHubTab;
  href: string;
  label: string;
  icon: typeof Store;
};

const HUB_LINKS: HubLink[] = [
  {
    id: "suppliers",
    href: "/procurement/suppliers",
    label: "Suppliers",
    icon: Store,
  },
  {
    id: "orders",
    href: "/procurement/orders",
    label: "Purchase Orders",
    icon: FileCheck,
  },
];

type ProcurementHubLinksProps = {
  current: ProcurementHubTab;
  contextual?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function ProcurementHubLinks({
  current,
  contextual,
  children,
  className,
}: ProcurementHubLinksProps) {
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
      <ButtonLink href="/products/ingredients" variant="outline" className="font-medium">
        <Leaf className="w-4 h-4 mr-2" aria-hidden />
        Raw Ingredients
      </ButtonLink>
      <ButtonLink href="/inventory/stock-in" variant="outline" className="font-medium">
        <ArrowDownToLine className="w-4 h-4 mr-2" aria-hidden />
        Receive Stock
      </ButtonLink>
      {contextual}
      {children}
    </div>
  );
}
