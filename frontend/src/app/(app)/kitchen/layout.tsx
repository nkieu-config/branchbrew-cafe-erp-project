import { HubShell } from "@/components/layout/HubShell";

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
  return <HubShell hubId="kitchen">{children}</HubShell>;
}
