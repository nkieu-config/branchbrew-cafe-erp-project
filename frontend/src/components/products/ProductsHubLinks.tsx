"use client";

import type { ReactNode } from "react";
import {
  BarChart3,
  ClipboardList,
  Leaf,
  SlidersHorizontal,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";

export type ProductsHubTab = "menu" | "ingredients" | "modifiers" | "costing";

type HubLink = {
  id: ProductsHubTab;
  href: string;
  label: string;
  icon: typeof ClipboardList;
};

const HUB_LINKS: HubLink[] = [
  { id: "menu", href: "/products", label: "Menu Items", icon: ClipboardList },
  {
    id: "ingredients",
    href: "/products/ingredients",
    label: "Raw Ingredients",
    icon: Leaf,
  },
  {
    id: "modifiers",
    href: "/products/modifiers",
    label: "Modifiers",
    icon: SlidersHorizontal,
  },
  {
    id: "costing",
    href: "/products/costing",
    label: "Food Cost",
    icon: BarChart3,
  },
];

type ProductsHubLinksProps = {
  current: ProductsHubTab;
  contextual?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function ProductsHubLinks({
  current,
  contextual,
  children,
  className,
}: ProductsHubLinksProps) {
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
      {contextual}
      {children}
    </div>
  );
}
