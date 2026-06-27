import { HubShell } from "@/components/layout/HubShell";

export default function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <HubShell hubId="pos" contentClassName="relative flex-1 min-h-0 w-full">
      {children}
    </HubShell>
  );
}
