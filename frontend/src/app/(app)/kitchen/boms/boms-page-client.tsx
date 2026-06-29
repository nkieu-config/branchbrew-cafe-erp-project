"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useProductionBOMs } from "@/hooks/domains/useAccountingQueries";
import { useIngredients } from "@/hooks/domains/useProductQueries";
import { ListTree, Loader2, Plus } from "lucide-react";
import { HubPageHeader } from "@/components/shared/hub-card";
import { HubListPage } from "@/components/shared/hub-list-page";
import { BOMFormModal } from "@/components/kitchen/BOMFormModal";
import { BomListEmptyState } from "@/components/kitchen/BomListEmptyState";
import { CentralKitchenBanner } from "@/components/kitchen/CentralKitchenBanner";
import { ProductionBomTable } from "@/components/kitchen/ProductionBomTable";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getErrorMessage } from "@/lib/errors";
import { groupProductionBoms } from "@/lib/bom";
import { buildProductsIngredientsUrl } from "@/lib/products-hub-url";
import { matchesBomSearch, summarizeProductionBoms } from "@/lib/bom-filters";
import type { BomGroupRow, ProductionBOM } from "@/types/api";
import { hubCtaClassName, inlineLinkClassName, summaryChipClassName } from "@/lib/theme/hub-primitives";
import { kitchenSectionPanelClassName } from "@/lib/theme/hub-kitchen";
import { metricValueClassName } from "@/lib/theme/metric";
import { text } from "@/lib/theme/surface";
import { typeUiLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";

export default function BomsPageClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 300);

  const {
    data: bomsData = [],
    isLoading: loadingBoms,
    isError: bomsError,
    error: bomsErr,
    refetch: refetchBoms,
    isFetching: bomsFetching,
  } = useProductionBOMs();
  const { data: ingredients = [], isLoading: loadingIng } = useIngredients();

  const loading = loadingBoms || loadingIng;

  const bomsGrouped = useMemo(
    () => groupProductionBoms(bomsData as ProductionBOM[]),
    [bomsData],
  );

  const filteredGroups = useMemo(
    () => bomsGrouped.filter((group) => matchesBomSearch(group, debouncedSearch)),
    [bomsGrouped, debouncedSearch],
  );

  const summary = useMemo(() => summarizeProductionBoms(bomsGrouped), [bomsGrouped]);

  return (
    <div className="space-y-6">
      <HubPageHeader
        hideTitle
        icon={ListTree}
        accentHub="kitchen"
        actions={
          <Button className={hubCtaClassName("kitchen")} onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" aria-hidden />
            Create BOM
          </Button>
        }
      />

      <CentralKitchenBanner message="Production BOMs are managed at the central kitchen branch." />

      <HubListPage className={kitchenSectionPanelClassName()}>
        <HubListPage.Error
          message={bomsError ? getErrorMessage(bomsErr, "Failed to load production BOMs") : undefined}
          onRetry={() => void refetchBoms()}
          loading={bomsFetching}
        />

        <HubListPage.Toolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search target or raw ingredient…"
          showReset={search.trim().length > 0}
          onReset={() => setSearch("")}
        />

        <HubListPage.Count isLoading={loading} isError={bomsError} isFetching={bomsFetching}>
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className={typeUiLabelClassName(cn("tabular-nums", text.primary))}>
              {summary.targets} BOM target{summary.targets === 1 ? "" : "s"}
            </span>
            {summary.rawLines > 0 && (
              <span className={summaryChipClassName("kitchen", false, text.secondary)}>
                {summary.rawLines} raw line{summary.rawLines === 1 ? "" : "s"}
              </span>
            )}
            {summary.missingCostLines > 0 && (
              <Link
                href={buildProductsIngredientsUrl({ cost: "missing-cost" })}
                className={summaryChipClassName("kitchen", false, metricValueClassName("amber"))}
              >
                {summary.missingCostLines} missing cost
              </Link>
            )}
            {summary.targets === 0 && (
              <span className={text.muted}>
                No BOMs yet —{" "}
                <Link href="/products/ingredients" className={inlineLinkClassName()}>
                  add ingredients
                </Link>{" "}
                then define a BOM
              </span>
            )}
            {bomsFetching && !loading && (
              <span className={cn("inline-flex items-center gap-1.5", text.muted)}>
                <Loader2
                  className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none"
                  aria-hidden
                />
                Updating…
              </span>
            )}
          </span>
        </HubListPage.Count>

        {!loading && !bomsError && filteredGroups.length === 0 ? (
          <BomListEmptyState
            hasSearch={search.trim().length > 0}
            onCreate={() => setIsModalOpen(true)}
          />
        ) : (
          <ProductionBomTable groups={filteredGroups as BomGroupRow[]} loading={loading} />
        )}
      </HubListPage>

      <BOMFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ingredients={ingredients}
      />
    </div>
  );
}
