"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { SocketProvider } from "@/context/SocketContext";
import { MobileNavProvider, useMobileNav } from "@/context/MobileNavContext";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { shell, skipLinkClassName } from "@/lib/theme";

function isImmersiveRoute(pathname: string) {
  return pathname.startsWith("/pos/terminal") || pathname === "/kds";
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);
  const { open, setOpen, close } = useMobileNav();
  const immersive = isImmersiveRoute(pathname);

  useEffect(() => {
    close();
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname, close]);

  return (
    <div className={cn("flex h-dvh w-full overflow-hidden", shell.bg)}>
      <a href="#main-content" className={skipLinkClassName()}>
        Skip to main content
      </a>

      <aside className="hidden lg:block shrink-0" aria-label="Application sidebar">
        <Sidebar />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className={cn("w-[min(100vw,16rem)] max-w-[16rem] p-0 gap-0 border-r border-border", shell.sidebarBorder)}
          showCloseButton
        >
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <Sidebar
            onNavigate={close}
            className="h-full w-full border-r-0"
          />
        </SheetContent>
      </Sheet>

      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className="flex-1 min-w-0 h-full relative z-10 flex flex-col overflow-hidden outline-none"
      >
        <Topbar />
        <div
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden",
            immersive ? "p-2 sm:p-4 lg:p-8" : "p-4 md:p-6 lg:p-8",
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <MobileNavProvider>
        <AppShellInner>{children}</AppShellInner>
      </MobileNavProvider>
    </SocketProvider>
  );
}
