import { HubShell } from "@/components/layout/HubShell";

export default function ProcurementLayout({ children }: { children: React.ReactNode }) {
  return <HubShell hubId="procurement">{children}</HubShell>;
}
