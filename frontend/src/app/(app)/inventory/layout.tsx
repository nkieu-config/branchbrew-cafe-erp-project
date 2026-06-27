import { HubShell } from "@/components/layout/HubShell";

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return <HubShell hubId="inventory">{children}</HubShell>;
}
