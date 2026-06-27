import { HubShell } from "@/components/layout/HubShell";

export default function AssetsLayout({ children }: { children: React.ReactNode }) {
  return <HubShell hubId="assets">{children}</HubShell>;
}
