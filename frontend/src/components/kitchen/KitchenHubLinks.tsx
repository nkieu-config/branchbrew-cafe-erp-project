"use client";

import type { ReactNode } from "react";
import { ChefHat, Leaf, ListTree, PackageOpen } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";

export type KitchenHubTab = "production" | "boms";

type HubLink = {
  id: KitchenHubTab;
  href: string;
  label: string;
  icon: typeof ChefHat;
};

const HUB_LINKS: HubLink[] = [
  { id: "production", href: "/kitchen", label: "Production Orders", icon: ChefHat },
  { id: "boms", href: "/kitchen/boms", label: "Production BOM", icon: ListTree },
];

type KitchenHubLinksProps = {
  current: KitchenHubTab;
  contextual?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function KitchenHubLinks({
  current,
  contextual,
  children,
  className,
}: KitchenHubLinksProps) {
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
      <ButtonLink href="/inventory" variant="outline" className="font-medium">
        <PackageOpen className="w-4 h-4 mr-2" aria-hidden />
        Inventory
      </ButtonLink>
      {contextual}
      {children}
    </div>
  );
}
