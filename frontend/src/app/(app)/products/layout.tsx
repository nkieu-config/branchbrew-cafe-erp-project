import { HubShell } from "@/components/layout/HubShell";

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <HubShell hubId="products">{children}</HubShell>;
}
