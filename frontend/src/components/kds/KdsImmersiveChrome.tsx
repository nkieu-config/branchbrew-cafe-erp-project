"use client";

import { usePathname } from "next/navigation";
import {
  MobileBottomNavLink,
  MobileBottomNavMenuButton,
  MobileBottomNavShell,
} from "@/components/layout/MobileBottomNavPrimitives";
import { useAuth } from "@/context/AuthContext";
import { useMobileNav } from "@/context/MobileNavContext";
import {
  getMobileBottomNavItems,
  isMobileBottomNavActive,
} from "@/lib/navigation";
import type { Role } from "@/types/api";

export function KdsImmersiveHeader() {
  // Keep parity with POS immersive: no duplicate desktop header content.
  return null;
}

export function KdsImmersiveNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { toggle } = useMobileNav();
  const role = (user?.role ?? "STAFF") as Role;
  const items = getMobileBottomNavItems(role);

  return (
    <MobileBottomNavShell ariaLabel="Quick navigation">
      {items.map((item) => {
        const isActive = isMobileBottomNavActive(item, pathname);

        if (item.action === "menu") {
          return (
            <MobileBottomNavMenuButton
              key={item.id}
              onClick={toggle}
              icon={item.icon}
              label={item.label}
              isActive={false}
            />
          );
        }

        return (
          <MobileBottomNavLink
            key={item.id}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={isActive}
          />
        );
      })}
    </MobileBottomNavShell>
  );
}
