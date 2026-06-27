import { HubShell } from "@/components/layout/HubShell";

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return <HubShell hubId="finance">{children}</HubShell>;
}
