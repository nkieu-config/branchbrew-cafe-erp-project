import { redirect } from "next/navigation";

export default function ProcurementTransfersRedirectPage() {
  redirect("/inventory/transfers");
}
