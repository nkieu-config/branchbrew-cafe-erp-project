"use client";

import { useRef } from "react";
import {
  StockTransfersPanel,
  type StockTransfersPanelHandle,
} from "@/components/inventory/StockTransfersPanel";
import { HubCard } from "@/components/shared/hub-card";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Plus } from "lucide-react";
import { hubInfoActionClassName } from "@/lib/theme";

export default function TransfersPage() {
  const panelRef = useRef<StockTransfersPanelHandle>(null);

  return (
    <HubCard
      title="Stock Transfers"
      icon={ArrowRightLeft}
      description="Request and accept stock transfers between branches."
      actions={
        <Button
          className={hubInfoActionClassName("font-bold")}
          onClick={() => panelRef.current?.openCreate()}
        >
          <Plus className="w-4 h-4 mr-2" aria-hidden />
          Request Transfer
        </Button>
      }
    >
      <StockTransfersPanel ref={panelRef} variant="page" />
    </HubCard>
  );
}
