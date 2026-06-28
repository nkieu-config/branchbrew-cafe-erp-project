"use client";

import { useRef } from "react";
import {
  StockTransfersPanel,
  type StockTransfersPanelHandle,
} from "@/components/inventory/StockTransfersPanel";
import { HubPageHeader } from "@/components/shared/hub-card";
import { ButtonLink } from "@/components/ui/button-link";
import { useAuth } from "@/context/AuthContext";
import { useBranches } from "@/hooks/domains/useGeneralQueries";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, LayoutGrid, Plus } from "lucide-react";
import { hubCtaClassName, inventorySectionPanelClassName } from "@/lib/theme";
import type { Branch } from "@/types/api";

export default function TransfersPage() {
  const panelRef = useRef<StockTransfersPanelHandle>(null);
  const { activeBranchId } = useAuth();
  const { data: branches = [] } = useBranches();
  const branchName = (branches as Branch[]).find((b) => b.id === activeBranchId)?.name;

  return (
    <>
      <HubPageHeader
        hideTitle
        icon={ArrowRightLeft}
        accentHub="inventory"
        description="Request and accept stock transfers between branches."
        branchScope={{ branchName }}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ButtonLink href="/inventory" variant="outline" className="font-medium">
              <LayoutGrid className="w-4 h-4 mr-2" aria-hidden />
              Stock overview
            </ButtonLink>
            <Button
              className={hubCtaClassName("inventory", "font-bold")}
              onClick={() => panelRef.current?.openCreate()}
            >
              <Plus className="w-4 h-4 mr-2" aria-hidden />
              Request Transfer
            </Button>
          </div>
        }
      />
      <div className={inventorySectionPanelClassName()}>
        <StockTransfersPanel ref={panelRef} variant="page" />
      </div>
    </>
  );
}
