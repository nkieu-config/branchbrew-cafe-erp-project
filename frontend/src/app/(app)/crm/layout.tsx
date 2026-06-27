import { HubShell } from "@/components/layout/HubShell";

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return <HubShell hubId="crm">{children}</HubShell>;
}
