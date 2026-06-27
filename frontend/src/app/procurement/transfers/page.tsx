"use client";

import { AnimatedPage } from "@/components/animated-page";
import { PageHeader } from "@/components/shared/page-header";
import { StockTransfersPanel } from "@/components/inventory/StockTransfersPanel";
import { ArrowRightLeft } from "lucide-react";

export default function TransfersPage() {
  return (
    <AnimatedPage className="space-y-6 w-full">
      <PageHeader
        title="Stock Transfers"
        icon={ArrowRightLeft}
        description="Request and accept stock transfers between branches."
      />
      <StockTransfersPanel mode="full" />
    </AnimatedPage>
  );
}
