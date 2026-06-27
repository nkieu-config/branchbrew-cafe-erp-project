import { HubShell } from "@/components/layout/HubShell";

export default function HRLayout({ children }: { children: React.ReactNode }) {
  return <HubShell hubId="hr">{children}</HubShell>;
}
